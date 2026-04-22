# Guide: Login Rate Limiting

**Date**: 2026-04-19
**Audience**: Support and non-dev product stakeholders
**Related task**: `add-rate-limit-middleware`
**Visibility**: Internal

## What Changed

The login endpoint now limits repeated sign-in attempts from the same client IP address. This helps reduce brute-force login abuse while keeping normal sign-in behavior unchanged for most users.

## Who This Affects

- Users who repeatedly submit login requests in a short period.
- Support teams investigating reports of temporary login throttling.
- Other API users are not affected by this change.

## How to Use It

1. Users continue signing in normally.
2. If too many login attempts happen within the configured time window, the API returns `429 Too Many Requests`.
3. The user should wait briefly before trying again.

## Examples

Normal behavior:

- A user enters credentials and submits the login form.
- The request is processed as before.

Rate-limited behavior:

- A client submits too many login attempts within one minute.
- The API returns `429 Too Many Requests`.
- Other routes, such as registration, continue to work normally.

## Limits and Caveats

- This protects the login route only.
- This is not an account lockout feature.
- This does not add CAPTCHA or progressive challenges.
- The limit is based on client IP address, so shared networks may need monitoring if legitimate users report throttling.

## Troubleshooting / FAQ

| Question or issue | Answer |
|---|---|
| A user sees `429 Too Many Requests` when logging in. | Ask them to wait briefly and try again. If it happens repeatedly, check whether many users share the same network/IP. |
| Are other routes affected? | No. The limiter is scoped to login only. |
| Does this lock the user account? | No. It temporarily throttles requests; it does not lock accounts. |

## Support Notes

If legitimate users report frequent throttling from shared networks, capture the scenario and escalate for threshold review. Do not share internal implementation details with end users.
