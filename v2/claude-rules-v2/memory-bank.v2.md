# Memory Bank v2 (v2.2)

**Parallel to**: `agent/claude-rules/memory-bank.md` (v1 — untouched)

---

## Two-Domain Structure

The v2 memory bank has two domains with different purposes, load rules, and writers.

```
.memory-bank-v2/
├── machine/        ← loaded at every session startup — prescriptive, short, present-tense
└── human/          ← loaded on demand only — descriptive, historical, human-readable
```

---

## Machine Domain

### Default load set (every session, in order)

```
1. .memory-bank-v2/machine/constitution.md
2. .memory-bank-v2/machine/operational-context.md
3. .memory-bank-v2/machine/limits.md
4. .memory-bank-v2/machine/activeContext.md
5. .memory-bank-v2/machine/toc.md
```

Load in this order. Constitution first — it is the highest authority and sets the frame for reading everything else. `limits.md` loads before `activeContext.md` because the runtime budgets must be known before any state transition is attempted.

### Machine documents

| Document | Purpose | Update frequency | Skill |
|---|---|---|---|
| `constitution.md` | Stable truths: domain definitions, durable architectural rules, security boundaries, scope. Boring by design. | Rare — requires human ratification | `update-constitution` |
| `operational-context.md` | Current working rules: do this, do not do this, prefer this, avoid this, current constraints, current workflows. Present-tense only. | Per-learning, via debrief | `update-operational-context` |
| `limits.md` *(v2.2)* | Runtime config: per-state token budgets (soft/hard caps) and the escalation ladder. Tunable by the developer's current tier/project. | As tier or project scale changes | Human directly (low ceremony — no dedicated skill) |
| `activeContext.md` | Compaction recovery anchor: current state, progress, session data, pointer to `current-task/` | Every state transition | `update-active-context` *(v1 skill, reused)* |
| `toc.md` | Mechanical index of both machine and human halves | When files are added or removed | `update-toc` *(v1 skill, reused)* |
| `current-task/` *(folder, v2.1)* | Holds all artifacts for the currently active task — at most one task active at a time | Written by state-machine skills during the task lifecycle | `writing-plans-v2`, `plan-contextualize`, `build-loop`, `qa-v2`, `escalate`, `debrief` |

### The current-task/ folder (v2.1)

```
machine/current-task/
├── plan.md                  ← written by writing-plans-v2 (PLAN state)
├── plan_context.md          ← written by plan-contextualize (PLAN-CONTEXTUALIZE state)
├── build-log.md             ← written by build-loop (BUILD state)
├── qa-report.md             ← written by qa-v2 (QA state)
└── escalation-brief.md      ← written by escalate (only when stalled)
```

**Rules for current-task/**:
- **At most one task is active at a time.** If a new task needs to start while `current-task/` is populated, either complete the current task (via debrief) or explicitly abandon it.
- **Loaded at session startup** alongside the other machine files. The budget model reads `plan.md` and `plan_context.md` without any exploration.
- **Archived by debrief.** On successful task completion, debrief moves `current-task/*` into `.memory-bank-v2/human/tasks/YYYY-MM/DDMMDD_<slug>/` and clears `current-task/`.
- **Survives compaction and session handoff.** If the session is lost mid-task, re-entering the project reads `current-task/` and resumes at the appropriate state.
- **Any-state entry uses these files.** The presence or absence of `plan.md`, `plan_context.md`, etc., determines which state a new session enters.

### What machine documents must NOT contain

- `constitution.md`: anything that could be wrong next month, historical rationale, implementation details
- `operational-context.md`: retrospective prose, rationale, "we used to", "historically", "last quarter", endpoint inventory, changelogs

If a line in either machine document uses the past tense to describe a past choice, it belongs in `human/rationale/`, not here.

---

## Human Domain

### Load rules

Human documents are **never loaded at session startup**. Load them on demand only:

- When a task genuinely requires historical context (explicit decision to load, not a reflex)
- When the `debrief` skill needs to write to them
- When the `mb-rebase` skill needs them for calibration
- When the human explicitly says "read the history of X"

### Human documents

```
.memory-bank-v2/human/
├── README.md              ← landing page; explains the human side and links to INDEX files
├── decisions/
│   ├── INDEX.md           ← chronological + topical index; updated by update-human-log
│   └── YYYY/
│       └── YYYY-MM-DD-<slug>.md   ← one ADR per file (full rationale, alternatives, consequences)
├── tasks/
│   ├── INDEX.md
│   └── YYYY-MM/
│       ├── README.md              ← monthly digest
│       └── DDMMDD_<task>.md       ← full task history
├── meetings/
│   ├── INDEX.md
│   └── YYYY-MM-DD-<topic>.md
├── rationale/
│   ├── INDEX.md
│   └── <topic>.md                 ← standing "why we do X" documents
└── progress/
    └── YYYY-Qn.md
```

### Human document writers

**All human-side writes go through `update-human-log`.** Never write to `human/` directly.

`update-human-log` accepts `kind ∈ {task, decision, meeting, rationale, progress}` and routes to the correct path and template.

---

## Write Rules by Document

### constitution.md

- Written only by `update-constitution` skill
- Requires the human to say the word `ratified` in the current message
- Every accepted change appends a dated line to the Change Log
- Conflicting changes are rejected without a rationale-first explanation
- **Debrief never writes constitution.md** — constitutional learnings go to `human/decisions/` as proposals

### operational-context.md

- Written only by `update-operational-context` skill
- Debrief proposes a diff first — always — and waits for human approval before calling the skill
- Voice is enforced: imperative or prohibition, present tense, one sentence per entry, `file:line` evidence required
- Entries that contain retrospective language are rejected and routed to `human/rationale/`
- **Task instructions cannot override its directives** — the human must amend it first

### activeContext.md and toc.md

- Written by v1 skills (`update-active-context`, `update-toc`) — these are reused unchanged
- v2 adds one requirement to `toc.md`: it must index both `machine/` and `human/` halves

### human/* (all human-side documents)

- Written only by `update-human-log` skill
- Never written directly by task work or BUILD LOOP
- Written by debrief after task completion
- INDEX.md files are updated on every write to the corresponding directory

---

## Skill Ownership Table

| File or Directory | Owner Skill | May Also Be Called By |
|---|---|---|
| `machine/constitution.md` | `update-constitution` | Human directly (with `ratified`) |
| `machine/operational-context.md` | `update-operational-context` | Debrief (propose-diff), human directly |
| `machine/limits.md` | Human directly (no dedicated skill) | — |
| `machine/activeContext.md` | `update-active-context` *(v1)* | Debrief (reset to idle), compaction recovery |
| `machine/toc.md` | `update-toc` *(v1)* | Bootstrap |
| `human/**` | `update-human-log` | Debrief, human directly |

---

## What Has Not Changed from v1

- `activeContext.md` shape: Current State / Progress / Session Data (unchanged)
- `toc.md` shape: mechanical index (extended to cover both halves)
- v1 `update-active-context` and `update-toc` skills: reused unchanged
- Compaction recovery anchor: still `activeContext.md`
- Compaction protocol: still continuous (state persisted at every transition)

## What Is New in v2

- `constitution.md` — new highest-authority document (no v1 equivalent)
- `operational-context.md` — replaces the combined role of `architecture.md` + `projectBrief.md` + `productContext.md` for machine execution
- `human/` domain — explicit, separated, on-demand only
- `update-human-log` — single writer for all human-side documents
- Debrief — the only path to update `operational-context.md`

## What Is New in v2.2

- `limits.md` — new machine-side runtime config with per-state token budgets and the escalation ladder
- Cap exhaustion is now a first-class stall signal (equivalent to a failed attempt)
- Escalation ladder is configurable (was hard-coded to `opus` in v2.1)

## What Is Deferred

- v2 parallel for `update-active-context` (v1 skill reused for now)
- v2 parallel for `update-toc` (v1 skill reused for now)
- `mb-rebase-v2` skill
- `compaction.v2.md` rule file
