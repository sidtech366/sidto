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

  function drawCirclePhoto(ctx, img, cx, cy, r, ring) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = ring || "#FFB020"; ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 18; ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    if (img) drawCover(ctx, img, cx - r, cy - r, r * 2, r * 2);
    else { ctx.fillStyle = "#ffffff33"; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); }
    ctx.restore();
  }

  function fitFont(ctx, text, family, weight, size, maxWidth, minSize) {
    let s = size;
    do { ctx.font = `${weight} ${s}px ${family}`; if (ctx.measureText(text).width <= maxWidth) break; s -= 2; } while (s > (minSize || 18));
    return s;
  }

  function shadowText(ctx, text, x, y, color, blur) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = blur || 14; ctx.shadowOffsetY = 3;
    ctx.fillStyle = color; ctx.fillText(text, x, y);
    ctx.restore();
  }

  /* Draws the name + photo block. Shared by posters and video frames. */
  function drawIdentity(ctx, o, w, h) {
    const p = o.prefs, scale = w / W;
    const color = p.color || o.theme.textColor;
    const r = (p.photoSize / 2) * scale;
    const showPhoto = p.showPhoto && o.photoImg;
    const showName = p.showName && o.name;
    if (!showPhoto && !showName) return;
    const cy = (p.nameY / 100) * h;
    const pad = 54 * scale;
    let fs = p.fontSize * scale;
    ctx.textBaseline = "middle";

    if (p.photoPlace === "center") {
      const py = showName ? cy - r - 20 * scale : cy;
      if (showPhoto) drawCirclePhoto(ctx, o.photoImg, w / 2, py, r, o.theme.accent);
      if (showName) {
        ctx.textAlign = "center";
        fs = fitFont(ctx, o.name, '"Mukta", sans-serif', 800, fs, w - pad * 2);
        const ny = showPhoto ? py + r + fs * 0.75 : cy;
        shadowText(ctx, o.name, w / 2, ny, color);
        if (o.tagline) { ctx.font = `600 ${Math.round(fs * 0.5)}px "Mukta", sans-serif`; shadowText(ctx, o.tagline, w / 2, ny + fs * 0.85, color, 10); }
      }
      return;
    }
    const left = p.photoPlace !== "right";
    const px = left ? pad + r : w - pad - r;
    if (showPhoto) drawCirclePhoto(ctx, o.photoImg, px, cy, r, o.theme.accent);
    if (showName) {
      const tx = showPhoto ? (left ? px + r + 34 * scale : px - r - 34 * scale) : (left ? pad : w - pad);
      const maxW = showPhoto ? w - pad * 2 - r * 2 - 34 * scale : w - pad * 2;
      ctx.textAlign = left ? "left" : "right";
      fs = fitFont(ctx, o.name, '"Mukta", sans-serif', 800, fs, maxW);
      const hasTag = !!o.tagline;
      shadowText(ctx, o.name, tx, hasTag ? cy - fs * 0.32 : cy, color);
      if (hasTag) {
        const ts = fitFont(ctx, o.tagline, '"Mukta", sans-serif', 600, Math.round(fs * 0.5), maxW, 14);
        ctx.font = `600 ${ts}px "Mukta", sans-serif`;
        shadowText(ctx, o.tagline, tx, cy + fs * 0.5, color, 10);
      }
    }
  }

  function drawTitleBlock(ctx, o, w, h) {
    const scale = w / W, color = o.theme.textColor;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    if (o.title) {
      const fs = fitFont(ctx, o.title, '"Yatra One", serif', 400, 104 * scale, w - 100 * scale);
      ctx.font = `400 ${fs}px "Yatra One", serif`;
      shadowText(ctx, o.title, w / 2, 150 * scale * (h / w > 1.5 ? 1.25 : 1), color, 20);
    }
    if (o.wish) {
      const fs2 = fitFont(ctx, o.wish, '"Mukta", sans-serif', 600, 46 * scale, w - 120 * scale, 16);
      ctx.font = `600 ${fs2}px "Mukta", sans-serif`;
      shadowText(ctx, o.wish, w / 2, (150 + 92) * scale * (h / w > 1.5 ? 1.25 : 1), color, 12);
    }
  }

  function drawScrims(ctx, w, h, prefs) {
    let g = ctx.createLinearGradient(0, 0, 0, h * 0.3);
    g.addColorStop(0, "rgba(0,0,0,.38)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h * 0.3);
    const cy = (prefs.nameY / 100) * h;
    const top = Math.max(0, cy - h * 0.2);
    g = ctx.createLinearGradient(0, top, 0, Math.min(h, cy + h * 0.2));
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.5, "rgba(0,0,0,.38)"); g.addColorStop(1, "rgba(0,0,0,.1)");
    ctx.fillStyle = g; ctx.fillRect(0, top, w, h * 0.4);
  }

  function drawBrand(ctx, w, h) {
    const scale = w / W;
    ctx.save();
    ctx.globalAlpha = 0.7; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.font = `700 ${Math.round(24 * scale)}px "Mukta", sans-serif`;
    ctx.fillStyle = "#fff"; ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 6;
    ctx.fillText("Sidto", w - 24 * scale, h - 18 * scale);
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
