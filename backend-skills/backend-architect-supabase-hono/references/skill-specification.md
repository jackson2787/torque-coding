# Backend Architect Supabase Hono Skill Specification

## Purpose

Create a reusable backend skill for repositories that use Hono inside Supabase
Edge Functions with Supabase/Postgres as the system of record.

This skill should help an agent plan and implement complete backend slices that
include both API and database work, while staying intentionally separate from
deep Postgres optimization guidance.

## Problem It Solves

The existing `backend-architect` skill is broad and useful, but it is still a
general backend architecture guide.

This stack needs something more specific:

- Hono route patterns
- Supabase Edge Function constraints
- database-first business logic
- integrated API + DB delivery
- explicit authority modeling
- predictable output shape across planning and implementation

The `_temp-ref` material shows the desired behavior clearly: the AI performs
best when it treats Hono as a thin adapter, the database as the source of
truth, and planning as a separate activity from implementation.

## Intended Trigger Conditions

Use this skill when a task involves one or more of the following in this stack:

- designing a new backend feature
- changing API endpoints backed by Supabase/Postgres
- changing schema and route contracts together
- defining SQL functions or database boundaries for API work
- modeling authority, delegation, or access-sensitive data flows
- reviewing whether a Hono + Supabase implementation is aligned with the stack

## Explicit Non-Goals

This skill should not become the primary authority for:

- query optimization
- index tuning
- connection pooling
- lock behavior
- advanced Postgres feature usage
- RLS performance tuning

Those are owned by `supabase-postgres-best-practices`.

This skill also should not become a project-specific business-rules pack.
Repo-specific concepts, roles, and local exceptions should live in generated
project skills when needed.

## Core Behavioral Contract

The skill should guide the agent to:

1. Read the current code and existing patterns first.
2. Default to architect posture when the request changes contracts, authority,
   or schema.
3. Produce exact contracts before implementation.
4. Keep route handlers thin and predictable.
5. Put durable business logic in SQL, not TypeScript handlers.
6. Treat API and database work as one coherent slice.
7. Stop and ask when authority or lifecycle rules are genuinely ambiguous.
8. Pull in `supabase-postgres-best-practices` when the problem becomes
   database-tuning specific.

## Required Outputs

### In Planning Work

The skill should steer toward outputs such as:

- exact request schema
- exact response schema
- exact route definition
- exact SQL public function signature
- internal function or RLS helper plan when required
- migration strategy
- authority model
- response and error behavior

### In Build Work

The skill should steer toward outputs such as:

- migrations
- SQL function updates
- request and response schemas
- Hono route implementation
- verification steps
- concise docs updates when the public contract changed

## Non-Negotiable Rules

The skill should preserve these rules unless a target repo explicitly overrides
them:

- No meaningful route without auth, validation, and a rate-limiting strategy.
- No direct table orchestration in route handlers when a database bridge
  pattern exists.
- No business logic living primarily in Hono handlers.
- No generic success payloads for mutations.
- No hidden request or response schemas.
- No authority assumptions without an explicit access model.
- No silent duplication of the Postgres best-practices skill.

## Ownership Boundary With `supabase-postgres-best-practices`

This new skill owns:

- stack-specific backend architecture
- route-to-database boundary design
- delivery workflow for API + DB slices
- Hono route conventions
- SQL boundary conventions at the architectural level

This new skill defers:

- performance rule catalogs
- Postgres tuning specifics
- index examples and optimization heuristics
- connection and lock guidance
- deep RLS performance rules

This boundary should be stated directly in `SKILL.md` so the skill does not
accidentally grow into a duplicate database handbook.

## Proposed Skill Package Shape

The skill package should include:

- `SKILL.md`
- `references/supabase-hono-api-philosophy.md`
- `references/hono-api-delivery-rules.md`
- `references/database-boundary-and-triple-lock.md`
- `references/skill-specification.md`

## Reference Loading Strategy

Keep `SKILL.md` focused on:

- trigger conditions
- workflow
- hard rules
- ownership boundaries
- reference navigation

Put the longer reasoning and implementation detail in references:

- philosophy in the philosophy document
- route-layer rules in the Hono API reference
- database-layer rules in the triple-lock reference
- maintenance intent in this specification

## Success Criteria

The skill is successful if it helps produce backend work that is:

- consistent across tasks
- database-centered without being database-only
- explicit about authority and contracts
- thin at the HTTP layer
- compatible with one-repo, one-slice delivery
- clearly separated from the Postgres optimization skill
