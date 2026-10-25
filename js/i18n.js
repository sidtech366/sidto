/* Sidto — interface text in English and Hindi.
 * To add a word: add the same key to both "en" and "hi".
 * In HTML use data-i18n="key"; in JS use t("key").
 */
(function () {
  const STRINGS = {
    en: {
      tagline: "Festival wishes, made personal",
      nav_home: "Home", nav_categories: "Categories", nav_create: "AI Create",
      nav_video: "Video", nav_profile: "Profile",
      today: "Today", todays_wishes: "Today's wishes", upcoming: "Upcoming festivals",
      last_days: "Recent days", categories: "Categories", popular: "Popular",
      in_days: "in {n} days", tomorrow: "tomorrow", today_lc: "today",
      make_poster: "Make poster", make_video: "Video wish",
      loading: "Loading…", nothing_today: "No festival wishes for this day yet.",
      nothing_upcoming: "No upcoming festivals in the next {n} days.",
      nothing_category: "Nothing here yet. An admin can add records for this category.",
      load_error: "Could not load festival data. Check your internet connection and try again.",
      retry: "Try again",
      sample_banner: "Sample data — dates are examples. Verify with your panchang.",
      draft_banner: "Showing unsaved admin edits from this device only.",
      discard: "Discard",
      unverified: "Date not yet verified",
      regional_note: "Regional date",
      cat_good_morning: "Good Morning", cat_good_night: "Good Night", cat_vrat: "Vrat",
      cat_festival: "Hindu Festivals", cat_deity: "Deity Wishes", cat_jayanti: "Jayanti",
      cat_birthday: "Birthday", cat_special: "Special Days",
      poster: "Poster", poster_title: "Personalised poster",
      name_position: "Name position", font_size: "Font size", photo_size: "Photo size",
      photo_place: "Photo placement", left: "Left", center: "Center", right: "Right",
      text_color: "Text colour", show_photo: "Show photo", show_name: "Show name",
      wish_language: "Wish language", template: "Background",
      save: "Save", share: "Share", saving: "Preparing…",
      saved_ok: "Saved to your downloads.", shared_ok: "Shared.",
      share_fallback: "Sharing images is not supported here, so the poster was downloaded instead.",
      export_error: "Could not create the image. Please try again.",
      set_profile_first: "Add your name and photo in Profile to personalise posters.",
      go_profile: "Open profile",
      video_title: "Video wishes",
      video_intro: "Your name and photo are drawn over a reusable video template.",
      video_choose: "Choose a wish", video_template: "Video template",
      play: "Play", pause: "Pause", restart: "Restart",
      export_video: "Export video (experimental)",
      exporting: "Recording… keep this screen open",
      video_export_ok: "Video exported. Check the file plays before sharing it.",
      video_export_unsupported: "This browser cannot record video. You can still preview the overlay. A server-side renderer is planned (see README).",
      video_note: "The export records the preview in real time using your browser. It produces a silent clip (MP4 or WebM depending on the browser). Large or long templates can be slow on low-memory phones.",
      video_error: "The video template could not be loaded.",
      profile_title: "Your profile", display_name: "Display name",
      name_placeholder: "e.g. Ramesh Sharma", tagline_label: "Line under your name (optional)",
      tagline_placeholder: "e.g. & Family, Jaipur", photo: "Profile photo",
      choose_photo: "Choose photo", remove_photo: "Remove photo",
      region: "Region for dates", region_all: "All India (default)",
      language: "App language", save_profile: "Save profile", profile_saved: "Profile saved on this device.",
      privacy_title: "Privacy",
      privacy_text: "Your name and photo stay in this browser on this phone. They are not uploaded anywhere and do not sync to other devices. Clearing browser data removes them. This is not a secure account.",
      clear_all: "Delete all my data on this device", cleared: "All Sidto data removed from this device.",
      confirm_clear: "Delete your profile, photo and settings from this device?",
      admin_link: "Admin (demo)", about: "About",
      create_title: "AI festival image", create_intro: "Build a detailed prompt, then generate an image through a connected AI provider.",
      occasion: "Festival / occasion", subject: "Deity / subject", art_style: "Art style",
      custom_desc: "Extra details (optional)", custom_placeholder: "e.g. add marigold flowers, evening light",
      aspect: "Shape", text_in_image: "Ask the AI to leave space for text",
      build_prompt: "Build prompt", generate: "Generate image", generating: "Generating…",
      prompt_label: "Generated prompt", copy: "Copy", copied: "Copied",
      not_configured_title: "Image generation is not connected",
      not_configured_text: "Building a prompt is not the same as making an image. No AI image provider is connected yet, so no image was created. You can copy the prompt into an image tool you trust, then upload the result below, or connect a provider through a secure backend (see README, Step 7).",
      gen_failed: "The image provider returned an error:",
      gen_ok: "Image generated by the connected provider.",
      use_in_poster: "Use in poster", save_gallery: "Save to gallery",
      save_gallery_unavailable: "Saving to the shared gallery needs a backend. Not connected yet.",
      upload_own: "Or use an image you already have",
      upload_own_hint: "Stays on this device only.",
      photo_too_big: "That file could not be read as an image.",
      style_traditional: "Traditional painting", style_watercolor: "Soft watercolour",
      style_3d: "3D devotional render", style_minimal: "Minimal flat illustration",
      style_rangoli: "Rangoli / folk art", style_photo: "Photorealistic",
      square: "Square 1:1", portrait: "Portrait 4:5", story: "Story 9:16",
      back: "Back", close: "Close"
    },
    hi: {
      tagline: "त्योहार की शुभकामनाएँ, आपके नाम से",
      nav_home: "होम", nav_categories: "श्रेणियाँ", nav_create: "AI बनाएँ",
      nav_video: "वीडियो", nav_profile: "प्रोफ़ाइल",
      today: "आज", todays_wishes: "आज की शुभकामनाएँ", upcoming: "आने वाले त्योहार",
      last_days: "पिछले दिन", categories: "श्रेणियाँ", popular: "लोकप्रिय",
      in_days: "{n} दिन में", tomorrow: "कल", today_lc: "आज",
      make_poster: "पोस्टर बनाएँ", make_video: "वीडियो शुभकामना",
      loading: "लोड हो रहा है…", nothing_today: "इस दिन के लिए अभी कोई शुभकामना नहीं है।",
      nothing_upcoming: "अगले {n} दिनों में कोई त्योहार नहीं है।",
      nothing_category: "यहाँ अभी कुछ नहीं है। एडमिन इस श्रेणी में रिकॉर्ड जोड़ सकते हैं।",
      load_error: "त्योहार की जानकारी लोड नहीं हो सकी। इंटरनेट जाँचें और फिर से कोशिश करें।",
      retry: "फिर से कोशिश करें",
      sample_banner: "नमूना डेटा — तिथियाँ उदाहरण हैं। अपने पंचांग से पुष्टि करें।",
      draft_banner: "केवल इस डिवाइस पर किए गए एडमिन बदलाव दिख रहे हैं।",
      discard: "हटाएँ",
      unverified: "तिथि की पुष्टि बाकी",
      regional_note: "क्षेत्रीय तिथि",
      cat_good_morning: "सुप्रभात", cat_good_night: "शुभ रात्रि", cat_vrat: "व्रत",
      cat_festival: "हिंदू त्योहार", cat_deity: "देव शुभकामनाएँ", cat_jayanti: "जयंती",
      cat_birthday: "जन्मदिन", cat_special: "विशेष दिन",
      poster: "पोस्टर", poster_title: "आपका पोस्टर",
      name_position: "नाम की जगह", font_size: "अक्षर का आकार", photo_size: "फ़ोटो का आकार",
      photo_place: "फ़ोटो की जगह", left: "बाएँ", center: "बीच", right: "दाएँ",
      text_color: "अक्षर का रंग", show_photo: "फ़ोटो दिखाएँ", show_name: "नाम दिखाएँ",
      wish_language: "शुभकामना की भाषा", template: "पृष्ठभूमि",
      save: "सेव करें", share: "शेयर करें", saving: "तैयार हो रहा है…",
      saved_ok: "डाउनलोड में सेव हो गया।", shared_ok: "शेयर हो गया।",
      share_fallback: "यहाँ फ़ोटो शेयर नहीं हो सकती, इसलिए पोस्टर डाउनलोड कर दिया गया।",
      export_error: "फ़ोटो नहीं बन सकी। फिर से कोशिश करें।",
      set_profile_first: "पोस्टर पर नाम और फ़ोटो के लिए प्रोफ़ाइल भरें।",
      go_profile: "प्रोफ़ाइल खोलें",
      video_title: "वीडियो शुभकामनाएँ",
      video_intro: "आपका नाम और फ़ोटो एक तैयार वीडियो पर दिखाया जाता है।",
      video_choose: "शुभकामना चुनें", video_template: "वीडियो टेम्पलेट",
      play: "चलाएँ", pause: "रोकें", restart: "शुरू से",
      export_video: "वीडियो बनाएँ (प्रायोगिक)",
      exporting: "रिकॉर्ड हो रहा है… यह स्क्रीन खुली रखें",
      video_export_ok: "वीडियो बन गया। शेयर करने से पहले चलाकर देखें।",
      video_export_unsupported: "यह ब्राउज़र वीडियो रिकॉर्ड नहीं कर सकता। आप प्रीव्यू देख सकते हैं। सर्वर से वीडियो बनाने की योजना README में है।",
      video_note: "वीडियो आपके ब्राउज़र में रियल-टाइम में रिकॉर्ड होता है। यह बिना आवाज़ का क्लिप बनाता है (ब्राउज़र के अनुसार MP4 या WebM)। कम मेमोरी वाले फ़ोन पर धीमा हो सकता है।",
      video_error: "वीडियो टेम्पलेट लोड नहीं हो सका।",
      profile_title: "आपकी प्रोफ़ाइल", display_name: "आपका नाम",
      name_placeholder: "जैसे रमेश शर्मा", tagline_label: "नाम के नीचे लाइन (वैकल्पिक)",
      tagline_placeholder: "जैसे एवं परिवार, जयपुर", photo: "प्रोफ़ाइल फ़ोटो",
      choose_photo: "फ़ोटो चुनें", remove_photo: "फ़ोटो हटाएँ",
      region: "तिथियों के लिए क्षेत्र", region_all: "पूरा भारत (डिफ़ॉल्ट)",
      language: "ऐप की भाषा", save_profile: "प्रोफ़ाइल सेव करें", profile_saved: "प्रोफ़ाइल इस डिवाइस पर सेव हो गई।",
      privacy_title: "निजता",
      privacy_text: "आपका नाम और फ़ोटो केवल इसी फ़ोन के ब्राउज़र में रहते हैं। ये कहीं अपलोड नहीं होते और दूसरे डिवाइस पर नहीं जाते। ब्राउज़र डेटा साफ़ करने पर ये हट जाएँगे। यह सुरक्षित अकाउंट नहीं है।",
      clear_all: "इस डिवाइस से मेरा सारा डेटा हटाएँ", cleared: "Sidto का सारा डेटा इस डिवाइस से हटा दिया गया।",
      confirm_clear: "प्रोफ़ाइल, फ़ोटो और सेटिंग इस डिवाइस से हटाएँ?",
      admin_link: "एडमिन (डेमो)", about: "जानकारी",
      create_title: "AI त्योहार चित्र", create_intro: "विस्तृत प्रॉम्प्ट बनाएँ, फिर जुड़े हुए AI प्रोवाइडर से चित्र बनाएँ।",
      occasion: "त्योहार / अवसर", subject: "देवता / विषय", art_style: "चित्र शैली",
      custom_desc: "अतिरिक्त विवरण (वैकल्पिक)", custom_placeholder: "जैसे गेंदे के फूल, शाम की रोशनी",
      aspect: "आकार", text_in_image: "AI से लिखने की जगह छोड़ने को कहें",
      build_prompt: "प्रॉम्प्ट बनाएँ", generate: "चित्र बनाएँ", generating: "बन रहा है…",
      prompt_label: "बना हुआ प्रॉम्प्ट", copy: "कॉपी", copied: "कॉपी हो गया",
      not_configured_title: "चित्र बनाने की सेवा जुड़ी नहीं है",
      not_configured_text: "प्रॉम्प्ट बनाना चित्र बनाना नहीं है। अभी कोई AI चित्र प्रोवाइडर जुड़ा नहीं है, इसलिए कोई चित्र नहीं बना। आप प्रॉम्प्ट कॉपी करके किसी भरोसेमंद टूल में चित्र बनाएँ और नीचे अपलोड करें, या सुरक्षित बैकएंड से प्रोवाइडर जोड़ें (README, चरण 7)।",
      gen_failed: "चित्र प्रोवाइडर से त्रुटि आई:",
      gen_ok: "जुड़े हुए प्रोवाइडर ने चित्र बनाया।",
      use_in_poster: "पोस्टर में लगाएँ", save_gallery: "गैलरी में सेव करें",
      save_gallery_unavailable: "साझा गैलरी में सेव करने के लिए बैकएंड चाहिए। अभी जुड़ा नहीं है।",
      upload_own: "या अपना कोई चित्र लगाएँ",
      upload_own_hint: "केवल इसी डिवाइस पर रहेगा।",
      photo_too_big: "यह फ़ाइल चित्र के रूप में नहीं खुल सकी।",
      style_traditional: "पारंपरिक चित्रकला", style_watercolor: "हल्का जलरंग",
      style_3d: "3D भक्ति चित्र", style_minimal: "सरल फ़्लैट चित्र",
      style_rangoli: "रंगोली / लोक कला", style_photo: "असली फ़ोटो जैसा",
      square: "वर्गाकार 1:1", portrait: "पोर्ट्रेट 4:5", story: "स्टोरी 9:16",
      back: "वापस", close: "बंद करें"
    }
  };

  let lang = "hi";
  // Default is Hindi; the user's saved choice wins.
  try { lang = localStorage.getItem("sidto.lang") || "hi"; } catch (e) {}
  if (!STRINGS[lang]) lang = "en";

  window.I18N = {
    get lang() { return lang; },
    set(l) {
      if (!STRINGS[l]) return;
      lang = l;
      try { localStorage.setItem("sidto.lang", l); } catch (e) {}
      document.documentElement.lang = l;
      this.apply();
    },
    t(key, vars) {
      let s = (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
      if (vars) Object.keys(vars).forEach(k => { s = s.replace("{" + k + "}", vars[k]); });
      return s;
    },
    apply(root) {
      (root || document).querySelectorAll("[data-i18n]").forEach(el => { el.textContent = this.t(el.dataset.i18n); });
      (root || document).querySelectorAll("[data-i18n-ph]").forEach(el => { el.placeholder = this.t(el.dataset.i18nPh); });
    }
  };
  window.t = (k, v) => window.I18N.t(k, v);
  document.documentElement.lang = lang;
})();
