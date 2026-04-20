# Limits & Escalation Ladder

**Purpose**: Runtime configuration for the state machine. Declares per-state token budgets and the model-escalation ladder. Loaded at session startup alongside `constitution.md` and `operational-context.md`.

**Writable by**: The human directly. Low ceremony — no ratification required. This file is tunable per project and per developer's current tier.

**Not writable by**: Task work, BUILD LOOP, QA, debrief. If a skill determines the limits are wrong for this project, it surfaces that to the human as a tuning suggestion — it does not edit this file.

---

## Why this file exists

Torque Coding is built for the mid-tier developer on a £20/month plan. At that tier, an executor model running BUILD can exhaust its monthly cap well before a hard task completes. Without explicit per-state budgets:

- The user discovers cap exhaustion mid-task and loses context
- There is no distinction between "the model couldn't solve it" and "the model ran out of room"
- Escalation has no principled trigger beyond attempt count

This file makes cap exhaustion a first-class stall signal. A state that blows through its hard cap escalates exactly like a state that hits 3 failed attempts.

---

## Per-state token budgets

Budgets are input-token targets. Soft cap: proceed but log a warning. Hard cap: stop and escalate.

| State | Model tier | Soft cap (input) | Hard cap (input) | On hard cap |
|---|---|---|---|---|
| PLAN | powerful | 15,000 | 25,000 | surface to user |
| PLAN-CONTEXTUALIZE | powerful | 25,000 | 40,000 | surface to user |
| BUILD (per attempt) | executor | 10,000 | 15,000 | stall (counts as 1 attempt) |
| QA (per cycle) | executor | 8,000 | 12,000 | stall (counts as 1 cycle) |
| ESCALATE (subagent) | powerful | 30,000 | 50,000 | step up ladder or surface |
| DEBRIEF | any | 10,000 | 20,000 | trim candidates, note in report |

### How a skill uses this table

1. **Before doing the work**: estimate input size (memory bank + current-task/ + task-relevant files). If estimate exceeds hard cap, do NOT proceed — escalate immediately. This prevents half-complete work.
2. **During the work**: if a mid-state check shows you have crossed the soft cap, log a warning in the state's output file (`build-log.md`, `qa-report.md`, etc.).
3. **At the end**: record actual tokens used. This becomes evidence for whether the budget is tuned correctly over time.

### Counting rules

- **Input tokens** include: system prompt, memory-bank files loaded, current-task/ files, any tool-call result text. This is what the rate limiter charges against your tier.
- **Output tokens** are not budgeted here — output is bounded by the practical size of the skill's deliverable.
- Estimate, don't measure pedantically. A model counting its own context to the nearest 100 tokens is fine; to the nearest 1,000 is also fine.

---

## Cap-exhaustion as a stall

When a state hits its hard cap, the state machine treats it identically to a failed attempt:

| State | Cap exhaustion → |
|---|---|
| PLAN | surface to user ("planning is exceeding budget for this task — consider smaller scope or stronger tier") |
| PLAN-CONTEXTUALIZE | surface to user (same framing) |
| BUILD | counts as a failed attempt; build-log.md records "Result: FAIL (cap exhaustion)"; attempt N+1 starts with tighter scope |
| QA | counts as a failed cycle; qa-report.md notes "FAIL — cap exhaustion during Check N"; return to BUILD |
| ESCALATE | step up the ladder (see below); if already at top → surface to user |
| DEBRIEF | trim the candidate list to the strongest survivors; note "Debrief truncated at cap — N candidates not evaluated" in the report |

Reaching the hard cap 3× in BUILD is indistinguishable from reaching 3 failed attempts in BUILD — both trigger ESCALATE.

---

## Escalation ladder

On stall, ESCALATE steps up this ladder in order. Each escalation within the same task advances one rung. The ladder is project-tunable.

### Default ladder

```
1. sonnet     (executor tier, normal operation — not actually used for escalation; listed for completeness)
2. opus       (default first escalation target)
3. <user-switched session>   (final fallback — memory bank carries context)
```

### How ESCALATE uses the ladder

1. Read the current ladder step from `current-task/escalation-brief.md#Ladder-step` (initially: 0 = no escalations yet for this task).
2. On first escalation within this task: spawn subagent at step 2 (`opus`).
3. If that subagent also stalls: record in escalation-brief.md that step 2 stalled, advance to step 3 (user fallback), and surface.
4. Do NOT skip steps. Do NOT loop back to a lower step.
5. Cross-task: the ladder resets to 0 when a new task starts (new `current-task/`).

### Re-entry behaviour

If the user takes the step-3 fallback (switches model themselves and re-enters), the re-entered session reads `escalation-brief.md` and knows it is at the top of the ladder. Another stall from there means the task is genuinely beyond the system and the session surfaces to the human rather than re-escalating.

### Per-project overrides

A project may define its own ladder in this file. Example — a project with access to a premium tier:

```
1. haiku
2. sonnet
3. opus
4. opus-thinking
5. <user-switched session>
```

Rules for a valid ladder:
- Rung 1 is the default executor tier (not actually invoked by ESCALATE; listed for clarity)
- Must end with `<user-switched session>` as the final rung — this is the graceful fallback
- Each rung must be a strictly stronger model than the previous (no lateral moves)
- Minimum viable ladder is the default above (opus + user fallback)

---

## Tuning guidance

Budgets and ladder entries are expected to drift as:
- Model pricing changes
- The developer's tier changes
- The project's codebase grows (larger plan_context packs → larger BUILD input)
- The team switches between tool vendors

When a cap feels wrong:
- **Crossing soft caps routinely but completing successfully** → raise soft cap or lower it intentionally to force earlier scope reduction
- **Hitting hard caps without actually stalling the logic** → raise hard cap, or split the state (the task is too large for one pass)
- **Escalations are always going straight to user fallback** → review whether the middle rung is actually stronger than the executor tier for this kind of problem

Record tuning changes in `human/rationale/` so the team can see why a limit was adjusted.

---

## Relationship to operational-context.md

`operational-context.md` contains prescriptive directives about **how to code**. This file contains configuration about **how the agent runs**. They are separate because:

- `operational-context.md` is updated by debrief via propose-diff (heavy process)
- `limits.md` is updated by the human directly (light process, tunable per tier)
- A developer switching from £20/month Sonnet to £100/month Opus Max changes this file; nothing else changes.
