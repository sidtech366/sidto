"""Animated video templates (v2) from the frameless poster art.
6 s, 24 fps, 540x960, seamless loop. Original work for Sidto."""
import math, random, os, shutil, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter

S = sys.argv[1]; OUT = sys.argv[2]
VW, VH, FPS, SECS = 540, 960, 24, 6
N = FPS * SECS
CROP_W = round(1350 * VW / VH)          # 759 px wide slice of the 1080x1350 art
X0 = (1080 - CROP_W) // 2
SC = VW / CROP_W

def to_v(x, y):
    return ((x - X0) * SC, y * SC)

def glow_sprite(radius, color):
    size = int(radius * 4)
    g = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((size * .35, size * .35, size * .65, size * .65), fill=color)
    return g.filter(ImageFilter.GaussianBlur(radius * .45))

def star_sprite(s, color):
    size = int(s * 6)
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = size / 2
    d.polygon([(c, c - s), (c + s * .2, c - s * .2), (c + s, c), (c + s * .2, c + s * .2), (c, c + s), (c - s * .2, c + s * .2), (c - s, c), (c - s * .2, c - s * .2)], fill=color)
    halo = im.filter(ImageFilter.GaussianBlur(s * .5))
    halo.alpha_composite(im)
    return halo

def paste_alpha(base, sprite, cx, cy, alpha):
    if alpha <= 0.01: return
    sp = sprite.copy()
    a = sp.getchannel("A").point(lambda v: int(v * min(1, alpha)))
    sp.putalpha(a)
    base.alpha_composite(sp, (int(cx - sp.width / 2), int(cy - sp.height / 2)))

def render(name, art, flames, kind):
    src = Image.open(os.path.join(S, art)).convert("RGBA").crop((X0, 0, X0 + CROP_W, 1350))
    base = src.resize((VW, VH), Image.LANCZOS)
    tmp = os.path.join(S, "frames_" + name)
    if os.path.exists(tmp): shutil.rmtree(tmp)
    os.makedirs(tmp)
    rnd = random.Random(7)
    sparks = [dict(x=rnd.uniform(20, VW - 20), y=rnd.uniform(140, 640), s=rnd.uniform(4, 9), ph=rnd.uniform(0, 6.28), sp=rnd.choice([1, 2, 3])) for _ in range(34)]
    star = star_sprite(8, (255, 247, 214, 255))
    embers = [dict(x=rnd.uniform(40, VW - 40), y0=rnd.uniform(0, VH), v=rnd.uniform(25, 70), r=rnd.uniform(1.5, 3.2), ph=rnd.uniform(0, 6.28)) for _ in range(46)]
    if kind == "glow":
        fl_glow = glow_sprite(70, (255, 190, 80, 200))
    else:
        moon_glow = glow_sprite(150, (230, 225, 255, 120))
    for f in range(N):
        t = f / FPS; ph = 2 * math.pi * t / SECS
        zoom = 1.0 + 0.035 * (1 - math.cos(ph)) / 2          # 1.000 → 1.035 → 1.000 (seamless)
        zw, zh = int(VW * zoom), int(VH * zoom)
        frame = base.resize((zw, zh), Image.BICUBIC).crop(((zw - VW) // 2, int((zh - VH) * .55), (zw - VW) // 2 + VW, int((zh - VH) * .55) + VH))
        def zp(x, y):  # account for zoom when placing overlays
            return ((x - VW / 2) * zoom + VW / 2, (y - VH * .55) * zoom + VH * .55)
        if kind == "glow":
            for i, (fx, fy, s) in enumerate(flames):
                vx, vy = zp(*to_v(fx, fy))
                a = .45 + .25 * math.sin(ph * 6 + i * 1.7) + .1 * math.sin(ph * 17 + i)
                g = fl_glow.resize((int(fl_glow.width * s), int(fl_glow.height * s)))
                paste_alpha(frame, g, vx, vy, a)
            d = ImageDraw.Draw(frame)
            for e in embers:
                p = (t / SECS + e["ph"] / 6.28) % 1            # seamless: each ember lives one loop
                y = e["y0"] * .6 + 300 - 140 * p
                x = e["x"] + 8 * math.sin(ph * 2 + e["ph"])
                al = int(230 * math.sin(math.pi * p))
                d.ellipse((x - e["r"], y - e["r"], x + e["r"], y + e["r"]), fill=(255, 205, 110, max(0, al)))
        else:
            mx, my = zp(*to_v(540, 560))
            paste_alpha(frame, moon_glow, mx, my, .35 + .2 * math.sin(ph))
            d = ImageDraw.Draw(frame)
            # water shimmer drifting
            for k in range(14):
                yy = VH * .7 + k * 16 + 4 * math.sin(ph * 2 + k)
                w = 120 - k * 6 + 18 * math.sin(ph * 3 + k * .9)
                xx = VW / 2 + 14 * math.sin(ph + k)
                al = int(110 - k * 6 + 40 * math.sin(ph * 4 + k))
                d.rounded_rectangle((xx - w / 2, yy, xx + w / 2, yy + 3), 1, fill=(255, 247, 224, max(0, al)))
        for sp in sparks:
            a = .5 + .5 * math.sin(ph * sp["sp"] + sp["ph"])
            vx, vy = zp(sp["x"], sp["y"])
            sc = sp["s"] / 8
            paste_alpha(frame, star.resize((max(4, int(star.width * sc)), max(4, int(star.height * sc)))), vx, vy, a * .9)
        frame.convert("RGB").save(f"{tmp}/f{f:04d}.png")
    out = os.path.join(OUT, name + ".webm")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{tmp}/f%04d.png",
                    "-c:v", "libvpx-vp9", "-b:v", "1400k", "-pix_fmt", "yuv420p", "-an", out], check=True)
    Image.open(f"{tmp}/f0036.png").convert("RGB").save(os.path.join(OUT, name + "-poster.jpg"), quality=84)
    shutil.rmtree(tmp)

# flame centres in poster coordinates (from art2.py diya calls: flame ≈ rim y - 60*s)
render("golden-glow", "diya.png", [(540, 880 - 95, 1.6), (285, 950 - 55, .9), (795, 950 - 55, .9), (130, 1000 - 40, .6), (950, 1000 - 40, .6)], "glow")
render("moonlight", "moon.png", [], "moon")
print("ok")
