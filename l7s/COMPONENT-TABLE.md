# L7S / l7sinc.com — COMPONENT TABLE

**The one authoritative inventory of every moving piece.** Who provides it, what it costs, where it
is managed, and whether it is actually proven.

Built 2026-08-29 21:19 EDT. Every DNS/whois/HTTP/TLS line below was **re-queried live at 21:17–21:19
EDT** for this document — not copied from an earlier note.

Requested by qi verbatim at 21:16 EDT:
> *"can you make like a data set table for every component and then like okay, spaceship is now the
> new domain name registrar?"*

**Answer to the question in that sentence: not yet.** Spaceship is the *incoming* registrar. The
registry still names **Wix.com Ltd.** as registrar of record. See row 1.

---

## STATUS SCALE (qi's 3 values — no fourth)

| Value | Means |
|---|---|
| **verified-end-to-end** | An artifact was captured showing the real thing working. Named in the last column. |
| **code-shipped-unverified** | The change was made but nobody has looked at the result. |
| **pending** | Not done. |

Anything asserted without an artifact is tagged **UNVERIFIED** with the name of who asserted it.
A vendor confirmation screen is not an artifact; the registry whois is.

---

## 1. THE MAIN TABLE — 34 components

| # | Component | Provider (now) | Provider (target) | Cost | Managed at (URL/path) | Status | Verified how |
|---|---|---|---|---|---|---|---|
| 1 | **Domain registration — l7sinc.com** | **Wix.com Ltd.** (IANA 3817) — still registrar of record | **Spaceship, Inc.** | $21.35 paid at Wix (1 yr) + $9.48 paid at Spaceship (+1 yr) | wix.com/domains → spaceship.com | **code-shipped-unverified** — transfer requested, not landed | `whois l7sinc.com` → `Registrar: Wix.com Ltd.` AND `Domain Status: pendingTransfer`, registry `Updated Date: 2026-08-30T01:11:43Z` (= 21:11:43 EDT). Re-read 21:17 EDT |
| 2 | **Registry expiry — l7sinc.com** | Verisign registry | same | — | — | **verified-end-to-end** | `whois` → `Registry Expiry Date: 2027-08-31T05:18:53Z`. Was 2026-08-31. `Creation Date: 2020-08-31T05:18:53Z` |
| 3 | **Registrar lock — l7sinc.com** | Wix (was on by default) | Spaceship (60-day post-transfer lock is normal) | $0 | Wix domain settings | **verified-end-to-end — CLEARED** | `whois` Domain Status now shows **only** `pendingTransfer`. `clientTransferProhibited` and `clientUpdateProhibited` are both **absent** from the registry record |
| 4 | **Domain registration — luckie7s.com** | **Spaceship, Inc.** | Spaceship | $9.08 first year · renewal ~$10.18 **UNVERIFIED** | spaceship.com | **verified-end-to-end** | `whois luckie7s.com` → `Registrar: Spaceship, Inc.`, `Creation Date: 2026-08-30T00:34:56Z` (= 20:34:56 EDT tonight), `Registry Expiry 2027-08-30`, `clientTransferProhibited` (normal 60-day new-reg lock) |
| 5 | **DNS zone — l7sinc.com** | **Wix DNS** (12 records) | Spaceship DNS | $0 both | Wix DNS panel → spaceship.com DNS | **pending** — zone not yet built at Spaceship | `dig NS/A/MX/TXT/CNAME @8.8.8.8` returns all 12 records from Wix. Spec mirrored in `ZONE-SPEC-SPACESHIP.md` |
| 6 | **Nameservers — l7sinc.com** | `ns2.wixdns.net` · `ns3.wixdns.net` | `launch1/launch2.spaceship.net` | $0 | Registrar of record | **pending** — cut LAST, after zone verifies | `dig +short NS l7sinc.com @8.8.8.8` → `ns2.wixdns.net.` `ns3.wixdns.net.` |
| 7 | **DNS zone — luckie7s.com** | **Spaceship DNS** | Spaceship | $0 | spaceship.com | **verified-end-to-end** | `dig +short NS luckie7s.com` → `launch1.spaceship.net.` `launch2.spaceship.net.` |
| 8 | **Web hosting — l7sinc.com** | **GitHub Pages** (already OFF Wix) | Cloudflare Pages (per WEB-STACK-RECOMMENDATION.md) | **$0** now, **$0** target | github.com/l7shub/l7sinc.com | **verified-end-to-end** | `curl -sI https://l7sinc.com` → `HTTP/2 200`, `server: GitHub.com`, `x-github-request-id`, 133,415 bytes, `<title>L7S Inc. \| Business Growth Solutions…</title>` |
| 9 | **Site source / repo** | GitHub — `l7shub/l7sinc.com` (public) | same repo, unchanged | $0 | github.com/l7shub/l7sinc.com | **verified-end-to-end** | `curl` repo → HTTP 200. `raw…/main/CNAME` → `l7sinc.com` |
| 10 | **www redirect** | GitHub Pages | same | $0 | repo CNAME + DNS | **verified-end-to-end** | `curl -sI https://www.l7sinc.com` → `HTTP/2 301`, `location: https://l7sinc.com/`. `dig CNAME www` → `l7shub.github.io.` |
| 11 | **Web hosting — luckie7s.com** | **GitHub Pages IPs — but NOTHING SERVES IT** | decide: park, redirect, or claim | $0 | spaceship.com DNS | **pending — BROKEN, new finding** | `dig +short A luckie7s.com` → the 4 GitHub Pages IPs; `dig CNAME www` → `xlrdtech.github.io.` But `curl -sI http://luckie7s.com` → **HTTP 404 GitHub.com**, and HTTPS returns **nothing** because the cert is `CN=*.github.io` (mismatch). No Pages site has claimed this domain |
| 12 | **Email / mailboxes — @l7sinc.com** | **Google Workspace** (5 aspmx MX) | Google Workspace, unchanged | **~$48/mo — UNVERIFIED, qi-stated**, reduced to 3 mailboxes | admin.google.com | **verified-end-to-end (DNS)** · cost **UNVERIFIED** | `dig +short MX l7sinc.com` → `10 aspmx.l.google.com.` `20 alt1` `30 alt2` `40 alt3` `50 alt4`. The $48 figure has **no invoice artifact** — qi said it verbally |
| 13 | **Auth-code mailbox — contact@luckie7s.com** | **Spacemail** (Spaceship) | same, or retire once transfer lands | free 30 days, then **~$0.98/mo — UNVERIFIED, qi-stated** | spaceship.com → Spacemail | **verified-end-to-end** | `dig +short MX luckie7s.com` → `0 mx1.spacemail.com.` `0 mx2.spacemail.com.` ⭐ **This resolves the 20:48 blocker** — MX was EMPTY twice then. The Wix transfer code actually arrived here and worked |
| 14 | **Credential storage** | **1Password** — vault "Xen", item **"Spacemail contact@luckie7s.com"** | same | existing | 1Password | **UNVERIFIED — qi-stated** | Not opened. No credential is reproduced in this file by design |
| 15 | **SPF — l7sinc.com** | Google Workspace | same | $0 | DNS TXT @ | **verified-end-to-end** | `dig +short TXT l7sinc.com` → `"v=spf1 include:_spf.google.com ~all"` |
| 16 | **SPF — luckie7s.com** | Spacemail | same | $0 | Spaceship DNS TXT @ | **verified-end-to-end** | `dig +short TXT luckie7s.com` → `"v=spf1 include:spf.spacemail.com ~all"` |
| 17 | **DKIM — l7sinc.com** | **NONE** | Google Workspace DKIM | **$0** | admin.google.com → Apps → Gmail → Authenticate email | **pending — MISSING** | Probed 7 selectors (`google`, `default`, `selector1`, `selector2`, `k1`, `s1`, `mail`) at `_domainkey.l7sinc.com` — **all empty**. Consistent with never having been enabled |
| 18 | **DMARC — l7sinc.com** | **NONE** | `v=DMARC1; p=none; rua=…` then tighten | **$0** | DNS TXT `_dmarc` | **pending — MISSING** | `dig TXT _dmarc.l7sinc.com` returns **no answer**, only `SOA ns2.wixdns.net.` in authority = record does not exist |
| 19 | **DMARC — luckie7s.com** | **NONE** | same | $0 | Spaceship DNS | **pending — MISSING** | `dig +short TXT _dmarc.luckie7s.com` → empty |
| 20 | **Domain verification TXT** | Google | carry to Spaceship verbatim | $0 | DNS TXT @ | **verified-end-to-end** | `dig +short TXT` → `"google-site-verification=c7PXWWuzdF3DdOtHoPmQBcCUvQSiOyxtmWElMmx-kEM"`. ⚠️ Must be recreated or Workspace verification breaks |
| 21 | **TLS cert — l7sinc.com** | **Let's Encrypt**, auto-issued by GitHub Pages | Cloudflare (auto) | **$0** | Automatic — nothing to manage | **verified-end-to-end** | `openssl s_client` → `subject=CN=l7sinc.com`, `issuer=Let's Encrypt CN=YR2`, valid `Jul 26 2026 → Oct 24 2026 GMT` |
| 22 | **TLS cert — luckie7s.com** | **MISMATCHED** — serves `CN=*.github.io` | fix when row 11 is decided | $0 | — | **pending — BROKEN** | `openssl s_client -servername luckie7s.com` → `subject=CN=*.github.io`. HTTPS is unusable on this domain today |
| 23 | **CDN** | **Fastly**, bundled free inside GitHub Pages | Cloudflare free tier | **$0** both | none / dash.cloudflare.com | **verified-end-to-end** | Response headers `via: 1.1 varnish`, `x-served-by: cache-pdk-katl1840068-PDK`, `x-cache: MISS`, `x-fastly-request-id` |
| 24 | **Analytics — Google Analytics 4** | **BROKEN — placeholder ID live** | real GA4 property, or strip the tag | $0 | repo `index.html` | **pending — DEFECT, live right now** | Fetched the live page: **3 occurrences of `G-XXXXXXXXXX`** plus `googletagmanager` and `gtag(`. Collecting **zero** data |
| 25 | **Analytics — Meta Pixel** | **BROKEN — placeholder ID live** | real pixel, or strip the tag | $0 | repo `index.html` | **pending — DEFECT, live right now** | Same fetch: **3 occurrences of `YOUR_PIXEL_ID`**, plus `fbq(` ×2 and `connect.facebook`. Collecting **zero** data |
| 26 | **CRM** | **NONE wired to the site** | **HubSpot Free** (qi already owns, `admin@selfexec.com`) | **$0** — 1,000 contacts, 2 users | app.hubspot.com | **pending** | Grepped the live page for `hubspot` → **0 matches**. The `<form id="intake-form">` exists but its destination is unverified. A CRM no lead reaches is decor |
| 27 | **CMS / editing surface** | **NONE — content hardcoded in 6 HTML files** | **Sveltia CMS** at `/admin` (MIT, free) | **$0** | l7sinc.com/admin (to build) | **pending** | No `/admin` exists. This is the single largest piece of labor in the plan — content extraction, per WEB-STACK-RECOMMENDATION.md |
| 28 | **Landing pages** | hand-built HTML in the repo | **Carrd Pro Standard** (qi already owns) — optional | **$19/yr** (free tier has no custom domain) | carrd.co | **pending** | qi's ownership listed in WEB-STACK-RECOMMENDATION.md vault pull — **UNVERIFIED**, not logged into |
| 29 | **E-commerce / digital store** | **NONE** | **Payhip Free** | **$0 + 5%/sale** | payhip.com | **pending** — the only genuinely new account the plan needs | Grepped live page for `payhip`/`gumroad` → **0 matches**. ⛔ Do **not** use Gumroad — 11% flat, worst option at every volume |
| 30 | **Payments** | **Stripe — already live on the page** | Stripe, unchanged | **$0 fixed** + 2.9% + $0.30 | dashboard.stripe.com | **verified-end-to-end (present)** | Live page contains `js.stripe.com` ×1. That it *loads* is proven; that a checkout *completes* is not |
| 31 | **Booking** | **Cal.com — already live on the page** | Cal.com Free, unchanged | **$0** | cal.com/l7sinc | **verified-end-to-end (present)** | Live page contains `cal.com` ×11 across casings |
| 32 | **E-signature** | **NONE — no provider anywhere** | undecided | — | — | **pending** | Grepped the live page **and** every file in this folder for `docusign\|hellosign\|pandadoc\|signwell\|dropboxsign\|adobe sign` → **0 real matches** (the 2 hits were the substring "design"). Nothing exists to migrate |
| 33 | **Wix account itself** | **Wix** — login `xlrdtech@gmail.com`, team **"Xeno Logos"**, qi is Owner | close or downgrade after transfer lands | $0 for the account shell | manage.wix.com | **UNVERIFIED — qi-stated** | Not logged into for this document. ⭐ **This mismatch is the two-year mystery** — the domain was never in Luckie's account, so he was fixing the wrong one |
| 34 | **Payment method on file** | **Wix:** all 6 cards expired (oldest 12/21) → Luckie added a live USAA card tonight. **Spaceship:** live card, auto-renew ON | Spaceship only | — | manage.wix.com / spaceship.com | **UNVERIFIED — qi-stated**, but the **charge succeeding is proven** | The renewal cleared, which only happens with a working card: registry expiry moved 2026-08-31 → 2027-08-31. ⛔ No card number, last-4 or expiry is recorded in this file (qi directive 19:56: *"dont let my card information be exposed by any of the AI"*) |

**34 rows.** Verified-end-to-end: 15 · code-shipped-unverified: 1 · pending: 13 · UNVERIFIED-asserted: 5.

---

## 2. MONEY TABLE — annualized, current vs. target

### Recurring line items

| Line item | Provider now | Now ($/yr) | Provider target | Target ($/yr) | Delta | Confidence |
|---|---|---|---|---|---|---|
| **Google Workspace mail** | Google | **$576.00** | Google (unchanged) | **$576.00** | $0.00 | ⚠️ **UNVERIFIED — qi-stated** "~$48/month", 3 mailboxes. No invoice seen |
| l7sinc.com registration | Wix | **$21.35** | Spaceship | **$10.18** | **−$11.17** | Now: **VERIFIED** (charge cleared, expiry moved). Target: **UNVERIFIED** — renewal price from comparison sites, spaceship.com returns 403 |
| luckie7s.com registration | — (did not exist) | **$0.00** | Spaceship | **$10.18** | **+$10.18** | First year **$9.08 VERIFIED-qi-stated**; renewal figure UNVERIFIED |
| Spacemail contact@luckie7s.com | — | **$0.00** | Spaceship | **$11.76** | **+$11.76** | ⚠️ UNVERIFIED — qi-stated ~$0.98/mo after 30 free days |
| Web hosting | GitHub Pages | **$0.00** | Cloudflare Pages | **$0.00** | $0.00 | **VERIFIED** — GitHub server headers; Cloudflare Pages free tier verified in WEB-STACK-RECOMMENDATION.md |
| TLS certificates | Let's Encrypt (auto) | **$0.00** | Cloudflare (auto) | **$0.00** | $0.00 | **VERIFIED** — cert read off the wire |
| CDN | Fastly (bundled) | **$0.00** | Cloudflare | **$0.00** | $0.00 | **VERIFIED** — Fastly headers present |
| CMS / editing surface | none | **$0.00** | Sveltia CMS (MIT) | **$0.00** | $0.00 | VERIFIED open-source |
| CRM | none | **$0.00** | HubSpot Free | **$0.00** | $0.00 | VERIFIED free tier (1,000 contacts / 2 users) |
| Landing pages *(optional)* | none | **$0.00** | Carrd Pro Standard | **$19.00** | **+$19.00** | Free tier has **no custom domain**. qi already owns the account (UNVERIFIED) |
| Booking | Cal.com Free | **$0.00** | Cal.com Free | **$0.00** | $0.00 | **VERIFIED** — live on the page |
| Digital store | none | **$0.00** | Payhip Free | **$0.00** | $0.00 | VERIFIED — $0 + 5%/sale |
| Payments | Stripe | **$0.00** | Stripe | **$0.00** | $0.00 | **VERIFIED** — no fixed fee |
| SPF / DKIM / DMARC | partial | **$0.00** | complete | **$0.00** | $0.00 | All three are free records |
| **TOTAL** | | **$597.35/yr** | | **$627.12/yr** | **+$29.77/yr** | |

### Variable (only bills on revenue)
| Rail | Fee | Note |
|---|---|---|
| Stripe | 2.9% + $0.30 | Already his own account |
| Payhip Free | +5%/sale | → 8.5% all-in. Plus ($29/mo) pays for itself above **$967/mo gross**; Pro above **$3,500/mo** |

### 🔴 THE HONEST READ ON THE MONEY

**The target stack does not save money — it costs $29.77/yr more.** Anyone who tells qi this
migration is a savings play is wrong, and here is exactly why:

1. **The web stack was already free.** The site left Wix hosting some time ago and runs on GitHub
   Pages at $0. There was no hosting bill to cut. Moving to Cloudflare Pages saves $0.00.
2. **The registrar move saves $11.17/yr** — real, but small.
3. **The new spend is the rescue cost.** luckie7s.com + Spacemail (+$21.94/yr) exist only because
   Wix mails transfer codes to `contact@luckie7s.com` and that domain did not exist. That is the
   price of getting *out*, and it also closed a genuine hijack hole — anyone could have registered
   that domain and received qi's transfer codes.
4. **⭐ Google Workspace is 96.5% of the entire annual bill** — $576 of $597.35 — and it is the
   **one number in this table with no artifact behind it.** Every other line is verified or
   near-zero. The stack migration is arguing over $30 while $576 sits unexamined.

**What the migration actually buys is not dollars — it is exit.** Content in a git repo he owns, a
payment rail that is his own Stripe account, and a registrar that hands over an auth code in five
days instead of two years. Priced honestly: **$29.77/yr for permanent portability.**

**The real savings lever is row 12.** One verified look at the Workspace invoice is worth more than
the entire rest of this table.

---

## 3. CHANGE LOG — 2026-08-29 (all times EDT)

| Time | What changed | Artifact that proves it | Verdict |
|---|---|---|---|
| 19:00 | Renewal emergency confirmed — domain expiring 08-31, all 6 Wix cards expired | Eyes-on the Wix billing page; Wix notice 2026-08-11 *"payment information has changed"* | verified-end-to-end |
| 19:00 | **Root cause of the 2-year lock found** — `clientTransferProhibited` + `clientUpdateProhibited` are **Wix defaults**, not ICANN, not a waiting period | whois Domain Status flags | verified-end-to-end |
| 19:00 | **Root cause of the 2-year mystery found** — domain lives in `xlrdtech@gmail.com` / team "Xeno Logos", **not Luckie's account** | Wix account page | UNVERIFIED-qi-stated (not re-opened tonight) |
| 19:47, 19:50 | Luckie notified by WhatsApp — dead cards, Sunday deadline, exact Wix path | WhatsApp thread | verified-end-to-end |
| 19:52 | qi confirmed Luckie updating the card himself; qi is not adding one | qi verbal | qi-stated |
| ~19:55 | Contact-change trap avoided — Wix save dialog warned *"can't be transferred for 60 days"* (ICANN Change-of-Registrant). **Discarded, nothing saved** | Wix dialog | verified-end-to-end |
| **20:08:56** | **RENEWED.** Luckie paid $21.35 (USAA), 1 yr, no extras | **Registry `Updated Date: 2026-08-30T00:08:56Z`** and **`Registry Expiry Date` moved 2026-08-31 → 2027-08-31T05:18:53Z**. Registry whois, not a Wix screen | **verified-end-to-end** |
| 20:10 | l7sinc.com zone captured — all 12 records | `ZONE-SPEC-SPACESHIP.md` written from live `dig` | verified-end-to-end |
| **20:34:56** | **luckie7s.com REGISTERED** at Spaceship — $9.08, 1 yr, auto-renew ON, free privacy. Closed a real hijack hole | **whois `Creation Date: 2026-08-30T00:34:56Z`**, `Registrar: Spaceship, Inc.` | **verified-end-to-end** |
| 20:42, 20:48 | Spacemail "Unbox" wizard hung twice; `dig luckie7s.com MX` returned **EMPTY** both times → transfer blocked | Two reproduced dig runs | (blocker, since cleared) |
| **~20:50–21:10** | **Spacemail MX came live** — the 20:48 blocker resolved | **`dig +short MX luckie7s.com` at 21:17 → `0 mx1.spacemail.com.` `0 mx2.spacemail.com.`** Re-verified for this document | **verified-end-to-end** |
| **21:11:43** | **REGISTRAR LOCK CLEARED** — both `client*Prohibited` flags gone | **Registry `Updated Date: 2026-08-30T01:11:43Z`**; whois Domain Status now shows only `pendingTransfer` | **verified-end-to-end** |
| **21:15** | **TRANSFER REQUESTED AND ACCEPTED.** Wix → Transfer away → code mailed to `contact@luckie7s.com` → arrived in the Spacemail box built 20 min earlier → pasted at Spaceship → *"Code successfully verified"* → **$9.48 = a full extra year**, not a fee | **whois `Domain Status: pendingTransfer https://icann.org/epp#pendingTransfer`** — the ICANN record, not a vendor screen | **verified-end-to-end** |
| 21:16 | qi asked for this table | qi verbatim, quoted at the top | — |
| **21:17–21:19** | **Everything above independently re-queried** for this document — whois ×2 domains, dig NS/A/MX/TXT/CNAME/DMARC ×2 domains, 7 DKIM selectors, curl headers ×3, TLS ×2, repo ×1, live-page greps ×2 | This file's "Verified how" column | **verified-end-to-end** |

### Two things I found tonight that were not previously recorded
1. **luckie7s.com is serving a broken HTTPS endpoint** — its A records point at GitHub Pages and
   `www` at `xlrdtech.github.io`, but no Pages site claims it: HTTP 404 and a `CN=*.github.io` cert
   mismatch. Rows 11 and 22. Provenance of those records is **UNVERIFIED** — likely a Spaceship
   account default, since qi's other domains there point at his GitHub.
2. **The Wix registrar whois is stale against the registry.** `whois.wix.com` still reported
   `Domain Status: ok` / `Updated 2026-08-30T00:08:56` while the Verisign registry already showed
   `pendingTransfer` / `01:11:43Z`. **Believe the registry, never the registrar's own mirror** —
   a reader checking the wrong block tonight would conclude the transfer never happened.

---

## 4. OPEN ITEMS

Ordered by what costs the most if ignored.

| # | Item | State | Next concrete action |
|---|---|---|---|
| **1** | ⭐ **DNS zone is not built at Spaceship, and the nameserver cut has not happened** | pending | Build all 12 records from `ZONE-SPEC-SPACESHIP.md` at Spaceship **now**, while the transfer is still in flight. Then `dig @launch1.spaceship.net l7sinc.com MX +short` and confirm all 5 `aspmx` records answer **before** touching NS. 🔴 **If the nameservers are cut with an empty or partial zone, every `@l7sinc.com` mailbox stops receiving mail and the site goes dark.** This is the only item on the list that can break something that currently works |
| 2 | **Transfer has not completed** — registrar of record is still Wix | code-shipped-unverified | Re-run `whois l7sinc.com` daily. Done when `Registrar:` reads **Spaceship, Inc.** and `pendingTransfer` clears. Typical 1–2 days, 7 max. Nothing to do but watch. ⚠️ Keep the live card on Wix until it lands |
| 3 | **Google Workspace ~$48/mo has no artifact** — 96.5% of the annual bill | UNVERIFIED-qi-stated | Open the Workspace billing page, read the actual plan, seat count and monthly charge. One look. Biggest money lever on the whole board |
| 4 | **DMARC missing on l7sinc.com** | pending | Publish `_dmarc` TXT: `v=DMARC1; p=none; rua=mailto:<a mailbox qi controls>`. `p=none` is monitor-only and changes nothing about delivery. Free. Do it in the new zone at build time so it ships with everything else |
| 5 | **DKIM missing on l7sinc.com** | pending | Google Workspace Admin → Apps → Gmail → Authenticate email → generate, then publish the TXT it gives. **Cannot be copied from anywhere** — it must be generated inside Workspace. Free |
| 6 | **Analytics placeholders live on the public site** — `G-XXXXXXXXXX` ×3 and `YOUR_PIXEL_ID` ×3 | pending — **defect, shipping right now** | Replace both with real IDs, or strip both tags. ~2 minutes in `index.html`. Every visitor since these went up has been uncounted |
| 7 | **selscorp.com has auto-renew OFF** | pending — **flagged per instruction** | Turn auto-renew on at Spaceship. ⚠️ Registrar confirmed tonight (`whois selscorp.com` → `Registrar: Spaceship, Inc.`); the auto-renew setting itself is **UNVERIFIED-qi-stated** — it is account state, not a whois field. Verify while turning it on. This is the same failure mode that nearly cost l7sinc.com tonight |
| 8 | **luckie7s.com serves HTTP 404 and a mismatched TLS cert** | pending — **new finding** | Decide what it should be: park it, 301 it to l7sinc.com, or claim it on a Pages site. Until then HTTPS is broken on a domain that now holds qi's transfer codes. Mail is unaffected (MX is independent) |
| 9 | **A password was typed into a session transcript at 19:55** | pending — **security** | Rotate it now that the domain is settled. Per `DOMAIN-RENEWAL-URGENT.md` |
| 10 | **CRM not wired** — 0 HubSpot references on the live page; intake form destination unverified | pending | Swap `<form id="intake-form">` for a HubSpot free embedded form. This is the change that makes the CRM real rather than decorative |
| 11 | **CMS not built** — content hardcoded across 6 HTML files | pending | The largest labor item in the plan. Extract **only what changes** (hero headline, services, pricing, testimonials); leave `refund-policy.html` and `tests.html` hardcoded. ⚠️ Never point the CMS at raw HTML — that fails the "easily updated" requirement while appearing to satisfy it |
| 12 | **Digital store not stood up** | pending | Payhip Free account, upload products, paste the embed into `pricing.html`. Start on Free; move to Plus above $967/mo gross |
| 13 | **Wix account disposition undecided** | pending | Once the transfer lands and DNS is verified at Spaceship, remove the card from Wix and decide whether the account closes. Do **not** touch it before then |
| 14 | **Spaceship renewal prices unverified** | UNVERIFIED | `spaceship.com` returned HTTP 403 to automated fetches. Read the real renewal price in the account before the 2027 cycle. The $9.08 / $9.48 charges tonight are qi-stated from checkout |
| 15 | **E-signature: no provider exists** | pending | Nothing to migrate. If the offer architecture needs signed agreements, this is a net-new decision — no incumbent to work around |

---

## THE ONE-LINE ANSWER TO HIS QUESTION

**Spaceship is the incoming registrar, not yet the registrar of record.** The transfer is accepted and
in flight (`pendingTransfer`, verified at the registry), the lock is cleared, and the domain is paid
through **2027-08-31** with a second year already purchased at Spaceship. It lands on its own in 1–7
days.

**The one thing that must happen before it lands:** build the 12-record zone at Spaceship and verify
it answers — *then* cut the nameservers. In that order, never reversed.

---

*Written 2026-08-29 21:19 EDT. Every DNS, whois, HTTP, and TLS claim re-queried live at 21:17–21:19
EDT for this document. Costs marked UNVERIFIED were asserted by qi and carry no invoice artifact.
No credential, card number, password, or EPP code appears in this file.*
