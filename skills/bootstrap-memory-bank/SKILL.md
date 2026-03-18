---
name: bootstrap-memory-bank
description: Use during Day 1 repository bootstrap or a deliberate Memory Bank refresh when creating or recalibrating foundational memory-bank documents such as `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, and `projectRules.md`. Helps inspect repo evidence, separate facts from assumptions, and ask the human for corrections and confirmation before writing each document.
---

# Bootstrap Memory Bank

## Overview

This is a setup-only helper for producing trustworthy Memory Bank foundation
documents. Its job is not to guess more confidently; its job is to combine
repo evidence with explicit human confirmation so later sessions can treat the
Memory Bank as reliable grounding truth.

## Scope

Use this skill only when creating or recalibrating these files:

- `memory-bank/projectbrief.md`
- `memory-bank/productContext.md`
- `memory-bank/systemPatterns.md`
- `memory-bank/techContext.md`
- `memory-bank/projectRules.md`

This skill is for bootstrap or re-grounding work. It is not a normal runtime
coding skill and it does not replace the `AGENTS.md` state machine.

## Non-Negotiables

- Work on one target document at a time.
- Load only the reference file for the document currently being worked on.
- Separate observed facts, reasonable inferences, and unanswered questions.
- Present findings to the human before writing the target file.
- Ask for confirmation or correction before writing or overwriting any
  foundation document.
- If a target file already exists, compare and revise it carefully. Do not
  overwrite blindly.
- Do not treat README prose or marketing copy as the primary source of truth.
- Do not turn weak guesses into Memory Bank "facts".

## What This Skill Does Not Do

- It does not own `PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY -> DOCS`.
- It does not generate app code.
- It does not write all five documents in one uninterrupted pass.
- It does not invent business intent, architecture, or local laws without
  human confirmation.

## Recommended Document Order

Default order:

1. `projectbrief.md`
2. `productContext.md`
3. `techContext.md`
4. `systemPatterns.md`
5. `projectRules.md`

This order moves from mission and product intent toward technical and local
implementation constraints. If the user wants a technical-first pass, it is
acceptable to start with `techContext.md` and `systemPatterns.md`.

## Workflow

### 1. Choose One Target Document

Pick exactly one of the five Memory Bank foundation documents.

Read only the matching reference file:

- `projectbrief.md` -> `references/projectbrief.md`
- `productContext.md` -> `references/product-context.md`
- `techContext.md` -> `references/tech-context.md`
- `systemPatterns.md` -> `references/system-patterns.md`
- `projectRules.md` -> `references/project-rules.md`

If an installed domain skill ships a stack-specific Memory Bank bootstrap
reference that is relevant to the current repo, load that alongside the generic
document reference.

Example:

- `.agent/skills/backend-architect-supabase-hono/references/memory-bank-bootstrap-map.md`

Do not load all five references at once unless the user explicitly asks for a
full design exercise.

### 2. Build Evidence Before Drafting

Inspect the repository directly before making claims.

Evidence should come from:

- source code and folder structure
- package manifests and lockfiles
- configuration files
- test files
- CI and deployment files
- generated types, schemas, or migrations where relevant

Use README files and other prose only as supporting evidence.

### 3. Classify What You Found

For every important statement, decide which bucket it belongs in:

- `Observed`: directly supported by code, config, or executable project files
- `Inferred`: likely true from repo evidence, but not explicit
- `Needs confirmation`: user intent, product strategy, stable local law, or any
  high-impact assumption

Never blur these categories together.

### 4. Present Before Writing

Before editing the target Memory Bank file, present:

```markdown
## Proposed `memory-bank/<target-file>`

**Observed**
- [fact from repo]

**Inferred**
- [best-guess interpretation]

**Needs confirmation**
- [question or uncertainty]

**Suggested additions or corrections**
1. [question]
2. [question]

**Proposed structure**
- [section]
- [section]
```

Then stop and wait for the human.

### 5. Revise With Human Input

When the user responds:

- keep confirmed statements
- correct mistaken assumptions
- add missing business or architectural context
- remove anything the user says is legacy, accidental, or non-authoritative

If the user gives partial answers, revise only the confirmed areas and keep the
remaining uncertainties visible.

### 6. Write The File

Only after the human confirms the document direction:

- create or update the target Memory Bank file
- keep the content scoped to that document's purpose
- avoid duplicating content better owned by a different Memory Bank file

### 7. Close The Document Before Moving On

After writing the file, summarize:

- what was confirmed by the user
- what remained inferred but accepted
- any unresolved questions to carry into the next document

Then move to the next Memory Bank document only if the user wants to continue.

## Quality Bar

A good foundation document produced with this skill:

- reflects both repo evidence and human intent
- makes uncertainty explicit instead of hiding it
- is scoped correctly for its file
- avoids generic filler
- becomes safe for later sessions to rely on as grounding truth

## Red Flags

Stop and restart the current document if you catch any of these:

- writing all five documents from private inference without user checkpoints
- using README prose as the main evidence source
- turning one-off implementation quirks into `projectRules.md`
- documenting aspirational architecture in `systemPatterns.md` that is not
  actually present or intentionally approved
- inventing product goals, users, or business constraints from code alone
- copying the same content into multiple Memory Bank files

## References

Use these references one at a time:

- `references/projectbrief.md`
- `references/product-context.md`
- `references/tech-context.md`
- `references/system-patterns.md`
- `references/project-rules.md`

Also load any relevant domain bootstrap reference when the repo has one.
