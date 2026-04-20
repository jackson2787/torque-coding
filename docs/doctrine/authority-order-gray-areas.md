# Authority Order: Gray Areas and Hard Cases

`rules/authority-order.md` has the canonical stack and five worked examples. This document covers the harder, less obvious cases — the ones that look ambiguous in practice and where agents (and humans) most often go wrong.

---

## Recap: the stack

```
Level 1 — constitution.md          (highest)
Level 2 — operational-context.md
Level 3 — task instructions
Level 4 — temporary reasoning      (lowest)
```

Higher always wins over lower. The cases below are interesting because it isn't always obvious which level a rule or instruction belongs to.

---

## Hard Case 1: A task instruction that looks like a new directive

**Situation**: The task says "For this task, always add structured logging to every new function."

**Question**: Is this Level 3 (task instruction, applies to this task only) or does it establish a new Level 2 directive?

**Answer**: It is Level 3. Task instructions are scoped to the task. They cannot promote themselves to Level 2 — that requires the debrief propose-diff flow and human approval.

**What the agent does**: Follow the logging requirement for this task. At debrief, treat "structured logging on every new function" as a candidate learning. Run the five-gate rubric. If it passes, propose it as an operational-context entry.

**The mistake to avoid**: Adding "structured logging on new functions" to `operational-context.md` during the task because the instruction "felt like a policy". Only debrief can write to operational-context.

---

## Hard Case 2: Temporary reasoning that reveals a genuine constraint

**Situation**: During BUILD, the agent reasons: "The test environment doesn't support WebSockets — so I'll use polling instead for this test." This is not written anywhere.

**Question**: Is "test environment doesn't support WebSockets" a Level 4 inference, or a real Level 2 constraint?

**Answer**: It is Level 4 until it is validated and written to `operational-context.md`. The agent should follow its reasoning (polling for the test), then surface this as a `Current Known Constraints` candidate in debrief — with `file:line` evidence (e.g., the test config or CI environment file that proves it). If there's no evidence, it stays as an unconfirmed observation.

**The mistake to avoid**: Treating the agent's inference as an established constraint. "I noticed" is not evidence. A test config line that shows WebSocket support is absent is evidence.

---

## Hard Case 3: Two operational-context directives that point in opposite directions

**Situation**: `operational-context.md#Active Patterns` says "Do This: Use server components by default."
`operational-context.md#Currently Accepted Workflows` says "Currently, the checkout flow is entirely client-rendered for animation continuity."

A new task involves adding a step to the checkout flow. Which directive wins?

**Answer**: Neither beats the other by level — they are both Level 2. Specificity wins. The narrower directive ("checkout flow is entirely client-rendered") is a scoped exception to the broader rule. The agent follows client rendering for the checkout step and notes the override in the plan with the scoped justification.

**What to watch for**: If the two directives look like a genuine contradiction (not a scoped exception), stop and surface to the human. Contradictions in operational-context are a signal that a debrief is overdue.

---

## Hard Case 4: A task instruction that implicitly contradicts a hard directive

**Situation**: `operational-context.md#Active Anti-Patterns` says "Do not call third-party APIs directly from route handlers — use the service layer."

The task instruction says: "Add a `GET /health` endpoint that pings Stripe's status API and returns the result."

The instruction doesn't say "bypass the service layer" — it just describes the behaviour. But implementing it as described requires either calling Stripe from the route handler or creating a new service.

**Answer**: The agent does not get to decide this is acceptable because the contradiction is implicit. It surfaces the tension:

```
This task asks me to ping Stripe's status API from GET /health.
The direct implementation would call a third-party API from a route handler, which
operational-context.md prohibits.

Options:
1. Create a StripeStatusService with a single ping() method, called from the route. 
   Satisfies the task and follows the directive — 2 extra lines.
2. If a bare route handler is intentional for a health check (no business logic risk),
   confirm it — and I'll capture this as a potential scoped exception in debrief.

Which would you prefer?
```

**The mistake to avoid**: Assuming that an implicit contradiction is fine, or that "it's just a health check" overrides the directive. Hard directives don't have carve-outs that aren't written down.

---

## Hard Case 5: Reasoning that concludes the plan is wrong

**Situation**: During BUILD, the agent implements Step 3 of the plan and realizes the implementation in Steps 4–6 will produce the wrong result because of a constraint that wasn't visible during planning (a rate-limiting behaviour buried in a third-party SDK).

**Question**: Does the agent follow the plan anyway (Level 3 wins)? Or does it deviate based on reasoning (Level 4)?

**Answer**: Neither. The agent **stops** and surfaces. Level 3 (task instructions / plan) governs what to build. Level 4 (reasoning) cannot unilaterally authorize deviation. But a plan that the agent can prove is incorrect is not a valid Level 3 instruction — it's a planning error.

```
I've hit a problem at Step 3. [description of the constraint]. This means Steps 4–6
as written will [specific wrong outcome].

I cannot follow the plan as written. Options:
1. Revise the plan from Step 4 — I can propose an updated approach.
2. Return to PLAN state to revise the plan.plan.md with the new constraint.

The relevant constraint is at: [file:line or SDK docs reference].
```

**The mistake to avoid**: Either blindly following a plan the agent knows is wrong, or quietly deviating from it. Both are failures of the operating model.

---

## Hard Case 6: An operational-context entry that has clearly become stale

**Situation**: `operational-context.md#Current Known Constraints` says "Jest 27. Do not use the `--experimental-vm-modules` flag — it is unstable on this version."

The project has been on Jest 29 for six months. The constraint is no longer true.

**Question**: Can the agent just ignore this entry since it's clearly wrong? Can it update it?

**Answer**: Neither. The agent cannot ignore a Level 2 directive during task work, even a stale one. It also cannot update `operational-context.md` unilaterally. 

What it does: surface the staleness during the task, then treat it as a debrief candidate (a "retired directive" classification). The debrief propose-diff flow will remove the entry after human approval.

During the task, if the stale constraint actively blocks the work, surface it immediately:

```
operational-context.md has a constraint that appears stale:
"Do not use --experimental-vm-modules — it is unstable on Jest 27."
The project is on Jest 29, where this flag is stable and recommended.

If I follow this directive, I cannot [X]. If I deviate, I need your explicit confirmation.

Confirm I may treat this constraint as superseded for this task?
```

**The mistake to avoid**: Quietly violating a directive because the agent concluded it was outdated. The human must confirm every deviation from a hard directive.

---

## Hard Case 7: An instruction to "just do it quickly" with no plan

**Situation**: A user says: "Quick fix — just change the button label from 'Submit' to 'Save'. Don't bother with a plan."

**Question**: Can the user's instruction (Level 3) override the sacred rule "No building without an approved plan"?

**Answer**: For trivial, single-character-class changes with no acceptance criteria ambiguity, the spirit of the rule is not violated by skipping the plan. The sacred rule exists to prevent blind BUILD entry on complex tasks.

But the agent should still record the change in a minimal log entry and run a minimal debrief (a task history entry, even if no rubric candidates emerge).

**How to decide**: If writing the plan would take longer than doing the work, and the task has exactly one clearly testable outcome (label changes from X to Y), the plan gate may be waived with human confirmation. Otherwise, insist.

**The mistake to avoid**: Using "quick fix" framing to bypass planning for anything substantive. "Quick" is about size, not about skipping the gate.

---

## Common Patterns Across All Cases

1. **Implicit contradictions require surfacing** — the agent does not resolve ambiguity silently.
2. **Level 4 (reasoning) cannot authorize Level 3 deviations** — reasoning that reveals a problem escalates, it doesn't override.
3. **Stale Level 2 directives are still active until debrief retires them** — the agent cannot quietly ignore them.
4. **Specificity beats generality within the same level** — a narrower scoped directive beats a broad one at Level 2.
5. **Any deviation from a hard directive requires explicit human confirmation** — even when the deviation seems obviously correct.
