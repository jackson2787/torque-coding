# Supabase Hono API Philosophy

## Why This Exists

This document explains the method behind a backend stack that uses:

- Hono for the HTTP layer
- Supabase Edge Functions for execution
- Supabase/Postgres for storage, security boundaries, and durable logic

The goal is not to make the backend "feel simple" by hiding the database. The
goal is to make the backend consistent by giving each layer a narrow, stable
job.

## The Core Bet

Treat the backend as one delivery surface with two cooperating layers:

1. The route layer owns HTTP concerns.
2. The database layer owns durable business rules and authority-critical logic.

Supabase is the runtime and platform. It is not the excuse to let route code
become the application.

That means a feature is normally designed and shipped as one vertical slice:

- schema or SQL changes
- public database contract
- route contract
- auth and authority behavior
- response shape

This is why database work and endpoint work can and should be done in one repo,
one branch, and often one task.

## The Role of Hono

Hono is the router, not the thinker.

The route layer should be responsible for:

- receiving HTTP input
- validating input
- attaching auth and request context
- calling the correct database boundary
- shaping documented responses
- mapping known failures to stable HTTP semantics

The route layer should not be responsible for:

- core lifecycle rules
- complicated authorization decisions
- writing ad hoc SQL behavior in TypeScript
- direct table orchestration scattered across handlers

If the route becomes clever, the backend becomes inconsistent.

## The Role of the Database

Postgres is not just persistence in this model. It is the authoritative home
for invariants, lifecycle logic, and access-sensitive behavior.

The database layer should own:

- business rules that must stay true regardless of caller
- write logic
- read logic that depends on access constraints
- reusable helper functions for security checks
- durable contracts that multiple routes can depend on

This reduces drift. The API becomes a stable adapter over explicit contracts
instead of a pile of handler-specific rules.

## Architect First, Builder Second

This stack works best when planning and building are deliberately separated.

### Architect Mode

Architect mode exists to remove ambiguity before implementation.

In architect mode, work through:

1. Who is acting?
2. What resource anchors access?
3. What exact SQL function signatures are needed?
4. What exact request and response schemas are needed?
5. What migration strategy is required?
6. What should the route return so the client does not need to guess?

The output is not vague advice. The output is an executable specification.

### Builder Mode

Builder mode exists to implement with low variance.

In builder mode:

- schemas come before handlers
- SQL contracts come before route glue
- route code stays short
- ambiguity causes a halt, not improvisation

The builder should not "clean up" unclear design by inventing missing rules.

## The Single-Slice Principle

When a feature changes the way data is shaped, secured, or returned, design the
database and API together.

Bad pattern:

- add a route quickly
- patch the database later
- patch the response shape later
- patch authorization later

Good pattern:

- define authority
- define SQL boundary
- define request and response schemas
- implement migration and route together
- verify the slice end to end

This is the main reason this stack can produce consistent work in one pass.

## Thin Routes, Strong Contracts

The healthiest backend in this model has:

- boring routes
- explicit schema contracts
- obvious authority checks
- database-centered business logic
- reusable function boundaries

Route handlers should be small enough that reviewers can see the whole path
from HTTP request to database contract at a glance.

## Zero-Inference APIs

The client should never need to guess what happened.

That means:

- mutation endpoints return the full updated model when the client should
  replace cached state
- endpoints return `204` only when no response body is the correct contract
- generic success flags are avoided because they force client-side guesswork

The API is a contract surface, not a polite hint.

## Security Posture

Security is not a future hardening pass. It is part of the architecture.

This philosophy assumes:

- authentication is required for meaningful protected work
- authorization is explicit, not implied
- access decisions are anchored to real rows or real delegation context
- route convenience never weakens the database model
- SQL boundaries verify the request context they depend on

If the easiest implementation path weakens authority rules, the easiest path is
wrong.

## The Triple-Lock Mental Model

The stack works best when security-sensitive flows have clear layers:

- public entry points with caller-scoped behavior
- gateway or context verification
- privileged internal logic where needed

The exact implementation can vary by repo, but the principle stays the same:
separate public contracts from privileged internals, and verify the context
before privileged work happens.

## Why This Should Not Absorb the Postgres Best-Practices Skill

This philosophy intentionally does not try to become the one skill for
everything.

It owns:

- backend architecture for this stack
- API to database boundaries
- delivery posture
- slice-level consistency

It does not own:

- detailed index selection
- deep query-plan tuning
- lock and concurrency tactics
- connection management
- Postgres monitoring guidance
- RLS performance tuning details

Those belong to `supabase-postgres-best-practices`.

That separation matters. Without it, this skill would become bloated and
duplicate the more authoritative Postgres guidance.

## What Good Looks Like

A strong result in this stack usually looks like this:

- the route contract is explicit
- the SQL contract is explicit
- the authority model is explicit
- the route code is thin
- the database does the durable work
- the response contract is useful to the client
- performance-sensitive SQL details defer to the Postgres skill when needed

## Anti-Patterns This Philosophy Rejects

- fat route handlers with business logic
- direct table access scattered through edge handlers
- route contracts invented before authority is understood
- generic `{ success: true }` mutation responses
- "public for now" shortcuts
- mixing planning and building when the contract is still fuzzy
- database compromises made only to make route code feel easy
