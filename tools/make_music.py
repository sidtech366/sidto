"""Sidto — original devotional background music, synthesised from scratch.
No samples or recordings are used, so the tracks are free of third-party rights.

Tracks (24 s each, MP3):
  mangal-dhun.mp3  festive & bright: swarmandal intro, tanpura, bansuri-style melody, temple bells
  shanti.mp3       calm night/Shiva mood: low tanpura, soft pad, slow bansuri, distant bells
  utsav.mp3        upbeat celebration: dholak keherwa rhythm, shehnai-style melody, manjira

Usage: python3 make_music.py <output-folder>
"""
import os, subprocess, sys, tempfile
import numpy as np
from scipy.io import wavfile
from scipy.signal import fftconvolve, butter, lfilter

SR = 44100
DUR = 24.0
N = int(SR * DUR)
SA = 277.18            # tonic (C#), a common bansuri/harmonium pitch
rng = np.random.default_rng(7)

# swara ratios (just intonation) relative to Sa
R = {"S": 1, "r": 16/15, "R": 9/8, "g": 6/5, "G": 5/4, "m": 4/3, "M": 45/32, "P": 3/2,
     "d": 8/5, "D": 5/3, "n": 9/5, "N": 15/8}

def note(sw, octave=0):
    return SA * R[sw] * (2 ** octave)

def env_adsr(n, a, d, s, r_):
    a, d, r_ = int(a*SR), int(d*SR), int(r_*SR)
    e = np.ones(n) * s
    a = min(a, n); e[:a] = np.linspace(0, 1, a, endpoint=False)
    d = min(d, n - a); e[a:a+d] = np.linspace(1, s, d, endpoint=False)
    if r_ > 0 and n > r_: e[-r_:] *= np.linspace(1, 0, r_)
    return e

def place(buf, sig, t):
    i = int(t * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]

def lowpass(x, fc):
    b, a = butter(2, fc / (SR / 2), "low"); return lfilter(b, a, x)

def highpass(x, fc):
    b, a = butter(2, fc / (SR / 2), "high"); return lfilter(b, a, x)

def bandpass(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band"); return lfilter(b, a, x)

# ------------------------------------------------------------- instruments
def tanpura_pluck(f, dur=4.5, amp=.22):
    n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros(n)
    for h in range(1, 16):
        # jawari: upper harmonics swell then fade, giving the buzzing shimmer
        swell = 1 + 1.6 * np.sin(np.pi * np.clip(t / (0.6 + h * .12), 0, 1)) * (h > 3)
        dec = np.exp(-t * (0.55 + h * .09))
        out += np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6.28)) * dec * swell / h ** 1.1
    out *= env_adsr(n, .006, .05, 1, .3)
    return amp * out / np.max(np.abs(out))

def tanpura(buf, start, end, cycle=4.4, low=True, amp=.22):
    pattern = [(note("P", -2), 0), (note("S", -1), 1.1), (note("S", -1), 2.2), (note("S", -2), 3.3)] if low else \
              [(note("P", -1), 0), (note("S"), 1.1), (note("S"), 2.2), (note("S", -1), 3.3)]
    t0 = start
    while t0 < end:
        for f, dt in pattern:
            if t0 + dt < end: place(buf, tanpura_pluck(f, amp=amp), t0 + dt)
        t0 += cycle

def bell(f=920, dur=4.0, amp=.18):
    n = int(dur * SR); t = np.arange(n) / SR
    partials = [(1, 1, 1.1), (2.76, .5, 1.8), (5.40, .3, 2.6), (8.93, .18, 3.4), (1.004, .6, 1.2)]
    out = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in partials)
    click = rng.normal(0, 1, n) * np.exp(-t * 90) * .3
    out = out + highpass(click, 2000)
    return amp * out / np.max(np.abs(out))

def bansuri(buf, phrase, start, amp=.2, octave=1, vib=5.2, breath=.05, bright=.18):
    """phrase: list of (swara, beats, octave_shift); one beat = 0.5 s"""
    beat = .5
    total = sum(b for _, b, *_ in phrase) * beat + .6
    n = int(total * SR); t = np.arange(n) / SR
    f = np.zeros(n); a = np.zeros(n)
    pos = 0.0
    for item in phrase:
        sw, beats = item[0], item[1]; o = item[2] if len(item) > 2 else 0
        i0, i1 = int(pos * SR), int((pos + beats * beat) * SR)
        if sw == "-":
            a[i0:i1] = 0; f[i0:i1] = f[i0 - 1] if i0 > 0 else note("S", octave)
        else:
            f[i0:i1] = note(sw, octave + o); a[i0:i1] = 1
        pos += beats * beat
    f[int(pos * SR):] = f[int(pos * SR) - 1]
    # portamento and smooth amplitude
    k = int(.05 * SR); f = np.convolve(f, np.ones(k) / k, mode="same")
    k2 = int(.08 * SR); a = np.convolve(a, np.ones(k2) / k2, mode="same")
    vib_depth = np.clip(t / 1.0, 0, 1) * .006
    f = f * (1 + vib_depth * np.sin(2 * np.pi * vib * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + bright * np.sin(2 * ph) + .06 * np.sin(3 * ph)
    air = bandpass(rng.normal(0, 1, n), 1500, 6000) * breath
    sig = (tone + air) * a
    place(buf, amp * sig / (np.max(np.abs(sig)) + 1e-9), start)

def shehnai(buf, phrase, start, amp=.16):
    beat = .25
    total = sum(b for _, b, *_ in phrase) * beat + .4
    n = int(total * SR); t = np.arange(n) / SR
    f = np.zeros(n); a = np.zeros(n); pos = 0.0
    for item in phrase:
        sw, beats = item[0], item[1]; o = item[2] if len(item) > 2 else 0
        i0, i1 = int(pos * SR), int((pos + beats * beat) * SR)
        if sw == "-": a[i0:i1] = 0; f[i0:i1] = f[i0 - 1] if i0 else note("S", 1)
        else: f[i0:i1] = note(sw, 1 + o); a[i0:i1] = 1
        pos += beats * beat
    f[int(pos * SR):] = f[int(pos * SR) - 1]
    k = int(.03 * SR); f = np.convolve(f, np.ones(k) / k, mode="same")
    k2 = int(.03 * SR); a = np.convolve(a, np.ones(k2) / k2, mode="same")
    f = f * (1 + .008 * np.sin(2 * np.pi * 6 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = sum(np.sin(h * ph) / h ** .7 for h in range(1, 12))      # reedy, nasal
    tone = bandpass(tone, 500, 5000)
    sig = tone * a
    place(buf, amp * sig / (np.max(np.abs(sig)) + 1e-9), start)

def swarmandal(buf, start, amp=.12):
    notes = [note(s, o) for o, s in [(0, "S"), (0, "R"), (0, "G"), (0, "P"), (0, "D"), (1, "S"), (1, "R"), (1, "G"), (1, "P"), (1, "D"), (2, "S")]]
    for k, f in enumerate(notes):
        n = int(3 * SR); t = np.arange(n) / SR
        s = sum(np.sin(2 * np.pi * f * h * t) * np.exp(-t * (1.4 + h * .6)) / h for h in range(1, 6))
        place(buf, amp * s / np.max(np.abs(s)), start + k * .07)

def dholak_dha(amp=.5):
    n = int(.45 * SR); t = np.arange(n) / SR
    f = 70 + 60 * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    slap = highpass(rng.normal(0, 1, n), 1200) * np.exp(-t * 60) * .25
    ring = np.sin(2 * np.pi * 330 * t) * np.exp(-t * 14) * .3
    return amp * (body + slap + ring)

def dholak_na(amp=.32):
    n = int(.3 * SR); t = np.arange(n) / SR
    ring = np.sin(2 * np.pi * 410 * t) * np.exp(-t * 16) + .4 * np.sin(2 * np.pi * 820 * t) * np.exp(-t * 22)
    tap = bandpass(rng.normal(0, 1, n), 1500, 7000) * np.exp(-t * 70) * .5
    return amp * (ring + tap)

def dholak_ge(amp=.4):
    n = int(.35 * SR); t = np.arange(n) / SR
    f = 90 + 40 * np.exp(-t * 10)
    return amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def manjira(amp=.08):
    n = int(.6 * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) for f in (3150, 4120, 5230, 6600)) * np.exp(-t * 7)
    s += highpass(rng.normal(0, 1, n), 6000) * np.exp(-t * 30) * .6
    return amp * s / np.max(np.abs(s))

def pad(buf, chord, start, dur, amp=.06):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f in chord:
        for det in (-.003, 0, .003):
            s += np.sin(2 * np.pi * f * (1 + det) * t + rng.uniform(0, 6.28))
    s = lowpass(s, 1500) * env_adsr(n, 2.0, .1, 1, 2.5)
    place(buf, amp * s / np.max(np.abs(s)), start)

# ------------------------------------------------------------- mixing helpers
def reverb(x, seconds=2.2, wet=.28):
    n = int(seconds * SR); t = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-t * 3.2)
    ir = lowpass(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    y = fftconvolve(x, ir)[: len(x)]
    return (1 - wet) * x + wet * y

def master(x, name, out_dir):
    x = reverb(x)
    fade_in, fade_out = int(.25 * SR), int(2.0 * SR)
    x[:fade_in] *= np.linspace(0, 1, fade_in)
    x[-fade_out:] *= np.linspace(1, 0, fade_out) ** 1.5
    x = np.tanh(1.4 * x / (np.max(np.abs(x)) + 1e-9)) / np.tanh(1.4)
    x *= 0.89                                 # ~ -1 dBFS peak
    stereo = np.stack([x, np.roll(x, int(.011 * SR)) * .97 + x * .03], axis=1)   # gentle width
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, name + ".wav")
        wavfile.write(wav, SR, (stereo * 32767).astype(np.int16))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-c:a", "libmp3lame", "-b:a", "128k",
                        "-metadata", "title=" + name, "-metadata", "artist=Sidto (original)", os.path.join(out_dir, name + ".mp3")], check=True)

# ------------------------------------------------------------- tracks
def track_mangal():
    b = np.zeros(N + SR * 5)
    swarmandal(b, 0.0)
    tanpura(b, 0.2, DUR, amp=.2)
    for t in (0.0, 4.4, 8.8, 13.2, 17.6):
        place(b, bell(920, amp=.12), t + .05)
    place(b, bell(1380, amp=.07), 11.0)
    # Raag Bhupali-flavoured phrase (S R G P D)
    p1 = [("G", 2), ("R", 1), ("S", 1), ("R", 2), ("G", 2), ("P", 3), ("-", 1), ("D", 1), ("P", 1), ("G", 2), ("R", 1), ("G", 1), ("P", 4)]
    p2 = [("D", 2), ("S", 2, 1), ("D", 1), ("P", 1), ("G", 2), ("P", 2), ("G", 1), ("R", 1), ("S", 4), ("-", 1), ("R", 1), ("G", 1), ("S", 5)]
    bansuri(b, p1, 1.4, amp=.24)
    bansuri(b, p2, 12.4, amp=.24)
    return b[:N]

def track_shanti():
    b = np.zeros(N + SR * 5)
    tanpura(b, 0.0, DUR, cycle=5.2, amp=.24)
    pad(b, [note("S", -1), note("P", -1), note("S")], 0.0, DUR, amp=.07)
    for t, f in ((0.3, 760), (6.5, 760), (13.0, 1140), (19.0, 760)):
        place(b, bell(f, dur=5, amp=.08), t)
    p = [("S", 3), ("-", 1), ("n", 2, -1), ("S", 2), ("g", 4), ("m", 2), ("g", 2), ("S", 6), ("-", 2),
         ("n", 2, -1), ("S", 2), ("g", 2), ("m", 2), ("P", 4), ("m", 2), ("g", 2), ("S", 6)]
    bansuri(b, p, 2.0, amp=.2, vib=4.5, bright=.1)
    return b[:N]

def track_utsav():
    b = np.zeros(N + SR * 5)
    tanpura(b, 0.0, DUR, cycle=4.4, amp=.12)
    bpm = 104; beat = 60 / bpm / 2           # keherwa in eighth-notes
    pattern = ["dha", "ge", "na", "ti", "na", "ka", "dhi", "na"]
    t = 0.6; k = 0
    while t < DUR - 1.5:
        s = pattern[k % 8]
        if s in ("dha", "dhi"): place(b, dholak_dha(), t); place(b, dholak_na(.18), t)
        elif s == "ge": place(b, dholak_ge(), t)
        elif s in ("na", "ti", "ka"): place(b, dholak_na(.26 if s == "na" else .18), t)
        if k % 2 == 0: place(b, manjira(.07 if k % 4 else .1), t)
        t += beat; k += 1
    ph = [("S", 2), ("R", 2), ("G", 2), ("P", 4), ("G", 2), ("P", 2), ("D", 2), ("P", 4), ("G", 2), ("R", 2), ("G", 4), ("-", 2),
          ("P", 2), ("D", 2), ("S", 4, 1), ("D", 2), ("P", 2), ("G", 2), ("R", 2), ("S", 8)]
    shehnai(b, ph, 1.2, amp=.2)
    shehnai(b, ph, 12.0, amp=.2)
    place(b, bell(1100, amp=.1), 0.6)
    return b[:N]

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out, exist_ok=True)
    master(track_mangal(), "mangal-dhun", out)
    master(track_shanti(), "shanti", out)
    master(track_utsav(), "utsav", out)
    print("ok")
