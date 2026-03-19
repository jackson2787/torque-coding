---
name: update-task-docs
description: Use when creating task documentation after APPLY succeeds. Creates the task doc at memory-bank/tasks/YYYY-MM/DDMMDD_task-name.md and updates the monthly README. Always creates both files as a pair. Triggered from DOCS state only.
metadata:
  author: uber-ai-workflow
  version: "1.0"
---

# Update Task Docs

## Overview

This skill owns the creation of task documentation files and the corresponding
monthly README updates. These always come as a pair — you never create a task
doc without updating the monthly README, and you never update the monthly README
without a task doc.

This skill owns task documentation that was previously handled by the
`writing-docs` skill (now removed).

## What This Skill Owns

- Creating `memory-bank/tasks/YYYY-MM/DDMMDD_task-name.md`
- Updating `memory-bank/tasks/YYYY-MM/README.md`
- Enforcing the task doc template
- Ensuring high-fidelity, specific documentation (no generic summaries)

## What This Skill Does Not Own

- Updating `architecture.md` (use `update-architecture`)
- Updating `decisions.md` (use `update-decisions`)
- Updating `activeContext.md` (use `update-active-context`)
- Updating `toc.md` (use `update-toc`)
- Any other memory-bank file

## When To Use

Use this skill only when:

1. You are in the DOCS state
2. APPLY has succeeded
3. The user approved the code changes in the APPROVAL state

## Do Not Use When

- You are still in BUILD, DIFF, QA, or APPROVAL
- APPLY failed (there is nothing to document)
- You want to update global memory-bank files (use the specific skill for each)

## Canonical Task Doc Template

Every task doc must follow this template. Do not omit sections. If a section
has no content, write "None" rather than removing the section.

```markdown
# YYMMDD_task-name

## Objective
[Brief, specific description of what was accomplished. Not what was attempted — what was done.]

## Outcome
- ✅ Tests: [Exact number] passing ([+N new])
- ✅ Coverage: [Exact percentage] ([+/-N%])
- ✅ Build: Successful
- ✅ Review: Approved by user

## Files Modified
- `path/to/file1.ext` — [Specific change: "Added handleOnboarding method", not "Updated file"]
- `path/to/file2.ext` — [Specific change]

## Patterns Applied
- `architecture.md#Patterns/[Pattern Name]` — [How it was applied]
- `architecture.md#Rules/[Rule Name]` — [How it was followed]

## Integration Points
- `path/to/component.ext:line` — [Integration description]
- `path/to/service.ext:line` — [Integration description]

## Architectural Decisions
- Decision: [Brief summary, or "None — used existing patterns"]
- Rationale: [Why this approach]
- See: `decisions.md#YYYY-MM-DD-decision-name` (if an ADR was created)

## Artifacts
- Branch: [branch name]
- PR: [link, if applicable]
- Diff stats: [N files, +X insertions, -Y deletions]
```

## Canonical Monthly README Entry Template

Each task gets an entry appended to the monthly README.

```markdown
### YYYY-MM-DD: [Task Name]
- Implemented [brief, specific description]
- Files: `file1.ext`, `file2.ext`
- Pattern: [Pattern applied, or "Extended existing [X]"]
- See: [DDMMDD_task-name.md](./DDMMDD_task-name.md)
```

## Write Procedure

### Step 1: Gather Evidence

Before writing, collect:

- The final diff stats (exact file names, exact insertion/deletion counts)
- The QA results (exact test counts, exact coverage numbers)
- The patterns referenced during PLAN and BUILD
- Any architectural decisions made
- The branch name and PR link (if applicable)

Do not write from memory. Re-read the diff and QA output if needed.

### Step 2: Create Task Doc

1. Determine the file path: `memory-bank/tasks/YYYY-MM/DDMMDD_task-name.md`
   - Use today's date for YYMMDD
   - Use a kebab-case task name derived from the task contract
2. Create the directory `memory-bank/tasks/YYYY-MM/` if it does not exist
3. Write the task doc using the canonical template above
4. Fill in every field with specific, verifiable data

### Step 3: Update Monthly README

1. Read `memory-bank/tasks/YYYY-MM/README.md`
   - If it does not exist, create it with a `# YYYY-MM Tasks` heading
2. Append the monthly README entry template at the bottom
3. Do not modify existing entries

### Step 4: Validate

Before saving, confirm:

- [ ] Task doc uses the canonical template with all sections present
- [ ] File names in "Files Modified" are real paths (not generic descriptions)
- [ ] Test counts and coverage numbers are exact (not approximated)
- [ ] Diff stats are exact (not estimated)
- [ ] Patterns Applied references real `architecture.md` sections
- [ ] Monthly README entry links to the task doc correctly
- [ ] No other memory-bank files were modified (use their specific skills)
- [ ] The task doc is being created AFTER APPLY, not before

If any check fails, fix it before saving.

## Red Flags — Stop And Do Not Write

- Writing task docs before APPLY succeeds
- Using generic descriptions: "Updated UI components" instead of
  "Added `handleOnboarding` method to `src/services/onboarding.ts`"
- Hallucinating file names that do not exist in the diff
- Approximating test counts: "about 150 tests" instead of "156 tests"
- Omitting template sections instead of writing "None"
- Modifying other memory-bank files (each has its own skill)
- Modifying existing monthly README entries

## Exit Condition

This skill is complete when:

- The task doc is created with all template sections filled
- The monthly README is updated with a linked entry
- The validation checklist passes
- Both files are saved

Return control to the DOCS state for any remaining memory-bank updates
(architecture, decisions, toc, etc.).
