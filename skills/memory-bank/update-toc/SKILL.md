---
name: update-toc
description: >-
  Writes toc.md — a mechanical snapshot index of both the machine/ and human/
  halves of the memory bank. Full overwrite each time — not append-only.
  Called by bootstrap (Step 5) and automatically by update-human-log after
  every human-side write. Also called by debrief after archiving current-task/.
metadata:
  author: torque-coding
  version: "1.0"
  memory-bank: v2
  target-file: .memory-bank-v2/machine/toc.md
---

# update-toc

## Overview

`toc.md` is a mechanical snapshot index of both memory-bank halves. It is overwritten in full each time this skill runs — it is not a log and does not accumulate entries. Its purpose is to give any session (including a post-compaction recovery) a quick map of what exists in the memory bank without reading every file.

**This skill reads only what is necessary to build the index**: file presence, directory file counts, INDEX.md most-recent-entry lines. It does not read the content of indexed files.

## When to Use

- Bootstrap Step 5 — initial population after `init`
- Automatically after `update-human-log` writes a new file (see coupling note below)
- After `debrief` archives `current-task/` to `human/tasks/`
- When the human requests a toc refresh directly ("refresh toc", "update toc")

## When NOT to Use

- During BUILD or QA execution
- Triggered by writes to the five fixed machine/ files (constitution, operational-context, limits, activeContext — they are always present and their presence does not change the index structure)

## Coupling Note

`update-human-log` calls `update-toc` automatically at the end of every human-side write. This keeps the index current without requiring the human to remember to call it separately. If you are extending `update-human-log`, preserve this call.

## Pre-Checks

- [ ] `.memory-bank-v2/` directory exists at the expected path. If not found: stop and report a path error.
- [ ] Cap check: confirm that scanning the directory tree is within the PLAN hard cap (default 25k input tokens). Toc scanning is always lightweight — this check is a formality.

## Procedure

1. **Scan the machine/ half.**
   - Verify the five fixed files are present: `constitution.md`, `operational-context.md`, `limits.md`, `activeContext.md`, `toc.md`
   - For each fixed file, extract one metadata note:
     - `constitution.md` — last dated line in the Change Log section
     - `operational-context.md` — the `Last Debrief:` line
     - `limits.md` — count the rungs in the Escalation Ladder section
     - `activeContext.md` — the `State:` field value
     - `toc.md` — "This file"
   - Scan `current-task/` and record presence/absence of each of the five task files. For `qa-report.md`, if present, read the Overall field (PASS or FAIL).

2. **Scan the human/ half.**
   For each of the five subdirectories (`decisions/`, `tasks/`, `meetings/`, `rationale/`, `progress/`):
   - Count the number of files present (excluding INDEX.md itself)
   - Check whether INDEX.md is present
   - If INDEX.md is present, read its most-recent non-comment, non-empty line

3. **Overwrite `toc.md`** using the template at `templates/machine/toc.md`. Fill in:
   - The snapshot timestamp (current date and time)
   - Machine half table — file status and notes
   - current-task/ sub-table — presence and status per file
   - Human half table — directory counts, INDEX.md status, most recent entry

4. **Confirm write** (see Output Contract below).

## Output Contract

```
toc.md updated.
Machine half: 5 fixed files + [n] current-task files present
Human half: decisions [n], tasks [n], meetings [n], rationale [n], progress [n]
Snapshot: YYYY-MM-DD HH:MM
```

## What This Skill Does NOT Do

- Does NOT read the full content of indexed files — only presence, metadata one-liners, and INDEX.md most-recent-entry
- Does NOT maintain a history — each write is a full overwrite of the previous snapshot
- Does NOT write to any file other than `toc.md`
- Does NOT create missing directories — if `human/decisions/` does not exist, record it as absent in the index; do not create it

## Write Blockers

| Blocker | Action |
|---|---|
| `.memory-bank-v2/` not found | Stop. Report: "Memory bank not found at [expected path]. Run `torque-coding init` first." |
| `templates/machine/toc.md` not readable | Stop. Report path error and suggest re-running `torque-coding update`. |
