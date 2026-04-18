---
name: debrief
description: >-
  Terminal phase of the v2 state machine (PLAN → BUILD LOOP → DEBRIEF). Runs after
  every task — never skipped. Compares the task outcome against operational-context.md
  to determine whether anything memory-worthy was learned. Applies the five-gate rubric
  to candidate learnings. Proposes diffs to operational-context.md with human approval
  before writing. Routes task history and decisions to the human side. Replaces v1 DOCS.
metadata:
  author: torque-coding
  version: "2.0"
  state-machine: v2
  replaces: v1 DOCS state
---

# Debrief

## Overview

Debrief is the last phase of every task. Its job is to answer one question cleanly:

> Did this task teach us something that should change how future agents work?

Most tasks answer "no." That is correct. The human side still gets a task history. The machine side stays clean.

When the answer is "yes," debrief applies a strict rubric, shows the human a diff, waits for approval, then writes. It never writes unilaterally.

## When to Use

Always. After every task. After changes are applied and the user has approved.

## When NOT to Use

- The task was abandoned before applying changes (still write the task history with `kind=task`, status=Abandoned)
- The user says "skip debrief" — note this in the task history and stop (rare, acceptable)

---

## Inputs

Gather these before beginning debrief:

- [ ] The task contract (objective, acceptance criteria, constraints)
- [ ] The final diff (what was actually changed)
- [ ] QA results
- [ ] Any notes taken during BUILD LOOP
- [ ] `operational-context.md` (read — do not modify during gathering)
- [ ] `constitution.md` (read — do not modify during gathering)

---

## Phase 1: Candidate Identification

Read through the task diff, QA results, and BUILD LOOP notes. Identify candidate learnings — things the task revealed that *might* change how future agents should work.

### Candidate signals to look for

- A pattern was applied for the first time and worked well → could become a new directive
- An existing operational-context directive was followed and confirmed correct → probably churn
- An existing operational-context directive was found to be outdated or counterproductive → updated directive
- A pattern was attempted and failed or caused problems → could become an anti-pattern
- A previously unknown constraint was discovered → could become a known constraint
- An existing constraint was resolved or removed → retired directive
- The task revealed something about the system's architecture that should be recorded → possible constitutional proposal

Write down each candidate as one sentence. You will apply the rubric to each in Phase 2.

### Churn signals — discard these immediately

If a candidate is any of the following, discard it without applying the rubric:

| Churn category | Example |
|---|---|
| Endpoint was added or changed | "Added GET /users/:id" |
| Test was added | "Added unit test for UserService" |
| Dependency was bumped | "Upgraded Next.js from 15.0 to 15.1" |
| Bug was fixed at a single call site | "Fixed null check in auth.ts:45" |
| Refactor internal to one module | "Extracted helper in reports.ts" |
| Anything qualified by "just in this case" | "Used direct fetch just for this one endpoint" |

---

## Phase 2: The Five-Gate Rubric

For each candidate that survived churn filtering, apply all five gates in order. A candidate must pass ALL five to be memory-worthy.

### Gate 1 — Generalisability

Does this learning apply beyond the current task?

**Pass**: "All new public RPC routes should follow the outer-wrapper / inner-invoker pattern."
**Fail**: "This task added a GET /users/:id endpoint."

Ask: "Would a different agent working on a different task benefit from knowing this?"

### Gate 2 — Repeatability

Would we want a future agent to do this the same way again?

**Pass**: "Prefer streaming responses for list endpoints returning > 100 rows."
**Fail**: "This one-off migration script ran once and will not run again."

Ask: "If we do a similar task next month, should the agent default to this approach?"

### Gate 3 — Conflict or Supersession

Does this contradict, refine, or fill a gap in existing `operational-context.md`?

**Pass (new)**: No existing directive covers this territory.
**Pass (conflict)**: A previously trusted approach no longer works well.
**Pass (refinement)**: A current directive needs a clarifying exception or tightening.
**Fail**: Pure restatement of an existing directive.

Ask: "Is there already a line in operational-context.md that says this?"

### Gate 4 — Evidence

Is there at least one concrete `file:line` or commit that demonstrates the learning?

**Pass**: Points to actual code that a future agent can inspect to understand the pattern.
**Fail**: Abstract claim with no anchor. "It felt better" or "we noticed" without a reference.

Ask: "What file:line proves this is true?"

### Gate 5 — Durability

Is the learning expected to remain true for the foreseeable future?

**Pass**: Architectural preference, confirmed workflow, codified constraint.
**Fail**: Temporary condition tied to a one-off incident. "For this release only."

Ask: "Would this still be true six months from now, assuming normal repo evolution?"

---

## Phase 3: Classification

For each candidate that passed all five gates, classify it into exactly one category:

| Category | Action |
|---|---|
| **New directive** | Add to `operational-context.md` in the correct section |
| **Updated directive** | Replace an existing entry in `operational-context.md`; archive old text to `human/rationale/` |
| **Retired directive** | Remove an existing entry from `operational-context.md`; write removal rationale to `human/rationale/` |
| **Constitutional proposal** | DO NOT write to `constitution.md`. Write a proposal to `human/decisions/` and flag for human ratification. |

### Constitutional threshold

A learning crosses into constitutional territory if it touches:
- A domain definition
- A fundamental scope boundary
- A durable architectural law
- A security or compliance constraint

If in doubt, ask: "If this were wrong, would it take a major, deliberate conversation to fix?" If yes → constitutional. If no → operational.

---

## Phase 4: Propose Diff (if any memory-worthy learning)

If at least one candidate passed the rubric and was classified as new/updated/retired directive:

1. Draft the proposed `operational-context.md` change as a visible diff:
   ```diff
   ## Active Patterns — Do This

   - Route all external HTTP calls through `src/lib/http-client.ts`. Evidence: `src/lib/http-client.ts:1`
   + - New public RPC routes use the outer-wrapper / inner-invoker pattern. Evidence: `src/api/routes/users.ts:12`
   ```

2. Present the diff to the human with a brief rationale:
   ```
   Debrief: one learning passed the rubric.

   Proposed change to operational-context.md:
   [diff]

   Rationale: [one sentence from rubric analysis]

   Reply "apply" to write this change, "no" to discard, or "revise [X]" to adjust.
   ```

3. Wait for human response:
   - "apply" → load `update-operational-context` and apply the change
   - "no" → discard the proposed change; note in debrief report
   - "revise [X]" → revise the diff and present again

**Do not write to `operational-context.md` without an "apply" response.** Even for purely additive entries.

### If no learning passed the rubric

Skip Phase 4. Note "No operational-context changes" in the Debrief Report.

---

## Phase 5: Human-Side Writes

After the operational-context question is resolved (applied, discarded, or confirmed as none):

### Always — task history

Load `update-human-log` with `kind=task`.

The task history is written after every task without exception, including tasks with no learning.

Required fields: objective, outcome, files modified, patterns applied, debrief result.

### If a decision was made

Load `update-human-log` with `kind=decision`.

Write one ADR file per significant architectural decision. Include the full context, alternatives, consequences.

### If a directive was updated or retired

Load `update-human-log` with `kind=rationale`.

Archive the old directive text with a note explaining why it was changed or removed.

### If a constitutional flag was raised

Load `update-human-log` with `kind=decision`.

Write a constitutional proposal. Set `Status: Proposed`. Note that ratification is required before `update-constitution` may apply it. Do NOT also write to `constitution.md`.

---

## Phase 6: Reset activeContext

Load `skills/memory-bank/update-active-context/SKILL.md` (v1 skill, reused).

Update Current State section:
```
State: PLAN/IDLE
Task: none
Debrief: YYYY-MM-DD — [task slug] — [no learning | new rule | updated pattern | retired rule | constitutional flag]
```

---

## Phase 7: Debrief Report

Present the Debrief Report to the human. This is the exit confirmation.

```
## Debrief Report: [task name]
Date: YYYY-MM-DD

### Candidates considered
Total: [n] | Passed rubric: [n] | Churn: [n]

### Memory-side changes
[none]
OR:
- operational-context.md: [added | updated | retired] — "[one-line directive]"

### Constitutional flags
[none]
OR:
- Proposed: "[what" — Requires ratification. See: human/decisions/YYYY/YYYY-MM-DD-<slug>.md

### Human-side writes
- human/tasks/YYYY-MM/DDMMDD_<task>.md ✓
- human/decisions/YYYY/YYYY-MM-DD-<slug>.md ✓ (if applicable)
- human/rationale/<topic>.md ✓ (if applicable)

### State
activeContext.md reset to PLAN/IDLE ✓
```

---

## Red Flags — Stop

Stop and surface to the human if:

| Flag | Action |
|---|---|
| Debrief is considering writing to `constitution.md` | Stop. Route to `human/decisions/` as a constitutional proposal. |
| More than 3 candidates passed the rubric | Slow down. This many changes at once is suspicious. Review each again. |
| A proposed directive is vague or not one imperative sentence | Reject. Rewrite or discard. |
| A proposed directive has no `file:line` evidence | Reject. Ask for evidence. |
| A proposed directive is past-tense | Reject. Route to `human/rationale/`. |
| The human says "apply" but the proposed change conflicts with `constitution.md` | Stop. Flag the conflict. Do not write. |

---

## Exit Condition

Debrief is complete when all of the following are true:

- [ ] Five-gate rubric applied to all candidates
- [ ] operational-context.md change proposed and either applied or confirmed as none
- [ ] `human/tasks/YYYY-MM/DDMMDD_<task>.md` written
- [ ] `human/decisions/` written (if applicable)
- [ ] `human/rationale/` written (if applicable)
- [ ] `activeContext.md` reset to PLAN/IDLE
- [ ] Debrief Report presented to human

---

## Relationship to v1 DOCS

| v1 DOCS | v2 DEBRIEF |
|---|---|
| Loads per-document skills to update memory bank | Applies rubric first — most tasks produce no machine-side change |
| Updates `architecture.md`, `decisions.md`, task docs | Updates `operational-context.md` (if learning passed) and writes to `human/` |
| No learning filter | Five-gate filter — churn is explicitly rejected |
| Task docs go to `.memory-bank/tasks/` | Task histories go to `.memory-bank-v2/human/tasks/` |
| Writes decisions to `decisions.md` (append-only single file) | Writes decisions to `human/decisions/YYYY/<slug>.md` (one file per decision) |
| No constitutional distinction | Constitutional implications flagged separately; never written during task work |
