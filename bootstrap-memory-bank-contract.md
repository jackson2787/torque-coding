# Bootstrap Memory Bank

## Purpose

One-time cold start for `.memory-bank-v2/`. Populate `machine/constitution.md` and `machine/operational-context.md` from repo code, and seed `machine/limits.md` with defaults. No human interaction — scan, write, flag gaps.

The `.memory-bank-v2/` directory and its subdirectories must already exist before running this bootstrap. The bootstrap populates, it does not scaffold.

## Source and Install Path

- Template source: `bootstrap-memory-bank-contract.md`
- Installed target-repo path: `docs/memory-bank/bootstrap-memory-bank-contract.md`

---

## Rules

1. **Code is the only evidence.** Examine source code, configs, manifests, lockfiles, tests, CI files, schemas, migrations, and generated types. Do not read README files, docs, ADRs, or any other markdown as evidence.
2. **Use the memory-bank skills for all writes.** Each document has an update skill under `skills/memory-bank/`. Never write directly.
3. **Prefer sparse truth over detailed fiction.** If the code does not prove something, do not write it. Mark gaps as `<!-- NEEDS CONFIRMATION -->` and move on.
4. **Do not ask the human anything.** Bootstrap is a machine operation. Flag what you cannot prove. The human uses `mb-rebase` to calibrate afterwards.
5. **Do not create files that do not already exist.** The scaffolding is already done. You are populating, not creating.

---

## Populating constitution.md vs. operational-context.md

Before writing, classify each candidate fact:

| Question | Yes → where it goes | No → skip or move on |
|---|---|---|
| Is this true now AND likely to remain true for the foreseeable future? | Could be constitution or operational-context | Definitely not constitution |
| Is this a domain definition, security boundary, or fundamental scope constraint? | → `constitution.md` | → `operational-context.md` or skip |
| Is this a current pattern, workflow, or technology choice that may evolve? | → `operational-context.md` | → skip (if not yet established) |
| Can you point to a `file:line` or CI config that proves it? | → include it | → mark `<!-- NEEDS CONFIRMATION -->` |

### What belongs in constitution.md during bootstrap

- The project's identity and core objective (provable from entry points, manifests, public API shape)
- Hard scope boundaries (what is explicitly excluded from the system)
- Domain term definitions found consistently in the codebase (entities, vocabularies)
- Durable architectural laws enforced by CI, linters, or consistent structural patterns
- Security constraints visible in auth middleware, RLS policies, or API boundaries

### What belongs in operational-context.md during bootstrap

- Current tech stack (frameworks, runtimes, services — from manifests and imports)
- Patterns used in 2+ places in the codebase
- CI-enforced or linter-enforced rules that reflect current practice
- Conventions visible in file structure, naming, or test organisation

---

## Procedure

### Step 1: Evidence Sweep

Scan the repository. Focus on:

- Entry points and application boundaries
- Package manifests and lockfiles
- Framework, lint, test, and type configs
- Routes, handlers, services, stores, data-access layers
- Auth, billing, onboarding, and integration flows
- CI workflows and deployment files
- Migrations, schemas, SQL, generated types

Build a mental evidence map. Classify each item:

- **Observed**: directly provable from executable files
- **Inferred**: likely true but not explicit
- **Unknown**: cannot determine from code alone

### Step 2: Populate constitution.md

Use `skills/memory-bank/update-constitution/SKILL.md`.

**Do not require the `ratified` keyword during bootstrap** — this is the machine's initial write. Mark every entry as `<!-- BOOTSTRAP: unratified -->`. The human will ratify or reject during their first `mb-rebase` pass.

Sections to populate:

1. **Identity** — what this project is (1 paragraph from manifests, entry points)
2. **Core Objective** — why it exists (1-2 sentences)
3. **Scope Boundaries** — In Scope / Out of Scope (provable from API surface and what is explicitly absent)
4. **Domain Definitions** — key terms used consistently across the codebase
5. **Durable Architectural Rules** — only if enforced by CI/lint/structure (2+ instances)
6. **Security & Compliance Boundaries** — auth patterns, data handling rules visible in code
7. **Change Log** — append `[BOOTSTRAP: YYYY-MM-DD] Initial machine-generated draft. All entries unratified.`

### Step 3: Populate operational-context.md

Use `skills/memory-bank/update-operational-context/SKILL.md`.

The operational-context skill requires `file:line` evidence for each entry. Provide it.

Sections to populate:

1. **Current Tech Stack** — from manifests and imports (provable)
2. **Active Patterns — Do This** — patterns found in 2+ locations
3. **Active Anti-Patterns — Do Not Do This** — explicit linter rules or CI failures
4. **Preferred Patterns** — softer preferences visible in majority of implementations
5. **Patterns To Avoid** — visible in comments, linter warnings, or deprecated paths
6. **Current Known Constraints** — test config, CI limits, environment specifics
7. **Currently Accepted Workflows** — branch naming, PR process (if in CI config)
8. **Last Debrief** — `[BOOTSTRAP: YYYY-MM-DD] Initial machine-generated draft.`

Leave empty sections as commented placeholders rather than inventing entries.

### Step 4: Seed limits.md

Copy the template `templates/machine/limits.md` to `.memory-bank-v2/machine/limits.md` verbatim. Do not tune values during bootstrap — the defaults target a mid-tier developer plan and are correct as a starting point.

The human adjusts `limits.md` directly as their tier or project scale changes; it requires no skill ceremony.

### Step 5: Populate activeContext.md and toc.md

Use the memory-bank update skills:

- `skills/memory-bank/update-active-context/SKILL.md` → Current State: "Bootstrap complete. No active task."
- `skills/memory-bank/update-toc/SKILL.md` → Reflect both `machine/` and `human/` halves (including `limits.md`)

### Step 6: Summary

Output:

```
BOOTSTRAP COMPLETE

Files populated:
  - .memory-bank-v2/machine/constitution.md
  - .memory-bank-v2/machine/operational-context.md
  - .memory-bank-v2/machine/limits.md              (default budgets + ladder)
  - .memory-bank-v2/machine/activeContext.md
  - .memory-bank-v2/machine/toc.md

Constitution entries:    [n observed] + [n needs confirmation]
Operational entries:     [n observed] + [n needs confirmation]
Limits:                  default template (tune in limits.md if needed)

Next step: Run mb-rebase on constitution.md and operational-context.md
           to ratify bootstrap entries with human confirmation.
```

---

## Suggested Prompt

```text
Read bootstrap-memory-bank-contract.md and execute it.
Examine the codebase — code, config, tests, manifests, CI, schemas, runtime files.
Do not read markdown or documentation as evidence.
Use the memory-bank skills for all writes.
If something is not provable from the repo, flag it <!-- NEEDS CONFIRMATION --> and move on.
Do not ask me any questions during bootstrap.
```

---

## After Bootstrap

The memory bank now contains a code-backed first draft with all entries marked as unratified. To calibrate with human knowledge:

```text
mb-rebase constitution.md
mb-rebase operational-context.md
```

During rebase, the human ratifies or rejects each bootstrap entry. Ratified entries in `constitution.md` get the `ratified` keyword logged; unratified entries are removed or moved to `human/rationale/`.
