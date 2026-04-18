---
name: plan-contextualize
description: >-
  PLAN-CONTEXTUALIZE state skill. Produces current-task/plan_context.md — a context
  pack so complete that a budget model running BUILD needs zero exploration tool calls.
  Runs after plan approval. Intended for the powerful model (exploration-heavy). The
  hand-off to BUILD is files on disk, not in-session context.
metadata:
  author: torque-coding
  version: "2.1"
  state-machine: v2
  state: PLAN-CONTEXTUALIZE
  model-tier: powerful
  requires: .memory-bank-v2/machine/current-task/plan.md (Status = Approved)
  produces: .memory-bank-v2/machine/current-task/plan_context.md
  successor-skill: build-loop
---

# plan-contextualize

## Overview

PLAN-CONTEXTUALIZE exists because BUILD runs on a budget model. The budget model is fast and cheap for mechanical execution but bad at codebase exploration. Rather than pretending otherwise, we pay the exploration cost once, up front, in a skill that runs on the powerful model and writes the result to disk.

The output, `plan_context.md`, is the map. BUILD reads the map and proceeds directly to implementation.

**The target property is strict**: a budget model reading `plan.md` + `plan_context.md` should need ZERO exploration tool calls to start coding. If BUILD finds itself needing to explore, the context pack is incomplete and the task returns here.

## When to Use

- Immediately after `plan.md` is approved (Status: Approved)
- Before BUILD starts
- After an escalation concludes the context pack was insufficient (write a new pack; old one archived)

## When NOT to Use

- Before plan approval
- During BUILD (BUILD cannot self-contextualize; it escalates instead)
- For trivial tasks with no file-level ambiguity — but err on the side of writing the pack anyway; it is cheap insurance

## Preconditions

- [ ] `current-task/plan.md` exists with `Status: Approved`
- [ ] `current-task/plan_context.md` does not exist
- [ ] The powerful model is active

## Procedure

### 1. Read the plan

Read `plan.md` end to end. Note every file mentioned, every pattern referenced, every acceptance criterion.

### 2. Paste current file state

For every file listed in `plan.md#Analyzed-files`, open it and paste the exact current content of the relevant line range into `plan_context.md#Files-to-touch`. Include line numbers. This is so BUILD does not need to re-read the file.

Scope guideline: paste the function, class, or block the plan modifies plus 5-10 lines of surrounding context. Do not paste entire files unless they are short.

### 3. Pair directives with repo examples

For every pattern in `plan.md#Patterns-to-follow`, find at least one concrete example in the codebase that shows the pattern in action. Paste the example code (5-15 lines) with its `file:line` into `plan_context.md#Patterns-to-follow`.

Abstract directives are not enough. BUILD mimics code it can see, not principles it must interpret.

### 4. Extract applicable constraints

From `constitution.md` and `operational-context.md`, extract only the lines that apply to this specific task. Paste the exact text with its section path. Do not paste the whole document.

### 5. Map integration points with file:line

For every caller, dependency, and consumer of the touched files:
- Find the exact `file:line` where the integration happens
- Note what the caller expects (signature, return shape, errors thrown)

### 6. Find test patterns to mirror

Look for existing tests that cover similar code. Paste 5-15 lines of the test that demonstrates the framework, assertion style, and setup pattern BUILD should mirror.

### 7. Document dead ends

If `plan.md` mentions approaches the planner considered and rejected, restate them here with explicit `file:line` or doctrine references for why they were rejected. This prevents BUILD from rediscovering the same dead ends.

### 8. Restate acceptance criteria as mechanical checks

Translate each acceptance criterion from `plan.md` into a QA-runnable check:
- "Returns X for Y input" → "Test `foo.test.ts::describe > it returns X` passes"
- "No lint warnings" → "`pnpm lint path/to/file.ext` exits 0"
- "Endpoint responds 200" → "`curl -s http://.../endpoint` with payload Z returns 200"

This pre-builds QA's checklist.

### 9. Mark out-of-scope paths explicitly

List paths the plan should NOT touch. This protects against BUILD drift.

### 10. Write `current-task/plan_context.md`

Use the template at `v2/templates/machine/current-task/plan_context.md`. Fill every section.

### 11. Self-audit against the target property

Before declaring done, simulate: "If I were a budget model, could I write the diff right now without running any search, glob, or read tool?"

If the answer is no, list the missing pieces and complete them.

### 12. Record state transition

Update `activeContext.md` via `update-active-context`:

```
State: BUILD
Task:  [slug]
Cycle: 1/3
Last transition: YYYY-MM-DD HH:MM — PLAN-CONTEXTUALIZE → BUILD
```

## Output contract

A valid `plan_context.md` must have:

- [ ] Every file in `plan.md#Analyzed-files` represented under `Files-to-touch` with current content pasted and line numbers
- [ ] Every pattern in `plan.md#Patterns-to-follow` paired with a concrete repo example (code pasted, `file:line` cited)
- [ ] Task-specific constraints extracted from constitution and operational-context
- [ ] Integration points with `file:line` for each caller, dependency, consumer
- [ ] At least one test pattern to mirror (if tests are in scope)
- [ ] Dead ends from planning
- [ ] Success criteria as mechanical checks
- [ ] Out-of-scope paths
- [ ] Self-audit confirmation

## What This Skill Does NOT Do

- Does NOT modify any code. PLAN-CONTEXTUALIZE is read-only against the repo.
- Does NOT re-open the plan for revision. If the plan turns out to be wrong, flag and return to PLAN — do not edit `plan.md` here.
- Does NOT write to `operational-context.md` or `constitution.md`.
- Does NOT run tests or the linter — that is QA's job.

## Red Flags — Stop

| Flag | Action |
|---|---|
| `plan.md` missing or Status ≠ Approved | Stop. Return to PLAN. |
| Found the plan contradicts a pattern discovered during context-gathering | Stop. Surface to human. The plan needs revision before BUILD. |
| A touched file cannot be located | Stop. Flag as planning error. |
| Self-audit reveals BUILD would still need to explore | Do NOT declare done. Complete the missing pieces. |
| The context pack is growing past a few hundred lines and the task is small | Reconsider scope — either the plan is too broad or the pack is too verbose |

## Relationship to v1 and v2.0

This skill is new in v2.1. It has no v1 predecessor. It was created to make the planner-executor split work: splitting exploration (powerful model) from execution (budget model) is only viable if the hand-off is complete enough to skip re-exploration.

In v2.0, planning and execution both assumed the same in-session context. In v2.1, the hand-off is files on disk, and this skill produces the most important file.
