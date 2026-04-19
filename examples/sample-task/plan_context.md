---
slug: add-rate-limit-middleware
date: 2026-04-19
model-tier: powerful (PLAN-CONTEXTUALIZE)
for: BUILD — budget model reads this; zero exploration required
---

# Context Pack: Add Rate-Limit Middleware

**Target property**: reading `plan.md` and this file, the budget model should need **zero exploration tool calls** to implement the task.

---

## Files to Touch

### 1. `src/app.js` — middleware registration (modify line 34)

**Current state (lines 28–42)**:
```javascript
// src/app.js
const express = require('express');
const authMiddleware = require('./middleware/authMiddleware');
const logger = require('./middleware/logger');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');

const app = express();
app.use(express.json());
app.use(logger);                                        // line 37: global logger
app.use('/api/auth', authMiddleware, authRouter);       // line 38: auth routes with middleware
app.use('/api/users', authMiddleware, userRouter);      // line 39: user routes

module.exports = app;
```

**Change required**: Insert `loginRateLimiter` before `authRouter` on the login route only. The register route (`/api/auth/register`) must NOT be rate-limited.

After the change, line 38 becomes two lines:
```javascript
const loginRateLimiter = require('./middleware/rateLimiter');
// ...
app.use('/api/auth/login', loginRateLimiter, authRouter);  // rate-limited
app.use('/api/auth/register', authRouter);                 // not rate-limited
```

The `require` for `rateLimiter` goes at line 32, after the existing middleware requires.

### 2. `src/middleware/rateLimiter.js` — new file (create)

Does not exist yet. Create it with this structure (see pattern below):

```javascript
'use strict';
const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000,   // 60-second window
  max: 5,                 // 5 requests per window per IP
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
});

module.exports = loginRateLimiter;
```

### 3. `src/middleware/rateLimiter.test.js` — new test file (create)

Does not exist yet. See "Test Patterns to Mirror" below for the exact jest + supertest shape to use.

---

## Patterns to Follow

### Pattern: Middleware module structure

**Directive**: `operational-context.md#Active-Patterns` — "Register middleware in `src/app.js`, not in individual route files."

**Current example in repo** (`src/middleware/authMiddleware.js:1-20`):
```javascript
'use strict';
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'TOKEN_INVALID' });
  }
}

module.exports = authMiddleware;
```

**How to apply**: `rateLimiter.js` follows the same module shape — `'use strict'`, configure the middleware, `module.exports` at the bottom. No class, no factory function unless the package requires it.

---

## Constraints to Respect

- `constitution.md#Scope-Boundaries` — "This API does not persist client state outside of authenticated sessions." The rate limiter uses in-memory storage (no Redis, no DB write) — this is compliant.
- `operational-context.md#Active-Anti-Patterns` — "Do not install third-party packages without adding them to `package.json` dependencies." Add `express-rate-limit` to `package.json` before importing it.

---

## Integration Points

**Where the middleware is registered** (`src/app.js:34-39` — current structure above):
- The login route is currently `app.use('/api/auth', authMiddleware, authRouter)` — this catches ALL `/api/auth/*` routes including login AND register.
- After the change: split this into two `app.use()` calls — one for `/api/auth/login` with the rate limiter, one for `/api/auth/register` without.
- The `authMiddleware` stays on both routes (authentication is still required).

**What the existing auth router does** (`src/routes/auth.js:1-10` — do not modify):
```javascript
const router = require('express').Router();
router.post('/login', loginHandler);
router.post('/register', registerHandler);
module.exports = router;
```
The router itself does not change. Only the `app.use()` registration changes.

---

## Test Patterns to Mirror

**From `src/middleware/logger.test.js:1-25`** (jest + supertest pattern used in this repo):
```javascript
'use strict';
const request = require('supertest');
const app = require('../app');

describe('logger middleware', () => {
  it('adds request-id header to every response', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('does not add request-id to static assets', async () => {
    const res = await request(app).get('/favicon.ico');
    expect(res.headers['x-request-id']).toBeUndefined();
  });
});
```

**Shape to mirror in `src/middleware/rateLimiter.test.js`**:
```javascript
'use strict';
const request = require('supertest');
const app = require('../app');

describe('loginRateLimiter middleware', () => {
  it('allows requests under the limit', async () => {
    // POST /api/auth/login 5 times — all should pass through (401 from auth, not 429)
  });

  it('returns 429 on the 6th request within the window', async () => {
    // POST 6 times — 6th should return 429
  });

  it('does not rate-limit /api/auth/register', async () => {
    // POST /api/auth/register 10 times — none should return 429
  });

  it('resets after the window expires', async () => {
    // Use jest.useFakeTimers() to advance clock past windowMs; 6th request should pass again
  });
});
```

---

## Dead Ends — Do Not Revisit

- **Adding rate limiting inside `src/routes/auth.js`**: rejected — `operational-context.md#Active-Patterns` hard directive requires middleware registration in `src/app.js`, not route files.
- **Using `express-slow-down` instead of `express-rate-limit`**: rejected — task plan specifies `express-rate-limit`; do not substitute.
- **Global rate limiting (all routes)**: rejected — acceptance criterion 4 requires `/api/auth/register` to be unaffected; global middleware would break this.

---

## Success Criteria (Mechanical — for QA)

1. `npm test -- --testPathPattern=src/middleware/rateLimiter.test.js` exits 0; 4 tests pass
2. `npx eslint src/middleware/rateLimiter.js src/app.js` exits 0; zero warnings
3. Supertest: POST `/api/auth/login` × 6 → 6th response status is 429
4. Supertest: POST `/api/auth/register` × 6 → all responses are not 429

---

## Out of Scope — Do Not Touch

- `src/routes/auth.js` — route handlers are not changing
- `src/services/` — no service layer changes
- `src/middleware/authMiddleware.js` — not changing
- Any `.env` or config files
- Redis or any external rate-limit store
