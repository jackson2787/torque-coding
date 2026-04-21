# Compaction

---

## What compaction means in this system

Compaction is what happens when a tool truncates the session context window — the agent's in-session memory is reduced or cleared. When this happens, the agent cannot recover its train of thought from the conversation alone. **The recovery mechanism is the memory bank on disk.** `activeContext.md` records the current state, and `current-task/` holds every artifact the task has produced. Together they are a complete restart kit.

This rule defines what to do before compaction (to protect in-progress state) and what to do after (to resume correctly).

---

## Before compaction — pre-compaction checklist

If you detect that compaction is imminent (the tool signals a context limit, or the session is unusually long), run this checklist before the compaction occurs:

- [ ] `update-active-context` has been called with the current state — verify the `State:` field in `activeContext.md` reflects where the task actually is
- [ ] The current state's output file is written and complete:
  - If BUILD: `build-log.md` has the current attempt logged, even if mid-attempt (note the stopping point)
  - If QA: `qa-report.md` reflects the current cycle's status (even if partial — note which checks completed)
  - If PLAN or PLAN-CONTEXTUALIZE: `plan.md` or `plan_context.md` is at least partially written, with a `<!-- STOPPED HERE -->` note at the cutoff point
  - If ESCALATE: `escalation-brief.md` is written
- [ ] No open tool calls are pending (do not compact mid-tool-call if avoidable)

If compaction is **involuntary** (the tool compacts without warning), skip the checklist — go directly to the post-compaction restore below.

---

## Post-compaction restore — new session, same task

Run these steps in order when starting a new session after compaction:

1. Output the compliance statement (from `AGENTS.md` or `CLAUDE.md`)
2. Read machine memory in load order:
   ```
   .memory-bank-v2/machine/constitution.md
   .memory-bank-v2/machine/operational-context.md
   .memory-bank-v2/machine/limits.md
   .memory-bank-v2/machine/activeContext.md
   ```
3. Read the rule files (if not already loaded via `@-imports`):
   ```
   rules/sacred-rules.md
   rules/memory-bank.md
   rules/authority-order.md
   rules/state-machine.md
   rules/compaction.md   ← this file
   ```
4. Read `current-task/` files that are listed as **present** in `activeContext.md#Current-Task-Pointer`
5. Resolve the entry state from `activeContext.md` — the `State:` field is the resume point
6. Output:
   ```
   [COMPACTION RECOVERY] Resuming from: [State] — Task: [slug or none]
   ```
7. Continue from the resume point as if the prior session had just completed that state's last logged output — do not repeat completed steps

---

## What survives compaction and what does not

| Survives | Does NOT survive |
|---|---|
| All `current-task/` files on disk | In-session reasoning and chain-of-thought |
| `activeContext.md` state fields | Tool call results not written to disk |
| `definition.md`, `plan.md`, `plan_context.md`, `build-log.md`, `qa-report.md` | Conversation history not captured in a `current-task/` file |
| `operational-context.md` directives | Ephemeral session notes not written to `activeContext.md#Session-Data` |
| The escalation ladder position (in `activeContext.md`) | Any reasoning that was not acted upon (no file written, no state updated) |

The practical implication: **anything important must land in a file before it is safe**. Mid-attempt reasoning that has not been written to `build-log.md` or `plan_context.md` is lost on compaction. This is by design — it forces state to disk rather than keeping it in the session.

---

## Cross-references

- `skills/memory-bank/update-active-context/SKILL.md` — the skill that must be called before compaction to ensure `activeContext.md` is current
- `AGENTS.md` and `CLAUDE.md` — the session startup procedures that define the default load set (same files this restore procedure reads)
- `rules/state-machine.md#Any-state-entry` — the entry-state table used in step 5 above
