# QA Report: [task name]

**Slug**: [same as plan.md]
**Cycle**: [n] of 3 (QA→BUILD max)
**Date**: YYYY-MM-DD HH:MM
**Model tier**: budget (QA) — skeptical by design
**Overall result**: PASS | FAIL

<!-- Written by: v2/skills/state-machine-v2/qa-v2
     Overwritten on every cycle; previous cycles live in build-log.md
     Consumed by: debrief (on pass) or build-loop (on fail) -->

---

## Stance

QA disbelieves success until evidence is on disk. Every check below was run, not just read.

---

## Check 1 — Tests executed

**Command run**: `[exact command, e.g. npm test -- path/to/test.ext]`
**Exit code**: [0 / non-zero]
**Tests touched by diff**: [n]
**Tests passed**: [n] **Tests failed**: [n]

**Evidence**:
```
[paste last 20 lines of test output]
```

**Result**: PASS | FAIL

---

## Check 2 — Linter clean

**Command run**: `[exact command, e.g. pnpm lint path/to/file.ext]`
**Exit code**: [0 / non-zero]
**Warnings**: [n] **Errors**: [n]

**Evidence**:
```
[paste linter output or "clean"]
```

**Result**: PASS | FAIL

---

## Check 3 — Build succeeds

**Command run**: `[exact command, e.g. pnpm build]`
**Exit code**: [0 / non-zero]

**Evidence**:
```
[paste last 10 lines of build output or "success"]
```

**Result**: PASS | FAIL | N/A (no build step for this change)

---

## Check 4 — Operational-context directives followed

For each applicable directive listed in `plan_context.md#Patterns-to-follow`, verify it was actually followed in the diff.

| Directive | Applied in file | Evidence line | Result |
|---|---|---|---|
| `operational-context.md#[Section]` — "..." | `path/to/file.ext` | LINE | PASS/FAIL |

**Result**: PASS | FAIL

---

## Check 5 — Constitution boundaries

Scan the diff for crossings of any `constitution.md` boundary.

| Boundary | Crossed? | Notes |
|---|---|---|
| `constitution.md#[Section]` | no / yes | [explanation] |

**Result**: PASS | FAIL (any crossing = FAIL + immediate stop)

---

## Check 6 — Acceptance criteria met

For each numbered criterion in `plan.md#Acceptance-criteria`:

| # | Criterion | Verified by | Result |
|---|---|---|---|
| 1 | [criterion] | [test / diff line / command output] | PASS/FAIL |
| 2 | [criterion] | [...] | PASS/FAIL |

**Result**: PASS | FAIL

---

## Summary

| Check | Result |
|---|---|
| 1. Tests executed | PASS/FAIL |
| 2. Linter clean | PASS/FAIL |
| 3. Build succeeds | PASS/FAIL/N/A |
| 4. Operational-context directives | PASS/FAIL |
| 5. Constitution boundaries | PASS/FAIL |
| 6. Acceptance criteria | PASS/FAIL |

**Overall**: [PASS → DEBRIEF | FAIL → BUILD cycle n+1 | FAIL cycle 3 → ESCALATE]

---

## Issues returned to BUILD (if FAIL)

- [Specific issue — file:line — what must change]
- [Specific issue — file:line — what must change]
