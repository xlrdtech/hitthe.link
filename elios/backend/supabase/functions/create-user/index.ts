// EliOS — create a subscriber under a master's login (Supabase Edge Function, Deno)
// =====================================================================
// The master console managed leads only; adding a person meant a local Node
// provision-<name>.mjs run with the service_role key. This moves that power
// behind the master's own session so Anthony can add a rep from admin.html.
//
// Route (POST JSON):
//   { full_name: "Rosslyn", username: "rosslyn", password?: "..." }
//     -> 201 { user: { id, email, username, full_name, role }, password? }
//   password omitted => a strong one is generated and returned ONCE so the
//   master can hand it over; it is never stored or logged here.
// Auth: Authorization: Bearer <supabase access token> of a MASTER.
//   The master check reads public.buyers.role (server truth), never
//   user_metadata.role: a signed-in user can rewrite their own metadata.
// Deployed with verify_jwt=false; we verify the token manually so we can
// return clean JSON errors (same as stripe-checkout).
//
// Creates subscribers only. Masters are promoted by the roster SQL seed
// (supabase-schema.sql section 17), not from a browser.
//
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (injected by Supabase),
//   EMAIL_DOMAIN (optional, defaults to trackingtogether.com).
import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EMAIL_DOMAIN = Deno.env.get("EMAIL_DOMAIN") || "trackingtogether.com";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors } });

const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{1,31}$/;

async function requireMaster(req: Request) {
  const authz = req.headers.get("Authorization") || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
  if (!token) return { err: json({ error: "missing bearer token" }, 401) };
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return { err: json({ error: "invalid session" }, 401) };
  const { data: me } = await admin
    .from("buyers").select("role").eq("id", data.user.id).maybeSingle();
  if (me?.role !== "master") return { err: json({ error: "masters only" }, 403) };
  return { user: data.user };
}

// 16 chars from an alphabet without look-alikes (no 0/O, 1/l/I), ~94 bits.
function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function emailTaken(email: string): Promise<boolean> {
  // buyers is 1:1 with auth.users (trigger), so it answers without paging listUsers.
  // eq, not ilike: "_" is a LIKE wildcard and usernames may contain it. Auth stores emails lowercased.
  const { data } = await admin.from("buyers").select("id").eq("email", email).maybeSingle();
  return !!data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const { user: master, err } = await requireMaster(req);
  if (err) return err;

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const fullName = String(body.full_name || "").trim();
  const username = String(body.username || "").trim().toLowerCase();
  const supplied = typeof body.password === "string" ? body.password : "";

  if (!fullName) return json({ error: "full_name is required" }, 400);
  if (!USERNAME_RE.test(username)) {
    return json({ error: "username: 2-32 chars, a-z 0-9 . _ -, starting with a letter or digit" }, 400);
  }
  if (supplied && supplied.length < 8) return json({ error: "password must be at least 8 characters" }, 400);

  const email = `${username}@${EMAIL_DOMAIN}`;
  if (await emailTaken(email)) return json({ error: `username ${username} is already taken` }, 409);

  const password = supplied || generatePassword();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      username,
      role: "subscriber",
      must_change_password: false,
      created_by: master!.id,
    },
  });
  if (error || !data?.user) {
    const taken = /already|registered|exists/i.test(error?.message || "");
    return json({ error: taken ? `username ${username} is already taken` : `create failed: ${error?.message}` }, taken ? 409 : 500);
  }

  // handle_new_user() writes the buyers row; read it back so the console shows truth.
  const { data: row } = await admin
    .from("buyers").select("id, email, full_name, role").eq("id", data.user.id).maybeSingle();
  if (!row) return json({ error: "user created but buyers row missing; check handle_new_user trigger", id: data.user.id }, 500);

  return json({
    user: { id: row.id, email: row.email, username, full_name: row.full_name, role: row.role },
    ...(supplied ? {} : { password }),
  }, 201);
});
