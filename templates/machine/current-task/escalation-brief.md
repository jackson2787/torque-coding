# Escalation Brief: [task name]

**Slug**: [same as plan.md]
**Date**: YYYY-MM-DD HH:MM
**Stalled state**: [BUILD | QA]
**Trigger**: [3 attempts exhausted | same-signature repeat | cap exhaustion]
**Ladder step**: [N — model name from `limits.md#Escalation-ladder`]
**Target model**: [model at rung N, read from `limits.md`]

<!-- Written by: skills/state-machine/escalate
     Consumed by: escalation subagent (primary path) or user-switched session (fallback) -->

---

## How this brief will be used

Primary path (Claude Code, Agent tool available, and resolved rung is NOT the final rung): an Agent subagent is spawned with `model: "<rung-from-limits.md>"` and this file is passed as the prompt. The subagent has full context — `current-task/`, memory bank, and repo — and returns a resolution.

Fallback path (Agent tool unavailable OR resolved rung is the final rung — default `<user-switched session>`): the user is instructed to switch to a stronger model and re-enter the project. The memory bank contains everything needed to resume; this file plus `plan.md` + `plan_context.md` + `build-log.md` is a complete hand-off.

This brief is **updated in place**, not overwritten, across repeated escalations on the same task. The "Previous escalations" section below tracks the ladder progression.

---

## Task summary

**Objective** (copied from `plan.md`):
[one paragraph]

**Acceptance criteria** (copied from `plan.md`):
1. [criterion]
2. [criterion]

---

## Plan context reference

See `current-task/plan.md` and `current-task/plan_context.md` for the full planning and context pack. This brief does not duplicate them — the resolving model should read them.

---

## Attempts made

<!-- Copied / distilled from build-log.md -->

### Attempt 1
- **Approach**: [...]
- **Result**: FAIL
- **Error signature**: [...]

### Attempt 2
- **Approach**: [...]
- **Result**: FAIL
- **Error signature**: [...]

### Attempt 3
- **Approach**: [...]
- **Result**: FAIL
- **Error signature**: [...]

---

## Last known error

```
[paste the most recent error in full — stack trace, test failure output, build failure, etc.]
```

---

## Current code state

**Diff from plan-start to now**:

```
[paste or summarize git diff — if very large, summarize by file with hunks that matter]
```

---

## Previous escalations in this task

<!-- Leave empty on first escalation. On subsequent escalations, each rung appends an entry here;
     the `Ladder step` field at the top always reflects the CURRENT rung being targeted. -->

### Escalation 1 — Ladder step [N — model name]
- **Date**: YYYY-MM-DD HH:MM
- **Trigger at that time**: [...]
- **Outcome**: [fix applied | subagent stalled | user did not resume | plan flagged wrong]
- **What returned**: [one-sentence description of the fix or verdict]

<!-- Repeat block per previous escalation. -->

---

## Hypotheses explored (and why each was insufficient)

- **[Hypothesis A]**: [what was tried] — [why it did not resolve]
- **[Hypothesis B]**: [what was tried] — [why it did not resolve]

---

## What the stronger model should consider

<!-- Deliberate framing — not a solution, but a direction. -->

- [Area the budget model did not explore — e.g., "the interaction between X and Y subsystems was not examined"]
- [Constraint that may have been missed]
- [Pattern in another part of the codebase that might apply — file:line if known]

---

## Resume point

On resolution, the stronger model should:

1. Apply the fix.
2. Update `current-task/build-log.md` with a new attempt entry labelled "Attempt M (post-escalation, ladder step N)".
3. Respect the ESCALATE hard cap from `limits.md`. If the subagent itself hits the cap, log it as a subagent stall — the state machine will advance the ladder one rung on re-entry.
4. Hand control back to the state machine — BUILD declares done, QA re-runs, normal flow resumes. Do NOT run QA inline; QA re-verifies on return.

**Do NOT delete this brief on return.** It is preserved for the duration of the task so the ladder step is tracked across any further escalations. Debrief archives it to `human/tasks/` at task close.

If the stronger model concludes the plan itself is wrong (not just the implementation), it should:

1. Flag the plan issue in `current-task/build-log.md`.
2. Do NOT edit `plan.md` directly — route back to PLAN by surfacing the issue to the human.
