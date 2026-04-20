# activeContext

**Purpose**: Compaction recovery anchor and state-machine pointer. Updated at every state transition by `update-active-context`.

**Canonical rule**: This file plus `current-task/` is everything a fresh session needs to resume exactly where the previous session left off. If this file disagrees with `current-task/`, `current-task/` wins — this file is an index, not the source of truth.

---

## Current State

```
State: [PLAN/IDLE | PLAN | PLAN-CONTEXTUALIZE | BUILD | QA | ESCALATE | DEBRIEF]
Task:  [task slug | none]
Model tier (expected): [powerful | executor | subagent]
Cycle: [n/3 for BUILD or QA; n/a otherwise]
Ladder step last used: [none | N — model name from limits.md]
Started: YYYY-MM-DD HH:MM
Last transition: YYYY-MM-DD HH:MM — [from-state] → [to-state]
```

## Current Task Pointer

```
- plan.md: [present — Approved | present — Draft | absent]
- plan_context.md: [present | absent]
- build-log.md: [present — [n] attempts | absent]
- qa-report.md: [present — PASS | present — FAIL | absent]
- escalation-brief.md: [present — Ladder step N | absent]
```

If this section shows all absent and State = PLAN/IDLE, there is no active task and a new one may be started.

## Approval Record

<!-- Written when PLAN → PLAN-CONTEXTUALIZE fires, capturing the verbatim human
     quote that counted as approval. Cleared by debrief on archive. Empty means
     no approved plan — downstream states must refuse to run. -->

- [empty until PLAN → PLAN-CONTEXTUALIZE transition]

## Progress

<!-- Short, bulleted. What has actually been accomplished so far. Updated at each
     transition, not continuously. -->

- [Progress item]
- [Progress item]

## Session Data

<!-- Lightweight context that does not belong in current-task/ but should survive
     compaction: open questions, the user's current framing, relevant file:line pins. -->

- [Pin or note]

## Recent Debriefs

<!-- Appended by debrief (both post-task and ad-hoc). Newest at top. Post-task debriefs
     also archive current-task/ and reset Current State. -->

- YYYY-MM-DD — [post-task | ad-hoc] — [task slug or "session"] — [no learning | new rule | updated pattern | retired rule | constitutional flag]

---

## Entry-state resolution (for cold-start)

If this file is being read to recover from compaction or to enter a new session, resolve the state from `State:` in the Current State block — that is the authoritative resume point. Use the Current Task Pointer and `Last transition` line only to cross-check consistency.

If `State:` is missing or corrupted, fall back to the file-presence table:

| Files present in current-task/ | Entry state |
|---|---|
| all absent | PLAN/IDLE (or PLAN if a task is now being assigned) |
| plan.md only (Draft) | PLAN (awaiting approval) |
| plan.md only (Approved) | PLAN-CONTEXTUALIZE |
| plan.md (Approved) + plan_context.md | BUILD |
| + build-log.md with attempts, no qa-report or FAIL qa-report | QA or BUILD (depending on last transition) |
| + qa-report.md with all-green PASS | DEBRIEF |
| + escalation-brief.md | ESCALATE |

**Hard gate**: if `plan.md` is present but `Approval Record` is empty, the plan is NOT approved — downstream states (PLAN-CONTEXTUALIZE, BUILD, QA) must refuse to run until approval fires.

**Note**: `escalation-brief.md` may be present even after ESCALATE returns — it is preserved as a ladder-progression record, not a signal flag. Use `State:` from the block above, not the brief's presence, to determine the actual entry state. If State = BUILD or QA despite an existing brief, the task is mid-post-escalation-verification; proceed accordingly.
