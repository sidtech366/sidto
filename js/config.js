/*
 * Sidto — app configuration
 * ---------------------------------------------------------------
 * This file is PUBLIC. Everything in it is visible to anyone who
 * opens your website or unzips your APK.
 *
 *   NEVER put an API key, password, token or secret in this file.
 *
 * Only put PUBLIC backend URLs here. The secret key lives inside
 * the backend (for example a Cloudflare Worker secret), never here.
 */
window.SIDTO_CONFIG = {
  appName: "Sidto",

  // India time is used for "today", the 5-day history and upcoming lists.
  timeZone: "Asia/Kolkata",

  // Days of history shown in addition to today (5 = today + previous 5 days).
  historyDays: 5,

  // How far ahead the "Upcoming" section looks.
  upcomingDays: 45,

  // Where festival records are loaded from. A plain JSON file in this repo
  // works on GitHub Pages for free. Later you can point this to a backend
  // URL that returns the same JSON shape (see backend/apps-script).
  festivalDataUrl: "data/festivals.json",

  // AI image generation backend (OPTIONAL).
  // Leave empty ("") until you deploy backend/cloudflare-worker.
  // Example: "https://sidto-image.yourname.workers.dev/generate"
  imageApiUrl: "",

  // Endpoint that permanently saves a generated image to the gallery.
  // Not available in the first prototype. Leave empty.
  imageSaveUrl: "",

  // Persistent profiles / accounts backend. Not available yet.
  profileApiUrl: ""
};
