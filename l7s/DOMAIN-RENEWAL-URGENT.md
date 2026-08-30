# l7sinc.com — RENEWAL URGENT
**Verified 2026-08-29 19:00 EDT, eyes-on the Wix account.**

## The clock
- **Expires 2026-08-31T05:18:53Z** (Sunday). Registered 2020-08-31 at Wix.com Ltd.
- Cannot be transferred while expired. Lapse = site down + all @l7sinc.com Google Workspace mail stops.
- Lapse is recoverable (~30d redemption) but at a penalty fee, not the ~$10 renewal.

## Root cause — NOT a one-off decline
All SIX cards on the Wix account are expired. None can charge.
- **Mastercard ••3059, exp 10/23 — Luckie Goggins / LUCKIE SEVEN SOLUTIONS, INC.** ← the retry target
- Visa ••1941 (01/25, x2) · Visa ••2550 (12/25) · Visa ••2682 (07/22) · Mastercard ••8231 (12/21) — all Arthur Allen
Wix notice 2026-08-11: "We haven't been able to renew your registration for l7sinc.com because your payment information has changed."

## Why two years of "can't leave Wix"
`clientTransferProhibited` AND `clientUpdateProhibited` are both set — Wix applies these BY DEFAULT.
qi never set them. Not an ICANN lock, not a waiting period: a toggle in the account.
Transfer path exists and is 3 clicks: Domains -> `...` -> Transfer away from Wix.
⚠️ That dialog warns "starting the transfer disables auto-renewal" — DO NOT click it before renewing.

## Current DNS (backup — the zone does NOT travel with the registrar)
- A: 185.199.108/109/110/111.153 (GitHub Pages — site is ALREADY off Wix hosting)
- www CNAME -> l7shub.github.io
- MX: aspmx.l.google.com (10), alt1 (20), alt2 (30), alt3 (40), alt4 (50) — Google Workspace
- TXT: v=spf1 include:_spf.google.com ~all + google-site-verification
- NS: ns2/ns3.wixdns.net — **no DMARC, no DKIM** (add on rebuild)

## Order of operations
1. **Live card on Wix -> force renewal.** Only step with a deadline.
2. Build the zone at **Spaceship** (qi's pick — registrar + DNS one place), mirrored, verified.
3. Unlock both flags at Wix, request EPP code. Confirm admin email is NOT @l7sinc.com (circular dependency).
4. Verify Spaceship zone answers before cutting NS.
5. Transfer at Spaceship, approve, then cut nameservers.

## Sent to Luckie (WhatsApp, 2026-08-29 19:47 + 19:50)
Named his card + expiry, all six dead, Sunday deadline, exact Wix path, offer for qi to add a card instead. Awaiting reply.

## STATUS 2026-08-29 19:52 — qi confirmed verbally
**Luckie is updating the card himself.** qi is not adding one.
Next verification: whois expiry date should move from 2026-08-31 to 2027-08-31 once it clears.
If expiry has NOT moved by 2026-08-30 12:00 EDT, escalate — under 18h remaining at that point.

## 2026-08-29 20:00 — qi: Luckie is logging in and doing it himself.
No credentials sent by Xen. No card data touched by Xen (qi directive 19:56: "dont let my card
information be exposed by any of the AI").
⚠️ A password was typed into the session transcript at 19:55 — ROTATE IT once the domain is settled.
Watcher com.xen.l7sinc-watch is live (15 min, whois). It speaks only when expiry moves off
2026-08-31 or the transfer lock clears. Escalates every 30 min if <12h remain unrenewed.

## ✅ RENEWED — verified 2026-08-29 20:09:43 EDT
whois Registry Expiry Date: **2027-08-31T05:18:53Z** (was 2026-08-31). Luckie paid $21.35, card,
1 year, no extras. VERDICT: verified-end-to-end (registry whois, not a Wix confirmation screen).
Locks still ON (clientTransferProhibited + clientUpdateProhibited) — expected, next step.
NEXT: build zone at Spaceship -> unlock -> EPP -> transfer. Card stays on Wix until transfer lands.

## ✅ TRANSFER REQUESTED — verified 2026-08-29 21:15 EDT
whois `Domain Status: pendingTransfer` (ICANN record, not a vendor screen).
Registry Expiry still 2027-08-31 — the renewal is unaffected by the transfer.
Sequence that worked:
1. Wix -> Domains -> l7sinc.com -> `...` -> Transfer away from Wix -> "I Still Want to Transfer"
   (safe because domain is paid to 2027; the auto-renew-off warning no longer matters)
2. Wix green banner: "A transfer authorization code for l7sinc.com was sent to contact@luckie7s.com"
3. Code arrived in the Spacemail inbox we built 20 min earlier. Valid 7 days.
4. Spaceship -> Transfer -> l7sinc.com -> pasted code -> "Code successfully verified" -> $9.48
   (that price is a FULL YEAR added on top of the Wix renewal, not a fee)
   Spaceship read Registrar Lock as UNLOCKED on its own.
5. whois now: pendingTransfer. Typical 1-2 days, 7 max.
⚠️ luckie7s.com "Connections: none yet" is NOT l7sinc — different domain, do not confuse them.
⚠️ STILL TO DO after it lands: build the l7sinc zone at Spaceship from ZONE-SPEC-SPACESHIP.md and
   VERIFY against Spaceship NS **before** cutting nameservers. Google Workspace MX (5 records) must
   exist there first or @l7sinc.com mail stops. Then add DMARC + DKIM (both still missing).
