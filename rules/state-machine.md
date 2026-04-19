# State Machine

---

## Overview

`PLAN → PLAN-CONTEXTUALIZE → BUILD → QA → DEBRIEF` with `ESCALATE` as a recovery state.

```
PLAN → CONTEXTUALIZE → BUILD → QA → DEBRIEF
                          ↑_______↓
                     [QA fails → BUILD, cycle n+1 of 3]
                              ↓
                    [3 stalls at any point → ESCALATE]
                              ↓
                     [Resolved → resume stalled state]
```

### Key properties

1. **Planner-executor split.** PLAN and PLAN-CONTEXTUALIZE use a powerful model. BUILD and QA use a budget model. The hand-off is files on disk.
2. **No DIFF state.** BUILD presents its work to QA directly.
3. **QA is skeptical by design.** Exists to catch a budget model declaring victory too early. Paranoid. Runs tests — does not just look at them.
4. **Memory bank is canonical.** `current-task/` folder holds all task artifacts. Sessions can be lost or handed off; the memory bank contains enough to resume.
5. **Any-state entry.** A session starts in the earliest state whose input contract is satisfied.
6. **Stateless operation.** Each state skill declares its inputs and outputs explicitly. States are loosely coupled, not a strict FSM.
7. **Per-state token budgets.** Every state declares a soft and hard cap from `limits.md`. Cap exhaustion is a first-class stall signal.
8. **Configurable escalation ladder.** `ESCALATE` reads the ladder from `limits.md` and steps up one rung per escalation within a task.

### State announcement rule

At every state transition, output:
```
[STATE: <STATE>] Task: <slug>
```

---

## Input Contracts

Each state is entered if and only if its input contract is satisfied. Contracts are how any-state entry works.

| State | Required inputs | Location |
|---|---|---|
| **PLAN** | Task description; memory bank | Conversation + `machine/` |
| **PLAN-CONTEXTUALIZE** | Approved `plan.md` | `machine/current-task/plan.md` |
| **BUILD** | `plan.md` + `plan_context.md` + memory bank | `machine/current-task/` |
| **QA** | Applied changes + memory bank | Repo + `machine/` |
| **ESCALATE** | Anything in `current-task/` showing a stall | `machine/current-task/*` |
| **DEBRIEF (post-task)** | `current-task/*` with a completed task | `machine/current-task/` |
| **DEBRIEF (ad-hoc)** | A session transcript; user invocation | Conversation |

A session entering mid-flow follows this table: the earliest state whose contract is satisfied is the entry point.

---

## Per-state token budgets

Every state enforces a soft and hard input-token cap loaded from `.memory-bank-v2/machine/limits.md`. Caps are tuned per project and per developer tier — the defaults are targeted at a £20/month mid-tier plan.

| State | Soft cap (default) | Hard cap (default) | On hard cap |
|---|---|---|---|
| PLAN | 15,000 | 25,000 | Surface to user |
| PLAN-CONTEXTUALIZE | 25,000 | 40,000 | Surface to user |
| BUILD (per attempt) | 10,000 | 15,000 | Counts as failed attempt |
| QA (per cycle) | 8,000 | 12,000 | Counts as failed cycle |
| ESCALATE (subagent) | 30,000 | 50,000 | Step up ladder |
| DEBRIEF | 10,000 | 20,000 | Trim candidates, note in report |

### Skill procedure for budgets

Every state skill must:
1. Before work: estimate input-token size; if already above hard cap, do NOT start — treat as cap exhaustion.
2. At soft-cap crossing during work: log a warning in the state's output file.
3. On completion: record actual tokens used. This is evidence for future tuning.

Cap exhaustion is a stall signal — it is identical in effect to a failed attempt. See the consolidated stall-rules table below.

---

## Escalation ladder

ESCALATE reads the ladder from `.memory-bank-v2/machine/limits.md#Escalation-ladder` and steps up one rung per escalation within a task.

### Default ladder

```
1. sonnet    (budget tier — not a destination; listed for clarity)
2. opus      (first escalation target)
3. <user-switched session>   (graceful fallback)
```

### Stepping discipline

- Initial escalation for a task: jump to rung 2.
- Second escalation in the same task: advance to rung 3.
- Cross-task: the ladder resets when a new `current-task/` begins.
- No skipping rungs; no lateral moves.

Because the memory bank is canonical, rung 3 (user-switched session) is genuinely graceful — nothing is lost in the hand-off.

---

## PLAN

**Model**: Powerful (Opus 4.7 recommended)
**Claude Code integration**: Invoked inside Claude Code plan mode where available
**Skill**: `skills/state-machine/writing-plans/SKILL.md`

**In**: Task description + memory bank
**Out**: `current-task/plan.md`
**Exit**: User approves the plan

### Pre-plan checks

Before writing, load and read:
1. `constitution.md` — check task does not contradict any constitutional rule or scope boundary
2. `operational-context.md` — check task respects hard directives

If conflict found: stop and resolve via `authority-order.md`.

### Plan content (required)

```markdown
## Plan: [Task Name]

**Analyzed**:
- `path/file.ext:50-100` — [what is there]
- `constitution.md#[Section]` — [relevant rule]
- `operational-context.md#[Section]` — [relevant directive]

**Authority Check**:
- constitution.md conflicts: [none | description]
- operational-context.md conflicts: [none | description]

**Reuse Strategy**:
- Extend `file.ext` — [what]
- Cannot reuse [component] because: [reason]

**Steps**:
1. [Action] — follows operational-context.md#[Section] at `file:line`
2. [Action] — extends `file:line`
3. [Action] — adds tests mirroring `test.ext`

**Integration**: [Component A] calls via [method] | [Service B] update at `file:line`
**Risks**: [Risk] → mitigation: [approach]
**Tests**: Unit: [scenarios] | Integration: [flows] | Manual: [paths]
**Acceptance Criteria**:
1. [Testable condition]
2. [Testable condition]
```

**Exit**: User says "approved", "proceed", "looks good"

---

## PLAN-CONTEXTUALIZE

**Model**: Powerful (Opus 4.7 recommended)
**Skill**: `skills/state-machine/plan-contextualize/SKILL.md`

**In**: Approved `plan.md`
**Out**: `current-task/plan_context.md`
**Exit**: Context pack complete and reviewable

### Purpose

Compress the codebase into everything the budget model needs to execute the plan without doing its own exploration.

### Content of plan_context.md

- **Files to touch** — with current state pasted as code blocks, line-anchored
- **Patterns to follow** — extracted from operational-context with code examples from the repo
- **Constraints to respect** — extracted from constitution, narrowed to this task
- **Integration points** — how new code joins existing code
- **Test patterns to mirror** — concrete test file paths to copy the shape of
- **Dead-ends to avoid** — things the planner explored and rejected, with reason
- **Success criteria** — numbered, testable, extracted from plan acceptance criteria

**Target property**: a budget model reading `plan.md` + `plan_context.md` + memory bank should need **zero exploration tool calls** to start coding.

**Exit**: Context pack written; human optionally reviews; proceed to BUILD.

---

## BUILD

**Model**: Budget (Haiku, Sonnet 4.5)
**Skill**: `skills/state-machine/build-loop/SKILL.md`

**In**: `plan.md` + `plan_context.md` + memory bank
**Out**: Applied changes + `current-task/build-log.md`
**Exit**: Budget model declares "done" → transition to QA

### Execution principles

- **No exploration required.** plan_context.md is the map. If the budget model feels it needs to explore, plan_context.md was insufficient — escalate to plan-contextualize, do not guess.
- **Follow the plan literally.** Deviations from the plan require stopping and either revising the plan or escalating.
- **Respect the memory bank at all times.** Operational-context directives are not optional.
- **Track every attempt.** Each iteration appends to `build-log.md`: approach, result, errors.

### Stall detection

- **3 failed iterations** (same error signature OR no progress on errors) → escalate
- **Deviation from plan detected** → stop, return to plan author (user)
- **Constitutional conflict discovered mid-build** → stop, do not apply, flag for resolution

### Exit

Implementation complete per plan. Build-log closed. Hand off to QA. **Do not self-verify deeply** — that is QA's job.

---

## QA

**Model**: Budget (same budget model as BUILD, or optionally upgraded)
**Skill**: `skills/state-machine/qa/SKILL.md`

**In**: Applied changes + memory bank
**Out**: `current-task/qa-report.md` with pass/fail per check
**Exit**: All checks green → transition to DEBRIEF

### QA is skeptical by design

QA exists because the BUILD model may have declared victory too early. Its job is to **not believe BUILD's claim** until there is on-disk evidence.

Rules:
1. **Run the tests** — do not look at tests; do not reason about tests; run them.
2. **Run the linter** — resolve errors; warnings require justification.
3. **Verify each relevant operational-context.md directive** was followed in the changed files (scan, match, report).
4. **Verify no constitution.md boundary was violated.**
5. **Verify acceptance criteria from the plan** are met, item by item.
6. **Build the project** — if it builds.

### On failure

Return to BUILD with a specific, itemised list of what failed. BUILD cycle counter increments. On 3rd failure → escalate.

### Exit

All checks green. QA report archived. Transition to DEBRIEF.

---

## ESCALATE

**Skill**: `skills/state-machine/escalate/SKILL.md`

**In**: `current-task/*` with evidence of stall (failed build-log iterations, or failed QA rounds)
**Out**: `current-task/escalation-brief.md` + resolution attempt via stronger model
**Exit**: Resolved → resume at the stalled state (BUILD or QA)

### Trigger

- BUILD: 3 failed iterations
- QA: 3 failed BUILD cycles
- Same error signature twice consecutively (early-escalation candidate)
- User explicitly invokes escalation

### Primary path (Claude Code — Agent tool available)

1. Write `escalation-brief.md` — original plan, plan_context, all attempts, last known error, current code state, hypotheses explored, **current ladder step**
2. Read the next rung from `limits.md#Escalation-ladder`. Spawn an Agent subagent with `model: "<next-rung>"`
3. Pass the escalation-brief as the subagent's prompt
4. Subagent attempts a fix; returns result
5. Parent session applies the fix and resumes at the stalled state
6. If the subagent itself stalls, advance the ladder one rung and re-escalate; if at top rung, fall through to the user-switched path

### Fallback path (no Agent tool available)

1. Write `escalation-brief.md` to `current-task/`
2. Output a user-facing instruction:
   > "Stalled after 3 attempts. Switch to a stronger model (e.g., Opus 4.7) and re-enter the task. The memory bank at `.memory-bank-v2/machine/current-task/` has everything needed to resume."
3. Exit the state gracefully. The user opens a new session with a stronger model; that session reads `current-task/` and resumes.

### Fallback is graceful by design

Because the memory bank already contains `plan.md`, `plan_context.md`, `build-log.md`, `qa-report.md`, and `escalation-brief.md`, no "paste this into the next session" ritual is needed. The next session is self-sufficient.

---

## DEBRIEF

**Skill**: `skills/state-machine/debrief/SKILL.md`

### Post-task mode

**In**: `current-task/*` for a completed task (QA all green)
**Out**: Operational-context diff (proposed), human-side writes, archived current-task
**Exit**: `current-task/` contents moved to `human/tasks/YYYY-MM/DDMMDD_<slug>/`; `current-task/` cleared

Applies the five-gate learning rubric. Proposes diffs to `operational-context.md` — never writes unilaterally. Writes task history, decisions, rationale to the human side. Flags constitutional implications as proposals.

### Ad-hoc mode (user-invoked)

**In**: Session transcript; user invocation (e.g., "/debrief" or "run debrief on this session")
**Out**: Human-side writes; no `current-task/` modification
**Exit**: Debrief report presented

Same five-gate rubric applied to session observations. Writes to `human/tasks/YYYY-MM/` with status `Ad Hoc`. Does NOT require or touch `current-task/`.

---

## Stall rules (consolidated)

| Location | Threshold | Action |
|---|---|---|
| BUILD internal iterations | 3 | Escalate |
| QA → BUILD cycles | 3 | Escalate |
| Same error signature twice | 2 | Early escalation candidate |
| **Hard cap exhaustion in BUILD** | 1 occurrence | Counts as a failed attempt; increment cycle counter |
| **Hard cap exhaustion in QA** | 1 occurrence | Counts as a failed cycle; return to BUILD or escalate |
| **Hard cap exhaustion in PLAN or PLAN-CONTEXTUALIZE** | 1 occurrence | Surface to user — task too large for current tier |
| **Hard cap exhaustion in ESCALATE** | 1 occurrence | Step up the ladder; if at top → surface to user |
| Deviation from plan in BUILD | 1 | Stop, return to plan author |
| Constitutional conflict discovered | 1 | Stop, flag for resolution |

Cycle counters live in `activeContext.md` (Current State section) and in `build-log.md`. Token usage per attempt is logged in `build-log.md` and `qa-report.md` for tuning.

---

## Any-state entry

A session starting mid-flow evaluates input contracts in order and enters the earliest satisfied state:

```
IF task description provided, no current-task/:
    → PLAN
ELSE IF current-task/plan.md approved, no plan_context.md:
    → PLAN-CONTEXTUALIZE
ELSE IF current-task/plan.md AND plan_context.md present, no applied changes:
    → BUILD
ELSE IF applied changes present, no green qa-report.md:
    → QA
ELSE IF stall evidence present (failed attempts):
    → ESCALATE (or resume at the stalled state if user prefers)
ELSE IF user invokes debrief explicitly:
    → DEBRIEF (ad-hoc mode)
ELSE:
    → PLAN/IDLE, no active task
```

**Stateless discipline**: each skill validates its own inputs. A skill refusing to run because inputs are missing is correct behaviour — it directs the user to the prerequisite state.

---

## Model-switching philosophy

| Phase | Preferred model | Why |
|---|---|---|
| PLAN | Powerful (e.g. Opus) | Reasoning, exploration, authority check |
| PLAN-CONTEXTUALIZE | Powerful (e.g. Opus) | Codebase reading, pattern extraction |
| BUILD | Budget (e.g. Haiku, Sonnet) | Mechanical execution; plan_context is the map |
| QA | Budget (same or slight upgrade) | Runs verification; enforces paranoia |
| ESCALATE | Powerful (subagent per ladder) | Debugging beyond budget model's reach |
| DEBRIEF | Any | Rubric application; doesn't need top-tier reasoning |

The planner-executor split is the financial mechanic: spend the big model on PLAN and PLAN-CONTEXTUALIZE (where it matters), and let the budget model follow the map. Escalate only when the map runs out.

---

## Transitions summary

| From | Event | To |
|---|---|---|
| (idle) | User provides task | PLAN |
| PLAN | Plan approved | PLAN-CONTEXTUALIZE |
| PLAN | Hard cap exhausted | Surface to user |
| PLAN-CONTEXTUALIZE | plan_context.md complete | BUILD |
| PLAN-CONTEXTUALIZE | Hard cap exhausted | Surface to user |
| BUILD | Declares done | QA |
| BUILD | 3 failed iterations | ESCALATE |
| BUILD | Hard cap exhausted (any attempt) | Counts as failed attempt |
| QA | All checks green | DEBRIEF |
| QA | Failures found | BUILD (cycle n+1 of 3) |
| QA → BUILD | 3 cycles failed | ESCALATE |
| QA | Hard cap exhausted | Counts as failed cycle |
| ESCALATE | Resolved | Resume at stalled state |
| ESCALATE | Subagent stalled, ladder not at top | Advance ladder, re-escalate |
| ESCALATE | Subagent stalled, ladder at top | Surface to user |
| DEBRIEF (post-task) | Archive complete | (idle) |
| DEBRIEF | Hard cap exhausted | Trim candidates, note in report |
| (any) | User invokes debrief | DEBRIEF (ad-hoc) |

---

