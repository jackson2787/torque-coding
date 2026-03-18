# Database Boundary And Triple Lock

## Purpose

Use this reference when the task changes SQL, authority rules, or the contract
between Hono and Supabase/Postgres.

This is the database-facing side of the stack-specific architecture. For deep
query tuning or performance heuristics, pair it with
`supabase-postgres-best-practices`.

## The Database Is The Source Of Truth

In this architecture, the database is not a passive storage layer.

It owns:

- durable business rules
- lifecycle-sensitive writes
- access-sensitive reads
- reusable authorization helpers
- contracts that routes call through a stable boundary

The API should adapt to this model, not weaken it.

## Versioned Change Workflow

Prefer versioned migrations over ad hoc schema mutation.

When the repo uses Supabase CLI migrations:

- create a new migration for each database change
- do not overwrite historical migration intent
- keep SQL function changes versioned with the schema changes they depend on

If a repo has a stricter local migration protocol, follow that protocol.

## Triple-Lock Mental Model

Separate the stack into layers with different responsibility and privilege.

### Public Interface

Public database functions are the stable entrypoints from the API layer.

Typical characteristics:

- live in `public`
- use caller-scoped or invoker behavior
- validate or verify request context
- expose only the contract intended for the route layer

### Gateway Or Context Verification

Before privileged behavior is trusted, verify the gateway or request context the
function depends on.

The exact mechanism can vary by repo, but the principle is fixed:

- the database should not blindly trust caller-supplied context
- public entrypoints should verify the context they use for security decisions

### Internal Logic

Privileged internal functions should be clearly separated from public contracts.

Typical characteristics:

- live in an internal schema
- use definer privileges when the design requires it
- are not exposed directly as route-level public contracts

## Authorization Model

Avoid vague access language such as:

- public
- admin
- internal
- owner

unless those concepts are explicitly defined in the repo.

Prefer access models anchored to:

- the acting identity
- a target row or parent resource
- an explicit delegation or membership relationship

If access depends on a parent entity, check access through that parent instead
of inventing route-local shortcuts.

## Reusable RLS Helpers

When the repo uses helper functions for row-level security:

- keep them reusable
- make them explicit about what row or parent resource they check
- avoid reimplementing the same logic in multiple policies or handlers

Use the repo's established schema and naming conventions for these helpers.

## Query-Shaping Rules

At the architectural level:

- prefer set-based operations over loops
- design reads and writes so they operate through stable functions
- paginate lists intentionally
- keep parent-child access rules explicit

When the discussion becomes about specific indexes, query plans, or lock
behavior, load `supabase-postgres-best-practices`.

## Forbidden Patterns

- business logic split unpredictably between SQL and route code
- direct privileged logic exposed as a public API boundary
- route convenience used to bypass authorization design
- raw SQL exceptions leaking directly to clients
- schema changes made outside the repo's versioned migration flow
- Hono handlers becoming the real home of domain rules

## Practical Rule Of Thumb

If a rule must stay true regardless of which route calls it, it probably belongs
in SQL.

If a concern exists only because an HTTP request needs validation, headers, or a
documented response shape, it probably belongs in Hono.

If a problem is about making the SQL itself faster or safer at scale, it
probably belongs to `supabase-postgres-best-practices`.
