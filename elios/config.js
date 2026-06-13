/* ===================================================================
   EliOS Buyer Portal — PUBLIC runtime config
   -------------------------------------------------------------------
   SAFE-BY-DESIGN PUBLIC KEYS ONLY. Do NOT put any secret here.
   This file ships to the browser. The following keys are public and
   safe to expose (they are protected by Supabase RLS + Stripe design):

     - Supabase anon / publishable key  (RLS is the security boundary)
     - Stripe publishable key (pk_live_... or pk_test_...)

   NEVER place here:
     - Supabase service_role key            -> Cloudflare Worker secret
     - Stripe secret key (sk_live_...)        -> Cloudflare Worker secret
     - Stripe webhook signing secret          -> Cloudflare Worker secret
     - Google OAuth client SECRET             -> Supabase Auth provider config

   Fill the __PLACEHOLDER__ values below before going live.
   =================================================================== */

window.ELIOS_CONFIG = {
  // ---- EliOS auth + leads API (the LIVE path) ---------------------
  // omnimind.js on the Mac spine, exposed via the api.xlrd.org tunnel.
  // Endpoints (all under this base):
  //   POST /api/elios/login   { username, password } -> { token, user, redirect }
  //   GET  /api/elios/me      (Bearer)               -> { username, role, redirect }
  //   GET  /api/elios/leads   (Bearer)               -> { role, count, leads[] }  (scoped server-side)
  //   GET  /api/elios/roster  (Bearer, master only)  -> { roster[], total_leads }
  //   POST /api/elios/assign  (Bearer, master only)  { subscriber, lead_ids[] }
  // The session token is an HMAC-signed string; it is stored in localStorage
  // and sent as `Authorization: Bearer <token>`. Per-user access is enforced
  // SERVER-SIDE (a subscriber can never fetch another user's leads).
  // Honest caveat: this backend lives on the Mac spine (single point of
  // failure) -- the deliberate no-gate tradeoff.
  API_BASE: "https://api.xlrd.org/api/elios",
  TOKEN_KEY: "elios_token",

  // ---- Supabase (legacy / unused; kept for the pricing+billing path)
  // The auth + leads path no longer uses Supabase. These remain only so the
  // pricing page's optional Stripe wiring does not error if referenced.
  // Project: "elios-buyer-portal" (dedicated). NOT YET CREATED as of 2026-06-12
  // (Supabase MCP is unauthenticated; no project ref discovered). Once the
  // project exists, fill BOTH values from ONE dashboard page:
  //
  //   Supabase Dashboard > (select the elios-buyer-portal project)
  //     > Project Settings (gear, bottom-left) > API
  //       * "Project URL"           -> paste into SUPABASE_URL below
  //                                    (it looks like  https://<project-ref>.supabase.co)
  //       * "Project API keys" > "anon" / "public"  -> paste into SUPABASE_ANON_KEY
  //         (the anon/publishable key; SAFE in the browser — RLS is the boundary.
  //          NEVER paste the "service_role" key here — that is a Worker secret.)
  //
  //   <project-ref> is the same slug in the Project URL and in every
  //   https://<project-ref>.supabase.co/auth/v1/callback redirect URI.
  SUPABASE_URL:      "__SUPABASE_URL__",        // e.g. https://abcdxyz.supabase.co
  SUPABASE_ANON_KEY: "__SUPABASE_ANON_KEY__",   // anon / publishable key (public, RLS-protected)

  // ---- Stripe (publishable key only) ------------------------------
  STRIPE_PUBLISHABLE_KEY: "__STRIPE_PK_LIVE__", // pk_live_... (public)

  // ---- Stripe Price IDs (created in Stripe Dashboard > Products) ---
  // These map to the two recurring plans. Public identifiers, safe here.
  STRIPE_PRICE_PLAN_A: "__STRIPE_PRICE_PLAN_A__", // 30 leads / mo / $100
  STRIPE_PRICE_PLAN_B: "__STRIPE_PRICE_PLAN_B__", // 15 leads / mo / $40

  // ---- Cloudflare Worker API base ---------------------------------
  // The thin glue layer that holds the ONLY secrets (service-role,
  // stripe sk, webhook secret). Exposes authed endpoints:
  //   POST /api/create-checkout-session
  //   POST /api/create-portal-session
  WORKER_API_BASE: "__WORKER_API_BASE__",       // e.g. https://elios-api.<acct>.workers.dev

  // ---- Plan catalog (display only; quota is enforced server-side) --
  PLANS: {
    plan_a: { name: "Plan A", price: 100, leads: 30, interval: "month" },
    plan_b: { name: "Plan B", price: 40,  leads: 15, interval: "month" }
  },

  // ---- Routes (GitHub Pages static paths) -------------------------
  ROUTES: {
    login:     "/elios/index.html",
    dashboard: "/elios/dashboard.html",
    pricing:   "/elios/pricing.html"
  }
};
