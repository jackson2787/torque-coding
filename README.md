# Torque Coding — Operating Model

**Version**: 3.0.0-beta.1 — **public beta**. Feature-complete and internally dogfooded, but not yet battle-tested on external projects. Feedback and bug reports welcome at [github.com/jackson2787/torque-coding/issues](https://github.com/jackson2787/torque-coding/issues) — especially "I tried to bootstrap and got stuck at X" reports.

> **A tool-agnostic operating model that survives wherever your rate-limit takes you that hour / day / week / month.**

---

<p align="center">
   <img src="./.assets/0d39f7870f3a26463bc3cd6cd8b3abfde956f386fde2b3a01aa59f833d752ee7.jpg" alt="Torque Coding" width="720" />
</p>

## Install

```bash
# Install globally
npm install -g torque-coding

# Or run without installing
npx torque-coding init
```

Inside your project root:

```bash
cd my-project
torque-coding init
```

This scaffolds `.memory-bank-v2/` and deploys `AGENTS.md` plus `.agent/rules/` + `.agent/skills/` for tool-agnostic agents, and `CLAUDE.md` plus `rules/` + `.claude/rules/` + `.claude/skills/` for Claude Code. After `init`, open a new session with your AI agent and ask it to:

> "Read `bootstrap-memory-bank-contract.md` and follow the bootstrap procedure to populate `.memory-bank-v2/machine/constitution.md` and `.memory-bank-v2/machine/operational-context.md` for this project."

Full walkthrough — first task, bootstrap, debrief — in [GETTING-STARTED.md](GETTING-STARTED.md).

---

## What problem is this project solving?

Torque Coding is designed for the mid-tier AI-coding developer (£20/month plans, not £200) who cannot afford tool lock-in — so it treats the **memory bank on disk as canonical** and the agent session as replaceable.

The concrete problems it solves:

1. **Ecosystem lock-in is expensive.** Frontier tools assume you stay in one session. Torque Coding lets you plan in Claude Code, build in OpenCode with a fast/local executor model, review in Codex — the hand-off is files on disk, not session state.
2. **Context loss is routine at this tier.** Rate limits, compaction, session switches. `activeContext.md` + `current-task/` means any compliant tool can resume exactly where the last one stopped.
3. **Planner-executor cost asymmetry.** Planning burns tokens once per task; execution burns continuously. Putting them on the same powerful tier wastes the monthly cap. The state machine forces the split via `plan_context.md` — a pack complete enough that the executor model needs zero exploration.
4. **Agents declare victory too early.** QA is paranoid by design — six checks, all executed (never reasoned about), constitutional boundaries stop immediately.
5. **Silent drift from doctrine.** A hard human gate (verbatim approval quote in `activeContext.md#Approval-Record`) blocks BUILD until a plan is explicitly approved. Debrief proposes learnings back into `operational-context.md` rather than letting them rot in chat history.

---

## Why this project exists

Most modern AI-coding frameworks — Claude Agent SDK, Cursor composer, Devin, the agent patterns baked into the latest IDE extensions — are optimised for the developer who lives inside a single ecosystem. Full Claude Max, Cursor Ultra, unlimited Copilot — the £200/month tier where the session is the substrate, rate limits rarely bite, and you rarely need to leave the tool you started in.

**Torque Coding is built for the other market.** The mid-tier developer on a £20/month plan who is, in practice, a nomad:

- Rate-limited, so context-switching between Claude, ChatGPT, Cursor, and whatever the free-tier model-of-the-month is
- Hitting usage caps mid-task and having to resume in a different tool
- Running on whichever model their provider's tier ships today (Sonnet one week, something cheaper the next)
- Moving between Claude Code, Cursor, Aider, Copilot, Codex, and plain API chat depending on which does this particular step best
- Unable to rely on long sessions — context windows get clipped, "memory" features are flaky and non-portable

For that developer, the session is ephemeral and the tool is interchangeable. What isn't interchangeable is the **project on disk**.

### The core bet

Torque Coding treats the memory bank on disk as canonical and always-on. **The agent session — Claude Code's context, Cursor's composer history, ChatGPT's memory — sits inside the memory-bank domain as an enhancement, not a replacement.** Everything a model needs to resume, hand off, or be switched mid-task lives in `.memory-bank-v2/` on disk.

This inverts the frontier-tool assumption. Frontier tools assume you stay in the session; Torque Coding assumes you won't. Consequences of the inversion:

- Hit a Claude rate limit → open Cursor → it reads `current-task/` → resume at the same state
- Executor model stalls on a hard problem → switch to a stronger tier for one session → that session reads `escalation-brief.md` → fix lands → back to the executor model
- Session gets compacted and loses the thread → `activeContext.md` + `current-task/` restores exactly where you were
- Come back two weeks later on a different laptop → the memory bank tells the next session what's true

None of those paths require paying for a single ecosystem. They require paying for **whichever model you need right now** — which is the actual budget shape for mid-tier developers.

### Why the planner-executor split follows from the budget

The state machine runs planning on a powerful model and execution on an executor-tier model (fast/local/cheap — whatever is available), with the hand-off as files on disk (`plan.md` + `plan_context.md`).

At £200/month this is an architectural nicety. At £20/month it is the difference between one complex task per day and five on the same subscription. Planning burns tokens but happens once per task; execution burns tokens continuously. Putting them on different tiers — with a context pack complete enough that the executor model needs zero exploration — stretches the cap where it matters.

### What gets traded away

This positioning costs portability tax inside any single tool:

- Skills are Markdown, not typed tool schemas — so they run across Claude Code, Cursor, Copilot, Aider, Codex, plain chat, rather than locking to one SDK
- Protocols (propose-diff, ratification keyword, approval gates) are conversational rituals rather than structured tool calls — auditability trades for portability
- Escalation is sequential (one stronger model, one retry) rather than parallel fan-out/gather — because at £20/month you cannot afford three concurrent subagents

These are deliberate choices, not catching-up. Inside Claude Code specifically, some of this work could be native to the Agent SDK. But Torque Coding is not a Claude Code product — it is a tool-agnostic operating model that has to survive wherever the developer's rate-limit takes them that hour.

### The shape of the claim

Torque Coding is an operating model designed for the part of the AI-coding market that cannot afford tool lock-in. That is a larger market than the frontier, and it is the one this project serves.

---

## The two-domain memory bank

The memory bank splits into a machine-facing domain (loaded every session) and a human-facing domain (loaded on demand only). This separation keeps prescriptive working rules in the agent's context while keeping retrospective narrative off it — the wrong things are no longer sticky.

### Machine-facing memory — loaded every session

| File | Purpose | Change frequency |
|---|---|---|
| `constitution.md` | Stable truths — domain definitions, durable architectural rules, security boundaries, scope. Rarely changes. | Ceremonial — requires explicit human ratification |
| `operational-context.md` | Current working rules — present-tense directives: do this, do not do this, prefer this, avoid this, current constraints. Updates when the repo evolves. | Per-learning, via debrief |
| `limits.md` | Runtime config — per-state token budgets (soft/hard caps) and the escalation ladder. Tunable by developer tier. | When the developer's tier or project scale changes |
| `activeContext.md` | Compaction recovery anchor: current state, progress, session data, pointer to `current-task/` | Every state transition |
| `current-task/` | At most one active task. Holds `plan.md`, `plan_context.md`, `build-log.md`, `qa-report.md`, `escalation-brief.md` as applicable. | Written by state-machine skills during the task lifecycle |

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

Task instructions cannot override hard operational-context rules. The human must amend operational-context first.

See [`rules/authority-order.md`](./rules/authority-order.md) for worked examples.

---

## State machine

```
PLAN  →  PLAN-CONTEXTUALIZE  →  BUILD  ↔  QA  →  DEBRIEF
                                        ↓ (3 stalls OR cap exhaustion)
                                    ESCALATE (ladder-stepped)
```

Each state declares a model tier, an input contract (files on disk), and a token budget loaded from `limits.md`.

- **PLAN** — powerful model. Produces `current-task/plan.md` — task contract, authority check, reuse analysis, acceptance criteria. Hard cap (default): 25k input tokens.
- **PLAN-CONTEXTUALIZE** — powerful model. Produces `current-task/plan_context.md` — a context pack so complete that BUILD needs zero exploration. Hard cap (default): 40k.
- **BUILD** — executor model. Applies the plan, logs attempts. Max 3 attempts OR cap exhaustion before escalation. Hard cap per attempt (default): 15k.
- **QA** — executor model, skeptical by design. Six fixed checks, all executed (not reasoned about). Constitutional crossings stop immediately. Hard cap per cycle (default): 12k.
- **ESCALATE** — subagent at the next rung of the configurable ladder (default: `sonnet → opus → user-switched session`). Steps up on repeated stall.
- **DEBRIEF** — any model. Five-gate learning rubric. Proposes diffs to `operational-context.md`. Archives `current-task/` to the human side.

Any session enters at the earliest state whose input contract is satisfied — determined by which files exist in `current-task/`. This is what makes stateless / resumable operation across tools possible.

### Cap exhaustion = stall

A state hitting its hard cap is indistinguishable in effect from a failed attempt. It counts against the cycle budget and escalates on the same thresholds. This makes cost-awareness first-class at the operating-model level, not an afterthought.

See [`rules/state-machine.md`](./rules/state-machine.md).

---

## Repository layout

```
.
├── agents/
│   ├── AGENTS.md                   ← tool-agnostic entry point (Codex, Cursor, Aider, …)
│   └── CLAUDE.md                   ← Claude Code entry point (uses @-imports)
├── bootstrap-memory-bank-contract.md ← cold-start contract for a target repo
├── ROADMAP.md                      ← what's left to make this complete start-to-finish
├── rules/
│   ├── sacred-rules.md             ← six sacred rules + memory-bank write rules
│   ├── memory-bank.md              ← two-domain structure and load rules
│   ├── authority-order.md          ← strict authority stack with worked examples
│   └── state-machine.md            ← PLAN → PLAN-CONTEXTUALIZE → BUILD ↔ QA → DEBRIEF
├── skills/
│   ├── memory-bank/
│   │   ├── update-constitution/SKILL.md
│   │   ├── update-operational-context/SKILL.md
│   │   └── update-human-log/SKILL.md
│   └── state-machine/
│       ├── writing-plans/SKILL.md        ← PLAN
│       ├── plan-contextualize/SKILL.md   ← PLAN-CONTEXTUALIZE
│       ├── build-loop/SKILL.md           ← BUILD (zero-exploration)
│       ├── qa/SKILL.md                   ← QA (skeptical, six checks)
│       ├── escalate/SKILL.md             ← ESCALATE (subagent primary, user-switch fallback)
│       └── debrief/SKILL.md              ← DEBRIEF (post-task + ad-hoc modes)
├── templates/
│   ├── machine/
│   │   ├── constitution.md
│   │   ├── operational-context.md
│   │   ├── limits.md
│   │   ├── activeContext.md
│   │   └── current-task/
│   │       ├── plan.md
│   │       ├── plan_context.md
│   │       ├── build-log.md
│   │       ├── qa-report.md
│   │       └── escalation-brief.md
│   └── human/
│       └── README.md
└── docs/
    ├── recommended-mcp-servers.md
    ├── opencode-mcp-config.md
    └── agent-zero-cheat-sheet.md
```

---

## Status

Torque Coding is at **3.0.0-dev**. The operating model is complete and internally consistent. What remains to make it a start-to-finish runnable project — installer wiring, a worked example, the `update-active-context` and `update-toc` skills, the `compaction.md` rule — is tracked in [`ROADMAP.md`](./ROADMAP.md).
