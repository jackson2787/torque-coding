# Torque Coding v2 — Operating Model

**Version**: 2.2-dev | **Status**: Additive parallel — v1 remains fully functional

This directory contains the complete v2 operating model. Nothing in `agent/`, `skills/`, `optional-skills/`, or `skill-packs/` has been modified. v2 is additive and parallel.

---

## Why this project exists

Most modern AI-coding frameworks — Claude Agent SDK, Cursor composer, Devin, the agent patterns baked into the latest IDE extensions — are optimised for the developer who lives inside a single ecosystem. Full Claude Max, Cursor Ultra, unlimited Copilot — the £200/month tier where the session is the substrate, rate limits rarely bite, and you rarely need to leave the tool you started in.

**Torque Coding is built for the other market.** The mid-tier developer on a £20/month plan who is, in practice, a nomad:

- Rate-limited, so context-switching between Claude, ChatGPT, Cursor, and whatever the free-tier model-of-the-month is
- Hitting usage caps mid-task and having to resume in a different tool
- Running on whichever model their provider's tier ships today (Sonnet one week, something cheaper the next)
- Moving between Claude Code, Cursor, Aider, Copilot, and plain API chat depending on which does this particular step best
- Unable to rely on long sessions — context windows get clipped, "memory" features are flaky and non-portable

For that developer, the session is ephemeral and the tool is interchangeable. What isn't interchangeable is the **project on disk**.

### The core bet

Torque Coding treats the memory bank on disk as canonical and always-on. **The agent session — Claude Code's context, Cursor's composer history, ChatGPT's memory — sits inside the memory-bank domain as an enhancement, not a replacement.** Everything a model needs to resume, hand off, or be switched mid-task lives in `.memory-bank-v2/` on disk.

This inverts the frontier-tool assumption. Frontier tools assume you stay in the session; Torque Coding assumes you won't. Consequences of the inversion:

- Hit a Claude rate limit → open Cursor → it reads `current-task/` → resume at the same state
- Budget model stalls on a hard problem → switch to a stronger tier for one session → that session reads `escalation-brief.md` → fix lands → back to the budget model
- Session gets compacted and loses the thread → `activeContext.md` + `current-task/` restores exactly where you were
- Come back two weeks later on a different laptop → the memory bank tells the next session what's true

None of those paths require paying for a single ecosystem. They require paying for **whichever model you need right now** — which is the actual budget shape for mid-tier developers.

### Why the planner-executor split follows from the budget

The v2.1 state machine runs planning on a powerful model and execution on a budget model, with the hand-off as files on disk (`plan.md` + `plan_context.md`).

At £200/month this is an architectural nicety. At £20/month it is the difference between one complex task per day and five on the same subscription. Planning burns tokens but happens once per task; execution burns tokens continuously. Putting them on different tiers — with a context pack complete enough that the budget model needs zero exploration — stretches the cap where it matters.

### What gets traded away

This positioning costs portability tax inside any single tool:

- Skills are Markdown, not typed tool schemas — so they run across Claude Code, Cursor, Copilot, Aider, plain chat, rather than locking to one SDK
- Protocols (propose-diff, ratification keyword, approval gates) are conversational rituals rather than structured tool calls — auditability trades for portability
- Escalation is sequential (one stronger model, one retry) rather than parallel fan-out/gather — because at £20/month you cannot afford three concurrent subagents

These are deliberate choices, not catching-up. Inside Claude Code specifically, some of this work could be native to the Agent SDK. But Torque Coding is not a Claude Code product — it is a tool-agnostic operating model that has to survive wherever the developer's budget takes them that week.

### The shape of the claim

Torque Coding is a late-2025 operating model designed for the part of the AI-coding market that cannot afford late-2025 tool lock-in. That is a larger market than the frontier, and it is the one this project serves.

---

## Why v2 exists (vs v1)

v1's memory bank mixes three kinds of material in one directory:

1. **Durable doctrine** — domain definitions, architectural laws, security boundaries. True for years.
2. **Live working rules** — current patterns, active constraints, how things actually work today. True until the repo evolves.
3. **Human narrative** — task histories, decision rationale, meeting outcomes, why a choice was made. True forever but retrospective.

Agents load all of it. Context windows fill with retrospection that doesn't direct execution. The wrong things are sticky; the right things aren't clearly distinguished.

v2 splits these into two domains and adds a disciplined learning phase.

---

## The two-domain split

### Machine-facing memory — loaded every session

| File | Purpose | Change frequency |
|---|---|---|
| `constitution.md` | Stable truths — domain definitions, durable architectural rules, security boundaries, scope. Rarely changes. | Ceremonial — requires explicit human ratification |
| `operational-context.md` | Current working rules — present-tense directives: do this, do not do this, prefer this, avoid this, current constraints. Updates when the repo evolves. | Per-learning, via debrief |
| `limits.md` *(v2.2)* | Runtime config — per-state token budgets (soft/hard caps) and the escalation ladder. Tunable by developer tier. | When the developer's tier or project scale changes |
| `activeContext.md` | *(carried from v1)* — compaction recovery anchor: current state, progress, session data | Every state transition |
| `toc.md` | *(carried from v1)* — mechanical index of both memory halves | When files are added or removed |

### Human-facing memory — loaded on demand only

```
.memory-bank-v2/human/
├── decisions/   — architectural decision records, one file per decision
├── tasks/       — task histories, outcomes, files modified
├── meetings/    — discussion summaries, outcomes
├── rationale/   — standing "why we do X" documents
└── progress/    — quarterly notes
```

Agents do **not** load the human side at startup. They read it on explicit request or when a skill requires it.

---

## Authority order — strict

```
constitution.md
    ↓ overrides
operational-context.md
    ↓ overrides
task instructions
    ↓ overrides
temporary reasoning
```

Task instructions cannot override operational-context rules. The human must amend operational-context first.

See [`claude-rules/authority-order.md`](./claude-rules/authority-order.md) for worked examples.

---

## State machine (v2.2)

```
PLAN  →  PLAN-CONTEXTUALIZE  →  BUILD  ↔  QA  →  DEBRIEF
                                        ↓ (3 stalls OR cap exhaustion)
                                    ESCALATE (ladder-stepped)
```

Each state declares a model tier, an input contract (files on disk), and a token budget loaded from `limits.md`.

- **PLAN** — powerful model. Produces `current-task/plan.md` — task contract, authority check, reuse analysis, acceptance criteria. Hard cap (default): 25k input tokens.
- **PLAN-CONTEXTUALIZE** — powerful model. Produces `current-task/plan_context.md` — a context pack so complete that BUILD needs zero exploration. Hard cap (default): 40k.
- **BUILD** — budget model. Applies the plan, logs attempts. Max 3 attempts OR cap exhaustion before escalation. Hard cap per attempt (default): 15k.
- **QA** — budget model, skeptical by design. Six fixed checks, all executed (not reasoned about). Constitutional crossings stop immediately. Hard cap per cycle (default): 12k.
- **ESCALATE** — subagent at the next rung of the configurable ladder (default: `sonnet → opus → user-switched session`). Steps up on repeated stall.
- **DEBRIEF** — any model. Five-gate learning rubric. Proposes diffs to `operational-context.md`. Archives `current-task/` to the human side.

Any session enters at the earliest state whose input contract is satisfied — determined by which files exist in `current-task/`. This is what makes stateless / resumable operation across tools possible.

### Cap exhaustion = stall (v2.2)

A state hitting its hard cap is indistinguishable in effect from a failed attempt. It counts against the cycle budget and escalates on the same thresholds. This makes cost-awareness first-class at the operating-model level, not an afterthought.

See [`claude-rules/state-machine.md`](./claude-rules/state-machine.md).

---

## v2 source structure

```
v2/
├── README.md                               ← this file
├── AGENTS.v2.md                            ← v2 operating model (all agent types)
├── CLAUDE.v2.md                            ← Claude Code adapter
├── bootstrap-memory-bank-v2-contract.md    ← cold-start contract
├── claude-rules-v2/
│   ├── sacred-rules.v2.md                 ← four sacred rules + v2 additions
│   ├── memory-bank.v2.md                  ← two-domain structure and load rules
│   ├── authority-order.v2.md              ← strict authority stack
│   └── state-machine.v2.md               ← PLAN > BUILD LOOP > DEBRIEF spec
├── templates/
│   ├── machine/
│   │   ├── constitution.md               ← blank constitution template
│   │   ├── operational-context.md        ← blank operational-context template
│   │   ├── limits.md                     ← runtime config: budgets + escalation ladder (v2.2)
│   │   ├── activeContext.md              ← v2 activeContext with current-task pointer
│   │   └── current-task/                 ← per-task artifact templates (v2.1)
│   │       ├── plan.md
│   │       ├── plan_context.md
│   │       ├── build-log.md
│   │       ├── qa-report.md
│   │       └── escalation-brief.md
│   └── human/
│       └── README.md                     ← human-side landing page template
└── skills/
    ├── memory-bank-v2/
    │   ├── update-constitution/SKILL.md
    │   ├── update-operational-context/SKILL.md
    │   └── update-human-log/SKILL.md
    └── state-machine-v2/
        ├── writing-plans-v2/SKILL.md     ← PLAN state
        ├── plan-contextualize/SKILL.md   ← PLAN-CONTEXTUALIZE state
        ├── build-loop/SKILL.md           ← BUILD state (zero-exploration)
        ├── qa-v2/SKILL.md                ← QA state (skeptical, six checks)
        ├── escalate/SKILL.md             ← ESCALATE (subagent primary, user-switch fallback)
        └── debrief/SKILL.md              ← DEBRIEF (post-task + ad-hoc modes)
```

---

## Coexistence with v1

- v1 source: `agent/`, `skills/` → writes to `.memory-bank/`
- v2 source: `v2/` → writes to `.memory-bank-v2/`
- No file is shared between regimes.
- When both are installed: v2 is canonical (declared in `AGENTS.v2.md`).
- v1 is unaware of v2; the tie-break lives inside the v2 model.

---

## What landed in v2.2

- `limits.md` — machine-side runtime config loaded at session startup
- Per-state token budgets (soft/hard caps) with cap exhaustion as a first-class stall signal
- Configurable escalation ladder (no longer hard-coded to `opus`) with ladder-stepping discipline

## What is deferred to future passes

- `mb-rebase-v2/SKILL.md`
- `compaction.v2.md`
- `v2/docs/` — doctrine prose, migration-from-v1 mapping table
- Skill-pack v2 parallels
- Installer wiring (`bin/`, `lib/`)
- Telemetry feedback into `limits.md` — today the human tunes by hand; a future pass could surface "you crossed the soft cap 8/10 times this week — consider raising it" from `build-log.md` history
