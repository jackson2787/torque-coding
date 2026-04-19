# Plan Context: [task name]

**Slug**: [same as plan.md]
**Date**: YYYY-MM-DD
**Model tier**: powerful (PLAN-CONTEXTUALIZE)
**Target property**: A budget model reading this file plus plan.md should need ZERO exploration tool calls to start coding.

<!-- Written by: skills/state-machine/plan-contextualize
     Consumed by: build-loop (BUILD state)
     Archived to: human/tasks/YYYY-MM/DDMMDD_<slug>/plan_context.md on debrief -->

---

## Files to touch — current state pasted

<!-- For each file the plan modifies, paste the EXACT current content of the relevant
     range. Line numbers must match. The budget model should not need to re-read the
     file to know what it currently says. -->

### `path/to/file.ext`

**Lines X–Y (current state)**:
```
[paste exact current content with line numbers]
```

**Planned change**: [one-sentence summary of what will be different]

---

## Patterns to follow — with repo examples

<!-- Extract each applicable directive from operational-context.md and pair it with a
     concrete example from the codebase. The budget model mimics the example, not the
     abstract directive. -->

### Pattern: [name]

**Directive**: `operational-context.md#[Section]` — "[exact directive text]"

**Example in repo**: `path/to/example.ext:LINE`

```
[paste the example code]
```

**How to apply here**: [one sentence — connect the example to the files being touched]

---

## Constraints to respect — task-specific slice

<!-- Extract constitutional and operational-context constraints that apply to this
     specific task. Not the whole constitution — only the relevant lines. -->

- `constitution.md#[Section]` — "[exact text]" — applies because: [reason]
- `operational-context.md#[Section]` — "[exact text]" — applies because: [reason]

---

## Integration points

<!-- Where this change connects to the rest of the system. Include file:line of each
     caller, dependency, or consumer. -->

- Caller: `path/to/caller.ext:LINE` — [expectation]
- Dependency: `path/to/dep.ext:LINE` — [what we rely on]

---

## Test patterns to mirror

<!-- Existing tests that demonstrate the style, framework, and shape to mirror. -->

- `path/to/test.ext:LINE` — [pattern this test demonstrates]

```
[paste 5-15 lines of the test to mirror]
```

---

## Dead ends — explored and rejected

<!-- The planner explored these approaches and rejected them. Listing them prevents the
     budget model from re-exploring the same dead ends. -->

- **[Approach A]**: tried [what] — rejected because [reason grounded in `file:line` or doctrine].
- **[Approach B]**: tried [what] — rejected because [reason].

---

## Success criteria — from plan.md, restated as verifiable checks

<!-- Re-state acceptance criteria as checks QA can run mechanically. -->

1. [Check — e.g., "Test `foo.test.ts::describe > it returns X` passes"]
2. [Check — e.g., "Linter reports zero warnings in modified files"]
3. [Check — e.g., "`endpoint /api/x` returns 200 for sample payload"]

---

## Out-of-scope — do not touch

- `path/not/to/touch.ext` — [reason]

---

## Exploration budget for BUILD

BUILD should require **zero** exploration tool calls. If BUILD finds itself needing to explore, that is a signal this context pack is incomplete — return to PLAN-CONTEXTUALIZE rather than guessing.
