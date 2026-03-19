# Bootstrap Memory Bank Contract

## Purpose

Use this contract once, immediately after installing `AGENTS.md` into a target
repository, or later when deliberately recalibrating the foundational Memory
Bank files.

This contract is for bootstrap only. It does not replace the installed
`AGENTS.md` state machine for normal work.

## Source And Install Path

- Template source path: `agent/bootstrap-memory-bank-contract.md`
- Installed target-repo path: `.agent/bootstrap-memory-bank-contract.md`

## Required Outcome

Create or refresh a trustworthy AGENTS 2.2 Memory Bank for the target repo.

At minimum, create or update these foundation files:

- `memory-bank/projectbrief.md`
- `memory-bank/productContext.md`
- `memory-bank/techContext.md`
- `memory-bank/systemPatterns.md`
- `memory-bank/projectRules.md`

If they do not already exist, also scaffold these operational files so the repo
can start using the Memory Bank immediately:

- `memory-bank/toc.md`
- `memory-bank/activeContext.md`
- `memory-bank/progress.md`
- `memory-bank/decisions.md`
- `memory-bank/quick-start.md`
- `memory-bank/tasks/YYYY-MM/README.md`

Only create additional files such as `build-deployment.md`,
`database-schema.md`, or `testing-patterns.md` if the repository provides strong
direct evidence for them and the added file would clearly improve future
sessions.

## Non-Negotiables

- Examine source code, folder structure, manifests, lockfiles, configs, tests,
  CI files, deployment files, schemas, generated types, and migrations as the
  primary evidence base.
- During the primary evidence sweep, do not use README files or other prose as
  grounding truth.
- Prose may be consulted later only to resolve ambiguity or generate questions.
- Separate `Observed`, `Inferred`, and `Needs confirmation`.
- Never turn weak guesses into Memory Bank facts.
- Prefer sparse truth over detailed fiction.
- If a Memory Bank file already exists, revise it carefully. Do not overwrite
  confirmed local truth blindly.
- Do not create a Memory Bank in this template repository. This contract is for
  an installed target repo.

## Preflight

1. Confirm you are operating in the target repository, not the template repo.
2. Read the installed `AGENTS.md`.
3. Inspect any existing `memory-bank/` files before changing them.
4. Check whether an installed domain pack includes a bootstrap map or similar
   repo-grounding reference. Example:
   `.agent/skills/backend-architect-supabase-hono/references/memory-bank-bootstrap-map.md`

## Phase 1: Primary Evidence Sweep

Inspect the repository directly before writing anything:

- entry points and application boundaries
- package manifests and lockfiles
- framework, lint, test, and type configs
- routes, screens, handlers, services, stores, and data-access layers
- auth, billing, onboarding, and external integration flows
- CI workflows and deployment files
- migrations, schemas, SQL, generated types, and infrastructure definitions

Build an evidence notebook with three buckets:

- `Observed`: directly supported by executable project files
- `Inferred`: likely true from repo evidence, but not explicit
- `Needs confirmation`: product intent, user context, local law, or any
  high-impact assumption the repo cannot prove

## Phase 2: Draft In This Order

For a code-first bootstrap, draft the foundation documents in this order:

1. `techContext.md`
2. `systemPatterns.md`
3. `projectbrief.md`
4. `productContext.md`
5. `projectRules.md`

### `techContext.md`

Capture factual technical context:

- languages and frameworks
- repository structure
- tooling and required commands
- runtime and hosting clues
- external services visible in code or config

Ask the human only for what the repo cannot prove, such as the real production
hosting target, the standard package manager when multiple lockfiles exist, or
hidden external services not yet represented in code.

### `systemPatterns.md`

Capture repeated, intentional architectural patterns:

- major layers and boundaries
- data-flow patterns
- integration patterns
- reuse patterns that appear multiple times
- legacy or transitional patterns that should be named explicitly

Do not promote one-off implementation details, dead folders, or aspirational
architecture to documented standards.

### `projectbrief.md`

Capture the stable identity and mission of the repository:

- what the project is
- the core objective it appears to serve
- clear scope boundaries
- practical success signals

Never invent mission statements, business models, or roadmap direction from
code alone. If the repo cannot prove the product identity or audience, keep the
file intentionally sparse and add a clearly labeled confirmation section.

### `productContext.md`

Capture user and product context:

- primary users or operators
- jobs to be done
- critical flows visible in the product
- product priorities and tradeoffs

This file is the least repo-provable. Visible flows may support careful
inference, but user segments, pain points, and value claims should remain in a
`Pending Human Confirmation` section unless the human confirms them.

### `projectRules.md`

Capture stable local laws for future agents:

- mandatory local conventions
- approved patterns already enforced in the repo
- forbidden moves
- tooling or workflow constraints

Only record rules that are clearly enforced, repeated, or explicitly confirmed.
Do not copy generic framework advice or rules already covered by `AGENTS.md`.

## Phase 3: Present One Consolidated Bootstrap Review

Before finalizing the Memory Bank, present one consolidated review that covers
all five foundation documents.

Use this shape:

```markdown
## Proposed Memory Bank Bootstrap

### `techContext.md`
- Observed: ...
- Inferred: ...
- Needs confirmation: ...

### `systemPatterns.md`
- Observed: ...
- Inferred: ...
- Needs confirmation: ...

### `projectbrief.md`
- Observed: ...
- Inferred: ...
- Needs confirmation: ...

### `productContext.md`
- Observed: ...
- Inferred: ...
- Needs confirmation: ...

### `projectRules.md`
- Observed: ...
- Inferred: ...
- Needs confirmation: ...

## Consolidated Questions
1. ...
2. ...
```

If the human is available, stop for one correction pass here.

If the human explicitly asked for a one-shot scaffold or does not respond, keep
going with these rules:

- finalize high-confidence technical facts
- keep uncertain human-driven content in `Pending Human Confirmation`
- do not upgrade inference into canonical truth just to make the files look
  complete

## Phase 4: Finalize The Foundation Files

When writing the files:

- keep each file scoped to its own purpose
- avoid duplicating the same content across multiple documents
- keep confirmed facts in the main body
- isolate unconfirmed assumptions in a clearly labeled section

## Phase 5: Create The Operational Scaffolding

After the foundation files are written, create any missing operational files:

- `toc.md`: list the current Memory Bank files and their purpose
- `activeContext.md`: note that bootstrap is complete, record the current state
  as "no active delivery task," and capture any pending confirmation items
- `progress.md`: summarize current repo status, known gaps, and near-term focus
- `decisions.md`: add a placeholder note if no real architectural decisions were
  confirmed during bootstrap
- `quick-start.md`: capture the most useful commands, entry points, and
  navigation hints discovered during the evidence sweep
- `tasks/YYYY-MM/README.md`: add a bootstrap entry summarizing what was created
  and what still needs confirmation

Do not create a dated task document unless the user explicitly wants task-level
bootstrap documentation.

## Finish

End with a concise summary of:

- what was confirmed from repo evidence
- what remained inferred
- what still needs human confirmation
- which files were created or refreshed

## Suggested Prompt

```text
Read `.agent/bootstrap-memory-bank-contract.md` and execute it.
Use code, config, tests, manifests, CI, schemas, and runtime files as primary
evidence. Do not use README files or other prose as grounding truth during the
primary sweep. If something is not provable from the repo, keep it in a clearly
labeled pending-confirmation section instead of inventing it.
```
