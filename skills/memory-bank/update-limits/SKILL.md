---
name: update-limits
description: >-
  Validates limits.md before or after the human writes it. Enforces five
  structural invariants: final rung is <user-switched session>, rungs are
  non-duplicate, soft ≤ hard per state, at least 3 rungs, executor rung (rung 1)
  is never an escalation target. Shows corrections as a proposal; does not
  write without explicit human confirmation.
metadata:
  author: torque-coding
  version: "1.0"
  memory-bank: v2
  target-file: .memory-bank-v2/machine/limits.md
---

# update-limits

## Overview

`limits.md` is low-ceremony runtime config: the human edits it directly without ratification. This skill validates that the file remains structurally coherent — the invariants it enforces are mechanical facts, not taste decisions. A `limits.md` that violates an invariant will cause state-machine skills to misbehave at runtime.

The skill does not block the human from editing `limits.md` directly. It validates on request or when `torque-coding update` runs a post-install check. On failure, it shows a corrected proposal and asks for confirmation before writing.

## When to Use

- Human wants to modify `limits.md` and wants validation before applying changes
- `torque-coding update` runs a post-install integrity check
- Human explicitly invokes "check limits", "validate limits", or "update limits"
- After any significant change to the escalation ladder (adding a rung, changing model names, etc.)

## When NOT to Use

- During task execution — `limits.md` is runtime config, not a task artifact
- As a blocking gate that prevents the human from editing the file — the skill validates, it does not prevent

## The Five Invariants

Run all five before writing. Collect all failures before reporting.

### Invariant 1 — Final rung is `<user-switched session>`

Read the escalation ladder from `limits.md`. The last entry must be exactly the string `<user-switched session>`.

**Hard block** if violated:
```
Invariant 1 FAIL: Final rung is "[actual value]".
The final rung must be exactly: <user-switched session>
Reason: this is the graceful fallback — the memory bank is always complete enough
for a manual session switch. No alternative is acceptable.
```

### Invariant 2 — Rungs are non-duplicate

Each rung in the ladder must have a distinct value. No two rungs may name the same model.

Apparent capability downgrades (e.g., `opus` at rung 2, then `sonnet` at rung 3) are flagged as a **warning** not a hard block — the skill cannot automatically verify model capability ordering across providers.

**Hard block** on duplicate:
```
Invariant 2 FAIL: Rung [N] and rung [M] both name "[model]".
Each rung must be a distinct value.
```

**Warning** on apparent downgrade:
```
Invariant 2 WARN: Rung [N] ("[model A]") appears stronger than rung [N+1] ("[model B]").
This looks like a capability downgrade. Confirm this is intentional.
```

### Invariant 3 — Soft ≤ hard per state

For every row in the per-state token budgets table: `soft cap ≤ hard cap`.

**Hard block** if violated:
```
Invariant 3 FAIL: [State] — soft cap ([n]) exceeds hard cap ([m]).
Soft cap must be ≤ hard cap. Proposed correction: soft cap = [m].
```

### Invariant 4 — At least 3 rungs

The ladder must have a minimum of 3 entries: executor rung, at least one escalation target, and `<user-switched session>`.

**Hard block** if violated:
```
Invariant 4 FAIL: Ladder has [n] rung(s). Minimum is 3.
Required shape: [executor rung] → [escalation target] → <user-switched session>
```

### Invariant 5 — Executor rung (rung 1) is never an escalation target

Rung 1 is listed "for clarity" — it is the baseline executor model and is never a step-up destination. There must be at least one rung between rung 1 and the final `<user-switched session>` rung.

**Hard block** if rung 2 is `<user-switched session>` (no escalation target before fallback):
```
Invariant 5 FAIL: Rung 2 is <user-switched session> — no escalation target exists.
ESCALATE must have at least one model to step up to before reaching the user-switch fallback.
```

## Procedure

1. Read `limits.md` in full.
2. Run all five invariants. Collect every failure and warning before proceeding — do not stop after the first failure.
3. **If hard blocks found**: report all failures with proposed corrections. Do NOT write. Ask the human to review:
   ```
   limits.md validation: [n] hard failure(s), [n] warning(s).
   
   [Per-invariant results]
   
   Proposed corrections:
   [Show corrected limits.md or corrected sections]
   
   Apply corrected version? [y/N]
   ```
4. **If warnings only, no hard blocks**: report warnings and ask for confirmation before writing.
5. **If all invariants pass**: report VALID. If the human invoked this with write intent (e.g., "update limits to…"), apply the change. Otherwise, report that no write is needed.

## Output Contract

```
limits.md validation complete.
Invariants checked: 5
Hard failures: [n]
Warnings: [n]

1. Final rung = <user-switched session>: [PASS | FAIL]
2. Non-duplicate rungs: [PASS | FAIL | WARN]
3. Soft ≤ hard per state: [PASS | FAIL — list each failing state]
4. At least 3 rungs: [PASS | FAIL]
5. Executor rung not an escalation target: [PASS | FAIL]

Result: [VALID — no write needed | VALID — applying change | INVALID — see failures above, write blocked]
```

## What This Skill Does NOT Do

- Does NOT rewrite `limits.md` on its own initiative — only validates (and optionally applies the human's intended change after validation)
- Does NOT judge whether the token budget values are correct for the user's tier — that is a human calibration decision
- Does NOT prevent the human from editing `limits.md` directly
- Does NOT validate whether model names in the ladder are real or available — only structural invariants are checked

## Write Blockers

| Blocker | Action |
|---|---|
| Any hard invariant failure | Stop. Report all failures. Show corrected proposal. Ask for confirmation. |
| Human has not confirmed | Stop. Do not write until explicit confirmation. |
