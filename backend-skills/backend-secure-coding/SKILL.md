---
name: backend-secure-coding
description: Use when planning, building, reviewing, or QA-ing backend code that handles authentication, authorization, secrets, untrusted input, file uploads, webhooks, SQL, templates, or external service calls. Helps keep generic backend work aligned to a secure server-side posture and avoid common implementation mistakes such as injection, authz bypass, sensitive logging, SSRF, and unsafe error exposure.
---

# Backend Secure Coding

This skill is a reusable security helper, not the full source of truth for a
specific repo.

Use repo Memory Bank files and local project skills for repo-specific security
rules. Use this skill for the stable backend guardrails that should hold across
projects.

## What This Skill Does

- Surfaces the main server-side security risks before implementation hardens in
  the wrong direction
- Keeps auth, authorization, validation, logging, and secret-handling decisions
  explicit
- Helps review backend changes for common vulnerability classes before they
  reach APPROVAL

## What This Skill Does Not Do

- It does not replace `AGENTS.md`
- It does not replace repo-local security rules in the Memory Bank
- It does not replace database-specific guidance such as
  `supabase-postgres-best-practices`
- It does not replace legal or regulatory review for compliance-sensitive work

## First Move

Before changing backend behavior, inspect:

- how authentication is established
- where authorization decisions are enforced
- how request validation currently works
- how secrets and environment variables are loaded
- where logs, telemetry, and error responses go
- whether the task touches uploads, webhooks, HTML rendering, SQL, or outbound
  network calls

If the task changes any of those boundaries, keep the security model explicit in
the plan and the review notes.

## Main Security Surfaces

Pay special attention when the task involves:

- login, sessions, tokens, API keys, or password resets
- protected routes, admin actions, impersonation, or background jobs
- SQL, query builders, ORM escape hatches, or shell/process execution
- file uploads, downloads, media processing, or object storage
- webhooks, callbacks, signed requests, or external integrations
- HTML, Markdown, templates, email rendering, or user-generated content
- redirects, return URLs, or outbound fetches to user-provided destinations
- logs, analytics, audit trails, or crash reporting

## Non-Negotiables

- No protected route without authentication, authorization, input validation,
  and a rate-limiting strategy.
- No authorization based only on client-supplied roles, flags, or hidden form
  fields.
- No string interpolation into SQL, shell commands, HTML templates, or other
  executable interpreters when parameters or safe builders exist.
- No raw stack traces, internal errors, secrets, tokens, or PII in client
  responses or ordinary logs.
- No file-upload endpoint without explicit size, type, ownership, and storage
  rules.
- No webhook endpoint without signature verification, replay protection, and
  idempotency thinking.
- No outbound fetch to arbitrary user-provided URLs without explicit allowlist
  or SSRF protection.
- No security-sensitive behavior hidden in "temporary" bypasses or `TODO`
  branches.

## Review Questions

Before calling backend work safe enough for QA or approval, check:

- Who is allowed to call this path?
- What input is trusted, and why?
- What happens if the caller lies or replays the request?
- What sensitive data could leak through logs, metrics, or errors?
- What privileged capability is being introduced, and where is it bounded?
- Does the change create a new injection, SSRF, upload, or webhook surface?

## Companion Skills

Load companion guidance when needed:

- `legal-compliance-checker` for regulated data or jurisdictional risk
- `supabase-postgres-best-practices` when the problem becomes database-specific
- repo-local project skills or Memory Bank files for local exceptions and
  implementation details

## If You Feel Lost

Do not improvise security posture from habit.

Pause and make these things explicit:

- trust boundary
- authn/authz boundary
- secret boundary
- logging boundary
- external-input boundary
