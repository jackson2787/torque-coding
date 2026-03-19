---
name: update-decisions
description: Use when recording an architectural decision in .memory-bank/decisions.md. Enforces append-only ADR format. Triggered from DOCS state when an architectural decision was made, or immediately when a significant architectural choice occurs during PLAN or BUILD.
metadata:
  author: uber-ai-workflow
  version: "1.0"
---

# Update Decisions

## Overview

This skill owns all writes to `.memory-bank/decisions.md`. The file is an
append-only architectural decision record (ADR). Entries are never edited or
deleted after creation. Each entry records what was decided, why, what
alternatives were rejected, and what consequences follow.

## What This Skill Owns

- All writes to `.memory-bank/decisions.md`
- Enforcing append-only discipline
- Enforcing the ADR entry format
- Preventing edits to existing entries

## What This Skill Does Not Own

- Creating `decisions.md` from scratch (that is bootstrap)
- Deciding what constitutes an architectural decision (that is the agent's
  judgment, guided by AGENTS.md)
- Recording implementation details (use `update-task-docs`)
- Recording patterns or rules (use `update-architecture`)

## When To Use

Use this skill when:

- An architectural decision was made during the current task (e.g., chose
  event-driven over polling, chose PostgreSQL over MongoDB, chose to split a
  service)
- A significant technical trade-off was resolved with human input
- A previous decision is being superseded (append a new entry that references
  the old one)

## Do Not Use When

- Recording a routine implementation choice (not every "if/else" is an ADR)
- Recording a pattern (use `update-architecture` Patterns section)
- Recording a rule (use `update-architecture` Rules section)
- Recording task progress (use `update-task-docs`)
- The decision has not actually been made yet (do not record pending decisions)

## Canonical Template

The file has a simple structure: a title and a sequence of dated entries. New
entries are appended at the bottom.

```markdown
# Decisions

<!-- RULE: Append-only. Never edit or delete existing entries. -->
<!-- RULE: Never backdate entries. Use today's date. -->
<!-- RULE: Each entry must record a decision that HAS BEEN MADE, not one under consideration. -->

### YYYY-MM-DD: [Decision Title]
**Status**: Accepted
**Context**: [Why this decision was needed. What problem or trade-off prompted it.]
**Decision**: [What was decided. Be specific.]
**Alternatives Considered**:
- [Alternative A]: [Why rejected]
- [Alternative B]: [Why rejected]
**Consequences**:
- [Positive consequence]
- [Negative consequence or trade-off accepted]
**References**: `tasks/YYYY-MM/DDMMDD_task-name.md` | `architecture.md#Section`
```

## Decision Test

Before writing an entry, confirm:

1. **Has a decision actually been made?** If it is still under discussion, do
   not record it. Wait until it is resolved.
2. **Is it architectural?** Architectural means it affects structure, boundaries,
   technology choices, or patterns that other future work must respect. Routine
   implementation choices are not ADRs.
3. **Would a future agent need to know why this choice was made?** If the answer
   is "probably not," it is not worth an ADR entry.

If all three are yes, proceed. Otherwise, stop.

## Write Procedure

### Step 1: Read Current File

Read `.memory-bank/decisions.md` in full. Confirm the append-only header comment
is intact. Note the last entry date to ensure chronological ordering.

### Step 2: Draft The Entry

Write the entry using the canonical template above. Fill in every field:

- **Date**: Today's date. Never backdate.
- **Title**: Short, descriptive. "Chose X over Y" or "Adopted X for Z."
- **Status**: Always "Accepted" for new entries.
- **Context**: Why the decision was needed. What triggered it.
- **Decision**: What was decided. Specific enough that a future agent can
  understand the choice without reading the full task history.
- **Alternatives Considered**: At least one alternative and why it was rejected.
  If there were no alternatives, state "No viable alternatives identified."
- **Consequences**: At least one positive and one negative/trade-off. If there
  are no negatives, state the accepted cost or limitation.
- **References**: Link to the task doc and any relevant `architecture.md`
  section.

### Step 3: Append

Add the new entry at the bottom of the file, after all existing entries.

### Step 4: Validate

Before saving, confirm:

- [ ] The entry is appended at the bottom (not inserted or replacing)
- [ ] No existing entries were modified
- [ ] The date is today's date (not backdated)
- [ ] All template fields are filled in
- [ ] The decision has actually been made (not pending)
- [ ] The decision is architectural (not routine)
- [ ] The append-only header comments are preserved

If any check fails, fix it before saving.

## Superseding A Previous Decision

When a new decision supersedes an old one:

1. **Do not edit the old entry**
2. Append a new entry with today's date
3. In the new entry's Context field, reference the old entry:
   "Supersedes decision from YYYY-MM-DD: [Old Decision Title]"
4. In the new entry's Decision field, state what changed and why

## Red Flags — Stop And Do Not Write

- Editing or deleting an existing entry
- Backdating an entry to match when the decision "really" happened
- Recording a decision that has not been made
- Recording routine implementation choices as ADRs
- Using the file as a changelog or progress log
- Removing the append-only header comments

## Exit Condition

This skill is complete when:

- The new entry has been appended
- The validation checklist passes
- No existing entries were modified
- The file is saved

Return control to the calling state (typically DOCS).
