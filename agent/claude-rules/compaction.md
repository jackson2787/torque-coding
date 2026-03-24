# Compaction Recovery Protocol

Compaction (context compression) can happen at any time — triggered by the system automatically, by the user via `/compact`, or by platform-level context management. **The agent does not control compaction timing and may not get advance notice.** Therefore, state persistence must be continuous, not deferred to a pre-compaction moment.

## Continuous State Persistence (At Every State Transition)

At each state transition (`EXPLORE → PLAN → BUILD → DIFF → QA → APPROVAL → APPLY → DOCS`), persist the following to the Memory Bank:

1. **State machine position**: Load `.claude/skills/memory-bank/update-active-context/SKILL.md` → update Current State section with current state, substate, cycle count, and loose context
2. **Task progress**: Append current status to `tasks/YYYY-MM/README.md` with `[IN-PROGRESS]` tag
3. **Decisions**: If new architectural decisions, load `.claude/skills/memory-bank/update-decisions/SKILL.md` → append entry

This ensures that when compaction occurs — without warning — the Memory Bank already reflects the latest state.

## After Compaction (Recovery)

When context has been compressed (detected by loss of earlier conversation detail, or after `/compact`):

1. Re-read `activeContext.md` — it was updated at the last transition
2. Confirm state machine position and cycle count from Current State section
3. Resume from saved state — do not restart the current task from scratch
4. Output recovery confirmation:
   ```
   COMPACTION RECOVERY: Resumed [STATE] for [task name]
   Cycle: [n]/[max] | Context restored from: activeContext.md
   ```

## Rules

- State persistence happens at every transition, not "before compaction" — you cannot rely on advance notice
- After detecting compaction, always re-read Memory Bank before taking any action
- If the current state is `APPROVAL` or `DIFF`, the diff summary should already be in `activeContext.md` from the transition save
- Compaction does not reset budgets — cycle count is persisted in `activeContext.md` Current State section
