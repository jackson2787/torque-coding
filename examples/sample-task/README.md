# Worked Example — `add-rate-limit-middleware`

This directory contains all artifacts from a complete fictional task carried through every state of the Torque Coding state machine. The task and project are fictional — the file:line citations are plausible but refer to no real codebase.

Use this alongside `GETTING-STARTED.md` to understand what each state produces on disk.

---

## The fictional project

- **Name**: `express-user-api`
- **Runtime**: Node.js 20
- **Framework**: Express 4.18
- **Tests**: jest 29 + supertest
- **Linter**: ESLint 8
- **Layout**: standard `src/` directory with `routes/`, `middleware/`, `services/`
- **Existing middleware**: `src/middleware/authMiddleware.js` (auth token check), `src/middleware/logger.js` (request logger)

## The task

Add per-route rate limiting to protect the login endpoint from brute-force attacks. The `express-rate-limit` package is used. Only `/api/auth/login` is rate-limited; other routes are unaffected.

---

## State-by-state file map

| File | Produced by | State | What it demonstrates |
|---|---|---|---|
| `definition.md` | `idea-refine` skill | DEFINE | Refined problem, target user, MVP scope, assumptions, and Not Doing list |
| `plan.md` | `writing-plans` skill | PLAN | Authority check, reuse analysis, acceptance criteria, implementation steps |
| `plan_context.md` | `plan-contextualize` skill | PLAN-CONTEXTUALIZE | "Zero exploration" context pack for the executor model |
| `build-log.md` | `build-loop` skill | BUILD | Single successful attempt; does NOT claim to have run tests |
| `qa-report.md` | `qa` skill | QA | All six checks, pasted terminal evidence, PASS verdict |
| `consumer-guide.md` | `debrief` skill | DEBRIEF | Plain-language guide for non-dev users/support |

---

## Reading order

1. `definition.md` — understand how the raw idea was narrowed
2. `plan.md` — understand what was agreed
3. `plan_context.md` — understand what the executor model was given to work with
4. `build-log.md` — see what BUILD did (and did not do)
5. `qa-report.md` — see how QA verified the work
6. `consumer-guide.md` — see the consumer-facing explanation debrief would write for this user-visible change

---

## What debrief would have done

After QA PASS, the `debrief` skill would have:

- Applied the five-gate rubric to the task — the rate-limiter middleware registration pattern is generalisable, evidenced at `src/app.js:34`, and expected to be durable → proposed adding to `operational-context.md#Active-Patterns`
- Written task history to `human/tasks/2026-04/190426_add-rate-limit-middleware.md`
- Written consumer-facing guidance to `human/consumer-guides/2026-04/190426_add-rate-limit-middleware.md`
- Called `update-active-context` to reset `activeContext.md` to `State: PLAN/IDLE`

No `current-task/` archive is shown here to avoid scaffolding the full `human/` tree inside the example.
