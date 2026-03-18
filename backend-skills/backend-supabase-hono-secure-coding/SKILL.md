---
name: backend-supabase-hono-secure-coding
description: Use when planning, building, reviewing, or QA-ing Hono backend code running inside Supabase Edge Functions with Supabase/Postgres. Helps keep route handlers, authority checks, service-role usage, SQL boundaries, logging, and storage flows aligned to a secure Hono plus Supabase posture.
---

# Backend Supabase Hono Secure Coding

This skill is a security helper for the Hono plus Supabase stack.

It does not replace `backend-architect-supabase-hono`. That skill owns stack
shape and reference routing. This skill stays focused on implementation
security, privileged capability boundaries, and review discipline.

## What This Skill Does

- Keeps edge-function security boundaries explicit
- Surfaces risky `service_role`, RLS-bypass, storage, CORS, and logging
  decisions early
- Helps verify that Hono handlers, SQL contracts, and authority checks stay
  aligned under pressure

## What This Skill Does Not Do

- It does not replace `AGENTS.md`
- It does not replace `backend-architect-supabase-hono`
- It does not replace `supabase-postgres-best-practices`
- It does not replace repo-local security rules recorded in the Memory Bank
- It does not replace legal or compliance review for regulated workflows

## First Move

Before changing a Hono plus Supabase backend slice, inspect:

- how auth context is resolved in middleware
- whether the flow is user-scoped, system-scoped, or administrative
- where `service_role` is used, if at all
- how handlers reach SQL or database functions
- what RLS or database-level authority assumptions already exist
- how logs, CORS, storage, and signed URLs are handled

If the authority model is fuzzy, stop and clarify before building.

## Main Security Surfaces

Pay special attention when the task involves:

- auth middleware, session parsing, or JWT claims
- service-role access, admin jobs, or back-office operations
- SQL functions, migrations, RLS helpers, or permission-sensitive queries
- file uploads, storage buckets, signed URLs, or media processing
- public edge endpoints, webhooks, or third-party callbacks
- CORS, cookies, cross-origin auth flows, or browser-facing endpoints
- logging, tracing, or error serialization from edge functions

## Non-Negotiables

- No `service_role` key in client-facing code, browser bundles, or mobile app
  code.
- No casual `service_role` use inside user-scoped request paths when a
  user-context or SQL contract should enforce the rule.
- No raw SQL string construction or unsafe interpolation.
- No meaningful public endpoint without authentication, authorization, input
  validation, and a rate-limiting strategy.
- No route-level business rule that weakens a stronger SQL or policy boundary.
- No direct `supabase.from(...)` in Hono handlers when the repo uses a database
  bridge such as `callDb(...)` for privileged operations.
- No trusting JWT claims, role labels, or frontend hints alone when row-anchored
  authority or database confirmation is required.
- No permissive CORS or credentialed cross-origin access without an explicit
  allowlist and reason.
- No logs or client-visible errors that expose tokens, PII, raw SQL errors, or
  internal stack traces.
- No storage flow without explicit ownership, path, expiry, and content-type
  rules.

## Review Questions

Before calling the slice secure enough for QA or approval, check:

- Who is the acting principal for this route?
- What exact capability is being granted?
- Does the route rely on SQL/RLS for the final authority check where it should?
- Is any privileged key doing work that should stay user-scoped?
- Could this leak secrets, PII, bucket paths, or internal failure details?
- Could a caller replay, escalate, or bypass the intended access pattern?

## Companion Skills

Load companion guidance when needed:

- `backend-architect-supabase-hono` for stack philosophy and route/DB design
- `supabase-postgres-best-practices` for Postgres, RLS, indexing, or tuning
  details
- `legal-compliance-checker` for regulated data or retention/privacy concerns

## If You Feel Lost

Do not guess your way through authority or privileged access.

Pause and make these things explicit:

- user-scoped vs admin-scoped path
- edge handler vs SQL responsibility
- RLS vs privileged bypass boundary
- storage and signed-URL boundary
- logging and error-exposure boundary
