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

2. **The capability layer**: the skill packs
   These complement `AGENTS.md` with reusable, domain-specific guidance for planning, debugging, frontend work, mobile work, backend work, verification, and documentation.

There is also an optional third layer:

3. **The local project layer**: generated project-specific skills
   The remaining files in `dynamic-skills/` are setup prompts for any repo-local generated helpers you still want on Day 1, such as deployment conventions. These are not runtime skills themselves.

There is also an optional fourth layer:

4. **The optional skill layer**: installable manual skill packages
   The files in `optional-skills/` are small, self-contained packages for
   Codex-style clients that add human-invoked, task-specific skills plus any
   supporting project resources those skills need.

The right way to think about this repo is:

- `agent/AGENTS.md` is the operating system source asset
- the reusable skill packs are the extensions that sharpen and specialize it
- generated project-specific skills are local wiring and non-negotiables for one concrete repo
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
- the generated project-specific skills are subordinate to both the operating guide and the universal skill packs

If you need an authority order, use this:

1. `AGENTS.md` in the target repo, sourced from `agent/AGENTS.md`
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
- setup prompts for any remaining project-specific local helpers

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
| `bootstrap-memory-bank` | universal | Any repo using the Memory Bank | Creates or refreshes `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, and `projectRules.md` with explicit human confirmation | Day 1 bootstrap or deliberate Memory Bank recalibration |
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

To install it into a target repository, use [docs/install-into-existing-repo.md](./docs/install-into-existing-repo.md).

The short version:

1. Choose the target repo's production profile:
   - `agent/generated/AGENTS.frontend-web.md`
   - `agent/generated/AGENTS.frontend-mobile.md`
   - `agent/generated/AGENTS.backend-generic.md`
   - `agent/generated/AGENTS.backend-hono-supabase.md`
2. Copy the selected rendered file into the target repo root as `AGENTS.md`.
3. Copy `skills/` into `.agent/skills/` in the target repo.
4. Ask the user which production profile the repo should use if that has not already been decided.
5. Copy only the relevant domain skill packs for that profile.
6. Optionally use the remaining `dynamic-skills/` setup prompts if you want generated repo-local helper skills such as deployment conventions.
7. Optionally install manual skill packages from `optional-skills/` by following [docs/install-optional-skills.md](./docs/install-optional-skills.md).

Recommended prompts for a target repo:

### Initial Repository Bootstrap

Use this once, after installing the selected rendered `AGENTS` profile and the skill packs into the target repo:

```text
Read AGENTS.md first. This repository uses AGENTS.md as the primary operating model and .agent/skills/ as the complementary capability layer.
Before loading domain skill packs, confirm which production profile this repo is using: frontend web, frontend mobile, backend generic, or backend hono-supabase.
When creating or refreshing `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, or `projectRules.md`, load `.agent/skills/bootstrap-memory-bank/SKILL.md` and work one document at a time with explicit human confirmation before writing.
Examine the code base to create the memory bank according to the AGENTS 2.2 spec. Do not use readme files or other documentation as the primary source; examine the code and logic.
After that, load the relevant universal skills from .agent/skills/ and follow the PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY -> DOCS workflow.
If project-specific skills exist under .agent/skills/project-*/, use them alongside the universal skills: they define this repo's specific wiring and local constraints, while the universal skills remain the higher-level source of truth for architecture, quality, and execution discipline.
```

### Optional Day 1 Deployment Skill Generation

Use this when you want to generate a repo-local deployment helper from the remaining prompt in `dynamic-skills/`:

```text
This repo already uses AGENTS.md as the operating model. We are in setup mode.
Treat the files in dynamic-skills/ as setup prompts, not runtime skills.
If we need a project-specific deployment helper, run the remaining deployment prompt, discuss the proposed non-negotiables with me before writing anything, then generate the approved project-specific skill file under .agent/skills/project-*/.
That generated skill must complement the universal skills and defer to AGENTS.md and the higher-order skill packs.
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

### `agent/AGENTS.md`

This is the heart of the system. It is the deployable operating-model asset
that gets copied into the target repo root as `AGENTS.md`. In this repository,
`agent/AGENTS.md` is the default `backend-generic` rendered profile, while the
profile system is authored in:

- `agent/AGENTS.core.md`
- `agent/profiles/*.md`
- `agent/generated/AGENTS.<profile>.md`
- `agent/scripts/render-agents.js`

Regenerate the rendered outputs with:

```text
node agent/scripts/render-agents.js --all
```

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
answer should begin with `AGENTS.md` in that target repo, sourced from the
selected rendered profile under `agent/generated/`.

### `AGENTS.md`

This root file is intentionally lightweight. Its only job is to stop
`AGENTS.md`-aware tools from confusing this template repo with an installed
target repo.

### `skills/`

These are the universal runtime skills. They are intended to live in
`.agent/skills/` inside the target repo and complement the installed
`AGENTS.md` during normal work.

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

Current source packs include a general backend architecture skill, a
Supabase/Postgres best-practices pack, and a stack-specific Hono + Supabase
backend architecture pack.

### `frontend-skills/`

Reusable frontend skill source packs organized to reduce drift across
platforms.

Subgroups:

- `frontend-skills/frontend-shared-skills/` for skills shared across web and mobile
- `frontend-skills/frontend-web-skills/` for React and Next.js specific skills
- `frontend-skills/frontend-mobile-skills/` for Expo and React Native specific skills

### `dynamic-skills/`

These are **not** ordinary runtime skills. They are setup prompts intended for Day 1 bootstrapping in a target repo.

Their job is to help the AI:

- inspect the target repo
- discuss repo-specific non-negotiables with the human
- generate project-specific skills under `.agent/skills/project-*/`

The remaining prompt covers deployment pipeline conventions.

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
The generated project-specific skills should remain narrowly local to one codebase.

That means:

- universal skills express stable guidance
- project-specific skills express local wiring, constraints, and exceptions
- the installed `AGENTS.md` remains the highest-order behavioral contract

---

## Practical Boot Sequence

In a target repository, the sequence should be:

1. Install `agent/AGENTS.md` into the target repo as `AGENTS.md` and add the relevant skill packs.
2. Use the initial repository bootstrap prompt to create the Memory Bank according to the AGENTS 2.2 spec.
3. If needed, use the remaining `dynamic-skills/` prompt to generate a local deployment helper.
4. On subsequent boots, use `startup`.
5. Start work in `PLAN`, not direct implementation.
6. Use `BUILD`, `QA`, and `Document it. Update the memory bank.` as explicit workflow transitions.
7. Use `/compact` between tasks to keep context clean.

If the AI is confused about "what matters most," it should prefer:

- installed `AGENTS.md` over any summary prose
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

- Canonical operating guide source in this repo: [agent/AGENTS.md](./agent/AGENTS.md)
- Template-repo guardrail file: [AGENTS.md](./AGENTS.md)
- Detailed install guide: [docs/install-into-existing-repo.md](./docs/install-into-existing-repo.md)
- Optional skill install guide: [docs/install-optional-skills.md](./docs/install-optional-skills.md)
- Upstream operating-model reference: [AGENT-ZERO](https://github.com/msitarzewski/AGENT-ZERO)
