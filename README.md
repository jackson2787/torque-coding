# agent-engineering-playbook

This repository is an opinionated synthesis of proven agent-workflow, frontend, mobile, and backend engineering practices.
Its value is not in claiming wholly novel ideas, but in combining strong prior art into a practical, disciplined system for AI-assisted software delivery.

- Version: aligned with `agent/AGENTS.md` 2.2 (2025-03-04)
- Compatibility: Claude, Cursor, Copilot, Cline, Aider, Codex, and other `AGENTS.md`-compatible tools
- Status: template repo for bootstrapping an AGENT-ZERO-style operating model plus complementary skill packs

---

## What This Repo Actually Is

This repo bootstraps **two interconnected systems** into a real project repository:

1. **The operating model source**: `agent/AGENTS.md`
   This is the deployable operating-model asset. When installed into a real project repo, it becomes that repo's root `AGENTS.md` and defines the state machine, approval gates, Memory Bank behavior, task contracts, compaction protocol, and documentation discipline.

   The operating-model layer also includes
   `agent/bootstrap-memory-bank-contract.md`, a one-time bootstrap procedure
   for creating the initial Memory Bank from repository evidence.

2. **The capability layer**: the skill packs
   These complement `AGENTS.md` with reusable, domain-specific guidance for planning, debugging, frontend work, mobile work, backend work, verification, and documentation.

There is also an optional third layer:

3. **The optional skill layer**: installable manual skill packages
   The files in `optional-skills/` are small, self-contained packages for
   Codex-style clients that add human-invoked, task-specific skills plus any
   supporting project resources those skills need.

The right way to think about this repo is:

- `agent/AGENTS.md` is the operating system source asset
- the reusable skill packs are the extensions that sharpen and specialize it
- optional skills are installable add-ons for focused, manually invoked repo workflows

---

## Source Of Truth

The upstream conceptual source of truth for the operating model is **AGENT-ZERO**:

- Upstream repo: [msitarzewski/AGENT-ZERO](https://github.com/msitarzewski/AGENT-ZERO)
- Upstream README: [AGENT-ZERO README](https://github.com/msitarzewski/AGENT-ZERO/blob/main/README.md)

In this repository:

- `agent/AGENTS.md` is the canonical operating guide source for target repos
- the root `AGENTS.md` is only a lightweight template-repo guardrail
- the skill packs are intentionally subordinate to that operating guide
- the optional skills are subordinate add-ons to both the operating guide and the universal skill packs

If you need an authority order, use this:

1. `AGENTS.md` in the target repo, sourced from `agent/AGENTS.md`
2. `.agent/bootstrap-memory-bank-contract.md` during Day 1 Memory Bank bootstrap
3. Universal skill packs in `.agent/skills/`
4. Optional skills in `.agent/skills/<skill-root>/` when explicitly installed

Optional skills should **complement** the universal skills. They should not
replace the higher-order workflow, approval model, or architectural discipline
defined by `AGENTS.md`.

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
- optional skill packages for narrower manual workflows

In short:

- **AGENT-ZERO gives the workflow discipline**
- **this repo adds the reusable capability packs that turbocharge that workflow**

---

## Domains And Stacks

When installing this playbook into a target repo, choose the domain that best
matches the production codebase you are operating.

| Domain | `AGENTS` Source | Designed For | Domain Skill Packs |
|---|---|---|---|
| `universal` | `agent/AGENTS.md` | Repos that only need the core AGENT-ZERO workflow and universal execution skills | None beyond `skills/` |
| `web` | `agent/AGENTS.web.md` | React and Next.js frontend repositories | `frontend-skills/frontend-shared-skills/` and `frontend-skills/frontend-web-skills/` |
| `mobile` | `agent/AGENTS.mobile.md` | Expo and React Native frontend repositories | `frontend-skills/frontend-shared-skills/` and `frontend-skills/frontend-mobile-skills/` |
| `supabase backend` | `agent/AGENTS.backend.supabase.md` | Backends built around Hono inside Supabase Edge Functions with Supabase/Postgres | `backend-skills/` |

All installed skills should live directly under:

```text
.agent/skills/<skill-root>/
```

Do not nest them by source area such as `frontend-skills/` or
`backend-skills/` inside the target repo.

## Skill Reference

| Skill Root | Layer | Designed For | What It Does | Use When |
|---|---|---|---|---|
| `build-execution` | universal | Any repo in BUILD | Keeps implementation disciplined inside BUILD, including TDD, tight scope, and stop-before-apply behavior | Entering BUILD after plan approval |
| `systematic-debugging` | universal | Any repo | Drives root-cause-first debugging instead of random patching | QA failures, unclear bugs, repeated failed fixes |
| `verification-before-completion` | universal | Any repo | Forces evidence-based verification before claiming work is done | QA and final verification before “fixed” or “complete” claims |
| `writing-docs` | universal | Any repo | Updates docs and Memory Bank entries after approved work | DOCS phase or explicit documentation tasks |
| `writing-plans` | universal | Any repo | Produces architecture-aware implementation plans grounded in current code and Memory Bank context | PLAN phase |
| `backend-architect-supabase-hono` | backend | Hono + Supabase backends | Keeps the agent aligned to the Hono plus Supabase design ethos and routes it to the right stack references | Planning or building Hono-in-Supabase-Edge backend work |
| `supabase-postgres-best-practices` | backend | Supabase/Postgres backends | Supplies deep Postgres and Supabase guidance for performance, schema, RLS, locking, and tuning | Query, schema, RLS, indexing, or database-performance work |
| `accessible-ui` | frontend shared | Web and mobile UIs | Enforces accessibility and interaction-quality guardrails for user-facing interfaces | Forms, flows, semantics, keyboard/screen-reader behavior, responsive UI |
| `api-feature-request` | frontend shared | Frontends depending on APIs | Helps keep the frontend thin by identifying when API surface should be added or changed instead of pushing logic into the client | Planning features that depend on backend contracts |
| `composition-patterns` | frontend shared | Component-based frontends | Guides component API design, compound components, and composition-heavy refactors | Reusable component APIs, component architecture changes |
| `next-best-practices` | frontend web | Next.js repos | Provides Next.js-specific guidance for routing, RSC boundaries, metadata, scripts, and runtime choices | Writing, reviewing, or refactoring Next.js code |
| `next-cache-components` | frontend web | Next.js repos using Cache Components | Guides `use cache`, cache invalidation, and Cache Components boundaries | Tasks involving cache tags, cache life, or Partial Prerendering |
| `next-upgrade` | frontend web | Next.js repos | Focuses on framework upgrade work and upgrade-specific pitfalls | Explicit Next.js upgrade tasks |
| `react-best-practices` | frontend web | React and Next.js repos | Provides React and Next.js performance and structure guidance from Vercel’s patterns | Writing, reviewing, or refactoring React/Next.js code |
| `expo-native-data-fetching` | frontend mobile | Expo / React Native repos | Covers API calls, caching, token flow, retries, offline handling, and mobile request boundaries | Networking, auth refresh, or client data-fetching work in mobile apps |
| `react-native-skills` | frontend mobile | Expo / React Native repos | Provides mobile-focused guidance for performance, UI, lists, animation, navigation, and native constraints | Writing, reviewing, or refactoring React Native or Expo code |
| `best-practices-audit` | optional | Existing repos needing review | Produces a structured audit document against the installed playbook and skill packs | Manual baseline audit or drift audit |
| `brainstorming-features` | optional | Early-stage feature work | Helps turn vague ideas into clearer feature direction before formal planning | The request is still fuzzy and not ready for PLAN |
| `legal-compliance-checker` | optional | Regulated or compliance-sensitive work | Adds legal and regulatory review framing for privacy, consent, payments, health data, contracts, and similar areas | Tasks touching regulated data, privacy, payments, or jurisdictional compliance |
| `sync-api` | optional | TypeScript frontend repos using OpenAPI | Installs and runs a strict OpenAPI-to-client sync workflow with Orval support files | Frontend repos that generate clients from an OpenAPI contract |

---

## Install Into A Real Repo

This repository is a template source, not the final installed layout.

To install it into a target repository, use
[docs/install-ai-guide.md](./docs/install-ai-guide.md).

The short version:

1. Ask which domain to install: `universal`, `web`, `mobile`, or `supabase backend`.
2. Copy the matching file from `agent/` into the target repo root as `AGENTS.md`.
3. Copy `agent/bootstrap-memory-bank-contract.md` into the target repo as `.agent/bootstrap-memory-bank-contract.md`.
4. Copy the universal skills into `.agent/skills/`.
5. Copy the selected domain skill roots into `.agent/skills/`.
6. Ask which optional skills to install.
7. Install any selected optional skills under `.agent/skills/<skill-root>/`.

Use the full step-by-step guide at
[docs/install-ai-guide.md](./docs/install-ai-guide.md).

---

## Repo Contents

### `agent/AGENTS.md`

This is the heart of the system. It is the deployable operating-model asset
that gets copied into the target repo root as `AGENTS.md`.

The installed `AGENTS.md` defines:

- the compliance banner
- startup behavior
- Memory Bank structure
- the `PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY -> DOCS` state machine
- task contracts and budgets
- quality gates
- documentation rules
- compaction recovery behavior

If someone asks "how should the agent operate in the installed repo?", the
answer should begin with `AGENTS.md` in that target repo, copied from the
appropriate file in `agent/`.

### `agent/bootstrap-memory-bank-contract.md`

This is the Day 1 bootstrap contract for creating the initial Memory Bank in a
target repository.

It tells the AI to:

- inspect code and executable project files first
- ignore README-style prose as grounding truth during the initial sweep
- draft the foundation Memory Bank files
- keep unresolved human-driven claims in explicit pending-confirmation sections
- create the minimum operational scaffolding needed for AGENTS 2.2 startup

### `AGENTS.md`

This root file is intentionally lightweight. Its only job is to stop
`AGENTS.md`-aware tools from confusing this template repo with an installed
target repo.

### `skills/`

These are the universal runtime skills. They are intended to live in
`.agent/skills/` inside the target repo and complement the installed
`AGENTS.md` during normal work.

They cover:

- planning
- execution
- debugging
- verification
- documentation

### `backend-skills/`

Reusable backend-oriented skill packs for APIs and databases.

Current source packs include:

- `backend-architect-supabase-hono/`
- `supabase-postgres-best-practices/`

### `frontend-skills/`

Reusable frontend skill source packs organized to reduce drift across
platforms.

Subgroups:

- `frontend-skills/frontend-shared-skills/` for skills shared across web and mobile
- `frontend-skills/frontend-web-skills/` for React and Next.js specific skills
- `frontend-skills/frontend-mobile-skills/` for Expo and React Native specific skills

### `optional-skills/`

These are installable manual skill packages for Codex-style clients that sit
outside the core always-on skill-pack model.

Each package may include:

- a package `installation.md` for human-facing setup guidance
- an installable skill payload containing `SKILL.md` plus `agents/openai.yaml`
- a `resources/`, `assets/`, or `references/` directory with supporting files

Current packages:

- `optional-skills/sync-api/` installs a strict OpenAPI sync skill for
  TypeScript frontend projects using Orval and related support scripts.
- `optional-skills/best-practices-audit/` installs a reusable audit skill for
  `Next.js`, `Expo`, or `backend` repositories and writes the findings to
  `docs/audits/` for later planning.

---

## The Operating Model

The operating model itself comes from `agent/AGENTS.md`, which is aligned to
the AGENT-ZERO approach.

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
The optional skills should remain manually installed and manually invoked.

That means:

- universal skills express stable guidance
- optional skills express narrower on-demand workflows
- the installed `AGENTS.md` remains the highest-order behavioral contract

---

## Practical Boot Sequence

In a target repository, the sequence should be:

1. Install the correct `agent/AGENTS*.md` file into the target repo as `AGENTS.md`.
2. Copy `agent/bootstrap-memory-bank-contract.md` into the target repo as `.agent/bootstrap-memory-bank-contract.md`.
3. Install the universal skills into `.agent/skills/`.
4. Install the matching domain skill pack roots into `.agent/skills/`.
5. Optionally install any optional skills the repo actually needs.
6. Point the AI to `.agent/bootstrap-memory-bank-contract.md` to create the initial Memory Bank.
7. On subsequent boots, use `startup`.
8. Start work in `PLAN`, not direct implementation.
9. Use `BUILD`, `QA`, and `Document it. Update the memory bank.` as explicit workflow transitions.
10. Use `/compact` between tasks to keep context clean.

If the AI is confused about "what matters most," it should prefer:

- installed `AGENTS.md` over any summary prose
- universal skills over vague ad hoc prompting
- optional skills only when the task actually calls for them

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

- Canonical operating guide source in this repo: [agent/AGENTS.md](./agent/AGENTS.md)
- Template-repo guardrail file: [AGENTS.md](./AGENTS.md)
- Fresh install guide: [docs/install-ai-guide.md](./docs/install-ai-guide.md)
- Legacy install guides: [docs/install-into-existing-repo.md](./docs/install-into-existing-repo.md) and [docs/install-optional-skills.md](./docs/install-optional-skills.md)
- Upstream operating-model reference: [AGENT-ZERO](https://github.com/msitarzewski/AGENT-ZERO)
