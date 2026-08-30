# l7sinc.com — zone to build at Spaceship BEFORE the transfer
Captured live from Wix nameservers 2026-08-29 20:10 EDT via dig. This is the authoritative mirror.
⚠️ Build ALL of these at Spaceship and verify they answer BEFORE cutting nameservers.

| Type | Host | Value | Pri |
|---|---|---|---|
| A | @ | 185.199.108.153 | — |
| A | @ | 185.199.109.153 | — |
| A | @ | 185.199.110.153 | — |
| A | @ | 185.199.111.153 | — |
| CNAME | www | l7shub.github.io. | — |
| MX | @ | aspmx.l.google.com. | 10 |
| MX | @ | alt1.aspmx.l.google.com. | 20 |
| MX | @ | alt2.aspmx.l.google.com. | 30 |
| MX | @ | alt3.aspmx.l.google.com. | 40 |
| MX | @ | alt4.aspmx.l.google.com. | 50 |
| TXT | @ | v=spf1 include:_spf.google.com ~all | — |
| TXT | @ | google-site-verification=c7PXWWuzdF3DdOtHoPmQBcCUvQSiOyxtmWElMmx-kEM | — |

No AAAA. No DMARC. No DKIM. (GitHub Pages is IPv4-only here; the mail gaps are ADDITIONS below.)

## ADD at Spaceship (not currently present — improves deliverability + funder/compliance optics)
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:<a mailbox qi controls> | — |
Start at p=none (monitor only, changes nothing), review reports, then tighten to quarantine.
DKIM must be generated inside Google Workspace Admin -> Apps -> Gmail -> Authenticate email,
then published as the TXT record it gives. Cannot be copied from here.

## VERIFY before cutting NS (query Spaceship's nameservers directly)
    dig @<spaceship-ns> l7sinc.com A +short
    dig @<spaceship-ns> l7sinc.com MX +short
    dig @<spaceship-ns> www.l7sinc.com CNAME +short
All must match the table above EXACTLY before the nameserver change.

## Order (do not reorder)
1. Build zone at Spaceship  2. Verify against Spaceship NS  3. Unlock both flags at Wix
4. Request EPP code  5. Initiate transfer at Spaceship  6. Approve  7. Cut NS LAST
⚠️ Wix's "Transfer away" dialog disables auto-renewal — that is now safe, domain is paid to 2027.
⚠️ Confirm the Wix admin email is NOT @l7sinc.com before requesting EPP (circular dependency).
