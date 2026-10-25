/* Sidto — festival data layer.
 * Loads records from data/festivals.json (or a future backend URL with
 * the same JSON shape) and answers: what to show on a given day,
 * what is upcoming, and what belongs to a category.
 *
 * Record recurrence types:
 *   "once"    — a dated festival (date, optional endDate)
 *   "daily"   — shown every day (Good Morning, Good Night)
 *   "weekly"  — shown on one weekday (0 = Sunday … 6 = Saturday)
 *   "anytime" — not tied to a date (Birthday, Anniversary); shown in categories
 */
(function () {
  const D = window.SidtoDates;
  const CFG = window.SIDTO_CONFIG;

  const CATEGORIES = [
    { id: "good-morning", key: "cat_good_morning", icon: "🌅" },
    { id: "good-night", key: "cat_good_night", icon: "🌙" },
    { id: "vrat", key: "cat_vrat", icon: "🪔" },
    { id: "festival", key: "cat_festival", icon: "🎉" },
    { id: "deity", key: "cat_deity", icon: "🕉️" },
    { id: "jayanti", key: "cat_jayanti", icon: "📜" },
    { id: "birthday", key: "cat_birthday", icon: "🎂" },
    { id: "special", key: "cat_special", icon: "✨" }
  ];

  const TAG_LABELS = {
    ekadashi: { en: "Ekadashi", hi: "एकादशी" }, pradosh: { en: "Pradosh Vrat", hi: "प्रदोष व्रत" },
    shivratri: { en: "Shivratri", hi: "शिवरात्रि" }, navratri: { en: "Navratri", hi: "नवरात्रि" },
    diwali: { en: "Diwali", hi: "दीपावली" }, holi: { en: "Holi", hi: "होली" },
    janmashtami: { en: "Janmashtami", hi: "जन्माष्टमी" }, "ganesh-chaturthi": { en: "Ganesh Chaturthi", hi: "गणेश चतुर्थी" },
    "ram-navami": { en: "Ram Navami", hi: "राम नवमी" }, "hanuman-jayanti": { en: "Hanuman Jayanti", hi: "हनुमान जयंती" },
    purnima: { en: "Purnima", hi: "पूर्णिमा" }, dussehra: { en: "Dussehra", hi: "दशहरा" },
    "karwa-chauth": { en: "Karwa Chauth", hi: "करवा चौथ" }, shiva: { en: "Mahadev", hi: "महादेव" },
    krishna: { en: "Krishna", hi: "कृष्ण" }, hanuman: { en: "Hanuman", hi: "हनुमान" },
    ganesha: { en: "Ganesha", hi: "गणेश" }, vishnu: { en: "Vishnu", hi: "विष्णु" }, lakshmi: { en: "Lakshmi", hi: "लक्ष्मी" }
  };

  let dataset = null;
  let usingDraft = false;

  const Data = {
    CATEGORIES, TAG_LABELS,
    get dataset() { return dataset; },
    get usingDraft() { return usingDraft; },

    async load(opts) {
      opts = opts || {};
      const draft = opts.ignoreDraft ? null : window.SidtoStore.getDraft();
      if (draft && draft.festivals) { dataset = draft; usingDraft = true; return dataset; }
      const res = await fetch(CFG.festivalDataUrl + "?v=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (!json || !Array.isArray(json.festivals)) throw new Error("Bad data shape");
      dataset = json; usingDraft = false;
      return dataset;
    },
    async loadPublished() {
      const res = await fetch(CFG.festivalDataUrl + "?v=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    },

    text(obj, lang) {
      if (!obj) return "";
      if (typeof obj === "string") return obj;
      return obj[lang] || obj.en || obj.hi || "";
    },
    tagLabel(tag, lang) { return (TAG_LABELS[tag] && TAG_LABELS[tag][lang]) || tag; },

    template(id) { return (dataset.templates || []).find(t => t.id === id) || null; },
    templates(type) { return (dataset.templates || []).filter(t => t.type === type && t.active !== false); },

    /* Image shown for a record: an admin/AI image if set, else its template. */
    imageFor(f) {
      if (f.imageUrl) return f.imageUrl;
      const tpl = this.template(f.templateId);
      if (tpl && tpl.active !== false) return tpl.url;
      const first = this.templates("image")[0];
      return first ? first.url : "";
    },
    themeFor(f) {
      const tpl = this.template(f.templateId) || {};
      return { textColor: tpl.textColor || "#FFFFFF", accent: tpl.accent || "#FFB020" };
    },

    regions() {
      const set = new Set();
      dataset.festivals.forEach(f => (f.regional || []).forEach(r => r.region && set.add(r.region)));
      return Array.from(set).sort();
    },

    /* Date for a dated record, respecting the user's chosen region. */
    effectiveDate(f, region) {
      if (region && Array.isArray(f.regional)) {
        const r = f.regional.find(x => x.region === region && D.isValid(x.date));
        if (r) return { date: r.date, regional: r };
      }
      return { date: f.date, regional: null };
    },

    isVisible(f) { return f.status === "published"; },

    occursOn(f, iso, region) {
      if (!this.isVisible(f)) return false;
      if (f.recurrence === "daily") return true;
      if (f.recurrence === "weekly") return D.weekday(iso) === Number(f.weekday);
      if (f.recurrence === "once" && D.isValid(f.date)) {
        const eff = this.effectiveDate(f, region);
        const span = f.endDate && D.isValid(f.endDate) ? Math.max(0, D.diffDays(f.date, f.endDate)) : 0;
        const end = D.addDays(eff.date, span);
        return iso >= eff.date && iso <= end;
      }
      return false;
    },

    /* Everything to show for one day, festivals first. */
    itemsForDay(iso, region) {
      const order = { once: 0, weekly: 1, daily: 2 };
      return dataset.festivals
        .filter(f => this.occursOn(f, iso, region))
        .sort((a, b) => (order[a.recurrence] ?? 9) - (order[b.recurrence] ?? 9));
    },

    upcoming(fromIso, days, region) {
      const until = D.addDays(fromIso, days);
      return dataset.festivals
        .filter(f => this.isVisible(f) && f.recurrence === "once" && D.isValid(f.date))
        .map(f => Object.assign({}, f, { _eff: this.effectiveDate(f, region) }))
        .filter(f => f._eff.date > fromIso && f._eff.date <= until)
        .sort((a, b) => a._eff.date.localeCompare(b._eff.date));
    },

    byCategory(cat, today, region) {
      return dataset.festivals
        .filter(f => this.isVisible(f) && (f.category === cat || (f.tags || []).includes(cat)))
        .map(f => Object.assign({}, f, { _eff: f.recurrence === "once" ? this.effectiveDate(f, region) : null }))
        .sort((a, b) => {
          // Upcoming/current dated records first (nearest first), then past, then undated
          const ka = a._eff ? (a._eff.date >= today ? "0" + a._eff.date : "1" + (99999999 - +a._eff.date.replace(/-/g, ""))) : "2";
          const kb = b._eff ? (b._eff.date >= today ? "0" + b._eff.date : "1" + (99999999 - +b._eff.date.replace(/-/g, ""))) : "2";
          return ka.localeCompare(kb);
        });
    },

    popularTags() {
      const counts = {};
      dataset.festivals.filter(f => this.isVisible(f)).forEach(f => (f.tags || []).forEach(t => { if (t !== "weekday") counts[t] = (counts[t] || 0) + 1; }));
      return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    },

    find(id) { return dataset.festivals.find(f => f.id === id) || null; }
  };

  window.SidtoData = Data;
})();
