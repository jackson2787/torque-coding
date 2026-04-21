---
name: idea-refine
description: >-
  DEFINE-state skill. Refines a raw idea or task request into
  current-task/definition.md before PLAN. Use "idea-refine", "define this",
  "refine this idea", or "ideate" to trigger.
metadata:
  author: torque-coding
  version: "1.0"
  state-machine: v2
  state: DEFINE
  model-tier: powerful
  requires:
    - .memory-bank-v2/machine/constitution.md
    - .memory-bank-v2/machine/operational-context.md
    - .memory-bank-v2/machine/limits.md (for DEFINE hard cap)
  produces: .memory-bank-v2/machine/current-task/definition.md
  successor-skill: writing-plans
  default-hard-cap: 15000 input tokens
---

# idea-refine

## Overview

DEFINE is the state before PLAN. It turns a raw idea into a precise, bounded task definition that is worth planning.

The output is `current-task/definition.md`. PLAN consumes that file as the task brief, then produces `current-task/plan.md`.

DEFINE is intentionally interactive. It should clarify the target user, success criteria, assumptions, MVP scope, and explicit non-goals before the repo pays the cost of planning.

## When to Use

- A user brings a raw idea, vague task, product concept, or broad request
- The user says "help me refine this idea", "define this", "ideate on X", or "stress-test my plan"
- A task is too ambiguous to write acceptance criteria directly
- A proposed task may need narrowing before PLAN

## When NOT to Use

- The user gives a precise implementation request with clear acceptance criteria; go directly to PLAN
- A task is already mid-flight (`plan.md`, `plan_context.md`, `build-log.md`, or `qa-report.md` exists)
- The user is asking a pure question or requesting explanation only
- The user explicitly asks to skip ideation and provides a ready task contract

## Preconditions

- [ ] `constitution.md` and `operational-context.md` have been read
- [ ] `current-task/` is empty, or only contains a superseded/abandoned `definition.md`
- [ ] The raw idea is present in the conversation
- [ ] The powerful model is active

If any precondition is missing, resolve it before writing `definition.md`.

## Procedure

### 1. Cap check

Read `limits.md` for the DEFINE hard cap (default 15k input tokens).

Estimate input size: raw idea + memory bank machine files + any focused repo context needed to understand feasibility.

- Estimate > hard cap -> do not run DEFINE. Ask the human to narrow the idea or raise the DEFINE cap in `limits.md`.
- Estimate > soft cap -> proceed, but note "crossed DEFINE soft cap" in `definition.md#Risks`.
- Estimate <= soft cap -> proceed normally.

### 2. Open the DEFINE state

Create `current-task/definition.md` from `templates/machine/current-task/definition.md` with:

- Raw idea populated
- Slug populated
- Status: `Draft`
- Remaining unknowns left as placeholders

Then call `update-active-context` with:

```text
transition-from: PLAN/IDLE
transition-to:   DEFINE
state:           DEFINE
task-slug:       [slug]
approval-quote:  [omit]
```

If `activeContext.md` already has an active state other than PLAN/IDLE, stop and ask the human whether to finish, abandon, or debrief the current task first.

### 3. Understand and expand

Restate the idea as a crisp "How might we..." problem statement.

Ask 3-5 sharpening questions, no more. You must understand:
- Who this is for
- What success looks like
- The real constraints (time, technical, regulatory, resource, budget)
- What has already been tried
- Why now

Do not proceed to convergence until the target user and success criteria are clear.

If running inside a codebase, scan only focused context that changes feasibility: existing architecture, patterns, constraints, or prior art. Reference concrete files and patterns when relevant.

Use `frameworks.md` in this skill directory for optional ideation lenses. Select the few that fit; do not run every framework mechanically.

### 4. Generate alternatives

Generate 5-8 considered variations using lenses such as:
- Inversion: what if we did the opposite?
- Constraint removal: what if budget, time, or technology were not the blocker?
- Audience shift: what if this were for a different user?
- Combination: what if this merged with an adjacent idea?
- Simplification: what is the version that is 10x simpler?
- 10x version: what would this look like at massive scale?
- Expert lens: what would domain experts find obvious that outsiders miss?

Push beyond the first idea, but do not generate shallow lists.

### 5. Evaluate and converge

After the user reacts, cluster the strongest options into 2-3 directions. Stress-test each direction against:
- User value: who benefits, and how much?
- Feasibility: what is the technical and resource cost?
- Differentiation: why would someone choose this instead of the current alternative?

Use `refinement-criteria.md` in this skill directory as the evaluation rubric.

Surface hidden assumptions for each direction:
- What must be true
- What could kill the idea
- What is intentionally ignored for now

Be honest, not merely supportive. Push back on weak ideas with specificity and kindness.

### 6. Sharpen the task definition

Write `current-task/definition.md` using `templates/machine/current-task/definition.md`.

The definition must include:
- Problem statement
- Target user
- Success criteria
- Recommended direction
- Key assumptions to validate
- MVP scope
- Not doing list
- Open questions
- Planning brief for PLAN

The "Not doing" list is mandatory. Focus is enforced by explicit negative scope.

Set `Status: Ready for PLAN` when the definition is complete.

### 7. Confirm before planning

Present a short summary:

```text
Definition drafted: current-task/definition.md

Problem: [one sentence]
Recommended direction: [one sentence]
MVP scope: [one sentence]
Not doing: [count] explicit exclusions

Proceed to PLAN, or revise the definition?
```

If the user requests revisions, update `definition.md` and repeat this step. If the user says to proceed, call `update-active-context` with:

```text
transition-from: DEFINE
transition-to:   PLAN
state:           PLAN
task-slug:       [slug]
approval-quote:  [omit]
```

DEFINE -> PLAN is not the hard build approval gate. The human approval quote is still captured later on PLAN -> PLAN-CONTEXTUALIZE.

## Output Contract

A valid `definition.md` must have:

- [ ] Task name and slug
- [ ] Problem statement
- [ ] Target user
- [ ] Success criteria
- [ ] Recommended direction
- [ ] Key assumptions with validation strategies
- [ ] MVP scope
- [ ] Not doing list
- [ ] Open questions
- [ ] Planning brief concrete enough for `writing-plans`

## What This Skill Does NOT Do

- Does NOT write `plan.md`; PLAN does that
- Does NOT start implementation
- Does NOT write to `operational-context.md` or `constitution.md`
- Does NOT archive to the human side; debrief archives completed task artifacts
- Does NOT replace the PLAN approval gate

## Red Flags

| Flag | Action |
|---|---|
| Target user is unclear | Stop. Ask a sharpening question. |
| Success criteria are subjective | Rewrite them into observable outcomes before PLAN. |
| User wants implementation before definition converges | Stop. Explain that DEFINE prevents wasted planning/build cycles. |
| Current task already has `plan.md` or downstream artifacts | Stop. Finish, abandon, or debrief the current task first. |
| No assumptions surfaced | Stop. DEFINE is incomplete. |
| No "Not doing" list | Stop. DEFINE is incomplete. |
| Estimated DEFINE input exceeds hard cap | Stop. Narrow the idea or ask the human to tune `limits.md`. |

## Verification

- [ ] A clear "How might we..." problem statement exists
- [ ] Target user and success criteria are defined
- [ ] Multiple directions were explored
- [ ] Hidden assumptions are listed with validation strategies
- [ ] A "Not doing" list makes trade-offs explicit
- [ ] `current-task/definition.md` exists
- [ ] User confirmed the final direction before transition to PLAN
