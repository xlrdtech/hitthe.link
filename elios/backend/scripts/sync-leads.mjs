/**
 * EliOS — Lead Master -> Supabase sync (one-off / re-runnable)
 * ===========================================================
 * Idempotently upserts the 520 leads into public.leads. Two source modes:
 *
 *   1) JSON  (default): reads the live export at ../../eliops/leads.json
 *              shape: { leads: [{id,name,phone,service,event,status,rep,added,notes}, ...] }
 *              -> source_ref = String(id)  (unique, idempotent)
 *
 *   2) ASANA (--source=asana): pulls tasks from the Asana "Lead Master" project
 *              -> asana_gid = task.gid       (unique, idempotent)
 *              Requires ASANA_PAT + ASANA_LEAD_MASTER_PROJECT_GID.
 *
 * Field mapping (JSON):  service->project_type, status->pipeline_stage, notes->notes
 * Never marks a lead 'retired'/'granted' here — only inserts/updates inventory.
 * Existing 'granted' leads are NOT reset to 'available' (status is left untouched
 * on update so we never re-sell a lead a buyer already received).
 *
 * Usage (Node 18+, service-role key in env — NEVER commit it):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/sync-leads.mjs
 *   ... node scripts/sync-leads.mjs --source=asana
 *
 * This is an OPERATOR script (runs with the service-role key); it is not part
 * of the Worker bundle and holds no secrets.
 */
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const source = (process.argv.find(a => a.startsWith('--source=')) || '').split('=')[1] || 'json';

async function fromJson() {
  const path = resolve(__dirname, '..', '..', 'eliops', 'leads.json');
  const raw = JSON.parse(await readFile(path, 'utf8'));
  const arr = Array.isArray(raw) ? raw : raw.leads || [];
  return arr.map((l) => ({
    source_ref: String(l.id),
    name: l.name || null,
    phone: l.phone || null,
    project_type: l.service || null,
    event: l.event && l.event !== 'Unknown' ? l.event : null,
    rep: l.rep && l.rep !== 'Unassigned' ? l.rep : null,
    pipeline_stage: l.status || null,
    notes: l.notes || null,
    source: 'eliops_leads_json',
  }));
}

async function fromAsana() {
  const PAT = process.env.ASANA_PAT;
  const PROJECT = process.env.ASANA_LEAD_MASTER_PROJECT_GID;
  if (!PAT || !PROJECT) {
    console.error('Asana mode needs ASANA_PAT and ASANA_LEAD_MASTER_PROJECT_GID.');
    process.exit(1);
  }
  const out = [];
  let offset = null;
  do {
    const u = new URL(`https://app.asana.com/api/1.0/projects/${PROJECT}/tasks`);
    u.searchParams.set('opt_fields', 'name,notes,custom_fields,memberships.section.name,completed');
    u.searchParams.set('limit', '100');
    if (offset) u.searchParams.set('offset', offset);
    const res = await fetch(u, { headers: { Authorization: `Bearer ${PAT}` } });
    if (!res.ok) throw new Error(`Asana ${res.status}: ${await res.text()}`);
    const body = await res.json();
    for (const t of body.data) {
      out.push({
        asana_gid: t.gid,
        name: t.name || null,
        notes: t.notes || null,
        // Section name doubles as the pipeline stage in Asana boards.
        pipeline_stage: t.memberships?.[0]?.section?.name || null,
        source: 'asana_lead_master',
      });
    }
    offset = body.next_page?.offset || null;
  } while (offset);
  return out;
}

async function main() {
  const rows = source === 'asana' ? await fromAsana() : await fromJson();
  const onConflict = source === 'asana' ? 'asana_gid' : 'source_ref';
  console.log(`Syncing ${rows.length} leads from ${source} (upsert on ${onConflict})...`);

  // Chunk upserts to keep payloads small.
  let done = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error } = await db.from('leads').upsert(chunk, { onConflict, ignoreDuplicates: false });
    if (error) throw new Error(`upsert chunk ${i}: ${error.message}`);
    done += chunk.length;
    console.log(`  upserted ${done}/${rows.length}`);
  }
  const { count } = await db.from('leads').select('id', { count: 'exact', head: true });
  console.log(`Done. leads table now has ${count} rows.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
