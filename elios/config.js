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
  // ---- Supabase (Auth + RLS-scoped data reads) --------------------
  // Project: "elios-buyer-portal" (dedicated). Settings > API.
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
