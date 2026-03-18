---
name: backend-architect-supabase-hono
description: Use when designing, planning, or implementing backend work in repositories that use Hono inside Supabase Edge Functions with Supabase/Postgres. Covers integrated API and database slices, auth and authority modeling, route contracts, SQL function boundaries, migrations, and thin-route delivery. Pair with supabase-postgres-best-practices for deep Postgres tuning, indexing, query optimization, or RLS performance work.
metadata:
  author: uber-ai-workflow
  version: "0.1.0"
---

# Backend Architect Supabase Hono

Use this skill for backend work in repos where:

- Hono runs inside Supabase Edge Functions
- Supabase/Postgres is the system of record
- API and database changes are expected to ship together in one repo and often one task

This skill is intentionally opinionated. Its job is to keep backend work
coherent across the HTTP layer, the database boundary, and the security model.

## What This Skill Owns

- Backend slice architecture for Hono + Supabase
- Exact API and database contract definition
- Auth, authority, and data-access modeling at the slice level
- Thin-route implementation patterns
- Delivery rules for planning and building route + migration work together

## What This Skill Does Not Own

This skill does not replace
`supabase-postgres-best-practices`.

Load `supabase-postgres-best-practices` when the task needs:

- query tuning
- index strategy details
- connection or pooling guidance
- locking and concurrency guidance
- RLS performance optimization
- Postgres-specific performance or monitoring decisions

Use this skill to decide the shape of the backend slice. Use the Supabase
Postgres skill to tune the database internals of that slice.

## First Move

1. Inspect the existing routes, schemas, migrations, SQL functions, and any
   project-specific skills before proposing new structure.
2. Decide whether the task is in architect posture or builder posture.
3. If authority, contract shape, or schema impact is unclear, stay in architect
   posture until the contract is exact.
4. Keep API and database work coupled. Do not design the route in isolation
   from the SQL contract it depends on.

## Architect Posture

Default to architect posture when the request changes behavior, authority,
schema, or public contracts.

Produce an implementation spec that covers:

- exact route surface
- exact request and response schemas
- exact SQL function signatures
- migration strategy
- authority model and access checks
- expected response codes and error mapping
- reuse points in the current codebase

Resolve these questions before building:

- Who is acting?
- What row, parent resource, or delegation anchors access?
- Which rules belong in SQL and which belong in the route layer?
- What must the client receive so it does not need to guess what happened?

If those questions are not answerable from the current context, pause and ask
the user instead of improvising the rule set.

## Builder Posture

Use builder posture when the contract is already approved or mechanically
obvious from existing patterns.

Implementation rules:

- Keep route handlers short and boring.
- Define request and response schemas before the handler.
- Use the project's route factory and app factory patterns when present.
- Use the database bridge pattern such as `callDb(...)`; do not put business
  logic in the route.
- Apply the database boundary rules in
  [references/database-boundary-and-triple-lock.md](references/database-boundary-and-triple-lock.md).
- Halt on ambiguity instead of making up authority or lifecycle rules.

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

## Delivery Contract

For a backend feature, this skill should drive toward a complete vertical slice:

- migration plan
- SQL function contract
- API request schema
- API response schema
- route definition and documentation
- error behavior
- validation or verification steps

The best outcome is usually a backend change that can be implemented and
reviewed as one coherent unit instead of separate "DB later, API later" work.

## Reference Guide

Read these files as needed:

- [references/supabase-hono-api-philosophy.md](references/supabase-hono-api-philosophy.md)
  for the design logic behind this stack
- [references/hono-api-delivery-rules.md](references/hono-api-delivery-rules.md)
  when defining or reviewing Hono route behavior
- [references/database-boundary-and-triple-lock.md](references/database-boundary-and-triple-lock.md)
  when changing SQL, authority, or DB-facing architecture
- [references/skill-specification.md](references/skill-specification.md)
  when maintaining or evolving this skill's scope
