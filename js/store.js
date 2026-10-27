/* Sidto — local storage for the prototype.
 *
 * IMPORTANT: localStorage lives only in this browser on this device.
 *  - It does not sync to other phones.
 *  - It is cleared if the user clears browser/app data.
 *  - Anyone holding the unlocked phone can read it.
 *  - It is NOT an account and NOT authentication.
 */
(function () {
  const KEYS = {
    profile: "sidto.profile",
    draft: "sidto.adminDraft",
    lang: "sidto.lang",
    posterPrefs: "sidto.posterPrefs",
    customBg: "sidto.customBackground"
  };

  function read(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { console.warn("Storage full or blocked", e); return false; }
  }

  /* Shrinks a photo on the phone itself (no upload) so it fits in storage. */
  function fileToResizedDataUrl(file, maxSize, quality) {
    maxSize = maxSize || 512; quality = quality || 0.85;
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) return reject(new Error("not-image"));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode")); };
      img.src = url;
    });
  }

  window.SidtoStore = {
    KEYS,
    getProfile() { return Object.assign({ name: "", tagline: "", photo: "", region: "" }, read(KEYS.profile, {})); },
    saveProfile(p) { return write(KEYS.profile, p); },
    getPosterPrefs() { return Object.assign({ nameY: 85, fontSize: 64, photoSize: 190, photoPlace: "left", color: "", showPhoto: true, showName: true }, read(KEYS.posterPrefs, {})); },
    savePosterPrefs(p) { return write(KEYS.posterPrefs, p); },
    getDraft() { return read(KEYS.draft, null); },
    saveDraft(d) { return write(KEYS.draft, d); },
    clearDraft() { try { localStorage.removeItem(KEYS.draft); } catch (e) {} },
    getCustomBackground() { return read(KEYS.customBg, null); },
    saveCustomBackground(v) { return v ? write(KEYS.customBg, v) : (localStorage.removeItem(KEYS.customBg), true); },
    clearAll() {
      try { Object.values(KEYS).forEach(k => localStorage.removeItem(k)); } catch (e) {}
    },
    fileToResizedDataUrl
  };
})();
