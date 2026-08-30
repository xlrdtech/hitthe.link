# l7sinc.com -> Spaceship — steps remaining
Written 2026-08-29 20:48 EDT. Everything above the line is DONE and verified.

## ✅ DONE (verified)
1. **Renewed.** whois Registry Expiry = 2027-08-31T05:18:53Z (was 2026-08-31). $21.35, card, 1yr,
   no extras. Wix email confirmed + Luckie logged it in Asana (paid with USAA).
2. **Root cause found.** All 6 Wix cards expired (Luckie Seven Solutions MC ••3059 exp 10/23 was
   the retry target). Domain lives in xlrdtech@gmail.com / "Xeno Logos" — NOT Luckie's account.
   That is the 2-year mystery: he was fixing the wrong account.
3. **Lock cause found.** clientTransferProhibited + clientUpdateProhibited are Wix DEFAULTS.
   qi never set them. Not ICANN, not a waiting period — a toggle.
4. **Contact-change trap avoided.** Wix save dialog: "can't be transferred to another provider for
   60 days." DISCARDED, nothing saved. This is ICANN Change-of-Registrant, and it BLOCKS the move.
5. **luckie7s.com REGISTERED** at Spaceship — $9.08, 1yr, auto-renew ON, free privacy.
   Why: Wix sends the transfer auth code ONLY to contact@luckie7s.com, which did not exist
   (verisign: "No match"). Also closed a real hijack hole — anyone could have registered it and
   received qi's transfer codes.
6. **Zone captured** for l7sinc.com — all 12 records in ZONE-SPEC-SPACESHIP.md.

## ⛔ BLOCKED HERE
7. **Mail on luckie7s.com.** Spacemail "Unbox" wizard HANGS on the final button — reproduced
   TWICE (20:42, 20:48). `dig luckie7s.com MX` returns EMPTY both times. DNS itself is ONLINE
   (launch1/launch2.spaceship.net, 5 A/CNAME records present).
   ⚠️ DO NOT request the transfer code until `dig luckie7s.com MX` returns real records —
   otherwise the code goes into a void again.
   Options: (a) retry Spacemail later / support ticket, (b) add MX by hand to a forwarding host,
   (c) Cloudflare Email Routing (free) if the zone moves to Cloudflare.
   Forward target per qi 20:38: **agent@xlrd.org** (survives an l7sinc.com lapse). He also floated
   hero@ / admin@ / luckieg@l7sinc.com — NOT settled.

## THEN (in order, do not reorder)
8. Wix -> Domains -> l7sinc.com -> `...` -> **Transfer away from Wix** -> "I Still Want to Transfer".
   Safe now: domain is paid to 2027, so the auto-renew-off warning no longer matters.
   Wix says up to **7 days**; locks re-transfer 60 days AFTER it completes (normal).
9. Code arrives at contact@luckie7s.com -> forwards to the chosen inbox.
10. Build the l7sinc.com zone at Spaceship from ZONE-SPEC-SPACESHIP.md, verify against their NS.
11. Initiate transfer at Spaceship, paste code, approve.
12. Cut nameservers LAST. Add DMARC + DKIM (both currently missing).

---

## 🔭 A WATCHER NOW HOLDS THIS THREAD — you do not have to (added 2026-08-29 21:40 EDT)

`~/bin/xen-l7s-watch`, launchd `com.xen.l7s-watch`, every 15 min, KeepAlive + RunAtLoad.
Ledger `~/.xen/state/l7s-watch.jsonl` · state `~/.xen/state/l7s-watch.json` · logs `~/.xen/logs/`.
It speaks ONLY on a state change, and every line it speaks asserts on a timestamped artifact
(a whois field, a dig answer, an HTTP code, a mail row). Healthy ticks are silent by design.
Supersedes `com.xen.l7sinc-watch` (retired to `.plist.retired-20260829`; its script is preserved).

### ✅ STEP 7 IS NO LONGER BLOCKED — measured 2026-08-29 21:2x EDT
`dig luckie7s.com MX` now returns **`0 mx1.spacemail.com.` / `0 mx2.spacemail.com.`** — the
Spacemail wizard did land. The "returns EMPTY both times" note above is STALE. The auth-code
path is live, and the watcher alarms the moment those MX records disappear again.

### ✅ STEP 8 IS DONE AND THE TRANSFER IS IN FLIGHT
Registry whois: **Registrar = Wix.com Ltd., Domain Status = `pendingTransfer`**,
Updated 2026-08-30T01:11:43Z — the same instant as the Spaceship order receipt
(`receipts@spaceship.com`, 21:11 EDT). Spaceship's 5-day auto-complete clock therefore
expires **2026-09-04 01:11 UTC**.

⚠️ **THE WHOIS TRAP, MEASURED — do not read plain `whois l7sinc.com` and believe it.**
It returns TWO blocks that CONTRADICT each other: the registry block says `pendingTransfer`,
the Wix registrar block appended below says `Domain Status: ok`. Any check that greps
"Domain Status" gets BOTH (`['pendingTransfer', 'ok']`) and will conclude the transfer was
cancelled while it is in fact in flight. Query the registry directly:
`whois -h whois.verisign-grs.com "domain l7sinc.com"` — one block, no ambiguity.

### WHAT WILL MAKE IT SPEAK
- ⭐ Registrar changes to Spaceship/Namecheap -> "L7SINC transfer complete."
- ⚠️ Status returns to `ok` with the registrar UNCHANGED -> "L7SINC transfer failed." (the
  silent failure: a rejected/cancelled transfer looks exactly like a normal domain otherwise)
- 🔴 MX count drops below 5, or A records vanish -> CRITICAL, repeated every 10 min until fixed
- 🔴 luckie7s.com MX goes empty -> "Auth code path is dead"
- Nameservers move · expiry changes · site stops returning 200 (two ticks in a row)
- New Wix/Spaceship mail about the domain, and the **actual** Google Workspace invoice amount
- T-24h on the auto-complete clock · day 25 of the Spacemail free trial
- Any surface unreadable for 6 continuous hours (so the watcher cannot die quietly)

### THE ONE NUMBER STILL UNVERIFIED
Google Workspace ~$48/mo for 3 mailboxes is **qi's estimate — no invoice has ever been seen**,
and it is ~96.5% of the annual bill. The watcher is waiting on `payments-noreply@google.com`
and will speak the real figure the moment one arrives. Nobody logs into the admin console.
