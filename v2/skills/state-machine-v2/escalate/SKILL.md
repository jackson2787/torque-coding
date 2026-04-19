---
name: escalate
description: >-
  ESCALATE state skill. Triggered when BUILD or QA stalls (3 attempts or same-signature
  repeat). Writes escalation-brief.md. Primary path: spawns a subagent with a stronger
  model override (Agent tool with model: "opus"). Fallback path: instructs the user
  to switch model and re-enter — because the memory bank is canonical, nothing is lost.
metadata:
  author: torque-coding
  version: "2.2"
  state-machine: v2
  state: ESCALATE
  model-tier: powerful (via subagent) or user-switched — determined by the ladder
  requires:
    - stalled BUILD or QA (3 attempts, same-signature repeat, or cap exhaustion)
    - current-task/ populated (plan, plan_context, build-log, and usually qa-report)
    - .memory-bank-v2/machine/limits.md (for the escalation ladder)
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
- **Hard cap exhaustion** in BUILD or QA has pushed the cycle counter to its limit (v2.2)
- **ESCALATE's own subagent stalled** and the ladder is not yet at the top rung (v2.2)
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
- [ ] `.memory-bank-v2/machine/limits.md` readable — needed for the ladder (v2.2)

## Procedure

### 1. Detect the environment

Is the Agent tool available?

- **Yes** (Claude Code and compatible environments): take the primary path.
- **No** (plain API, other agent tools without subagent capability): take the fallback path.

Do not skip this step. Environment detection is the first thing the skill does.

### 1a. Resolve the ladder step (v2.2)

Read `.memory-bank-v2/machine/limits.md#Escalation-ladder` for the configured ladder.

Check `current-task/escalation-brief.md` for the current ladder step:
- **Does not exist** → this is the first escalation for this task. Next rung = rung 2 (first non-budget tier — default `opus`).
- **Exists with `Ladder step: N`** → previous escalation was at rung N. Advance: next rung = N+1.

If the next rung is the final rung (`<user-switched session>`):
- Force the **fallback path** regardless of whether the Agent tool is available. The top of the ladder is always the user-switched path.

If advancing would go past the final rung:
- Stop. Surface to human: "Escalation ladder exhausted. The stronger-model attempts did not resolve this task. Manual intervention required." Do not re-escalate.

### 2. Write or update `escalation-brief.md`

Use the template at `v2/templates/machine/current-task/escalation-brief.md`. The brief is self-contained — a stronger model reading it (possibly in a fresh session) must understand the task, what was tried, why it failed, and where to look.

Required sections:
- Task summary (objective and acceptance criteria, copied from `plan.md`)
- Plan context reference (pointer only — the subagent will read `plan_context.md` itself)
- Attempts made (distilled from `build-log.md`)
- Last known error (paste in full)
- Current code state (diff summary)
- Hypotheses explored (and why each was insufficient)
- What the stronger model should consider (directional framing, not a solution)
- **Ladder step** *(v2.2)*: the rung this escalation is targeting (e.g., "Ladder step: 2 — opus")
- **Previous escalations in this task** *(v2.2)*: if any, list each rung that has already been tried and what it returned
- Resume point (how to return control to the state machine)

If `escalation-brief.md` already exists from a previous escalation in this task, **update it in place** — append this rung's attempt to the "Previous escalations" section — rather than overwriting. The audit trail across rungs is valuable.

### 3. Primary path — spawn subagent at the resolved ladder rung (v2.2)

If the Agent tool is available AND the resolved next rung is not the final rung:

```
Agent({
  description: "Escalation from stalled BUILD/QA — ladder step N",
  subagent_type: "general-purpose",
  model: "<resolved-rung-from-limits.md>",   // e.g. "opus" at step 2; per-project override at higher rungs
  prompt: <contents of escalation-brief.md, followed by:
    "You are resolving an escalation at ladder step N. Read
     current-task/plan.md and current-task/plan_context.md. Propose
     and apply a fix, then update current-task/build-log.md with a
     new attempt entry labeled 'Attempt M (post-escalation, ladder step N)'.
     Respect the ESCALATE hard cap from limits.md. Hand control back to
     the state machine by leaving the fix applied — do NOT run QA."
})
```

Rules:
- Pass the model override explicitly — read it from `limits.md`, do not hard-code.
- The subagent's job is the fix, not the verification. QA re-runs on return.
- If the subagent itself stalls (declares unresolvable, or hits its own hard cap), advance the ladder one rung and re-enter this skill. Do not loop at the same rung.
- If the Agent tool errors or is unavailable despite detection, fall through to the fallback path for this escalation (but keep the ladder step recorded — next escalation in this task still advances).

### 4. Fallback path — instruct the user

Take this path if any of:
- Agent tool is not available, or
- Resolved next rung is the final rung (`<user-switched session>`), or
- Primary path failed for this escalation after being attempted.

Output:

```
STALLED in [BUILD|QA] — escalation at ladder step [N/total].

An escalation brief has been written/updated at:
  .memory-bank-v2/machine/current-task/escalation-brief.md

Previous rungs tried in this task: [list]

To resume: switch to a stronger model ([rung name from limits.md]) and re-enter this project.
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
Ladder step last used: [N]      (v2.2)
Last transition: YYYY-MM-DD HH:MM — ESCALATE → [BUILD | QA]
Note: resumed post-escalation at ladder step [N]
```

**Do NOT delete `escalation-brief.md` on resume** (v2.2). Keep it in place so the ladder step is preserved — if this task escalates again, the next escalation advances the ladder rather than restarting at rung 2. The brief is archived to `human/tasks/` by debrief along with the rest of `current-task/`.

The "leaving it in place triggers ESCALATE on re-entry" concern from v2.1 is resolved by reading `activeContext.md#State` first — if State is BUILD or QA, the agent enters that state regardless of `escalation-brief.md` presence. The brief is now a historical record of the ladder progression for this task, not a signal flag.

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

- [ ] Ladder step resolved from `limits.md` and recorded in `escalation-brief.md`
- [ ] `escalation-brief.md` written or updated (preserving prior rungs) with all required sections
- [ ] Environment detected and path chosen (primary / fallback / forced-fallback-at-top-of-ladder)
- [ ] Primary path: subagent spawned with `model: "<rung-from-limits>"` — not hard-coded
- [ ] Fallback path: user instructed clearly, including which model to switch to per the ladder
- [ ] On return: `activeContext.md` reflects resume state including ladder step last used
- [ ] `escalation-brief.md` preserved for the duration of the task (archived by debrief, not removed on resume)

## What This Skill Does NOT Do

- Does NOT write to `operational-context.md` or `constitution.md`.
- Does NOT skip writing `escalation-brief.md` even on the primary path — the brief is also the audit trail.
- Does NOT run tests or the linter — that is QA's job after resume.
- Does NOT auto-escalate constitutional violations — those go to the human directly.
- Does NOT promote a budget model to a stronger model mid-session by wishful thinking — the only mechanisms are Agent subagent override or user-switched session.

## Red Flags — Stop

| Flag | Action |
|---|---|
| Agent tool is available but the subagent itself stalls | Advance the ladder one rung and re-enter this skill. If already at the top rung, surface to human. Do NOT loop at the same rung. |
| Ladder is exhausted (past the final rung) | Surface to human. Task is beyond the system. Do NOT wrap around. |
| `limits.md` missing or unreadable | Fall back to the default ladder embedded in this skill's documentation (`sonnet → opus → user-switched`). Log the fallback. |
| Subagent edits `plan.md` or `plan_context.md` directly | Reject the fix. Route to PLAN for human revision. |
| Subagent edits `constitution.md` or `operational-context.md` | Reject. Those writes go through their dedicated skills only. |
| Fallback path triggered but user returns without switching models | The same budget model will stall again. Re-run escalate; if that was already attempted, surface to human. |
| `escalation-brief.md` already present when escalation triggers (previous unresolved) | Do NOT overwrite. Surface to human — previous escalation was not completed. |

## Configuration: the model ladder (v2.2 — parameterised)

Escalation reads the ladder from `.memory-bank-v2/machine/limits.md#Escalation-ladder`. The default ladder is:

```
1. sonnet                       (budget tier — not an escalation destination; listed for clarity)
2. opus                         (first escalation target)
3. <user-switched session>      (graceful fallback — memory bank carries the context)
```

Per-project overrides are allowed. Rules:
- Rung 1 is the default budget tier (listed for clarity — ESCALATE never targets it).
- Each rung must be a strictly stronger model than the previous.
- The final rung must always be `<user-switched session>`.

See `limits.md` for the full contract and tuning guidance.

## Relationship to v1 and v2.1

There is no direct v1 predecessor. v1's stall protocol surfaced every stall to the human.

v2.1 added a subagent primary path hard-coded to `opus`, with a user-switched fallback.

v2.2 parameterises the ladder, adds ladder-stepping discipline (no skipping rungs, no loops at the same rung), and treats token-cap exhaustion as a first-class stall trigger alongside attempt-count exhaustion.
