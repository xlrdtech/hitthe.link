# L7S — RECEIPTS LEDGER
**qi directive 2026-08-29 22:00 EDT: *"you need to attach the receipts for everything that got paid for."***

Every row here points at a FILE. A row with no artifact is marked **NO RECEIPT ON FILE** and
stays that way until one is captured — a remembered amount is not a receipt.
⛔ No card number, last-4, or expiry appears in this folder, per his 19:56 directive.

---

## ✅ HELD — artifact on disk

| Date | Vendor | What | Amount | Receipt # | Artifact |
|---|---|---|---|---|---|
| 2026-08-30 | **Spaceship** | l7sinc.com — transfer in, regular, 1 year | **$9.68** | `AA-202608300111759` | [`receipts/2026-08-30_spaceship_AA-202608300111759_l7sinc-transfer-in_9.68.pdf`](receipts/2026-08-30_spaceship_AA-202608300111759_l7sinc-transfer-in_9.68.pdf) · Order ID `6e5781623e72-4e8499e7b2aeaf170bda` |
| 2026-08-29 | **Spaceship** (via PayPal) | l7sinc.com — transfer in | **$9.68** | PayPal auth, `service@paypal.com` → `xlrdtech@gmail.com` | Spark mail, subject `Spaceship, Inc: $9.68 USD`, msg 86555. Merchant "Spaceship, Inc", `Subtotal $9.68 / Total $9.68`. **Independently confirms the PDF above** |
| 2026-08-29 | **Spaceship** (via PayPal) | luckie7s.com — registration, 1st year | **$9.08** | PayPal auth, `service@paypal.com` → `xlrdtech@gmail.com` | Spark mail, subject `Spaceship, Inc: $9.08 USD`, msg 86550. ⭐ **This closes the row that said NO RECEIPT ON FILE — the qi-stated $9.08 is now CONFIRMED exactly** |
| 2026-08-29 | **Spaceship** | order summary #e084331b-2a87-48bb-b559-1be985dc7eb2 | — | `receipts@spaceship.com` → `xlrdtech@gmail.com` | Spark mail msg 86551. The second of the two orders; pairs with the $9.08 above |


### ⭐ TWO CORRECTIONS THIS RECEIPT FORCES ON `COMPONENT-TABLE.md`

1. **The transfer-in charge was $9.68, not $9.48.** The table recorded $9.48 from qi's verbal
   account of the checkout screen. The receipt is the artifact and it says **$9.68**. A 20-cent
   error is trivial in dollars and is exactly the point: the *only* line we had a receipt for
   turned out to differ from the remembered number. Every other qi-stated figure in that table
   should be read with that in mind.

2. **Spaceship's list price is now VERIFIED at $10.18**, not estimated. The table carried
   $10.18 as *"UNVERIFIED — renewal price from comparison sites, spaceship.com returns 403."*
   His own receipt prints `Subtotal $10.18`, `You save -$0.50`, `Total $9.68`. The list price is
   confirmed from a first-party document; only the *renewal* price remains unverified.

---

## ⛔ NO RECEIPT ON FILE — every one of these is qi-stated only

| Date | Vendor | What | Amount claimed | Where the receipt should be |
|---|---|---|---|---|
| 2026-08-30 00:08:56Z | **Wix** | l7sinc.com renewal, 1 year (paid by Luckie, USAA) | **$21.35** | Wix billing → the account is `xlrdtech@gmail.com`, **which is not one of the 12 accounts Spark holds** — that is why it has not been swept in |
| ongoing | **Spaceship** | Spacemail, `contact@luckie7s.com` — free 30 days | **~$0.98/mo** | No charge yet; first invoice lands ~2026-09-29 |
| ⭐ ongoing | **Google Workspace** | 3 mailboxes @l7sinc.com | **$48.00/mo = $576.00/yr** | `admin.google.com` → Billing. **THIS IS 96.5% OF THE ENTIRE ANNUAL BILL AND HAS NO ARTIFACT.** One look at this invoice is worth more than every other line here combined |

**The charge succeeding is proven for Wix even without the receipt** — the registry expiry
moved `2026-08-31` → `2027-08-31T05:18:53Z`, which only happens when a card actually clears.
That proves *payment*, not *amount*. $21.35 remains qi-stated.

---

## HOW A RECEIPT GETS ADDED
Drop the PDF anywhere in `sync_/inbox_` and it gets picked up, renamed
`YYYY-MM-DD_vendor_receiptnumber_what_amount.pdf`, filed under `receipts/`, and added above.
The 2026-08-30 Spaceship receipt was found exactly that way — it had been sitting in
`inbox_` as an opaque UUID filename since 21:12 EDT and nothing had read it.

---

## 🔴 NEW — FOUND IN HIS MAIL 2026-08-29 22:44, NOT IN THE COMPONENT TABLE

| Vendor | What | Signal | Why it matters |
|---|---|---|---|
| **Spaceship** | **"Web Hosting Essential" subscription — renews in 5 days, AUTO-RENEW ON** | `alert@spaceship.com` → `xlrdtech@gmail.com`, subject *"Upcoming payment: Your Web Hosting Essential subscription will be renewed in 5 days"* | ⚠️ **A recurring hosting charge nobody has priced.** It appears NOWHERE in `COMPONENT-TABLE.md`, whose row 8 records hosting as GitHub Pages at **$0**. The amount is not in the notice — open the Spaceship billing page and get it. This is the exact shape that nearly cost l7sinc.com: an auto-renewal on a card nobody was watching |
| **DocuSeal Pro** | Luckie signed up — *"Welcome to DocuSeal Pro"* | `support@docuseal.com` → `luckieg@l7sinc.com`, plus a founder follow-up from `kriti@docuseal.org` | ⭐ **This fills open item 15 and row 32**, which both said e-signature had **no provider anywhere**. It now has one, chosen by Luckie, and it needs a price and an owner in the table. Relevant to qi's 22:11 remark about not paying ~$300/yr for DocuSign |
| **Asana** | Unread notification naming the Wix renewal | `no-reply@asana.com` → `luckieg@l7sinc.com` | The L7S team already tracks this in Asana: *"Wix Studio - Domain Renewal for Billing for L7SINC.COM \| 08-29-2026 Saturday - Status: Paid with USAA"*. Independent confirmation the renewal cleared, from Luckie's side |
| **Beeper** | Support ticket **#DROID-81811** opened by qi — *"All my messages have slow to sync and/or send"* | `info@beeper.com` → `01@xlrd.org` | The send failure is now a vendor ticket, not just a local symptom. See the send-rail findings from tonight |

⛔ Card last-4 and full PayPal transaction IDs are deliberately **not** reproduced here, per his 19:56 directive.
