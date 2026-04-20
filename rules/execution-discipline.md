# Execution Discipline

---

These principles govern how code changes are made, regardless of which state is active. They apply with extra force in BUILD, where the executor model's job is to *apply the plan* — not to design beyond it. Adapted from [Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on common LLM coding pitfalls.

The tradeoff is explicit: these principles bias toward caution over speed. For trivial one-shot edits, use judgment.

---

## 1. Simplicity First

**Minimum code that satisfies the plan. Nothing speculative.**

- No features beyond what the plan specifies.
- No abstractions for code used once.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for scenarios that cannot occur (trust framework guarantees and internal invariants; only validate at system boundaries — user input, external APIs).
- No feature flags, backwards-compatibility shims, or defensive scaffolding when the plan calls for changing the code directly.
- If the implementation is 200 lines and could be 50, rewrite it before declaring done.

**Test**: would a senior engineer reading this diff call it over-engineered? If yes, simplify.

---

## 2. Surgical Changes

**Touch only what the plan touches. Clean up only what your changes broke.**

When editing existing code:
- Don't "improve" adjacent code, comments, formatting, or naming.
- Don't refactor code that isn't broken — even if you'd do it differently.
- Match existing style even if you disagree with it.
- If you notice unrelated dead code or a latent bug, note it for DEBRIEF — do NOT fix it inline.

When your changes create orphans:
- Remove imports, variables, and functions that **your** changes made unused.
- Do NOT remove pre-existing dead code unless the plan calls for it.

**Test**: every changed line must trace directly to a step in `plan.md`. Lines that don't trace are scope creep — remove them before declaring done.

---

## 3. Surface Ambiguity; Do Not Silently Pick

If a plan step admits two reasonable implementations, **stop** — do not pick silently. In the state machine this maps directly to existing rules:

- BUILD: escalate ([build-loop red flag](../skills/state-machine/build-loop/SKILL.md)) — the plan needs disambiguation.
- PLAN: ask the human clarifying questions before drafting acceptance criteria.
- Any state: never hide confusion. Name what is unclear; request the resolution.

This is not the same as "stop at every small choice" — mechanical choices (naming a local variable, picking between equivalent stdlib calls) are normal. The trigger is **two implementations that a reasonable reviewer would argue about**.

---

## Why these live in rules/ and not in a skill

These apply to every state and every tool invocation that writes code. Making them a rule means they load at session startup and stay in context for free — no per-state invocation cost on the executor. A skill would duplicate effort every time BUILD or QA ran.

Cross-references:
- `skills/state-machine/build-loop/SKILL.md` — references this file during the pre-execution pack read
- `skills/state-machine/qa/SKILL.md` — checks surgical-change compliance when reviewing the diff
- `skills/state-machine/debrief/SKILL.md` — uses these principles when evaluating whether a task's diff was clean
