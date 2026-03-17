# agent-engineering-playbook

This repository is an opinionated synthesis of proven agent-workflow, frontend, mobile, and backend engineering practices.
Its value is not in claiming wholly novel ideas, but in combining strong prior art into a practical, disciplined system for AI-assisted software delivery.

- Version: aligned with `AGENTS.md` 2.2 (2025-03-04)
- Compatibility: Claude, Cursor, Copilot, Cline, Aider, Codex, and other `AGENTS.md`-compatible tools
- Status: template repo for bootstrapping an AGENT-ZERO-style operating model plus complementary skill packs

---

## What This Repo Actually Is

This repo bootstraps **two interconnected systems** into a real project repository:

1. **The operating model**: `AGENTS.md`
   This is the primary source of truth for how the agent should work. It defines the state machine, approval gates, Memory Bank behavior, task contracts, compaction protocol, and documentation discipline.

2. **The capability layer**: the skill packs
   These complement `AGENTS.md` with reusable, domain-specific guidance for planning, debugging, frontend work, mobile work, backend work, verification, and documentation.

There is also an optional third layer:

3. **The local project layer**: generated project-specific skills
   The files in `dynamic-skills/` are setup prompts that help an AI generate repo-specific skills such as local architecture rules, security constraints, and deployment conventions. These are not runtime skills themselves.

There is also an optional fourth layer:

4. **The optional workflow layer**: installable workflow packages
   The files in `optional-workflows/` are small, self-contained packages that add
   human-invoked IDE workflows plus any supporting project resources those
   workflows need. These are installed into a target repo by following the
   package-local `README.md`.

The right way to think about this repo is:

- `AGENTS.md` is the operating system
- the reusable skill packs are the extensions that sharpen and specialize it
- generated project-specific skills are local wiring and non-negotiables for one concrete repo
- optional workflows are installable add-ons for repo-specific IDE workflows

---

## Source Of Truth

The upstream conceptual source of truth for the operating model is **AGENT-ZERO**:

- Upstream repo: [msitarzewski/AGENT-ZERO](https://github.com/msitarzewski/AGENT-ZERO)
- Upstream README: [AGENT-ZERO README](https://github.com/msitarzewski/AGENT-ZERO/blob/main/README.md)

In this repository:

- `AGENTS.md` is the canonical operating guide the agent should follow inside a target repo
- the skill packs are intentionally subordinate to that operating guide
- the generated project-specific skills are subordinate to both the operating guide and the universal skill packs

If you need an authority order, use this:

1. `AGENTS.md`
2. Universal skill packs in `.agent/skills/`
3. Generated project-specific skills in `.agent/skills/project-*/`

Project-specific skills should **complement** the universal skills by defining local wiring and stack-specific constraints. They should not replace the higher-order workflow, approval model, or architectural discipline defined by `AGENTS.md`.

---

## Why This Repo Exists

AGENT-ZERO already provides a strong operating framework for high-quality, AI-assisted software delivery:

- reuse over creation
- approval gates
- architecture-first planning
- high-signal context via the Memory Bank
- repeatable, auditable execution through a state machine

This repository builds on top of that operating model by packaging the parts that are usually missing in real projects:

- reusable planning, debugging, QA, and documentation skills
- frontend web skill packs
- frontend mobile skill packs
- backend skill packs
- setup prompts for generating project-specific local rules

In short:

- **AGENT-ZERO gives the workflow discipline**
- **this repo adds the reusable capability packs that turbocharge that workflow**

---

## Install Into A Real Repo

This repository is a template source, not the final installed layout.

To install it into a target repository, use [docs/install-into-existing-repo.md](./docs/install-into-existing-repo.md).

The short version:

1. Copy `AGENTS.md` into the target repo root.
2. Copy `skills/` into `.agent/skills/` in the target repo.
3. Ask the user whether the target repo is frontend web, frontend mobile, backend, or a full-stack/monorepo combination.
4. Copy only the relevant domain skill packs.
5. Optionally use `dynamic-skills/` as setup prompts to generate `.agent/skills/project-*/SKILL.md` files in the target repo.
6. Optionally install workflow packages from `optional-workflows/` by following [docs/install-optional-workflows.md](./docs/install-optional-workflows.md).

Recommended prompts for a target repo:

### Initial Repository Bootstrap

Use this once, after installing `AGENTS.md` and the skill packs into the target repo:

```text
Read AGENTS.md first. This repository uses AGENTS.md as the primary operating model and .agent/skills/ as the complementary capability layer.
Before choosing optional domain skill packs, ask me whether this repo is frontend web, frontend mobile, backend, or a full-stack/monorepo combination.
Examine the code base to create the memory bank according to the AGENTS 2.2 spec. Do not use readme files or other documentation as the primary source; examine the code and logic.
After that, load the relevant universal skills from .agent/skills/ and follow the PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY -> DOCS workflow.
If project-specific skills exist under .agent/skills/project-*/, use them alongside the universal skills: they define this repo's specific wiring and local constraints, while the universal skills remain the higher-level source of truth for architecture, quality, and execution discipline.
```

### Optional Day 1 Project-Specific Skill Generation

Use this when you want to generate local project skills from the setup prompts in `dynamic-skills/`:

```text
This repo already uses AGENTS.md as the operating model. We are in setup mode.
Please run through the dynamic skill generators one at a time, starting with 01.
Treat the files in dynamic-skills/ as setup prompts, not runtime skills.
Analyze this repository, discuss the proposed non-negotiables with me before writing anything, then generate the approved project-specific skill files under .agent/skills/project-*/.
Those generated skills must complement the universal skills and defer to AGENTS.md and the higher-order skill packs.
```

### Normal Session Commands

After the repository has been bootstrapped, AGENT-ZERO-style day-to-day prompts are:

```text
startup
BUILD
QA
Document it. Update the memory bank.
/compact
```

---

## Repo Contents

### `AGENTS.md`

This is the heart of the system. It defines:

- the compliance banner
- startup behavior
- Memory Bank structure
- the `PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY -> DOCS` state machine
- task contracts and budgets
- quality gates
- documentation rules
- compaction recovery behavior

If someone asks "how should the agent operate?", the answer should begin with `AGENTS.md`.

### `skills/`

These are the universal runtime skills. They are intended to live in `.agent/skills/` inside the target repo and complement `AGENTS.md` during normal work.

They cover:

- brainstorming
- planning
- execution
- TDD
- debugging
- verification
- documentation
- legal/compliance checks
- writing or maintaining skills themselves

### `backend-skills/`

Reusable backend-oriented skill packs for APIs, databases, security posture, and backend architecture.

### `frontend-web-skills/`

Reusable web frontend skill packs for React and Next.js style work.

### `frontend-mobile-skills/`

Reusable mobile frontend skill packs for Expo and React Native style work.

### `dynamic-skills/`

These are **not** ordinary runtime skills. They are setup prompts intended for Day 1 bootstrapping in a target repo.

Their job is to help the AI:

- inspect the target repo
- discuss repo-specific non-negotiables with the human
- generate project-specific skills under `.agent/skills/project-*/`

Examples include prompts for:

- frontend architecture
- secure coding practices
- deployment pipeline conventions

### `optional-workflows/`

These are installable workflow packages for human-invoked IDE workflows that sit
outside the core skill-pack model.

Each package includes:

- a package `README.md` that acts as the install contract
- a `workflow/` directory containing the file copied into `.agent/workflows/`
- a `resources/` directory containing supporting project files

The first package is `optional-workflows/sync-api/`, which installs a strict
OpenAPI sync workflow for TypeScript frontend projects using Orval and related
support scripts.

---

## The Operating Model

The operating model itself comes from `AGENTS.md`, which is aligned to the AGENT-ZERO approach.

Key ideas:

- **Reuse over creation**: extend before you create
- **Approval gates**: do not apply changes without explicit user approval
- **Architecture-first execution**: plans and diffs cite current code and existing patterns
- **Memory Bank discipline**: preserve the minimum high-signal project context needed for repeatable sessions
- **Compaction safety**: persist state continuously so recovery is possible after context compression

The workflow is:

`PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY -> DOCS`

That workflow is not optional decoration. It is the execution contract.

---

## The Skill Model

The skill packs do not replace the operating model. They make it more useful in real repositories.

Think of them as:

- reusable execution constraints
- domain-specific best-practice packs
- implementation guidance that helps the agent stay aligned under pressure

The universal skills should remain broadly reusable across repos.
The generated project-specific skills should remain narrowly local to one codebase.

That means:

- universal skills express stable guidance
- project-specific skills express local wiring, constraints, and exceptions
- `AGENTS.md` remains the highest-order behavioral contract

---

## Practical Boot Sequence

In a target repository, the sequence should be:

1. Install `AGENTS.md` and the relevant skill packs.
2. Use the initial repository bootstrap prompt to create the Memory Bank according to the AGENTS 2.2 spec.
3. If needed, use `dynamic-skills/` to generate local project-specific skills.
4. On subsequent boots, use `startup`.
5. Start work in `PLAN`, not direct implementation.
6. Use `BUILD`, `QA`, and `Document it. Update the memory bank.` as explicit workflow transitions.
7. Use `/compact` between tasks to keep context clean.

If the AI is confused about "what matters most," it should prefer:

- `AGENTS.md` over any summary prose
- universal skills over vague ad hoc prompting
- project-specific skills for repo-local rules, but only within that narrower scope

---

## Sources & Lineage

This repository is an original synthesis, but it is intentionally informed by ideas, patterns, and best practices from excellent open-source projects and public engineering guidance. Credit is due to the teams and maintainers whose work shaped the thinking here.

- [Vercel / Next.js](https://github.com/vercel/next.js): influenced the frontend and React/Next.js guidance, especially around web architecture, rendering patterns, performance, and production-minded developer workflows.
- [Expo](https://github.com/expo/expo): influenced the mobile and React Native guidance, including practical expectations around app structure, platform constraints, builds, updates, and native-runtime-aware development.
- [Supabase](https://github.com/supabase/supabase): influenced the backend and data posture, especially around Postgres-first architecture, Row Level Security, API boundaries, and operational discipline for database-backed applications.
- [AGENT-ZERO](https://github.com/msitarzewski/AGENT-ZERO): provides the core operating-model inspiration for the state machine, approval-oriented execution, and Memory Bank discipline used here.
- [agency-agents](https://github.com/msitarzewski/agency-agents): influenced the broader thinking around agent workflows, reusable agent behaviors, and practical multi-agent development patterns.
- [Obra Superpowers](https://github.com/obra/superpowers): influenced the skill-oriented composition model, agent behavior framing, and the idea that coding agents benefit from reusable, explicit operating constraints rather than loose prompting alone.

This project is not presented as an official implementation of, fork of, or endorsed derivative of any of the repositories above unless explicitly stated. Where ideas overlap, the intent is attribution, adaptation, and extension rather than copying work without credit.

---

## References

- Canonical operating guide in this repo: [AGENTS.md](./AGENTS.md)
- Detailed install guide: [docs/install-into-existing-repo.md](./docs/install-into-existing-repo.md)
- Upstream operating-model reference: [AGENT-ZERO](https://github.com/msitarzewski/AGENT-ZERO)
