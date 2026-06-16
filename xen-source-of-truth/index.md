# XEN — Operational Source of Truth (CURRENT vs INTENDED)
_Assembled 2026-06-15 from live recon. Sources of truth: `/Volumes/M4` (macOS), `E:\` (Windows/nitro). Secrets scrubbed._

> Status legend: **CURRENT** = deployed/active w/ evidence · **INTENDED** = design target, not (fully) implemented.
> Sections 1–2 (Telephony, LiveKit) + 7 (Nitro/Windows) pending agent completion — appended on arrival.

---

## 3. VVSVEI Gate & hitthe.link/vvsvei  — CURRENT
- **UI pages** (GH Pages, repo `xlrdtech/hitthe.link`, CNAME `hitthe.link`): `/vvsvei/` (130KB main VEI UI), `/vvsvei-live/` (5.2KB lossless relay viewer), `/vvsvei-voice/` (redirect). Inline-HTML canon, SSE-driven, no build.
- **Broker:** `xen-vvs-relay` (Node + ioredis + Redis Streams) on Railway → `xen-vvs-relay-production.up.railway.app`. Streams `vvs:out` (Xen→public) / `vvs:in` (remote→Xen). Endpoints: `POST /emit` (auth `x-relay-token`), `GET /sse?since=`, `POST /in`, `GET /sse-in?token=`, `GET /healthz`. MAXLEN ~50k, lossless XADD + backlog replay.
- **Tap:** `omni-tap.js` passively reads omnimind `:4441/events` → POST `/emit` (content-window dedup). `inbound-bridge.js` reads `/sse-in` → POST omnimind `/api/dictate-inject` (universal entry point).
- **Tags produced** in `omnimind.js:2839–2914`: text carries `<h:mm:ss AM/PM>, <tag>:` prefix; `kind`/event field classifies. Full set: `in: typed: aua: sms: bee: omi: call: note: email: tool:` + channels `xen-dictate-in xen-out term: vision:`.
- **GAP — subscription registry:** none. Relay is stateless per-connection (`?since=<id>` resume). _Fix:_ add `Map<clientId,{lastId,filters}>` in `server.js` for selective/tag-filtered replay (only if selective routing becomes required).
- Key files: `xen-vvs-relay/{server.js,omni-tap.js,inbound-bridge.js}`, `omnimind.js:2839-2914`, `vvsvei-gate.js` (idempotency dedup).

## 4. TUI Injection & Subscription — CURRENT (coordinate-based) / INTENDED (registry)
- **Injectors (all on M4, launchd):** `beside_ws_stream.py` (live SMS → `xen-fanout in: <tag>`), `omnimind.js:618 injectIntoPaneTui()` (voice replies, `tmux send-keys ESC→-l text→Enter`, double-Enter), `inbound-bridge.js` (remote → `/api/dictate-inject`, NOT raw inject). `beside_inbox_poller.py` DISABLED (dup-inject).
- **Pane resolution:** `~/.xen_tmux_target` + `xen-resolve-pane` + `~/.xen/state/pane-role-override.json` (`{"%4":"exodus"}` hard pin, set this session). `pane-roles.json` auto-refreshed.
- **GAP — no tag-based subscription registry.** `push-subscriptions.json` is an empty legacy stub. Injection is per-pane coordinate; on pane destruction, in-flight messages lost. _Fix (reversible):_ `~/.xen/state/session-subscriptions.json` + omnimind `POST /api/subscriptions/register`, `GET /list`, `DELETE /{id}`; injectors query `/list` instead of `~/.xen_tmux_target`, fall back to the coordinate file if the endpoint is down. This is the "subscribe from anywhere, no coordinate friction" end state.

## 5. OTLP / OpenObserve / Tailscale — CURRENT
- **otelcol-contrib** (PID 943) config `/Volumes/M4/sync_/exedus/dev_/xen/otel-config.yaml`: receivers OTLP gRPC `:4317` + HTTP `:1212`; batch processor; exporters `file` (`logs/otlp-omnisync.jsonl`), `debug`, `otlp_http/openobserve` → `127.0.0.1:5080/api/default`. All 3 pipelines (traces/metrics/logs) → all 3 exporters.
- **Exporting services:** `xen-omni-otlp-bridge` (omnimind `:4441/events` → `:1212/v1/logs`, `service.name=xen-omniawareness`), `xen-netwatch`, possibly others.
- **OpenObserve** (PID 889) `:5080`, binary `/Volumes/M4/sync_/exedus/dev_/bin/openobserve`, UI `otlp-view.xlrd.org`. Schemaless auto-discovery; data dir only has cache (minimal persistence).
- **Tailscale** (`/opt/homebrew/bin/tailscale`): **m4** 100.97.145.50 (macOS, exit node) · **nitro** 100.80.76.79 (Windows, exit node) · **16** 100.77.15.88 (iOS) all active. Offline: exedus (Linux, 6d), xencom0, xvm, others.
- **GAPS:** (a) `exedus` Linux node offline 6d → `tailscale up`. (b) OpenObserve persistence = cache only → set `ZO_DATA_DIR` to durable path. (c) OTLP export localhost-only → expose `:5080`/collector on tailnet for cross-node. (d) **Secrets in plaintext** (OpenObserve root pw + otel basic-auth in plist/yaml) → move to env/vault, rotate. _[SCRUB before any public ship.]_

## 6. Comms — Beeper / SMS / Phound — CURRENT
- **Beeper:** Beeper Desktop MCP `:23373` → auth-injecting proxy `beeper-mcp-proxy.js` `:23374` → omnimind. `beeper_at_xen_watcher.py` (5s poll, @xen activation). `lib/persona-router.js` routes to personas. Fully wired.
- **SMS (Beside):** `beside_ws_stream.py` (WebSocket realtime, primary) + `beside_inbox_poller.py` (polling backstop, dedup via seen.db). Outbound `beside-send.sh` → Beside REST, canonical chat `prv_XJ9CGSMWY50R7691SXSKFJ7NDW` (qi 9983 ↔ Xen 9934). Inbound tag `in: <ts>, sms: <author> <text>`.
- **Phound — DISCREPANCY RESOLVED (ground truth):** a stale canon note (`canon_phound_out.md`, 2026-04-30) says removed, and a recon agent claimed the Playwright daemons "don't exist" — **both wrong as of 2026-06-15.** Directly verified RUNNING this session: `phound-host.mjs` (PID 68433, room `xlrdtech` hosted, host seat taken) + `phound-room-keeper.WORKING.mjs` (PID 1037) at `/Volumes/M4/sync_/exedus/dev_/projects/browser-eval/`, plus `com.xen.phound-room-keeper` launchd + Phound.app. **CURRENT:** browser-automation control of web.phound.app holds the room. **GAP:** no MCP connector; two-way audio blocked by un-wired CoreAudio loopback (needs qi sudo/mic touch). _Fix:_ build `lib/phound-mcp.js` connector + wire the loopback.
- **Telnyx/FreeSWITCH:** Beside exposes a 24h Telnyx JWT (`/api/phone/telnyx-credentials`) but **Xen does not consume it** — telephony is NOT integrated into the Xen stack today (see §1 when appended).

## 2. LiveKit / Voice-Agent — CURRENT (deployed) / INTENDED (live path)
- **Railway project `xen-livekit-voice`** (id `22956c81-67fc-4a01-abe6-0b28409132d7`), 5 services: `livekit-server`, `voice-agent`, `web-frontend`, `Redis`, **`xen-vvs-relay`** (the VVSVEI broker is co-located in this same project).
- **CURRENT:** server + frontend + Redis online (WebRTC transport up). `voice-agent` needs a real `OPENAI_API_KEY` to run the live loop → live voice loop NOT fully operational on LiveKit. Headless join via token only (Turnstile blocks browser login).
- **SIP/media wiring:** NO FreeSWITCH / Telnyx / SIP-gateway service in the project → **PSTN→LiveKit is NOT wired.** The PSTN/voice qi actually uses today is the LOCAL path: `apple-stt-v2` (STT) + `xen-say-worker` (TTS, one-voice queue) + omnimind — NOT LiveKit. **LiveKit is INTENDED transport, deployed but not yet the live path.**
- **STT/TTS/LLM:** voice-agent wired for **OpenAI** (metered SaaS) — cost risk at high duration; conflicts with the always-free goal. _Fix:_ swap to self-hosted/cheap STT/TTS (whisper/edge-tts/groq) before LiveKit becomes the live path.
- **GAP:** (a) wire SIP ingress (Telnyx→LiveKit SIP gateway, §1) so PSTN reaches the agent; (b) supply non-metered STT/TTS/LLM; (c) decide LiveKit-vs-local as the canonical live voice path.

## 1. Telephony — Telnyx + FreeSWITCH — INTENDED (not yet integrated)
- **FreeSWITCH:** NOT found running locally (no `freeswitch` process) and NOT in the Railway project (only the 5 `xen-livekit-voice` services exist). → **not deployed.**
- **Telnyx:** Beside exposes a 24h Telnyx JWT at `/api/phone/telnyx-credentials` (`aud=telnyx_telephony`, HS512) but **Xen has no consumer** of it — no Telnyx REST client, no SIP trunk, no dialplan in the codebase. Channel-billing / DID config can't be read from disk (lives in Telnyx Mission Control — needs API/portal).
- **Numbers in the stack today (NOT Telnyx):** `678-345-2142` (Phound / FreeConferenceCall room `xlrdtech`), `470-615-9983` (Beside, qi↔Xen canonical), plus qi GV/other rails `770-765-2217`, `404-734-8672`. These are the CURRENT telephony rails.
- **The 44.4k-inbound-min mandate + "<$15/mo Telnyx+FreeSWITCH":** INTENDED design target, **not realized** — nothing is wired to Telnyx yet, so there is no inbound/outbound minute usage or channel-billing in effect. Dialpad explicitly rejected.
- **GAP / fix (reversible, staged):** (1) stand up FreeSWITCH (Railway service or M4/nitro local daemon); (2) provision Telnyx DID(s) + enable Channel Billing for flat unlimited inbound; (3) SIP trunk Telnyx↔FreeSWITCH; (4) bridge FreeSWITCH→LiveKit SIP so PSTN reaches the agent (ties §2). Until then telephony stays on Beside/Phound rails.
- _NOTE: live Telnyx account state (DIDs, channel-billing status, actual per-min rates, last-month minutes/charges) requires Telnyx Mission Control API/invoice access — cannot be sourced from `/Volumes/M4` disk. Flagged for qi to pull or authorize API access._

## 7. Nitro / Windows (`E:\`) — recon pending
- Nitro reachable over tailnet (`ssh nitro`, host `NITRO11`, `100.80.76.79`, `E:\` present, exit node). Full `E:\` inventory (xen code, running daemons, Claude/WT sessions as inject targets, Tailscale, OTLP exporter, Windows inject mechanism since no tmux) — **agent in flight; appended on completion.**

---
**Top gaps (priority):** ① Telnyx+FreeSWITCH not wired (telephony mandate unrealized) · ② no tag-based subscription registry (injection still per-pane coordinate) · ③ LiveKit deployed but not the live voice path + uses metered OpenAI · ④ Phound has no MCP connector + two-way audio blocked on CoreAudio loopback · ⑤ plaintext OTLP creds + `exedus` node offline. Each has a reversible fix above.
