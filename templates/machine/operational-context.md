# Operational Context

<!-- AUTHORITY: Level 2. Below constitution.md. Above task instructions and reasoning. -->
<!-- CHANGE POLICY: Written only by update-operational-context skill, called by debrief (propose-diff flow). -->
<!-- TONE: Prescriptive, present tense, imperatives and prohibitions. One directive per line. -->
<!-- EVIDENCE: Every entry must cite file:line or commit. No uncited directives. -->
<!-- SKILL: All writes go through update-operational-context. Never write directly. -->

<!-- If a line describes the past ("we used to", "historically", "last quarter") → it belongs in human/rationale/. -->
<!-- If a line describes an endpoint or data structure → it belongs in a schema doc, not here. -->
<!-- If a line is a changelog entry → it belongs in human/tasks/ or human/decisions/. -->

---

## Current Tech Stack

<!-- What the repo uses RIGHT NOW.
     Versions, frameworks, runtimes, external services.
     Remove entries when dependencies are dropped — do not archive here.
     Format: - [Name] [version] — [role]. Evidence: `file:line`
     Example:
     - Node.js 22 — runtime. Evidence: `package.json:4`
     - Next.js 15 — web framework. Evidence: `package.json:12`
     - Supabase — database and auth. Evidence: `src/lib/supabase.ts:1` -->

- [NEEDS CONFIRMATION]

---

## Active Patterns — Do This

<!-- Patterns that must be followed. Hard directive.
     Task instructions cannot override these.
     Format: - [Imperative sentence]. Evidence: `file:line`
     Example:
     - Route all external HTTP calls through `src/lib/http-client.ts`. Evidence: `src/lib/http-client.ts:1`
     - New public RPC routes follow the outer-wrapper / inner-invoker pattern. Evidence: `src/api/routes/users.ts:12` -->

- [NEEDS CONFIRMATION]

---

## Active Anti-Patterns — Do Not Do This

<!-- Patterns that are forbidden. Hard directive.
     Task instructions cannot override these.
     Format: - [Prohibition in one sentence] + [reason in ≤ one clause]. Evidence: `file:line`
     Example:
     - Do not import from `src/legacy/**`. It is quarantined pending removal. Evidence: `.eslintrc:42`
     - Do not use `fetch` directly. Use the http-client wrapper. Evidence: `src/lib/http-client.ts:1` -->

- [NEEDS CONFIRMATION]

---

## Preferred Patterns — Prefer This When Choosing

<!-- Soft directive. Task instructions may override with explicit justification.
     For situations where multiple correct options exist.
     Format: - [Preference statement]. Evidence: `file:line`
     Example:
     - Prefer server components over client components unless interactivity is required. Evidence: `src/app/**` (majority)
     - Prefer extension via composition over inheritance when adding to `src/services/**`. Evidence: `src/services/auth.ts:22` -->

- [NEEDS CONFIRMATION]

---

## Patterns To Avoid — Avoid Unless Justified

<!-- Softer than Do Not. Requires brief justification in the task when used.
     Format: - [Avoidance statement]. Evidence: `file:line`
     Example:
     - Avoid adding new top-level routes; extend an existing resource router instead. Evidence: `src/api/routes/index.ts:1`
     - Avoid direct Supabase client calls from route handlers; use the service layer. Evidence: `src/services/**` (consistent) -->

- [NEEDS CONFIRMATION]

---

## Current Known Constraints

<!-- Active operational constraints that must be respected right now.
     Hard directive. Task instructions cannot override these.
     Format: - [Constraint statement]. Evidence: `file:line` or incident context.
     Example:
     - Test suite must stay under 5 minutes. Heavy tests go behind the `@slow` tag. Evidence: `jest.config.ts:8`
     - The staging database is shared; do not run destructive migrations against it. Evidence: `.env.staging:3` -->

- [NEEDS CONFIRMATION]

---

## Currently Accepted Workflows

<!-- How work actually flows right now. Hard directive.
     Format: - [Workflow statement]. Evidence: `file:line` or CI config.
     Example:
     - Branches are named `YYYYMMDD-<slug>`. Evidence: `CONTRIBUTING.md:12`
     - QA runs `pnpm verify` locally before opening a PR. Evidence: `.github/workflows/ci.yml:22` -->

- [NEEDS CONFIRMATION]

---

## Pending Deprecations

<!-- Things currently allowed but on the way out.
     Short-lived entries. Remove when the deprecation is complete.
     Each entry links to the rationale in human/rationale/ and states the target removal date.
     Format: - [What is being deprecated] — target removal: [date or milestone]. Rationale: `human/rationale/<topic>.md`
     Example:
     - `src/legacy/reports.ts` — target removal: 2026-Q3. Rationale: `human/rationale/legacy-reports-removal.md` -->

*(none)*

---

## Last Debrief

<!-- Single line. Updated by the debrief skill after every task.
     Format: YYYY-MM-DD — task <slug> — [new rule | updated pattern | retired rule | no learning]
     Example: 2026-04-18 — task setup-v2-memory-bank — no learning (initial setup) -->

[BOOTSTRAP: not yet run]
