# Uber AI Workflow Orchestration

A robust, agentic AI coding orchestration framework designed for predictability, zero-hallucination execution, and maximum code quality. This repository contains the canonical rules, state machine, and specialized skills required to seamlessly pair-program with AI agents like Antigravity.

## The Core Philosophy: "Reuse over Creation"

AI agents default to creating new files and mocking data to save time. This framework forces the AI to behave like a Staff Engineer:

1. **No new files without reuse analysis**: The AI must search the codebase and exhaustively justify why existing components cannot be extended.
2. **No rewrites when refactoring possible**: Incremental improvements over full rewrites.
3. **No generic advice**: Every suggestion must include `file:line` citations.
4. **No ignoring existing architecture**: The AI must load and understand the existing patterns before designing changes.

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
These are generator scripts intended to be run once at the start of a new project. They query the user about their specific tech stack (e.g., frontend frameworks, deployment targets, security models) and dynamically generate project-specific `SKILL.md` files.

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
1. Ensure your AI agent reads the applicable skills directories (e.g., `skills/`, `backend-skills/`) and `AGENTS.md`.
2. Clear your session memory to prevent context pollution (e.g., `/compact` or `/clear`).
3. On every boot, provide a specific task and ensure the agent starts in **PLAN** mode.
4. Type: `BUILD` to implement in a sandbox branch.
5. Review the presented diff and rationale. Then type: `QA` to run tests, linters, coverage, and build.
6. When QA passes, type: `Document it. Update the memory bank.`
7. Clear the context window (`/compact` or `/clear`) and repeat with the next task.

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
