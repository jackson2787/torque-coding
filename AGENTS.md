# AGENTS.v2.md

**Version**: 2.2-dev | **Compatibility**: Claude, Cursor, Copilot, Cline, Aider, all AGENTS.md-compatible tools
**Parallel to**: `agent/AGENTS.md` (v1 — untouched)

---

## Table of Contents

1. [Core Rules](#1-core-rules)
2. [Session Startup](#2-session-startup)
3. [Memory Bank v2](#3-memory-bank-v2)
4. [Authority Order](#4-authority-order)
5. [State Machine](#5-state-machine)
6. [Debrief Phase](#6-debrief-phase)
7. [Coexistence with v1](#7-coexistence-with-v1)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Core Rules

### Startup Compliance (Output Every Session)

```
COMPLIANCE CONFIRMED [v2]: Reuse over creation | Constitution over convenience
[Continue with Memory Bank v2 loading...]
```

### The Four Sacred Rules (carried from v1, unchanged)

| Rule | Requirement | Validation |
|------|-------------|------------|
| ❌ **No new files without reuse analysis** | Search codebase, reference files that cannot be extended, provide exhaustive justification | Before creating: "Analyzed X, Y, Z. Cannot extend because [technical reason]" |
| ❌ **No rewrites when refactoring possible** | Prefer incremental improvements, justify why refactoring won't work | "Refactoring X impossible because [specific limitation]" |
| ❌ **No editing committed migration files** | Treat database migrations as append-only history. Add a new corrective migration instead | "Added a new migration; left historical migrations untouched" |
| ❌ **No generic advice** | Cite `file:line`, show concrete integration points | Every suggestion includes `file:line` citation |
| ❌ **No ignoring existing architecture** | Load patterns before changes, extend existing services/components | "Extends existing pattern at `file:line`" |

### v2 Additional Rules

| Rule | Requirement |
|------|-------------|
| ❌ **No writing constitution.md from task work** | Only `update-constitution` skill may write it; only after explicit human `ratified` keyword |
| ❌ **No writing operational-context.md directly** | Only `update-operational-context` skill may write it; only called by debrief or the human directly |
| ❌ **No loading human-side memory at startup** | Human side is on-demand. Default load set is machine side only |
| ❌ **No task instruction overriding operational-context** | The human must amend operational-context first. Task cannot override it inline |

---

## 2. Session Startup

### Every Session

1. Output v2 compliance statement (Section 1)
2. Attach MCP servers: read `.brain/mcp.config.json` or `.mcp.json` if present
3. Load Machine Memory (default set):
   ```
   - [ ] .memory-bank-v2/machine/constitution.md       (highest authority — stable truths)
   - [ ] .memory-bank-v2/machine/operational-context.md (current working rules)
   - [ ] .memory-bank-v2/machine/limits.md             (v2.2 — per-state budgets + escalation ladder)
   - [ ] .memory-bank-v2/machine/activeContext.md      (compaction recovery anchor)
   - [ ] .memory-bank-v2/machine/toc.md                (file index)
   - [ ] .memory-bank-v2/machine/current-task/*        (any files present — the active task's artifacts)
   ```
4. Do NOT load human-side memory at startup — it is on-demand only
5. Determine entry state via input-contract evaluation (see §5 — any-state entry). If `current-task/` is empty and no task has been assigned, enter `PLAN/IDLE`.
6. Output state: `[v2 STATE: <STATE>] Task: <task-slug-or-none>`

**Canonical path**: Machine memory lives in `.memory-bank-v2/machine/`. Human memory lives in `.memory-bank-v2/human/`. The `toc.md` indexes both.

**On-demand loads** (load when task genuinely needs them):
- `human/decisions/YYYY/<slug>.md` — prior decision context
- `human/tasks/YYYY-MM/<slug>.md` — historical task context
- `human/rationale/<topic>.md` — standing rationale for a pattern or constraint

### Compaction Protocol

Compaction can happen at any time without advance notice. State persistence is continuous.

**At every state transition** (PLAN → PLAN-CONTEXTUALIZE → BUILD → QA → DEBRIEF; or into ESCALATE):
1. Load `skills/memory-bank/update-active-context/SKILL.md` (v1 skill, reused) → update Current State
2. If new architectural decisions: load `skills/memory-bank/update-human-log/SKILL.md` → `kind=decision`

**After compaction** (detected by loss of earlier conversation detail):
1. Re-read `activeContext.md` — it was updated at the last transition
2. Confirm state machine position from Current State section
3. Resume from saved state
4. Output:
   ```
   COMPACTION RECOVERY [v2]: Resumed [STATE] for [task name]
   Context restored from: .memory-bank-v2/machine/activeContext.md
   ```

---

## 3. Memory Bank v2

### Structure

```
.memory-bank-v2/
├── machine/                        ← loaded at session start
│   ├── constitution.md             ← stable truths (highest authority)
│   ├── operational-context.md      ← current working rules
│   ├── limits.md                   ← runtime config: per-state budgets + escalation ladder (v2.2)
│   ├── activeContext.md            ← compaction anchor (current state / progress / session data)
│   ├── toc.md                      ← mechanical index of both halves
│   └── current-task/               ← the active task's artifacts (v2.1) — at most one task active
│       ├── plan.md                 ← produced by writing-plans-v2 (PLAN)
│       ├── plan_context.md         ← produced by plan-contextualize (PLAN-CONTEXTUALIZE)
│       ├── build-log.md            ← produced by build-loop (BUILD)
│       ├── qa-report.md            ← produced by qa-v2 (QA)
│       └── escalation-brief.md     ← produced by escalate (only when stalled)
└── human/                          ← loaded on demand only
    ├── README.md                   ← landing page
    ├── decisions/                  ← one file per ADR
    ├── tasks/                      ← task histories by month (archived current-task/ lives here)
    ├── meetings/                   ← discussion summaries
    ├── rationale/                  ← standing "why we do X" documents
    └── progress/                   ← quarterly notes
```

### current-task/ — the canonical active-task record (v2.1)

The memory bank is canonical and always-on. **Claude Code's session context sits inside the memory-bank domain as an enhancement, not a replacement.** Everything a model needs to resume, hand off, or be switched mid-task lives in `current-task/` on disk.

Rules:
- **At most one task is active at a time.** Starting a new task while `current-task/` is populated requires completing it (via debrief) or explicitly abandoning it.
- **Loaded at session startup.** The BUILD-phase budget model reads `plan.md` and `plan_context.md` with zero exploration required.
- **Survives compaction and session handoff.** Re-entering the project reads `current-task/` and resumes at the appropriate state.
- **Archived by debrief.** On successful completion, debrief moves the entire contents to `human/tasks/YYYY-MM/DDMMDD_<slug>/` and clears `current-task/`.
- **Drives any-state entry.** The files present determine which state a new session enters (see §5).

### Document Skills

| Document | Skill | Write Rules |
|---|---|---|
| `constitution.md` | `update-constitution` | Requires `ratified` keyword from human. Append-only Change Log. |
| `operational-context.md` | `update-operational-context` | Called by debrief (propose-diff flow) or human. Prescriptive voice enforced. |
| `limits.md` *(v2.2)* | Human directly (no dedicated skill) | Runtime config — tunable by developer tier / project. Low ceremony. |
| `activeContext.md` | `update-active-context` *(v1 skill, reused)* | Every state transition. Compaction recovery anchor. |
| `toc.md` | `update-toc` *(v1 skill, reused)* | Mechanical reflection of actual files in both halves. |
| `current-task/plan.md` | `writing-plans-v2` | PLAN state output. |
| `current-task/plan_context.md` | `plan-contextualize` | PLAN-CONTEXTUALIZE output — the zero-exploration map for the budget model. |
| `current-task/build-log.md` | `build-loop` | Iteration log during BUILD. |
| `current-task/qa-report.md` | `qa-v2` | Pass/fail per check; overwritten each cycle. |
| `current-task/escalation-brief.md` | `escalate` | Written only when a state stalls 3× and escalation triggers. |
| `human/*` | `update-human-log` | Routes to `{decisions, tasks, meetings, rationale, progress}`. Updates INDEX.md. |

**Rule**: Always use the corresponding skill when writing to a memory-bank file. Never write directly.

---

## 4. Authority Order

```
constitution.md       → Level 1 (highest)
operational-context.md → Level 2
task instructions      → Level 3
temporary reasoning    → Level 4 (lowest)
```

**Strict interpretation**:
- A task instruction that contradicts an `operational-context.md` directive is invalid. The agent must flag the conflict and ask the human to amend `operational-context.md` first.
- A task instruction that contradicts `constitution.md` is absolutely invalid. The agent must stop and explain why.
- `operational-context.md` **Preferred** and **Avoid** directives may be overridden by a task instruction only if the override is explicitly scoped and justified within the task.
- `operational-context.md` **Do This** and **Do Not Do This** directives may never be overridden by task instructions.

See `claude-rules/authority-order.md` for worked examples.

---

## 5. State Machine

**v2.1 machine**:

```
PLAN  →  PLAN-CONTEXTUALIZE  →  BUILD  →  QA  →  DEBRIEF
                                  ↑_______↓
                                  [QA fails → BUILD, max 3 cycles]
                                         ↓
                                    [3 stalls → ESCALATE]
```

The v1 DIFF state is removed in v2.1 — its role is absorbed into BUILD (which now applies and logs) and QA (which verifies skeptically).

### Model-switching philosophy

Each state declares which model tier it expects. States that benefit from reasoning use the powerful model; states that are mechanical execution use the budget model. v2.2 adds explicit per-state token budgets loaded from `limits.md`.

| State | Model tier | Why | Default hard cap (v2.2) |
|---|---|---|---|
| PLAN | powerful (e.g., Opus) | Reasoning-heavy; must reconcile doctrine with task | 25k input |
| PLAN-CONTEXTUALIZE | powerful | Exploration-heavy; produces the map so BUILD needs zero exploration | 40k input |
| BUILD | budget (e.g., Haiku / Sonnet) | Mechanical execution against a complete map | 15k per attempt |
| QA | budget | Checklist verification; test-runner; paranoid, not creative | 12k per cycle |
| ESCALATE | powerful (subagent or user-switch) | Reasoning-heavy; invoked only on stall | 50k |
| DEBRIEF | any | Rubric application; does not require top-tier reasoning | 20k |

The hand-off between tiers is **files on disk** — `plan.md` + `plan_context.md` — not in-session context.

### Cap exhaustion as a stall (v2.2)

Every state treats hard-cap exhaustion the same way a failed attempt is treated: it counts against the cycle budget. A BUILD attempt that blows past 15k input tokens is indistinguishable from a BUILD attempt that produced a failing test — both increment the counter, both feed into the 3-attempt ESCALATE threshold. See `claude-rules/state-machine.md#Stall-rules-consolidated` for the full catalogue.

### Escalation ladder (v2.2)

ESCALATE reads the ladder from `limits.md#Escalation-ladder`. The default ladder is `sonnet → opus → user-switched session`. On first escalation in a task, ESCALATE spawns a subagent at the next rung up (`opus`). If that subagent also stalls, the ladder advances by one rung. At the top (user-switched session), the memory bank is the hand-off medium — no in-session context needs to survive.

Projects on a premium tier may override the ladder; projects on a stricter budget may shorten it. The one rule: the final rung must always be `<user-switched session>`.

### State contracts

| State | Inputs required | Outputs produced | Exit |
|---|---|---|---|
| **PLAN** | Task description + memory bank | `current-task/plan.md` | User approves plan |
| **PLAN-CONTEXTUALIZE** | `plan.md` + memory bank + codebase | `current-task/plan_context.md` | Context pack complete |
| **BUILD** | `plan.md` + `plan_context.md` + constitution + operational-context | Applied changes + `build-log.md` | Budget model declares done → QA |
| **QA** | Applied changes + memory bank (rules as benchmarks) | `qa-report.md` pass/fail per check | All green → DEBRIEF |
| **ESCALATE** | All of `current-task/*` | `escalation-brief.md` + resolution attempt via stronger model | Stall resolved → back to BUILD or QA |
| **DEBRIEF** | Post-task: `current-task/*`; Ad-hoc: session transcript | Operational-context diff (proposed) + human-side writes | current-task archived to `human/tasks/` |

### Stall rules

- **BUILD** — max 3 internal iterations before escalation
- **QA → BUILD cycles** — max 3 before escalation
- **Same error signature twice** → immediate escalation candidate

### Any-state entry (stateless operation)

A session starts in the earliest state whose input contract is satisfied. The files in `current-task/` determine entry:

| Inputs present | Entry state |
|---|---|
| Task description, empty `current-task/` | **PLAN** |
| `plan.md` approved, no `plan_context.md` | **PLAN-CONTEXTUALIZE** |
| `plan.md` + `plan_context.md` present | **BUILD** |
| Applied changes, no `qa-report.md` with all-green | **QA** |
| `escalation-brief.md` present, stalled | **ESCALATE** |
| Any session, user invokes `/debrief` | **DEBRIEF** (ad-hoc mode) |

`activeContext.md` records the active state so compaction or session loss resumes cleanly.

### State skills (v2.1)

| State | Skill |
|---|---|
| PLAN | `skills/state-machine/writing-plans-v2/SKILL.md` |
| PLAN-CONTEXTUALIZE | `skills/state-machine/plan-contextualize/SKILL.md` |
| BUILD | `skills/state-machine/build-loop/SKILL.md` |
| QA | `skills/state-machine/qa-v2/SKILL.md` |
| ESCALATE | `skills/state-machine/escalate/SKILL.md` |
| DEBRIEF | `skills/state-machine/debrief/SKILL.md` |

### BUILD LOOP — zero exploration

The BUILD skill runs on the budget model. It reads `plan.md` and `plan_context.md` and proceeds directly to implementation. Exploration (finding files, inferring patterns) is the PLAN-CONTEXTUALIZE job — not BUILD's. If BUILD finds itself needing to explore, that is a signal the context pack is incomplete; the correct response is to return the task to PLAN-CONTEXTUALIZE, not to guess.

### QA — skeptical by design

QA exists to catch a budget model declaring victory too early. It does not believe anything the build claims. It runs tests (does not just read them), runs the linter, verifies each applicable `operational-context.md` directive was followed, and checks acceptance criteria against the actual diff. Failures return to BUILD with a cycle counter.

### ESCALATE — fallback is graceful

When a state stalls 3×:
1. **Primary path (Claude Code)**: Spawn an Agent subagent with `model: "opus"` override, pass `escalation-brief.md` as the prompt. The subagent has full context from `current-task/`.
2. **Fallback path (Agent tool unavailable)**: Write `escalation-brief.md` and instruct the user to switch models. Because the memory bank is canonical, nothing is lost — the user re-enters the project under a stronger model and resumes at the stalled state.

---

## 6. Debrief Phase

Debrief is mandatory. It always runs. It is never skipped.

**What it does**:
1. Reviews the task outcome against `operational-context.md`
2. Applies the five-gate learning rubric to candidate learnings
3. Proposes diffs to `operational-context.md` — always propose-diff first, never writes directly
4. Writes task history to `human/tasks/`
5. Writes decisions and rationale to `human/decisions/` and `human/rationale/` as applicable
6. Resets `activeContext.md` to no-active-task via `update-active-context`
7. Produces a Debrief Report

**What it does NOT do**:
- Write to `constitution.md` — that requires a separate human ratification cycle
- Treat implementation churn as learning — most tasks produce no operational-context change
- Skip the task history write — a task always produces at least one human-side entry

---

## 7. Coexistence with v1

When both v1 and v2 are installed in the same project:

- **v2 is canonical.** This declaration lives here; v1 is unaware.
- v1 DOCS state is superseded by DEBRIEF.
- v1 `skills/memory-bank/update-active-context` and `update-toc` are still used (v2 reuses them).
- v1 memory bank at `.memory-bank/` is not read or written during a v2 session.
- v2 memory bank at `.memory-bank-v2/` is the active memory.

---

## 8. Troubleshooting

### Conflict: task instruction vs. operational-context

```
Flag:     "This task instructs [X], but operational-context.md#[Section] says [Y]."
Ask:      "Should I amend operational-context.md first, or is there a scoped exception?"
Do NOT:   Silently follow the task instruction and override the rule.
```

### Conflict: proposed learning vs. constitution

```
Flag:     "The proposed debrief change touches [constitution.md#Section]."
Action:   Write a proposal to human/decisions/ — do not write constitution.md.
Ask:      Human to ratify separately.
```

### No `.memory-bank-v2/` found

```
Action:   Run bootstrap-memory-bank-v2-contract.md to cold-start.
          See: bootstrap-memory-bank-contract.md
```

### Stall detection (v2.2)

- BUILD: max 3 attempts → ESCALATE
- QA → BUILD cycles: max 3 → ESCALATE
- Same error signature twice → immediate escalation candidate
- **Hard cap exhaustion in BUILD/QA** → counts as a failed attempt/cycle (v2.2)
- **Hard cap exhaustion in PLAN / PLAN-CONTEXTUALIZE** → surfaces to user (task too large for current tier)
- **ESCALATE at top of ladder still stalling** → surfaces to user (v2.2)
- Tracked in `current-task/build-log.md` (BUILD, with token usage) and `current-task/qa-report.md` (QA, with token usage); cycle counter and ladder step mirrored in `activeContext.md`

---

## Quick Reference

### Authority order

`constitution.md > operational-context.md > task instructions > reasoning`

### Default load set (machine side only)

`constitution.md` + `operational-context.md` + `activeContext.md` + `toc.md`

### State flow

`PLAN → PLAN-CONTEXTUALIZE → BUILD ↔ QA → DEBRIEF → PLAN` (with ESCALATE on stall)

### Critical prohibitions

1. Never write `constitution.md` from task work
2. Never write `operational-context.md` directly — use `update-operational-context` via debrief
3. Never load human-side memory at startup
4. Never let task instructions override `Do This` / `Do Not Do This` directives

---

**Memory Bank v2 is your only persistent memory. Maintain it with precision. The constitution is your highest authority. The debrief is how you learn.**
