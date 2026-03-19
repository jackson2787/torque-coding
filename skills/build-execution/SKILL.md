---
name: build-execution
description: Use during the AGENTS.md BUILD state after a written implementation plan has been approved. Executes the approved plan with strict context control, incremental delivery, and test-driven development, then hands off cleanly to DIFF without taking over QA, APPROVAL, APPLY, or DOCS.
metadata:
  author: uber-ai-workflow
  version: "0.1.0"
---

# Build Execution

## Overview

This skill exists for one thing: executing an approved plan during the
`AGENTS.md` BUILD phase with discipline.

It does **not** replace the `AGENTS.md` state machine.

This skill is subordinate to the BUILD state in `AGENTS.md`. It helps the agent
behave correctly *inside* BUILD. It does not define QA, APPROVAL, APPLY, or
DOCS.

## What This Skill Owns

- Loading and executing an already approved plan
- Keeping working context narrow and task-relevant
- Implementing changes incrementally
- Enforcing test-first execution for behavior changes
- Producing a clean diff-ready result for the next state
- Detecting stalls before they become thrash

## What This Skill Does Not Own

This skill does **not** own:

- plan writing
- final QA verdicts
- approval packaging as a state-machine definition
- applying approved changes
- memory-bank documentation

Use other skills or states for those concerns:

- PLAN: `writing-plans`
- QA evidence gate: `verification-before-completion`
- QA failure path: `systematic-debugging`
- DOCS: per-document skills in `skills/memory-bank/`

## When To Use

Use this skill only when all of the following are true:

1. You are in the `BUILD` state.
2. There is a written implementation plan.
3. The user has explicitly approved the plan.

Typical triggers:

- "approved"
- "looks good"
- "proceed"
- explicit transition from PLAN to BUILD

## Do Not Use When

- there is no approved plan
- you are still deciding architecture
- you are preparing the approval message
- you are claiming that tests or builds pass
- you are applying changes
- you are writing memory-bank documentation

If any of those are true, stop and return control to the correct state or
skill.

## Core Principles

### 1. The Approved Plan Is The Contract

During BUILD, you are not brainstorming.

You are executing the approved plan as written:

- extend what the plan says to extend
- integrate where the plan says to integrate
- add the tests the plan implies
- do not casually redesign the task mid-flight

If the plan turns out to be wrong, incomplete, or dangerously ambiguous:

- stop building
- surface the issue
- return to PLAN rather than improvising architecture inside BUILD

### 2. No Production Code Without A Failing Test First

For new behavior, bug fixes, and externally visible behavior changes:

- write the test first
- run it
- confirm it fails for the correct reason
- then write the minimum production code required to pass

If you did not watch the test fail, you have not yet proved the test is useful.

### 3. Minimal Delta Beats Cleverness

BUILD is not a license to "clean everything up while I'm here."

Prefer:

- the smallest correct change
- extension over parallel rewrite
- local fixes over speculative architecture
- changes that obviously map back to the approved plan

### 4. Context Is A Budget

Do not drag the entire repo through BUILD.

Only keep in working context:

- files you are actively changing
- direct dependencies
- the specific tests relevant to the current micro-step
- the approved plan

Everything else is reference-only and should be loaded on demand.

### 5. BUILD Ends At Diff-Ready, Not At "Done"

Your goal is:

- code changed
- tests written
- local implementation stabilized
- diff generated

Your goal is **not**:

- claiming the task is complete
- claiming verification passed
- applying anything
- writing docs

## Preconditions Checklist

Before touching implementation code, confirm all of the following:

- there is an approved plan
- you know which files are in scope
- you know which tests are likely to change or be added
- you know the most local verification command for the first micro-step
- you are working in the correct sandbox, branch, or safe workspace

If any item is unclear, resolve that before writing code.

## BUILD Execution Loop

Use this loop for each approved step or sub-step.

### Step 1: Re-read The Relevant Slice Of The Plan

Do not rely on memory from earlier in the session.

For the next unit of work, identify:

- the exact behavior being implemented
- the exact files likely involved
- the integration point
- the tests implied by the plan

If the plan covers multiple independent changes, execute them one at a time.

### Step 2: Collapse Context

Before starting the micro-step:

- close unrelated files mentally and operationally
- load only the next implementation slice
- avoid speculative reading of unrelated subsystems

If Step 1 is backend logic and Step 2 is UI wiring, rotate context between them
instead of holding both in memory at once.

### Step 3: Write The Failing Test

For any behavior change, write the smallest test that proves the next thing the
system must do.

Good characteristics:

- narrow scope
- obvious expected behavior
- fails for the right reason
- tied to the approved plan

Bad characteristics:

- giant end-to-end test when a unit test would prove the point
- vague assertions
- test written after implementation
- test that passes before the code change

### Step 4: Verify The Failure

Run the new or changed test and confirm:

- it fails now
- it fails for the expected reason
- it is actually exercising the intended code path

If the failure is wrong:

- fix the test
- adjust setup
- keep working in RED until the signal is trustworthy

Do not move to implementation while the test is ambiguous.

### Step 5: Write The Minimum Code To Reach GREEN

Only now write production code.

Target the smallest change that makes the failing test pass while staying aligned
with:

- the approved plan
- existing patterns
- project rules
- surrounding code style and architecture

Do not do opportunistic cleanup here unless it is required to make the change
correct or maintainable.

### Step 6: Re-run The Local Test

After the minimum implementation:

- run the focused test again
- confirm it now passes
- confirm you did not break the immediate neighboring tests

If it still fails:

- inspect the actual failure
- fix the cause
- stay local

Do not jump to broad repo-wide commands too early.

### Step 7: Refactor While Staying Green

When the test is green, improve the implementation only as needed to make it:

- clearer
- more aligned with existing patterns
- less repetitive
- easier to maintain

Rules:

- keep tests green at all times during refactor
- do not change external behavior during refactor
- re-run focused checks after each meaningful cleanup

### Step 8: Expand To Adjacent Tests

Once the immediate micro-step is green:

- run the nearest relevant test group
- check the direct integration path
- update any directly affected fixtures or helpers

This is still BUILD discipline, not the final QA gate.

You are maintaining momentum and reducing surprises before DIFF and QA.

### Step 9: Record The Delta Mentally

At the end of a micro-step, be able to answer:

- what changed
- why it changed
- which tests prove it locally
- which files were touched
- what remains

If you cannot explain the delta cleanly, the step is probably too large.

## TDD Rules In BUILD

### Default Rule

For features, bug fixes, and behavior changes:

```text
RED -> verify fail -> GREEN -> verify pass -> REFACTOR -> verify stay green
```

### Refactoring Bypass Protocol

For pure refactoring where external behavior does not change:

- you may bypass creating a new failing test
- but only if relevant tests already exist and are already passing
- and you must prove they still pass after the refactor

If there is no trustworthy test coverage for the behavior being preserved, it is
not safe to call it "pure refactoring."

### Do Not Fake TDD

These are violations:

- writing the code first and backfilling the test
- writing a test but never watching it fail
- writing a giant test just to say "TDD happened"
- calling a test "regression coverage" without proving red-green behavior

## Pattern Discipline

While executing, you must continuously prefer:

- extension over replacement
- reuse over creation
- local consistency over personal preference
- project patterns over generic textbook purity

Concrete expectations:

- follow `architecture.md#Rules` where it exists
- mirror existing test layout and naming
- mirror nearby integration points
- keep new files exceptional, not casual

If you need a new file, the reasoning should be as strong during BUILD as it was
during PLAN.

## Context Management Rules

### Load Only What You Need

Good BUILD context:

- approved plan
- file being changed
- sibling test
- one integration point

Bad BUILD context:

- entire app
- every service that might matter
- old plan drafts
- unrelated historical docs

### Rotate Context Between Independent Steps

If a task has multiple unrelated subproblems:

- finish or park the first
- shrink context
- load only the second

This prevents BUILD from turning into multi-threaded confusion.

### Re-open References On Demand

Do not try to remember everything.

If you need a pattern:

- re-open the exact file
- inspect the exact example
- copy the structural lesson, not the entire implementation blindly

## Build-Time Verification Versus QA

BUILD may run focused checks continuously.

Examples:

- the new unit test
- the directly related test file
- a narrow build target
- a localized typecheck or lint target

This is encouraged.

But BUILD must not confuse that with the formal QA verdict.

Final claims like:

- "tests pass"
- "build succeeds"
- "fixed"
- "ready"

belong to the QA flow and should be backed by `verification-before-completion`.

## Stall Detection

If you produce two consecutive identical diffs or keep attempting the same fix
without changing the underlying diagnosis, treat that as a stall.

Required response:

- stop repeating the same move
- state the blocker clearly
- explain what has already been tried
- request direction or return to a better diagnostic path

Do not hide a stall by continuing to churn code.

## Failure Handling Inside BUILD

### If A Test Fails Unexpectedly

Do not guess.

Read:

- the failure message
- the stack trace
- the changed area

Then fix the smallest real cause.

If the failure pattern stops being local or obvious, hand off mentally to
`systematic-debugging` rather than brute-forcing random patches.

### If The Plan Seems Wrong

Stop and escalate back to PLAN.

BUILD is not where architectural rewrites should be invented.

### If The Scope Starts Expanding

Shrink back to the approved step.

If the task truly requires broader change than planned, say so explicitly and
return to PLAN rather than silently broadening the diff.

## Diff Readiness Checklist

Before exiting BUILD, confirm:

- approved plan steps for the current scope are implemented
- tests were written first where required
- focused checks are green
- changed files are understandable and intentional
- no speculative extra work is mixed in
- the diff can be explained step by step
- nothing has been applied yet

## Red Flags - Stop And Reset

- implementing without an approved plan
- writing code before the failing test
- keeping unrelated files open "just in case"
- slipping into architecture redesign during BUILD
- mixing multiple independent changes into one unreadable diff
- saying "done" before QA
- applying changes during BUILD
- trusting intuition over actual test output
- repeating the same failed fix twice

## Exit Condition

This skill is complete when BUILD is complete:

- implementation done for the approved scope
- tests added and exercised appropriately
- focused build-time checks run
- unified diff ready
- no apply performed

At that point, stop and hand off to the DIFF and QA stages defined by
`AGENTS.md`.
