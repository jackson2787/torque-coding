# Build Log: [task name]

**Slug**: [same as plan.md]
**Model tier**: budget (BUILD)
**Max attempts before escalation**: 3

<!-- Written by: v2/skills/state-machine-v2/build-loop
     Consumed by: qa-v2 (for cycle reasoning) and escalate (on stall) -->

---

## Attempt 1

**Started**: YYYY-MM-DD HH:MM
**Approach**: [one-sentence summary of the approach taken this attempt]

### Changes applied

- `path/to/file.ext` — [what changed]
- `path/to/other.ext` — [what changed]

### Result

[Declared done → sent to QA]
OR
[Failed because: specific error / signature]

### Error signature (if failed)

```
[paste the first clear error — message, stack frame, or test failure]
```

---

## Attempt 2

**Started**: YYYY-MM-DD HH:MM
**Approach**: [how this differs from attempt 1]
**Reason for retry**: [QA failure / build error / same-signature check]

### Changes applied

- `path/to/file.ext` — [what changed]

### Result

[Declared done → sent to QA]
OR
[Failed because: ...]

### Error signature

```
[paste error]
```

---

## Attempt 3

**Started**: YYYY-MM-DD HH:MM
**Approach**: [how this differs from attempt 2]
**Reason for retry**: [...]

### Changes applied

- `path/to/file.ext` — [what changed]

### Result

[Declared done → sent to QA]
OR
[Failed → ESCALATE triggered]

### Error signature

```
[paste error]
```

---

## Same-signature check

<!-- If two attempts produced the same error signature, escalate immediately regardless
     of attempt count. -->

Attempt signatures seen:
1. [signature hash / short description]
2. [signature hash / short description]

Repeat detected: [yes → escalate | no]

---

## Final state

- Attempts used: [n] / 3
- Exit: [QA | ESCALATE]
- Current diff: [summary — or see git diff against task start]
