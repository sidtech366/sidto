/* Sidto — India-time date helpers.
 * All dates are plain "YYYY-MM-DD" strings so that a festival on
 * 2026-11-08 means 8 November in India, whatever the phone's clock zone.
 */
(function () {
  const TZ = (window.SIDTO_CONFIG && window.SIDTO_CONFIG.timeZone) || "Asia/Kolkata";

  function isoInZone(date, tz) {
    // en-CA formats as YYYY-MM-DD
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  }

  const Dates = {
    /* Today's date in India. For testing you can open the app with
       ?date=2026-11-08 in the address bar (marked as a test date). */
    override: null,
    today() {
      if (this.override) return this.override;
      return isoInZone(new Date(), TZ);
    },
    isValid(iso) { return /^\d{4}-\d{2}-\d{2}$/.test(iso || "") && !isNaN(Date.parse(iso + "T00:00:00Z")); },
    addDays(iso, n) {
      const d = new Date(iso + "T00:00:00Z");
      d.setUTCDate(d.getUTCDate() + n);
      return d.toISOString().slice(0, 10);
    },
    diffDays(a, b) { // b - a in days
      return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);
    },
    weekday(iso) { return new Date(iso + "T00:00:00Z").getUTCDay(); },
    format(iso, lang, opts) {
      const d = new Date(iso + "T00:00:00Z");
      return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", Object.assign({ timeZone: "UTC", day: "numeric", month: "short" }, opts || {})).format(d);
    },
    weekdayShort(iso, lang) {
      return this.format(iso, lang, { weekday: "short", day: undefined, month: undefined });
    }
  };

  try {
    const q = new URLSearchParams(location.search).get("date");
    if (q && Dates.isValid(q)) Dates.override = q;
  } catch (e) {}

  window.SidtoDates = Dates;
})();
