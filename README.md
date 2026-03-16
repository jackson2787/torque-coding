# Uber AI Workflow Orchestration

A robust, agentic AI coding orchestration framework designed for predictability, zero-hallucination execution, and maximum code quality. This repository contains the canonical rules, state machine, and specialized skills required to seamlessly pair-program with AI agents like Antigravity, Cursor, and Cline.

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

### `.agent/skills/` (The Universal Skills)
A library of highly specialized markdown instructions (`SKILL.md`) that the AI can load contextually based on the task at hand. 

| Skill Name | Description |
|---|---|
| **test-driven-development** | Enforces strict Red-Green-Refactor. The Iron Law: "No production code without a failing test first." |
| **systematic-debugging** | A 4-phase structured approach to root cause analysis, preventing the AI from guessing or writing "quick patches". |
| **backend-architect** | Mandates security-first design (RLS, rate limiting), horizontal scalability, and explicit DB migration protocols. |
| **writing-plans** | Enforces the `PLAN` state. Instructs the AI to focus on reuse over creation and generate a structural diff for approval. |
| **executing-plans** | Enforces the `BUILD` state. Instructs the AI to write failing tests first, implement minimal code, and generate a unified diff without deploying. |
| **writing-docs** | Enforces the `DOCS` state. Governs how the AI updates the `memory-bank` to ensure context fidelity for future tasks. |
| **accessible-ui** | Enforces WCAG compliance, semantic HTML, and proper React Native/Next.js accessible components. |
| **react-best-practices** | React and Next.js performance optimization guidelines from Vercel Engineering (e.g., Server Components vs Client Components). |
| **composition-patterns** | React composition patterns that scale, useful for refactoring components and building flexible APIs. |
| **react-native-skills** | React Native and Expo best practices for building performant mobile apps (e.g., list performance, animations). |
| **supabase-postgres-best-practices** | Postgres performance optimization and best practices from Supabase (indexing, RLS, queries). |
| **verification-before-completion** | QA State protocol explicitly preventing the AI from claiming success before verifying output on the terminal. |
| **legal-compliance-checker** | Mandates security and privacy checks for GDPR, CCPA, and data handling requirements. |
| **brainstorming-features** | Unstructured conceptual mode for helping humans brainstorm ideas before moving into PLAN mode. |
| **writing-skills** | Meta-skill used when the AI is asked to edit, create, or test other skills within the framework. |

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

## Getting Started

1. Place `AGENTS.md` in the root of your project.
2. Ensure your AI agent (Antigravity, Cursor, etc.) reads the `.agent/skills/` directory.
3. When starting a new project, use the generators in `dynamic-skills/` to codify your specific architectural choices into `memory-bank/projectRules.md` or dedicated `project-*` skills.
4. Start prompting your AI. It will automatically initialize the session, enforce compliance checks, and guide you through the `PLAN -> BUILD -> QA -> APPROVAL -> APPLY -> DOCS` loop.
