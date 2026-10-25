/* Sidto — image generation service adapter.
 *
 * The frontend NEVER talks to an AI provider directly and NEVER holds
 * an API key. It only calls YOUR backend (config.imageApiUrl), which
 * holds the key as a server-side secret.
 *
 * Backend contract (see backend/cloudflare-worker/worker.js):
 *   POST imageApiUrl
 *   body:  { "prompt": "...", "negative": "...", "aspect": "portrait" }
 *   reply: { "ok": true, "image": "data:image/png;base64,..." }  or
 *          { "ok": true, "imageUrl": "https://..." }             or
 *          { "ok": false, "error": "human readable reason" }
 */
(function () {
  const CFG = window.SIDTO_CONFIG;

  const ImageService = {
    isConfigured() { return !!(CFG.imageApiUrl && /^https:\/\//.test(CFG.imageApiUrl)); },
    canSaveToGallery() { return !!(CFG.imageSaveUrl && /^https:\/\//.test(CFG.imageSaveUrl)); },

    /* Returns { status: "not_configured" | "ok" | "error", image?, error? } */
    async generate(req) {
      if (!this.isConfigured()) return { status: "not_configured" };
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 90000);
      try {
        const res = await fetch(CFG.imageApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: req.prompt, negative: req.negative, aspect: req.aspect }),
          signal: ctrl.signal
        });
        let body = null;
        try { body = await res.json(); } catch (e) {}
        if (!res.ok || !body || body.ok === false) {
          const msg = (body && body.error) || ("HTTP " + res.status + (res.status === 429 ? " (limit reached — try later)" : ""));
          return { status: "error", error: msg };
        }
        const image = body.image || body.imageUrl;
        if (!image) return { status: "error", error: "The backend replied without an image." };
        return { status: "ok", image };
      } catch (e) {
        return { status: "error", error: e.name === "AbortError" ? "Timed out after 90 seconds." : (e.message || "Network error") };
      } finally { clearTimeout(timer); }
    },

    async saveToGallery(payload) {
      if (!this.canSaveToGallery()) return { status: "not_configured" };
      // Intentionally not implemented in the prototype: saving needs an
      // authenticated admin backend. See README → "Roadmap".
      return { status: "not_configured" };
    }
  };

  window.SidtoImageService = ImageService;
})();
