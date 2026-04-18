# Constitution

<!-- AUTHORITY: Level 1 — Highest. Overrides operational-context.md, task instructions, and reasoning. -->
<!-- CHANGE POLICY: Explicit human ratification required. The keyword "ratified" must appear in the approving message. -->
<!-- TONE: Declarative, timeless, present tense. One idea per line. If a line could be wrong next month, delete it. -->
<!-- SKILL: All writes go through update-constitution. Never write directly. -->

---

## Identity

<!-- What this project IS. One paragraph.
     Sources: manifests, entry points, public API surface.
     Do not include implementation details. Do not include aspirational statements.
     Example: "This is a multi-tenant SaaS platform that provides X for Y users. It is deployed as a monolith
     with a single Postgres database and serves traffic through a single API gateway." -->

[NEEDS CONFIRMATION]

---

## Core Objective

<!-- Why this project exists. One or two sentences maximum.
     This should still be true in two years if the project is successful.
     Example: "Enable small businesses to manage their finances without an accountant." -->

[NEEDS CONFIRMATION]

---

## Scope Boundaries

### In Scope

<!-- What this system is responsible for.
     Bullet list. One item per line. Each item should be unambiguous.
     Example:
     - User authentication and session management
     - Multi-tenant data isolation
     - Payment processing via the payment provider -->

- [NEEDS CONFIRMATION]

### Out of Scope

<!-- What this system explicitly does NOT do.
     These are hard boundaries. A feature request that falls here is rejected, not debated.
     Example:
     - This system does not manage inventory (handled by Inventory Service)
     - This system does not send SMS (handled by Notification Service)
     - This system does not store card numbers (delegated to payment provider) -->

- [NEEDS CONFIRMATION]

---

## Domain Definitions

<!-- Terms that MUST mean the same thing across the entire codebase.
     If a term has a specific technical meaning here that differs from general usage, define it.
     Format: **Term** — definition.
     Example:
     - **User** — an authenticated human with a verified email. Guests are not users.
     - **Workspace** — a tenant. One workspace = one billing account.
     - **Task** — a unit of tracked agent work. Not a cron job, not a background job. -->

- [NEEDS CONFIRMATION]

---

## Durable Architectural Rules

<!-- Rules expected to be true for the lifetime of this project.
     Acceptance bar: must be either (a) enforced by CI/lint/config or (b) explicitly ratified by the human.
     Evidence required: cite file:line or CI config.
     Format: Rule statement. Evidence: `file:line`.
     Example:
     - All data access goes through the data access layer. No direct DB calls in route handlers.
       Evidence: `src/middleware/no-direct-db.test.ts:1`
     - Public-facing RPC endpoints are thin wrappers only. Business logic lives in internal services.
       Evidence: `src/api/routes/` (consistent pattern) -->

- [NEEDS CONFIRMATION]

---

## Security & Compliance Boundaries

<!-- Non-negotiable security constraints.
     These cannot be overridden by task instructions or operational-context entries.
     Evidence required: cite file:line or policy document.
     Example:
     - No PII in application logs. Evidence: `src/lib/logger.ts:12` (redaction middleware)
     - No customer secrets stored in this repo. Evidence: `.gitignore` (env files excluded)
     - All authorisation checks occur at the service boundary, not in route handlers.
       Evidence: `src/middleware/auth.ts:45` -->

- [NEEDS CONFIRMATION]

---

## Authority Over Other Memory

This file is the highest-authority memory document.

- `constitution.md` overrides `operational-context.md` in all conflicts.
- `constitution.md` overrides task instructions in all conflicts.
- `constitution.md` overrides agent reasoning in all conflicts.
- If a conflict is detected, the conflicting statement must be flagged to the human. Constitution wins until a ratified amendment resolves it.

To change this file:
1. Write a proposal to `.memory-bank-v2/human/decisions/YYYY/YYYY-MM-DD-<slug>.md`.
2. Human reviews and ratifies: says "ratified" in the approving message.
3. `update-constitution` applies the change and appends to the Change Log.

---

## Change Log

<!-- Append-only. Each entry: date, what changed, who ratified.
     Format: YYYY-MM-DD: [what changed]. Ratified by [human name or "bootstrap"].
     Example:
     - 2026-04-18: Initial draft. Ratified by bootstrap (unratified — pending human review).
     - 2026-04-25: Added domain definition for "Workspace". Ratified by Ian. -->

<!-- BOOTSTRAP instructions: append the following line when populating this file:
     [BOOTSTRAP: YYYY-MM-DD] Initial machine-generated draft. All entries unratified — pending human review. -->
