/* Sidto — video wish compositor with background music.
 *
 * How it works:
 *  1. A pre-made, licensed template video plays (muted) in a hidden <video>.
 *  2. Every frame is drawn onto a <canvas> together with the user's name,
 *     photo and the festival title. What you see on the canvas IS the output.
 *  3. Music (an original MP3 from assets/music) is played through the Web
 *     Audio API. During export the same sound is routed into the recording.
 *  4. "Export" records canvas + music in real time with MediaRecorder and
 *     gives you a new video file (MP4 where the browser supports it, else WebM).
 *
 * Limits (honest):
 *  - Export needs MediaRecorder + canvas.captureStream (current Chrome for
 *    Android: yes; some WebViews and older browsers: no).
 *  - Recording happens in real time (a 12-second clip takes ~12 seconds).
 *  - Browsers only allow sound after a tap, so music starts when you tap Play.
 *  - The original template and music files are never modified.
 */
(function () {
  const P = window.SidtoPoster;
  const VW = 540, VH = 960;

  function supported(m) { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }
  function pickMime(withAudio) {
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return null;
    const list = withAudio
      ? ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "video/mp4;codecs=avc1,mp4a.40.2", "video/mp4;codecs=avc1,opus",
         "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/mp4", "video/webm"]
      : ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    return list.find(supported) || null;
  }

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const bufferCache = new Map();

  class VideoComposer {
    constructor(canvas, video) {
      this.canvas = canvas; this.video = video;
      canvas.width = VW; canvas.height = VH;
      this.ctx = canvas.getContext("2d");
      this.overlay = null; this.photoImg = null; this.running = false; this.raf = 0;
      this.onError = null; this.t0 = performance.now();
      // audio state
      this.audio = null; this.musicUrl = ""; this.musicBuffer = null; this.volume = 0.8;
      this.musicNode = null; this.musicGain = null; this.musicOn = true; this.onAudioState = null;
      video.muted = true; video.playsInline = true; video.loop = true; video.preload = "auto";
      video.setAttribute("muted", ""); video.setAttribute("playsinline", "");
      video.addEventListener("error", () => this.onError && this.onError());
    }

    static canExport() { return !!(pickMime(false) && HTMLCanvasElement.prototype.captureStream); }
    static canExportAudio() {
      return !!(AudioCtx && pickMime(true) && HTMLCanvasElement.prototype.captureStream &&
                AudioCtx.prototype.createMediaStreamDestination);
    }
    static mimeType(withAudio) { return pickMime(!!withAudio); }

    async setSource(url) {
      this.video.src = url;
      try { this.video.load(); } catch (e) {}
    }

    async setOverlay(o) {
      this.overlay = o;
      this.photoImg = o.photo ? await P.loadImage(o.photo) : null;
    }

    /* ---------- music ---------- */
    ensureAudio() {
      if (!AudioCtx) return null;
      if (!this.audio) this.audio = new AudioCtx();
      if (this.audio.state === "suspended") this.audio.resume().catch(() => {});
      return this.audio;
    }
    async loadMusic(url) {
      if (!url) return null;
      if (bufferCache.has(url)) return bufferCache.get(url);
      const ac = this.ensureAudio(); if (!ac) return null;
      const p = fetch(url).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.arrayBuffer(); })
        .then(ab => new Promise((res, rej) => ac.decodeAudioData(ab, res, rej)));
      bufferCache.set(url, p);
      try { return await p; } catch (e) { bufferCache.delete(url); throw e; }
    }
    /* url "" = no music. Starts playing if the preview is playing. */
    async setMusic(url) {
      this.musicUrl = url || "";
      this.stopMusic();
      this.musicBuffer = null;
      if (!this.musicUrl) return;
      if (!this.audio) return;                    // wait for the first tap to create the AudioContext
      try { this.musicBuffer = await this.loadMusic(this.musicUrl); }
      catch (e) { this.musicBuffer = null; if (this.onAudioState) this.onAudioState("error"); return; }
      if (!this.video.paused) this.startMusic();
    }
    setVolume(v) {
      this.volume = v;
      if (this.musicGain && this.audio) this.musicGain.gain.setTargetAtTime(v, this.audio.currentTime, 0.05);
    }
    startMusic(dest, offset) {
      this.stopMusic();
      if (!this.audio || !this.musicBuffer || !this.musicOn) return null;
      const src = this.audio.createBufferSource();
      src.buffer = this.musicBuffer; src.loop = true;
      const g = this.audio.createGain(); g.gain.value = this.volume;
      src.connect(g); g.connect(this.audio.destination);
      if (dest) g.connect(dest);
      src.start(0, offset || 0);
      this.musicNode = src; this.musicGain = g;
      if (this.onAudioState) this.onAudioState("playing");
      return g;
    }
    stopMusic() {
      if (this.musicNode) { try { this.musicNode.stop(); } catch (e) {} try { this.musicNode.disconnect(); } catch (e) {} }
      if (this.musicGain) { try { this.musicGain.disconnect(); } catch (e) {} }
      this.musicNode = null; this.musicGain = null;
    }
    /* Call from a tap handler: unlocks sound in the browser. */
    async userGesture() {
      const first = !this.audio;
      this.ensureAudio();
      if (first && this.musicUrl && !this.musicBuffer) {
        try { this.musicBuffer = await this.loadMusic(this.musicUrl); } catch (e) { if (this.onAudioState) this.onAudioState("error"); }
      }
    }

    /* ---------- drawing ---------- */
    draw() {
      const ctx = this.ctx, v = this.video, o = this.overlay;
      ctx.fillStyle = "#1a0710"; ctx.fillRect(0, 0, VW, VH);
      if (v.readyState >= 2 && v.videoWidth) P.drawCover(ctx, v, 0, 0, VW, VH);
      if (!o) return;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (performance.now() - this.t0) / 800);   // fade in once
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
      const p = this.video.play(); if (p && p.catch) p.catch(() => {});
    }
    stop() {
      this.running = false; cancelAnimationFrame(this.raf);
      try { this.video.pause(); } catch (e) {}
      this.stopMusic();
      if (this.audio) { try { this.audio.close(); } catch (e) {} this.audio = null; }
    }
    play() {
      const p = this.video.play(); if (p && p.catch) p.catch(() => {});
      if (!this.musicNode) this.startMusic();
    }
    pause() { this.video.pause(); this.stopMusic(); }
    restart() { this.t0 = performance.now(); this.video.currentTime = 0; this.stopMusic(); this.play(); }

    /* Records `seconds` of the preview (template loops if shorter), with music
       when withMusic is true and music is loaded. Resolves to a Blob. */
    exportClip(seconds, withMusic, onProgress) {
      return new Promise((resolve, reject) => {
        const useAudio = !!(withMusic && this.musicBuffer && this.audio && this.audio.createMediaStreamDestination);
        const mime = pickMime(useAudio);
        if (!mime || !this.canvas.captureStream) return reject(new Error("unsupported"));
        const v = this.video;
        const total = Math.max(3, seconds || 12);
        const vstream = this.canvas.captureStream(30);
        let dest = null, gain = null;
        const tracks = [...vstream.getVideoTracks()];
        if (useAudio) {
          dest = this.audio.createMediaStreamDestination();
          tracks.push(...dest.stream.getAudioTracks());
        }
        const stream = new MediaStream(tracks);
        let rec;
        try { rec = new MediaRecorder(stream, Object.assign({ mimeType: mime, videoBitsPerSecond: 3500000 }, useAudio ? { audioBitsPerSecond: 128000 } : {})); }
        catch (e) { return reject(e); }
        const chunks = [];
        rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        let tick = 0, timer = 0;
        rec.onstop = () => {
          clearInterval(tick); clearTimeout(timer);
          vstream.getTracks().forEach(t => t.stop());
          if (dest) dest.stream.getTracks().forEach(t => t.stop());
          this.startMusic();                       // resume normal preview sound
          const blob = new Blob(chunks, { type: mime.split(";")[0] });
          blob.size ? resolve({ blob, hasAudio: useAudio, mime }) : reject(new Error("empty recording"));
        };
        const begin = () => {
          this.t0 = performance.now();
          if (useAudio) {
            gain = this.startMusic(dest, 0);
            // gentle fade-out over the last 1.2 s
            const now = this.audio.currentTime;
            gain.gain.setValueAtTime(this.volume, now + Math.max(0, total - 1.2));
            gain.gain.linearRampToValueAtTime(0.0001, now + total);
          }
          rec.start(250);
          const p = v.play(); if (p && p.catch) p.catch(() => {});
          const startedAt = performance.now();
          tick = setInterval(() => onProgress && onProgress(Math.min(1, (performance.now() - startedAt) / (total * 1000))), 200);
          timer = setTimeout(() => { if (rec.state !== "inactive") rec.stop(); }, total * 1000);
        };
        v.loop = true; v.pause(); this.stopMusic();
        if (v.currentTime === 0) begin();
        else { v.addEventListener("seeked", begin, { once: true }); v.currentTime = 0; }
      });
    }
  }

  window.SidtoVideo = { VideoComposer, VW, VH };
})();
