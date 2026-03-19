---
name: update-project-brief
description: Use when updating .memory-bank/projectbrief.md. Rarely triggered — only at major product pivots, identity changes, or scope redefinitions. Requires explicit human approval before any write. Do not use for implementation details, patterns, or tech stack changes.
metadata:
  author: uber-ai-workflow
  version: "1.0"
---

# Update Project Brief

## Overview

This skill owns all writes to `.memory-bank/projectbrief.md`. This is the most
stable document in the memory bank. It captures the project's identity, mission,
and scope — not implementation details. Changes to this file are rare and always
require explicit human approval.

## What This Skill Owns

- All writes to `.memory-bank/projectbrief.md`
- Enforcing the scope of what belongs in this file
- Requiring human approval before any change

## What This Skill Does Not Own

- Creating `projectbrief.md` from scratch (that is bootstrap)
- Tech stack decisions (use `update-architecture`)
- User and product context (use `update-product-context`)
- Patterns, rules, or implementation details (use other skills)

## When To Use

Use this skill only when:

- The product mission or identity has fundamentally changed
- The project scope boundaries have shifted significantly
- The human explicitly requests a project brief update
- A major pivot has occurred that changes what the project IS

## Do Not Use When

- A new feature was added (that does not change project identity)
- A technology was changed (use `update-architecture`)
- User context changed (use `update-product-context`)
- You think the brief "could be more detailed" (resist this urge)

## Canonical Template

```markdown
# Project Brief

<!-- RULE: This file captures project IDENTITY — what it is, why it exists, where it ends. -->
<!-- RULE: Changes require explicit human approval. Do not update based on a single task. -->
<!-- RULE: No implementation details. No tech stack. No user research. -->

## What This Project Is
[One to three sentences. What the project does at the highest level.]

## Core Objective
[The primary goal this project serves. Why it exists.]

## Scope Boundaries
- **In scope**: [What the project covers]
- **Out of scope**: [What the project explicitly does not cover]

## Success Signals
[How you know the project is working. Practical, observable indicators.]

## Pending Human Confirmation
[Any claims that have not been confirmed by the human. Remove items as they are confirmed.]
```

## Write Procedure

### Step 1: Confirm Human Approval

Before making any change, confirm that the human has explicitly approved the
update. Acceptable forms of approval:

- "Update the project brief"
- "The project mission has changed to X"
- "We've pivoted to Y"
- Direct instruction to modify scope or identity

If no explicit approval exists, **stop**. Present the proposed change and ask for
approval.

### Step 2: Read Current File

Read `.memory-bank/projectbrief.md` in full.

### Step 3: Make Minimal Changes

Change only what the human approved. Do not "improve" other sections while you
are here. Do not add implementation details, tech stack information, or user
research.

### Step 4: Validate

Before saving, confirm:

- [ ] The human explicitly approved this change
- [ ] Only approved sections were modified
- [ ] No implementation details were added
- [ ] No tech stack information was added (belongs in `architecture.md`)
- [ ] No user/product context was added (belongs in `productContext.md`)
- [ ] The template structure is intact
- [ ] Header comments are preserved
- [ ] Unconfirmed claims remain in "Pending Human Confirmation"

## Red Flags — Stop And Do Not Write

- Updating without explicit human approval
- Adding implementation details, architecture, or tech stack information
- Adding user segments or product context (belongs in `productContext.md`)
- Expanding scope based on a single task
- "Improving" the brief without being asked
- Removing the "Pending Human Confirmation" section

## Exit Condition

This skill is complete when the approved change has been made and validated.
Return control to the calling state.
