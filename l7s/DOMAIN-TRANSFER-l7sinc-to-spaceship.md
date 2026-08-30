# l7sinc.com → Spaceship: transfer plan + DNS backup

**Measured 2026-08-29 22:53–22:56 UTC** (whois, RDAP, dig, curl — all raw output preserved below).
Scope: L7S / East Allen. Written plan only — nothing was logged into, nothing was changed.

---

## 🔴 READ THIS FIRST — THE TRANSFER IS NOT THE URGENT PROBLEM

> **`Registry Expiry Date: 2026-08-31T05:18:53Z`**
> That is **~30 hours** from the moment this was measured (whois DB timestamp `2026-08-29T22:53:30Z`).

And the auto-renew is **already known to have failed**. From `canon/QI-OPEN-ASKS.md` item 0, a Wix
notice that arrived in Spark **2026-08-11 08:48**:

> *"We haven't been able to renew your registration for l7sinc.com because your payment
> information has changed."*

That open ask listed the expiry date as UNVERIFIED. **It is now verified: 2026-08-31.**

**Consequence:** an expired domain **cannot be transferred at all.** Once it lapses, Wix will
almost certainly suspend DNS resolution, and once it reaches Redemption it is transfer-ineligible
until redeemed (at a redemption fee, not a renewal fee). So the entire checklist below is blocked
behind one action:

### ⚡ ACTION ZERO — fix the card at Wix and renew, before 2026-08-31 05:18 UTC (01:18 EDT).
Renewing does **not** create any new transfer lock. It only buys the runway to do the transfer
properly. Do this even if the plan is to leave Wix entirely.

---

## 1. GROUND TRUTH — what is actually true right now

### 1.1 Registration (source: `whois l7sinc.com` via whois.verisign-grs.com + Verisign RDAP)

| Field | Value |
|---|---|
| Registrar | **Wix.com Ltd.** (IANA ID **3817**) |
| Registrar WHOIS | whois.wix.com |
| Registry Domain ID | 2556700652_DOMAIN_COM-VRSN |
| Creation Date | **2020-08-31T05:18:53Z** |
| Updated Date | **2026-04-08T21:20:38Z** |
| **Registry Expiry Date** | **2026-08-31T05:18:53Z** ← ~30h away |
| Domain Status | **clientTransferProhibited** · **clientUpdateProhibited** |
| Name Servers | NS2.WIXDNS.NET · NS3.WIXDNS.NET |
| DNSSEC | unsigned |
| Registrant / admin contact | **not returned** — Verisign's record is thin, and whois.wix.com returned an empty body; RDAP at rdap.wix.com returned **HTTP 429 (rate limited)**. **UNVERIFIED — confirm in the Wix account.** |

### 1.2 DNS — where it actually lives vs. where it points

**The split that matters: the registrar is Wix, the DNS zone is ALSO Wix, but the website is
GitHub Pages and the mail is Google Workspace.** Three vendors, one zone, and the zone does not
travel with the registrar.

```
NS      l7sinc.com.       21543  IN  NS     ns2.wixdns.net.
NS      l7sinc.com.       21543  IN  NS     ns3.wixdns.net.
SOA     ns2.wixdns.net. support.wix.com. 2022040500 10800 3600 1209600 3600
```

### 1.3 Live site check

```
curl -sI https://l7sinc.com       → HTTP/2 200  · server: GitHub.com · last-modified: Tue, 28 Apr 2026 16:49:34 GMT
curl -sI https://www.l7sinc.com   → HTTP/2 301  · server: GitHub.com · location: https://l7sinc.com/
curl -sI http://l7sinc.com        → HTTP/1.1 301 · server: GitHub.com · location: https://l7sinc.com/
```
**The site is live and serving**, out of GitHub Pages, from the `l7shub` GitHub account.

### 1.4 Prior context found in qi's own tree

- `canon/QI-OPEN-ASKS.md` — item **0**, the failed-renewal notice quoted above. Ranked as needing
  his card; expiry was open. **This document closes that gap.**
- `canon/SINTRA-MEMORY-BLOCK.md` — L7S (`l7sinc.com`) is **Luckie Goggins' side of the house**;
  also records the failed renewal, and that the **Asana org on l7sinc.com is over its seat limit**
  (3 seats on a 2-seat plan).
- `profiles/_ENDPOINT-MAP.md` — L7S, INC. carries a role mailbox warm to 2026-07-24; support@ and
  sales@ stale since 2021. ⛔ Two `@l7sinc.com` mailboxes are flagged in canon as **Luckie's, not
  qi's — excluded scope**. Not opened here, not listed here.
- `canon/EMAIL-CONNECT-QUEUE.md` — a **Microsoft 365 tenant `l7sinc.onmicrosoft.com`** also exists
  under this identity, separate from the Google Workspace tenant.
- Mail export confirms **Google Workspace is a paid, invoiced tenant on l7sinc.com**
  ("Your Google Workspace monthly invoice is available for l7sinc.com", from Google billing).

---

## 2. THE GATING FACTS

| # | Question | Answer | Source |
|---|---|---|---|
| 1 | Inside the ICANN 60-day lock? | **No.** Created 2020-08-31 (5+ yrs). Last Updated 2026-04-08 = **143 days ago**, well outside 60. *What caused that 04-08 update is UNVERIFIED* — but either way the window has passed. | whois |
| 2 | Is expiry close? | **CRITICAL — 2026-08-31T05:18:53Z, ~30 hours out, with a known-failed auto-renew.** This is the single gating fact. | whois + QI-OPEN-ASKS #0 |
| 3 | Registrar lock on? | **Yes, both.** `clientTransferProhibited` blocks the transfer outright. `clientUpdateProhibited` **also blocks nameserver and contact edits** until it is lifted. | whois + RDAP |
| 4 | WHOIS privacy on? | **UNVERIFIED.** No registrant block was published and Wix's own WHOIS/RDAP would not answer. Modern registrars redact by default, so absence of data is **not** proof privacy is on. Check inside the Wix account. | whois / RDAP 429 |
| 5 | Is the admin email current and reachable? | **UNVERIFIED — and this is a trap, see §5.3.** The approval email goes to the admin email on file at Wix and nowhere else. | — |

---

## 3. THE CHECKLIST

### STEP 1 — PRE-FLIGHT: the DNS backup (do this before touching anything)

**These are the live records as measured 2026-08-29 22:53 UTC. This table IS the backup.**
Rebuild from here if anything is lost.

| Type | Host | Value | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 1682 (obs.) |
| A | `@` | `185.199.109.153` | 1682 (obs.) |
| A | `@` | `185.199.110.153` | 1682 (obs.) |
| A | `@` | `185.199.111.153` | 1682 (obs.) |
| AAAA | `@` | **none** — no AAAA published | — |
| CNAME | `www` | `l7shub.github.io.` | 3600 |
| MX | `@` | `10 aspmx.l.google.com.` | 3600 |
| MX | `@` | `20 alt1.aspmx.l.google.com.` | 3600 |
| MX | `@` | `30 alt2.aspmx.l.google.com.` | 3600 |
| MX | `@` | `40 alt3.aspmx.l.google.com.` | 3600 |
| MX | `@` | `50 alt4.aspmx.l.google.com.` | 3600 |
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | 3600 |
| TXT | `@` | `google-site-verification=c7PXWWuzdF3DdOtHoPmQBcCUvQSiOyxtmWElMmx-kEM` | 3600 |
| NS | `@` | `ns2.wixdns.net.` · `ns3.wixdns.net.` | 21543 |
| CAA | `@` | **none** | — |
| TXT | `_dmarc` | **NONE — no DMARC record exists** | — |
| TXT | `google._domainkey` | **NONE — no DKIM at the default Google selector** | — |
| SOA | `@` | `ns2.wixdns.net. support.wix.com. 2022040500 10800 3600 1209600 3600` | — |

The four A records are **GitHub Pages' anycast set**. The MX set is **Google Workspace**.
Email auth on this domain today is **SPF only** — no DMARC, no DKIM at the standard selector.

**Also do this before anything changes:**
1. Log into the **Wix DNS panel** and screenshot/transcribe every record by hand. Do **not** assume
   a zone-file export button exists (*UNVERIFIED — Wix may not offer one*). Public DNS only shows
   records that are published; the panel may hold subdomains or records nothing queries.
2. Note that DNS answers only reveal what is *asked for*. Beyond `@`, `www`, `_dmarc`,
   `google._domainkey`, `mail`, `autodiscover` and `_domainconnect` (all checked — only `@` and
   `www` exist), any other subdomain would have to be read out of the Wix panel.
3. Confirm in **Google Workspace Admin** that mail routing for this domain is the standard MX set
   above, so §5 can be verified against something.

### STEP 2 — AT WIX (the losing registrar)

*Prerequisite: the renewal from Action Zero has gone through.*

1. **Fix the payment method** and renew the domain. Confirm the new expiry reads **2027-08-31**.
2. **Lift the locks.** Both `clientTransferProhibited` and `clientUpdateProhibited` are set.
   Wix usually exposes this as a single "Transfer away / Unlock domain" control.
3. **Confirm the registrant/admin email on file** and make sure it is a mailbox that will still
   receive mail even if this domain has a bad day (see §5.3 — do **not** let it be an
   `@l7sinc.com` address).
4. **Disable WHOIS privacy** if it is on. Wix bundles privacy with domains; the transfer approval
   mail routinely fails to arrive while a privacy proxy is in the path.
5. **Request the EPP / authorization code.** Wix emails it to the admin address on file. It is a
   credential — do not paste it into chat, a doc, or a ticket. Move it straight from the mail into
   the Spaceship transfer form, or park it in 1Password.
6. **Do not change nameservers here.** See STEP 6.

### STEP 3 — AT SPACESHIP (the gaining registrar)

1. Spaceship → **Transfer a domain** → enter `l7sinc.com`.
2. It will pre-check eligibility: unlocked, outside the 60-day window, not expired. All three must
   pass. If it reports "locked", the STEP 2.2 change has not propagated to the registry yet — wait
   and re-check the whois status line rather than retrying blindly.
3. Enter the **EPP/auth code**.
4. **Pay.** A gTLD transfer is required to include a **1-year renewal**, which stacks on top of the
   existing expiry (so a renewed-to-2027 domain becomes 2028).
   **Price: UNVERIFIED — confirm at checkout.** Spaceship's public pricing page returned
   **HTTP 403 behind a Cloudflare challenge** when checked, so no figure is quoted here rather than
   guessed. .com transfers across the discount registrar market generally sit in the **~$10–$16**
   band, but treat that as context, not a quote.
5. Do **not** accept any "we'll manage your DNS" default that silently writes a fresh empty zone.
   Choose to **keep the existing nameservers** at this stage.

### STEP 4 — APPROVE, AND ACCELERATE

1. Spaceship sends a confirmation/authorization email (the ICANN **Form of Authorization**) to the
   admin address on file. **Click it.** Unactioned, the transfer stalls.
2. Wix sends its own "a transfer has been requested" mail. By ICANN rule this auto-approves after
   **5 days** of silence — but there is almost always an **"Approve / Release / Accelerate transfer"**
   button in the Wix domain panel that collapses those 5 days into **minutes to a few hours.**
   Use it. That button is the whole difference between a same-day transfer and a five-day one.
3. Watch the registry, not the dashboards. The transfer is real when this changes:
   ```
   whois l7sinc.com | grep -Ei "Registrar:|Expiry|Domain Status"
   ```
   Success looks like `Registrar: Spaceship, Inc.` *(exact registrar string UNVERIFIED — confirm
   against what the registry returns)* and an expiry pushed out one year.

### STEP 5 — POST-TRANSFER VERIFICATION

Re-run these and diff **every line** against the STEP 1 table:

```bash
dig l7sinc.com NS +short
dig l7sinc.com A +short
dig www.l7sinc.com CNAME +short
dig l7sinc.com MX +short
dig l7sinc.com TXT +short
curl -sI https://l7sinc.com
curl -sI https://www.l7sinc.com
```

Then verify mail **as a human**, not by reading a config screen:
- Send a message **from outside** into a live `@l7sinc.com` mailbox and confirm it lands.
- Send one **outbound** from that mailbox and confirm it is not rejected or spam-foldered
  (an SPF record lost in migration shows up exactly here).
- Check Google Workspace Admin for domain-verification warnings — if the
  `google-site-verification` TXT went missing, Google may flag the domain.
- Confirm the site still returns `200` with `server: GitHub.com`.

A green registrar dashboard is not verification. The `dig` output and a received test email are.

### STEP 6 — WHAT NOT TO DO

- ⛔ **Do not change nameservers during the transfer window.** Between request and completion the
  domain is in a split state; an NS edit mid-flight can be dropped, or can void the transfer.
  Move DNS **before** the transfer (with time to propagate and verify), or **after** it completes —
  never during.
- ⛔ **Do not let the domain expire mid-transfer.** With expiry ~30h out this is not hypothetical.
  Renew first, transfer second.
- ⛔ **Do not re-enable WHOIS privacy, and do not change registrant contact details, after the auth
  code is issued.** Privacy back on can break the approval mail. Worse, a **registrant change can
  trigger a fresh 60-day ICANN Change-of-Registrant lock** and kill the transfer outright for two
  months. Change nothing about the contacts until the domain is settled at Spaceship.
- ⛔ **Do not cancel the Wix plan or delete the Wix site while the DNS zone still lives there.**
  The zone is the only thing serving MX for a paid Google Workspace tenant.
- ⛔ **Do not cancel Google Workspace.** It bills separately from the domain and is unaffected by
  the registrar change — as long as DNS keeps resolving.

### STEP 7 — TIMELINE

| Phase | Realistic time |
|---|---|
| Renew at Wix (Action Zero) | minutes — **must land before 2026-08-31 05:18 UTC** |
| Unlock + obtain EPP code | minutes to a few hours (Wix emails the code) |
| Initiate + pay at Spaceship | minutes |
| Approve FOA + accelerate at Wix | **hours** if the Wix release button is used |
| Auto-approve if nobody clicks | **5 full days** |
| Registry reflects new registrar | up to ~1h after approval |
| DNS migration + propagation (separate job) | plan **24–48h** at these TTLs |

**What blocks it:** an expired domain · either `client*Prohibited` status still set · a wrong or
unreachable admin email · WHOIS privacy intercepting the FOA · being inside any 60-day lock ·
an auth code that was regenerated after being entered.

---

## 4. RISKS SPECIFIC TO THIS DOMAIN

### 4.1 🔴 Expiry in ~30 hours, with a card that is already failing
Everything else is secondary. If it lapses: Wix suspends resolution → the GitHub Pages site goes
dark **and** Google Workspace mail for every `@l7sinc.com` mailbox stops delivering, because the MX
lookup itself fails. Then it enters grace, then Redemption, where the fee is a multiple of the
renewal and **the domain cannot be transferred at all.**

### 4.2 🔴 The DNS zone does NOT come with the registrar — and Wix is both
This is the classic silent killer and it applies exactly here. The zone lives on
`ns2/ns3.wixdns.net`. **A registrar transfer moves the registration, not the zone.** If Wix stops
serving that zone once the domain leaves — or if the Wix plan is cancelled — the MX records vanish
and **mail for a live, paid Google Workspace tenant dies with no error anywhere except bounces**,
while the registrar dashboard at Spaceship shows a perfectly healthy domain.

**Handle it as its own project, before the transfer:** recreate the STEP 1 table in Spaceship DNS
(or Cloudflare), point the NS at the new host, wait out propagation, verify mail end-to-end, *then*
transfer the registration. Note the NS TTL is ~21543s (~6h) and the record TTLs are 3600s — budget
a day, not an hour.

*(For the record: the site is **not** behind Cloudflare — it is GitHub Pages served directly, and
DNS is Wix-hosted. The "nameserver-hosted DNS doesn't transfer" warning still applies in full, just
with Wix in Cloudflare's place.)*

### 4.3 🔴 The circular dependency on the admin email
If the admin email on file at Wix is itself an `@l7sinc.com` address, then the moment the domain
lapses or DNS breaks, **the mailbox that must receive the transfer approval stops receiving mail.**
The lock and the key end up behind the same door. **Before requesting the EPP code, confirm the
admin address on file is on a different domain** (one of the eastallen / xlrd / gmail identities).

### 4.4 🟠 Mail is SPF-only — there is no DMARC and no DKIM
Nothing to break there, but also no safety net. `v=spf1 include:_spf.google.com ~all` must be
reproduced **byte-exact** in any new zone. Miss it and outbound starts failing authentication at
Gmail and Outlook — which looks like "email is fine but nobody's replying", the worst failure shape.

### 4.5 🟠 The site depends on a third account nobody is transferring
The apex A records and the `www` CNAME point into **GitHub Pages under the `l7shub` account**. That
account's Pages custom-domain setting must keep saying `l7sinc.com`, or GitHub will stop serving it
regardless of DNS. If the GitHub side is not under qi's direct control, that is a separate access
question to settle before the DNS move.

### 4.6 🟡 Other services bound to this domain
A **Microsoft 365 tenant (`l7sinc.onmicrosoft.com`)** and an **Asana org on l7sinc.com** both exist
per canon. Either may hold its own domain-verification TXT record that public DNS does not
currently show. Check both panels before rebuilding the zone. *(UNVERIFIED — not queried.)*

### 4.7 🟡 Scope note
Per `_ENDPOINT-MAP.md` and the follow-ups directive, some `@l7sinc.com` mailboxes belong to
**Luckie**, not qi, and are **excluded scope** — never opened, never read. This document touches
DNS and registration only; no mailbox was opened to produce it. If the domain lapses it takes
*his* mail down too, which raises the stakes on Action Zero rather than lowering them.

---

## 5. RAW EVIDENCE

<details><summary>whois l7sinc.com — registrar section, 2026-08-29 22:53:30Z</summary>

```
   Domain Name: L7SINC.COM
   Registry Domain ID: 2556700652_DOMAIN_COM-VRSN
   Registrar WHOIS Server: whois.wix.com
   Registrar URL: http://www.wix.com
   Updated Date: 2026-04-08T21:20:38Z
   Creation Date: 2020-08-31T05:18:53Z
   Registry Expiry Date: 2026-08-31T05:18:53Z
   Registrar: Wix.com Ltd.
   Registrar IANA ID: 3817
   Registrar Abuse Contact Email: domain-abuse@wix.com
   Registrar Abuse Contact Phone: +14154291173
   Domain Status: clientTransferProhibited https://icann.org/epp#clientTransferProhibited
   Domain Status: clientUpdateProhibited https://icann.org/epp#clientUpdateProhibited
   Name Server: NS2.WIXDNS.NET
   Name Server: NS3.WIXDNS.NET
   DNSSEC: unsigned
>>> Last update of whois database: 2026-08-29T22:53:30Z <<<
```
*(whois.wix.com returned an empty body — no registrant block. rdap.wix.com returned HTTP 429.)*
</details>

<details><summary>dig — full record set</summary>

```
NS      ns2.wixdns.net. · ns3.wixdns.net.                      (TTL 21543)
A       185.199.109.153 185.199.108.153 185.199.110.153 185.199.111.153   (TTL 1682)
AAAA    (none)
www     CNAME l7shub.github.io.                                (TTL 3600)
MX      10 aspmx.l.google.com. / 20 alt1 / 30 alt2 / 40 alt3 / 50 alt4    (TTL 3600)
TXT     "v=spf1 include:_spf.google.com ~all"                  (TTL 3600)
TXT     "google-site-verification=c7PXWWuzdF3DdOtHoPmQBcCUvQSiOyxtmWElMmx-kEM"
SOA     ns2.wixdns.net. support.wix.com. 2022040500 10800 3600 1209600 3600
CAA     (none)
_dmarc                    TXT (none)
google._domainkey         TXT (none)
mail / autodiscover / _domainconnect   (none)
```
</details>

<details><summary>curl -sI — live site</summary>

```
https://l7sinc.com      HTTP/2 200 · server: GitHub.com · last-modified: Tue, 28 Apr 2026 16:49:34 GMT · etag: "69f0e51e-20927"
https://www.l7sinc.com  HTTP/2 301 · server: GitHub.com · location: https://l7sinc.com/
http://l7sinc.com       HTTP/1.1 301 · server: GitHub.com · location: https://l7sinc.com/
```
</details>

---

## 6. WHAT IS UNVERIFIED IN THIS DOCUMENT

Everything below needs confirming **at the registrar**; none of it was guessed at above.

- Whether **WHOIS privacy** is active (Wix WHOIS empty, Wix RDAP 429).
- The **registrant/admin email on file** — and therefore §4.3, the highest-leverage unknown here.
- **Spaceship's .com transfer price** (their page returned 403 behind a Cloudflare challenge).
- The **exact registrar string** the registry will show after a successful transfer.
- What caused the **2026-04-08 Updated Date** (immaterial to the 60-day rule — 143 days have passed).
- Whether **Wix offers a DNS zone export**, or whether records must be transcribed by hand.
- Whether the **M365 tenant or Asana org** hold additional verification TXT records.
- Whether **auto-renew was re-enabled** at Wix since the 2026-08-11 failure notice.

---

*Ground truth measured 2026-08-29 22:53–22:56 UTC. No registrar was logged into, no part of the
transfer was performed, and no credential, EPP code, or personal contact address appears in this
file.*
