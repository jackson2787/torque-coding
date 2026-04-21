# Definition: Add rate limit middleware

**Slug**: add-rate-limit-middleware
**Date**: 2026-04-19
**Model tier**: powerful (DEFINE)
**Status**: Ready for PLAN

## Raw idea

"I want to protect login from abuse without making normal users miserable."

## Problem statement

How might we reduce brute-force login attempts while preserving a normal sign-in experience for legitimate users?

## Target user

Unauthenticated users signing in through `/api/auth/login`, plus operators responsible for keeping account-access abuse under control.

## Success criteria

1. Login attempts are rate-limited per client IP.
2. Other API routes are unaffected.
3. The response for limited clients is explicit enough for API consumers to handle.
4. The behavior is covered by route-level tests.

## Recommended direction

Add a narrowly scoped Express middleware to the login route only. Use `express-rate-limit` rather than a custom in-memory counter so the implementation stays conventional and easy to replace later.

Keep the first version intentionally small: fixed per-IP window, clear 429 response, and tests proving both the limited and unaffected-route cases.

## Alternatives considered

- Account-based throttling — better long-term signal, but requires identity state before authentication succeeds.
- Global API rate limiting — simpler to wire, but violates the requirement that unrelated routes remain unaffected.
- CAPTCHA after failed attempts — higher user friction and outside the current MVP.

## Key assumptions to validate

- [ ] IP-based limiting is acceptable for the current deployment topology — validate proxy/header behavior before production rollout.
- [ ] Five attempts per minute is a reasonable starting threshold — validate against expected legitimate retry patterns.
- [ ] A route-level middleware is compatible with the existing router layout — validate in PLAN by reading auth route registration.

## MVP scope

Add per-IP rate limiting to `POST /api/auth/login` using `express-rate-limit`, with route-level tests for the limited path and an unaffected non-login route.

## Not doing

- Global API throttling — would affect routes outside the requested scope.
- Account-level throttling — requires product/security decisions beyond this task.
- CAPTCHA or progressive challenges — adds UX and provider complexity outside the MVP.

## Open questions

- Does production sit behind a proxy that requires Express `trust proxy` configuration before IP limiting is reliable?

## Planning brief

**Objective**: Protect `/api/auth/login` from repeated brute-force attempts without changing behavior for other routes.

**Likely affected areas**:
- `src/routes/auth.js`
- `src/app.js`
- `src/middleware/`
- `tests/auth.test.js`

**Constraints for PLAN**:
- Keep rate limiting route-scoped to login.
- Do not add account-level lockout or CAPTCHA.
- Preserve existing auth middleware behavior.

**Suggested first checks**:
- Locate existing route-level middleware patterns.
- Check how auth routes are mounted.
- Check current test style for login endpoint coverage.
