---
slug: add-rate-limit-middleware
date: 2026-04-19
model-tier: powerful (PLAN)
status: Approved
---

# Plan: Add Rate-Limit Middleware

## Task Objective

Protect the login endpoint from brute-force attacks by adding per-route rate limiting. Using `express-rate-limit`, restrict `/api/auth/login` to 5 requests per client IP per 60-second window. Excess requests receive `429 Too Many Requests`. No other routes are affected.

User-visible outcome: repeated failed login attempts from the same IP are throttled automatically, without any application restart or config change.

## Acceptance Criteria

1. `npm test -- --testPathPattern=src/middleware/rateLimiter.test.js` exits 0 with all tests passing
2. `npx eslint src/middleware/rateLimiter.js src/app.js` exits 0 with zero errors and zero warnings
3. A supertest integration: POST `/api/auth/login` called 6 times from the same IP within 60 seconds returns `429` on the 6th call
4. POST `/api/auth/register` is unaffected by the rate limiter (no `429` regardless of request frequency)

## Authority Check

- **constitution.md read**: ✓ — no constitutional conflicts. Rate limiting is within the API server's scope boundary.
- **operational-context.md checked**:
  - `#Active-Patterns` — "Register middleware in `src/app.js`, not in individual route files." Applies. New middleware goes in `src/app.js`.
  - `#Active-Anti-Patterns` — "Do not install third-party packages without adding them to `package.json` dependencies." Applies. `express-rate-limit` will be added to `package.json`.
- **Doctrine conflicts**: none

## Reuse Analysis

- `src/middleware/authMiddleware.js` — analyzed. Cannot extend: single-purpose JWT validation; rate limiting is a separate, unrelated concern with different lifecycle.
- `src/middleware/logger.js` — analyzed. Cannot extend: request logging only; no rate-limiting capability.
- **Conclusion**: new file `src/middleware/rateLimiter.js` is justified. No existing middleware is extensible for this purpose.

## Analyzed Files

- `src/app.js:28-42` — middleware registration chain; `app.use('/api/auth/login', ...)` is at line 34
- `src/middleware/authMiddleware.js:1-30` — pattern reference for middleware structure
- `src/routes/auth.js:1-25` — login route handler; confirms the route path `/api/auth/login`
- `package.json:12-18` — dependencies section; confirms `express-rate-limit` is not yet installed
- `operational-context.md#Active-Patterns` — middleware registration directive
- `operational-context.md#Active-Anti-Patterns` — package.json dependency directive

## Implementation Steps

1. Add `express-rate-limit` to `package.json` dependencies and run `npm install`
2. Create `src/middleware/rateLimiter.js` — configure a `rateLimit` instance: windowMs 60000, max 5, standardHeaders true, legacyHeaders false
3. Register the middleware in `src/app.js:34` — insert `app.use('/api/auth/login', loginRateLimiter)` before the existing auth router line
4. Create `src/middleware/rateLimiter.test.js` — 4 tests covering: under-limit passes, 6th request returns 429, register route unaffected, rate limiter resets after window
5. Run `npm test` and `npx eslint` to confirm clean (BUILD does not run these — that is QA's job)

## Integration Points

- **Caller**: `src/app.js:34` — `app.use('/api/auth/login', authRouter)` becomes `app.use('/api/auth/login', loginRateLimiter, authRouter)`
- **Dependency**: `express-rate-limit` npm package (new)
- **Not touched**: `src/routes/auth.js`, `src/services/`, `src/middleware/authMiddleware.js`

## Patterns to Follow

- Middleware registration pattern: `operational-context.md#Active-Patterns` — "Register middleware in `src/app.js`, not in individual route files." Evidence: `src/middleware/authMiddleware.js` is registered at `src/app.js:31`.
- Middleware structure pattern: mirror `src/middleware/authMiddleware.js:1-30` (see plan_context.md)

## Risks

- **Risk**: `express-rate-limit` stores state in-memory by default — will not work correctly if the server runs multiple instances behind a load balancer.
  **Mitigation**: out of scope for this task. Document in `human/decisions/` as a future consideration if the API scales to multiple instances.

## Test Strategy

- [ ] `src/middleware/rateLimiter.test.js::allows requests under the limit` — verifies normal operation
- [ ] `src/middleware/rateLimiter.test.js::returns 429 on the 6th request` — verifies enforcement
- [ ] `src/middleware/rateLimiter.test.js::does not affect /api/auth/register` — verifies scope
- [ ] `src/middleware/rateLimiter.test.js::resets after the window expires` — verifies window behaviour (mocked timer)

## Out of Scope

- Rate limiting on any route other than `/api/auth/login`
- Redis-backed rate limiting (in-memory only for now)
- Custom error message body beyond the default express-rate-limit response
- Any changes to `src/routes/auth.js` or `src/services/`
