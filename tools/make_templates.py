"""Sidto poster backgrounds v2 — richer original artwork.
Layout zones (1080x1350): title 150-340, art 340-980, name plate 1000-1300.
"""
import math, random, os, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/sidto-repo/assets/templates"
W, H = 1080, 1350
F = lambda v: f"{v:.1f}".rstrip("0").rstrip(".")

# ------------------------------------------------------------------ shared defs
def defs(extra=""):
    return f'''<defs>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".3" stop-color="#F7C948"/><stop offset=".55" stop-color="#B7791F"/><stop offset=".8" stop-color="#FFE08A"/><stop offset="1" stop-color="#C98A1B"/></linearGradient>
<linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".5" stop-color="#F2B530"/><stop offset="1" stop-color="#9A5B10"/></linearGradient>
<linearGradient id="silver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".35" stop-color="#C9D6FF"/><stop offset=".6" stop-color="#8E9AC9"/><stop offset=".85" stop-color="#EEF2FF"/><stop offset="1" stop-color="#A9B4E0"/></linearGradient>
<linearGradient id="flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#E23B00"/><stop offset=".35" stop-color="#FF8A00"/><stop offset=".7" stop-color="#FFC93C"/><stop offset="1" stop-color="#FFF4B0"/></linearGradient>
<radialGradient id="flameHalo"><stop offset="0" stop-color="#FFE38A" stop-opacity=".95"/><stop offset=".3" stop-color="#FFAA2B" stop-opacity=".45"/><stop offset="1" stop-color="#FF7A00" stop-opacity="0"/></radialGradient>
<linearGradient id="clay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9873A"/><stop offset=".55" stop-color="#B4471A"/><stop offset="1" stop-color="#6E230A"/></linearGradient>
<linearGradient id="clayRim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7A2A0C"/><stop offset=".5" stop-color="#C2581F"/><stop offset="1" stop-color="#7A2A0C"/></linearGradient>
<radialGradient id="oil" cx=".5" cy=".4"><stop offset="0" stop-color="#FFE7A0"/><stop offset="1" stop-color="#C9861E"/></radialGradient>
<radialGradient id="vignette" cx=".5" cy=".48" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
<linearGradient id="petalPink" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9D174D"/><stop offset=".55" stop-color="#EC4899"/><stop offset="1" stop-color="#FFE4F1"/></linearGradient>
<linearGradient id="petalPinkL" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#DB2777"/><stop offset=".5" stop-color="#F9A8D4"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
<linearGradient id="petalGold" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#B45309"/><stop offset=".6" stop-color="#F59E0B"/><stop offset="1" stop-color="#FEF3C7"/></linearGradient>
<linearGradient id="petalSaffron" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9A3412"/><stop offset=".6" stop-color="#F97316"/><stop offset="1" stop-color="#FED7AA"/></linearGradient>
<linearGradient id="petalWhite" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FBCFE8"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient>
<linearGradient id="leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3F9142"/><stop offset="1" stop-color="#14532D"/></linearGradient>
<linearGradient id="leafL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#84CC16"/><stop offset="1" stop-color="#2F7D32"/></linearGradient>
<radialGradient id="coin" cx=".38" cy=".35"><stop offset="0" stop-color="#FFF7CC"/><stop offset=".5" stop-color="#F5C542"/><stop offset="1" stop-color="#A86B0C"/></radialGradient>
<filter id="glowS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="glowM" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="blur3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="blur8" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="blur20" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="20"/></filter>
<filter id="blur40" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="40"/></filter>
<filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity=".45"/></filter>
<pattern id="jaali" width="72" height="72" patternUnits="userSpaceOnUse">
  <g fill="#FFD27A"><ellipse cx="36" cy="22" rx="5" ry="12"/><ellipse cx="36" cy="50" rx="5" ry="12"/><ellipse cx="22" cy="36" rx="12" ry="5"/><ellipse cx="50" cy="36" rx="12" ry="5"/><circle cx="36" cy="36" r="4"/><circle cx="0" cy="0" r="3"/><circle cx="72" cy="0" r="3"/><circle cx="0" cy="72" r="3"/><circle cx="72" cy="72" r="3"/></g>
</pattern>
{extra}
</defs>'''

def save(name, body):
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">\n'
           f'<!-- Original artwork created for Sidto (v2). Free to use and modify within this project. -->\n'
           + body + "\n</svg>\n")
    with open(os.path.join(OUT, name), "w") as f:
        f.write(svg)

# ------------------------------------------------------------------ primitives
def petal_path(L, w):
    """pointed petal from (0,0) to (0,-L), half width w"""
    return (f"M0 0 C{F(w*1.05)} {F(-L*.22)} {F(w*.75)} {F(-L*.78)} 0 {F(-L)} "
            f"C{F(-w*.75)} {F(-L*.78)} {F(-w*1.05)} {F(-L*.22)} 0 0Z")

def petal_ring(cx, cy, n, L, w, fill, offset=0, r0=0, opacity=1, stroke=None, sw=2):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    d = petal_path(L, w)
    out = [f'<g opacity="{opacity}">']
    for i in range(n):
        a = 360 / n * i + offset
        out.append(f'<path d="{d}" fill="{fill}"{st} transform="translate({F(cx)} {F(cy)}) rotate({F(a)}) translate(0 {F(-r0)})"/>')
    out.append("</g>")
    return "\n".join(out)

def round_petal_ring(cx, cy, n, r0, rx, ry, fill, offset=0, opacity=1):
    return f'<g opacity="{opacity}">' + "".join(
        f'<ellipse cx="0" cy="{F(-r0-ry)}" rx="{F(rx)}" ry="{F(ry)}" fill="{fill}" transform="translate({F(cx)} {F(cy)}) rotate({F(360/n*i+offset)})"/>'
        for i in range(n)) + "</g>"

def dot_ring(cx, cy, n, rad, r, fill, opacity=1):
    return f'<g fill="{fill}" opacity="{opacity}">' + "".join(
        f'<circle cx="{F(cx + rad*math.cos(2*math.pi*i/n))}" cy="{F(cy + rad*math.sin(2*math.pi*i/n))}" r="{F(r)}"/>' for i in range(n)) + "</g>"

def sparkle(x, y, s, color="#FFF7D6", op=1):
    d = f"M0 {F(-s)} L{F(s*.18)} {F(-s*.18)} L{F(s)} 0 L{F(s*.18)} {F(s*.18)} L0 {F(s)} L{F(-s*.18)} {F(s*.18)} L{F(-s)} 0 L{F(-s*.18)} {F(-s*.18)}Z"
    return f'<path d="{d}" fill="{color}" opacity="{op}" transform="translate({F(x)} {F(y)})" filter="url(#glowS)"/>'

def sparkles(n, seed, box, colors=("#FFF7D6", "#FFE08A"), smin=5, smax=14):
    r = random.Random(seed); x0, y0, x1, y1 = box
    return "\n".join(sparkle(r.uniform(x0, x1), r.uniform(y0, y1), r.uniform(smin, smax), r.choice(colors), round(r.uniform(.5, 1), 2)) for _ in range(n))

def stars(n, seed, ymax, color="#fff"):
    r = random.Random(seed)
    return '<g>' + "".join(f'<circle cx="{F(r.uniform(0, W))}" cy="{F(r.uniform(0, ymax))}" r="{r.choice([1, 1.4, 1.8, 2.4])}" fill="{color}" opacity="{r.uniform(.3, .95):.2f}"/>' for _ in range(n)) + '</g>'

def bokeh(n, seed, colors, box, rmin=8, rmax=40, blur=True):
    r = random.Random(seed); x0, y0, x1, y1 = box
    f = ' filter="url(#blur3)"' if blur else ""
    return f'<g{f}>' + "".join(f'<circle cx="{F(r.uniform(x0, x1))}" cy="{F(r.uniform(y0, y1))}" r="{F(r.uniform(rmin, rmax))}" fill="{r.choice(colors)}" opacity="{r.uniform(.12, .38):.2f}"/>' for _ in range(n)) + '</g>'

def rays(cx, cy, n, r0, r1, color, op=.18, width=10):
    out = []
    for i in range(n):
        a = math.radians(360 / n * i)
        a1, a2 = a - math.radians(width / 2) / 2, a + math.radians(width / 2) / 2
        out.append(f'<path d="M{F(cx + r0*math.cos(a))} {F(cy + r0*math.sin(a))} L{F(cx + r1*math.cos(a1))} {F(cy + r1*math.sin(a1))} L{F(cx + r1*math.cos(a2))} {F(cy + r1*math.sin(a2))}Z" fill="{color}"/>')
    return f'<g opacity="{op}" filter="url(#blur3)">' + "".join(out) + "</g>"

def marigold(x, y, r, palette=("#F97316", "#FB923C", "#FDBA74", "#C2410C")):
    out = [f'<g transform="translate({F(x)} {F(y)})">', f'<circle r="{F(r)}" fill="{palette[3]}"/>']
    for ring, (rr, n, col) in enumerate(((r*.78, 14, palette[0]), (r*.55, 11, palette[1]), (r*.32, 8, palette[2]))):
        for i in range(n):
            a = 2*math.pi*i/n + ring*.4
            out.append(f'<circle cx="{F(rr*math.cos(a))}" cy="{F(rr*math.sin(a))}" r="{F(r*.3)}" fill="{col}"/>')
    out.append(f'<circle r="{F(r*.18)}" fill="#7C2D12" opacity=".7"/></g>')
    return "".join(out)

def mango_leaf(x, y, L, angle, fill="url(#leaf)"):
    w = L * .26
    return (f'<g transform="translate({F(x)} {F(y)}) rotate({F(angle)})">'
            f'<path d="M0 0 C{F(w)} {F(L*.25)} {F(w*.8)} {F(L*.75)} 0 {F(L)} C{F(-w*.8)} {F(L*.75)} {F(-w)} {F(L*.25)} 0 0Z" fill="{fill}"/>'
            f'<path d="M0 2 L0 {F(L*.92)}" stroke="#BEF264" stroke-width="2" opacity=".55"/></g>')

def toran(y=36, sag=34):
    """marigold string garland across the top with hanging strands and mango leaves"""
    if os.environ.get("NOFRAME") == "1": return ""
    out = ['<g filter="url(#shadow)" transform="translate(0 60)">']
    pts = []
    n = 26
    for i in range(n + 1):
        t = i / n; x = -20 + t * (W + 40)
        pts.append((x, y + sag * math.sin(t * math.pi * 3) ** 2))
    # leaves first (behind flowers)
    for i, (x, yy) in enumerate(pts):
        if i % 2 == 0:
            out.append(mango_leaf(x - 6, yy + 6, 70, 12, "url(#leaf)"))
            out.append(mango_leaf(x + 6, yy + 6, 70, -12, "url(#leafL)"))
    for i, (x, yy) in enumerate(pts):
        out.append(marigold(x, yy, 20, ("#FACC15", "#FDE047", "#FEF08A", "#CA8A04") if i % 2 else ("#F97316", "#FB923C", "#FDBA74", "#C2410C")))
        if i % 4 == 2:
            for k in range(1, 4):
                out.append(f'<line x1="{F(x)}" y1="{F(yy)}" x2="{F(x)}" y2="{F(yy + 34*k)}" stroke="#FACC15" stroke-width="2"/>')
            for k in range(1, 4):
                out.append(marigold(x, yy + 34*k, 13 - k, ("#F97316", "#FB923C", "#FDBA74", "#C2410C") if k % 2 else ("#FACC15", "#FDE047", "#FEF08A", "#CA8A04")))
            out.append(f'<path d="M{F(x-7)} {F(yy+128)} q7 -12 14 0 l-2 14 h-10z" fill="url(#goldV)"/>')  # bell
            out.append(f'<circle cx="{F(x)}" cy="{F(yy+145)}" r="3" fill="#FDE68A"/>')
    out.append("</g>")
    return "\n".join(out)

def corner_ornament(s=1.0):
    """drawn for the top-left corner at origin; points into the poster"""
    out = []
    for i, a in enumerate(range(5, 90, 14)):
        out.append(f'<path d="{petal_path(78*s, 13*s)}" fill="url(#gold)" opacity=".95" transform="rotate({a + 90})" />')
    out.append(f'<path d="M{F(110*s)} 0 A{F(110*s)} {F(110*s)} 0 0 1 0 {F(110*s)}" fill="none" stroke="url(#gold)" stroke-width="3"/>')
    out.append(f'<path d="M{F(128*s)} 0 A{F(128*s)} {F(128*s)} 0 0 1 0 {F(128*s)}" fill="none" stroke="url(#gold)" stroke-width="1.5" stroke-dasharray="2 7" stroke-linecap="round"/>')
    out.append(dot_ring(0, 0, 40, 96*s, 2.4*s, "#FFE9A8"))
    out.append(f'<circle r="{F(26*s)}" fill="url(#gold)"/><circle r="{F(14*s)}" fill="#7A1E2C"/><circle r="{F(6*s)}" fill="#FFE08A"/>')
    return "".join(out)

NOFRAME = os.environ.get("NOFRAME") == "1"

def frame(paint="url(#gold)", inset=24, corners=True, accent="#FFE9A8"):
    if NOFRAME: return ""
    i2 = inset + 16
    out = [f'<rect x="{inset}" y="{inset}" width="{W-2*inset}" height="{H-2*inset}" rx="30" fill="none" stroke="{paint}" stroke-width="7"/>',
           f'<rect x="{i2}" y="{i2}" width="{W-2*i2}" height="{H-2*i2}" rx="20" fill="none" stroke="{paint}" stroke-width="2" opacity=".85"/>',
           f'<rect x="{i2+9}" y="{i2+9}" width="{W-2*(i2+9)}" height="{H-2*(i2+9)}" rx="14" fill="none" stroke="{accent}" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round" opacity=".7"/>']
    if corners:
        c = inset + 8
        for (x, y, sx, sy) in ((c, c, 1, 1), (W - c, c, -1, 1), (c, H - c, 1, -1), (W - c, H - c, -1, -1)):
            out.append(f'<g transform="translate({x} {y}) scale({sx} {sy})">{corner_ornament(.9)}</g>')
    # bottom centre ornament
    out.append(f'<g transform="translate({W//2} {H-inset})"><path d="M-70 0 H-22 M22 0 H70" stroke="{paint}" stroke-width="4"/>'
               f'<path d="M0 -20 L20 0 L0 20 L-20 0Z" fill="{paint}"/><circle r="6" fill="#7A1E2C"/></g>')
    return "\n".join(out)

def diya(cx, cy, s=1.0, halo=True, flicker=0):
    """symmetric clay diya; (cx, cy) = centre of the rim"""
    w = 120 * s
    o = []
    if halo:
        o.append(f'<circle cx="{F(cx)}" cy="{F(cy - 70*s)}" r="{F(190*s)}" fill="url(#flameHalo)" opacity=".85"/>')
    # body
    o.append(f'<path d="M{F(cx-w)} {F(cy)} C{F(cx-w*.95)} {F(cy+70*s)} {F(cx+w*.95)} {F(cy+70*s)} {F(cx+w)} {F(cy)} Z" fill="url(#clay)"/>')
    o.append(f'<ellipse cx="{F(cx)}" cy="{F(cy+58*s)}" rx="{F(w*.38)}" ry="{F(9*s)}" fill="#5A1D08"/>')
    # painted band of dots and petals
    for k in range(9):
        t = (k + .5) / 9; x = cx - w*.82 + t * w * 1.64
        yy = cy + 26*s + 14*s * math.sin(t*math.pi)
        o.append(f'<circle cx="{F(x)}" cy="{F(yy)}" r="{F(4.2*s)}" fill="#FDE68A"/>')
        o.append(f'<circle cx="{F(x)}" cy="{F(yy)}" r="{F(1.8*s)}" fill="#B91C1C"/>')
    o.append(f'<path d="M{F(cx-w*.92)} {F(cy+12*s)} Q{F(cx)} {F(cy+44*s)} {F(cx+w*.92)} {F(cy+12*s)}" stroke="#FFF7D6" stroke-width="{F(2.2*s)}" fill="none" opacity=".75"/>')
    # rim + oil
    o.append(f'<ellipse cx="{F(cx)}" cy="{F(cy)}" rx="{F(w)}" ry="{F(20*s)}" fill="url(#clayRim)"/>')
    o.append(f'<ellipse cx="{F(cx)}" cy="{F(cy-1*s)}" rx="{F(w*.84)}" ry="{F(13*s)}" fill="url(#oil)"/>')
    o.append(f'<ellipse cx="{F(cx-w*.35)}" cy="{F(cy-4*s)}" rx="{F(w*.25)}" ry="{F(3*s)}" fill="#FFF7D6" opacity=".7"/>')
    # wick + flame
    fx, fy = cx, cy - 6*s
    o.append(f'<ellipse cx="{F(fx)}" cy="{F(fy - 48*s)}" rx="{F(34*s)}" ry="{F(60*s)}" fill="#FF9A1F" opacity=".55" filter="url(#blur8)"/>')
    h = 104 * s * (1 + flicker)
    o.append(f'<path d="M{F(fx)} {F(fy)} C{F(fx-28*s)} {F(fy-22*s)} {F(fx-18*s)} {F(fy-h*.62)} {F(fx+2*s)} {F(fy-h)} C{F(fx+20*s)} {F(fy-h*.6)} {F(fx+28*s)} {F(fy-22*s)} {F(fx)} {F(fy)}Z" fill="url(#flame)"/>')
    o.append(f'<path d="M{F(fx)} {F(fy-4*s)} C{F(fx-12*s)} {F(fy-18*s)} {F(fx-8*s)} {F(fy-h*.45)} {F(fx+1*s)} {F(fy-h*.62)} C{F(fx+9*s)} {F(fy-h*.42)} {F(fx+12*s)} {F(fy-18*s)} {F(fx)} {F(fy-4*s)}Z" fill="#FFFBE6"/>')
    o.append(f'<ellipse cx="{F(fx)}" cy="{F(fy-6*s)}" rx="{F(7*s)}" ry="{F(9*s)}" fill="#60A5FA" opacity=".55"/>')
    o.append(f'<rect x="{F(fx-2*s)}" y="{F(fy-8*s)}" width="{F(4*s)}" height="{F(10*s)}" fill="#3B1A08"/>')
    return "\n".join(o)

def lotus(cx, cy, s=1.0, back="url(#petalPink)", front="url(#petalPinkL)", core="#FBBF24"):
    o = []
    layers = [(9, 300, 74, back, 152, 0.0), (7, 270, 72, front, 120, 0.0), (5, 220, 62, "url(#petalWhite)", 84, 0.0)]
    for n, L, w, fill, spread, _ in layers:
        for k in range(n):
            a = -spread/2 + spread * k / (n - 1)
            Lk = L * s * (1 - .25 * abs(a) / 90)
            o.append(f'<path d="{petal_path(Lk, w*s)}" fill="{fill}" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="2" transform="translate({F(cx)} {F(cy)}) rotate({F(a)})"/>')
            o.append(f'<path d="M0 -6 L0 {F(-Lk*.85)}" stroke="#FFFFFF" stroke-opacity=".3" stroke-width="2" transform="translate({F(cx)} {F(cy)}) rotate({F(a)})"/>')
    # side drooping petals
    for a in (-112, 112):
        o.append(f'<path d="{petal_path(230*s, 70*s)}" fill="{back}" transform="translate({F(cx)} {F(cy)}) rotate({a})"/>')
    o.append(f'<ellipse cx="{F(cx)}" cy="{F(cy-40*s)}" rx="{F(46*s)}" ry="{F(22*s)}" fill="{core}" filter="url(#glowS)"/>')
    o.append(dot_ring(cx, cy-40*s, 14, 30*s, 4*s, "#FEF3C7"))
    return "\n".join(o)

def lily_pad(cx, cy, r, rot=0):
    return (f'<g transform="translate({F(cx)} {F(cy)}) rotate({rot}) scale(1 .32)">'
            f'<path d="M0 0 L{F(r)} -8 A{F(r)} {F(r)} 0 1 1 {F(r)} 8 Z" fill="url(#leaf)"/>'
            f'<path d="M0 0 L{F(-r*.9)} 0 M0 0 L{F(-r*.5)} {F(-r*.7)} M0 0 L{F(-r*.5)} {F(r*.7)}" stroke="#4ADE80" stroke-width="5" opacity=".4"/></g>')

def coins(n, seed, box):
    r = random.Random(seed); x0, y0, x1, y1 = box; o = []
    for _ in range(n):
        x, y, rr = r.uniform(x0, x1), r.uniform(y0, y1), r.uniform(12, 22)
        rot = r.uniform(-60, 60); sq = r.uniform(.35, 1)
        o.append(f'<g transform="translate({F(x)} {F(y)}) rotate({F(rot)}) scale(1 {F(sq)})"><circle r="{F(rr)}" fill="url(#coin)" stroke="#8A5A0B" stroke-width="1.5"/><circle r="{F(rr*.62)}" fill="none" stroke="#B7791F" stroke-width="1.5"/></g>')
    return f'<g filter="url(#glowS)">' + "".join(o) + "</g>"

def floor_glow(color, y=1000):
    return f'<ellipse cx="540" cy="{y}" rx="560" ry="120" fill="{color}" opacity=".35" filter="url(#blur40)"/>'

def name_zone_shade(y0=960):
    return (f'<linearGradient id="nz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>'
            f'<rect y="{y0}" width="{W}" height="{H-y0}" fill="url(#nz)"/>')

# ================================================================== SCENES
def scene_diya():
    b = [defs('<radialGradient id="bg" cx=".5" cy=".62" r=".85"><stop offset="0" stop-color="#9C2148"/><stop offset=".45" stop-color="#5A0F35"/><stop offset="1" stop-color="#16041A"/></radialGradient>')]
    b.append(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')
    b.append(f'<rect width="{W}" height="{H}" fill="url(#jaali)" opacity=".06"/>')
    # fireworks
    r = random.Random(3)
    for (fx, fy, fr, col) in ((200, 330, 120, "#FDE68A"), (880, 300, 140, "#F9A8D4"), (560, 250, 90, "#FDBA74")):
        g = [f'<g opacity=".55" filter="url(#glowS)">']
        for k in range(28):
            a = 2*math.pi*k/28; l = fr * r.uniform(.7, 1)
            g.append(f'<line x1="{F(fx + 18*math.cos(a))}" y1="{F(fy + 18*math.sin(a))}" x2="{F(fx + l*math.cos(a))}" y2="{F(fy + l*math.sin(a))}" stroke="{col}" stroke-width="2.4" stroke-linecap="round"/>')
            g.append(f'<circle cx="{F(fx + (l+8)*math.cos(a))}" cy="{F(fy + (l+8)*math.sin(a))}" r="3.2" fill="{col}"/>')
        g.append("</g>"); b.append("".join(g))
    b.append(bokeh(55, 1, ["#FFC14D", "#FF7A3D", "#FFE29A", "#F472B6"], (0, 300, W, H), 6, 34))
    b.append(f'<circle cx="540" cy="760" r="430" fill="#FFB547" opacity=".22" filter="url(#blur40)"/>')
    # rangoli in perspective under the diya
    rg = ['<g transform="translate(540 905) scale(1 .34)">',
          f'<circle r="440" fill="#3B0A2A" opacity=".55"/>',
          petal_ring(0, 0, 24, 170, 38, "url(#petalSaffron)", 0, 250, 1),
          petal_ring(0, 0, 24, 140, 34, "url(#petalPink)", 7.5, 190, 1),
          petal_ring(0, 0, 16, 150, 46, "url(#petalGold)", 0, 60, 1),
          dot_ring(0, 0, 48, 430, 7, "#FFF7D6"), dot_ring(0, 0, 36, 236, 6, "#FDE68A"),
          f'<circle r="70" fill="#1E3A8A"/><circle r="52" fill="#FDE68A"/>', '</g>']
    b.append("".join(rg))
    # marigold petals strewn
    rr = random.Random(9)
    for _ in range(26):
        x, y = rr.uniform(120, 960), rr.uniform(930, 990)
        b.append(f'<ellipse cx="{F(x)}" cy="{F(y)}" rx="7" ry="4" fill="{rr.choice(["#F97316","#FACC15","#EF4444"])}" transform="rotate({rr.randint(0,180)} {F(x)} {F(y)})"/>')
    b.append(diya(130, 1000, .7)); b.append(diya(950, 1000, .7))
    b.append(diya(285, 950, .95)); b.append(diya(795, 950, .95))
    b.append(diya(540, 880, 1.75))
    b.append(sparkles(26, 4, (60, 380, 1020, 860)))
    b.append(name_zone_shade(1010))
    b.append(f'<rect width="{W}" height="{H}" fill="url(#vignette)"/>')
    b.append(toran(30, 28))
    b.append(frame())
    save("diya.svg", "\n".join(b))

def temple_silhouette(cx, base, h, fill):
    """north-Indian shikhara temple: (cx, base) bottom centre, h total height"""
    s = h / 330
    p = [f'<g fill="{fill}">']
    # plinth + mandapa
    p.append(f'<rect x="{F(cx-150*s)}" y="{F(base-30*s)}" width="{F(300*s)}" height="{F(30*s)}"/>')
    p.append(f'<rect x="{F(cx-125*s)}" y="{F(base-110*s)}" width="{F(250*s)}" height="{F(82*s)}"/>')
    for k in range(-2, 3):
        p.append(f'<path d="M{F(cx + k*48*s - 18*s)} {F(base-110*s)} q{F(18*s)} {F(-34*s)} {F(36*s)} 0z"/>')
    # side mini shikharas
    for dx in (-95, 95):
        p.append(f'<path d="M{F(cx+dx*s-34*s)} {F(base-110*s)} C{F(cx+dx*s-30*s)} {F(base-170*s)} {F(cx+dx*s-12*s)} {F(base-205*s)} {F(cx+dx*s)} {F(base-215*s)} C{F(cx+dx*s+12*s)} {F(base-205*s)} {F(cx+dx*s+30*s)} {F(base-170*s)} {F(cx+dx*s+34*s)} {F(base-110*s)}Z"/>')
        p.append(f'<ellipse cx="{F(cx+dx*s)}" cy="{F(base-218*s)}" rx="{F(9*s)}" ry="{F(4*s)}"/><circle cx="{F(cx+dx*s)}" cy="{F(base-226*s)}" r="{F(4*s)}"/>')
    # main shikhara
    p.append(f'<path d="M{F(cx-62*s)} {F(base-110*s)} C{F(cx-60*s)} {F(base-210*s)} {F(cx-30*s)} {F(base-270*s)} {F(cx)} {F(base-290*s)} C{F(cx+30*s)} {F(base-270*s)} {F(cx+60*s)} {F(base-210*s)} {F(cx+62*s)} {F(base-110*s)}Z"/>')
    p.append(f'<ellipse cx="{F(cx)}" cy="{F(base-292*s)}" rx="{F(20*s)}" ry="{F(7*s)}"/>')
    p.append(f'<path d="M{F(cx-8*s)} {F(base-298*s)} q{F(8*s)} {F(-22*s)} {F(16*s)} 0z"/>')
    p.append(f'<rect x="{F(cx-1.5*s)}" y="{F(base-345*s)}" width="{F(3*s)}" height="{F(50*s)}"/>')
    p.append(f'<path d="M{F(cx+1.5*s)} {F(base-345*s)} l{F(38*s)} {F(10*s)} l{F(-38*s)} {F(12*s)}z"/>')
    p.append("</g>")
    return "".join(p)

def palm(x, base, h, fill, flip=1):
    o = [f'<g fill="{fill}">', f'<path d="M{F(x)} {F(base)} Q{F(x+flip*18)} {F(base-h*.5)} {F(x+flip*8)} {F(base-h)}" stroke="{fill}" stroke-width="10" fill="none"/>']
    tx, ty = x + flip*8, base - h
    for a in range(-160, 30, 28):
        ar = math.radians(a)
        ex, ey = tx + 110*math.cos(ar), ty + 110*math.sin(ar) + 30
        o.append(f'<path d="M{F(tx)} {F(ty)} Q{F((tx+ex)/2)} {F(min(ty,ey)-34)} {F(ex)} {F(ey)} Q{F((tx+ex)/2)} {F(min(ty,ey)-14)} {F(tx)} {F(ty)}Z"/>')
    o.append("</g>")
    return "".join(o)

def cloud(cx, cy, s, fill, edge):
    parts = [(-90, 10, 50), (-40, -12, 64), (20, -22, 72), (80, -4, 56), (130, 14, 40), (0, 22, 60), (-130, 22, 34)]
    g = f'<g transform="translate({F(cx)} {F(cy)}) scale({F(s)})">'
    g += "".join(f'<circle cx="{x}" cy="{y}" r="{r+3}" fill="{edge}"/>' for x, y, r in parts)
    g += "".join(f'<circle cx="{x}" cy="{y+3}" r="{r}" fill="{fill}"/>' for x, y, r in parts)
    return g + "</g>"

def scene_moon():
    b = [defs('''<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05061F"/><stop offset=".45" stop-color="#18124F"/><stop offset=".7" stop-color="#33237A"/><stop offset="1" stop-color="#140E3A"/></linearGradient>
<radialGradient id="moonBody" cx=".42" cy=".38"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#FFF6DD"/><stop offset="1" stop-color="#E9DDB8"/></radialGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B226B"/><stop offset="1" stop-color="#07061E"/></linearGradient>''')]
    b.append(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
    b.append(stars(220, 2, 860))
    b.append(sparkles(16, 5, (60, 160, 1020, 720), ("#FFFFFF", "#E0E7FF"), 4, 10))
    mx, my, mr = 540, 560, 205
    b.append(f'<circle cx="{mx}" cy="{my}" r="{mr*2.3}" fill="#B9A8FF" opacity=".22" filter="url(#blur40)"/>')
    b.append(f'<circle cx="{mx}" cy="{my}" r="{mr*1.35}" fill="#FFF7E0" opacity=".35" filter="url(#blur20)"/>')
    b.append(f'<circle cx="{mx}" cy="{my}" r="{mr}" fill="url(#moonBody)"/>')
    b.append(f'<g fill="#D8CBA6" opacity=".45" filter="url(#blur3)"><circle cx="{mx-70}" cy="{my-40}" r="38"/><circle cx="{mx+55}" cy="{my+50}" r="26"/><circle cx="{mx+20}" cy="{my-90}" r="16"/><circle cx="{mx-20}" cy="{my+90}" r="20"/><circle cx="{mx+95}" cy="{my-20}" r="12"/></g>')
    b.append(cloud(250, 700, 1.1, "#2E2471", "#9C8CFF"))
    b.append(cloud(860, 650, .95, "#2E2471", "#B6A8FF"))
    b.append(cloud(700, 780, .7, "#251C60", "#8E7EF0"))
    # far hills
    b.append('<path d="M0 860 Q140 790 280 840 T560 820 T840 830 T1080 800 V940 H0Z" fill="#1C1550"/>')
    b.append(palm(110, 930, 230, "#0B0828", 1)); b.append(palm(975, 930, 200, "#0B0828", -1))
    b.append(temple_silhouette(540, 932, 360, "#0B0828"))
    # water
    b.append(f'<rect y="930" width="{W}" height="{H-930}" fill="url(#water)"/>')
    rr = random.Random(7)
    for k in range(18):
        y = 950 + k*20; w = 230 - k*9 + rr.uniform(-30, 30)
        b.append(f'<rect x="{F(540 - w/2 + rr.uniform(-20, 20))}" y="{y}" width="{F(w)}" height="5" rx="2.5" fill="#FFF7E0" opacity="{F(.55 - k*.025)}" filter="url(#blur3)"/>')
    b.append(lily_pad(170, 1080, 80, 10)); b.append(lily_pad(900, 1060, 70, -20))
    b.append(diya(240, 1030, .45)); b.append(diya(850, 1000, .4)); b.append(diya(380, 1100, .35)); b.append(diya(720, 1120, .38))
    b.append(name_zone_shade(1040))
    b.append(f'<rect width="{W}" height="{H}" fill="url(#vignette)"/>')
    b.append(frame("url(#silver)", accent="#E0E7FF"))
    save("moon.svg", "\n".join(b))

def scene_sunrise():
    b = [defs('''<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A0D05"/><stop offset=".3" stop-color="#9C2A08"/><stop offset=".52" stop-color="#E2630F"/><stop offset=".64" stop-color="#F9A43A"/><stop offset=".7" stop-color="#FFD98A"/></linearGradient>
<radialGradient id="sun" cx=".5" cy=".45"><stop offset="0" stop-color="#FFFFF2"/><stop offset=".45" stop-color="#FFE38A"/><stop offset="1" stop-color="#FFA21F"/></radialGradient>
<linearGradient id="river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7B04E"/><stop offset=".35" stop-color="#C4561A"/><stop offset="1" stop-color="#3D0E05"/></linearGradient>''')]
    b.append(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
    sx, sy = 540, 760
    b.append(rays(sx, sy, 36, 160, 900, "#FFE7A3", .22, 6))
    b.append(f'<circle cx="{sx}" cy="{sy}" r="420" fill="#FFD27A" opacity=".45" filter="url(#blur40)"/>')
    # surya chakra
    b.append(petal_ring(sx, sy, 24, 92, 20, "url(#petalGold)", 7.5, 168, .9))
    b.append(petal_ring(sx, sy, 24, 64, 16, "#FFF2C2", 0, 168, .8))
    b.append(dot_ring(sx, sy, 48, 262, 4, "#FFF7D6", .9))
    b.append(f'<circle cx="{sx}" cy="{sy}" r="168" fill="none" stroke="#FFF7D6" stroke-width="3" opacity=".7"/>')
    b.append(f'<circle cx="{sx}" cy="{sy}" r="150" fill="url(#sun)" filter="url(#glowM)"/>')
    # streak clouds
    for (x, y, w, op) in ((120, 520, 330, .5), (700, 470, 300, .45), (300, 610, 260, .35), (820, 600, 220, .35)):
        b.append(f'<rect x="{x}" y="{y}" width="{w}" height="16" rx="8" fill="#FFD3A1" opacity="{op}" filter="url(#blur3)"/>')
    # birds
    for (x, y, s) in ((230, 390, 1.2), (290, 360, .9), (330, 410, .8), (780, 420, 1), (830, 395, .7)):
        b.append(f'<path d="M{x} {y} q{F(14*s)} {F(-14*s)} {F(28*s)} 0 q{F(14*s)} {F(-14*s)} {F(28*s)} 0" stroke="#3B0A05" stroke-width="{F(4*s)}" fill="none" stroke-linecap="round"/>')
    # banks with ghats & temples
    b.append('<path d="M0 820 Q120 780 260 800 L380 860 L0 880Z" fill="#6B1D0A"/><path d="M1080 800 Q960 770 830 795 L700 860 L1080 880Z" fill="#6B1D0A"/>')
    b.append(temple_silhouette(150, 862, 210, "#4A1206"))
    b.append(temple_silhouette(935, 862, 180, "#4A1206"))
    b.append('<g fill="#3B0E05">' + "".join(f'<rect x="{x}" y="{862 + k*6}" width="{360 - k*30}" height="6"/>' for k, x in enumerate(range(0, 60, 10))) + "</g>")
    b.append(f'<rect y="860" width="{W}" height="{H-860}" fill="url(#river)"/>')
    rr = random.Random(11)
    for k in range(16):
        y = 878 + k*22; w = 260 - k*12 + rr.uniform(-30, 30)
        b.append(f'<rect x="{F(540-w/2+rr.uniform(-25, 25))}" y="{y}" width="{F(w)}" height="6" rx="3" fill="#FFF3C4" opacity="{F(.75-k*.04)}" filter="url(#blur3)"/>')
    # boat
    b.append('<path d="M640 945 h120 q-12 22 -48 22 h-30 q-30 0 -42 -22z" fill="#2B0A04"/><path d="M700 945 v-62 l38 50 z" fill="#2B0A04"/>')
    b.append(lily_pad(170, 1020, 90, 5)); b.append(lily_pad(930, 990, 80, -15))
    b.append(lotus(200, 990, .38)); b.append(lotus(900, 965, .32))
    b.append(sparkles(14, 6, (80, 300, 1000, 700), ("#FFF7D6",), 4, 9))
    b.append(name_zone_shade(1000))
    b.append(f'<rect width="{W}" height="{H}" fill="url(#vignette)"/>')
    b.append(frame())
    save("sunrise.svg", "\n".join(b))

def scene_lotus():
    b = [defs('''<radialGradient id="bg" cx=".5" cy=".45" r=".8"><stop offset="0" stop-color="#B0216C"/><stop offset=".45" stop-color="#5E0C46"/><stop offset="1" stop-color="#1B0526"/></radialGradient>
<linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E4C5A"/><stop offset="1" stop-color="#03141D"/></linearGradient>''')]
    b.append(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')
    b.append(f'<rect width="{W}" height="{H}" fill="url(#jaali)" opacity=".05"/>')
    cx, cy = 540, 650
    b.append(rays(cx, cy, 40, 120, 800, "#FFE3F1", .16, 5))
    b.append(f'<circle cx="{cx}" cy="{cy}" r="360" fill="#FFC3E1" opacity=".35" filter="url(#blur40)"/>')
    b.append(f'<g opacity=".55">{petal_ring(cx, cy, 32, 70, 16, "url(#petalGold)", 0, 268)}{dot_ring(cx, cy, 64, 352, 3.5, "#FFE9A8")}'
             f'<circle cx="{cx}" cy="{cy}" r="268" fill="none" stroke="#FFE9A8" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="250" fill="none" stroke="#FFE9A8" stroke-width="1" stroke-dasharray="3 8"/></g>')
    b.append(coins(16, 3, (90, 330, 990, 820)))
    b.append(bokeh(40, 4, ["#FFD1E8", "#FDE68A", "#FFFFFF"], (0, 300, W, 900), 5, 26))
    b.append(f'<rect y="900" width="{W}" height="{H-900}" fill="url(#water)"/>')
    b.append('<g fill="none" stroke="#7DD3FC" opacity=".35">' + "".join(f'<ellipse cx="540" cy="{935 + k*26}" rx="{300 + k*80}" ry="{22 + k*6}" stroke-width="{3 - k*.4}"/>' for k in range(5)) + "</g>")
    b.append(lily_pad(210, 990, 120, 15)); b.append(lily_pad(880, 1010, 110, -10)); b.append(lily_pad(110, 1080, 70, 0)); b.append(lily_pad(990, 1090, 60, 30))
    b.append(lotus(540, 935, 1.05))
    # buds
    for (x, y, a) in ((300, 935, -12), (790, 945, 14)):
        b.append(f'<path d="M{x} {y+40} Q{x} {y+100} {x+5} {y+140}" stroke="#166534" stroke-width="7" fill="none"/>')
        b.append(f'<path d="{petal_path(120, 34)}" fill="url(#petalPink)" transform="translate({x} {y+40}) rotate({a})"/>')
    b.append(diya(180, 1070, .4)); b.append(diya(910, 1080, .4))
    b.append(sparkles(24, 8, (60, 300, 1020, 880), ("#FFF7D6", "#FFE4F1")))
    b.append(name_zone_shade(1040))
    b.append(f'<rect width="{W}" height="{H}" fill="url(#vignette)"/>')
    b.append(frame())
    save("lotus.svg", "\n".join(b))

def scene_trishul():
    b = [defs('''<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#030817"/><stop offset=".5" stop-color="#0B2447"/><stop offset="1" stop-color="#19376D"/></linearGradient>
<linearGradient id="steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9CA3AF"/><stop offset=".45" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#E5E7EB"/><stop offset="1" stop-color="#6B7280"/></linearGradient>
<linearGradient id="snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#A5C8F5"/></linearGradient>
<linearGradient id="mtn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D4F86"/><stop offset="1" stop-color="#0F2142"/></linearGradient>
<linearGradient id="drum" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7C2D12"/><stop offset=".5" stop-color="#D97706"/><stop offset="1" stop-color="#7C2D12"/></linearGradient>''')]
    b.append(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
    b.append(stars(180, 5, 760))
    b.append(sparkles(14, 9, (60, 160, 1020, 600), ("#FFFFFF", "#BAE6FD"), 4, 10))
    # crescent
    b.append('<g filter="url(#glowM)"><path d="M860 330 a95 95 0 1 0 70 165 a76 76 0 1 1 -70 -165z" fill="#F8FAFC"/></g>')
    # Kailash
    b.append('<path d="M40 1000 L320 640 L430 700 L540 470 L660 690 L760 630 L1040 1000Z" fill="url(#mtn)"/>')
    b.append('<path d="M540 470 L660 690 L622 668 L598 708 L552 650 L512 706 L484 676 L446 700 Z" fill="url(#snow)"/>')
    b.append('<path d="M320 640 L430 700 L398 694 L372 720 L346 684 L300 668Z" fill="url(#snow)" opacity=".85"/><path d="M760 630 L850 742 L816 730 L790 752 L770 712 L736 664Z" fill="url(#snow)" opacity=".85"/>')
    b.append('<path d="M0 960 L180 800 L300 880 L420 820 L540 900 L680 830 L820 900 L940 810 L1080 900 V1350 H0Z" fill="#0D1F3D"/>')
    b.append('<g filter="url(#blur20)" opacity=".22"><ellipse cx="260" cy="900" rx="260" ry="40" fill="#C7D7F5"/><ellipse cx="820" cy="930" rx="300" ry="44" fill="#C7D7F5"/></g>')
    b.append('<path d="M0 1050 L220 960 L420 1030 L600 980 L820 1040 L1080 970 V1350 H0Z" fill="#081530"/>')
    # aura
    b.append('<circle cx="540" cy="620" r="330" fill="#7DD3FC" opacity=".28" filter="url(#blur40)"/>')
    b.append(rays(540, 520, 28, 90, 520, "#BAE6FD", .2, 6))
    # trishul
    t = ['<g filter="url(#shadow)" transform="translate(0 60)">']
    t.append('<rect x="528" y="470" width="24" height="560" rx="10" fill="url(#steel)"/>')
    t.append('<path d="M540 300 C516 360 518 430 540 470 C562 430 564 360 540 300Z" fill="url(#steel)"/>')
    t.append('<path d="M420 330 C398 400 420 470 520 486 L520 466 C462 456 440 410 452 350 L436 368Z" fill="url(#steel)"/>')
    t.append('<path d="M660 330 C682 400 660 470 560 486 L560 466 C618 456 640 410 628 350 L644 368Z" fill="url(#steel)"/>')
    t.append('<rect x="498" y="478" width="84" height="20" rx="8" fill="url(#gold)"/><rect x="510" y="502" width="60" height="12" rx="6" fill="url(#gold)"/>')
    t.append('<rect x="520" y="640" width="40" height="14" rx="6" fill="url(#gold)"/><rect x="520" y="900" width="40" height="14" rx="6" fill="url(#gold)"/>')
    # damru
    t.append('<g transform="translate(540 590)"><path d="M-62 -52 H62 L12 0 L62 52 H-62 L-12 0Z" fill="url(#drum)"/><rect x="-66" y="-58" width="132" height="12" rx="6" fill="url(#gold)"/><rect x="-66" y="46" width="132" height="12" rx="6" fill="url(#gold)"/>'
             '<path d="M-12 0 C-70 -4 -110 26 -118 70" stroke="#FDE68A" stroke-width="4" fill="none"/><circle cx="-120" cy="76" r="10" fill="#FDE68A"/>'
             '<path d="M12 0 C70 -4 110 26 118 70" stroke="#FDE68A" stroke-width="4" fill="none"/><circle cx="120" cy="76" r="10" fill="#FDE68A"/></g>')
    # ribbon
    t.append('<path d="M552 520 q50 30 20 80 q-20 40 30 90" stroke="#DC2626" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M528 520 q-50 30 -20 80 q20 40 -30 90" stroke="#F59E0B" stroke-width="8" fill="none" stroke-linecap="round"/>')
    # rudraksha mala
    rd = []
    for k in range(22):
        a = math.radians(200 + k * 140 / 21)
        rd.append(f'<circle cx="{F(540 + 92*math.cos(a))}" cy="{F(760 - 70*math.sin(a))}" r="9" fill="#7C3A12" stroke="#3B1A08" stroke-width="2"/>')
    t.append("".join(rd))
    t.append("</g>")
    b.append("".join(t))
    # bilva leaves at base
    for (x, y, rot) in ((440, 1010, -20), (640, 1010, 20), (540, 1030, 0)):
        b.append(f'<g transform="translate({x} {y+50}) rotate({rot})">' + "".join(mango_leaf(0, 0, 70, a, "url(#leafL)") for a in (-150, 180, 150)) + "</g>")
    b.append(name_zone_shade(1040))
    b.append(f'<rect width="{W}" height="{H}" fill="url(#vignette)"/>')
    b.append(frame("url(#silver)", accent="#E0F2FE"))
    save("trishul.svg", "\n".join(b))

def scene_feather():
    b = [defs('''<radialGradient id="bg" cx=".5" cy=".45" r=".85"><stop offset="0" stop-color="#11706A"/><stop offset=".5" stop-color="#05403F"/><stop offset="1" stop-color="#021821"/></radialGradient>
<radialGradient id="eyeOuter"><stop offset="0" stop-color="#1E3A8A"/><stop offset=".5" stop-color="#0E7490"/><stop offset=".72" stop-color="#14B8A6"/><stop offset=".86" stop-color="#FBBF24"/><stop offset="1" stop-color="#4D7C0F"/></radialGradient>
<linearGradient id="barbL" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#A3E635"/><stop offset=".6" stop-color="#10B981"/><stop offset="1" stop-color="#0E7490" stop-opacity=".2"/></linearGradient>
<linearGradient id="barbR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A3E635"/><stop offset=".6" stop-color="#10B981"/><stop offset="1" stop-color="#0E7490" stop-opacity=".2"/></linearGradient>
<radialGradient id="vane" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#34D399"/><stop offset=".6" stop-color="#0F766E"/><stop offset="1" stop-color="#065F46" stop-opacity="0"/></radialGradient>
<linearGradient id="bamboo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCD34D"/><stop offset=".4" stop-color="#D97706"/><stop offset="1" stop-color="#78350F"/></linearGradient>''')]
    b.append(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')
    b.append(f'<rect width="{W}" height="{H}" fill="url(#jaali)" opacity=".05"/>')
    b.append(bokeh(55, 6, ["#A7F3D0", "#FDE68A", "#93C5FD"], (0, 250, W, H), 6, 34))
    b.append('<circle cx="540" cy="640" r="400" fill="#5EEAD4" opacity=".25" filter="url(#blur40)"/>')
    # feather
    f = ['<g transform="translate(0 70) rotate(-20 540 660)" filter="url(#shadow)">']
    top, bot = 250, 1060
    ey = 470
    # soft vane body
    f.append(f'<path d="M540 {top} C760 {top+60} 760 640 620 820 C580 880 560 960 540 {bot} C520 960 500 880 460 820 C320 640 320 {top+60} 540 {top}Z" fill="url(#vane)" opacity=".85"/>')
    r = random.Random(21)
    for i in range(150):
        t = i / 149; y = top + 30 + t * (bot - top - 40)
        # widest around the eye, tapering to the quill
        spread = 30 + 220 * math.exp(-((y - ey - 60) / 260) ** 2) * (1.0 if y > ey - 120 else .8)
        spread *= r.uniform(.9, 1.08)
        droop = 18 + 70 * t
        for side, grad in ((-1, "barbL"), (1, "barbR")):
            f.append(f'<path d="M540 {F(y)} Q{F(540 + side*spread*.55)} {F(y - droop*.8)} {F(540 + side*spread)} {F(y + droop*.15)}" stroke="url(#{grad})" stroke-width="2.6" fill="none" opacity=".9"/>')
    f.append(f'<path d="M540 {top} L540 1120" stroke="#ECFCCB" stroke-width="7" stroke-linecap="round"/>')
    f.append(f'<ellipse cx="540" cy="{ey}" rx="150" ry="182" fill="url(#eyeOuter)"/>')
    f.append(f'<ellipse cx="540" cy="{ey+8}" rx="98" ry="122" fill="#F59E0B"/>')
    f.append(f'<ellipse cx="540" cy="{ey+14}" rx="82" ry="104" fill="#14B8A6"/>')
    f.append(f'<path d="M540 {ey-50} C600 {ey-50} 610 {ey+40} 566 {ey+70} C552 {ey+80} 540 {ey+64} 540 {ey+50} C540 {ey+64} 528 {ey+80} 514 {ey+70} C470 {ey+40} 480 {ey-50} 540 {ey-50}Z" fill="#1E1B4B"/>')
    f.append(f'<path d="M540 {ey-30} C576 {ey-30} 580 {ey+20} 556 {ey+40} C548 {ey+46} 540 {ey+36} 540 {ey+28} C540 {ey+36} 532 {ey+46} 524 {ey+40} C500 {ey+20} 504 {ey-30} 540 {ey-30}Z" fill="#2563EB"/>')
    f.append(f'<ellipse cx="525" cy="{ey-12}" rx="12" ry="18" fill="#93C5FD" opacity=".7"/>')
    f.append("</g>")
    b.append("".join(f))
    # flute
    fl = ['<g transform="rotate(12 540 960)" filter="url(#shadow)">',
          '<rect x="150" y="942" width="780" height="38" rx="19" fill="url(#bamboo)"/>',
          '<g fill="#451A03">' + "".join(f'<ellipse cx="{x}" cy="961" rx="8" ry="6"/>' for x in range(470, 880, 58)) + "</g>"]
    for x in (210, 300, 400, 900):
        fl.append(f'<rect x="{x}" y="938" width="16" height="46" rx="4" fill="url(#gold)"/>')
    fl.append('<path d="M300 980 q-14 60 6 110" stroke="#DC2626" stroke-width="6" fill="none"/><path d="M308 980 q18 60 -6 120" stroke="#F59E0B" stroke-width="5" fill="none"/>')
    fl.append('<g fill="#FFF7ED">' + "".join(f'<circle cx="{F(306 - 4*math.sin(k))}" cy="{F(996 + k*14)}" r="5"/>' for k in range(7)) + "</g>")
    fl.append('<path d="M290 1096 l14 44 l14 -44z" fill="url(#gold)"/>')
    fl.append("</g>")
    b.append("".join(fl))
    b.append(sparkles(26, 7, (60, 260, 1020, 960), ("#FFF7D6", "#CCFBF1")))
    b.append(name_zone_shade(1040))
    b.append(f'<rect width="{W}" height="{H}" fill="url(#vignette)"/>')
    b.append(frame())
    save("feather.svg", "\n".join(b))

def scene_mandala():
    b = [defs('''<radialGradient id="bg" cx=".5" cy=".48" r=".8"><stop offset="0" stop-color="#C0163F"/><stop offset=".5" stop-color="#6E0A2B"/><stop offset="1" stop-color="#240410"/></radialGradient>
<radialGradient id="core"><stop offset="0" stop-color="#FFFBEA"/><stop offset="1" stop-color="#F59E0B"/></radialGradient>''')]
    b.append(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')
    b.append(f'<rect width="{W}" height="{H}" fill="url(#jaali)" opacity=".07"/>')
    cx, cy = 540, 660
    b.append(rays(cx, cy, 48, 300, 900, "#FFD27A", .14, 4))
    b.append(f'<circle cx="{cx}" cy="{cy}" r="420" fill="#FF9F43" opacity=".3" filter="url(#blur40)"/>')
    g = ['<g filter="url(#shadow)">',
         petal_ring(cx, cy, 32, 120, 22, "url(#petalGold)", 0, 290, .9),
         f'<circle cx="{cx}" cy="{cy}" r="292" fill="#4C0519" stroke="url(#gold)" stroke-width="6"/>',
         round_petal_ring(cx, cy, 48, 270, 10, 14, "#FDE68A", 0, .9),
         petal_ring(cx, cy, 24, 150, 40, "url(#petalSaffron)", 7.5, 110),
         petal_ring(cx, cy, 24, 120, 30, "url(#petalPink)", 0, 110),
         dot_ring(cx, cy, 72, 248, 4, "#FFF7D6"),
         f'<circle cx="{cx}" cy="{cy}" r="112" fill="#7F1D1D" stroke="url(#gold)" stroke-width="4"/>',
         petal_ring(cx, cy, 16, 100, 30, "url(#petalGold)", 11.25, 0),
         petal_ring(cx, cy, 8, 70, 26, "url(#petalWhite)", 0, 0),
         dot_ring(cx, cy, 32, 78, 3.4, "#FFF7D6"),
         f'<circle cx="{cx}" cy="{cy}" r="34" fill="url(#core)" stroke="#7F1D1D" stroke-width="4"/>',
         dot_ring(cx, cy, 12, 20, 3, "#7F1D1D"), "</g>"]
    b.append("".join(g))
    # small side mandalas
    for (x, y, s) in ((150, 1000, .45), (930, 1000, .45)):
        b.append(f'<g transform="translate({x} {y}) scale({s})" opacity=".85">{petal_ring(0, 0, 16, 120, 34, "url(#petalGold)", 0, 40)}{petal_ring(0, 0, 8, 80, 26, "url(#petalPink)", 22.5, 20)}<circle r="34" fill="url(#core)"/></g>')
    b.append(sparkles(30, 10, (60, 280, 1020, 1000)))
    b.append(name_zone_shade(1040))
    b.append(f'<rect width="{W}" height="{H}" fill="url(#vignette)"/>')
    b.append(frame())
    save("mandala.svg", "\n".join(b))

def scene_kalash():
    b = [defs('''<radialGradient id="bg" cx=".5" cy=".55" r=".8"><stop offset="0" stop-color="#C2410C"/><stop offset=".5" stop-color="#7A1D08"/><stop offset="1" stop-color="#2B0A04"/></radialGradient>
<linearGradient id="brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7C3E0B"/><stop offset=".22" stop-color="#E0A526"/><stop offset=".38" stop-color="#FFF1B8"/><stop offset=".55" stop-color="#F2B530"/><stop offset=".85" stop-color="#9A5B10"/><stop offset="1" stop-color="#5A3007"/></linearGradient>
<radialGradient id="coco" cx=".38" cy=".3"><stop offset="0" stop-color="#C08A3E"/><stop offset=".6" stop-color="#7A4A16"/><stop offset="1" stop-color="#3D2208"/></radialGradient>
<linearGradient id="thali" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A5A0B"/><stop offset=".4" stop-color="#FFE08A"/><stop offset="1" stop-color="#8A5A0B"/></linearGradient>''')]
    b.append(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')
    b.append(f'<rect width="{W}" height="{H}" fill="url(#jaali)" opacity=".06"/>')
    cx = 540
    b.append(rays(cx, 640, 40, 150, 800, "#FFE7A3", .2, 6))
    b.append(f'<circle cx="{cx}" cy="660" r="380" fill="#FFC857" opacity=".35" filter="url(#blur40)"/>')
    b.append(bokeh(40, 8, ["#FDE68A", "#FDBA74"], (0, 300, W, 1000), 6, 30))
    # thali
    b.append(f'<ellipse cx="{cx}" cy="990" rx="300" ry="44" fill="url(#thali)" filter="url(#shadow)"/><ellipse cx="{cx}" cy="984" rx="276" ry="34" fill="#F6D27A"/>')
    rr = random.Random(12)
    b.append('<g fill="#FFFBEB">' + "".join(f'<ellipse cx="{F(cx + rr.uniform(-240, 240))}" cy="{F(984 + rr.uniform(-22, 22))}" rx="4" ry="2" />' for _ in range(160)) + "</g>")
    # leaves
    b.append('<g transform="translate(540 975) scale(.9) translate(-540 -975)">')
    lv = []
    for k, a in enumerate(range(-80, 81, 20)):
        lv.append(mango_leaf(cx, 590, 190, 180 + a, "url(#leaf)" if k % 2 else "url(#leafL)"))
    b.append('<g filter="url(#shadow)">' + "".join(lv) + "</g>")
    # coconut + kalava
    b.append(f'<ellipse cx="{cx}" cy="510" rx="104" ry="120" fill="url(#coco)" filter="url(#shadow)"/>')
    b.append('<g stroke="#5A3410" stroke-width="2" opacity=".5" fill="none">' + "".join(f'<path d="M{cx + d} 398 Q{cx + d*1.4} 510 {cx + d} 624"/>' for d in (-60, -30, 0, 30, 60)) + "</g>")
    b.append(f'<path d="M{cx-14} 396 q14 -36 28 0" fill="#5A3410"/>')
    b.append(f'<path d="M{cx-100} 560 Q{cx} 600 {cx+100} 560" stroke="#DC2626" stroke-width="12" fill="none"/><path d="M{cx-100} 560 Q{cx} 600 {cx+100} 560" stroke="#FACC15" stroke-width="3" fill="none" stroke-dasharray="8 8"/>')
    # kalash body
    k = ['<g filter="url(#shadow)">',
         f'<path d="M{cx-120} 610 h240 l-24 44 h-192z" fill="url(#brass)"/>',
         f'<path d="M{cx-104} 654 C{cx-290} 700 {cx-290} 930 {cx-90} 975 L{cx+90} 975 C{cx+290} 930 {cx+290} 700 {cx+104} 654 Z" fill="url(#brass)"/>',
         f'<ellipse cx="{cx}" cy="975" rx="96" ry="14" fill="#7C3E0B"/>',
         f'<path d="M{cx-200} 760 Q{cx} 810 {cx+200} 760" stroke="#B91C1C" stroke-width="18" fill="none"/>',
         f'<path d="M{cx-200} 760 Q{cx} 810 {cx+200} 760" stroke="#FDE68A" stroke-width="4" fill="none" stroke-dasharray="2 10" stroke-linecap="round"/>',
         f'<path d="M{cx-205} 900 Q{cx} 940 {cx+205} 900" stroke="#B91C1C" stroke-width="8" fill="none"/>',
         f'<g transform="translate({cx} 855)">{petal_ring(0, 0, 8, 44, 16, "#B91C1C", 22.5, 0)}{petal_ring(0, 0, 8, 30, 12, "#FDE68A", 0, 0)}<circle r="10" fill="#B91C1C"/></g>',
         dot_ring(cx, 855, 18, 60, 3.5, "#B91C1C"),
         f'<ellipse cx="{cx-120}" cy="760" rx="24" ry="110" fill="#FFFFFF" opacity=".22" filter="url(#blur8)"/>',
         "</g>"]
    b.append("".join(k))
    b.append("</g>")
    # flowers + coins around thali
    for (x, y, r, c) in ((300, 985, 26, 0), (360, 1010, 22, 1), (720, 1010, 22, 0), (780, 985, 26, 1), (250, 1015, 18, 1), (830, 1015, 18, 0)):
        b.append(marigold(x, y, r, ("#FACC15", "#FDE047", "#FEF08A", "#CA8A04") if c else ("#F97316", "#FB923C", "#FDBA74", "#C2410C")))
    b.append(coins(10, 5, (380, 990, 700, 1030)))
    b.append(diya(140, 1010, .62)); b.append(diya(940, 1010, .62))
    b.append(sparkles(24, 11, (60, 300, 1020, 950)))
    b.append(name_zone_shade(1050))
    b.append(f'<rect width="{W}" height="{H}" fill="url(#vignette)"/>')
    b.append(toran(30, 28))
    b.append(frame())
    save("kalash.svg", "\n".join(b))

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for fn in (scene_diya, scene_moon, scene_sunrise, scene_lotus, scene_trishul, scene_feather, scene_mandala, scene_kalash):
        fn()
    print("ok", OUT)
