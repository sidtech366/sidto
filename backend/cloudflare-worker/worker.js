/**
 * Sidto — AI image backend (Cloudflare Worker)       STATUS: TEMPLATE, NOT TESTED
 * ---------------------------------------------------------------------------
 * Why a backend? The AI provider needs a key or account binding. That must
 * live on a server, never in the website or APK. This Worker is the only
 * thing that talks to the AI model; the app calls this Worker.
 *
 * Uses Cloudflare Workers AI through an "AI" binding (no API key in code).
 * Workers AI has a daily free allocation at the time of writing, but free
 * tiers change — check Cloudflare's current pricing before relying on it,
 * and set a spending/usage alert in your Cloudflare dashboard.
 *
 * Setup (all from a phone browser, see README Step 7):
 *  1. dash.cloudflare.com → Workers & Pages → Create → Worker → Deploy.
 *  2. Edit code → paste this file → Deploy.
 *  3. Settings → Bindings → Add → Workers AI → variable name: AI.
 *  4. Settings → Variables → add ALLOWED_ORIGIN = https://<you>.github.io
 *  5. Put https://<worker>.workers.dev/generate into js/config.js → imageApiUrl.
 *
 * Model names change over time. Confirm the current model id in the
 * Workers AI model catalogue before deploying.
 */
const MODEL = "@cf/black-forest-labs/flux-1-schnell";
const MAX_PROMPT = 1500;

function cors(env, origin) {
  const allowed = (env.ALLOWED_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
  const ok = allowed.includes(origin);
  return {
    ok,
    headers: {
      "Access-Control-Allow-Origin": ok ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    }
  };
}
const json = (body, status, headers) =>
  new Response(JSON.stringify(body), { status, headers: Object.assign({ "Content-Type": "application/json" }, headers) });

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const c = cors(env, origin);
    if (request.method === "OPTIONS") return new Response(null, { status: c.ok ? 204 : 403, headers: c.headers });

    const url = new URL(request.url);
    if (url.pathname !== "/generate" || request.method !== "POST") return json({ ok: false, error: "Not found" }, 404, c.headers);
    // Origin checks stop casual misuse from other websites. They do NOT stop
    // a determined person using curl. Add a Cloudflare rate-limiting rule
    // and, later, require a signed-in user (see README roadmap).
    if (!c.ok) return json({ ok: false, error: "Origin not allowed" }, 403, c.headers);
    if (!env.AI) return json({ ok: false, error: "Workers AI binding 'AI' is not configured" }, 500, c.headers);

    let body;
    try { body = await request.json(); } catch (e) { return json({ ok: false, error: "Invalid JSON" }, 400, c.headers); }
    const prompt = String(body.prompt || "").slice(0, MAX_PROMPT).trim();
    if (prompt.length < 10) return json({ ok: false, error: "Prompt too short" }, 400, c.headers);

    try {
      const result = await env.AI.run(MODEL, { prompt, steps: 4 });
      if (!result || !result.image) return json({ ok: false, error: "Model returned no image" }, 502, c.headers);
      return json({ ok: true, image: "data:image/jpeg;base64," + result.image }, 200, c.headers);
    } catch (e) {
      const msg = String(e && e.message || e);
      const limited = /limit|quota|429/i.test(msg);
      return json({ ok: false, error: limited ? "Daily AI limit reached — try again tomorrow." : "AI provider error: " + msg.slice(0, 200) }, limited ? 429 : 502, c.headers);
    }
  }
};
