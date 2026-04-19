---
name: update-constitution
description: >-
  Writes to constitution.md in the memory bank. Enforces the highest-authority
  document's structural rules and ratification requirements. Requires the human to
  have said "ratified" in the current approving message. Never called from task work
  or debrief — only called via explicit human ratification ceremonies or bootstrap.
metadata:
  author: torque-coding
  version: "2.0"
  memory-bank: v2
  target-file: .memory-bank-v2/machine/constitution.md
---

# update-constitution

## Overview

`constitution.md` is the highest-authority machine memory document. It is difficult to change by design. This skill enforces that difficulty.

Do not call this skill from task work. Do not call this skill from the debrief phase. Only call it when:
1. The human has explicitly ratified a constitutional change by saying the word "ratified" in their message.
2. Bootstrap is populating the file for the first time (all entries marked as unratified).

## When to Use

- Human has reviewed a `human/decisions/YYYY/<slug>.md` proposal and responded with "ratified"
- Bootstrap cold-start (first-time population of `constitution.md`)

## When NOT to Use

- During task execution (BUILD LOOP)
- During debrief (debrief routes constitutional implications to `human/decisions/` — never writes here)
- When there is no explicit human ratification
- When the change contradicts an existing constitution entry without a prior amendment proposal

## Ratification Check

Before writing, perform the ratification check:

1. **Scan the current human message** for the word `ratified` (case-insensitive).
2. If found: proceed.
3. If not found:
   ```
   I cannot write to constitution.md without explicit ratification.

   To ratify a constitutional change:
   1. Review the proposal in human/decisions/YYYY/YYYY-MM-DD-<slug>.md.
   2. Respond with "ratified" in your message if you approve.

   Current message does not contain "ratified". Write blocked.
   ```
4. **Exception — bootstrap only**: Ratification check is bypassed during bootstrap. All entries are marked `<!-- BOOTSTRAP: unratified -->` and require subsequent human ratification.

## Validation Rules

Before writing any entry, validate:

1. **Section check**: Every entry must be placed in the correct section. The sections are:
   - Identity
   - Core Objective
   - Scope Boundaries (In Scope / Out of Scope)
   - Domain Definitions
   - Durable Architectural Rules
   - Security & Compliance Boundaries
   - Authority Over Other Memory
   - Change Log

2. **Timelessness check**: Reject entries that contain:
   - Future tense speculation ("will", "should eventually")
   - Version-specific details that may change ("using React 18" → belongs in operational-context)
   - Implementation details (how something is done, not what it is)
   - Historical narrative ("we decided to", "after considering")
   If the entry contains these: stop, explain, and route appropriately.

3. **Conflict check**: Read all existing entries in the target section. If the proposed entry contradicts an existing entry:
   ```
   Conflict detected in constitution.md#[Section]:
   Existing: "[quoted entry]"
   Proposed: "[quoted proposal]"

   Constitutional entries cannot contradict each other.
   To resolve: either the existing entry is wrong (amend it via a new ratified decision)
   or the proposed entry is wrong (drop it or route elsewhere).

   Which resolution would you prefer?
   ```

4. **Evidence check** (for Durable Architectural Rules only): A `file:line` or CI config citation is required. Reject without it.

## Write Procedure

1. Run ratification check.
2. Run validation (timelessness, conflict, evidence as applicable).
3. Write the entry into the correct section.
4. Append to Change Log:
   ```
   YYYY-MM-DD: [one-line description of what changed]. Ratified by [human name, or "bootstrap" if applicable].
   ```
5. Confirm write:
   ```
   constitution.md updated.
   Section: [section name]
   Entry: "[one-line summary]"
   Change Log: appended.
   ```

## Write Blockers (Stop and Surface)

Stop writing and surface to the human if:

- "ratified" not in current message (non-bootstrap)
- Proposed entry uses past tense or historical framing
- Proposed entry contradicts an existing entry
- Evidence missing for a Durable Architectural Rule
- Proposed entry clearly belongs in `operational-context.md` (current pattern rather than timeless truth)

## What Belongs in Each Section

| Section | Accepts | Rejects |
|---|---|---|
| **Identity** | What the project is (1 paragraph) | Implementation details, aspirational statements |
| **Core Objective** | Why it exists (1-2 sentences) | How it achieves the objective |
| **Scope Boundaries** | Hard in/out boundaries | Soft preferences, implementation choices |
| **Domain Definitions** | Precise term definitions used consistently | Jargon not used in code, informal descriptions |
| **Durable Architectural Rules** | Rules with CI/lint/structural evidence | Patterns (→ operational-context), preferences (→ operational-context) |
| **Security & Compliance Boundaries** | Non-negotiable security constraints | Recommended practices (→ operational-context) |

## Do Not

- Write to `constitution.md` directly — always use this skill
- Write historical narrative or rationale into the constitution — that belongs in `human/decisions/`
- Skip the Change Log append — it is required on every write
- Bypass the ratification check outside of bootstrap
