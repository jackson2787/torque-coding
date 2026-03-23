# Bootstrap Memory Bank

## Purpose

One-time cold start. Populate the scaffolded memory bank from repo code. No
human interaction — just scan, write, and flag gaps.

The memory bank files and directory structure already exist (created by
`torque-coding init`). This bootstrap fills them with evidence from the
codebase.

The canonical location is the hidden `.memory-bank/` directory. 
## Source And Install Path

- Template source path: `agent/bootstrap-memory-bank-contract.md`
- Installed target-repo path: `docs/memory-bank/bootstrap-memory-bank-contract.md`

## Rules

1. **Code is the only evidence.** Examine source code, configs, manifests,
   lockfiles, tests, CI files, schemas, migrations, and generated types. Do not
   read README files, docs, ADRs, or any other markdown as evidence.
2. **Use the memory bank skills for all writes.** Each document has an update
   skill under `.agent/skills/memory-bank/`. Use the correct skill for each
   file — it enforces the document's structure and validation rules.
3. **Prefer sparse truth over detailed fiction.** If the code does not prove
   something, do not write it. Mark gaps as `<!-- NEEDS CONFIRMATION -->` and
   move on.
4. **Do not ask the human anything.** Bootstrap is a machine operation. Flag
   what you cannot prove. The human uses `mb-rebase` to calibrate afterwards.
5. **Do not create files that do not already exist.** The scaffolding is already
   done. You are populating, not creating.

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

Build a mental evidence map. Classify everything as:

- **Observed**: directly provable from executable files
- **Inferred**: likely true but not explicit
- **Unknown**: cannot determine from code alone

### Step 2: Populate Foundation Documents

Write in this order. Use the corresponding memory bank skill for each file.

1. **`architecture.md`** — via `update-architecture` skill
   - Tech Stack: languages, frameworks, tooling, runtime, services (observed only)
   - Patterns: repeated architectural patterns (must appear 2+ times)
   - Rules: enforced conventions (provable from CI/lint/config only — do not invent rules)

2. **`projectBrief.md`** — via `update-project-brief` skill
   - What the project is, core objective, scope boundaries
   - Keep sparse. If the code cannot prove the mission, write what you can and
     flag the rest as `<!-- NEEDS CONFIRMATION -->`

3. **`productContext.md`** — via `update-product-context` skill
   - Users, jobs to be done, critical flows, priorities
   - This is the least provable file. Capture visible flows only. Everything
     else goes in `Pending Human Confirmation`

### Step 3: Populate Operational Documents

4. **`activeContext.md`** — via `update-active-context` skill
   - Current State: "Bootstrap complete. No active delivery task."
   - Progress: repo status, known gaps, pending confirmation count
   - Session Data: useful commands, entry points, and navigation hints
     discovered during the evidence sweep

5. **`toc.md`** — via `update-toc` skill
   - Reflect the current memory bank files

6. **`decisions.md`** — leave as scaffolded unless the code provides clear
   evidence of an architectural decision worth recording

### Step 4: Summary

Output a short summary:

```
BOOTSTRAP COMPLETE
- Files populated: [list]
- Observed facts: [count]
- Needs confirmation: [count]
- Next step: Run mb-rebase on each foundation document to calibrate with human
```

## Suggested Prompt

```text
Read docs/memory-bank/bootstrap-memory-bank-contract.md and execute it.
Examine the codebase — code, config, tests, manifests, CI, schemas, runtime
files. Do not read markdown or documentation as evidence. Use the memory bank
skills for all writes. If something is not provable from the repo, flag it and
move on. Do not ask me any questions during bootstrap.
```

## After Bootstrap

The memory bank now contains a code-backed first draft. To calibrate each
document with human knowledge, use the `mb-rebase` skill:

```text
mb-rebase projectBrief.md
mb-rebase productContext.md
mb-rebase architecture.md
```

This is where the human fills in gaps, corrects inferences, and confirms or
rejects what the bootstrap found.
