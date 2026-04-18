# Escalation Brief: [task name]

**Slug**: [same as plan.md]
**Date**: YYYY-MM-DD HH:MM
**Stalled state**: [BUILD | QA]
**Trigger**: [3 attempts exhausted | same-signature repeat]
**Target model tier**: powerful (Opus or top of configured ladder)

<!-- Written by: v2/skills/state-machine-v2/escalate
     Consumed by: escalation subagent (primary path) or user-switched session (fallback) -->

---

## How this brief will be used

Primary path (Claude Code, Agent tool available): an Agent subagent is spawned with `model: "opus"` and this file is passed as the prompt. The subagent has full context — `current-task/`, memory bank, and repo — and returns a resolution.

Fallback path (Agent tool unavailable): the user is instructed to switch to a stronger model and re-enter the project. The memory bank contains everything needed to resume; this file plus `plan.md` + `plan_context.md` + `build-log.md` is a complete hand-off.

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
2. Update `current-task/build-log.md` with a new attempt entry (Attempt 4+ — post-escalation).
3. Hand control back to the state machine — BUILD declares done, QA re-runs, normal flow resumes.

If the stronger model concludes the plan itself is wrong (not just the implementation), it should:

1. Flag the plan issue in `current-task/build-log.md`.
2. Do NOT edit `plan.md` directly — route back to PLAN by surfacing the issue to the human.
