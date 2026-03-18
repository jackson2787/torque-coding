---
name: backend-architect-supabase-hono
description: Use when designing, planning, or implementing backend work in repositories that use Hono inside Supabase Edge Functions with Supabase/Postgres. Keeps the agent aligned to the stack ethos, helps choose architect versus builder posture, and routes to the correct reference docs for philosophy, route delivery, database boundaries, and Memory Bank bootstrap. Pair with supabase-postgres-best-practices for deep Postgres tuning, indexing, query optimization, or RLS performance work.
metadata:
  author: uber-ai-workflow
  version: "0.1.0"
---

# Backend Architect Supabase Hono

This skill is a helper and entrypoint, not the full source of truth.

Use it in repos where:

- Hono runs inside Supabase Edge Functions
- Supabase/Postgres is the system of record
- API and database changes are expected to ship together in one repo and often one task

The reusable stack doctrine for this package lives in `references/`.
The repo-local truth for a specific project belongs in the Memory Bank.

## What This Skill Does

- Keeps the agent aligned to the design ethos of the Hono + Supabase stack
- Helps decide whether the current task is in architect posture or builder posture
- Routes the agent to the right reference document for the current problem
- Reminds the agent what belongs in stack references versus repo Memory Bank files

## What This Skill Does Not Do

- It does not replace `AGENTS.md`
- It does not replace `supabase-postgres-best-practices`
- It does not try to hold the full stack philosophy inline
- It does not turn reusable stack doctrine into repo-local Memory Bank truth
- It does not define deep Postgres tuning strategy

## First Move

Before proposing or changing backend structure:

1. Inspect the existing routes, schemas, migrations, SQL functions, and any project-specific skills.
2. Check the repo Memory Bank for local adaptations already recorded in `techContext.md`, `systemPatterns.md`, `projectRules.md`, or `decisions.md`.
3. Decide whether the task is in architect posture or builder posture.
4. If authority, contract shape, or schema impact is unclear, stay in architect posture until the contract is exact.

## Posture Selection

### Architect Posture

Default to architect posture when the task changes:

- behavior
- authority
- schema
- public route contracts
- SQL boundaries
- response semantics

In architect posture, resolve:

- who is acting
- what row, parent resource, or delegation anchors access
- what belongs in SQL versus the route layer
- what exact request and response shapes are needed
- what exact SQL contract is needed
- what the client must receive so it does not need to guess what happened

If those answers are not explicit, stop and load the correct reference instead of improvising.

### Builder Posture

Use builder posture when the contract is already approved or mechanically obvious from existing patterns.

In builder posture:

- keep route handlers short
- define schemas before handlers
- keep business rules out of route code when they belong in SQL
- halt on ambiguity instead of inventing missing authority or lifecycle rules

## Reference Loading Strategy

Load references based on the current need:

- [references/supabase-hono-api-philosophy.md](references/supabase-hono-api-philosophy.md)
  Use for design ethos, stack worldview, role boundaries, and "why this stack is shaped this way."
- [references/hono-api-delivery-rules.md](references/hono-api-delivery-rules.md)
  Use for route design, handler behavior, middleware order, schema-first work, response contracts, and Hono delivery details.
- [references/database-boundary-and-triple-lock.md](references/database-boundary-and-triple-lock.md)
  Use for SQL boundaries, authority modeling, public versus internal contracts, migrations, and the triple-lock model.
- [references/memory-bank-bootstrap-map.md](references/memory-bank-bootstrap-map.md)
  Use when `bootstrap-memory-bank` is creating or refreshing Memory Bank files for a repo using this stack.

Load `supabase-postgres-best-practices` separately when the problem becomes about:

- query tuning
- index strategy
- connection or pooling behavior
- locking and concurrency
- RLS performance
- monitoring and diagnostics

## Memory Bank Boundary

This package does not try to make the Memory Bank hold the full stack doctrine.

Use the references as reusable stack truth.

Use the Memory Bank for repo-local truth, such as:

- how this repo wires Hono routes
- whether this repo uses `callDb(...)`
- which auth or context middleware is standard here
- which parts of the stack philosophy are explicitly adopted as local rules
- which variations or exceptions this repo intentionally uses

## Non-Negotiables

- No meaningful public endpoint without authentication, input validation, and a
  rate-limiting strategy.
- No route-level business logic when the rule belongs in SQL.
- No direct `supabase.from(...)` or ad hoc client-side table access inside Hono
  handlers when the repo uses a `callDb` bridge pattern.
- No generic mutation responses such as `{ success: true }`.
- No hidden schema contracts. Request and response schemas must be explicit.
- No schema design driven only by frontend convenience. The API must adapt to
  the authoritative data model, not weaken it.
- No assumptions like "admin", "internal", or "public" access without an
  explicit authority model.
- No skipping the Postgres best-practices skill when the task becomes a tuning
  or database-performance problem.

## If You Feel Lost

Do not improvise stack doctrine from memory.

Stop and load the most relevant reference file:

- philosophy confusion -> `supabase-hono-api-philosophy.md`
- route confusion -> `hono-api-delivery-rules.md`
- SQL or authority confusion -> `database-boundary-and-triple-lock.md`
- Memory Bank grounding confusion -> `memory-bank-bootstrap-map.md`
