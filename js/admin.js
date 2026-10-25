/* Sidto — admin prototype (DEMO ONLY).
 *
 * There is NO security here. Anyone who opens admin.html can use it,
 * and it can only change data inside their own browser. Real publishing
 * happens when you export festivals.json and upload it to GitHub (only
 * people with access to your GitHub repo can do that). For a real admin
 * panel with login, see README → "Securing the admin panel".
 */
(function () {
  const D = window.SidtoDates, Store = window.SidtoStore, Data = window.SidtoData, Poster = window.SidtoPoster;
  const root = document.getElementById("admin");
  const CATS = Data.CATEGORIES.map(c => c.id);
  const RECUR = ["once", "daily", "weekly", "anytime"];
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let work = null;        // working copy of the dataset
  let tab = "festivals";
  let editing = null;     // record being edited (copy)
  let isNew = false;
  let filter = { q: "", status: "all" };

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = s => root.querySelector(s);
  const $all = s => Array.from(root.querySelectorAll(s));
  let tt = 0;
  function toast(m) { const el = document.getElementById("toast"); el.textContent = m; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 2600); }
  const clone = o => JSON.parse(JSON.stringify(o));
  const tplById = id => (work.templates || []).find(t => t.id === id);
  function imageOf(f) { if (f.imageUrl) return f.imageUrl; const t = tplById(f.templateId); return t ? t.url : ""; }
  function persist() {
    work.meta = Object.assign({}, work.meta, { updatedAt: D.today() });
    if (!Store.saveDraft(work)) toast("Browser storage is full. Remove uploaded images or export now.");
  }
  function slug(s) { return String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "record"; }

  /* ---------- validation ---------- */
  function issues() {
    const out = [], ids = new Set();
    work.festivals.forEach(f => {
      if (ids.has(f.id)) out.push(`Duplicate id "${f.id}"`); ids.add(f.id);
      if (!f.name || !f.name.en || !f.name.hi) out.push(`${f.id}: needs both English and Hindi names`);
      if (f.recurrence === "once" && !D.isValid(f.date)) out.push(`${f.id}: missing or invalid date`);
      if (f.endDate && f.date && f.endDate < f.date) out.push(`${f.id}: end date is before start date`);
      if (f.recurrence === "weekly" && !(f.weekday >= 0 && f.weekday <= 6)) out.push(`${f.id}: weekly record needs a weekday`);
      if (f.templateId && !tplById(f.templateId)) out.push(`${f.id}: template "${f.templateId}" does not exist`);
      if (f.status === "published" && f.recurrence === "once" && !f.verified) out.push(`${f.id}: published but date not verified`);
      (f.regional || []).forEach(r => { if (!D.isValid(r.date)) out.push(`${f.id}: regional date for "${r.region}" is invalid`); });
    });
    return out;
  }

  /* ---------- screens ---------- */
  function render() {
    root.innerHTML = `
      <div class="notice warn" style="margin-top:12px">
        <h3>How publishing works in this prototype</h3>
        <p>1. Edit records here (saved in this browser only). 2. Open the app — it shows a banner while it uses your local edits. 3. When happy, go to <b>Publish</b>, download <code>festivals.json</code> and upload it to <code>data/</code> in your GitHub repository. Everyone sees the change after GitHub Pages updates (usually 1–2 minutes).</p>
      </div>
      <div class="tabs" role="tablist">
        ${["festivals", "templates", "publish"].map(t => `<button role="tab" data-tab="${t}" aria-selected="${tab === t}">${{ festivals: "📅 Festivals", templates: "🖼️ Templates", publish: "🚀 Publish" }[t]}</button>`).join("")}
      </div>
      <div id="tabBody"></div>`;
    $all("[data-tab]").forEach(b => b.onclick = () => { tab = b.dataset.tab; editing = null; render(); });
    if (tab === "festivals") editing ? renderEditor() : renderList();
    else if (tab === "templates") renderTemplates();
    else renderPublish();
  }

  function recLabel(f) {
    if (f.recurrence === "once") return f.date + (f.endDate ? " → " + f.endDate : "");
    if (f.recurrence === "weekly") return "Every " + WEEKDAYS[f.weekday];
    return f.recurrence === "daily" ? "Every day" : "Any time";
  }

  function renderList() {
    const q = filter.q.toLowerCase();
    const list = work.festivals
      .filter(f => filter.status === "all" || f.status === filter.status)
      .filter(f => !q || JSON.stringify([f.id, f.name, f.deity, f.tags]).toLowerCase().includes(q))
      .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
    $("#tabBody").innerHTML = `
      <div class="panel">
        <div class="row-between">
          <input type="text" id="q" placeholder="Search name, deity, tag…" value="${esc(filter.q)}" style="flex:1;min-width:160px">
          <select id="fs" style="width:auto"><option value="all">All</option><option value="published">Published</option><option value="draft">Draft</option></select>
          <button class="btn small" id="add">＋ Add record</button>
        </div>
        <p class="small muted">${list.length} of ${work.festivals.length} records</p>
        ${list.map(f => `<div class="rec">
            <img src="${esc(imageOf(f))}" alt="">
            <div class="info"><strong>${esc(f.name && f.name.en)} · ${esc(f.name && f.name.hi)}</strong>
              <span class="small muted">${esc(recLabel(f))} · ${esc(f.category)}</span>
              <div><span class="st ${f.status}">${esc(f.status)}</span> ${f.recurrence === "once" && !f.verified ? '<span class="tag warn">unverified</span>' : ""} ${(f.regional || []).length ? `<span class="tag">${f.regional.length} regional</span>` : ""}</div></div>
            <div class="acts">
              <button class="btn small secondary" data-edit="${esc(f.id)}">Edit</button>
              <button class="btn small secondary" data-toggle="${esc(f.id)}">${f.status === "published" ? "Unpublish" : "Publish"}</button>
            </div></div>`).join("")}
      </div>`;
    $("#fs").value = filter.status;
    $("#q").oninput = e => { filter.q = e.target.value; renderList(); const i = $("#q"); i.focus(); i.setSelectionRange(i.value.length, i.value.length); };
    $("#fs").onchange = e => { filter.status = e.target.value; renderList(); };
    $("#add").onclick = () => {
      isNew = true;
      editing = { id: "", recurrence: "once", date: D.today(), year: Number(D.today().slice(0, 4)), name: { en: "", hi: "" }, wish: { en: "", hi: "" }, deity: { en: "", hi: "" }, category: "festival", tags: [], languages: ["hi", "en"], templateId: (work.templates.find(t => t.type === "image") || {}).id || "", videoTemplateId: (work.templates.find(t => t.type === "video") || {}).id || "", imageUrl: "", imageStatus: "template", aiPrompt: "", showDaysBefore: 5, regional: [], status: "draft", verified: false, source: "", createdAt: D.today() };
      render();
    };
    $all("[data-edit]").forEach(b => b.onclick = () => { isNew = false; editing = clone(work.festivals.find(f => f.id === b.dataset.edit)); render(); });
    $all("[data-toggle]").forEach(b => b.onclick = () => {
      const f = work.festivals.find(x => x.id === b.dataset.toggle);
      f.status = f.status === "published" ? "draft" : "published"; persist(); renderList(); toast("Saved locally");
    });
  }

  function field(label, html, hint) { return `<div class="field"><label>${label}</label>${html}${hint ? `<small>${hint}</small>` : ""}</div>`; }
  function opt(list, val, labels) { return list.map((v, i) => `<option value="${esc(v)}" ${String(v) === String(val) ? "selected" : ""}>${esc(labels ? labels[i] : v)}</option>`).join(""); }

  function renderEditor() {
    const f = editing;
    const imgT = work.templates.filter(t => t.type === "image"), vidT = work.templates.filter(t => t.type === "video");
    $("#tabBody").innerHTML = `
      <div class="admin-editor">
        <div class="panel">
          <div class="row-between"><h2 class="section-title mt0">${isNew ? "New record" : "Edit record"}</h2><button class="btn small secondary" id="cancel">← List</button></div>
          ${field("ID (stable, never change after publishing)", `<input type="text" id="e_id" value="${esc(f.id)}" ${isNew ? "" : "readonly"} placeholder="auto from English name + year">`)}
          <div class="two">${field("Name (English)", `<input type="text" id="e_name_en" value="${esc(f.name.en)}">`)}${field("नाम (Hindi)", `<input type="text" id="e_name_hi" value="${esc(f.name.hi)}">`)}</div>
          <div class="two">${field("Wish line (English)", `<input type="text" id="e_wish_en" value="${esc(f.wish.en)}">`)}${field("शुभकामना (Hindi)", `<input type="text" id="e_wish_hi" value="${esc(f.wish.hi)}">`)}</div>
          <div class="two">${field("Deity / occasion (English)", `<input type="text" id="e_deity_en" value="${esc(f.deity.en)}">`)}${field("देवता / अवसर (Hindi)", `<input type="text" id="e_deity_hi" value="${esc(f.deity.hi)}">`)}</div>
          <div class="two">${field("Category", `<select id="e_cat">${opt(CATS, f.category)}</select>`)}${field("Tags (comma separated)", `<input type="text" id="e_tags" value="${esc((f.tags || []).join(", "))}">`, "e.g. ekadashi, diwali")}</div>
          <div class="two">${field("Repeats", `<select id="e_rec">${opt(RECUR, f.recurrence)}</select>`)}${field("Weekday (weekly only)", `<select id="e_wd">${opt([0, 1, 2, 3, 4, 5, 6], f.weekday ?? 0, WEEKDAYS)}</select>`)}</div>
          <div class="three">${field("Date", `<input type="date" id="e_date" value="${esc(f.date || "")}">`)}${field("End date", `<input type="date" id="e_end" value="${esc(f.endDate || "")}">`, "multi-day only")}${field("Show days before", `<input type="number" id="e_before" min="0" max="60" value="${esc(f.showDaysBefore ?? 5)}">`)}</div>
          ${field("Regional dates (one per line: Region, YYYY-MM-DD, note)", `<textarea id="e_reg">${esc((f.regional || []).map(r => [r.region, r.date, r.note || ""].join(", ")).join("\n"))}</textarea>`, "Users choose their region in Profile; this date then replaces the main date for them.")}
          <div class="two">${field("Poster template", `<select id="e_tpl">${opt(imgT.map(t => t.id), f.templateId, imgT.map(t => t.name + (t.active === false ? " (inactive)" : "")))}</select>`)}${field("Video template", `<select id="e_vtpl"><option value="">— none —</option>${opt(vidT.map(t => t.id), f.videoTemplateId, vidT.map(t => t.name))}</select>`)}</div>
          ${field("Festival image URL (optional, overrides template)", `<input type="url" id="e_img" value="${esc(f.imageUrl && f.imageUrl.startsWith("data:") ? "" : f.imageUrl)}" placeholder="assets/festivals/diwali.jpg or https://…">
            <label class="btn small secondary" style="justify-self:start">📁 Use image from phone<input type="file" id="e_imgfile" accept="image/*" hidden></label>`,
            f.imageUrl && f.imageUrl.startsWith("data:") ? "Using an image from this phone (embedded). Better: upload it to assets/ in GitHub and paste its path." : "Best practice: upload images to the repo's assets/ folder and paste the path here.")}
          <div class="two">${field("Image status", `<select id="e_imgst">${opt(["template", "pending", "generated", "uploaded", "none"], f.imageStatus)}</select>`)}${field("Publication", `<select id="e_status">${opt(["draft", "published"], f.status)}</select>`)}</div>
          ${field("AI image prompt (used by AI Create)", `<textarea id="e_prompt">${esc(f.aiPrompt || "")}</textarea>`)}
          ${field("Source / notes", `<input type="text" id="e_src" value="${esc(f.source || "")}" placeholder="e.g. Drik Panchang, New Delhi">`)}
          <label class="check"><input type="checkbox" id="e_ver" ${f.verified ? "checked" : ""}> Date verified with a trusted panchang</label>
          <div class="btn-row" style="margin-top:12px">
            <button class="btn" id="save">💾 Save</button>
            ${isNew ? "" : `<button class="btn danger" id="del">🗑️ Delete</button>`}
          </div>
        </div>
        <div class="panel pv"><strong>Card preview</strong><p class="small muted">Uses the poster engine with a sample name.</p>
          <canvas id="pvCanvas"></canvas>
          <div class="seg" id="pvLang" style="margin-top:8px"><button data-v="hi" aria-pressed="true">हिंदी</button><button data-v="en">English</button></div></div>
      </div>`;

    let pvLang = "hi";
    function collect() {
      const g = id => $("#" + id).value;
      f.name = { en: g("e_name_en").trim(), hi: g("e_name_hi").trim() };
      f.wish = { en: g("e_wish_en").trim(), hi: g("e_wish_hi").trim() };
      f.deity = { en: g("e_deity_en").trim(), hi: g("e_deity_hi").trim() };
      f.category = g("e_cat");
      f.tags = g("e_tags").split(",").map(s => slug(s)).filter(s => s && s !== "record");
      f.recurrence = g("e_rec");
      f.weekday = f.recurrence === "weekly" ? Number(g("e_wd")) : undefined;
      f.date = g("e_date") || undefined; f.endDate = g("e_end") || undefined;
      if (f.date) f.year = Number(f.date.slice(0, 4));
      f.showDaysBefore = Number(g("e_before")) || 0;
      f.regional = g("e_reg").split("\n").map(l => l.split(",").map(s => s.trim())).filter(p => p[0] && p[1]).map(p => ({ region: p[0], date: p[1], note: p.slice(2).join(", ") }));
      f.templateId = g("e_tpl"); f.videoTemplateId = g("e_vtpl");
      const url = g("e_img").trim();
      if (url || !(f.imageUrl || "").startsWith("data:")) f.imageUrl = url;
      f.imageStatus = g("e_imgst"); f.status = g("e_status");
      f.aiPrompt = g("e_prompt").trim(); f.source = g("e_src").trim(); f.verified = $("#e_ver").checked;
      if (isNew && !g("e_id").trim()) f.id = slug(f.name.en) + (f.recurrence === "once" && f.year ? "-" + f.year : "");
      else if (isNew) f.id = slug(g("e_id"));
      if (f.recurrence !== "once") { delete f.date; delete f.endDate; delete f.year; }
      Object.keys(f).forEach(k => f[k] === undefined && delete f[k]);
    }
    async function preview() {
      collect();
      const tpl = tplById(f.templateId) || {};
      await Poster.render($("#pvCanvas"), {
        bgUrl: imageOf(f), title: f.name[pvLang] || f.name.en, wish: f.wish[pvLang] || f.wish.en,
        name: pvLang === "hi" ? "रमेश शर्मा" : "Ramesh Sharma", tagline: "", photo: "",
        prefs: Object.assign(Store.getPosterPrefs(), { showPhoto: false }), theme: { textColor: tpl.textColor || "#fff", accent: tpl.accent || "#FFB020" }
      });
    }
    let pt = 0;
    root.querySelectorAll("#tabBody input, #tabBody select, #tabBody textarea").forEach(el => el.addEventListener("input", () => { clearTimeout(pt); pt = setTimeout(preview, 250); }));
    $all("#pvLang button").forEach(b => b.onclick = () => { pvLang = b.dataset.v; $all("#pvLang button").forEach(x => x.setAttribute("aria-pressed", x === b)); preview(); });
    $("#e_imgfile").onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try { f.imageUrl = await Store.fileToResizedDataUrl(file, 1350, 0.82); f.imageStatus = "uploaded"; $("#e_img").value = ""; preview(); toast("Image added (stored in this browser)"); }
      catch (err) { toast("Could not read that image"); }
    };
    $("#cancel").onclick = () => { editing = null; render(); };
    $("#save").onclick = () => {
      collect();
      if (!f.name.en || !f.name.hi) return toast("Please fill both names");
      if (f.recurrence === "once" && !D.isValid(f.date)) return toast("Please set a valid date");
      if (isNew && work.festivals.some(x => x.id === f.id)) return toast("That ID already exists — change it");
      const i = work.festivals.findIndex(x => x.id === f.id);
      if (i >= 0) work.festivals[i] = f; else work.festivals.push(f);
      persist(); editing = null; toast("Saved locally"); render();
    };
    const del = $("#del");
    if (del) del.onclick = () => {
      if (!confirm(`Delete "${f.name.en}"? (Only in your local copy until you publish.)`)) return;
      work.festivals = work.festivals.filter(x => x.id !== f.id); persist(); editing = null; render();
    };
    preview();
  }

  function renderTemplates() {
    $("#tabBody").innerHTML = `
      <div class="notice info"><p><b>Licensing:</b> only add images and videos you made yourself, commissioned, or have a written licence for. Record the licence in each template. Do not copy festival art from Google, WhatsApp or other apps.</p></div>
      <div class="panel">
        ${work.templates.map(t => `<div class="rec">
          ${t.type === "image" ? `<img src="${esc(t.url)}" alt="">` : `<img src="${esc(t.url.replace(/\.(webm|mp4)$/, "-poster.jpg"))}" alt="" onerror="this.style.visibility='hidden'">`}
          <div class="info"><strong>${t.type === "video" ? "🎬 " : "🖼️ "}${esc(t.name)}</strong><span class="small muted">${esc(t.id)} · ${esc(t.url.length > 60 ? t.url.slice(0, 60) + "…" : t.url)}</span>
            <div class="small muted">© ${esc(t.license || "licence not recorded")}</div></div>
          <div class="acts"><label class="check small"><input type="checkbox" data-active="${esc(t.id)}" ${t.active !== false ? "checked" : ""}> Active</label></div>
        </div>`).join("")}
      </div>
      <div class="panel">
        <h2 class="section-title mt0">Add template</h2>
        <div class="two">${field("Type", `<select id="t_type"><option value="image">Image (poster background)</option><option value="video">Video</option></select>`)}${field("Name", `<input type="text" id="t_name" placeholder="e.g. Ganesh Marigold">`)}</div>
        ${field("File URL or path", `<input type="text" id="t_url" placeholder="assets/templates/my-art.svg  or  https://…">`, "Upload the file to the repo's assets/ folder via GitHub, then type its path. Videos: short (≤ 10 s), vertical 9:16, MP4 or WebM, under ~3 MB.")}
        <label class="btn small secondary">📁 Preview a file from this phone<input type="file" id="t_file" accept="image/*,video/*" hidden></label>
        <p class="small muted" id="t_fileNote"></p>
        ${field("Licence / source", `<input type="text" id="t_lic" placeholder="e.g. Own artwork, 2026">`)}
        <div class="two">${field("Text colour", `<input type="text" id="t_color" value="#FFFFFF">`)}${field("Accent colour", `<input type="text" id="t_accent" value="#FFB020">`)}</div>
        <button class="btn" id="t_add">＋ Add template</button>
      </div>`;
    $all("[data-active]").forEach(c => c.onchange = () => { tplById(c.dataset.active).active = c.checked; persist(); toast(c.checked ? "Activated" : "Deactivated"); });
    let localFile = null;
    $("#t_file").onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      if (file.type.startsWith("image/")) {
        localFile = await Store.fileToResizedDataUrl(file, 1350, 0.82).catch(() => null);
        $("#t_fileNote").textContent = localFile ? "Image embedded for local preview. For real publishing, upload it to GitHub and use the path." : "Could not read image.";
        $("#t_type").value = "image";
      } else {
        localFile = URL.createObjectURL(file);
        $("#t_fileNote").textContent = "Video preview works only until you close this page (videos are too large to keep in browser storage). Upload it to GitHub for real use.";
        $("#t_type").value = "video";
      }
    };
    $("#t_add").onclick = () => {
      const name = $("#t_name").value.trim(), url = $("#t_url").value.trim() || localFile;
      if (!name || !url) return toast("Name and file are required");
      if (!$("#t_lic").value.trim()) return toast("Please record the licence/source");
      const id = ($("#t_type").value === "video" ? "vid-" : "tpl-") + slug(name);
      if (tplById(id)) return toast("A template with this name exists");
      work.templates.push({ id, type: $("#t_type").value, name, url, active: true, license: $("#t_lic").value.trim(), textColor: $("#t_color").value.trim() || "#FFFFFF", accent: $("#t_accent").value.trim() || "#FFB020" });
      persist(); toast("Template added locally"); renderTemplates();
    };
  }

  function renderPublish() {
    const list = issues();
    const embedded = work.festivals.filter(f => (f.imageUrl || "").startsWith("data:")).length + work.templates.filter(t => (t.url || "").startsWith("data:") || (t.url || "").startsWith("blob:")).length;
    $("#tabBody").innerHTML = `
      <div class="panel">
        <h2 class="section-title mt0">Checks</h2>
        ${list.length ? `<ul class="issues small">${list.map(i => `<li>⚠️ ${esc(i)}</li>`).join("")}</ul>` : `<p class="notice ok">No problems found.</p>`}
        ${embedded ? `<p class="notice warn small">${embedded} item(s) use files embedded from this phone. They work, but make festivals.json large. Blob video links will NOT work for others.</p>` : ""}
      </div>
      <div class="panel">
        <h2 class="section-title mt0">Publish to everyone</h2>
        <ol class="small">
          <li>Tap <b>Download festivals.json</b>.</li>
          <li>Open your repository on github.com → <code>data</code> folder → <b>Add file → Upload files</b> → choose the downloaded file → <b>Commit changes</b>. (It replaces the old file.)</li>
          <li>Wait 1–2 minutes, then open the app. Tap <b>Discard</b> on the yellow banner (or below) to stop using your local draft.</li>
        </ol>
        <div class="btn-row"><button class="btn" id="dl">⬇️ Download festivals.json</button><button class="btn secondary" id="copy">📋 Copy JSON</button></div>
      </div>
      <div class="panel">
        <h2 class="section-title mt0">Other</h2>
        <div class="btn-row">
          <label class="btn secondary">📂 Import JSON<input type="file" id="imp" accept="application/json,.json" hidden></label>
          <button class="btn danger" id="reset">↩️ Discard local edits</button>
        </div>
        <p class="small muted">Local draft: ${Store.getDraft() ? "yes — the app on this device is showing your edits" : "none — showing the published file"}.</p>
      </div>`;
    const json = () => JSON.stringify(work, null, 2);
    $("#dl").onclick = () => { Poster.download(new Blob([json()], { type: "application/json" }), "festivals.json"); toast("Downloaded"); };
    $("#copy").onclick = async () => { try { await navigator.clipboard.writeText(json()); toast("Copied"); } catch (e) { toast("Copy not allowed here — use Download"); } };
    $("#imp").onchange = async e => {
      const file = e.target.files[0]; if (!file) return;
      try { const d = JSON.parse(await file.text()); if (!Array.isArray(d.festivals) || !Array.isArray(d.templates)) throw new Error("shape"); work = d; persist(); toast("Imported"); render(); }
      catch (err) { toast("That is not a valid Sidto festivals.json"); }
    };
    $("#reset").onclick = async () => {
      if (!confirm("Throw away all local admin edits on this device?")) return;
      Store.clearDraft(); work = await Data.loadPublished(); toast("Local edits discarded"); render();
    };
  }

  (async function init() {
    try {
      const draft = Store.getDraft();
      work = draft ? draft : await Data.loadPublished();
      work.templates = work.templates || [];
      render();
    } catch (e) {
      root.innerHTML = `<div class="notice err"><p>Could not load festival data: ${esc(e.message)}</p><p class="small">If you opened this file directly from phone storage, use a local server or GitHub Pages (see README).</p></div>`;
    }
  })();
})();
