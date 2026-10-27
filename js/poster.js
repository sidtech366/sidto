/* Sidto — poster compositor (runs entirely on the phone with <canvas>).
 * Nothing is uploaded: the template, the user's photo and name are
 * combined locally and exported as a JPEG.
 */
(function () {
  const W = 1080, H = 1350;
  const imgCache = new Map();

  function loadImage(src) {
    if (!src) return Promise.resolve(null);
    if (imgCache.has(src)) return imgCache.get(src);
    const p = new Promise(resolve => {
      const img = new Image();
      if (/^https?:/.test(src) && !src.startsWith(location.origin)) img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => { imgCache.delete(src); resolve(null); };
      img.src = src;
    });
    imgCache.set(src, p);
    return p;
  }

  let fontsReady = null;
  function ensureFonts() {
    if (fontsReady) return fontsReady;
    if (!document.fonts || !document.fonts.load) return (fontsReady = Promise.resolve());
    const loads = Promise.all([
      document.fonts.load('64px "Yatra One"', "शुभ Happy"),
      document.fonts.load('600 40px "Mukta"', "शुभकामनाएँ Wishes"),
      document.fonts.load('800 40px "Mukta"', "नाम Name")
    ]).catch(() => {});
    fontsReady = Promise.race([loads, new Promise(r => setTimeout(r, 2500))]);
    return fontsReady;
  }

  function drawCover(ctx, img, x, y, w, h) {
    const sw = img.videoWidth || img.naturalWidth || img.width;
    const sh = img.videoHeight || img.naturalHeight || img.height;
    if (!sw || !sh) return;
    const s = Math.max(w / sw, h / sh);
    const iw = sw * s, ih = sh * s;
    ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  }

  function goldGradient(ctx, x0, y0, x1, y1) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, "#FFF6C8"); g.addColorStop(0.35, "#FFD95A"); g.addColorStop(0.6, "#E9A21F");
    g.addColorStop(0.8, "#FFE48A"); g.addColorStop(1, "#C98A1B");
    return g;
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* Photo inside a double gold ring with a soft glow. */
  function drawCirclePhoto(ctx, img, cx, cy, r, accent, scale) {
    scale = scale || 1;
    const ring = Math.max(5, 9 * scale);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 24 * scale; ctx.shadowOffsetY = 6 * scale;
    ctx.beginPath(); ctx.arc(cx, cy, r + ring + 4 * scale, 0, Math.PI * 2);
    ctx.fillStyle = "#3B0A12"; ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r + ring, 0, Math.PI * 2);
    ctx.fillStyle = goldGradient(ctx, cx - r, cy - r, cx + r, cy + r); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r + 2 * scale, 0, Math.PI * 2);
    ctx.fillStyle = "#5A1020"; ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    if (img) drawCover(ctx, img, cx - r, cy - r, r * 2, r * 2);
    else { ctx.fillStyle = "#ffffff33"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); }
    ctx.restore();
    // small decorative dots on the ring
    ctx.save(); ctx.fillStyle = "#FFF6D0";
    for (let i = 0; i < 24; i++) {
      const a = (Math.PI * 2 * i) / 24;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * (r + ring * 0.55), cy + Math.sin(a) * (r + ring * 0.55), Math.max(1.2, 1.8 * scale), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function fitFont(ctx, text, family, weight, size, maxWidth, minSize) {
    let s = size;
    do { ctx.font = `${weight} ${s}px ${family}`; if (ctx.measureText(text).width <= maxWidth) break; s -= 2; } while (s > (minSize || 18));
    return s;
  }

  function shadowText(ctx, text, x, y, color, blur) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = blur || 14; ctx.shadowOffsetY = 3;
    ctx.fillStyle = color; ctx.fillText(text, x, y);
    ctx.restore();
  }

  /* Gold lettering with a dark outline and a warm glow. */
  function goldText(ctx, text, x, y, fs) {
    const m = ctx.measureText(text);
    const w = m.width;
    const x0 = ctx.textAlign === "center" ? x - w / 2 : ctx.textAlign === "right" ? x - w : x;
    ctx.save();
    ctx.lineJoin = "round"; ctx.miterLimit = 2;
    ctx.shadowColor = "rgba(255,170,40,.55)"; ctx.shadowBlur = fs * 0.35;
    ctx.strokeStyle = "#3A0A06"; ctx.lineWidth = Math.max(4, fs * 0.13);
    ctx.strokeText(text, x, y);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = goldGradient(ctx, x0, y - fs * 0.55, x0 + w * 0.25, y + fs * 0.55);
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function drawDivider(ctx, cx, y, half, scale) {
    ctx.save();
    const g = ctx.createLinearGradient(cx - half, y, cx + half, y);
    g.addColorStop(0, "rgba(255,214,100,0)"); g.addColorStop(0.5, "#FFD95A"); g.addColorStop(1, "rgba(255,214,100,0)");
    ctx.strokeStyle = g; ctx.lineWidth = Math.max(1.5, 3 * scale);
    ctx.beginPath(); ctx.moveTo(cx - half, y); ctx.lineTo(cx - 26 * scale, y); ctx.moveTo(cx + 26 * scale, y); ctx.lineTo(cx + half, y); ctx.stroke();
    ctx.fillStyle = "#FFD95A";
    const d = 13 * scale;
    ctx.beginPath(); ctx.moveTo(cx, y - d); ctx.lineTo(cx + d, y); ctx.lineTo(cx, y + d); ctx.lineTo(cx - d, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#7A1E2C"; ctx.beginPath(); ctx.arc(cx, y, d * 0.38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#FFE9A8";
    [-1, 1].forEach(s => { ctx.beginPath(); ctx.arc(cx + s * 40 * scale, y, 4 * scale, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  }

  /* Dark translucent plaque with a gold border behind the name. */
  function drawPlate(ctx, x, y, w, h, scale) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 18 * scale; ctx.shadowOffsetY = 4 * scale;
    roundRect(ctx, x, y, w, h, h / 2);
    const bg = ctx.createLinearGradient(0, y, 0, y + h);
    bg.addColorStop(0, "rgba(70,10,24,.86)"); bg.addColorStop(1, "rgba(28,4,12,.9)");
    ctx.fillStyle = bg; ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.lineWidth = Math.max(2, 4 * scale); ctx.strokeStyle = goldGradient(ctx, x, y, x + w, y + h); ctx.stroke();
    roundRect(ctx, x + 7 * scale, y + 7 * scale, w - 14 * scale, h - 14 * scale, (h - 14 * scale) / 2);
    ctx.lineWidth = Math.max(1, 1.5 * scale); ctx.strokeStyle = "rgba(255,225,140,.55)"; ctx.stroke();
    ctx.restore();
  }

  /* Draws the name + photo block. Shared by posters and video frames. */
  function drawIdentity(ctx, o, w, h) {
    const p = o.prefs, scale = w / W;
    const color = p.color || "#FFF8E7";
    const r = (p.photoSize / 2) * scale;
    const showPhoto = p.showPhoto && o.photoImg;
    const showName = p.showName && o.name;
    if (!showPhoto && !showName) return;
    const cy = (p.nameY / 100) * h;
    const pad = 76 * scale;
    let fs = p.fontSize * scale;
    const tagColor = "#FFD97A";
    ctx.textBaseline = "middle";

    const measureBlock = (maxW) => {
      fs = fitFont(ctx, o.name, '"Mukta", sans-serif', 800, p.fontSize * scale, maxW);
      const nameW = ctx.measureText(o.name).width;
      let ts = 0, tagW = 0;
      if (o.tagline) { ts = fitFont(ctx, o.tagline, '"Mukta", sans-serif', 600, Math.round(fs * 0.5), maxW, 12); tagW = ctx.measureText(o.tagline).width; }
      return { textW: Math.max(nameW, tagW), ts, blockH: fs * 1.05 + (o.tagline ? ts * 1.2 : 0) };
    };
    const drawLines = (x, midY, align, m) => {
      ctx.textAlign = align;
      const nameY = o.tagline ? midY - m.ts * 0.55 : midY;
      ctx.font = `800 ${fs}px "Mukta", sans-serif`;
      shadowText(ctx, o.name, x, nameY, color, 8 * scale);
      if (o.tagline) {
        ctx.font = `600 ${m.ts}px "Mukta", sans-serif`;
        shadowText(ctx, o.tagline, x, nameY + fs * 0.5 + m.ts * 0.65, tagColor, 6 * scale);
      }
    };

    if (p.photoPlace === "center") {
      const m = showName ? measureBlock(w - pad * 2 - 60 * scale) : null;
      const plateH = m ? m.blockH + 34 * scale : 0;
      const py = showName && showPhoto ? cy - plateH / 2 - r * 0.55 : cy;
      if (showName) {
        const pw = Math.min(w - pad * 2, m.textW + 90 * scale);
        const plateY = showPhoto ? py + r * 0.62 : cy - plateH / 2;
        drawPlate(ctx, w / 2 - pw / 2, plateY, pw, plateH + (showPhoto ? r * 0.38 : 0), scale);
        drawLines(w / 2, plateY + (showPhoto ? r * 0.38 : 0) + plateH / 2, "center", m);
      }
      if (showPhoto) drawCirclePhoto(ctx, o.photoImg, w / 2, py, r, o.theme.accent, scale);
      return;
    }
    const left = p.photoPlace !== "right";
    const px = left ? pad + r : w - pad - r;
    if (showName) {
      const gap = 30 * scale;
      const textX = showPhoto ? (left ? px + r + gap : px - r - gap) : (left ? pad + 40 * scale : w - pad - 40 * scale);
      const maxW = showPhoto ? w - pad * 2 - r * 2 - gap - 50 * scale : w - pad * 2 - 80 * scale;
      const m = measureBlock(maxW);
      const plateH = Math.max(m.blockH + 40 * scale, showPhoto ? r * 1.3 : 0);
      let x0, x1;
      if (showPhoto) { x0 = left ? px : textX - m.textW - 46 * scale; x1 = left ? textX + m.textW + 46 * scale : px; }
      else { x0 = left ? pad : textX - m.textW - 40 * scale; x1 = left ? textX + m.textW + 40 * scale : w - pad; }
      drawPlate(ctx, x0, cy - plateH / 2, x1 - x0, plateH, scale);
      drawLines(textX, cy, left ? "left" : "right", m);
    }
    if (showPhoto) drawCirclePhoto(ctx, o.photoImg, px, cy, r, o.theme.accent, scale);
  }

  function drawTitleBlock(ctx, o, w, h) {
    const scale = w / W;
    const tall = h / w > 1.5;
    const baseY = (o.theme && o.theme.titleY) || 196; // per-template, in 1080-px poster units
    const ty = tall ? 175 * 1.15 * scale : baseY * scale;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    let fs = 0;
    if (o.title) {
      fs = fitFont(ctx, o.title, '"Yatra One", serif', 400, 112 * scale, w - 190 * scale);
      ctx.font = `400 ${fs}px "Yatra One", serif`;
      goldText(ctx, o.title, w / 2, ty, fs);
    }
    const dy = ty + Math.max(fs, 60 * scale) * 0.72;
    drawDivider(ctx, w / 2, dy, Math.min(w * 0.32, 330 * scale), scale);
    if (o.wish) {
      const fs2 = fitFont(ctx, o.wish, '"Mukta", sans-serif', 600, 44 * scale, w - 200 * scale, 14);
      ctx.font = `600 ${fs2}px "Mukta", sans-serif`;
      shadowText(ctx, o.wish, w / 2, dy + fs2 * 1.05, "#FFF4DC", 12 * scale);
    }
  }

  function drawScrims(ctx, w, h, prefs) {
    let g = ctx.createLinearGradient(0, 0, 0, h * 0.34);
    g.addColorStop(0, "rgba(10,0,4,.42)"); g.addColorStop(1, "rgba(10,0,4,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h * 0.34);
    const cy = (prefs.nameY / 100) * h;
    const top = Math.max(0, cy - h * 0.16);
    g = ctx.createLinearGradient(0, top, 0, Math.min(h, cy + h * 0.16));
    g.addColorStop(0, "rgba(10,0,4,0)"); g.addColorStop(0.5, "rgba(10,0,4,.28)"); g.addColorStop(1, "rgba(10,0,4,.05)");
    ctx.fillStyle = g; ctx.fillRect(0, top, w, h * 0.32);
  }

  function drawBrand(ctx, w, h) {
    const scale = w / W;
    ctx.save();
    ctx.globalAlpha = 0.75; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.max(11, Math.round(22 * scale))}px "Mukta", sans-serif`;
    ctx.fillStyle = "#FFE9A8"; ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 6;
    ctx.fillText("Sidto", w / 2, h - 66 * scale);
    ctx.restore();
  }

  async function render(canvas, o) {
    await ensureFonts();
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const [bg, photoImg] = await Promise.all([loadImage(o.bgUrl), loadImage(o.photo)]);
    ctx.fillStyle = "#5a1a06"; ctx.fillRect(0, 0, W, H);
    if (bg) drawCover(ctx, bg, 0, 0, W, H);
    drawScrims(ctx, W, H, o.prefs);
    drawTitleBlock(ctx, o, W, H);
    drawIdentity(ctx, Object.assign({}, o, { photoImg }), W, H);
    drawBrand(ctx, W, H);
    return { bgLoaded: !!bg };
  }

  function canvasToBlob(canvas, type, q) {
    return new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), type || "image/jpeg", q || 0.92));
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  /* Share a file if the browser supports it, otherwise download it. */
  async function shareOrDownload(blob, filename, title) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: title || "Sidto" }); return "shared"; }
      catch (e) { if (e.name === "AbortError") return "cancelled"; }
    }
    download(blob, filename);
    return "downloaded";
  }

  window.SidtoPoster = { W, H, render, loadImage, ensureFonts, drawCover, drawIdentity, drawTitleBlock, drawScrims, drawBrand, canvasToBlob, download, shareOrDownload };
})();
