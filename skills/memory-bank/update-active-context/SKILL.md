---
name: update-active-context
description: Use when updating .memory-bank/activeContext.md. Enforces the three-section structure (Current State, Progress, Session Data) with time-scale boundary rules. Triggered at every state transition (Current State only), at milestones (Progress), and when new operational shortcuts are discovered (Session Data).
metadata:
  author: uber-ai-workflow
  version: "1.0"
---

# Update Active Context

## Overview

This skill owns all writes to `.memory-bank/activeContext.md`. It enforces the
constitutional structure of the document — three sections separated by how
frequently they change. State transitions touch only Current State. Milestones
touch Progress. Session Data changes rarely.

This is the most frequently invoked memory-bank skill because Current State is
updated at every state machine transition.

## What This Skill Owns

- All writes to `.memory-bank/activeContext.md`
- Enforcing section boundaries based on time-scale
- Ensuring compaction recovery data is always current
- Preventing state transitions from churning stable sections

## What This Skill Does Not Own

- Creating `activeContext.md` from scratch (that is bootstrap)
- Deciding when state transitions occur (that is the AGENTS.md state machine)
- Reading `activeContext.md` (agents read it directly during session startup)

## When To Use

| Trigger | Section To Update | Other Sections |
|---------|-------------------|----------------|
| State machine transition (PLAN → BUILD, etc.) | Current State | Do not touch Progress or Session Data |
| Milestone reached (feature complete, blocker cleared) | Progress | Do not touch Current State or Session Data |
| New useful command/path/shortcut discovered | Session Data | Do not touch Current State or Progress |
| Compaction recovery preparation | Current State | Read all three, write only Current State |
| Task fully complete (entering DOCS) | Current State + Progress | Session Data only if new shortcuts discovered |

## Do Not Use When

- You are only reading `activeContext.md` for context
- You are in bootstrap (use the bootstrap contract instead)
- You want to record architectural decisions (use `update-decisions`)
- You want to record task documentation (use `update-task-docs`)

## Canonical Template

The document must always match this structure. Do not add, remove, or rename
sections. The HTML comments are part of the constitution and must be preserved.

```markdown
# Active Context

## Current State
<!-- BOUNDARY: State machine position and task focus. What is happening RIGHT NOW. -->
<!-- CHANGE FREQUENCY: Every state transition. This is the compaction recovery anchor. -->
<!-- RULE: State transitions ONLY touch this section. -->

### State
- **Position**: [STATE/SUBSTATE] (e.g., BUILD/CODING)
- **Task**: [Active task name and objective, or "No active task"]
- **Cycle**: [n]/[max] (e.g., 1/3 — tracks BUILD→QA iterations for stall detection)
- **Branch**: [Working branch name, if applicable]

### Working Context
- Key files under active modification
- Decisions in progress
- Pending questions for the human

### Conversation Context
- User preferences expressed this session
- Verbal requirements not yet in a task contract
- Pending clarifications

## Progress
<!-- BOUNDARY: Status and trajectory. What has happened and what is coming. -->
<!-- CHANGE FREQUENCY: Milestones only — feature completed, blocker hit/cleared, sprint boundary. -->
<!-- RULE: Do not rewrite at state transitions. Append new items, prune completed items. -->

### Recent Completions
- [YYYY-MM-DD] [What was completed]

### Current Blockers
- [Blocker description and status]

### Next Priorities
- [Priority item and rationale]

### Known Gaps
- [Gap description]

## Session Data
<!-- BOUNDARY: Operational shortcuts for fast session startup. What an agent needs to start working. -->
<!-- CHANGE FREQUENCY: Rarely — only when new useful patterns are discovered. -->
<!-- RULE: Never rewrite at state transitions. Only add genuinely new discoveries. -->

### Commands
- **Build**: [command]
- **Test**: [command]
- **Lint**: [command]
- **Deploy**: [command]

### Key Entry Points
- [Description]: `path/to/file.ext`

### Environment Notes
- [Setup requirement or gotcha]

### Frequently Referenced Paths
- [Description]: `path/to/directory/`
```

## Time-Scale Boundary Test

Before writing any content, apply this test:

1. **Will this be wrong in 10 minutes?** → Current State
2. **Will this be wrong in a week?** → Progress
3. **Will this be wrong in a month?** → Session Data
4. **Will this never change?** → It belongs in `architecture.md`, not here

If you cannot clearly determine the time-scale, default to Current State (it
gets overwritten most frequently and is the safest place for uncertain content).

## Write Procedure

### For State Transitions (Most Common)

This is the fast path. It must be lightweight because it runs at every
transition.

1. Read `.memory-bank/activeContext.md` — focus on the Current State section
2. Rewrite the Current State section with:
   - New state machine position
   - Active task name and objective
   - Current working context (key files, pending decisions)
   - Any loose conversation context that would be lost at compaction
3. **Do not touch Progress or Session Data**
4. Save

### For Milestones

1. Read `.memory-bank/activeContext.md` — focus on the Progress section
2. In the Progress section:
   - Append new completion to Recent Completions with date
   - Update or remove resolved blockers
   - Adjust Next Priorities if the milestone changes direction
   - Update Known Gaps if the milestone revealed or closed gaps
3. **Do not rewrite existing entries** — append and prune only
4. Save

### For Session Data Updates

1. Read `.memory-bank/activeContext.md` — focus on the Session Data section
2. Add the newly discovered command, path, or setup note to the appropriate
   subsection
3. **Do not reorganize existing entries** — only add new ones
4. Save

### Validation

Before saving, confirm:

- [ ] The three-section structure is intact (no sections added, removed, or renamed)
- [ ] All HTML boundary comments are preserved
- [ ] Only the intended section was modified (check the time-scale trigger)
- [ ] Current State includes state machine position (never blank)
- [ ] Current State includes task name or explicitly states "No active task"
- [ ] No architectural content leaked in (belongs in `architecture.md`)
- [ ] No decision records leaked in (belongs in `decisions.md`)

If any check fails, fix it before saving.

## Red Flags — Stop And Do Not Write

- Rewriting Progress or Session Data during a state transition
- Putting commands or paths in Current State (belongs in Session Data)
- Putting blockers in Session Data (belongs in Progress)
- Adding architectural patterns (belongs in `architecture.md`)
- Clearing Current State without writing the new state (leaves a gap for
  compaction)
- Rewriting the entire file when only one section changed
- Removing the HTML boundary comments

## Compaction Recovery Notes

This file is the primary recovery anchor after compaction. The design ensures:

- **Current State** is always up to date (written at every transition)
- **Progress** survives compaction untouched (not rewritten at transitions)
- **Session Data** survives compaction untouched (stable operational knowledge)

An agent recovering from compaction reads all three sections to reconstruct:
what is happening now (Current State), what the trajectory is (Progress), and
how to operate in this repo (Session Data).

## Exit Condition

This skill is complete when:

- The target section has been updated per the correct trigger type
- The validation checklist passes
- No other sections were modified unnecessarily
- The file is saved

Return control to the calling state.
