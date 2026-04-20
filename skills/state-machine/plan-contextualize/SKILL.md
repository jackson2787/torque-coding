---
name: plan-contextualize
description: >-
  PLAN-CONTEXTUALIZE state skill. Produces current-task/plan_context.md — a repo
  exploration pack so complete that the executor model running BUILD needs zero
  codebase exploration. Runs after plan approval. Intended for the powerful model
  (exploration-heavy). Doctrine (constitution, operational-context) is NOT packed
  here — BUILD reads those files directly. The hand-off to BUILD is files on disk.
metadata:
  author: torque-coding
  version: "2.3"
  state-machine: v2
  state: PLAN-CONTEXTUALIZE
  model-tier: powerful
  requires:
    - .memory-bank-v2/machine/current-task/plan.md (Status = Approved)
    - .memory-bank-v2/machine/limits.md (for PLAN-CONTEXTUALIZE hard cap)
  produces: .memory-bank-v2/machine/current-task/plan_context.md
  successor-skill: build-loop
  escalates-to: escalate
  default-hard-cap: 40000 input tokens
---

# plan-contextualize

## Overview

PLAN-CONTEXTUALIZE exists because BUILD runs on an executor model tier (fast/local/cheap). The executor is good at mechanical application but bad at codebase exploration. Rather than pretending otherwise, we pay the exploration cost once, up front, in a skill that runs on the powerful model and writes the result to disk.

The output, `plan_context.md`, is the repo map. BUILD reads it alongside doctrine (`constitution.md`, `operational-context.md`) and proceeds directly to implementation.

**Scope**: this skill packs **repo-exploration output only** — touched files, patterns with code examples, integration points, test patterns, dead ends. It does **NOT** extract or restate doctrine. BUILD reads `constitution.md` and `operational-context.md` directly; those are fixed paths, not exploration. Removing doctrine extraction eliminates the fragility of "did the planner remember every rule that might fire?" — the executor has the full rulebook in hand.

**The target property is strict**: an executor reading `plan.md` + `plan_context.md` + doctrine should need ZERO codebase-exploration tool calls to start coding. If BUILD finds itself needing to Glob or Grep, the context pack is incomplete and the task returns here.

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
- [ ] `activeContext.md` State ∈ {PLAN-CONTEXTUALIZE, BUILD} (the PLAN → PLAN-CONTEXTUALIZE transition has been recorded)
- [ ] `activeContext.md` Approval Record contains an entry for this task (not the empty placeholder)

**Hard gate**: if the Approval Record is empty or State is still PLAN, the plan was never properly approved — do NOT proceed. Return to PLAN and obtain explicit approval. A `Status: Approved` line in `plan.md` alone is not sufficient; the Approval Record in `activeContext.md` is the authoritative signal.

## Procedure

### 1. Read the plan

Read `plan.md` end to end. Note every file mentioned, every pattern referenced, every acceptance criterion.

### 1a. Cap check

Read `limits.md` for the PLAN-CONTEXTUALIZE hard cap (default 40k input tokens).

Estimate input size: plan + all files in `plan.md#Analyzed-files` + expected integration-point files + doctrine slices.

- Estimate > hard cap → do NOT build the pack. Surface to the human: "Context-pack token budget ([X] tokens estimated) exceeds hard cap ([hard-cap]). Options: (a) split the task so each sub-task has a smaller touched-file set, (b) raise the CONTEXTUALIZE cap in `limits.md`, (c) ship a slimmer pack and accept that BUILD may have to escalate more often." Stop. Like PLAN, cap exhaustion here is a human decision — a stronger executor cannot fix a too-large scope.
- Estimate > soft cap → proceed, but add a warning note in `plan_context.md` header ("crossed PLAN-CONTEXTUALIZE soft cap — pack may be lean in non-critical sections").
- Estimate ≤ soft cap → proceed normally.

### 2. Paste current file state

For every file listed in `plan.md#Analyzed-files`, open it and paste the exact current content of the relevant line range into `plan_context.md#Files-to-touch`. Include line numbers. This is so BUILD does not need to re-read the file.

Scope guideline: paste the function, class, or block the plan modifies plus 5-10 lines of surrounding context. Do not paste entire files unless they are short.

### 3. Pair directives with repo examples

For every pattern in `plan.md#Patterns-to-follow`, find at least one concrete example in the codebase that shows the pattern in action. Paste the example code (5-15 lines) with its `file:line` into `plan_context.md#Patterns-to-follow`.

Abstract directives are not enough. BUILD mimics code it can see, not principles it must interpret.

### 4. Map integration points with file:line

For every caller, dependency, and consumer of the touched files:
- Find the exact `file:line` where the integration happens
- Note what the caller expects (signature, return shape, errors thrown)

### 5. Find test patterns to mirror

Look for existing tests that cover similar code. Paste 5-15 lines of the test that demonstrates the framework, assertion style, and setup pattern BUILD should mirror.

### 6. Document dead ends

If `plan.md` mentions approaches the planner considered and rejected, restate them here with explicit `file:line` or doctrine references for why they were rejected. This prevents BUILD from rediscovering the same dead ends.

### 7. Restate acceptance criteria as mechanical checks

Translate each acceptance criterion from `plan.md` into a QA-runnable check:
- "Returns X for Y input" → "Test `foo.test.ts::describe > it returns X` passes"
- "No lint warnings" → "`pnpm lint path/to/file.ext` exits 0"
- "Endpoint responds 200" → "`curl -s http://.../endpoint` with payload Z returns 200"

This pre-builds QA's checklist.

### 8. Mark out-of-scope paths explicitly

List paths the plan should NOT touch. This protects against BUILD drift.

### 9. Write `current-task/plan_context.md`

Use the template at `templates/machine/current-task/plan_context.md`. Fill every section.

### 10. Self-audit against the target property

Before declaring done, simulate: "If I were the executor model with this pack + doctrine, could I write the diff without running any search, glob, or arbitrary read tool?"

If the answer is no, list the missing pieces and complete them.

### 11. Record state transition

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
- [ ] Integration points with `file:line` for each caller, dependency, consumer
- [ ] At least one test pattern to mirror (if tests are in scope)
- [ ] Dead ends from planning
- [ ] Success criteria as mechanical checks
- [ ] Out-of-scope paths
- [ ] Self-audit confirmation

**Does NOT contain**: extracted slices of `constitution.md` or `operational-context.md`. BUILD reads those files directly.

## What This Skill Does NOT Do

- Does NOT modify any code. PLAN-CONTEXTUALIZE is read-only against the repo.
- Does NOT re-open the plan for revision. If the plan turns out to be wrong, flag and return to PLAN — do not edit `plan.md` here.
- Does NOT write to `operational-context.md` or `constitution.md`.
- Does NOT run tests or the linter — that is QA's job.

## Red Flags — Stop

| Flag | Action |
|---|---|
| `plan.md` missing or Status ≠ Approved | Stop. Return to PLAN. |
| `activeContext.md` Approval Record empty (even if `plan.md` shows Approved) | Stop. The hard gate was bypassed. Return to PLAN and obtain explicit approval. |
| `activeContext.md` State is still PLAN | Stop. Transition was not recorded. Return to PLAN step 9. |
| Found the plan contradicts a pattern discovered during context-gathering | Stop. Surface to human. The plan needs revision before BUILD. |
| A touched file cannot be located | Stop. Flag as planning error. |
| Self-audit reveals BUILD would still need to explore | Do NOT declare done. Complete the missing pieces. |
| The context pack is growing past a few hundred lines and the task is small | Reconsider scope — either the plan is too broad or the pack is too verbose |
| Estimated input exceeds the CONTEXTUALIZE hard cap in `limits.md` | Stop. Surface to the human — split the task, raise the cap, or accept a leaner pack. Do not auto-escalate. |
