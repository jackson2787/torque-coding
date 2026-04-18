# State Machine v2

**Parallel to**: `agent/claude-rules/state-machine.md` (v1 — untouched)

---

## Overview

**v2 machine**: `PLAN → BUILD LOOP → DEBRIEF`

```
PLAN [user approves] → BUILD LOOP [changes applied] → DEBRIEF [report complete] → PLAN
                              ↑_________________________[new task]__________________↓
```

**Current status**: BUILD LOOP is not yet decomposed into a dedicated skill. Until `v2/skills/state-machine-v2/build-loop/SKILL.md` exists, use the v1 BUILD → DIFF → QA → APPROVAL → APPLY cycle as the concrete implementation of BUILD LOOP. DEBRIEF replaces v1 DOCS.

**State announcement rule**: At every transition, output:
```
[v2 STATE: <STATE>/<SUBSTATE>] Task: <task name or "none">
```

---

## PLAN

**In**: User provides a task contract
**Out**: Approved implementation plan
**Exit**: User approves

### Pre-plan checks

Before writing the plan, load and read:
1. `constitution.md` — check that the task does not contradict any constitutional rule or scope boundary
2. `operational-context.md` — check that the plan respects hard directives; note soft directives relevant to implementation

If the task contradicts constitution or a hard operational-context directive, stop and resolve before planning. See `authority-order.v2.md`.

### Plan content (required)

```markdown
## Plan: [Task Name]

**Analyzed**:
- `path/file.ext:50-100` — [what is there]
- `constitution.md#[Section]` — [relevant rule]
- `operational-context.md#[Section]` — [relevant directive]

**Authority Check**:
- constitution.md conflicts: [none | description]
- operational-context.md conflicts: [none | description]

**Reuse Strategy**:
- Extend `file.ext` — [what to add]
- Cannot reuse [component] because: [specific technical reason]

**Steps**:
1. [Action] — follows operational-context.md#[Section] at `file:line`
2. [Action] — extends `file:line`
3. [Action] — adds tests mirroring `test.ext`

**Integration**: [Component A] calls via [method] | [Service B] update at `file:line`
**Risks**: [Risk] → mitigation: [approach]
**Tests**: Unit: [scenarios] | Integration: [flows] | Manual: [paths]
```

**Exit**: User says "approved", "proceed", "looks good"
**Failures**: Conflicts found → resolve first | Insufficient reuse → extend plan | Ambiguous → ask user

---

## BUILD LOOP

**In**: Approved plan
**Out**: Applied changes (approved by human, applied to branch)
**Exit**: Changes applied successfully

### Current implementation (v1 fallback)

Until `build-loop/SKILL.md` exists, BUILD LOOP is implemented as:

```
BUILD → DIFF → QA → APPROVAL → APPLY
  ↑_______↓_____↓_____[fail or changes requested]
```

Follow the v1 state definitions from `agent/AGENTS.md` for each sub-state — they remain valid. The key difference in v2:

- Reference `operational-context.md` for patterns (not `architecture.md`)
- Reference `constitution.md` for hard constraints (not scattered rule files)
- If a constitutional conflict is discovered mid-BUILD, stop immediately — do not apply the change

### Cycle budget

Max 3 iterations inside BUILD LOOP before STALL. Tracked in `activeContext.md` Current State section. Same stall protocol as v1.

### Exit

Changes applied and user has approved. Transition to DEBRIEF.

---

## DEBRIEF

**In**: Changes applied (BUILD LOOP complete)
**Out**: Debrief report, memory updates (if any learning occurred)
**Exit**: Debrief report presented to human, memory updates applied (or confirmed as none)

Load `v2/skills/state-machine-v2/debrief/SKILL.md`.

### Debrief is mandatory

Debrief always runs. Even if nothing was learned. At minimum, it produces a task history entry in `human/tasks/`.

### What debrief does

1. Reviews task outcome against `operational-context.md`
2. Applies the five-gate rubric to candidate learnings
3. Proposes a diff to `operational-context.md` (if anything passed the rubric)
4. Waits for human approval on the diff before writing
5. Routes task history to `human/tasks/` via `update-human-log`
6. Routes decisions and rationale to `human/decisions/` and `human/rationale/` as applicable
7. Flags any constitutional implications to `human/decisions/` (never writes `constitution.md`)
8. Resets `activeContext.md` to idle via `update-active-context`
9. Presents the Debrief Report

### Debrief does NOT do DOCS

v1 DOCS updated `architecture.md`, `decisions.md`, and task files. In v2:
- `architecture.md` is not used (v2 uses `operational-context.md` instead)
- `decisions.md` is not used (v2 routes to `human/decisions/YYYY/<slug>.md`)
- Task files go to `human/tasks/YYYY-MM/` via `update-human-log`
- Any new patterns or rules learned go through the debrief rubric first

---

## Session boundaries

**Start of session**: Enter PLAN state (or resume from `activeContext.md`). Not EXPLORE.

In v2, the default entry state is PLAN, not EXPLORE. The session begins with a presumption that the human has a task. If no task is provided, the agent may discuss, research, and answer questions — but there is no formal EXPLORE state. All session actions outside of an active task are pre-PLAN.

**End of session without a task**: Return to pre-PLAN. Update `activeContext.md` to "No active task."

**End of session after a completed task**: DEBRIEF runs, then the session ends or a new task begins.

---

## State transition summary

| From | Event | To |
|---|---|---|
| Pre-PLAN | User provides task contract | PLAN |
| PLAN | User approves plan | BUILD LOOP |
| PLAN | User rejects or revises | PLAN (iterate) |
| BUILD LOOP | Tests pass, user approves, changes applied | DEBRIEF |
| BUILD LOOP | Tests fail | BUILD LOOP (cycle n+1) |
| BUILD LOOP | Cycle ≥ 3 | STALL → user intervention |
| BUILD LOOP | Constitutional conflict discovered | Pause → flag → resolve |
| DEBRIEF | Debrief report complete, memory updated | Pre-PLAN |
| DEBRIEF | Constitutional flag raised | Write `human/decisions/` proposal → continue debrief |

---

## Deferred states

The following are planned for future passes and not yet defined:

- **BUILD LOOP** — dedicated `build-loop/SKILL.md` with internal substates (CODING, DIFF_READY, QA_RUNNING, APPROVAL_PENDING, APPLYING)
- **EXPLORE** — may be introduced as a formal optional state for large research-heavy sessions
