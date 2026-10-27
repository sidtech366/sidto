/* Sidto — main app: routing and screens.
 * Routes (after the # in the address):
 *   #/home  #/categories  #/cat/<id>  #/poster/<festivalId>
 *   #/video  #/video/<festivalId>  #/create  #/profile
 */
(function () {
  const D = window.SidtoDates, Data = window.SidtoData, Store = window.SidtoStore;
  const Poster = window.SidtoPoster, Prompt = window.SidtoPrompt, ImageService = window.SidtoImageService;
  const CFG = window.SIDTO_CONFIG;
  const view = document.getElementById("view");
  const L = () => window.I18N.lang;

  let cleanup = null;        // called when leaving a screen
  let selectedDay = null;    // home: which of the recent days is open
  let loadState = "loading"; // loading | ready | error
  let loadError = "";

  /* ---------- small helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function $(sel, root) { return (root || view).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || view).querySelectorAll(sel)); }
  let toastTimer = 0;
  function toast(msg, ms) {
    const el = document.getElementById("toast");
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), ms || 2800);
  }
  function region() { return Store.getProfile().region || ""; }
  function relLabel(iso) {
    const n = D.diffDays(D.today(), iso);
    if (n === 0) return t("today_lc");
    if (n === 1) return t("tomorrow");
    return t("in_days", { n });
  }

  /* ---------- banners ---------- */
  function renderBanners() {
    const b = document.getElementById("banners");
    const parts = [];
    if (D.override) parts.push(`<div class="banner"><span>🧪 Test date: ${esc(D.override)} (remove ?date= from the address to use today)</span></div>`);
    if (Data.usingDraft) parts.push(`<div class="banner"><span>✏️ ${esc(t("draft_banner"))}</span><button type="button" id="discardDraft">${esc(t("discard"))}</button></div>`);
    else if (Data.dataset && Data.dataset.meta && Data.dataset.meta.dataset === "SAMPLE") parts.push(`<div class="banner"><span>ℹ️ ${esc(t("sample_banner"))}</span></div>`);
    b.innerHTML = parts.join("");
    const btn = document.getElementById("discardDraft");
    if (btn) btn.onclick = async () => { Store.clearDraft(); await boot(); };
  }

  /* ---------- card ---------- */
  function card(f, opts) {
    opts = opts || {};
    const p = Store.getProfile();
    const lang = L();
    const img = Data.imageFor(f);
    const eff = f.recurrence === "once" ? (f._eff || Data.effectiveDate(f, region())) : null;
    const meta = [];
    if (eff) meta.push(`<span>📅 ${esc(D.format(eff.date, lang))}${opts.rel ? " · " + esc(relLabel(eff.date)) : ""}</span>`);
    if (eff && eff.regional) meta.push(`<span class="tag" title="${esc(eff.regional.note || "")}">${esc(t("regional_note"))}: ${esc(eff.regional.region)}</span>`);
    if (f.recurrence === "once" && f.verified === false) meta.push(`<span class="tag warn">${esc(t("unverified"))}</span>`);
    return `<article class="card">
      <button class="card-media" data-poster="${esc(f.id)}" aria-label="${esc(t("make_poster"))}: ${esc(Data.text(f.name, lang))}">
        <img class="bg" src="${esc(img)}" alt="" loading="lazy">
        <span class="card-title">${esc(Data.text(f.name, lang))}</span>
        <span class="card-user">${p.photo ? `<img src="${esc(p.photo)}" alt="">` : `<span class="ph">👤</span>`}<span>${esc(p.name || (lang === "hi" ? "आपका नाम" : "Your name"))}</span></span>
      </button>
      ${meta.length ? `<div class="card-meta">${meta.join("")}</div>` : ""}
      <div class="card-actions">
        <button class="a-poster" data-poster="${esc(f.id)}">🖼️ ${esc(t("make_poster"))}</button>
        <button class="a-video" data-video="${esc(f.id)}">🎬</button>
      </div>
    </article>`;
  }
  function bindCards(root) {
    $all("[data-poster]", root).forEach(b => b.onclick = () => { location.hash = "#/poster/" + b.dataset.poster; });
    $all("[data-video]", root).forEach(b => b.onclick = () => { location.hash = "#/video/" + b.dataset.video; });
  }
  function emptyBox(msg, icon) { return `<div class="empty"><div class="ic">${icon || "🪔"}</div><p>${esc(msg)}</p></div>`; }
  function skeletonGrid(n) { return `<div class="grid">${Array.from({ length: n || 4 }, () => '<div class="skeleton sk-card"></div>').join("")}</div>`; }

  /* ================= HOME ================= */
  function renderHome() {
    const lang = L(), today = D.today(), reg = region();
    if (!selectedDay) selectedDay = today;
    const todays = Data.itemsForDay(today, reg);
    const hero = todays.find(f => f.recurrence === "once") || todays[0];
    const days = [];
    for (let i = 0; i <= (CFG.historyDays || 5); i++) days.push(D.addDays(today, -i));
    const dayItems = Data.itemsForDay(selectedDay, reg);
    const upcoming = Data.upcoming(today, CFG.upcomingDays || 45, reg);

    view.innerHTML = `
      ${hero ? `<section class="hero" style="background-image:url('${esc(Data.imageFor(hero))}')">
        <div class="hero-body">
          <div class="hero-date">${esc(t("today"))} · ${esc(D.format(today, lang, { weekday: "long", day: "numeric", month: "long" }))}</div>
          <div class="hero-title">${esc(Data.text(hero.name, lang))}</div>
          <p class="hero-wish">${esc(Data.text(hero.wish, lang))}</p>
          <div class="hero-actions">
            <button class="btn" data-poster="${esc(hero.id)}">🖼️ ${esc(t("make_poster"))}</button>
            <button class="btn ghost" data-video="${esc(hero.id)}">🎬 ${esc(t("make_video"))}</button>
          </div>
        </div></section>` : ""}

      <section class="section">
        <div class="section-head"><h2 class="section-title">${esc(selectedDay === today ? t("todays_wishes") : t("last_days"))}</h2>
          <span class="section-sub">${esc(D.format(selectedDay, lang, { weekday: "short", day: "numeric", month: "short" }))}</span></div>
        <div class="chips" role="group" aria-label="${esc(t("last_days"))}">
          ${days.map(d => `<button class="day-chip" data-day="${d}" aria-pressed="${d === selectedDay}">
            <span class="wd">${d === today ? esc(t("today")) : esc(D.weekdayShort(d, lang))}</span>
            <span class="dn">${Number(d.slice(8))}</span><span class="mo">${esc(D.format(d, lang, { day: undefined, month: "short" }))}</span></button>`).join("")}
        </div>
        ${dayItems.length ? `<div class="grid">${dayItems.map(f => card(f)).join("")}</div>` : emptyBox(t("nothing_today"))}
      </section>

      <section class="section">
        <div class="section-head"><h2 class="section-title">${esc(t("upcoming"))}</h2></div>
        ${upcoming.length ? `<div class="hscroll">${upcoming.map(f => card(f, { rel: true })).join("")}</div>` : emptyBox(t("nothing_upcoming", { n: CFG.upcomingDays }), "📅")}
      </section>

      <section class="section">
        <div class="section-head"><h2 class="section-title">${esc(t("categories"))}</h2><a href="#/categories" class="small">→</a></div>
        ${categoryTiles()}
      </section>`;
    bindCards(view);
    $all("[data-day]").forEach(b => b.onclick = () => { selectedDay = b.dataset.day; renderHome(); });
  }

  function categoryTiles() {
    return `<div class="cat-grid">${Data.CATEGORIES.map(c => `<a class="cat-tile" href="#/cat/${c.id}"><span class="ic">${c.icon}</span>${esc(t(c.key))}</a>`).join("")}</div>`;
  }

  /* ================= CATEGORIES ================= */
  function renderCategories() {
    const lang = L();
    const tags = Data.popularTags();
    view.innerHTML = `
      <h1 class="page-title">${esc(t("categories"))}</h1>
      ${categoryTiles()}
      <section class="section"><div class="section-head"><h2 class="section-title">${esc(t("popular"))}</h2></div>
        <div class="chips">${tags.map(tg => `<a class="pill" href="#/cat/${esc(tg)}">${esc(Data.tagLabel(tg, lang))}</a>`).join("")}</div>
      </section>`;
  }

  function renderCategory(id) {
    const lang = L();
    const cat = Data.CATEGORIES.find(c => c.id === id);
    const title = cat ? t(cat.key) : Data.tagLabel(id, lang);
    const items = Data.byCategory(id, D.today(), region());
    view.innerHTML = `
      <div class="row-between"><h1 class="page-title">${cat ? cat.icon + " " : ""}${esc(title)}</h1><a class="btn small secondary" href="#/categories">← ${esc(t("back"))}</a></div>
      ${items.length ? `<div class="grid">${items.map(f => card(f, { rel: false })).join("")}</div>` : emptyBox(t("nothing_category"))}`;
    bindCards(view);
  }

  /* ================= POSTER ================= */
  function renderPoster(id) {
    const f = Data.find(id);
    if (!f) { view.innerHTML = emptyBox("Not found"); return; }
    const profile = Store.getProfile();
    const prefs = Store.getPosterPrefs();
    const theme = Data.themeFor(f);
    const custom = Store.getCustomBackground();
    let wishLang = L();
    let bgUrl = (custom && custom.forId === f.id) ? custom.dataUrl : Data.imageFor(f);
    const tpls = Data.templates("image");
    const colors = [["", "Auto"], ["#FFFFFF", ""], ["#FFE08A", ""], ["#FFD1E8", ""], ["#2B1810", ""]];

    view.innerHTML = `
      <div class="row-between"><h1 class="page-title">${esc(t("poster_title"))}</h1><a class="btn small secondary" href="#/home">← ${esc(t("back"))}</a></div>
      ${(!profile.name && !profile.photo) ? `<div class="notice warn"><p>${esc(t("set_profile_first"))}</p><a class="btn small" href="#/profile">${esc(t("go_profile"))}</a></div>` : ""}
      <div class="editor">
        <div class="preview-wrap"><canvas id="posterCanvas" width="1080" height="1350" aria-label="Poster preview"></canvas></div>
        <div>
          <div class="panel">
            <div class="btn-row">
              <button class="btn" id="btnShare">📤 ${esc(t("share"))}</button>
              <button class="btn secondary" id="btnSave">⬇️ ${esc(t("save"))}</button>
            </div>
          </div>
          <div class="panel">
            <div class="field"><span class="label">${esc(t("template"))}</span>
              <div class="thumbs" id="bgThumbs">
                ${f.imageUrl ? `<button class="thumb" data-bg="${esc(f.imageUrl)}" style="background-image:url('${esc(f.imageUrl)}')" aria-label="Festival image"></button>` : ""}
                ${tpls.map(tp => `<button class="thumb" data-bg="${esc(tp.url)}" style="background-image:url('${esc(tp.url)}')" aria-label="${esc(tp.name)}"></button>`).join("")}
                ${custom ? `<button class="thumb" data-bg="${esc(custom.dataUrl)}" style="background-image:url('${esc(custom.dataUrl)}')" aria-label="Your image"></button>` : ""}
                <label class="thumb add" aria-label="${esc(t("upload_own"))}">+<input type="file" accept="image/*" id="bgUpload" hidden></label>
              </div><small>${esc(t("upload_own_hint"))}</small>
            </div>
            <div class="field"><span class="label">${esc(t("wish_language"))}</span>
              <div class="seg" id="wishLang"><button data-v="hi">हिंदी</button><button data-v="en">English</button></div></div>
            <div class="field"><label for="rNameY">${esc(t("name_position"))}</label><input type="range" id="rNameY" min="40" max="94" value="${prefs.nameY}"></div>
            <div class="field"><label for="rFont">${esc(t("font_size"))}</label><input type="range" id="rFont" min="32" max="110" value="${prefs.fontSize}"></div>
            <div class="field"><label for="rPhoto">${esc(t("photo_size"))}</label><input type="range" id="rPhoto" min="100" max="340" value="${prefs.photoSize}"></div>
            <div class="field"><span class="label">${esc(t("photo_place"))}</span>
              <div class="seg" id="photoPlace"><button data-v="left">${esc(t("left"))}</button><button data-v="center">${esc(t("center"))}</button><button data-v="right">${esc(t("right"))}</button></div></div>
            <div class="field"><span class="label">${esc(t("text_color"))}</span>
              <div class="swatches" id="colors">${colors.map(([c, l]) => `<button class="swatch" data-c="${c}" style="background:${c || "conic-gradient(#fff,#FFE08A,#FFD1E8,#fff)"}" aria-label="${c || "Auto"}">${l ? "A" : ""}</button>`).join("")}</div></div>
            <label class="check"><input type="checkbox" id="cPhoto" ${prefs.showPhoto ? "checked" : ""}> ${esc(t("show_photo"))}</label>
            <label class="check"><input type="checkbox" id="cName" ${prefs.showName ? "checked" : ""}> ${esc(t("show_name"))}</label>
          </div>
        </div>
      </div>`;

    const canvas = $("#posterCanvas");
    let pending = false;
    function opts() {
      return { bgUrl, title: Data.text(f.name, wishLang), wish: Data.text(f.wish, wishLang), name: profile.name, tagline: profile.tagline, photo: profile.photo, prefs, theme };
    }
    function redraw() {
      if (pending) return; pending = true;
      requestAnimationFrame(async () => {
        pending = false;
        const r = await Poster.render(canvas, opts());
        if (!r.bgLoaded) toast(t("export_error"));
      });
    }
    function syncPressed() {
      $all("#bgThumbs [data-bg]").forEach(b => b.setAttribute("aria-pressed", b.dataset.bg === bgUrl));
      $all("#wishLang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === wishLang));
      $all("#photoPlace button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === prefs.photoPlace));
      $all("#colors .swatch").forEach(b => b.setAttribute("aria-pressed", b.dataset.c === (prefs.color || "")));
    }
    function savePrefs() { Store.savePosterPrefs(prefs); }

    $all("#bgThumbs [data-bg]").forEach(b => b.onclick = () => { bgUrl = b.dataset.bg; syncPressed(); redraw(); });
    $all("#wishLang button").forEach(b => b.onclick = () => { wishLang = b.dataset.v; syncPressed(); redraw(); });
    $all("#photoPlace button").forEach(b => b.onclick = () => { prefs.photoPlace = b.dataset.v; syncPressed(); savePrefs(); redraw(); });
    $all("#colors .swatch").forEach(b => b.onclick = () => { prefs.color = b.dataset.c; syncPressed(); savePrefs(); redraw(); });
    [["#rNameY", "nameY"], ["#rFont", "fontSize"], ["#rPhoto", "photoSize"]].forEach(([sel, k]) => {
      $(sel).oninput = e => { prefs[k] = Number(e.target.value); redraw(); };
      $(sel).onchange = savePrefs;
    });
    $("#cPhoto").onchange = e => { prefs.showPhoto = e.target.checked; savePrefs(); redraw(); };
    $("#cName").onchange = e => { prefs.showName = e.target.checked; savePrefs(); redraw(); };
    $("#bgUpload").onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const dataUrl = await Store.fileToResizedDataUrl(file, 1350, 0.88);
        Store.saveCustomBackground({ dataUrl, forId: f.id });
        renderPoster(id);
      } catch (err) { toast(t("photo_too_big")); }
    };

    const fname = () => `sidto-${f.id}-${Date.now()}.jpg`;
    $("#btnSave").onclick = async () => {
      try { const blob = await Poster.canvasToBlob(canvas); Poster.download(blob, fname()); toast(t("saved_ok")); }
      catch (e) { toast(t("export_error")); }
    };
    $("#btnShare").onclick = async () => {
      try {
        const blob = await Poster.canvasToBlob(canvas);
        const r = await Poster.shareOrDownload(blob, fname(), Data.text(f.name, wishLang));
        if (r === "shared") toast(t("shared_ok")); else if (r === "downloaded") toast(t("share_fallback"), 4200);
      } catch (e) { toast(t("export_error")); }
    };
    syncPressed(); redraw();
  }

  /* ================= VIDEO ================= */
  function renderVideo(id) {
    const lang = L(), today = D.today(), reg = region();
    const profile = Store.getProfile();
    const pub = Data.dataset.festivals.filter(f => Data.isVisible(f));
    const todays = Data.itemsForDay(today, reg).map(f => f.id);
    pub.sort((a, b) => (todays.includes(b.id) - todays.includes(a.id)));
    let f = (id && Data.find(id)) || Data.find(todays[0]) || pub[0];
    const vids = Data.templates("video");
    const tracks = Data.templates("audio");
    let tplId = (f && f.videoTemplateId && Data.template(f.videoTemplateId)) ? f.videoTemplateId : (vids[0] && vids[0].id);
    const defaultMusic = () => {
      const tpl = Data.template(tplId) || {};
      const m = (f && f.musicId && Data.template(f.musicId)) ? f.musicId : (tpl.musicId && Data.template(tpl.musicId) ? tpl.musicId : (tracks[0] && tracks[0].id));
      return m || "";
    };
    let musicId = defaultMusic();
    let musicTouched = false;
    let seconds = 12;
    const prefs = Object.assign(Store.getPosterPrefs(), { nameY: 83, fontSize: 70, photoSize: 190 });
    const VC = window.SidtoVideo.VideoComposer;
    const canExport = VC.canExport();
    const canAudio = VC.canExportAudio();

    view.innerHTML = `
      <h1 class="page-title">${esc(t("video_title"))}</h1>
      <p class="page-intro">${esc(t("video_intro"))}</p>
      ${(!profile.name && !profile.photo) ? `<div class="notice warn"><p>${esc(t("set_profile_first"))}</p><a class="btn small" href="#/profile">${esc(t("go_profile"))}</a></div>` : ""}
      ${!vids.length ? emptyBox(t("video_error"), "🎬") : `
      <div class="editor">
        <div class="preview-wrap video"><canvas id="vCanvas" aria-label="Video preview"></canvas>
          <video id="vSrc" hidden></video></div>
        <div>
          <div class="panel">
            <div class="btn-row">
              <button class="btn small" id="vPlay">▶️ ${esc(t("play_music"))}</button>
              <button class="btn secondary small" id="vRestart">⏮️ ${esc(t("restart"))}</button>
            </div>
            <p class="small muted" id="vAudioHint">🔊 ${esc(t("music_hint"))}</p>
            <hr class="soft">
            <div class="field"><span class="label">${esc(t("video_length"))}</span>
              <div class="seg" id="vLen"><button data-v="6">6 s</button><button data-v="12">12 s</button><button data-v="18">18 s</button></div></div>
            <button class="btn block" id="vExport" ${canExport ? "" : "disabled"}>🎞️ ${esc(t("export_video"))}</button>
            <p class="small muted" id="vStatus">${esc(canExport ? (canAudio ? t("video_note") : t("video_note_silent")) : t("video_export_unsupported"))}</p>
            <div id="vResult"></div>
          </div>
          <div class="panel">
            <div class="field"><label for="vWish">${esc(t("video_choose"))}</label>
              <select id="vWish">${pub.map(x => `<option value="${esc(x.id)}" ${x.id === (f && f.id) ? "selected" : ""}>${todays.includes(x.id) ? "⭐ " : ""}${esc(Data.text(x.name, lang))}</option>`).join("")}</select></div>
            <div class="field"><label for="vTpl">${esc(t("video_template"))}</label>
              <select id="vTpl">${vids.map(v => `<option value="${esc(v.id)}" ${v.id === tplId ? "selected" : ""}>${esc(v.name)}</option>`).join("")}</select>
              <small id="vLicense"></small></div>
            <div class="field"><label for="vMusic">🎵 ${esc(t("music"))}</label>
              <select id="vMusic"><option value="">${esc(t("no_music"))}</option>${tracks.map(a => `<option value="${esc(a.id)}">${esc(Data.text(a.label, lang) || a.name)}</option>`).join("")}</select>
              <small id="vMusicLicense"></small></div>
            <div class="field"><label for="vVol">🔉 ${esc(t("volume"))}</label><input type="range" id="vVol" min="0" max="100" value="80"></div>
            <div class="field"><label for="vNameY">${esc(t("name_position"))}</label><input type="range" id="vNameY" min="40" max="92" value="${prefs.nameY}"></div>
            <div class="field"><label for="vFont">${esc(t("font_size"))}</label><input type="range" id="vFont" min="36" max="110" value="${prefs.fontSize}"></div>
            <div class="field"><span class="label">${esc(t("photo_place"))}</span>
              <div class="seg" id="vPlace"><button data-v="left">${esc(t("left"))}</button><button data-v="center">${esc(t("center"))}</button><button data-v="right">${esc(t("right"))}</button></div></div>
          </div>
        </div>
      </div>`}`;
    if (!vids.length) return;

    const comp = new VC($("#vCanvas"), $("#vSrc"));
    const vEl = $("#vSrc");
    comp.onError = () => { if (!$("#vStatus")) return; $("#vStatus").innerHTML = `<span class="notice err" style="display:block">${esc(t("video_error"))}</span>`; };
    comp.onAudioState = s => {
      const h = $("#vAudioHint"); if (!h) return;
      if (s === "error") h.textContent = "⚠️ " + t("music_error");
      if (s === "playing") h.textContent = "🔊 " + t("music_playing");
    };
    async function applyOverlay() {
      const theme = Data.themeFor(Object.assign({}, f, { templateId: tplId }));
      await comp.setOverlay({ title: Data.text(f.name, lang), wish: Data.text(f.wish, lang), name: profile.name, tagline: profile.tagline, photo: profile.photo, prefs, theme });
    }
    function applyTemplate() {
      const tpl = Data.template(tplId);
      $("#vLicense").textContent = tpl && tpl.license ? "© " + tpl.license : "";
      comp.setSource(tpl.url);
      const p = vEl.play(); if (p && p.catch) p.catch(() => {});
      $("#vResult").innerHTML = "";
    }
    function applyMusic() {
      $("#vMusic").value = musicId;
      const a = Data.template(musicId);
      $("#vMusicLicense").textContent = a && a.license ? "© " + a.license : "";
      comp.setMusic(a ? a.url : "");
    }
    function syncPlace() { $all("#vPlace button").forEach(b => b.setAttribute("aria-pressed", b.dataset.v === prefs.photoPlace)); }
    function syncLen() { $all("#vLen button").forEach(b => b.setAttribute("aria-pressed", Number(b.dataset.v) === seconds)); }
    function syncPlayBtn() { const pb = $("#vPlay"); if (!pb) return; pb.innerHTML = vEl.paused ? "▶️ " + esc(t("play_music")) : "⏸️ " + esc(t("pause")); }

    $("#vWish").onchange = e => {
      f = Data.find(e.target.value);
      if (f.videoTemplateId && Data.template(f.videoTemplateId)) { tplId = f.videoTemplateId; $("#vTpl").value = tplId; applyTemplate(); }
      if (!musicTouched) { musicId = defaultMusic(); applyMusic(); }
      applyOverlay();
    };
    $("#vTpl").onchange = e => { tplId = e.target.value; applyTemplate(); if (!musicTouched) { musicId = defaultMusic(); applyMusic(); } applyOverlay(); };
    $("#vMusic").onchange = async e => { musicTouched = true; musicId = e.target.value; await comp.userGesture(); applyMusic(); };
    $("#vVol").oninput = e => comp.setVolume(Number(e.target.value) / 100);
    $("#vNameY").oninput = e => { prefs.nameY = Number(e.target.value); };
    $("#vFont").oninput = e => { prefs.fontSize = Number(e.target.value); };
    $all("#vPlace button").forEach(b => b.onclick = () => { prefs.photoPlace = b.dataset.v; syncPlace(); });
    $all("#vLen button").forEach(b => b.onclick = () => { seconds = Number(b.dataset.v); syncLen(); });
    $("#vPlay").onclick = async () => {
      await comp.userGesture();
      if (vEl.paused || !comp.musicNode) { if (!comp.musicBuffer && musicId) await comp.setMusic(Data.template(musicId).url); comp.play(); }
      else comp.pause();
      syncPlayBtn();
    };
    $("#vRestart").onclick = async () => { await comp.userGesture(); if (!comp.musicBuffer && musicId) await comp.setMusic(Data.template(musicId).url); comp.restart(); syncPlayBtn(); };
    vEl.addEventListener("play", syncPlayBtn); vEl.addEventListener("pause", syncPlayBtn);
    $("#vExport").onclick = async () => {
      const btn = $("#vExport"), status = $("#vStatus");
      btn.disabled = true; $("#vResult").innerHTML = "";
      status.textContent = t("exporting");
      try {
        await comp.userGesture();
        if (musicId && !comp.musicBuffer) await comp.setMusic(Data.template(musicId).url);
        const r = await comp.exportClip(seconds, !!musicId, p => { status.textContent = t("exporting") + " " + Math.round(p * 100) + "%"; });
        const blob = r.blob;
        const ext = blob.type.includes("mp4") ? "mp4" : "webm";
        const url = URL.createObjectURL(blob);
        const name = `sidto-${f.id}-${Date.now()}.${ext}`;
        const soundNote = r.hasAudio ? "🔊 " + t("with_music") : "🔇 " + t("without_music");
        status.textContent = t("video_export_ok") + ` (${ext.toUpperCase()}, ${seconds} s, ${(blob.size / 1024 / 1024).toFixed(1)} MB, ${soundNote})`;
        if (ext === "webm") status.textContent += " " + t("webm_note");
        $("#vResult").innerHTML = `<video class="exported" src="${url}" controls playsinline></video>
          <div class="btn-row" style="margin-top:10px"><button class="btn" id="vShare">📤 ${esc(t("share"))}</button><button class="btn secondary" id="vSave">⬇️ ${esc(t("save"))}</button></div>`;
        $("#vSave").onclick = () => { Poster.download(blob, name); toast(t("saved_ok")); };
        $("#vShare").onclick = async () => { const rr = await Poster.shareOrDownload(blob, name, Data.text(f.name, lang)); if (rr === "downloaded") toast(t("share_fallback"), 4200); };
      } catch (e) {
        status.textContent = (e && e.message === "unsupported") ? t("video_export_unsupported") : (t("export_error") + " " + (e && e.message ? "(" + e.message + ")" : ""));
      } finally { btn.disabled = false; syncPlayBtn(); }
    };

    syncPlace(); syncLen(); applyTemplate(); applyMusic();
    applyOverlay().then(() => comp.start());
    cleanup = () => { vEl.removeEventListener("play", syncPlayBtn); vEl.removeEventListener("pause", syncPlayBtn); comp.onAudioState = null; comp.onError = null; comp.stop(); };
  }

  /* ================= AI CREATE ================= */
  let lastGenerated = null;
  function renderCreate() {
    const lang = L();
    const pub = Data.dataset.festivals.filter(f => Data.isVisible(f) || f.status === "draft");
    const deities = Array.from(new Set(Data.dataset.festivals.map(f => Data.text(f.deity, lang)).filter(Boolean)));
    const configured = ImageService.isConfigured();
    view.innerHTML = `
      <div class="row-between"><h1 class="page-title">${esc(t("create_title"))}</h1>
        <span class="status-dot ${configured ? "on" : "off"}">${configured ? "AI provider: connected" : "AI provider: not connected"}</span></div>
      <p class="page-intro">${esc(t("create_intro"))}</p>
      <div class="editor">
        <div class="panel">
          <div class="field"><label for="cOcc">${esc(t("occasion"))}</label>
            <select id="cOcc">${pub.map(f => `<option value="${esc(f.id)}">${esc(Data.text(f.name, lang))}</option>`).join("")}<option value="__custom">✏️ Other…</option></select>
            <input type="text" id="cOccCustom" placeholder="e.g. Tulsi Vivah" hidden></div>
          <div class="field"><label for="cSub">${esc(t("subject"))}</label>
            <select id="cSub">${deities.map(d => `<option>${esc(d)}</option>`).join("")}<option value="__custom">✏️ Other…</option></select>
            <input type="text" id="cSubCustom" placeholder="e.g. Tulsi Mata" hidden></div>
          <div class="field"><label for="cStyle">${esc(t("art_style"))}</label>
            <select id="cStyle">${Prompt.STYLES.map(s => `<option value="${s}">${esc(t("style_" + s))}</option>`).join("")}</select></div>
          <div class="field"><label for="cAspect">${esc(t("aspect"))}</label>
            <select id="cAspect"><option value="portrait">${esc(t("portrait"))}</option><option value="square">${esc(t("square"))}</option><option value="story">${esc(t("story"))}</option></select></div>
          <div class="field"><label for="cDesc">${esc(t("custom_desc"))}</label><textarea id="cDesc" data-i18n-ph="custom_placeholder"></textarea></div>
          <label class="check"><input type="checkbox" id="cSpace" checked> ${esc(t("text_in_image"))}</label>
          <div class="btn-row" style="margin-top:12px">
            <button class="btn secondary" id="cBuild">📝 ${esc(t("build_prompt"))}</button>
            <button class="btn" id="cGen">✨ ${esc(t("generate"))}</button>
          </div>
        </div>
        <div>
          <div class="panel" id="cPromptPanel" hidden>
            <div class="row-between"><strong>${esc(t("prompt_label"))}</strong><button class="btn small secondary" id="cCopy">📋 ${esc(t("copy"))}</button></div>
            <div class="prompt-box" id="cPrompt"></div>
            <p class="small muted" id="cNeg"></p>
          </div>
          <div id="cResult"></div>
          <div class="panel">
            <div class="field"><span class="label">${esc(t("upload_own"))}</span>
              <input type="file" accept="image/*" id="cUpload"><small>${esc(t("upload_own_hint"))}</small></div>
          </div>
        </div>
      </div>`;
    window.I18N.apply(view);

    const occSel = $("#cOcc"), subSel = $("#cSub");
    function syncDeity() {
      const f = Data.find(occSel.value);
      if (f) { const d = Data.text(f.deity, lang); if ([...subSel.options].some(o => o.value === d || o.text === d)) subSel.value = d; }
      $("#cOccCustom").hidden = occSel.value !== "__custom";
    }
    occSel.onchange = syncDeity;
    subSel.onchange = () => { $("#cSubCustom").hidden = subSel.value !== "__custom"; };
    syncDeity();

    function currentPrompt() {
      const f = Data.find(occSel.value);
      const occasion = occSel.value === "__custom" ? $("#cOccCustom").value.trim() : (f ? Data.text(f.name, "en") : "");
      const subject = subSel.value === "__custom" ? $("#cSubCustom").value.trim() : (f && Data.text(f.deity, lang) === subSel.value ? Data.text(f.deity, "en") : subSel.value);
      return Prompt.build({ occasion, subject, style: $("#cStyle").value, aspect: $("#cAspect").value, custom: $("#cDesc").value, leaveSpace: $("#cSpace").checked, basePrompt: f ? f.aiPrompt : "" });
    }
    function showPrompt() {
      const p = currentPrompt();
      $("#cPromptPanel").hidden = false;
      $("#cPrompt").textContent = p.prompt;
      $("#cNeg").textContent = "Negative prompt: " + p.negative;
      return p;
    }
    $("#cBuild").onclick = showPrompt;
    $("#cCopy").onclick = async () => {
      try { await navigator.clipboard.writeText($("#cPrompt").textContent); toast(t("copied")); }
      catch (e) { const r = document.createRange(); r.selectNodeContents($("#cPrompt")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Long-press to copy"); }
    };
    $("#cGen").onclick = async () => {
      const p = showPrompt();
      const btn = $("#cGen"), out = $("#cResult");
      btn.disabled = true; btn.textContent = t("generating");
      out.innerHTML = configured ? `<div class="panel"><div class="skeleton" style="aspect-ratio:4/5"></div></div>` : "";
      const r = await ImageService.generate({ prompt: p.prompt, negative: p.negative, aspect: $("#cAspect").value });
      btn.disabled = false; btn.textContent = "✨ " + t("generate");
      if (r.status === "not_configured") {
        out.innerHTML = `<div class="notice warn"><h3>⚠️ ${esc(t("not_configured_title"))}</h3><p>${esc(t("not_configured_text"))}</p></div>`;
      } else if (r.status === "error") {
        out.innerHTML = `<div class="notice err"><p>${esc(t("gen_failed"))} ${esc(r.error)}</p></div>`;
      } else {
        lastGenerated = r.image;
        out.innerHTML = `<div class="panel"><p class="notice ok">${esc(t("gen_ok"))}</p><img class="result-img" src="${esc(r.image)}" alt="Generated image">
          <div class="btn-row" style="margin-top:10px"><button class="btn" id="cUse">🖼️ ${esc(t("use_in_poster"))}</button>
          <button class="btn secondary" id="cSaveG" ${ImageService.canSaveToGallery() ? "" : "disabled"}>💾 ${esc(t("save_gallery"))}</button></div>
          ${ImageService.canSaveToGallery() ? "" : `<p class="small muted">${esc(t("save_gallery_unavailable"))}</p>`}</div>`;
        $("#cUse").onclick = () => useImage(r.image);
      }
    };
    async function useImage(src) {
      let dataUrl = src;
      if (!/^data:/.test(src)) {
        // Remote URL: draw it once to make a local copy (works only if the host allows CORS)
        const img = await Poster.loadImage(src);
        if (img) { try { const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext("2d").drawImage(img, 0, 0); dataUrl = c.toDataURL("image/jpeg", .9); } catch (e) {} }
      }
      const fallback = Data.itemsForDay(D.today(), region())[0] || Data.dataset.festivals[0];
      const id = occSel.value === "__custom" ? fallback.id : occSel.value;
      Store.saveCustomBackground({ dataUrl, forId: id });
      location.hash = "#/poster/" + id;
    }
    $("#cUpload").onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try { const d = await Store.fileToResizedDataUrl(file, 1350, .88); useImage(d); }
      catch (err) { toast(t("photo_too_big")); }
    };
  }

  /* ================= PROFILE ================= */
  function renderProfile() {
    const p = Store.getProfile();
    const regions = Data.regions();
    view.innerHTML = `
      <h1 class="page-title">${esc(t("profile_title"))}</h1>
      <div class="panel">
        <div class="field"><span class="label">${esc(t("photo"))}</span>
          <div class="avatar-edit">
            ${p.photo ? `<img class="avatar" id="pAvatar" src="${esc(p.photo)}" alt="">` : `<span class="avatar" id="pAvatar">👤</span>`}
            <div class="btn-row" style="flex:1">
              <label class="btn small">📷 ${esc(t("choose_photo"))}<input type="file" accept="image/*" id="pPhoto" hidden></label>
              ${p.photo ? `<button class="btn small danger" id="pRemove">${esc(t("remove_photo"))}</button>` : ""}
            </div>
          </div></div>
        <div class="field"><label for="pName">${esc(t("display_name"))}</label><input type="text" id="pName" maxlength="40" value="${esc(p.name)}" data-i18n-ph="name_placeholder" autocomplete="name"></div>
        <div class="field"><label for="pTag">${esc(t("tagline_label"))}</label><input type="text" id="pTag" maxlength="50" value="${esc(p.tagline)}" data-i18n-ph="tagline_placeholder"></div>
        <div class="field"><label for="pRegion">${esc(t("region"))}</label>
          <select id="pRegion"><option value="">${esc(t("region_all"))}</option>${regions.map(r => `<option ${r === p.region ? "selected" : ""}>${esc(r)}</option>`).join("")}</select></div>
        <div class="field"><label for="pLang">${esc(t("language"))}</label>
          <select id="pLang"><option value="hi" ${L() === "hi" ? "selected" : ""}>हिंदी</option><option value="en" ${L() === "en" ? "selected" : ""}>English</option></select></div>
        <button class="btn block" id="pSave">💾 ${esc(t("save_profile"))}</button>
      </div>
      <div class="notice info"><h3>🔒 ${esc(t("privacy_title"))}</h3><p>${esc(t("privacy_text"))}</p>
        <button class="btn small danger" id="pClear">${esc(t("clear_all"))}</button></div>
      <div class="notice info"><h3>ℹ️ ${esc(t("about"))}</h3>
        <p class="small">Sidto prototype v0.1 · Festival data: ${esc((Data.dataset.meta && Data.dataset.meta.dataset) || "")} (${Data.dataset.festivals.length} records). Templates are original artwork made for this project.</p>
        <a class="btn small secondary" href="admin.html">🛠️ ${esc(t("admin_link"))}</a></div>`;
    window.I18N.apply(view);

    let photo = p.photo;
    $("#pPhoto").onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try {
        photo = await Store.fileToResizedDataUrl(file, 512, 0.85);
        const av = $("#pAvatar");
        av.outerHTML = `<img class="avatar" id="pAvatar" src="${photo}" alt="">`;
      } catch (err) { toast(t("photo_too_big")); }
    };
    const rm = $("#pRemove"); if (rm) rm.onclick = () => { photo = ""; $("#pAvatar").outerHTML = `<span class="avatar" id="pAvatar">👤</span>`; rm.remove(); };
    $("#pSave").onclick = () => {
      const next = { name: $("#pName").value.trim(), tagline: $("#pTag").value.trim(), photo, region: $("#pRegion").value };
      if (!Store.saveProfile(next)) { toast("Storage is full — try a smaller photo."); return; }
      const newLang = $("#pLang").value;
      if (newLang !== L()) { window.I18N.set(newLang); syncLangButtons(); }
      toast(t("profile_saved"));
      route();
    };
    $("#pClear").onclick = () => {
      if (!confirm(t("confirm_clear"))) return;
      Store.clearAll(); toast(t("cleared")); boot();
    };
  }

  /* ---------- router ---------- */
  function setNav(name) {
    document.querySelectorAll(".bottom-nav a").forEach(a => {
      if (a.dataset.route === name) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  function route() {
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    const [, name = "home", arg] = (location.hash || "#/home").split("/");
    renderBanners();
    if (loadState === "loading") { setNav(name); view.innerHTML = `<p class="muted">${esc(t("loading"))}</p>${skeletonGrid(4)}`; return; }
    if (loadState === "error") {
      view.innerHTML = `<div class="notice err"><p>${esc(t("load_error"))}</p><p class="small">${esc(loadError)}</p><button class="btn" id="retry">${esc(t("retry"))}</button></div>`;
      $("#retry").onclick = boot; return;
    }
    const navName = { cat: "categories", poster: "home" }[name] || name;
    setNav(navName);
    try {
      if (name === "categories") renderCategories();
      else if (name === "cat") renderCategory(decodeURIComponent(arg || ""));
      else if (name === "poster") renderPoster(decodeURIComponent(arg || ""));
      else if (name === "video") renderVideo(arg ? decodeURIComponent(arg) : "");
      else if (name === "create") renderCreate();
      else if (name === "profile") renderProfile();
      else renderHome();
    } catch (e) {
      console.error(e);
      view.innerHTML = `<div class="notice err"><p>Something went wrong on this screen.</p><p class="small">${esc(e.message)}</p><a class="btn" href="#/home">🏠</a></div>`;
    }
    window.scrollTo(0, 0);
  }

  function syncLangButtons() {
    document.querySelectorAll(".lang-toggle button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === L()));
  }
  document.querySelectorAll(".lang-toggle button").forEach(b => b.onclick = () => { window.I18N.set(b.dataset.lang); syncLangButtons(); route(); });

  async function boot() {
    loadState = "loading"; route();
    try { await Data.load(); loadState = "ready"; }
    catch (e) { loadState = "error"; loadError = e.message || String(e); }
    route();
  }

  window.addEventListener("hashchange", route);
  window.I18N.apply(); syncLangButtons();
  boot();

  // Offline support (only on https or localhost)
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
