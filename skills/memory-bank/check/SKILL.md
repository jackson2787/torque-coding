---
name: check
description: >-
  Structural integrity validator for the memory bank and state machine. Asserts
  that .memory-bank-v2/ has the correct shape, limits.md passes all five
  invariants, activeContext.md is internally consistent, current-task/ is not
  orphaned, the Approval Record gate is intact, and no legacy v1 artifacts are
  present. Read-only — reports findings, never writes.
metadata:
  author: torque-coding
  version: "1.0"
  memory-bank: v2
  invocation: torque-coding check (or explicit: "run check", "validate memory bank")
  reads:
    - .memory-bank-v2/machine/activeContext.md
    - .memory-bank-v2/machine/limits.md
    - .memory-bank-v2/machine/current-task/* (presence check only)
    - .memory-bank-v2/machine/constitution.md (presence check only)
    - .memory-bank-v2/machine/operational-context.md (presence check only)
  writes: nothing
---

# check

## Overview

`check` is the structural health check for the Torque Coding operating model. It runs a fixed set of invariant assertions against the memory bank and surfaces anything that will cause skills to misbehave at runtime.

It is **read-only**. It never modifies files. Every finding is advisory — the human decides what to fix.

The closest analogy: `git status` rather than `git commit`. It describes current state clearly so you know what needs attention.

## When to Use

- First session on a repo that was deployed or cloned
- After a manual edit to any `machine/` file
- When a skill behaves unexpectedly and you want to rule out structural corruption
- Periodically as a hygiene check (especially after `torque-coding update`)
- Explicitly: "run check", "validate memory bank", "torque-coding check"

## When NOT to Use

- During active task execution (check is a setup/diagnostic tool, not part of the state machine)
- As a substitute for reading `activeContext.md` at session startup — check validates shape, it does not resume state

---

## The Nine Checks

Run all nine. Collect all findings before reporting.

### Check 1 — Required directory structure

Assert that these paths exist:

```
.memory-bank-v2/
.memory-bank-v2/machine/
.memory-bank-v2/machine/current-task/
.memory-bank-v2/human/
.memory-bank-v2/human/tasks/
.memory-bank-v2/human/decisions/
.memory-bank-v2/human/rationale/
```

**FAIL** if any are absent. Report the missing path. This is the most fundamental check — nothing else can be valid if the scaffold is broken.

### Check 2 — Required machine files present

Assert that these files exist (content is checked in later steps):

```
.memory-bank-v2/machine/constitution.md
.memory-bank-v2/machine/operational-context.md
.memory-bank-v2/machine/limits.md
.memory-bank-v2/machine/activeContext.md
```

**FAIL** if any are absent. Report each missing file separately.

### Check 3 — limits.md invariants

Invoke `skills/memory-bank/update-limits/SKILL.md` in validate-only mode (do not write). Report each invariant result:

1. Final rung is `<user-switched session>`
2. Rungs are non-duplicate
3. Soft ≤ hard per state
4. At least 3 rungs
5. Executor rung (rung 1) is never an escalation target

Surface failures and warnings exactly as `update-limits` defines them.

### Check 4 — activeContext.md state is valid

Read `activeContext.md#Current State`. Assert:

- `State:` field is present
- `State:` value is one of: `PLAN/IDLE`, `PLAN`, `PLAN-CONTEXTUALIZE`, `BUILD`, `QA`, `ESCALATE`, `DEBRIEF`
- `Cycle:` format: `N/3` if State ∈ {BUILD, QA}; `n/a` otherwise
- `Model tier (expected):` is one of: `powerful`, `executor`, `subagent`, `any`

**FAIL** on any mismatched field.

### Check 5 — current-task/ consistency with activeContext.md state

Read `activeContext.md#Current State` and scan which files are present in `current-task/`. Assert consistency:

| activeContext State | current-task/ expected shape | FAIL condition |
|---|---|---|
| PLAN/IDLE | all absent | any file present |
| PLAN | plan.md present | plan.md absent |
| PLAN-CONTEXTUALIZE | plan.md (Approved) present | plan.md absent or Status ≠ Approved |
| BUILD | plan.md + plan_context.md present | either absent |
| QA | plan.md + plan_context.md + build-log.md present | any of the three absent |
| ESCALATE | plan.md + build-log.md + escalation-brief.md present | any absent |
| DEBRIEF | plan.md + qa-report.md (PASS) present | qa-report absent or not PASS |

**WARN** (not FAIL) if extra files are present beyond the minimum expected — escalation-brief.md after ESCALATE returns is normal.

**Special case — orphaned current-task/**: if `State: PLAN/IDLE` but `current-task/` has files, report:

```
WARN: current-task/ has files but State is PLAN/IDLE.
  Files present: [list]
  This suggests debrief did not complete cleanly or was skipped.
  Resolution: run debrief in ad-hoc mode, or manually archive current-task/ to human/tasks/.
```

### Check 6 — Approval Record gate integrity

Read `activeContext.md#Approval-Record`. Assert:

- If State ∈ {PLAN-CONTEXTUALIZE, BUILD, QA, DEBRIEF}: Approval Record must be non-empty (not the placeholder `- [empty until PLAN → PLAN-CONTEXTUALIZE transition]`).
- If State ∈ {PLAN/IDLE, PLAN}: Approval Record must be empty (the placeholder) — a non-empty record with no active task is a sign of incomplete debrief.
- If State = ESCALATE: Approval Record must be non-empty (escalation implies a plan was in flight).

**FAIL** if the gate is violated. This is a hard gate — downstream states refuse to run when it is empty.

```
FAIL: Approval Record is empty but State is BUILD.
  BUILD cannot run without a populated Approval Record.
  Resolution: return to PLAN state, present the plan for approval, and capture the
  human's verbatim approval string.
```

### Check 7 — No ghost tasks

A ghost task is a task slug in `activeContext.md#Current Task Pointer` that does not match any `current-task/` files.

Check: if `Task:` is not `none`, at least one of the five expected files must be present in `current-task/`.

**WARN** if Task slug is set but `current-task/` is completely empty.

### Check 8 — Recent Debriefs section present (post-task hygiene)

Read `activeContext.md#Recent Debriefs`. Assert it contains at least one real entry (not just the placeholder).

This check is **WARN only** — a freshly bootstrapped memory bank will have no debriefs yet. It is informational: "0 debriefs recorded — this may be a fresh install."

### Check 9 — Legacy artifact detection

Scan for known pre-v3 artifacts. For each found, report as WARN with the suggested resolution from `bootstrap-memory-bank-contract.md#Step-0`.

| Path / pattern | Signal |
|---|---|
| `.memory-bank/` directory | Pre-v3 memory bank path |
| `claude-rules/` directory | Pre-rename rules directory |
| `toc.md` in any memory bank directory | Retired index file |
| `AGENTS.md` at repo root containing `PLAN → BUILD → DIFF → QA` | v1 agent manifest |
| `@memory/` or `@.memory-bank/` in `CLAUDE.md` | Stale @-import paths |
| `.agent/skills/` directory | Pre-v3 skill layout |

---

## Procedure

1. Run all nine checks. Do not short-circuit on the first failure — collect every finding.
2. Classify each finding as FAIL (hard) or WARN (advisory).
3. Present the report (see Output Contract).
4. Stop. Do not attempt to fix anything.

---

## Output Contract

```
TORQUE CODING — MEMORY BANK CHECK
Run at: YYYY-MM-DD HH:MM

Check 1  — Directory structure:       [ PASS | FAIL ]
Check 2  — Required machine files:    [ PASS | FAIL ]
Check 3  — limits.md invariants:      [ PASS | FAIL | WARN ]
Check 4  — activeContext state valid: [ PASS | FAIL ]
Check 5  — current-task/ consistency: [ PASS | FAIL | WARN ]
Check 6  — Approval Record gate:      [ PASS | FAIL ]
Check 7  — No ghost tasks:            [ PASS | WARN ]
Check 8  — Recent Debriefs present:   [ PASS | WARN ]
Check 9  — Legacy artifacts:          [ PASS | WARN ]

Hard failures: [n]
Warnings:      [n]

[Per-finding detail — one block per FAIL or WARN]

Overall: [ CLEAN | WARNINGS ONLY — review advised | FAILURES — state machine will misbehave ]
```

**CLEAN**: all nine checks pass. Nothing to do.
**WARNINGS ONLY**: no hard failures. Warnings are advisory — the state machine will run but hygiene is off.
**FAILURES**: one or more hard failures. Skills that depend on the failed invariants will not function correctly. Fix before running task work.

---

## What This Skill Does NOT Do

- Does NOT write or modify any file
- Does NOT run any state-machine skill (including `update-limits` writes — it calls update-limits in validate mode only)
- Does NOT recover from failures — it only reports them
- Does NOT validate the content of `constitution.md` or `operational-context.md` — content correctness is a human concern, not a structural check
- Does NOT check skill files for correctness — only the memory bank and its machine files

## Write Blockers

None — this skill never writes.
