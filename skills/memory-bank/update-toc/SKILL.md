---
name: update-toc
description: Use when updating .memory-bank/toc.md after any memory-bank file has been added or removed. Mechanically reflects the current file list. Triggered from DOCS state after other memory-bank skills have run, or whenever a new memory-bank file is created.
metadata:
  author: uber-ai-workflow
  version: "1.0"
---

# Update TOC

## Overview

This skill owns all writes to `.memory-bank/toc.md`. The table of contents is a
mechanical reflection of what files exist in the memory-bank directory. It does
not contain opinions, summaries, or editorial content.

## What This Skill Owns

- All writes to `.memory-bank/toc.md`
- Ensuring every memory-bank file is listed
- Ensuring no non-existent files are listed
- Maintaining consistent format

## What This Skill Does Not Own

- Creating or modifying any other memory-bank file
- Deciding what files should exist

## When To Use

Use this skill when:

- A new memory-bank file was created (task doc, new optional file)
- A memory-bank file was removed
- You are in DOCS state and other memory-bank skills have completed their writes
- The human requests a toc refresh

## Do Not Use When

- No files were added or removed
- You only modified existing files (content changes do not affect the toc)

## Canonical Template

```markdown
# Memory Bank — Table of Contents

<!-- RULE: This file is a mechanical index. List every file that exists. Remove entries for files that do not exist. No editorial content. -->

## Foundation Documents
| File | Purpose |
|------|---------|
| `projectBrief.md` | Project identity, mission, scope |
| `productContext.md` | User goals, product context, market |
| `architecture.md` | Tech stack, patterns, rules |

## Operational Documents
| File | Purpose |
|------|---------|
| `activeContext.md` | Current state, progress, session data |
| `decisions.md` | Architectural decision records (append-only) |

## Optional Documents
| File | Purpose |
|------|---------|
| `database-schema.md` | Data models and schema documentation |
| `build-deployment.md` | Build and deployment procedures |
| `testing-patterns.md` | Test strategies and patterns |

## Task Documentation
| File | Purpose |
|------|---------|
| `tasks/YYYY-MM/README.md` | Monthly task summary |
| `tasks/YYYY-MM/DDMMDD_task-name.md` | Individual task documentation |
```

## Write Procedure

### Step 1: List Actual Files

List all files that currently exist in the `.memory-bank/` directory.

### Step 2: Read Current TOC

Read `.memory-bank/toc.md`.

### Step 3: Reconcile

- Add entries for any files that exist but are not listed
- Remove entries for any files that are listed but do not exist
- Place new entries in the correct category (Foundation, Operational, Optional,
  Task Documentation)
- For task files, list actual months and task docs, not just the template pattern

### Step 4: Validate

Before saving, confirm:

- [ ] Every file in `.memory-bank/` has a toc entry
- [ ] No toc entry references a non-existent file
- [ ] The header comment is preserved
- [ ] No editorial content was added (descriptions are factual, one-line purpose statements)

## Red Flags — Stop And Do Not Write

- Adding files to the toc that do not exist
- Removing entries for files that do exist
- Adding summaries, opinions, or editorial content
- Changing the file categorization structure without reason

## Exit Condition

This skill is complete when the toc accurately reflects the current file list.
Return control to the calling state.
