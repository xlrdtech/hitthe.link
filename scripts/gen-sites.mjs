#!/usr/bin/env node
// Auto-generates sites.json for the hitthe.link root index by scanning top-level dirs.
// Runs on every push via .github/workflows/sites-index.yml — so the root auto-updates as new builds go live.
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = process.cwd();

// Internal / ops / experimental / redirect / duplicate dirs — NOT shown on the public root.
// Add a dir name here to hide it. Everything else with an index.html is auto-showcased.
const DENY = new Set([
  'audit','commandments','godmode','godsop','god-sop-dashboard','lab','status','firehose','context',
  'itinerary','nblm','nblmaudit','die-list','endpoints','cookbook','pgs','shang','mesh','spine','sao','sao2',
  'uwi','studio','xen','stt','vei','dictate','ggv','agents','asana','costs','docs','growth','oss-sites',
  'ifttt','ios-shortcut-deploy','template-io-mission-control','pin-feed','stal-lyon-populate','vectorgen',
  'beside-proxy','agyveinom','grokveinom','avatar','gov','cellbrowser','wip','slid','grok','firehose',
  'mbv2','mbv3','e','growth','east-allen-growth-interface','god-sop-dashboard','sao2','l7s-hero','l7s-pulse',
  'check-hero','container','extendlm','dcl-demo','stal-lyon','stal-lyon-populate','rays-home','signing',
  'scripts','assets','_shared','codepens','nblmaudit',
  'eliops', // client lead PII (Tracking Together) — live at /eliops but noindex + hidden from public index
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
