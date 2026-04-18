# AGENTS.v2.md

**Version**: 2.0-dev | **Compatibility**: Claude, Cursor, Copilot, Cline, Aider, all AGENTS.md-compatible tools
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
   - [ ] .memory-bank-v2/machine/constitution.md      (highest authority — stable truths)
   - [ ] .memory-bank-v2/machine/operational-context.md (current working rules)
   - [ ] .memory-bank-v2/machine/activeContext.md      (compaction recovery anchor)
   - [ ] .memory-bank-v2/machine/toc.md               (file index)
   ```
4. Do NOT load human-side memory at startup — it is on-demand only
5. Enter PLAN state (or resume from `activeContext.md` if a task is in progress)
6. Output state: `[v2 STATE: PLAN/IDLE] Task: none`

**Canonical path**: Machine memory lives in `.memory-bank-v2/machine/`. Human memory lives in `.memory-bank-v2/human/`. The `toc.md` indexes both.

**On-demand loads** (load when task genuinely needs them):
- `human/decisions/YYYY/<slug>.md` — prior decision context
- `human/tasks/YYYY-MM/<slug>.md` — historical task context
- `human/rationale/<topic>.md` — standing rationale for a pattern or constraint

### Compaction Protocol

Compaction can happen at any time without advance notice. State persistence is continuous.

**At every state transition** (PLAN → BUILD LOOP → DEBRIEF):
1. Load `skills/memory-bank/update-active-context/SKILL.md` (v1 skill, reused) → update Current State
2. If new architectural decisions: load `v2/skills/memory-bank-v2/update-human-log/SKILL.md` → `kind=decision`

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
│   ├── activeContext.md            ← compaction anchor (current state / progress / session data)
│   └── toc.md                      ← mechanical index of both halves
└── human/                          ← loaded on demand only
    ├── README.md                   ← landing page
    ├── decisions/                  ← one file per ADR
    ├── tasks/                      ← task histories by month
    ├── meetings/                   ← discussion summaries
    ├── rationale/                  ← standing "why we do X" documents
    └── progress/                   ← quarterly notes
```

### Document Skills

| Document | Skill | Write Rules |
|---|---|---|
| `constitution.md` | `update-constitution` | Requires `ratified` keyword from human. Append-only Change Log. |
| `operational-context.md` | `update-operational-context` | Called by debrief (propose-diff flow) or human. Prescriptive voice enforced. |
| `activeContext.md` | `update-active-context` *(v1 skill, reused)* | Every state transition. Compaction recovery anchor. |
| `toc.md` | `update-toc` *(v1 skill, reused)* | Mechanical reflection of actual files in both halves. |
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

See `claude-rules-v2/authority-order.v2.md` for worked examples.

---

## 5. State Machine

**v2 machine**: `PLAN → BUILD LOOP → DEBRIEF`

**Current status**: BUILD LOOP skill is not yet decomposed. Until `v2/skills/state-machine-v2/build-loop/SKILL.md` exists, use the v1 BUILD → DIFF → QA → APPROVAL → APPLY cycle as the implementation of BUILD LOOP. DEBRIEF replaces v1 DOCS.

### PLAN

**In**: User provides a task contract | **Out**: Approved implementation plan | **Exit**: User approves

**Actions**:
- Load `constitution.md` and `operational-context.md` before writing the plan
- Validate plan against both — flag conflicts before presenting to human
- Cite `file:line` for code references and `constitution.md#Section` or `operational-context.md#Section` for doctrine references

**Exit**: User says "approved", "proceed", "looks good"

### BUILD LOOP *(currently: v1 BUILD → DIFF → QA → APPROVAL → APPLY)*

**In**: Approved plan | **Out**: Applied changes | **Exit**: User approves and changes are applied

- Follow v1 BUILD, DIFF, QA, APPROVAL, APPLY states from `agent/AGENTS.md`
- Reference `operational-context.md` for patterns, not `architecture.md` (v2 installs)
- Constitutional conflicts discovered during BUILD → flag immediately, do not apply

### DEBRIEF

**In**: Changes applied | **Out**: Memory updates, task history | **Exit**: Debrief report complete

Load `v2/skills/state-machine-v2/debrief/SKILL.md`.

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
          See: v2/bootstrap-memory-bank-v2-contract.md
```

### Stall detection (inherited from v1)

Cycle budget: max 3 BUILD LOOP iterations. Tracked in `activeContext.md` Current State. Same STALL protocol as v1 `AGENTS.md#Section 5`.

---

## Quick Reference

### Authority order

`constitution.md > operational-context.md > task instructions > reasoning`

### Default load set (machine side only)

`constitution.md` + `operational-context.md` + `activeContext.md` + `toc.md`

### State flow

`PLAN → BUILD LOOP (v1 BUILD/DIFF/QA/APPROVAL/APPLY) → DEBRIEF → PLAN`

### Critical prohibitions

1. Never write `constitution.md` from task work
2. Never write `operational-context.md` directly — use `update-operational-context` via debrief
3. Never load human-side memory at startup
4. Never let task instructions override `Do This` / `Do Not Do This` directives

---

**Memory Bank v2 is your only persistent memory. Maintain it with precision. The constitution is your highest authority. The debrief is how you learn.**
