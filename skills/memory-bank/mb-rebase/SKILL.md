---
name: mb-rebase
description: >-
  Long-term pruning and consolidation of operational-context.md. User-invoked
  when the document has grown stale or redundant over many debriefs. Applies
  a three-category rubric: merge near-duplicates, retire outdated entries (moved
  to human/rationale/), remove narrative leak (prescriptive kernel stays). All
  proposed changes are shown to the human before any write. Never silently drops
  a directive.
metadata:
  author: torque-coding
  version: "1.0"
  memory-bank: v2
  target-file: .memory-bank-v2/machine/operational-context.md
---

# mb-rebase

## Overview

Over months of debriefs, `operational-context.md` accumulates directives. The debrief five-gate rubric keeps churn low, but no rubric eliminates all noise indefinitely. `mb-rebase` is the periodic maintenance pass: it reads the full document and applies a rubric to identify what should be merged, what is no longer true, and what has drifted from prescriptive into retrospective voice.

**This skill is not part of the task lifecycle.** It is not called by debrief; it is not called automatically. The human invokes it when they feel the document needs pruning. Typically this is every few months, or when the document starts to exceed ~40 directives.

**No directive is ever silently deleted.** Every retirement is a move to `human/rationale/`. If in doubt, leave it.

## When to Use

- Human notices near-duplicate directives (two entries saying the same thing in different words)
- Human notices entries that describe how things used to work, not how they work now
- Retrospective language has crept in ("we used to", "historically", "after the refactor")
- The document has grown long enough that contradictions have appeared between sections
- Human explicitly invokes "mb-rebase", "rebase operational-context", or "prune the memory bank"

## When NOT to Use

- During task execution — operational-context changes happen via debrief, not rebase
- Immediately after bootstrap — the document is new and does not need pruning
- As a substitute for debrief — debrief proposes directives after a task; rebase consolidates existing ones
- When the human wants to add a new directive — use `update-operational-context` for that

## Three-Category Rubric

Apply this rubric to every directive in the document. A directive may qualify for multiple categories — apply the strictest that fits.

### Category 1 — Merge (near-duplicates)

**Criterion**: two or more directives that express the same intent in different words, or where one directive is a strict subset of another.

**Test**: if you removed directive A and a future agent read only directive B, would they understand the intent of A? If yes: merge.

**How to merge**: keep the stricter or more specific of the two. If neither is clearly stricter, write a new directive that synthesises both and present it as the merge candidate.

**Example**:
```
Existing: "Route all HTTP calls through src/lib/http-client.ts."
Existing: "Do not use fetch() directly — use the http-client wrapper."
→ Merge: "Route all HTTP calls through src/lib/http-client.ts. Do not use fetch() directly."
```

### Category 2 — Retire (outdated)

**Criterion**: a directive that is no longer true — the codebase does the opposite, or the constraint has been lifted.

**Evidence required**: a `file:line` in the current codebase that contradicts the directive, OR an explicit statement from the human that the constraint no longer applies.

**What happens**: the directive is moved to `human/rationale/<topic>.md` via `update-human-log`, with a note explaining why it was retired and when. It is removed from `operational-context.md`.

**What does NOT qualify**: suspicion that a directive might be outdated. Retirement requires evidence. When in doubt, leave it.

### Category 3 — Move to rationale (narrative leak)

**Criterion**: a directive that has accumulated retrospective prose — it contains "because", "after we decided", "historically", "since the refactor", or other explanatory language that describes the past rather than the current state.

**What happens**: extract the prescriptive kernel (the imperative directive) and keep it in `operational-context.md`. Move the explanatory prose to `human/rationale/<topic>.md`.

**Example**:
```
Before: "Prefer server components. We switched to this after the 2024 performance audit revealed client components were causing hydration delays."
After (in operational-context.md): "Prefer server components over client components unless interactivity is required."
After (in human/rationale/server-components.md): "We prefer server components because the 2024 performance audit revealed client components caused hydration delays. See human/decisions/2024/..."
```

## Procedure

1. **Read `operational-context.md` in full.** Count the total number of directives.
2. **Optionally read `human/rationale/INDEX.md`** to understand what rationale files already exist. This avoids creating duplicate rationale entries.
3. **Apply the rubric.** Produce a candidate list — one entry per proposed change:
   ```
   Category: [Merge | Retire | Move to rationale]
   Original: "[exact directive text]"
   Also merging with: "[second directive]" (Merge category only)
   Proposed action: "[new text | move to human/rationale/<topic>.md]"
   Evidence: [file:line for Retire | prose quote for Move to rationale]
   ```
4. **Present all candidates to the human before any write:**
   ```
   mb-rebase: operational-context.md analysis
   
   Total directives scanned: [n]
   Candidates: [n] total — [n] merges, [n] retirements, [n] narrative moves
   
   [List each candidate with category, original text, proposed action]
   
   Reply with:
   - "apply all" to apply every candidate
   - "apply [N, M, ...]" to apply specific items by number
   - "skip [N, M, ...]" to exclude specific items
   - "cancel" to apply nothing
   ```
5. **Apply only the approved items.** For each approved item:
   - **Merge**: call `update-operational-context` to replace the two originals with the merged directive
   - **Retire**: call `update-human-log` (kind: rationale) to write the retired directive to `human/rationale/<topic>.md`; then call `update-operational-context` to remove the entry
   - **Move to rationale**: call `update-human-log` to write the prose; then call `update-operational-context` to replace the entry with the extracted prescriptive kernel

## Output Contract

```
mb-rebase complete.
Directives before: [n]
Changes applied: [n] merges, [n] retirements, [n] narrative moves
Directives after: [n]

Rationale files written: [list of human/rationale/<topic>.md paths]
```

## What This Skill Does NOT Do

- Does NOT write without showing the human the full candidate list first
- Does NOT delete any directive — every retirement is a move to `human/rationale/`
- Does NOT touch `constitution.md` — constitutional implications route through debrief to `human/decisions/`
- Does NOT run during task execution
- Does NOT add new directives — `update-operational-context` handles additions
- Does NOT apply changes from a previous session without re-presenting the candidate list

## Write Blockers

| Blocker | Action |
|---|---|
| Human has not confirmed which items to apply | Stop. Do not write. |
| Any proposed change would delete text rather than move it | Stop. Reclassify as Retire (move to rationale). |
| Retirement lacks evidence (file:line or explicit human statement) | Flag as unevidenced. Do not retire. Leave the directive in place and note it in the report. |
