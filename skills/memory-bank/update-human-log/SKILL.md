---
name: update-human-log
description: >-
  Single entry point for all human-side memory writes in v2. Routes to the correct
  subdirectory under .memory-bank-v2/human/ based on the write kind. Applies the
  matching template and updates the corresponding INDEX.md. Never writes to machine-side
  files. Called by the debrief skill and may be called by the human directly.
metadata:
  author: torque-coding
  version: "2.0"
  memory-bank: v2
  target-directory: .memory-bank-v2/human/
---

# update-human-log

## Overview

All human-side memory writes go through this skill. It is the only writer for the `human/` domain.

Accepts a `kind` that determines which subdirectory, filename pattern, template, and `INDEX.md` to use.

**Coexistence note**: This skill writes to `.memory-bank-v2/human/`. The v1 skill `update-task-docs` writes to `.memory-bank/tasks/`. These are disjoint paths. Both skills coexist without conflict.

## Kinds

| Kind | Target path | Use for |
|---|---|---|
| `task` | `tasks/YYYY-MM/DDMMDD_<slug>.md` | Task histories after completion |
| `decision` | `decisions/YYYY/YYYY-MM-DD-<slug>.md` | Architectural decision records; constitutional proposals |
| `meeting` | `meetings/YYYY-MM-DD-<topic>.md` | Discussion summaries, alignment outcomes |
| `rationale` | `rationale/<topic>.md` | Standing "why we do X" documents; retired operational-context entries |
| `progress` | `progress/YYYY-Qn.md` | Quarterly progress notes |

## When to Use

- **Debrief calls this skill** after every task to write the task history (`kind=task`)
- **Debrief calls this skill** when a decision was made during the task (`kind=decision`)
- **Debrief calls this skill** when retiring or updating an operational-context entry (`kind=rationale`)
- **Human calls this skill** to log a meeting outcome, progress note, or decision directly
- **Constitutional amendment proposals** are also routed here (`kind=decision`) — debrief uses this to propose changes to `constitution.md` without writing it directly

## What This Skill Does NOT Do

- Never writes to `machine/` files (constitution, operational-context, activeContext, toc)
- Never evaluates whether a learning is memory-worthy (that is the debrief skill's job)
- Never skips updating the `INDEX.md` — every write updates the index

---

## Kind: task

**Target**: `.memory-bank-v2/human/tasks/YYYY-MM/DDMMDD_<slug>.md`
**Also updates**: `tasks/YYYY-MM/README.md` (monthly digest) and `tasks/INDEX.md`

### Template

```markdown
# Task: [task name]

**Date**: YYYY-MM-DD
**State**: Completed
**Debrief result**: [new rule | updated pattern | retired rule | no learning]

## Objective

[One paragraph. What was the task trying to achieve?]

## Outcome

[One paragraph. What was actually built or changed? Did it meet the acceptance criteria?]

## Files Modified

<!-- Specific, verifiable — exact file paths and what changed.
     No vague entries like "updated services". -->

- `path/to/file.ext` — [what changed]
- `path/to/other.ext` — [what changed]

## Patterns Applied

<!-- Which operational-context.md directives guided the implementation?
     Format: operational-context.md#[Section] — [how it was applied] -->

- `operational-context.md#[Section]` — [applied as: ...]

## Decisions Made

<!-- Architectural decisions that arose during the task.
     If a full ADR was written, link to it: decisions/YYYY/<slug>.md -->

- [Decision] → see `decisions/YYYY/YYYY-MM-DD-<slug>.md` (if applicable)

## Debrief Notes

<!-- What the debrief considered and concluded.
     If nothing was learned: "No memory-worthy learning identified."
     If something was learned: brief description and pointer to the operational-context change. -->

[DEBRIEF NOTES HERE]
```

### Monthly digest update

After writing the task file, append a one-line entry to `tasks/YYYY-MM/README.md`:
```
- YYYY-MM-DD — [task name] — [Completed | Stalled] — [debrief result]
```

### INDEX.md update

Append to `tasks/INDEX.md`:
```
- YYYY-MM-DD — [task name] — `tasks/YYYY-MM/DDMMDD_<slug>.md`
```

---

## Kind: decision

**Target**: `.memory-bank-v2/human/decisions/YYYY/YYYY-MM-DD-<slug>.md`
**Also updates**: `decisions/INDEX.md`

### Template

```markdown
# Decision: [title]

**Date**: YYYY-MM-DD
**Status**: [Proposed | Ratified | Rejected | Superseded]
**Proposed by**: [agent | human name]
**Ratified by**: [human name | pending]

## Context

[What situation prompted this decision? What is the current state without this change?]

## Decision

[What was decided? State it clearly and concisely.]

## Alternatives Considered

- **[Alternative A]**: [description] — rejected because [reason]
- **[Alternative B]**: [description] — rejected because [reason]

## Consequences

**If adopted**:
- [Consequence 1]
- [Consequence 2]

**If rejected**:
- [Consequence of not changing]

## Constitutional Implication (if applicable)

<!-- If this decision proposes a change to constitution.md, explain here.
     The human ratifies with the keyword "ratified" in their next message.
     Then update-constitution applies the change. -->

[none | description of what would change in constitution.md]
```

### INDEX.md update

Append to `decisions/INDEX.md`:
```
- YYYY-MM-DD — [title] — [Proposed | Ratified | Rejected] — `decisions/YYYY/YYYY-MM-DD-<slug>.md`
```

---

## Kind: meeting

**Target**: `.memory-bank-v2/human/meetings/YYYY-MM-DD-<topic>.md`
**Also updates**: `meetings/INDEX.md`

### Template

```markdown
# Meeting: [topic]

**Date**: YYYY-MM-DD
**Participants**: [names or roles]

## Outcomes

- [Outcome 1]
- [Outcome 2]

## Decisions Made

- [Decision 1]
- [Decision 2]

## Actions

| Action | Owner | Due |
|---|---|---|
| [action] | [who] | [when] |

## Notes

[Any additional context, discussion points, or open questions]
```

### INDEX.md update

Append to `meetings/INDEX.md`:
```
- YYYY-MM-DD — [topic] — `meetings/YYYY-MM-DD-<topic>.md`
```

---

## Kind: rationale

**Target**: `.memory-bank-v2/human/rationale/<topic>.md`
**Also updates**: `rationale/INDEX.md`

### Template

```markdown
# Rationale: [topic]

**Created**: YYYY-MM-DD
**Last updated**: YYYY-MM-DD
**Related operational-context**: `operational-context.md#[Section]` (if applicable)
**Related constitution**: `constitution.md#[Section]` (if applicable)

## Why We Do This

[Explanation of the reasoning behind a directive or architectural choice.
 This is the "why" that is intentionally absent from operational-context.md and constitution.md.]

## History

[How did we arrive at this approach? What was tried before?
 This is the retrospective narrative that machine documents deliberately exclude.]

## Trade-offs Accepted

- [Trade-off 1 — what we gave up and why]
- [Trade-off 2 — what we gave up and why]

## Conditions That Would Change This

[What would have to be true for this rationale to no longer hold?
 This helps future agents recognise when a directive should be re-evaluated.]
```

### When a retired operational-context entry is archived here

If `update-operational-context` retires a directive, the old text is moved to `rationale/<topic>.md` with a note:

```markdown
## Archived Directive

The following directive was active in `operational-context.md` from [start date] to [end date]:

> [old directive text]

**Why it was retired**: [reason — e.g., the legacy module was fully removed, the constraint no longer applies]
```

### INDEX.md update

Append to `rationale/INDEX.md`:
```
- YYYY-MM-DD — [topic] — `rationale/<topic>.md`
```

---

## Kind: progress

**Target**: `.memory-bank-v2/human/progress/YYYY-Qn.md`

### Template

```markdown
# Progress: YYYY Q[n]

**Period**: YYYY-MM-DD to YYYY-MM-DD

## Summary

[2-3 sentences on the quarter's direction and output]

## Milestones Completed

- [Milestone] — [date]

## Milestones In Progress

- [Milestone] — [target date]

## Known Gaps

- [Gap or risk]

## Tasks Completed This Quarter

<!-- Link to monthly digests -->
- [tasks/YYYY-MM/README.md](../tasks/YYYY-MM/README.md)
```

Progress files are updated, not replaced. Append to the existing file for the current quarter if it exists.

---

## General Write Rules

1. **Never write to machine-side files** — if a route leads to `machine/`, stop and flag
2. **Always update the relevant INDEX.md** — index accuracy is required for human browsability
3. **Use today's date** for YYYY-MM-DD fields unless the event date is explicitly provided
4. **Slugs** — lowercase, hyphenated, max 40 characters: `add-rpc-route-pattern`, `retire-legacy-import`
5. **Do not fabricate** — if a field is unknown, mark it `[unknown]` rather than inventing content
6. **Confirm after writing**:
   ```
   human-log written.
   Kind: [kind]
   Path: [full path]
   INDEX.md: updated
   ```
