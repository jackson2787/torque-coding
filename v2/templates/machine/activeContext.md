# activeContext (v2)

**Purpose**: Compaction recovery anchor and state-machine pointer. Updated at every state transition by `update-active-context` (v1 skill, reused).

**Canonical rule**: This file plus `current-task/` is everything a fresh session needs to resume exactly where the previous session left off. If this file disagrees with `current-task/`, `current-task/` wins — this file is an index, not the source of truth.

---

## Current State

```
State: [PLAN/IDLE | PLAN | PLAN-CONTEXTUALIZE | BUILD | QA | ESCALATE | DEBRIEF]
Task:  [task slug | none]
Model tier (expected): [powerful | budget | subagent]
Cycle: [n/3 for BUILD or QA; n/a otherwise]
Started: YYYY-MM-DD HH:MM
Last transition: YYYY-MM-DD HH:MM — [from-state] → [to-state]
```

## Current Task Pointer

```
current-task/:
  plan.md               [present | absent]
  plan_context.md       [present | absent]
  build-log.md          [present | absent]
  qa-report.md          [present — PASS | present — FAIL | absent]
  escalation-brief.md   [present | absent]
```

If this section shows all absent and State = PLAN/IDLE, there is no active task and a new one may be started.

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

If this file is being read to recover from compaction or to enter a new session, resolve the state from the Current Task Pointer above:

| Files present in current-task/ | Entry state |
|---|---|
| all absent | PLAN/IDLE (or PLAN if a task is now being assigned) |
| plan.md only | PLAN-CONTEXTUALIZE |
| plan.md + plan_context.md | BUILD |
| + build-log.md with attempts, no qa-report or FAIL qa-report | QA or BUILD (depending on last transition) |
| + qa-report.md with all-green PASS | DEBRIEF |
| + escalation-brief.md | ESCALATE |

The `Last transition` line above disambiguates when files alone are ambiguous.
