# Sidto — Festival Wishes (prototype v0.1)

Sidto shows Hindu festival, vrat, deity and daily wishes for **today in India time**, keeps the **previous 5 days** browsable, lists **upcoming festivals**, and turns any wish into a **personalised poster or video** with the user's name and photo — all inside the phone's browser, at ₹0.

Built with plain HTML, CSS and JavaScript. No build step, no framework, no paid service. Works on GitHub Pages.

---

## 1. What works today (and what doesn't)

| Feature | Status |
|---|---|
| Home feed: today, previous 5 days, upcoming, categories, popular tags | ✅ Works |
| Hindi / English interface | ✅ Works |
| Profile: name, line under name, photo, region, language (stored on this phone only) | ✅ Works |
| Poster: name + photo over a template, adjust position/size/colour, Save, Share | ✅ Works (Canvas, on the phone) |
| Regional date overrides (e.g. Odisha, USA/Canada) | ✅ Works (chosen in Profile) |
| Video wish: name + photo overlaid on a template video, live preview | ✅ Works |
| Video export | ⚠️ Experimental. Records the preview in real time with the browser's MediaRecorder. Tested in desktop Chromium (produced a 6 s MP4). Silent. Must be tested on your phone. Disabled with an explanation where unsupported. |
| AI prompt builder | ✅ Works (text only) |
| AI image generation | ❌ Not connected. The app says so honestly. A backend template is included (Step 7). |
| Admin panel: add/edit/delete/schedule records, templates, preview, export JSON | ✅ Works as a **demo** — no login, edits stay in that browser until you publish the JSON |
| Offline use after first visit | ✅ Basic (service worker, https only) |
| Accounts, cloud sync, notifications, automatic festival calendar | ❌ Not built yet — see Roadmap |

**Festival data is SAMPLE data.** Oct–Nov 2026 dates were cross-checked against public panchang listings for New Delhi, but they are **not guaranteed** and the list does **not** cover every festival. Records are marked `"verified": false` until you confirm them. The app shows a banner while sample data is in use.

**Artwork:** all 8 poster backgrounds (v2: gold frames, torans, glow and detailed motifs), 2 animated video templates and the icon were created originally for this project. You may use and change them freely in Sidto. Only add new art you made, commissioned or have a written licence for.

**Fonts:** Mukta and Yatra One are bundled in `assets/fonts/` (SIL Open Font License, licence files included), so posters look the same offline and inside the APK.

---

## 2. File tree

```
sidto/
├── index.html               App page (home, categories, poster, video, AI create, profile)
├── admin.html               Demo admin panel
├── manifest.webmanifest     Install / APK metadata (name, icons, colours)
├── sw.js                    Offline cache (network-first, so your edits appear immediately)
├── .nojekyll                Tells GitHub Pages to serve files as-is
├── README.md                This guide
├── css/style.css            All styles (mobile first, side rail on wide screens)
├── css/fonts.css            Bundled Hindi/English fonts
├── js/
│   ├── config.js            ← Settings you edit (PUBLIC — never put keys here)
│   ├── i18n.js              Hindi & English interface text
│   ├── dates.js             India-time date logic
│   ├── store.js             Local storage (profile, poster settings, admin draft)
│   ├── data.js              Festival selection: today, history, upcoming, categories
│   ├── prompt.js            AI prompt builder
│   ├── imageService.js      AI image adapter (calls YOUR backend only)
│   ├── poster.js            Canvas poster compositor, save & share
│   ├── video.js             Video overlay compositor & experimental export
│   ├── app.js               Screens and navigation
│   └── admin.js             Admin demo logic
├── data/festivals.json      ← Festival records & template list (edit or replace)
├── assets/
│   ├── icons/               App icons (SVG + PNG 192/512 + maskable)
│   ├── fonts/               Mukta + Yatra One (OFL)
│   ├── templates/           8 original poster backgrounds (SVG)
│   └── videos/              2 original animated 6-second video templates (WebM) + preview frames
├── tools/                   Python scripts that generated the artwork (optional, need a computer/Python)
└── backend/                 NOT deployed by GitHub Pages — copy into the services below
    ├── cloudflare-worker/worker.js   AI image backend template (untested)
    └── apps-script/Code.gs           Google Sheet → festival JSON template (untested)
```

---

## 3. Get the files onto your phone and edit them

You need: an Android phone, Chrome, a free GitHub account, and one free editor app.

**Recommended editor: Spck Editor** (free on Play Store). At the time of writing it can import a zip, edit HTML/CSS/JS with highlighting, preview the site, and push to GitHub. *Acode* is a good alternative editor. Check each app's current features — they change.

1. Download `sidto.zip` from this chat to your phone.
2. Open **Files by Google** → Downloads → tap `sidto.zip` → **Extract**. You now have a `sidto` folder.
3. In Spck Editor: **Projects → Import → from zip** (or open the extracted folder).
4. Tap any file to edit. Save with the disk icon.

**Files beginners usually edit:**
- `data/festivals.json` — festivals and dates (or use the Admin panel, easier — see Step 8)
- `js/config.js` — settings such as history days and backend URLs
- `js/i18n.js` — interface wording in Hindi/English

**JSON tips:** every text in double quotes, a comma between items, no comma after the last item. If the app shows "Could not load festival data", paste your JSON into any online JSON validator to find the mistake.

---

## 4. Test on your phone

The app loads `festivals.json` with `fetch`, which **does not work** when you open `index.html` straight from phone storage (`file://`). Use one of:

- **Spck Editor's preview (▶)** — runs a small local server inside the app. Easiest while editing.
- **GitHub Pages** (Step 5) — the real thing. Takes 1–2 minutes after each upload.

**Checklist**
1. Home shows today's date, a large hero card and wish cards. Tap the date chips — previous days change the grid.
2. Tap **हिं / EN** in the header.
3. **Profile** → add name, choose photo → **Save profile**. Cards now show your name and photo.
4. Tap a card → poster editor → move sliders → **Save** (goes to Downloads) and **Share** (opens WhatsApp etc. if supported).
5. **Video** → watch the preview → **Export video (experimental)** → wait ~6 s → play the result before sharing.
6. **AI Create** → **Generate image** → you should see the honest "not connected" message and the prompt.
7. Test any date: add `?date=2026-11-08` before the `#` in the address, e.g. `https://you.github.io/sidto/?date=2026-11-08#/home`. A 🧪 banner shows while a test date is active.

---

## 5. Publish free on GitHub Pages

**Option A — from Spck Editor (fewest steps)**
1. github.com (Chrome) → **+ → New repository** → name `sidto` → **Public** → **Create**.
2. GitHub → profile photo → **Settings → Developer settings → Personal access tokens → Fine-grained** → generate a token with *Contents: Read and write* for the `sidto` repo only. Copy it. Treat it like a password.
3. Spck Editor → Settings → Git → enter your GitHub username and the token.
4. In the project: Git → add remote `https://github.com/<you>/sidto.git` → commit all files → push.

**Option B — GitHub website only**
1. Create the repo as above, and tick "Add a README".
2. Tip: in Chrome's ⋮ menu tick **Desktop site** — GitHub's upload page is easier.
3. In the repo: **Add file → Upload files** → select `index.html`, `admin.html`, `manifest.webmanifest`, `sw.js`, `README.md` → **Commit**.
4. For each folder (`css`, `js`, `data`, `assets/icons`, `assets/templates`, `assets/videos`, `backend/...`): **Add file → Create new file** → type the folder path then `/x` (e.g. `js/x`) to create the folder, commit, open that folder, **Add file → Upload files**, select all its files, commit. Delete the `x` placeholder afterwards.
5. Also create an empty file named `.nojekyll` at the top level.

**Turn on Pages:** repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → **Save**. After 1–2 minutes your app is at `https://<you>.github.io/sidto/`.

Every later change: edit → upload/push → wait 1–2 minutes → reload.

---

## 6. Make an Android APK without a computer

**Recommended: PWABuilder (free)** — wraps your live GitHub Pages site as a Trusted Web Activity (TWA). The app runs in Chrome's engine, so Share, Save and video export behave like Chrome.

1. Make sure the site works on GitHub Pages first.
2. Open **pwabuilder.com** in Chrome → paste your site URL → **Start**.
3. It checks the manifest, icons and service worker (all included). → **Package for stores → Android → Generate**.
4. Download the zip. It contains a test APK, an AAB (for Play Store) and a **signing key**. **Back up the key** (e.g. to Google Drive). Without it you can never update the app on Play Store.
5. Open the APK on your phone to install (allow "Install unknown apps" for Files/Chrome).

**Limitations, honestly:**
- The APK loads your website, so it needs internet the first time (offline afterwards for cached pages). Updates to the website appear in the app automatically.
- Users need Chrome (or another TWA-capable browser) installed; most Android phones have it.
- To hide the address bar, Android must verify you own the domain using `/.well-known/assetlinks.json` (PWABuilder gives you this file). It must sit at the **root of the domain**. A project site like `you.github.io/sidto` can't do that — name your repo `<you>.github.io` (site at the root) or use a custom domain. Otherwise the app works but shows a small URL bar.
- Play Store publishing needs a Google Play developer account (one-time fee — not ₹0), plus a privacy policy page.

**Alternative: a plain WebView wrapper** (online "website to APK" tools or a GitHub Actions build). Many WebViews **do not** support file downloads, `navigator.share` with files, file pickers, or MediaRecorder without extra native code, so Save/Share/photo upload/video export may silently fail. Prefer PWABuilder unless you add native handlers.

---

## 7. Connecting real AI image generation (optional)

**Rule:** the key or account that pays for AI stays on a server. `js/config.js`, the HTML and the APK are public.

The included `backend/cloudflare-worker/worker.js` uses **Cloudflare Workers AI** through a binding (no key in code). All steps can be done from Chrome on a phone:

1. Create a free account at dash.cloudflare.com.
2. **Workers & Pages → Create → Worker** → name `sidto-image` → **Deploy**.
3. **Edit code** → replace everything with `worker.js` → **Deploy**.
4. Worker → **Settings → Bindings → Add → Workers AI** → variable name `AI`.
5. **Settings → Variables and Secrets** → add `ALLOWED_ORIGIN` = `https://<you>.github.io`.
6. Check the model id at the top of `worker.js` against Cloudflare's current model list.
7. In `js/config.js` set `imageApiUrl: "https://sidto-image.<account>.workers.dev/generate"` and publish.
8. AI Create now shows "AI provider: connected" and returns a real image, or a real error.

**Cost & limits — read before enabling:**
- Workers AI has a daily free allocation at the time of writing. Free tiers change or end; check current pricing and set usage alerts. Beyond the free amount you may be charged if billing is on.
- The origin check blocks other websites, not determined abusers. Add a Cloudflare **rate limiting** rule. Long-term, allow only signed-in admins to generate (Roadmap 3).
- **Don't generate per user.** Generate one image per festival (admin), save it as the festival's `imageUrl`, and let everyone personalise it on their phone. This keeps cost near zero.

**Failure handling already in the app:** not configured → honest message + prompt to copy; HTTP error, 429 limit, timeout (90 s) or empty reply → error shown, nothing faked.

**Using any other provider:** keep the same request/response shape (see the top of `js/imageService.js`) and only change the worker.

---

## 8. Admin panel (demo) and how to publish festival changes

Open `https://<you>.github.io/sidto/admin.html` (also linked from Profile).

- **Festivals:** search, add, edit, delete, publish/unpublish. Fields: stable ID, Hindi/English name, wish line and deity, category, tags, repeat type (once / daily / weekly / any time), date, end date (multi-day festivals), "show days before", regional dates, poster template, video template, image URL or phone image, image status, AI prompt, source, verified flag, draft/published.
- **Templates:** list, activate/deactivate, add new with a required licence note, preview a phone file.
- **Publish:** automatic checks (duplicate IDs, bad dates, missing templates, unverified published dates), then **Download festivals.json** → upload to the `data/` folder on GitHub (replace the old file). Everyone sees it in 1–2 minutes.

Admin edits are saved **only in that browser** as a draft. The app on the same phone shows a yellow banner while it uses the draft; tap **Discard** to go back to the published file.

### Securing the admin panel (it is NOT secure today)

`admin.html` has no login. That's acceptable only because it can't change anything for other people — publishing requires write access to your GitHub repo. Hiding the page or adding a password in JavaScript would **not** be security (anyone can read the code). Real options:

1. **Now, ₹0:** keep publishing through GitHub (only you have repo access). Or put festivals in a Google Sheet with `backend/apps-script/Code.gs` — editing access is controlled by Google sharing, and the app reads a public read-only endpoint (`festivalDataUrl` in config).
2. **Later:** Firebase Authentication + Firestore with security rules that allow writes only for users with an `admin` custom claim. The admin page becomes a client of Firestore; rules on the server enforce who may write.

---

## 9. Privacy & storage

- Name, photo, region and poster settings live in this browser's `localStorage` on this phone. Nothing is uploaded.
- Photos are shrunk on the phone (512 px) before saving.
- Not synced between devices; cleared if browser/app data is cleared. "Delete all my data on this device" in Profile removes everything.
- This is **not** an account or authentication. Anyone using the unlocked phone can see it.
- Posters and videos are made on the phone. They leave the phone only when the user taps Share or Save.

---

## 10. Prioritised roadmap

1. **Make the calendar trustworthy (now, ₹0).** Verify every date for 2026–27 against one panchang you trust (state the city/tradition), mark `verified: true`, add regional rows, and replace the sample banner by changing `meta.dataset` to `"LIVE"`. Tithi-based dates shift every year and by location — they are entered per year, not calculated by the app.
2. **Easier admin data (₹0).** Move festivals to a Google Sheet + `Code.gs` so you can edit from the Sheets app; set `festivalDataUrl` to the Apps Script URL. Add a yearly import routine (e.g. paste next year's list in October).
3. **Real admin login & content storage.** Firebase Auth (Google sign-in) + Firestore for festivals/templates with admin-only write rules. Templates stay in your GitHub repo (free); note that Firebase Cloud Storage for uploads may require the pay-as-you-go plan for new projects — check current Firebase pricing.
4. **AI images for admins.** Deploy the Worker, restrict generation to signed-in admins, save results as festival `imageUrl`. Generate once per festival, never per user.
5. **Optional persistent profiles.** Sign-in, then save the name (and only with clear consent, the photo) to Firestore/Storage so it syncs across phones. Keep "local only" as the default, add a delete-my-account option and a privacy policy.
6. **Notifications.** Firebase Cloud Messaging with a service-worker push handler, plus a daily scheduled job (Apps Script time trigger or a Cloud Function) that sends "Today: Diwali — make your poster". Needs user permission; Android 13+ asks explicitly.
7. **Reliable video export.** Today's in-browser export is silent and device-dependent. Next: mix template audio with Web Audio during recording; then a server renderer (FFmpeg on a container service) that receives the overlay settings and returns an MP4 — this has hosting cost and needs upload consent for the photo.
8. **Play Store release.** assetlinks verification, privacy policy, store listing, signed AAB from PWABuilder.

---

## 11. Customising

- **History length / upcoming window:** `js/config.js` → `historyDays`, `upcomingDays`.
- **New interface words:** add the same key to `en` and `hi` in `js/i18n.js`.
- **New poster background:** upload an image or SVG (portrait, ideally 1080×1350, leave the top ~25% and bottom ~25% calm for text) to `assets/templates/`, then add it in Admin → Templates. If the art has a garland at the top, add `"titleY": 262` to that template in `festivals.json` to move the title lower (default 196).
- **New video template:** vertical 9:16, ≤ 10 seconds, ≤ ~3 MB, MP4 (H.264) or WebM, to `assets/videos/`.
- **Daily/weekly items:** use repeat type `daily` or `weekly` (weekday 0 = Sunday).

## 12. Troubleshooting

| Problem | Fix |
|---|---|
| "Could not load festival data" | Opened from `file://`? Use Spck preview or GitHub Pages. Otherwise your JSON has a typo — validate it. |
| Changes don't appear | Wait 2 minutes after uploading; pull to refresh. Still old? Clear site data once. |
| Share downloads instead | That browser can't share files; the poster is in Downloads. In the APK, use PWABuilder (not a plain WebView). |
| Export video button greyed out | The browser lacks MediaRecorder. Update Chrome; preview still works. |
| Photo won't save | Storage full — choose a smaller photo or remove uploaded admin images. |
| Fonts look plain | Fonts are bundled in assets/fonts — check that folder was uploaded. |
