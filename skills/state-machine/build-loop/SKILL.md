---
name: build-loop
description: >-
  BUILD state skill. Consumes plan.md + plan_context.md + doctrine (constitution.md,
  operational-context.md) and applies the implementation with zero codebase exploration.
  Runs on the executor model (fast/local/cheap — role is execution, not reasoning).
  Tracks attempts in build-log.md. Hard stall rule: 3 failed attempts or same error
  signature twice → escalate. Declares done when the plan is executed; does NOT
  self-verify — that is QA.
metadata:
  author: torque-coding
  version: "2.3"
  state-machine: v2
  state: BUILD
  model-tier: executor
  requires:
    - .memory-bank-v2/machine/constitution.md
    - .memory-bank-v2/machine/operational-context.md
    - .memory-bank-v2/machine/current-task/plan.md
    - .memory-bank-v2/machine/current-task/plan_context.md
    - .memory-bank-v2/machine/limits.md (for per-attempt hard cap)
    - rules/execution-discipline.md
  produces:
    - applied changes (git diff)
    - .memory-bank-v2/machine/current-task/build-log.md
  successor-skill: qa-v2
  escalates-to: escalate
  default-hard-cap: 15000 input tokens per attempt
---

# build-loop

## Overview

BUILD is mechanical. The plan says what to change, the context pack says exactly where and how. BUILD applies the changes, logs each attempt, and hands off to QA.

This skill is designed for the executor model tier (fast/local/cheap — whatever is quick and available for the developer's current setup). The tone of the skill reflects that: short, checklist-driven, minimal reasoning.

## When to Use

- `plan.md` exists with Status: Approved
- `plan_context.md` exists
- `current-task/qa-report.md` either absent or FAIL (BUILD → QA → BUILD cycle)

## When NOT to Use

- Either precondition file missing → return to PLAN or PLAN-CONTEXTUALIZE
- QA already PASS → go to DEBRIEF
- `escalation-brief.md` exists and has not been resolved → ESCALATE is the active state

## Preconditions

- [ ] `plan.md` and `plan_context.md` both present in `current-task/`
- [ ] `plan.md` Status = `Approved`
- [ ] `activeContext.md` State ∈ {BUILD, QA} (last transition recorded)
- [ ] `activeContext.md` Approval Record contains an entry for this task (not the empty placeholder)
- [ ] Cycle counter checked (attempts remaining < 3)
- [ ] No `escalation-brief.md` blocking

**Hard gate**: if the Approval Record is empty, BUILD must refuse to run even if `plan.md` and `plan_context.md` exist. An approved plan without a recorded approval is evidence the flow was bypassed — return to PLAN. This is the single gate that enforces "no building without human approval."

## The zero-exploration rule

BUILD does not run `Glob`, `Grep`, or read arbitrary codebase files. Exploration = iterative search on the repo; that is what the executor model is bad at and slow on.

**Fixed doctrine reads are allowed** (and required): `constitution.md`, `operational-context.md`, `plan.md`, `plan_context.md`, and `rules/execution-discipline.md`. These are four-to-five known paths, not exploration. They are the executor's rulebook.

If BUILD finds a repo-level gap — a file not in the pack, a pattern not extracted, an integration point missing — that is a signal the pack is incomplete. The correct response is to **stop and escalate to PLAN-CONTEXTUALIZE**, not to open the file.

The principle: doctrine is static and always available; codebase exploration is dynamic and belongs to the planner.

## Procedure

### 1. Start or resume an attempt

Check `build-log.md`:
- If absent: start Attempt 1.
- If present with FAIL attempts: start Attempt N+1.
- If attempts ≥ 3: go to step 7 (stall).

### 1a. Cap check

Read `limits.md` for the BUILD hard cap (default 15k input tokens per attempt).

Estimate input size for this attempt: plan + plan_context + current-task artifacts + relevant memory bank.

- Estimate > hard cap → do NOT start this attempt. Treat as immediate cap-exhaustion stall: log in `build-log.md` as "Attempt N: FAIL (cap exhaustion — pre-start estimate [X] tokens exceeds hard cap)" and go to step 7.
- Estimate > soft cap but ≤ hard cap → proceed but log a warning in the attempt entry.
- Estimate ≤ soft cap → proceed normally.

### 2. Read the pack

If not already loaded in session context, read:

- `constitution.md` — the hard doctrinal floor (scope, boundaries, stable truths)
- `operational-context.md` — current do/don't directives, active patterns, constraints
- `plan.md` — objective, steps, acceptance criteria, out-of-scope
- `plan_context.md` — pasted files, patterns, integration points, test patterns, dead ends
- `rules/execution-discipline.md` — simplicity, surgical changes, surface ambiguity

These four-to-five reads are the executor's full rulebook. Do not open any other repo file.

If a constitutional boundary or operational-context directive conflicts with a plan step, **stop immediately**. Do not apply. Surface the conflict — the plan needs revision, not a workaround.

### 3. Execute the implementation steps

For each step in `plan.md#Implementation-steps`, in order:

1. Identify the target file from `plan_context.md#Files-to-touch`
2. Identify the applicable pattern from `plan_context.md#Patterns-to-follow`
3. Apply the change using Edit or Write (Edit preferred for existing files)
4. Respect out-of-scope paths

### 4. Mirror the test pattern

If `plan.md#Test-strategy` lists tests to add, mirror the test pattern from `plan_context.md#Test-patterns-to-mirror`. Add tests as their own step.

### 5. Log the attempt

Append to `build-log.md`:

```
## Attempt N
- Started: YYYY-MM-DD HH:MM
- Approach: [one sentence]
- Tokens: [estimated-in] in / [actual-in] in / [soft-cap] soft / [hard-cap] hard
- Changes applied:
  - path/to/file.ext — [what changed]
- Result: [Declared done → QA] | [Failed: error signature] | [Failed: cap exhaustion]
```

If the attempt failed (compiler error, obvious exception while applying), include the error signature. If the attempt was cut short by cap exhaustion, record the token count that triggered the stop. Do not attempt to run tests here — that is QA.

### 6. Declare done or retry

- **Declared done**: all steps applied, no obvious errors → transition to QA.
- **Retry (same task, new approach)**: log the failure with error signature; start Attempt N+1.

### 7. Stall check (at every attempt)

Trigger ESCALATE if any:
- Attempt count has reached 3
- Two attempts produced the same error signature
- **Cap exhaustion triggered this attempt to fail, and attempt count has reached 3** (cap exhaustion counts as a failed attempt)

Write `escalation-brief.md` (via the `escalate` skill) and transition to ESCALATE.

### 8. Record state transition

On "declared done":

Update `activeContext.md` via `update-active-context`:
```
State: QA
Task:  [slug]
Cycle: [same as BUILD cycle]
Last transition: YYYY-MM-DD HH:MM — BUILD → QA
```

## Output contract

On declared-done:
- [ ] Implementation steps from `plan.md` applied (one-to-one)
- [ ] `build-log.md` has an entry for this attempt with status
- [ ] Tests added per plan (or test step explicitly marked N/A)
- [ ] No files modified outside plan's analyzed-files + test files
- [ ] Out-of-scope paths untouched

## What This Skill Does NOT Do

- Does NOT run tests → QA runs tests
- Does NOT run the linter → QA runs the linter
- Does NOT judge "did I do a good job" → QA judges
- Does NOT modify the plan → if the plan is wrong, escalate
- Does NOT modify `plan_context.md` → if the pack is incomplete, escalate
- Does NOT write to `operational-context.md` or `constitution.md` ever
- Does NOT explore the codebase beyond `plan_context.md`

## Red Flags — Stop (and escalate)

| Flag | Action |
|---|---|
| `activeContext.md` Approval Record empty | Stop. The hard human gate was bypassed. Return to PLAN — do not build without recorded approval. |
| `activeContext.md` State is still PLAN or PLAN-CONTEXTUALIZE | Stop. BUILD cannot run until the transition to BUILD is recorded. |
| A required file is not in `plan_context.md` | Do NOT explore. Escalate — the pack is incomplete. |
| Plan step conflicts with `constitution.md` or an `operational-context.md` hard directive | Stop. Do not apply. Return to PLAN — the plan needs revision, not a workaround. |
| Urge to "improve" adjacent code outside the plan | Stop. Note it for DEBRIEF instead. `rules/execution-discipline.md#Surgical-Changes`. |
| Applying the step produces an error signature seen before | Escalate immediately. |
| Cycle count would exceed 3 | Escalate. |
| The plan step is ambiguous enough that two reasonable implementations exist | Escalate — the planner needs to disambiguate. |
| The step would modify a path in `plan.md#Out-of-scope` | Stop. Surface to human. |

