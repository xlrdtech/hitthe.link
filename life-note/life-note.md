# LIFE NOTE + SUIC · IDE — full context, one fetch

> Raw canonical source for the voice layer. Everything needed to discuss either concept is in this
> single file. Nothing here is invented; verbatim source lines are marked VERBATIM.
>
> Live pages: https://hitthe.link/life-note/ · https://hitthe.link/life-note/suic/
> This file:  https://hitthe.link/life-note/life-note.md
> Generated:  2026-08-05 · Source of record: `~/.xen/state/auto-fleet.txt` lines 1–10

---

## TL;DR FOR THE VOICE LAYER

- **Life Note** — a dev-focused, life-affirming note system. "The Death Note spinoff for developers."
- **SUIC · IDE** — the editor replacement where `.sel` files and the agent fleet are authored. A VS Code substitute.
- Both are **qi's IP**, dated **2026-05-31**, recorded in the same block.
- **Both specs are PENDING qi's Lark doc** (Windows-side, unreachable since at least 2026-06-10). Only the names, premises and stack positions exist.
- **Do not invent mechanics for either.** If asked what a Life Note file *does*, the honest answer is: not recorded.
- Contrast with **ESP_ (Executive Sacred Peak)**, which IS fully specified — different situation, do not conflate.

---

## 1. LIFE NOTE

### VERBATIM (auto-fleet.txt, PENDING CANON block)

```
# Life Notes system : "Life Note — the Death Note spinoff for developers" (found in Paste history,
#   qi logo-prompt). Dev-focused note system, life-affirming counterpart to Death Note. Full spec pending Lark.
```

### The concept

The inversion of Death Note. Where the original is a book you write a name into to end a life, Life Note
is written for developers and is life-affirming by design — the note is where something begins rather
than ends. A developer's notebook is already where things get born; naming it against Death Note makes
the direction explicit.

### Provenance

| Field | Value |
|---|---|
| Concept dated | qi · 2026-05-31 |
| Captured from | A **logo prompt** found in qi's Paste history — not from a spec document |
| Source of record | `~/.xen/state/auto-fleet.txt` lines 1–5 (PENDING CANON block) |
| Mirror | `AUTO_AGENT_PROTOCOL_LIST.md` — synced 2026-08-05 after 17 days of drift |
| Vault canon | `canon-proprietary-stack-and-akashic.md` |
| Also captured in | `062126-2-win.md:1267` |
| Spec status | **PENDING** — qi's Lark doc |

### What is NOT recorded

What a Life Note file is · how it is written · what happens when written · how it relates to `.sel`.

---

## 2. SUIC · IDE

### VERBATIM (auto-fleet.txt, PROPRIETARY STACK + PENDING CANON blocks)

```
# IDE       : SUIC IDE  (where .sel files + the agent fleet are authored)
# SUIC IDE       : full spec pending — name captured, details in qi's Lark doc.
```

### The concept

The editor replacement — a VS Code substitute built for a stack VS Code has no concept of. Two facts are
recorded: it is an IDE, and it is where `.sel` files and the agent fleet get written.

### On the name

Set as two tokens — **SUIC** + **IDE**. Run together the letters spell another word and the wordplay is
deliberate, but the thing itself is an editor. The wordmark is always set split (`SUIC · IDE`) so it reads
as one. When speaking it aloud, say "SUIC IDE" as two words.

### Why a replacement rather than a plugin (INFERENCE, not from the record)

1. **A format nothing else parses** — `.sel` is Self Exec native; no existing language server, linter or
   syntax definition knows it.
2. **Manifests that aren't manifests** — `automanifests` is explicitly *not* `package.json` or
   `manifest.json`, so every tool assuming those assumes wrong.
3. **Agents are the artifact** — the fleet is authored here, not just code. An editor whose unit of work
   is a file rather than an agent is the wrong shape.

### What is NOT recorded

The editor's architecture · whether it forks an existing base · its UI · its language-server story ·
how it runs agents.

---

## 3. THE PROPRIETARY STACK (qi 2026-05-31)

### VERBATIM

```
# ════ PROPRIETARY STACK (qi 2026-05-31) ════
# FILE TYPE : .sel files  (Self Exec native proprietary format)
# MANIFESTS : automanifests  (our manifest format — the auto-manifest, NOT package.json/manifest.json)
# IDE       : SUIC IDE  (where .sel files + the agent fleet are authored)
# ════════════════════════════════════════════
```

| Piece | What it is | Spec |
|---|---|---|
| `.sel` files | Self Exec native proprietary file format | not in this record |
| `automanifests` | qi's manifest format — NOT package.json / manifest.json | not in this record |
| **SUIC IDE** | Where `.sel` files + the agent fleet are authored | **PENDING Lark** |
| **Life Notes** | Dev-focused, life-affirming note system | **PENDING Lark** |

---

## 4. THE BLOCKER

Both specs live in a **Lark doc, Windows-side**. The fleet mirror's own build note, dated 2026-06-10,
reads: *"no Lark MCP available; spec not found in Lark."* It has not been reachable in any session since.

**The Lark doc is the only thing that unlocks either spec.** Nothing else.

---

## 5. HOW THESE TWO RELATE

Recorded in the same block, on the same day, blocked on the same document. They unblock together — when
the Lark doc is reachable, both specs land at once. The pages are cross-linked in both directions for
that reason.

---

## 6. DO NOT CONFUSE WITH

- **`hitthe.link/life`** — "XEN · LIFE — Command Dashboard", a live goal-swarm/steer surface reading
  `xen/live.json`. Unrelated to Life Note despite the name overlap.
- **ESP_ (Executive Sacred Peak)** — a **fully specified** 3-layer real-time cognition engine
  (ESP_ / MAP / MMM), full README at `dev_/xen/Teleport/Okay. This is what I'm thinking..md` lines
  5622–5688. ESP_ is NOT pending. Different situation entirely.

---

*Life Note and SUIC · IDE are qi's intellectual property. This file records what exists; it does not
extend it.*
