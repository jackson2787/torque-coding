---
name: build-loop
description: >-
  BUILD state skill. Consumes plan.md + plan_context.md and applies the implementation
  with zero codebase exploration. Runs on the budget model. Tracks attempts in
  build-log.md. Hard stall rule: 3 failed attempts or same error signature twice →
  escalate. Declares done when the plan is executed; does NOT self-verify — that is QA.
metadata:
  author: torque-coding
  version: "2.1"
  state-machine: v2
  state: BUILD
  model-tier: budget
  requires:
    - .memory-bank-v2/machine/current-task/plan.md
    - .memory-bank-v2/machine/current-task/plan_context.md
  produces:
    - applied changes (git diff)
    - .memory-bank-v2/machine/current-task/build-log.md
  successor-skill: qa-v2
  escalates-to: escalate
---

# build-loop

## Overview

BUILD is mechanical. The plan says what to change, the context pack says exactly where and how. BUILD applies the changes, logs each attempt, and hands off to QA.

This skill is designed for a budget model. The tone of the skill reflects that: short, checklist-driven, minimal reasoning.

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
- [ ] Cycle counter checked (attempts remaining < 3)
- [ ] No `escalation-brief.md` blocking

## The zero-exploration rule

BUILD does not run `Glob`, `Grep`, or open files beyond what `plan_context.md` contains.

If BUILD finds a gap — a file not in the pack, a pattern not extracted, an integration point missing — that is a signal the pack is incomplete. The correct response is to **stop and escalate to PLAN-CONTEXTUALIZE**, not to explore.

The principle: exploration and execution are different cognitive modes running on different model tiers. Do not cross the streams.

## Procedure

### 1. Start or resume an attempt

Check `build-log.md`:
- If absent: start Attempt 1.
- If present with FAIL attempts: start Attempt N+1.
- If attempts ≥ 3: go to step 7 (stall).

### 2. Read the pack

- Read `plan.md` (objective, steps, acceptance criteria, out-of-scope)
- Read `plan_context.md` end to end (pasted files, patterns, constraints, integration points, test patterns, dead ends)

Do not open any other file in the repo.

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
- Changes applied:
  - path/to/file.ext — [what changed]
- Result: [Declared done → QA] or [Failed: error signature]
```

If the attempt failed (compiler error, obvious exception while applying), include the error signature. Do not attempt to run tests here — that is QA.

### 6. Declare done or retry

- **Declared done**: all steps applied, no obvious errors → transition to QA.
- **Retry (same task, new approach)**: log the failure with error signature; start Attempt N+1.

### 7. Stall check (at every attempt)

Trigger ESCALATE if either:
- Attempt count has reached 3
- Two attempts produced the same error signature

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
| A required file is not in `plan_context.md` | Do NOT explore. Escalate — the pack is incomplete. |
| Applying the step produces an error signature seen before | Escalate immediately. |
| Cycle count would exceed 3 | Escalate. |
| The plan step is ambiguous enough that two reasonable implementations exist | Escalate — the planner needs to disambiguate. |
| The step would modify a path in `plan.md#Out-of-scope` | Stop. Surface to human. |

## Relationship to v1

Replaces v1 BUILD + DIFF + APPROVAL + APPLY (in the execution sense). Key differences:

| v1 | v2.1 |
|---|---|
| BUILD could explore the codebase freely | BUILD is zero-exploration; uses the pack |
| DIFF was a separate state for approval | Folded into BUILD (applies directly) + QA (verifies skeptically) |
| Single model across all states | Budget model tier; powerful model only for PLAN, PLAN-CONTEXTUALIZE, ESCALATE |
| Stalls were surfaced to the human | Stalls trigger the escalate skill, which may self-resolve via subagent |
