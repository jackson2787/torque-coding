---
name: frontend-web-secure-coding
description: Use when planning, building, reviewing, or QA-ing React or Next.js web code that handles auth sessions, browser storage, redirects, user-generated HTML, uploads, third-party scripts, or sensitive user data. Helps keep browser-side work aligned to a secure web posture and avoid XSS, token leakage, unsafe redirects, accidental secret exposure, and thin-client boundary violations.
---

# Frontend Web Secure Coding

This skill is a reusable browser-security helper.

It should keep web work inside a secure frontend posture without trying to turn
the browser into the authority layer.

## What This Skill Does

- Surfaces the main browser-side security risks during plan, build, and review
- Keeps session handling, storage, rendering, redirects, and logging decisions
  explicit
- Helps preserve API-first and server-authoritative boundaries

## What This Skill Does Not Do

- It does not replace `AGENTS.md`
- It does not replace `react-best-practices`, `next-best-practices`, or
  `accessible-ui`
- It does not replace backend authorization or server-side security
- It does not replace legal/compliance review for regulated data

## First Move

Before changing web behavior, inspect:

- how sessions and auth state are handled
- what the browser stores locally and why
- how redirects, return URLs, and navigation callbacks are built
- where user-provided HTML, Markdown, or rich text is rendered
- which environment variables are exposed to the browser
- whether third-party scripts, uploads, or cross-origin requests are involved

## Main Security Surfaces

Pay special attention when the task involves:

- login, session refresh, cookie auth, or token handling
- `localStorage`, `sessionStorage`, IndexedDB, or client caches
- `dangerouslySetInnerHTML`, rich text, Markdown, or embedded content
- redirects, callback URLs, router pushes, or post-login return paths
- third-party scripts, analytics, chat widgets, or tag managers
- uploads, downloads, file previews, or object URLs
- browser logs, analytics, or error reporting
- public env vars and client/server component boundaries

## Non-Negotiables

- No private secrets, admin keys, or server-only env vars in browser code.
- No auth tokens, refresh tokens, or privileged credentials in `localStorage`
  or `sessionStorage` unless the repo has an explicitly approved exception and
  the risk is understood.
- No `dangerouslySetInnerHTML` or equivalent unsafe HTML rendering without an
  explicit sanitization strategy and trusted-content boundary.
- No user-controlled redirect, callback, or navigation target without
  validation or an allowlist.
- No logging of tokens, cookies, PII, or raw backend error payloads to console
  or browser telemetry.
- No client-side authorization pretending to be the real security boundary.
- No client bypass of the intended API/backend boundary for convenience.
- No third-party script with broad DOM or credential access unless it is truly
  needed and intentionally loaded.

## Review Questions

Before calling the web change secure enough for QA or approval, check:

- Could user-controlled content execute script or unsafe markup?
- Could storage, telemetry, or browser devtools expose sensitive data?
- Could a redirect or callback path be abused?
- Is the browser being asked to enforce a rule that only the server should
  decide?
- Did the change introduce a new upload, third-party script, or cross-origin
  risk?

## Companion Skills

Load companion guidance when needed:

- `react-best-practices` for React and Next.js implementation quality
- `next-best-practices` for Next.js runtime, server/client, and route concerns
- `accessible-ui` when the security change affects forms or user-facing flows
- `api-feature-request` if the frontend is starting to carry logic that belongs
  behind an API boundary
- `legal-compliance-checker` for regulated data or consent/privacy-sensitive
  features

## If You Feel Lost

Do not guess your way through browser trust.

Pause and make these things explicit:

- storage boundary
- rendering boundary
- redirect boundary
- server vs client authority boundary
- logging and third-party-script boundary
