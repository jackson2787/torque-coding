---
name: update-active-context
description: >-
  Writes to activeContext.md at every state transition. The compaction recovery
  anchor. Called by every state-machine skill on transition and by debrief on
  archive complete. Maintains the Current State block, Current Task Pointer,
  Progress notes, and Session Data. Never evaluates — only records what the
  calling skill has determined.
metadata:
  author: torque-coding
  version: "1.0"
  memory-bank: v2
  target-file: .memory-bank-v2/machine/activeContext.md
---

# update-active-context

## Overview

`activeContext.md` is the compaction recovery anchor. A fresh session that reads `activeContext.md` and `current-task/` has everything it needs to resume without conversation history. This skill is the single writer for that file.

**This skill does not evaluate or decide.** It records what the calling skill has determined: the new state, the task slug, the cycle counter, the ladder step. The calling skill is responsible for correctness; this skill is responsible for persistence.

## When to Use

Every state transition calls this skill. The table below lists every caller and the new state it records:

| Caller skill | Triggering event | New state recorded |
|---|---|---|
| `idea-refine` | Definition started | DEFINE |
| `idea-refine` | Definition ready for planning | PLAN |
| `writing-plans` | Plan approved by user | PLAN-CONTEXTUALIZE |
| `plan-contextualize` | Context pack complete | BUILD (Cycle: 1/3) |
| `build-loop` | Declares done | QA |
| `build-loop` | 3 failed iterations | ESCALATE |
| `qa` | Cycle-end PASS | DEBRIEF |
| `qa` | Cycle-end FAIL, cycle < 3 | BUILD (Cycle: N+1/3) |
| `qa` | 3 cycles failed | ESCALATE |
| `escalate` | Resolution — resume | BUILD or QA |
| `debrief` | Archive complete | PLAN/IDLE |
| Human directly | Compaction recovery | any valid state |

## When NOT to Use

- During task execution by BUILD or QA — only transitions call this skill
- To record progress notes that have not resulted in a state transition
- To reset to PLAN/IDLE before `debrief` has archived `current-task/` — debrief handles the archive; this skill only writes the reset after archiving is complete
- From outside the state machine (e.g., mid-BUILD reasoning)

## Calling Convention

Callers must pass these values explicitly. This skill cannot infer them from disk:

| Field | Required value | Notes |
|---|---|---|
| `state` | New state name | Must be one of the 8 valid states |
| `task-slug` | Slug string or `none` | `none` on PLAN/IDLE |
| `model-tier` | `powerful`, `executor`, `subagent`, or `any` | Matches the state's expected tier |
| `cycle` | `N/3` or `n/a` | Required for BUILD and QA; must be `n/a` for all others |
| `ladder-step` | `none` or `N — [model name]` | Set by escalate on return; `none` otherwise |
| `transition-from` | Prior state name | The state being exited |
| `transition-to` | New state name | Must match `state` |
| `approval-quote` | Verbatim human string | **Required** when `transition-from → transition-to` is `PLAN → PLAN-CONTEXTUALIZE`. **Must be omitted** for every other transition. |

## Pre-Checks

Run all four before writing anything.

### 1. Valid state name

The `state` value must be one of:
`PLAN/IDLE`, `DEFINE`, `PLAN`, `PLAN-CONTEXTUALIZE`, `BUILD`, `QA`, `ESCALATE`, `DEBRIEF`

If invalid:
```
Cannot write activeContext.md.
Reason: "[value]" is not a valid state name.
Valid states: PLAN/IDLE, DEFINE, PLAN, PLAN-CONTEXTUALIZE, BUILD, QA, ESCALATE, DEBRIEF
```

### 2. Valid transition

The `transition-from → transition-to` pair must be in the allowed transitions table from `rules/state-machine.md#Transitions-summary`.

**Exception**: compaction recovery (human direct call) may set any valid state — skip this check when the human invokes this skill directly for recovery.

If the transition is not in the allowed table:
```
Cannot write activeContext.md.
Reason: "[from] → [to]" is not an allowed transition.
See rules/state-machine.md#Transitions-summary for the allowed table.
```

### 3. Cycle counter coherence

- If new state is BUILD or QA: `cycle` must be present in form `N/3` (where N is 1, 2, or 3)
- If new state is anything else: `cycle` must be `n/a`

If mismatched:
```
Cannot write activeContext.md.
Reason: Cycle field mismatch.
State [X] requires cycle [N/3 | n/a] — received "[value]".
```

### 4. Approval-quote coherence

- If `transition-from → transition-to` is `PLAN → PLAN-CONTEXTUALIZE`: `approval-quote` must be present and non-empty. Missing or empty → stop. This is the hard human gate; a state transition cannot fabricate approval.
- If the transition is anything else: `approval-quote` must be omitted. Present → stop. Approval is recorded once, at the moment of plan approval.
- **Exception**: on debrief reset to PLAN/IDLE, `approval-quote` must be omitted (the record is cleared, not updated).

If violated:
```
Cannot write activeContext.md.
Reason: approval-quote [missing on PLAN → PLAN-CONTEXTUALIZE | provided on [from] → [to] (only allowed on PLAN → PLAN-CONTEXTUALIZE)].
```

## Procedure

1. **Read** current `activeContext.md` (one file read — no other exploration).
2. **Run the four pre-checks.** Surface blockers before writing anything.
3. **Write the Current State block** with exactly these fields in this order:
   ```
   State: [new state]
   Task:  [task-slug or none]
   Model tier (expected): [model-tier]
   Cycle: [N/3 or n/a]
   Ladder step last used: [ladder-step]
   Started: [YYYY-MM-DD HH:MM — preserve original Started date if resuming the same task; update only if new task]
   Last transition: YYYY-MM-DD HH:MM — [transition-from] → [transition-to]
   ```
4. **Write the Current Task Pointer block.** Scan `current-task/` and record `present` or `absent` for each task artifact. For `qa-report.md`, if present, note PASS or FAIL from the Overall field. This is a mechanical directory scan — do not read file contents.
   ```
   - definition.md: [present — Ready for PLAN | present — Draft | absent]
   - plan.md: [present — Approved | present — Draft | absent]
   - plan_context.md: [present | absent]
   - build-log.md: [present — [n] attempts | absent]
   - qa-report.md: [present — PASS | present — FAIL | absent]
   - escalation-brief.md: [present — Ladder step N | absent]
   ```
5. **On PLAN → PLAN-CONTEXTUALIZE only:** write the Approval Record. Replace the existing Approval Record block with a single entry:
   ```
   - YYYY-MM-DD HH:MM — Plan approved — "[approval-quote verbatim]" — plan: [task-slug]
   ```
   On any other transition, leave the Approval Record block untouched.
6. **Update Progress.** Prepend one bullet (newest at top):
   ```
   - YYYY-MM-DD HH:MM — [transition-from] → [transition-to][: brief note if relevant]
   ```
7. **On debrief reset to PLAN/IDLE only:**
   - Clear Progress to a single line: `- No active task`
   - Clear Current Task Pointer to all-absent
   - Clear Approval Record to the empty placeholder: `- [empty until PLAN → PLAN-CONTEXTUALIZE transition]`
   - Append to Recent Debriefs (newest at top):
     ```
     YYYY-MM-DD — [post-task | ad-hoc] — [task-slug or "session"] — [debrief result]
     ```

## Output Contract

After writing, confirm:

```
activeContext.md updated.
State: [new state]
Task:  [slug or none]
Transition: [transition-from] → [transition-to]
Cycle: [N/3 or n/a]
Current Task Pointer: definition.md [present|absent] · plan.md [present|absent] · plan_context.md [present|absent] · build-log.md [present|absent] · qa-report.md [present|absent] · escalation-brief.md [present|absent]
```

## What This Skill Does NOT Do

- Does NOT archive `current-task/` — that is debrief's job
- Does NOT validate that the transition is semantically correct for the task (it trusts the calling skill)
- Does NOT read the contents of `current-task/` files beyond listing their presence and qa-report.md's Overall field
- Does NOT write to any other machine file
- Does NOT decide which state to transition to — the calling skill decides; this skill records

## Write Blockers

| Blocker | Action |
|---|---|
| State name not in the valid set | Stop. Report invalid value. |
| Transition not in allowed table (non-recovery) | Stop. Report the invalid pair. |
| Cycle field mismatch | Stop. Report the expected format. |
| `approval-quote` missing on PLAN → PLAN-CONTEXTUALIZE | Stop. The hard human gate requires a verbatim quote. |
| `approval-quote` provided on any other transition | Stop. Approval is recorded once, only on PLAN → PLAN-CONTEXTUALIZE. |
| `activeContext.md` not readable | Stop. Report path error. |
