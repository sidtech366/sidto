/**
 * Sidto — festival data from a Google Sheet (Google Apps Script)
 * STATUS: TEMPLATE, NOT TESTED. Read-only endpoint; safe to make public.
 *
 * Lets an admin edit festivals in a Google Sheet (works in the Sheets app
 * on Android) instead of uploading festivals.json to GitHub.
 *
 * Sheet "festivals" — row 1 headers (exact names):
 *   id | recurrence | date | endDate | weekday | name_en | name_hi | wish_en | wish_hi |
 *   deity_en | deity_hi | category | tags | templateId | videoTemplateId | imageUrl |
 *   imageStatus | aiPrompt | showDaysBefore | regional | status | verified | source
 *   (regional: "Region|YYYY-MM-DD|note; Region2|YYYY-MM-DD|note"   tags: "ekadashi,diwali")
 * Sheet "templates" — headers: id | type | name | url | active | license | textColor | accent
 *
 * Deploy: Extensions → Apps Script → paste → Deploy → New deployment → Web app →
 *         Execute as: Me, Who has access: Anyone → copy the /exec URL into
 *         js/config.js → festivalDataUrl.
 * Editing the SHEET is protected by Google sharing — only people you share
 * it with can change festivals. That is real access control for admin data.
 */
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rows = name => {
    const sh = ss.getSheetByName(name);
    if (!sh) return [];
    const values = sh.getDataRange().getValues();
    const head = values.shift().map(String);
    return values.filter(r => r[0] !== "").map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));
  };
  const iso = v => v instanceof Date ? Utilities.formatDate(v, "Asia/Kolkata", "yyyy-MM-dd") : String(v || "");
  const festivals = rows("festivals").map(r => {
    const f = {
      id: String(r.id), recurrence: r.recurrence || "once",
      name: { en: r.name_en, hi: r.name_hi }, wish: { en: r.wish_en, hi: r.wish_hi },
      deity: { en: r.deity_en, hi: r.deity_hi }, category: r.category,
      tags: String(r.tags || "").split(",").map(s => s.trim()).filter(String),
      languages: ["hi", "en"], templateId: r.templateId, videoTemplateId: r.videoTemplateId,
      imageUrl: r.imageUrl || "", imageStatus: r.imageStatus || "template", aiPrompt: r.aiPrompt || "",
      showDaysBefore: Number(r.showDaysBefore) || 0, status: r.status || "draft",
      verified: r.verified === true || String(r.verified).toLowerCase() === "true", source: r.source || "",
      regional: String(r.regional || "").split(";").map(s => s.split("|").map(x => x.trim()))
        .filter(p => p[0] && p[1]).map(p => ({ region: p[0], date: p[1], note: p[2] || "" }))
    };
    if (f.recurrence === "once") { f.date = iso(r.date); if (r.endDate) f.endDate = iso(r.endDate); f.year = Number(f.date.slice(0, 4)); }
    if (f.recurrence === "weekly") f.weekday = Number(r.weekday);
    return f;
  });
  const templates = rows("templates").map(r => ({
    id: r.id, type: r.type, name: r.name, url: r.url, active: r.active !== false && String(r.active).toLowerCase() !== "false",
    license: r.license, textColor: r.textColor || "#FFFFFF", accent: r.accent || "#FFB020"
  }));
  const out = { meta: { schemaVersion: 1, dataset: "LIVE", timeZone: "Asia/Kolkata", updatedAt: iso(new Date()) }, templates, festivals };
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
