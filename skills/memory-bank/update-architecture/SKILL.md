---
name: update-architecture
description: Use when updating memory-bank/architecture.md. Enforces the three-section structure (Tech Stack, Patterns, Rules) with strict boundary rules. Triggered from DOCS state for pattern/tech/rule changes, or when a new architectural pattern, technology, or rule is discovered during any state.
metadata:
  author: uber-ai-workflow
  version: "1.0"
---

# Update Architecture

## Overview

This skill owns all writes to `memory-bank/architecture.md`. It enforces the
constitutional structure of the document — three sections with clear, immutable
boundaries. No agent may add, remove, or rename sections. Content must be placed
in the correct section based on its nature.

## What This Skill Owns

- All writes to `memory-bank/architecture.md`
- Enforcing section boundaries
- Validating content placement
- Preventing duplication across sections

## What This Skill Does Not Own

- Creating `architecture.md` from scratch (that is bootstrap)
- Deciding when to update (that is the AGENTS.md state machine)
- Reading `architecture.md` (agents read it directly during session startup)

## When To Use

Use this skill when any of the following are true:

- You are in the DOCS state and new patterns, rules, or tech stack changes were
  introduced during the completed task
- A new architectural pattern was discovered during BUILD or PLAN
- A new technology or external service was added to the repo
- A new enforceable rule was confirmed by the human
- An existing entry needs correction or deprecation

## Do Not Use When

- You are only reading `architecture.md` for context
- You are in bootstrap (use the bootstrap contract instead)
- You want to record a one-time decision (use `update-decisions` instead)
- You want to record task-specific work (use `update-task-docs` instead)

## Canonical Template

The document must always match this structure. Do not add, remove, or rename
sections. The HTML comments are part of the constitution and must be preserved.

```markdown
# Architecture

## Tech Stack
<!-- BOUNDARY: Factual technical context only. What the repo USES. No opinions, no patterns, no rules. -->
<!-- UPDATE TRIGGER: New dependency, new service, infrastructure change, runtime change. -->

- Languages, frameworks, and versions
- Repository structure and entry points
- Tooling and required commands (build, test, lint, deploy)
- Runtime and hosting
- External services visible in code or config

## Patterns
<!-- BOUNDARY: Repeated, intentional architectural patterns only. What the repo DOES REPEATEDLY. Not aspirational. Not one-offs. -->
<!-- UPDATE TRIGGER: Pattern discovered (must appear 2+ times in code) or pattern deprecated. -->

- Major layers and boundaries
- Data-flow patterns
- Integration patterns
- Reuse patterns that appear multiple times
- Legacy or transitional patterns (labeled explicitly)

## Rules
<!-- BOUNDARY: Enforceable local laws only. What the repo REQUIRES. Must be confirmed by human or provable from CI/lint/config. -->
<!-- UPDATE TRIGGER: Human confirms a new rule, or rule is retired. -->

- Mandatory local conventions
- Approved patterns already enforced in the repo
- Forbidden moves
- Tooling or workflow constraints
```

## Placement Test

Before writing any content, apply this test:

1. **Is it a fact about what the repo uses?** → Tech Stack
2. **Is it a repeated practice observed 2+ times in code?** → Patterns
3. **Is it a prohibition, mandate, or enforced convention?** → Rules
4. **Is it an opinion, aspiration, or one-off?** → It does not belong in this
   file. Stop.
5. **Is it a one-time architectural decision?** → It belongs in `decisions.md`,
   not here.

If you cannot clearly answer which section, do not write. Ask the human.

## Evidence Requirements

Each section has a minimum evidence bar. Do not write content that fails its bar.

| Section | Evidence Bar | Example |
|---------|-------------|---------|
| Tech Stack | Provable from code, config, or manifests | `package.json` lists React 18.2 |
| Patterns | Appears 2+ times in the codebase | Event-driven pattern used in `auth.ts`, `billing.ts`, `notifications.ts` |
| Rules | Human-confirmed OR enforced by CI/lint/config | ESLint rule enforces no-unused-vars; human confirmed "no business logic in routes" |

## Write Procedure

Follow these steps exactly. Do not skip steps.

### Step 1: Read Current File

Read `memory-bank/architecture.md` in full. Confirm the three-section structure
is intact. If the structure is damaged, repair it before making content changes.

### Step 2: Identify Target Section

For each piece of content you intend to write, apply the Placement Test above.
Record which section each item belongs to.

### Step 3: Check For Duplicates

Search all three sections for existing entries that cover the same topic. If an
entry already exists:

- If the existing entry is accurate, do not add a duplicate.
- If the existing entry is outdated, update it in place.
- If the existing entry is in the wrong section, move it to the correct section
  and note the move.

### Step 4: Check Cross-Section Duplication

A single topic should appear in at most one section. For example:

- "We use PostgreSQL" → Tech Stack only
- "All database access goes through a bridge function" → Patterns only
- "Never use raw SQL in route handlers" → Rules only

These three statements are related but distinct in nature. Each goes in exactly
one section. If you find yourself writing the same concept in two sections, you
are duplicating. Pick the one that matches the content's nature.

### Step 5: Write The Update

Add new entries or update existing entries within the correct section. Use this
format for new entries:

```markdown
### [Entry Name]
**Context**: Discovered during [task] | Confirmed by [human/CI/code evidence]
**Detail**: [description]
**Evidence**: `file.ext:line-range` or [proof source]
```

### Step 6: Validate

Before saving, confirm:

- [ ] The three-section structure is intact (no sections added, removed, or renamed)
- [ ] All HTML boundary comments are preserved
- [ ] Each new entry is in the correct section per the Placement Test
- [ ] No content is duplicated across sections
- [ ] Each entry meets its section's evidence bar
- [ ] No opinions, aspirations, or one-offs are included

If any check fails, fix it before saving.

## Red Flags — Stop And Do Not Write

- Adding a fourth section or subsection at the top level
- Putting opinions or aspirations anywhere in the file
- Adding a pattern that appears only once in the codebase
- Adding a rule that no human has confirmed and no CI/lint enforces
- Duplicating the same concept across Tech Stack and Patterns
- Rewriting the entire file when only one entry changed
- Removing the HTML boundary comments

## Deprecation Protocol

When a technology, pattern, or rule is no longer active:

- Do not delete the entry
- Add `[DEPRECATED YYYY-MM-DD]` prefix to the entry name
- Add a one-line reason: "Replaced by X" or "No longer enforced"
- Move deprecated entries to the bottom of their section

## Exit Condition

This skill is complete when:

- The target content has been written to the correct section
- The validation checklist passes
- No structural damage has been introduced
- The file is saved

Return control to the calling state (typically DOCS).
