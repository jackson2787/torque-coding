# Memory Bank

---

## Two-Domain Structure

The memory bank has two domains with different purposes, load rules, and writers.

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
| `limits.md` | Runtime config: per-state token budgets (soft/hard caps) and the escalation ladder. Tunable by the developer's current tier/project. | As tier or project scale changes | Human directly (low ceremony — no dedicated skill) |
| `activeContext.md` | Compaction recovery anchor: current state, progress, session data, pointer to `current-task/` | Every state transition | `update-active-context` |
| `toc.md` | Mechanical index of both machine and human halves | When files are added or removed | `update-toc` |
| `current-task/` | Holds all artifacts for the currently active task — at most one task active at a time | Written by state-machine skills during the task lifecycle | `writing-plans`, `plan-contextualize`, `build-loop`, `qa`, `escalate`, `debrief` |

### The current-task/ folder

```
machine/current-task/
├── plan.md                  ← written by writing-plans (PLAN state)
├── plan_context.md          ← written by plan-contextualize (PLAN-CONTEXTUALIZE state)
├── build-log.md             ← written by build-loop (BUILD state)
├── qa-report.md             ← written by qa (QA state)
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

- Written by `update-active-context` and `update-toc` skills
- `toc.md` must index both `machine/` and `human/` halves

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
| `machine/activeContext.md` | `update-active-context` | Debrief (reset to idle), compaction recovery |
| `machine/toc.md` | `update-toc` | Bootstrap |
| `human/**` | `update-human-log` | Debrief, human directly |

---

## Deferred

- `mb-rebase` skill
- `compaction.md` rule file

See `ROADMAP.md` for the full gap list.
