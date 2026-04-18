---
name: writing-plans-v2
description: >-
  PLAN-state skill. Produces current-task/plan.md — the task contract, doctrine-checked
  reuse-analyzed implementation plan. Intended to be invoked by the powerful model
  (e.g., Claude Code plan mode with Opus). Does NOT produce plan_context.md — that is
  plan-contextualize's job. Writes to the machine side of the memory bank.
metadata:
  author: torque-coding
  version: "2.1"
  state-machine: v2
  state: PLAN
  model-tier: powerful
  produces: .memory-bank-v2/machine/current-task/plan.md
  successor-skill: plan-contextualize
---

# writing-plans-v2

## Overview

Planning is the first state of the v2.1 state machine. Its output is a single file on disk — `current-task/plan.md` — that serves as the contract between PLAN and everything downstream.

The goal is a plan that can survive model switching, session handoff, and compaction. If the planning session is lost, a fresh session should be able to read `plan.md` alone and understand the task as well as the original planner did.

## When to Use

- New task assigned and `current-task/` is empty or cleanly archived
- User explicitly says "plan this", "let's plan X", or invokes Claude Code plan mode
- Re-planning after a stronger model concludes the original plan is wrong (previous `plan.md` is archived with status `Superseded`)

## When NOT to Use

- Mid-task — do not re-plan while BUILD, QA, or ESCALATE is active. If a rethink is needed, run debrief first, archive, then plan anew.
- For pure questions or explanations — no `current-task/` state is needed
- For ad-hoc edits with no acceptance criteria — those are trivial tasks, not plans

## Preconditions

- [ ] `constitution.md` has been read in this session
- [ ] `operational-context.md` has been read in this session
- [ ] `current-task/plan.md` does not already exist (or exists with `Status: Superseded`)
- [ ] The task description from the human is unambiguous enough to write acceptance criteria

If any is missing, resolve before writing the plan.

## Procedure

### 1. Load doctrine

Re-read `constitution.md` and `operational-context.md` before planning, even if they were loaded at session startup. The planner is the first line of defense against doctrine drift — if doctrine has changed since session start, the plan reflects the current state.

### 2. Authority check

For every piece of the task contract, ask:

- Does it touch a constitutional boundary? → flag, ask the human before continuing
- Does it contradict an `operational-context.md` Do-This / Do-Not-Do-This / Known-Constraint / Workflow directive? → **stop**. The human must amend operational-context first (via debrief or direct).
- Does it override an `operational-context.md` Preferred / Avoid directive? → acceptable only with explicit scoped justification in the plan.

Do not proceed to write the plan while any flag is unresolved.

### 3. Reuse analysis (Sacred Rule)

Before proposing any new file, search the codebase for candidates to extend. Record the search in the plan's "Reuse analysis" section. A new file is justified only if every candidate was ruled out with a specific technical reason.

### 4. Analyze files and integration points

Read — do not modify — every file the plan will touch. Note line ranges. Note every integration point (caller, dependency, consumer).

### 5. Extract applicable patterns

For each relevant directive in `operational-context.md`, find at least one real example in the codebase. Pair directive with example — this gets passed forward to PLAN-CONTEXTUALIZE.

### 6. Draft acceptance criteria

Each criterion is:
- Numbered
- Testable (a test, a command output, a diff check — not "looks good")
- Observable without the planner's context

If a criterion cannot be stated testably, break it down further or drop it.

### 7. Write `current-task/plan.md`

Use the template at `v2/templates/machine/current-task/plan.md`. Fill every section. Do not skip "Out of scope" — explicit negative scope prevents BUILD from wandering.

### 8. Present for approval

Show the plan summary to the human:

```
Plan drafted: current-task/plan.md

Objective: [one sentence]
Files to touch: [n]
New files: [n, with justification]
Acceptance criteria: [n]
Doctrine conflicts: [none | list]

Approve to advance to PLAN-CONTEXTUALIZE (next state), or request revisions.
```

Wait for explicit approval.

### 9. Record state transition

On approval, update `activeContext.md` via `update-active-context` (v1 skill, reused):

```
State: PLAN-CONTEXTUALIZE
Task:  [slug]
Last transition: YYYY-MM-DD HH:MM — PLAN → PLAN-CONTEXTUALIZE
```

## Output contract

A valid `plan.md` must have:

- [ ] Task name and slug
- [ ] Status: `Draft` (on write) → `Approved` (on human approval)
- [ ] Objective (one paragraph, user-visible outcome)
- [ ] Acceptance criteria (numbered, testable)
- [ ] Constraints
- [ ] Authority check (constitution and operational-context read; conflicts resolved)
- [ ] Reuse analysis (Sacred Rule compliance)
- [ ] Analyzed files
- [ ] Implementation steps (ordered, concrete enough for a budget model)
- [ ] Integration points
- [ ] Patterns to follow with `file:line` evidence
- [ ] Risks and mitigations
- [ ] Test strategy
- [ ] Out-of-scope

A plan missing any of these is incomplete. Fix before handing off.

## What This Skill Does NOT Do

- Does NOT write `plan_context.md` — that is plan-contextualize's job. Planning and contextualizing are separate states for a reason: planning is reasoning-heavy; contextualizing is exploration-heavy; they may run in different sessions.
- Does NOT start implementation. Zero code changes during PLAN.
- Does NOT write to `operational-context.md`. If the plan reveals an operational-context gap, note it — debrief will handle it post-task.
- Does NOT write to `constitution.md` under any circumstance.

## Red Flags — Stop

| Flag | Action |
|---|---|
| Task contradicts a hard operational-context directive | Stop. Surface conflict. Ask human to amend operational-context first. |
| Task crosses a constitutional boundary | Stop. Surface. Do not plan around it. |
| Reuse analysis is skipped or hand-waved | Refuse to proceed — Sacred Rule violation. |
| Acceptance criteria are subjective ("looks better") | Refuse. Rewrite as testable or cut. |
| `current-task/plan.md` already exists with Status ≠ Superseded | Stop. Either complete the current task (debrief) or explicitly abandon. |
| The task description is too vague to write acceptance criteria | Stop. Ask the human clarifying questions. Do not guess. |

## Relationship to v1

Replaces v1 `writing-plans` skill. Key differences:

| v1 | v2.1 |
|---|---|
| Plan written inline in chat | Plan written to `current-task/plan.md` on disk |
| Context carried in conversation | Context carried in memory bank (survives switching) |
| Single skill spans plan + context | Split into `writing-plans-v2` (PLAN) and `plan-contextualize` (PLAN-CONTEXTUALIZE) |
| No explicit authority check | Mandatory authority check against constitution and operational-context |
| No explicit reuse analysis | Reuse analysis section is mandatory (Sacred Rule) |
