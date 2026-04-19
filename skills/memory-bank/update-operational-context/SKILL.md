---
name: update-operational-context
description: >-
  Writes to operational-context.md in the v2 memory bank. Enforces prescriptive voice,
  section placement, evidence requirements, and constitutional conflict checks. Called
  only by the debrief skill (propose-diff flow) or by the human directly. Never called
  from task work or BUILD LOOP.
metadata:
  author: torque-coding
  version: "2.0"
  memory-bank: v2
  target-file: .memory-bank-v2/machine/operational-context.md
---

# update-operational-context

## Overview

`operational-context.md` is the current working truth of the system. This skill is its only writer. It enforces that the document stays prescriptive, present-tense, and evidence-backed — never retrospective, never speculative, never a changelog.

## When to Use

- After debrief has proposed a diff and the human has approved it
- When the human explicitly says "update operational-context" (outside of debrief)
- During bootstrap cold-start

## When NOT to Use

- During task execution (BUILD LOOP) — memory updates happen in DEBRIEF only
- Without a prior diff proposal shown to the human (unless bootstrap or human direct request)
- To write rationale, history, or "why we do X" explanations — those go to `human/rationale/`

## Pre-Write Checks

### 1. Constitution conflict check

Before writing any entry, read `constitution.md`. Check whether the proposed entry contradicts any existing constitution content.

If a conflict is found:
```
Constitutional conflict detected.
Proposed operational-context entry: "[proposal]"
Conflicts with constitution.md#[Section]: "[quoted]"

I cannot write this entry — constitution overrides operational-context.

Options:
1. Drop the proposed entry.
2. If constitution is outdated: write a ratification proposal to human/decisions/ and pause.

Which would you prefer?
```

Do not write the entry. Stop.

### 2. Voice check

Every entry must be:
- **Imperative or prohibition** — "Do this." / "Do not do this." / "Prefer this." / "Avoid this."
- **Present tense** — describing how things are now, not how they were
- **One sentence** — one directive per line

Reject entries that contain:
- Past tense: "we used to", "historically", "we decided to", "last quarter" → route to `human/rationale/`
- Future tense speculation: "we plan to", "will eventually" → drop or route to `human/decisions/`
- Rationale or explanation beyond one clause: "because X" is acceptable; multi-sentence explanation belongs in `human/rationale/`
- Changelog or event description: "endpoint was added", "bug was fixed" → these are churn, not directives

```
Rejected entry: "[the entry]"
Reason: [past tense / future tense / rationale prose / changelog]
Route: [drop | human/rationale/<topic>.md | human/decisions/<slug>.md]
```

### 3. Evidence check

Every new entry must include a `file:line` citation (or CI config path) unless it is a constraint derived from an external policy (in which case: note the external source).

If evidence is missing:
```
Evidence required for new operational-context entry.
Entry: "[proposal]"
Please provide a file:line reference that demonstrates this directive in practice.
```

Do not write without evidence. Ask for it.

### 4. Section placement check

Each entry belongs in exactly one section. Validate placement:

| Section | Accepts |
|---|---|
| **Current Tech Stack** | Framework, runtime, service names + versions from manifests |
| **Active Patterns — Do This** | Hard imperative: must follow, no exceptions |
| **Active Anti-Patterns — Do Not Do This** | Hard prohibition: must never do |
| **Preferred Patterns — Prefer This When Choosing** | Soft preference: override with justification |
| **Patterns To Avoid — Avoid Unless Justified** | Soft avoidance: override with justification |
| **Current Known Constraints** | Active operational limits that must be respected now |
| **Currently Accepted Workflows** | Current process for branching, PRs, deploys, etc. |
| **Pending Deprecations** | Entries allowed now but scheduled for removal |
| **Last Debrief** | Single line — updated by debrief after every task |

If the entry is misplaced:
```
Placement issue: "[entry]" belongs in [correct section], not [proposed section].
Moving to [correct section]. Confirm?
```

## Write Procedure

1. Run pre-write checks (constitution conflict, voice, evidence, section placement).
2. Write the entry into the correct section.
3. Update the `## Last Debrief` line if this write is coming from a debrief:
   ```
   YYYY-MM-DD — task <slug> — [new rule | updated pattern | retired rule]
   ```
4. Confirm write:
   ```
   operational-context.md updated.
   Section: [section name]
   Change: [added | updated | retired] — "[one-line summary of directive]"
   ```

## Updating an Existing Entry

When a directive is being replaced or refined:

1. Read the existing entry aloud in the confirmation: "Replacing: [old text]"
2. If the old entry contained meaningful rationale, move it to `human/rationale/<topic>.md` via `update-human-log` before overwriting.
3. Write the new entry.
4. Confirm:
   ```
   Entry updated.
   Old: "[old text]"
   New: "[new text]"
   Old text moved to: human/rationale/<topic>.md (if applicable)
   ```

## Retiring an Entry

When a directive is no longer true:

1. Read the entry to be removed.
2. Write the removed text to `human/rationale/<topic>.md` via `update-human-log` with a note explaining the removal.
3. Remove the entry from `operational-context.md`.
4. Update `Last Debrief` with `retired rule`.
5. Confirm:
   ```
   Entry retired.
   Removed: "[old text]"
   Rationale archived at: human/rationale/<topic>.md
   ```

## Write Blockers (Stop and Surface)

| Blocker | Action |
|---|---|
| Constitutional conflict | Stop. Propose drop or constitutional amendment. |
| Past-tense language | Stop. Route to human/rationale/. |
| No evidence | Stop. Ask for file:line. |
| Clear section mismatch | Surface and confirm before moving. |
| Proposed entry is a restatement of an existing entry | Stop. Do not write. Report "no change — entry already exists at [section]." |

## Do Not

- Write to `operational-context.md` directly — always use this skill
- Write rationale, history, or multi-sentence explanations into any entry
- Allow a new entry that contradicts `constitution.md`
- Allow task instructions to trigger this skill during BUILD LOOP (only debrief or human may call it)
- Allow the same directive to appear in more than one section
