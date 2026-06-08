#!/usr/bin/env node
// Auto-generates sites.json for the hitthe.link root index by scanning top-level dirs.
// Runs on every push via .github/workflows/sites-index.yml — so the root auto-updates as new builds go live.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();

// Internal / ops / experimental / redirect / duplicate dirs — NOT shown on the public root.
// Add a dir name here to hide it. Everything else with an index.html is auto-showcased.
// qi 2026-06-05: NOTHING HIDDEN. Owner reads his entire ecosystem through this
// index via voiceOS, so every page must be listed at full count. Only build/infra
// dirs that have no page of their own are denied. (dot/underscore dirs + redirect
// stubs are still auto-skipped below.) eliops stays robots-noindex on its own page
// but IS listed here so qi can navigate to it.
const DENY = new Set([
  'scripts','assets','_shared', // build/infra only — no standalone page
  'xen-map', // internal Xen/Exedus architecture map — noindex, not for public grid
]);

// Category inference by slug/title keywords (for grouping in the gallery).
function categorize(slug, title) {
  const s = (slug + ' ' + title).toLowerCase();
  if (/calc|price|pricehero|abos|forex|cube|dti|cui|aaoa/.test(s)) return 'Tools & Calculators';
  if (/l7s|luckie|buzycred|exec|self ?exec|selfown|offers|menu|spine|trackingtogether|autophone|custom-er/.test(s)) return 'Business & L7S';
  if (/padre|allendale|church|temple|dirtyhawks|barnlights|equine|eats|electric|rays|wes|8922/.test(s)) return 'Client Sites';
  if (/veinom|ruach|vei|claudeos|xos|xen|mesh|uwi|sao|godmode|firehose/.test(s)) return 'Xen / Voice OS';
  if (/mb|stal|diamond|studio|vvs|slid|music|soul/.test(s)) return 'Music & Studio';
  return 'Builds & Apps';
}

const skip = (n) => n.startsWith('.') || n.startsWith('_') || DENY.has(n);

const entries = [];
for (const name of readdirSync(ROOT)) {
  try {
    const dir = join(ROOT, name);
    if (!statSync(dir).isDirectory() || skip(name)) continue;
    const idx = join(dir, 'index.html');
    if (!existsSync(idx)) continue;
    const html = readFileSync(idx, 'utf8');
    if (/Redirecting…|http-equiv=["']refresh["']/i.test(html) && html.length < 1200) continue; // skip redirect stubs
    const title = (html.match(/<title>([^<]*)<\/title>/i)?.[1] || name).trim()
      .replace(/&amp;/g, '&').replace(/—/g, '—');
    const desc = (html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] || '').trim().slice(0, 160);
    let date = '';
    try { date = execSync(`git log -1 --format=%cI -- "${name}"`, { cwd: ROOT }).toString().trim(); } catch {}
    entries.push({ slug: name, url: '/' + name + '/', title, desc, category: categorize(name, title), updated: date });
  } catch {}
}

entries.sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
const out = { generated: new Date().toISOString(), count: entries.length, sites: entries };
writeFileSync(join(ROOT, 'sites.json'), JSON.stringify(out, null, 2));
console.log(`sites.json: ${entries.length} live builds`);
