---
name: escalate
description: >-
  ESCALATE state skill. Triggered when BUILD or QA stalls (3 attempts or same-signature
  repeat). Writes escalation-brief.md. Primary path: spawns a subagent with a stronger
  model override (Agent tool with model: "opus"). Fallback path: instructs the user
  to switch model and re-enter — because the memory bank is canonical, nothing is lost.
metadata:
  author: torque-coding
  version: "2.1"
  state-machine: v2
  state: ESCALATE
  model-tier: powerful (via subagent) or user-switched
  requires:
    - stalled BUILD or QA (3 attempts or same-signature repeat)
    - current-task/ populated (plan, plan_context, build-log, and usually qa-report)
  produces: .memory-bank-v2/machine/current-task/escalation-brief.md
  resumes-to: BUILD or QA (whichever stalled)
---

# escalate

## Overview

Escalation is the state machine's answer to stall. When a budget model cannot solve a problem in three tries — or keeps hitting the same error — it is time for a stronger model.

The design tenet: the memory bank is canonical. Everything needed to hand a task to a different model lives on disk under `current-task/`. Escalation just routes that pack to a stronger model.

Two paths:

1. **Primary (Claude Code, Agent tool available)**: spawn a subagent with `model: "opus"` (or the top of the configured ladder) and `escalation-brief.md` as its prompt. The subagent returns a fix; control flows back to the state machine.
2. **Fallback (Agent tool unavailable)**: write the brief and tell the user to switch models. The user re-enters the project under a stronger model, reads `current-task/`, and resumes. The fallback is graceful because nothing relies on in-session context.

## When to Use

- BUILD has used 3 attempts without a "declared done"
- QA has FAILed for 3 cycles
- Same error signature has appeared twice in `build-log.md` or `qa-report.md`
- The stalled skill explicitly invokes this one

## When NOT to Use

- Cycle count < 3 and no same-signature repeat → keep trying in the current state
- Constitutional boundary crossed in QA Check 5 → that is a **human escalation**, not a model escalation. Do not auto-spawn a subagent; surface to the human.
- PLAN has produced a bad plan → return to PLAN with the human; do not escalate.

## Preconditions

- [ ] `current-task/plan.md` present
- [ ] `current-task/plan_context.md` present
- [ ] `current-task/build-log.md` present with at least the attempts that triggered the stall
- [ ] `current-task/qa-report.md` present if QA triggered the escalation

## Procedure

### 1. Detect the environment

Is the Agent tool available?

- **Yes** (Claude Code and compatible environments): take the primary path.
- **No** (plain API, other agent tools without subagent capability): take the fallback path.

Do not skip this step. Environment detection is the first thing the skill does.

### 2. Write `escalation-brief.md`

Use the template at `v2/templates/machine/current-task/escalation-brief.md`. The brief is self-contained — a stronger model reading it (possibly in a fresh session) must understand the task, what was tried, why it failed, and where to look.

Required sections:
- Task summary (objective and acceptance criteria, copied from `plan.md`)
- Plan context reference (pointer only — the subagent will read `plan_context.md` itself)
- Attempts made (distilled from `build-log.md`)
- Last known error (paste in full)
- Current code state (diff summary)
- Hypotheses explored (and why each was insufficient)
- What the stronger model should consider (directional framing, not a solution)
- Resume point (how to return control to the state machine)

### 3. Primary path — spawn subagent

If the Agent tool is available:

```
Agent({
  description: "Escalation from stalled BUILD/QA",
  subagent_type: "general-purpose",
  model: "opus",
  prompt: <contents of escalation-brief.md, followed by:
    "You are resolving an escalation. Read current-task/plan.md and
     current-task/plan_context.md. Propose and apply a fix, then update
     current-task/build-log.md with a new attempt entry labeled
     'Attempt N (post-escalation)'. Hand control back to the state machine
     by leaving the fix applied and logging your changes — do NOT run QA."
})
```

Notes:
- Pass the model override explicitly (`model: "opus"` or the top of the configured ladder). Do not rely on the subagent inheriting.
- The subagent's job is the fix, not the verification. QA re-runs on return.
- If the Agent tool returns an error or is not available despite first appearing so, fall through to the fallback path.

### 4. Fallback path — instruct the user

If the Agent tool is not available, output:

```
STALLED after [n] attempts in [BUILD|QA].

An escalation brief has been written to:
  .memory-bank-v2/machine/current-task/escalation-brief.md

To resume: switch to a stronger model (e.g., Opus) and re-enter this project.
The memory bank at .memory-bank-v2/machine/ has everything needed to continue.
On re-entry, the agent will detect escalation-brief.md and pick up from ESCALATE.

Nothing is lost. The fix applies at whichever state stalled (BUILD or QA).
```

Stop. Do not continue without user action.

### 5. On return — resume at the stalled state

Whether the fix came from a subagent (primary) or a user-switched session (fallback), the resume point is:

- If BUILD stalled: re-enter BUILD for a verification pass (usually the subagent's fix itself is the new attempt, and BUILD declares done → QA).
- If QA stalled: re-enter QA to re-run the six checks.

Update `activeContext.md`:

```
State: [BUILD | QA]
Task:  [slug]
Cycle: [reset to 1 for the post-escalation pass]
Last transition: YYYY-MM-DD HH:MM — ESCALATE → [BUILD | QA]
Note: resumed post-escalation
```

Remove (or archive) `escalation-brief.md` once the resume is confirmed. Leaving it in place would trigger ESCALATE on re-entry.

### 6. If the stronger model concludes the plan is wrong

The subagent (or user) may determine that the plan itself — not the implementation — is the problem. In that case:

- The subagent should NOT edit `plan.md` directly.
- It should write a note in `build-log.md` flagging the plan issue.
- Control returns to the human for re-planning.

Update `activeContext.md`:
```
State: PLAN
Task:  [slug — Status reverted to Draft or Superseded]
Last transition: YYYY-MM-DD HH:MM — ESCALATE → PLAN (plan revision)
```

## Output contract

- [ ] `escalation-brief.md` written with all required sections
- [ ] Environment detected (primary or fallback path chosen explicitly)
- [ ] Primary path: subagent spawned with model override; handoff logged in `build-log.md`
- [ ] Fallback path: user instructed clearly; session paused
- [ ] On return: `escalation-brief.md` cleared or archived; `activeContext.md` reflects resume state

## What This Skill Does NOT Do

- Does NOT write to `operational-context.md` or `constitution.md`.
- Does NOT skip writing `escalation-brief.md` even on the primary path — the brief is also the audit trail.
- Does NOT run tests or the linter — that is QA's job after resume.
- Does NOT auto-escalate constitutional violations — those go to the human directly.
- Does NOT promote a budget model to a stronger model mid-session by wishful thinking — the only mechanisms are Agent subagent override or user-switched session.

## Red Flags — Stop

| Flag | Action |
|---|---|
| Agent tool is available but the subagent itself stalls | Surface to human. Do NOT re-escalate infinitely. |
| Subagent edits `plan.md` or `plan_context.md` directly | Reject the fix. Route to PLAN for human revision. |
| Subagent edits `constitution.md` or `operational-context.md` | Reject. Those writes go through their dedicated skills only. |
| Fallback path triggered but user returns without switching models | The same budget model will stall again. Re-run escalate; if that was already attempted, surface to human. |
| `escalation-brief.md` already present when escalation triggers (previous unresolved) | Do NOT overwrite. Surface to human — previous escalation was not completed. |

## Configuration: the model ladder (v2.1 — not yet parameterised)

For now, escalation targets `opus` as the default stronger model. A future v2 pass will add a configurable ladder (e.g., `haiku → sonnet → opus → opus-4.7`) so escalations can step up incrementally. Until then, `opus` is the single escalation tier.

## Relationship to v1

There is no direct v1 predecessor. v1's stall protocol surfaced every stall to the human. v2.1 keeps that as the fallback path but adds a primary path that can self-resolve within Claude Code.
