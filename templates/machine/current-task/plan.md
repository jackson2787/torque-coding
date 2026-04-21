# Plan: [task name]

**Slug**: [lowercase-hyphenated-max-40-chars]
**Date**: YYYY-MM-DD
**Model tier**: powerful (PLAN)
**Status**: Draft | Approved | Superseded

<!-- Written by: skills/state-machine/writing-plans-v2
     Source brief: definition.md when DEFINE was used
     Consumed by: plan-contextualize (next state)
     Archived to: human/tasks/YYYY-MM/DDMMDD_<slug>/plan.md on debrief -->

## Task contract

### Objective

[One paragraph. What is being changed and why. State the user-visible outcome, not the implementation.]

### Definition traceability

<!-- If DEFINE was used, map the definition into this plan. If DEFINE was intentionally skipped, state why. -->

- Source definition: [definition.md | DEFINE skipped — reason]
- Target user preserved from definition: [yes/no/n/a]
- MVP scope preserved from definition: [yes/no/n/a]
- Not Doing boundaries preserved from definition: [yes/no/n/a]

### Acceptance criteria

<!-- Numbered, testable. Each must be verifiable from the diff or a test. -->

1. [Criterion — specific, observable]
2. [Criterion — specific, observable]

### Constraints

<!-- Hard boundaries from task or memory bank -->

- [Constraint — e.g., "no changes to the auth module"]

## Authority check

Before writing this plan, these were read:

- [ ] `constitution.md` — no conflicts found
- [ ] `operational-context.md` — relevant sections: [Sections]

### Doctrine conflicts

[none | describe each conflict and how this plan reconciles it. If a conflict cannot be reconciled, STOP and flag for ratification.]

## Reuse analysis

<!-- Required by Sacred Rule: no new files without reuse analysis. -->

Files analyzed for reuse:
- `path/to/existing.ext` — [suitable | unsuitable because: reason]

Conclusion:
- [Extend existing at `file:line`] OR [Create new file: `path/to/new.ext` because: specific technical reason]

## Analyzed files

<!-- Files the plan touches or depends on. Full paths, no shortcuts. -->

- `path/to/file.ext` — [role in this task]
- `path/to/other.ext` — [role in this task]

## Task decomposition

<!-- Required for anything larger than a trivial one-file change. Keep slices small, dependency-ordered, and independently verifiable. -->

### Dependency graph

- [Foundation dependency] → [dependent task/step]
- [Shared contract/API/schema] → [consumer]

### Slice strategy

- Vertical slice: [yes/no — if no, explain why horizontal/foundation-first work is necessary]
- High-risk work front-loaded: [yes/no — identify the first high-risk check]
- Parallelization: [safe independent slices | sequential because dependencies/shared state | not applicable]

### Task slices

| Slice | Scope | Dependencies | Files likely touched | Verification |
|---|---|---|---|---|
| 1. [Short title] | [XS/S/M; avoid L+] | [None or prior slice] | `[file]`, `[test]` | `[command/manual check]` |

### Checkpoints

- After slice [N]: [tests/build/manual review/human checkpoint]

## Implementation steps

<!-- Ordered. Each step is concrete enough for an executor model to execute without exploration. -->

1. [Step — file, function, change]
2. [Step — file, function, change]
3. [Step — file, function, change]

## Integration points

- [External system / module] — [how this change interacts]

## Patterns to follow

<!-- Pointers into operational-context.md with file:line evidence from the repo -->

- `operational-context.md#[Section]` — applied as: [how]. Example in repo: `path/to/example.ext:123`

## Risks

- [Risk] — [mitigation]

## Test strategy

- [ ] [Test to add or extend] — `path/to/test.ext`
- [ ] [Test to add or extend] — `path/to/test.ext`

## Out of scope

<!-- Explicit negative scope — things this plan will NOT do -->

- [Out-of-scope item]
