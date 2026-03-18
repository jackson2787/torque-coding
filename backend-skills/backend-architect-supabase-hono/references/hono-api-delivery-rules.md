# Hono API Delivery Rules

## Purpose

Use this reference when defining or reviewing the Hono side of a Supabase Edge
Function backend slice.

The route layer is an adapter from HTTP to an explicit database contract. Keep
it predictable.

## The Role of the Route Layer

The route layer should:

- validate input
- attach auth and request context
- call the correct database boundary
- document the contract clearly
- map known failures to stable HTTP responses

The route layer should not:

- contain core business rules
- perform direct table workflows ad hoc
- duplicate authorization rules already owned by SQL
- return vague success payloads

## Schema First

Define request and response schemas before writing the handler.

Rules:

- request and response schemas stay separate
- exported schemas should use named OpenAPI components when the repo uses
  `@hono/zod-openapi`
- the route must return the shape the response schema declares

If the route returns a partial object while the schema expects a full model, the
contract is wrong even if the code compiles.

## Use the Existing App Factory

When the repo has shared factories such as `createHono` or
`createAppRoute`, reuse them.

Typical reasons:

- typed variables on context
- shared validation hooks
- shared header requirements
- consistent auth behavior
- consistent OpenAPI route creation

If such factories do not exist, create route code that still follows the same
principle: centralize common behavior and keep handlers narrow.

## Middleware Order Matters

When the route stack is being defined or reviewed, preserve a deliberate order.

A good default order is:

1. secure headers
2. CORS
3. logging in allowed environments
4. correlation or request ID
5. error handling
6. health checks and docs endpoints
7. authentication
8. idempotency or mutation-protection middleware

The exact stack can vary by repo, but security and cross-cutting concerns should
be centralized, not reimplemented per route.

## Route Definition Rules

When using OpenAPI-style route helpers:

- prefer `{param}` path syntax for documented route paths
- provide a concise summary
- provide a useful description that explains permission or side effects without
  inventing behavior
- tag routes by domain

Documentation should be rich but honest.

## Handler Rules

Healthy handlers are short and obvious.

Prefer a pattern like:

1. read validated input
2. read auth context
3. call the database boundary
4. return the documented response

If the handler grows into decision-heavy code, move that logic down into the
database boundary or a shared infrastructure layer.

## Operational Baseline

Even thin routes need operational discipline.

At minimum, preserve:

- structured error handling instead of ad hoc thrown responses
- correlation or request IDs for traceability
- health or readiness endpoints in the repo's standard style
- stable logging at important boundaries without leaking secrets

The route layer should stay small, but it should not become invisible when
something fails in production.

## Database Bridge Rule

When the repo uses a bridge such as `callDb(...)`, route handlers should use it
instead of raw Supabase table access.

That bridge is the right place for concerns like:

- passing auth or gateway context
- normalizing database error codes
- standardizing response translation
- shared request tracing

Avoid:

- `supabase.from(...)` in route handlers
- `supabase.rpc(...)` scattered through handlers
- manual error translation repeated per route

## Response Contract Rules

The client should not need to infer state changes.

For mutations:

- return the full updated model when the client should update cache directly
- return `204` only when no response body is the intended contract
- avoid generic `{ success: true }` payloads

For reads:

- return exactly the documented shape
- avoid undocumented extras
- include metadata only when it is part of the real contract

## Deno and Dependency Hygiene

In Supabase Edge Functions, Deno import behavior can be stricter than many Node
projects.

Practical guidance:

- map important Hono submodules explicitly when the repo uses import maps
- keep route dependencies boring and predictable
- avoid one-off per-route dependency patterns that make deployment fragile

## Deployment Shape

Edge-function route entrypoints should end in the repo's standard Deno serve
pattern so the function is deployable without custom wrapper logic.

Follow the local repo convention rather than inventing a new bootstrap style.
