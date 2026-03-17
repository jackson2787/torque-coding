# agent-engineering-playbook

This repository is an opinionated synthesis of proven agent-workflow, frontend, mobile, and backend engineering practices.
Its value is not in claiming wholly novel ideas, but in combining strong prior art into a practical, disciplined system for AI-assisted software delivery.

## Start Here

This repo is best understood in three layers:

1. `AGENTS.md` defines the operating system: state machine, approval gates, Memory Bank rules, and workflow contract.
2. `skills/` plus the domain skill packs provide reusable behavior the AI should load inside a real project.
3. `dynamic-skills/` contains setup prompts that help the AI create project-specific skills for a target repo. They are not runtime skills themselves.

If you want to install this into a real project, start with [docs/install-into-existing-repo.md](./docs/install-into-existing-repo.md).

## Sources & Lineage

This repository is an original synthesis, but it is intentionally informed by ideas, patterns, and best practices from excellent open-source projects and public engineering guidance. Credit is due to the teams and maintainers whose work shaped the thinking here.

- [Vercel / Next.js](https://github.com/vercel/next.js): influenced the frontend and React/Next.js guidance, especially around web architecture, rendering patterns, performance, and production-minded developer workflows.
- [Expo](https://github.com/expo/expo): influenced the mobile and React Native guidance, including practical expectations around app structure, platform constraints, builds, updates, and native-runtime-aware development.
- [Supabase](https://github.com/supabase/supabase): influenced the backend and data posture, especially around Postgres-first architecture, Row Level Security, API boundaries, and operational discipline for database-backed applications.
- [AGENT-ZERO](https://github.com/msitarzewski/AGENT-ZERO): influenced the workflow framing, especially the emphasis on explicit phases, operational rigor, and structured execution for AI-assisted development.
- [agency-agents](https://github.com/msitarzewski/agency-agents): influenced the broader thinking around agent workflows, reusable agent behaviors, and practical multi-agent development patterns.
- [Obra Superpowers](https://github.com/obra/superpowers): influenced the skill-oriented composition model, agent behavior framing, and the idea that coding agents benefit from reusable, explicit operating constraints rather than loose prompting alone.

This project is not presented as an official implementation of, fork of, or endorsed derivative of any of the repositories above unless explicitly stated. Where ideas overlap, the intent is attribution, adaptation, and extension rather than copying work without credit.

## The Core Philosophy: "Reuse over Creation"

AI agents default to creating new files and mocking data to save time. This framework forces the AI to behave like a Staff Engineer:

1. **No new files without reuse analysis**: The AI must search the codebase and exhaustively justify why existing components cannot be extended.
2. **No rewrites when refactoring possible**: Incremental improvements over full rewrites.
3. **No generic advice**: Every suggestion must include `file:line` citations.
4. **No ignoring existing architecture**: The AI must load and understand the existing patterns before designing changes.

## Install Into A Real Repo

This repository is a template source, not the final installed layout.

If you want to use it inside an actual project, follow [docs/install-into-existing-repo.md](./docs/install-into-existing-repo.md). That document defines:

- what to copy into the target repo
- where to place each skill pack
- which directories are optional
- how to point an AI at the installed workflow

In short:

1. Copy `AGENTS.md` into the target repo root.
2. Copy `skills/` into `.agent/skills/` in the target repo.
3. Ask the user whether the target repo is frontend web, frontend mobile, backend, or a full-stack/monorepo combination.
4. Copy only the relevant domain packs.
5. Optionally use `dynamic-skills/` as setup prompts to generate `.agent/skills/project-*/SKILL.md` files in the target repo.

Suggested bootstrap prompt for the target repo:

```text
This repository uses the AI workflow installed in AGENTS.md and .agent/skills/.
Read AGENTS.md first, then load the relevant skills for this repo.
Before choosing optional skill packs, ask me whether this repo is frontend web, frontend mobile, backend, or a full-stack/monorepo combination.
Follow the PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY -> DOCS workflow.
If project-specific skills exist under .agent/skills/project-*/, those override generic wiring choices but defer to the universal skills.
```

## Directory Structure

### `AGENTS.md` (The Core System)
This is the heart of the orchestration framework. `AGENTS.md` enforces a strict State Machine that the AI must follow:
- **PLAN:** Research context, formulate an Implementation Plan, and acquire human approval.
- **BUILD:** Write tests first, implement minimal code in a sandbox, and generate a unified diff. 
- **QA:** Run linters, build steps, tests, and performance checks.
- **APPROVAL:** Present the final diff and QA results to the human for sign-off.
- **APPLY:** Apply the diff to the sandbox branch.
- **DOCS:** Update the Memory Bank and task summaries to maintain high-fidelity context.

### 🧠 The Core Skills Library

The framework uses specialized markdown instructions (`SKILL.md`) that the AI loads contextually based on the task at hand. These are designed to be modular so you only plug in what you need for a given repository.

#### `skills/` (Universal Skills)
Always included in every project. Contains the state machine enforcers and meta-skills.

| Skill Name | Description |
|---|---|
| **test-driven-development** | Enforces strict Red-Green-Refactor. The Iron Law: "No production code without a failing test first." |
| **systematic-debugging** | A 4-phase structured approach to root cause analysis, preventing the AI from guessing or writing "quick patches". |
| **writing-plans** | Enforces the `PLAN` state. Instructs the AI to focus on reuse over creation and generate a structural diff for approval. |
| **executing-plans** | Enforces the `BUILD` state. Instructs the AI to write failing tests first, implement minimal code, and generate a unified diff without deploying. |
| **verification-before-completion** | Enforces the `QA` state. Explicitly prevents the AI from claiming success before verifying output on the terminal. |
| **writing-docs** | Enforces the `DOCS` state. Governs how the AI updates the `memory-bank` to ensure context fidelity for future tasks. |
| **legal-compliance-checker** | Mandates security and privacy checks for GDPR, CCPA, and data handling requirements. |
| **brainstorming-features** | Unstructured conceptual mode for helping humans brainstorm ideas before moving into PLAN mode. |
| **writing-skills** | Meta-skill used when the AI is asked to edit, create, or test other skills within the framework. |

#### `backend-skills/`
Drop these into backend repositories (APIs, Databases, Cloud Functions).

| Skill Name | Description |
|---|---|
| **backend-architect** | Mandates security-first design (RLS, rate limiting), horizontal scalability, and DB migration protocols. |
| **supabase-postgres-best-practices** | Postgres performance optimization and best practices from Supabase (indexing, RLS, queries). |

#### `frontend-web-skills/` & `frontend-mobile-skills/`
Drop these into Next.js/React web projects or React Native/Expo mobile projects.

| Skill Name | Description |
|---|---|
| **accessible-ui** | *(Shared)* Enforces WCAG compliance, semantic HTML, and proper React Native/Next.js accessible components. |
| **composition-patterns** | *(Shared)* React composition patterns that scale, useful for refactoring components and building flexible APIs. |
| **react-best-practices** | *(Web)* React and Next.js performance optimization guidelines from Vercel Engineering. |
| **react-native-skills** | *(Mobile)* React Native and Expo best practices for building performant mobile apps (e.g., list performance, animations). |
| **expo-native-data-fetching** | *(Mobile)* Best practices for handling offline state, query caching, and secure token storage on mobile devices. |

### `dynamic-skills/` (Project Data & Wiring)
These are setup prompts intended to be run once at the start of a new project. They query the user about their specific tech stack (e.g., frontend frameworks, deployment targets, security models) and dynamically generate project-specific `SKILL.md` files. They are not ordinary installed runtime skills.

| Dynamic Generator | Purpose |
|---|---|
| **01-frontend-architecture** | Generates a project-specific skill governing state management (e.g., Redux vs Zustand) and API fetching patterns (e.g., React Query vs direct DB access). |
| **02-secure-coding-practices** | Generates a project-specific skill governing authentication flows, rate limiting, and environmental secret handling for the target architecture. |
| **03-deployment-pipeline** | Generates a project-specific skill detailing strict CI/CD guidelines, rollback procedures, and environment-specific build steps. |

These dynamic skills complement the generic universal skills by defining specific project wiring and choices. It is a strict meta-rule that **dynamic skills defer to universal skills** (like `react-best-practices`, `backend-architect`) as the ultimate source of truth, ensuring project-specific rules never override core architectural rigor.

### `memory-bank/` (The Project Brain)
A directory structure dynamically updated by the AI in the `DOCS` state to serve as its long-term memory:
- `projectbrief.md`: Core requirements and vision.
- `systemPatterns.md`: Existing architectural patterns.
- `projectRules.md`: Coding standards and emerging rules.
- `decisions.md`: Architectural Decision Records (ADRs).
- `tasks/`: Monthly readmes and task-specific documentation.

---

## Operational Guide (Based on AGENT-ZERO)

This workflow is an implementation of the [AGENT-ZERO](https://github.com/msitarzewski/AGENT-ZERO) operational framework for high-quality, AI-assisted software development.

### Quick Start & Boot Sequence
A field-tested routine for flawless execution:
1. Install this workflow into the target repo using [docs/install-into-existing-repo.md](./docs/install-into-existing-repo.md).
2. Ensure your AI agent reads `AGENTS.md` and the installed `.agent/skills/` directory in the target repo.
3. Clear your session memory to prevent context pollution (e.g., `/compact` or `/clear`).
4. On every boot, provide a specific task and ensure the agent starts in **PLAN** mode.
5. Type: `BUILD` to implement in a sandbox branch.
6. Review the presented diff and rationale. Then type: `QA` to run tests, linters, coverage, and build.
7. When QA passes, type: `Document it. Update the memory bank.`
8. Clear the context window (`/compact` or `/clear`) and repeat with the next task.

### Compaction Protocol
Context compression can happen at any time without warning. This framework persists state to the `Memory Bank` at **every state transition**, so recovery is automatic. After compaction, the agent resumes from the saved state.

### Sample End-to-End Task Prompt
A minimal, high-signal task prompt that aligns with the `PLAN → BUILD → QA` flow:

```text
Task name: Add user preferences to settings
Context: Users need a way to toggle email notifications.
Detailed outcome: A toggle switch appears in `/settings` that updates the DB.
Constraints (do/don't): Do not strictly bypass RLS, follow existing React patterns.
Instructions: This is the PLAN process. Create a plan that addresses this request with code citations. Do not write code until the plan is approved.
```
