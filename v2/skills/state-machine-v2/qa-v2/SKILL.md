---
name: qa-v2
description: >-
  QA state skill. Skeptical-by-design verification that runs after BUILD declares done.
  Disbelieves success until evidence is on disk. Runs tests (does not just read them),
  runs the linter, verifies each applicable operational-context directive was followed,
  checks constitutional boundaries, confirms acceptance criteria. Produces qa-report.md
  with per-check pass/fail. On fail, returns specific issues to BUILD.
metadata:
  author: torque-coding
  version: "2.1"
  state-machine: v2
  state: QA
  model-tier: budget
  requires:
    - applied changes (git diff)
    - .memory-bank-v2/machine/current-task/plan.md
    - .memory-bank-v2/machine/current-task/plan_context.md
  produces: .memory-bank-v2/machine/current-task/qa-report.md
  successor-skill-on-pass: debrief
  successor-skill-on-fail: build-loop
  escalates-to: escalate
---

# qa-v2

## Overview

QA exists to catch a budget model declaring victory too early. BUILD is trained to say "done" after applying the diff — QA's job is to disbelieve that until evidence accumulates on disk.

**Tone**: paranoid. Not adversarial — just ungullible.

**Hard rule**: every check is executed, not reasoned about. Tests are run, not read. The linter is invoked, not assumed. The build is attempted, not described.

## When to Use

- `build-log.md` shows a "Declared done" attempt
- `qa-report.md` absent or present with a previous FAIL

## When NOT to Use

- BUILD did not declare done (still iterating)
- `qa-report.md` already PASS (DEBRIEF is the next state)
- `escalation-brief.md` active

## Preconditions

- [ ] Changes have been applied (there is something to verify)
- [ ] `plan.md#Acceptance-criteria` is readable
- [ ] `plan_context.md#Success-criteria` is readable (pre-built checks)

## The six checks

QA runs all six every cycle. Do not skip any. Do not combine any.

### Check 1 — Tests executed

Run the test command. Capture the exit code.

- If the test runner or command is ambiguous, read `plan_context.md` for the test pattern and infer.
- Record the exact command, exit code, passed/failed counts, and the last 20 lines of output.
- Tests touched by the diff MUST have been executed. If the test runner skipped a file, that is a FAIL.

### Check 2 — Linter clean

Run the linter against the changed files.

- Record command, exit code, warning count, error count.
- "Warnings justified by a file-local disable comment" is allowed only if the disable comment existed before this task OR the task's plan explicitly called for it.

### Check 3 — Build succeeds

Run the build command (if the project has one).

- Record command, exit code.
- Mark N/A only if the project has no build step at all (e.g., pure Markdown changes in a docs repo).

### Check 4 — Operational-context directives followed

For each directive listed in `plan_context.md#Patterns-to-follow`, scan the diff to confirm it was applied.

- Record: directive, file applied in, line number, pass/fail.
- A directive that was applicable but not applied is a FAIL, not a warning.

### Check 5 — Constitution boundaries

Scan the diff for any line that crosses a `constitution.md` boundary.

- Record: boundary, yes/no crossed, explanation.
- Any crossing is an immediate FAIL and an immediate stop — do not continue to Check 6. Surface to the human.

### Check 6 — Acceptance criteria met

For each numbered criterion in `plan.md#Acceptance-criteria`:

- Identify the verification (test name, command output, diff line).
- Run the verification. Record the result.
- "Verified by reading the code" is not acceptable. Verification must be executable or directly observable in the diff.

## Procedure

### 1. Determine cycle number

Check `qa-report.md` (if present) and `build-log.md` for previous QA→BUILD cycles. This is cycle N of 3.

### 2. Run each check in order

Do not short-circuit. Even if Check 1 fails, run Checks 2-6 — the full picture matters for BUILD's next attempt.

**Exception**: Check 5 (constitutional crossing) triggers an immediate stop. Surface to human.

### 3. Write `qa-report.md`

Overwrite the file (not append — each cycle is the current truth). Use the template at `v2/templates/machine/current-task/qa-report.md`.

Include, for every check:
- The exact command run
- The exit code
- Evidence (output snippet)
- Pass/Fail

### 4. Decide the exit

- All six checks PASS → DEBRIEF.
- Any check FAIL and cycle < 3 → return specific issues to BUILD; BUILD cycle counter increments.
- Any check FAIL and cycle == 3 → ESCALATE.
- Check 5 FAIL at any cycle → stop and surface to human (do not auto-escalate constitutional violations).

### 5. List issues returned to BUILD (on FAIL)

Each issue must be:
- Specific (`file:line` or test name)
- Actionable (what must change)
- Not a suggestion (a concrete constraint)

Append issues to `qa-report.md#Issues-returned-to-BUILD`.

### 6. Record state transition

On PASS:
```
State: DEBRIEF
Task:  [slug]
Last transition: YYYY-MM-DD HH:MM — QA → DEBRIEF
```

On FAIL (cycle < 3):
```
State: BUILD
Task:  [slug]
Cycle: [N+1]/3
Last transition: YYYY-MM-DD HH:MM — QA → BUILD
```

On FAIL (cycle == 3) or same-signature repeat:
```
State: ESCALATE
Task:  [slug]
Last transition: YYYY-MM-DD HH:MM — QA → ESCALATE
```

## Output contract

A valid `qa-report.md` has:

- [ ] All six checks executed with exact command, exit code, evidence, result
- [ ] Overall PASS or FAIL
- [ ] If FAIL: Issues-returned-to-BUILD section populated with specific, actionable items
- [ ] Cycle number
- [ ] Date/time

## What This Skill Does NOT Do

- Does NOT apply fixes. QA is read-only against the repo.
- Does NOT "look at" tests — it runs them.
- Does NOT trust BUILD's claim that tests pass — it verifies.
- Does NOT write to `operational-context.md` or `constitution.md`.
- Does NOT evaluate whether the plan was good — that is debrief's job (via rubric).

## Red Flags — Stop

| Flag | Action |
|---|---|
| Test runner reports "no tests found" but plan required test additions | FAIL Check 1 regardless of exit code |
| Linter passes but the diff obviously violates a directive | FAIL Check 4 — directives are not linter-dependent |
| Constitution boundary crossed | FAIL Check 5. Stop. Surface to human. Do not escalate automatically. |
| BUILD's claim of "done" contradicts the diff (e.g., claimed tests added, none present) | FAIL immediately and note in report |
| Same QA failure as previous cycle with same signature | Treat as stall — escalate regardless of cycle count |
| QA would need to run a command that modifies state (DB migration on prod, deploy) | Stop. Surface to human. QA does not deploy. |

## Relationship to v1

Replaces v1 QA + parts of DIFF. Key differences:

| v1 | v2.1 |
|---|---|
| QA was a review step, often model-reasoned | QA is evidence-based; all checks executed |
| No formal check catalogue | Six fixed checks, always run |
| No skepticism about BUILD's claims | QA disbelieves BUILD by design |
| DIFF was where approval happened | DIFF removed; QA owns verification, debrief owns learning |
| No explicit cycle counter | QA↔BUILD is an explicit loop with a 3-cycle ceiling |
