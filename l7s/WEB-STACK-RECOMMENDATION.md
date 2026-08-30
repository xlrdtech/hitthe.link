# L7S / East Allen — web stack recommendation

**Written 2026-08-29. Decision needed tonight.**
Scope: replace what Wix still holds, and stand up the four capabilities qi named at 19:26:

> *"a website that can be easily updated and that can host, that can be attached to a CRM,
> a landing page \[builder\], and the e-commerce store for digital products."*

Nothing was signed up for, purchased, or logged into to write this. Every price below is marked
**VERIFIED** (fetched from the vendor tonight) or **UNVERIFIED** (vendor page blocked me — check it
before you spend).

---

## ⚡ THE ANSWER FIRST — END STATE AND MONEY

**End state:** l7sinc.com stays exactly where it is (his own GitHub repo), gains an admin login at
`l7sinc.com/admin` he can use from his phone, sells digital products through an embed on his own
pricing page, and drops every form submission into a CRM he already owns.

**New money out of pocket: $0.00/month.**

**Total fixed annual cost: ~$29.18/year — $10.18 domain renewal + $19 Carrd (optional).**
That is **$2.43/month**, and $1.58 of it is optional.

**Everything else on the list is either free-tier or a per-sale fee that only bills when he gets paid.**
There is no bridge-with-an-exit-plan needed here, because there is nothing paid to exit.

**Variable cost: ~8.5% of digital sales** at launch, dropping to **5.5%** if he ever passes
$3,500/month — and that is a knob he turns later, not a decision he makes tonight.

---

## 🎯 WHAT HE ALREADY OWNS THAT COVERS THESE NEEDS

Pulled from his own vault tonight. **Three of the four capabilities are already paid for or already free
in accounts that exist.** Usernames listed so he can find the right one — there are duplicates.

| Need | Already has | Account | Status |
|---|---|---|---|
| **CRM** | **HubSpot** | `admin@selfexec.com` (two portals, incl. `app-na2`) | ✅ Covers it, free tier |
| CRM (backup) | Zoho | `xlrdtech@gmail.com` | ✅ Free edition, 3 users |
| **Payments** | **Stripe** | `xlrdtech@gmail.com` + `selfexec.com@gmail.com` | ✅ **Already loaded on the live site** |
| **Landing pages** | **Carrd** | `xlrdtech@gmail.com` | ✅ Covers it, $19/yr for custom domain |
| Digital store | Gumroad | (vault entry, no URL) | ⚠️ Owned but **worst fee** — see cost table |
| Booking | Cal.com | `cal.com/l7sinc` | ✅ **Already linked on the live site**, free tier |
| Email marketing | Mailchimp | `admin@xlrdtech.com` | ⚠️ Owned; Payhip includes this free, so likely redundant |
| Storefront (physical) | Big Cartel ×4, Shopify ×3, Printful | various | ⛔ Not needed — **no shipping, no inventory** |
| Other payment rails | Square ×3, PayPal ×10+, Patreon, Bandcamp | various | Not needed for this build |
| CRM-ish (client work) | GoHighLevel | 2 credential files in `~/.xen` (`crj_`, `loan_hero_`) | ⚠️ These look **client-scoped**, not L7S's own — confirm before reusing |

**The only genuinely new account this plan needs is Payhip.** One signup, free tier, no card.

⚠️ **Do not reach for GoHighLevel to solve the CRM.** He has two GHL credential files, but both are
named for clients (`crj`, `loan_hero`). Running L7S's own book of business inside a client's
sub-account is exactly the coupling that makes it impossible to leave later — and GHL is a paid
platform that would recreate the all-in-one trap. HubSpot Free is already his and costs nothing.

---

## 📐 GROUND TRUTH — measured on the live site tonight

I fetched `https://l7sinc.com/` and read the repo. This is what is actually there:

```
HTTP 200 · 133,415 bytes · served from GitHub Pages
Repo: github.com/l7shub/l7sinc.com — public, 76 commits
Files: agent/  assets/  CNAME  dashboard.html  favicon.ico  index.html
       launch.html  pricing.html  refund-policy.html  site.webmanifest
       survey.html  tests.html
```

**Already wired, carries over at zero cost:**
- `js.stripe.com/v3/` — **Stripe is already on the page.**
- `cal.com/l7sinc` — booking already live.
- `cdn.tailwindcss.com` + `unpkg.com/lucide` — styling and icons, no build step.
- `<form id="intake-form">` — a lead form already exists in the markup.
- `refund-policy.html` — he already built the page a store needs.

🔴 **DEFECT FOUND, unrelated to this decision but live right now:**
```
googletagmanager.com/gtag/js?id=G-XXXXXXXXXX
facebook.com/tr?id=YOUR_PIXEL_ID
```
Both analytics tags are **unreplaced placeholders**. The site has been collecting **zero** analytics
and zero pixel data for as long as those have been there. Fix or remove them in the same pass — this
is a 2-minute change that has been silently costing him every visitor's data.

---

## ✅ PRIMARY STACK — "own the repo, rent nothing you can't leave in a day"

| Capability | Tool | Monthly cost | What it locks in | How to leave |
|---|---|---|---|---|
| **Registrar + DNS** | **Spaceship** | **$0.85** ($10.18/yr renewal) | Nothing — standard EPP transfer | Request auth code, move to any registrar in ~5 days |
| **Hosting** | **Cloudflare Pages** (free) | **$0.00** | Nothing — it builds from *his* GitHub repo | Repoint DNS. The repo is the truth; the host is disposable |
| **⭐ Editing surface** | **Sveltia CMS** at `/admin` (MIT, free) | **$0.00** | Nothing — content is markdown in his repo | Delete one folder. The content files stay |
| **CRM** | **HubSpot Free** *(already has)* | **$0.00** | Soft — contact history lives at HubSpot | CSV export → Zoho (also already his) |
| **Landing pages** | **Carrd Pro Standard** *(already has)* | **$1.58** ($19/yr) | Low — pages are Carrd-hosted | Rebuild as static HTML on Pages (free) |
| **Digital store** | **Payhip Free** | **$0.00** + 5%/sale | Medium — product pages + file hosting at Payhip | Products are just files; re-upload anywhere |
| **Payments** | **his own Stripe** *(already on the page)* | **$0.00** + 2.9% + $0.30 | Nothing | — |
| **Booking** | **Cal.com Free** *(already live)* | **$0.00** | Nothing — open source, self-hostable | Self-host, or export links |
| **Mail** | **Google Workspace** *(unchanged)* | no change | — | Not touched by this plan |
| | **TOTAL NEW FIXED COST** | **$2.43/mo** | | |

**Why this shape:** every single piece can be removed without taking the others down, because the
**content lives in a git repo he controls** and the **payment rail is his own Stripe account**. That is
the structural opposite of Wix. If Payhip vanishes tomorrow, the website does not blink.

### Verified numbers behind that table
- **Cloudflare Pages Free** — 500 builds/month, 100 projects, 20,000 files, 25 MiB max per file;
  static asset requests are *"free and unlimited"*. Functions share 100,000 requests/day with Workers.
  (VERIFIED — `developers.cloudflare.com/pages/platform/limits/` + `/pages/functions/pricing/`)
  ⚠️ A hard *bandwidth* cap was **not stated** on either page. UNVERIFIED — but static requests being
  unlimited is the load-bearing part for a 133 KB brochure site.
- **Payhip** — Free $0/mo **+5% per sale**; Plus $29/mo **+2%**; Pro $99/mo **0%**. The pricing page
  states Free carries *"All features"*, *"Unlimited products"*, *"Unlimited revenue"*, and the FAQ asks
  *"Why do all plans have the same features?"* — **the tiers differ only in transaction fee, not
  features.** (VERIFIED — `payhip.com/pricing`)
- **Stripe** — 2.9% + $0.30 for domestic US online cards. *"No setup fees, monthly fees, or hidden
  fees."* (VERIFIED — `stripe.com/pricing`)
- **HubSpot Free CRM** — **1,000 contacts, 2 users**, free with no expiration. Free forms are
  embeddable on an external site and the free tracking code installs on any page.
  (VERIFIED — `hubspot.com/pricing/crm` + `knowledge.hubspot.com/forms/set-up-and-style-your-form-on-an-external-site`)
  ⚠️ **Conflict worth knowing:** older HubSpot community threads cite a **1,000,000** contact limit.
  The current pricing page and recent (Jan 2026) support confirmations both say **1,000**. Plan for
  1,000. Cheapest paid step up is **Starter $7/seat/mo**.
- **Carrd** — Pro Standard **from $19/year**. The **free plan does NOT include a custom domain** (3
  sites on a `.carrd.co` subdomain only). $19/yr is the cheapest tier with custom domain + forms.
  (VERIFIED via search; `carrd.co/pricing` 301s to `carrd.com/pricing` which returned 404 to me)
- **Cal.com Free** — 1 user, unlimited event types and calendars, payments via Stripe & PayPal.
  Cheapest paid is $12/user/mo. (VERIFIED — `cal.com/pricing`)
- **Sveltia CMS** — free, open source, git-based, framework-agnostic, **mobile support**, high
  compatibility with existing Decap configs. (VERIFIED — `github.com/sveltia/sveltia-cms`)
- **Spaceship .com** — registration $9.08, **renewal $10.18, transfer $9.68** (figures dated May 2026);
  free WHOIS privacy for life, free DNS with full A/CNAME/MX/TXT control, DNSSEC included.
  ⚠️ **UNVERIFIED — `spaceship.com` returned HTTP 403 to me.** These come from registrar-comparison
  sites, not from Spaceship. **Check the actual checkout price before paying.**

---

## 🔑 THE PART THAT ACTUALLY DECIDES THIS: who edits, and how

Everything above is cheap. **This is the requirement that is easy to fake and hard to deliver**, so here
it is concretely.

### The editing surface, step by step
1. qi opens **`l7sinc.com/admin`** on his phone or laptop.
2. He signs in **with his GitHub account** — no new password.
3. He sees **form fields**, not code: a text box for the headline, a list of services, a price field.
4. He types, hits **Publish**.
5. Sveltia commits to `l7shub/l7sinc.com` → Cloudflare Pages rebuilds → **live in ~20 seconds**.

**No editor. No terminal. No git. No Xen in the loop.** That is the bar, and this clears it.

### ⚠️ The one setup step that is NOT zero-config — stated plainly
GitHub's API needs an OAuth app, so logging in requires **one free Cloudflare Worker**
(`sveltia/sveltia-cms-auth`) plus **one GitHub OAuth app registration**. Deploy the Worker, copy its
URL, register the OAuth app, paste the client ID/secret, point `config.yml` at the Worker.
**One-time, ~15 minutes, $0.** After that he never sees it again.
*(A GitHub personal access token also works and skips the Worker entirely — but that is the
developer path, not the "qi edits his own site" path. Do the Worker.)*

### It works on his current hosting
Sveltia/Decap/Pages CMS are **static files served from the site itself**. They work on **GitHub Pages
today** and on **Cloudflare Pages** after the move. He does not have to move hosts to get the CMS —
the two changes are independent, which means neither one can block the other tonight.

### Alternatives considered for this slot
- **Decap CMS** (MIT, free, GitHub/GitLab/Bitbucket, web UI with rich text and drag-drop media) —
  the older, more battle-tested option. Weaker on mobile. Fine fallback.
- **Pages CMS** (free, open source, no-code UI over a GitHub repo, no subscription) — lightest setup,
  configured by one `.pages.yml`.
- ⛔ **Rejected: "he opens a file in an editor."** That fails his stated requirement outright and is not
  offered here in any form.

---

## 🔁 FALLBACK STACK — same spine, different commerce and CRM

Use this if Payhip's 5% grates at volume, or if sales-tax/VAT filing becomes a real chore.

| Capability | Tool | Monthly cost | What it locks in | How to leave |
|---|---|---|---|---|
| Registrar + DNS | Spaceship | $0.85 | Nothing | Auth code |
| Hosting | **GitHub Pages** (stay put) | **$0.00** | Nothing | It is already his repo |
| Editing surface | **Decap CMS** or **Pages CMS** | $0.00 | Nothing | Delete the folder |
| CRM | **Zoho CRM Free** *(already has)* — 3 users | $0.00 | Soft — export CSV | CSV → HubSpot |
| Landing pages | **Cloudflare Pages** (hand-built) | $0.00 | Nothing | It is HTML |
| Digital store | **Lemon Squeezy** (merchant of record) | $0.00 + ~5% + $0.50 | Medium — MoR owns the customer relationship | Export customers; re-point to Stripe |
| Payments | Handled by the MoR | — | — | — |
| **TOTAL NEW FIXED COST** | | **$0.85/mo** | | |

**Why you'd pick it:** Lemon Squeezy is **merchant of record** — it becomes the legal seller and files
sales tax/VAT for him. At $50 sales that is **6.0% all-in vs Payhip Free's 8.5%**, *and* it deletes a
compliance chore. Cheaper and less admin.

**Why it is the fallback, not the primary — three honest reasons:**
1. ⚠️ **I could not verify the fee.** Both `lemonsqueezy.com/pricing` and `docs.lemonsqueezy.com`
   returned **HTTP 403** to me. The 5% + $0.50 figure is from **secondary sources only**.
   **Check the real pricing page before committing.**
2. **It is a brand-new account** — Payhip is too, but Payhip's terms I actually read tonight.
3. **Lemon Squeezy was acquired by Stripe.** That is not automatically bad, but a platform whose
   future is somebody else's roadmap decision is a worse place to put the storefront than one where
   he holds the Stripe keys himself. ⚠️ Its current standalone status is **UNVERIFIED** — confirm the
   product is still being sold to new merchants before building on it.

---

## 💰 REAL TOTAL COST AT REAL VOLUME — not the sticker

Modeled at a **$50 average digital product**, which is his actual shape. *(His 5x-cost pricing rule
means a $10-cost product lists at $50.)*

### At $1,000/month gross — 20 sales

| Option | Platform fee | Processing | **Total cost** | **Effective** | **He keeps** |
|---|---|---|---|---|---|
| **Stripe only** + own delivery | $0 | $29.00 + $6.00 | **$35.00** | **3.50%** | **$965.00** |
| Lemon Squeezy ⚠️ | $50.00 | included | **$60.00** | 6.00% | $940.00 |
| **Payhip Plus** ($29/mo) | $29 + $20.00 | $35.00 | **$84.00** | 8.40% | $916.00 |
| **⭐ Payhip Free** | $50.00 | $35.00 | **$85.00** | 8.50% | $915.00 |
| Gumroad *(he owns it)* | $100.00 + $10.00 | included | **$110.00** | **11.00%** | $890.00 |

### At $5,000/month gross — 100 sales

| Option | Platform fee | Processing | **Total cost** | **Effective** | **He keeps** |
|---|---|---|---|---|---|
| **Stripe only** + own delivery | $0 | $145 + $30 | **$175.00** | **3.50%** | **$4,825** |
| **Payhip Pro** ($99/mo) | $99.00 | $175.00 | **$274.00** | 5.48% | $4,726 |
| Lemon Squeezy ⚠️ | $250.00 | included | **$300.00** | 6.00% | $4,700 |
| **Payhip Plus** ($29/mo) | $29 + $100 | $175.00 | **$304.00** | 6.08% | $4,696 |
| **Payhip Free** | $250.00 | $175.00 | **$425.00** | 8.50% | $4,575 |
| Gumroad *(he owns it)* | $500 + $50 | included | **$550.00** | **11.00%** | $4,450 |

### The two numbers to remember
- **Payhip Free → Plus pays for itself above $967/month gross.** (3% saved = $29 subscription)
- **Payhip Plus → Pro pays for itself above $3,500/month gross.** (2% saved = $70 more)

**Start on Free. Move up when the revenue moves, not before.** Payhip's own FAQ confirms the tiers are
feature-identical, so upgrading later costs him nothing but the fee change — no migration, no rebuild.

### ⛔ The one he already owns that he should NOT use
**Gumroad is the most expensive option at every volume — 11% flat, worst in the table.** He owns it,
but "already owns it" loses to "costs 2.5x more." At $5,000/month Gumroad costs **$550 vs Payhip
Plus's $304** — a **$246/month** difference for the same job. Verified: 10% + $0.50 direct, and **30%**
if the buyer arrives via Gumroad's marketplace.

### The maximum-margin option, named honestly
**Stripe Payment Links alone is 3.5% — less than half of everything else** — because he already has
Stripe and pays no platform cut. **But Stripe does not deliver files.** He would need a Cloudflare
Worker + R2 to serve signed download links, plus license-key logic if he ever wants it. That is
**code he owns and maintains forever.** It is the right answer *later*, at volume, when 5% of a real
number justifies the build. It is the wrong answer tonight, because it is the one option that cannot
be stood up without an engineer in the loop every time something breaks. **Revisit at $5,000/month,
where it saves $250/month.**

---

## 🚧 MIGRATION COST — what carries, what gets rebuilt

### ✅ Carries over untouched — zero work
- **The whole repo.** 76 commits, all HTML and assets. Cloudflare Pages serves static HTML from a
  GitHub repo with **no build step** — connect and deploy.
- **The custom domain** (`CNAME` is already in the repo).
- **Stripe.js**, already loaded on the page.
- **The Cal.com booking link**, already live.
- **All design and Tailwind styling.** Nothing about the look changes.
- **Google Workspace mail.** Not touched. The 5 `aspmx` MX records get recreated in the new zone and
  mail never notices.

### 🔨 Has to be built or rebuilt — the honest list

1. **⭐ Content extraction for the CMS — this is the real cost of the whole plan.**
   His content is **hardcoded inside 6 hand-written HTML files**. A CMS can only edit content that
   lives in data files. Somebody has to pull the headlines, service blurbs, prices and testimonials
   out of the markup into markdown/YAML once.
   **This is labor, not dollars — and it is the only significant work in this plan.**
   **Mitigation that matters:** do **not** convert all 6 pages. Extract **only what actually changes** —
   pricing, services, testimonials, the hero headline. Leave `refund-policy.html`, `tests.html` and
   the rest hardcoded. That cuts the job to a fraction and still delivers "he can update it himself"
   for everything he would ever want to update.
   ⚠️ **The trap to avoid:** pointing the CMS at raw HTML files so it "works" with no conversion.
   Editing raw HTML in a textarea is **not** "easily updated" — it fails his requirement while
   appearing to satisfy it.

2. **Repoint the intake form.** `<form id="intake-form">` exists but its destination is unverified.
   Swap it for a **HubSpot free embedded form** so submissions land in the CRM automatically. Small job.
   **This is the single change that makes requirement #2 real** — a CRM nobody's leads reach is decor.

3. **Fix the dead analytics.** Replace `G-XXXXXXXXXX` and `YOUR_PIXEL_ID`, or strip both tags. 2 minutes.

4. **Stand up the store.** Net new: Payhip account, upload products, paste the embed into
   `pricing.html`. No page rebuild — Payhip embeds into an existing site.

5. **Recreate the DNS zone at Spaceship.** Already fully documented in
   `DOMAIN-TRANSFER-l7sinc-to-spaceship.md` in this same folder.

### 🔴 None of it matters if the domain lapses
Per the transfer doc in this folder: **`Registry Expiry Date: 2026-08-31T05:18:53Z`**, and all 6 cards
on the Wix account are expired. **An expired domain cannot be transferred at all.** Fix the card and
renew at Wix first — renewing creates no new transfer lock, it only buys the runway. **Every line of
this recommendation is blocked behind that one action.**

---

## 🎬 TONIGHT'S DECISION, REDUCED TO ONE LINE

> **Renew the domain at Wix. Then: Cloudflare Pages + Sveltia CMS + HubSpot Free + Payhip Free,
> paid for entirely by a $10.18/year domain renewal.**

Registrar and DNS both to Spaceship as already decided — that part is unchanged and correct.

**The single biggest tradeoff:** he trades **one afternoon of content extraction** for **permanent
freedom from a platform bill**. The all-in-one alternatives (Wix, Squarespace, GoHighLevel, Shopify)
would skip that afternoon and charge $30–$300/month forever, with his content locked in their
database instead of his repo — which is precisely the position he just spent two years getting out of.

---

## 📌 UNVERIFIED — check these before spending

| Claim | Why unverified | What to do |
|---|---|---|
| Spaceship .com transfer $9.68 / renewal $10.18 | **`spaceship.com` returned HTTP 403** to me | Read the checkout total before paying |
| Lemon Squeezy 5% + $0.50 | **`lemonsqueezy.com/pricing` and `docs.lemonsqueezy.com` both 403** | Open the pricing page directly |
| Lemon Squeezy still sold standalone post-Stripe-acquisition | Not verifiable from here | Confirm before building on it |
| Ko-fi Gold price | Sources split **$6 vs $12/mo**; `ko-fi.com/gold` returned 403 | Only matters if he wants Ko-fi — 5% shop fee on free, weaker fit than Payhip |
| Zoho CRM cheapest paid tier | Page returned the price in **₹ (₹800/user/mo)**, not USD | Only matters if he outgrows HubSpot Free's 1,000 contacts |
| Cloudflare Pages bandwidth cap | Not stated on either limits page I read | Static requests are documented as free and unlimited; a 133 KB site will not approach any cap |
| HubSpot free contact limit = 1,000 | Current page says 1,000; **old community posts say 1,000,000** | Plan for 1,000. Starter is $7/seat/mo if he outgrows it |
| GoHighLevel accounts are client-scoped | Inferred from filenames `crj_`/`loan_hero_` — **contents never opened** | Confirm before reusing either for L7S's own CRM |

---

*Sources fetched 2026-08-29: stripe.com/pricing · hubspot.com/pricing/crm · knowledge.hubspot.com ·
payhip.com/pricing · payhip.com · gumroad.com/pricing · developers.cloudflare.com/pages/platform/limits
· developers.cloudflare.com/pages/functions/pricing · cal.com/pricing · zoho.com/crm/zohocrm-pricing ·
decapcms.org/docs/intro · pagescms.org/docs · github.com/sveltia/sveltia-cms ·
github.com/sveltia/sveltia-cms-auth · github.com/l7shub/l7sinc.com · https://l7sinc.com/ (live, 200,
133,415 bytes). Accounts read from qi's own vault, names only — no credential was opened or printed.*
