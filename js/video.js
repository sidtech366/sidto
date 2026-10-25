/* Sidto — video wish compositor.
 *
 * How it works:
 *  1. A pre-made, licensed template video plays (muted) in a hidden <video>.
 *  2. Every frame is drawn onto a <canvas> together with the user's name,
 *     photo and the festival title. What you see on the canvas IS the output.
 *  3. "Export" records that canvas in real time with the browser's
 *     MediaRecorder API and gives you a new video file.
 *
 * Limits (honest):
 *  - Export only works where MediaRecorder + canvas.captureStream exist
 *    (current Chrome for Android: yes; some WebViews and older browsers: no).
 *  - The clip is silent. Template audio is not mixed in this version.
 *  - Recording happens in real time (a 6-second template takes ~6 seconds).
 *  - The original template file is never modified.
 */
(function () {
  const P = window.SidtoPoster;
  const VW = 540, VH = 960;

  function pickMime() {
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return null;
    const list = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    return list.find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || null;
  }

  class VideoComposer {
    constructor(canvas, video) {
      this.canvas = canvas; this.video = video;
      canvas.width = VW; canvas.height = VH;
      this.ctx = canvas.getContext("2d");
      this.overlay = null; this.photoImg = null; this.running = false; this.raf = 0;
      this.onError = null;
      video.muted = true; video.playsInline = true; video.loop = true; video.preload = "auto";
      video.setAttribute("muted", ""); video.setAttribute("playsinline", "");
      video.addEventListener("error", () => this.onError && this.onError());
    }

    static canExport() {
      return !!(pickMime() && HTMLCanvasElement.prototype.captureStream);
    }
    static mimeType() { return pickMime(); }

    async setSource(url) {
      this.video.src = url;
      try { this.video.load(); } catch (e) {}
    }

    async setOverlay(o) {
      this.overlay = o;
      this.photoImg = o.photo ? await P.loadImage(o.photo) : null;
    }

    draw() {
      const ctx = this.ctx, v = this.video, o = this.overlay;
      ctx.fillStyle = "#1a0710"; ctx.fillRect(0, 0, VW, VH);
      if (v.readyState >= 2 && v.videoWidth) P.drawCover(ctx, v, 0, 0, VW, VH);
      if (!o) return;
      // Fade overlays in during the first 0.8 s of every loop
      const tt = v.currentTime || 0;
      ctx.save();
      ctx.globalAlpha = Math.min(1, tt / 0.8);
      P.drawScrims(ctx, VW, VH, o.prefs);
      P.drawTitleBlock(ctx, o, VW, VH);
      P.drawIdentity(ctx, Object.assign({}, o, { photoImg: this.photoImg }), VW, VH);
      ctx.restore();
      P.drawBrand(ctx, VW, VH);
    }

    start() {
      if (this.running) return;
      this.running = true;
      const loop = () => { if (!this.running) return; this.draw(); this.raf = requestAnimationFrame(loop); };
      loop();
      this.play();
    }
    stop() { this.running = false; cancelAnimationFrame(this.raf); try { this.video.pause(); } catch (e) {} }
    play() { const p = this.video.play(); if (p && p.catch) p.catch(() => {}); }
    pause() { this.video.pause(); }
    restart() { this.video.currentTime = 0; this.play(); }

    /* Records one full pass of the template. Resolves to a Blob. */
    exportClip(onProgress) {
      return new Promise((resolve, reject) => {
        const mime = pickMime();
        if (!mime || !this.canvas.captureStream) return reject(new Error("unsupported"));
        const v = this.video;
        const duration = isFinite(v.duration) && v.duration > 0 ? v.duration : 6;
        const stream = this.canvas.captureStream(30);
        let rec;
        try { rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3000000 }); }
        catch (e) { return reject(e); }
        const chunks = [];
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onstop = () => {
          v.loop = true; clearInterval(tick); clearTimeout(safety);
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunks, { type: mime.split(";")[0] });
          blob.size ? resolve(blob) : reject(new Error("empty recording"));
        };
        const finish = () => { if (rec.state !== "inactive") rec.stop(); };
        v.loop = false;
        v.addEventListener("ended", finish, { once: true });
        const safety = setTimeout(finish, (duration + 4) * 1000);
        const tick = setInterval(() => onProgress && onProgress(Math.min(1, v.currentTime / duration)), 200);
        v.pause();
        const begin = () => { rec.start(250); this.play(); };
        if (v.currentTime === 0) begin();
        else { v.addEventListener("seeked", begin, { once: true }); v.currentTime = 0; }
      });
    }
  }

  window.SidtoVideo = { VideoComposer, VW, VH };
})();
