---
name: mb-rebase
description: >-
  Rebase a single memory bank document against the current state of the repo.
  Use when a memory bank file may have drifted from reality, after bootstrap to
  calibrate with human knowledge, or periodically to keep documents honest.
  Invoke as: mb-rebase <filename> (e.g. mb-rebase architecture.md).
  Always involves the human — this is a conversation, not a machine operation.
metadata:
  author: uber-ai-workflow
  version: "1.0"
---

# mb-rebase

## Purpose

Rebase a single memory bank document against the current state of the codebase.
This is a **human-in-the-loop** operation. The agent researches, the human
confirms. Every rebase ends with a human decision.

This is not bootstrap (which is a cold machine operation). This is calibration —
a conversation between the agent and the human about what is true.

## When To Use

- After bootstrap, to fill in what the code alone could not prove
- When you suspect a document has drifted from reality
- Periodically, as a "squash migration" to clean up accumulated noise
- When the human asks to review or update a specific memory bank file
- When onboarding a new team member who wants to verify the memory bank

## Invocation

The human (or another agent) invokes this skill with a target file:

```
mb-rebase projectBrief.md
mb-rebase architecture.md
mb-rebase productContext.md
mb-rebase activeContext.md
mb-rebase decisions.md
```

The target must be a file that exists in `.memory-bank/`. If the file does not
exist, stop and tell the human.

## Procedure

### Step 1: Read The Current Document

Read the target file from `.memory-bank/` in full. Note:

- What is currently documented
- What sections exist and their content
- Any `<!-- NEEDS CONFIRMATION -->` markers from bootstrap
- Any `Pending Human Confirmation` sections
- The last apparent update (if dateable from content)

### Step 2: Research The Repo

Examine the codebase for evidence relevant to this document. What you look for
depends on which file you are rebasing:

**For `architecture.md`**:
- Scan package manifests, configs, and entry points for Tech Stack accuracy
- Search for repeated patterns — do documented patterns still appear 2+ times?
- Check CI, lint, and config for enforced rules — are documented rules still enforced?
- Look for new tech, new patterns, or new rules not yet documented

**For `projectBrief.md`**:
- Look at the overall shape of the repo — has the project scope changed?
- Check for new major features or removed features that shift identity
- Look for evidence of pivot or expansion

**For `productContext.md`**:
- Examine user-facing flows, screens, routes, handlers
- Look for new user types or removed flows
- Check for onboarding, billing, notification, or integration changes

**For `activeContext.md`**:
- Check current branch, recent commits, and working state
- Look for stale blockers or completed items still listed as in-progress
- Verify session data commands still work

**For `decisions.md`**:
- Check if documented decisions are still reflected in code
- Look for undocumented decisions evident from code changes
- Check for deprecated decisions that should be marked as such

### Step 3: Build A Drift Report

Compare what the document says against what the repo shows. Categorise findings:

```markdown
## Drift Report: [filename]

### Confirmed — Still Accurate
- [item]: still true because [evidence]

### Drifted — Needs Update
- [item]: document says X, repo shows Y
- [evidence for the change]

### Missing — Not Yet Documented
- [new item]: found [evidence] but not in document

### Stale — Should Be Removed Or Deprecated
- [item]: no longer relevant because [evidence]

### Questions — Cannot Determine From Code
- [question]: need human input because [reason]
```

### Step 4: Present To The Human

Show the drift report. Do not make changes yet. Ask the human:

1. For each **Drifted** item: "Should I update this?"
2. For each **Missing** item: "Should I add this?"
3. For each **Stale** item: "Should I remove or deprecate this?"
4. For each **Question**: ask the specific question
5. For any **Pending Human Confirmation** items from bootstrap: ask now

Wait for the human to respond. This is the calibration step — the human's
answers are what make the memory bank trustworthy.

### Step 5: Write The Update

Once the human has confirmed what to change:

1. Identify the correct update skill for the target file:
   - `architecture.md` → `update-architecture`
   - `projectBrief.md` → `update-project-brief`
   - `productContext.md` → `update-product-context`
   - `activeContext.md` → `update-active-context`
   - `decisions.md` → `update-decisions`
   - `toc.md` → `update-toc`

2. Use that skill to make the approved changes. The update skill enforces the
   document's structure and validation rules.

3. Remove any `<!-- NEEDS CONFIRMATION -->` markers for items the human has now
   confirmed.

4. Add new `Pending Human Confirmation` entries for any questions the human
   deferred.

### Step 6: Confirm Completion

Show the human a brief summary of what changed:

```
REBASE COMPLETE: [filename]
- Updated: [count] items
- Added: [count] items
- Removed/deprecated: [count] items
- Still pending confirmation: [count] items
```

## Rules

- **Never write without human confirmation.** The whole point of rebase is human
  calibration. If you skip the human, you are just running bootstrap again.
- **One file at a time.** Do not rebase multiple files in one invocation. Each
  file is a separate conversation.
- **Use the correct update skill for writes.** Do not write directly to memory
  bank files. The update skills enforce structure and validation.
- **Do not invent.** If the code does not prove something and the human does not
  confirm it, it does not go in the file.
- **Respect the human's "no."** If the human says an item should not be added or
  a change should not be made, accept it. Do not argue or re-ask.

## Red Flags — Stop

- Attempting to write without showing the drift report first
- Rebasing multiple files at once
- Writing directly to a memory bank file without using the update skill
- Adding content the human did not confirm
- Ignoring the human's corrections or deferrals
