# Torque Coding v2 — Operating Model

**Version**: 2.0-dev | **Status**: Additive parallel — v1 remains fully functional

This directory contains the complete v2 operating model. Nothing in `agent/`, `skills/`, `optional-skills/`, or `skill-packs/` has been modified. v2 is additive and parallel.

---

## Why v2 exists

v1's memory bank mixes three kinds of material in one directory:

1. **Durable doctrine** — domain definitions, architectural laws, security boundaries. True for years.
2. **Live working rules** — current patterns, active constraints, how things actually work today. True until the repo evolves.
3. **Human narrative** — task histories, decision rationale, meeting outcomes, why a choice was made. True forever but retrospective.

Agents load all of it. Context windows fill with retrospection that doesn't direct execution. The wrong things are sticky; the right things aren't clearly distinguished.

v2 splits these into two domains and adds a disciplined learning phase.

---

## The two-domain split

### Machine-facing memory — loaded every session

| File | Purpose | Change frequency |
|---|---|---|
| `constitution.md` | Stable truths — domain definitions, durable architectural rules, security boundaries, scope. Rarely changes. | Ceremonial — requires explicit human ratification |
| `operational-context.md` | Current working rules — present-tense directives: do this, do not do this, prefer this, avoid this, current constraints. Updates when the repo evolves. | Per-learning, via debrief |
| `activeContext.md` | *(carried from v1)* — compaction recovery anchor: current state, progress, session data | Every state transition |
| `toc.md` | *(carried from v1)* — mechanical index of both memory halves | When files are added or removed |

### Human-facing memory — loaded on demand only

```
.memory-bank-v2/human/
├── decisions/   — architectural decision records, one file per decision
├── tasks/       — task histories, outcomes, files modified
├── meetings/    — discussion summaries, outcomes
├── rationale/   — standing "why we do X" documents
└── progress/    — quarterly notes
```

Agents do **not** load the human side at startup. They read it on explicit request or when a skill requires it.

---

## Authority order — strict

```
constitution.md
    ↓ overrides
operational-context.md
    ↓ overrides
task instructions
    ↓ overrides
temporary reasoning
```

Task instructions cannot override operational-context rules. The human must amend operational-context first.

See [`claude-rules-v2/authority-order.v2.md`](./claude-rules-v2/authority-order.v2.md) for worked examples.

---

## State machine — direction of travel

```
PLAN → BUILD LOOP → DEBRIEF
```

- **PLAN**: produce an approved implementation plan.
- **BUILD LOOP**: implement, verify, iterate. *(BUILD LOOP skill is a future pass — v2 falls back to v1's BUILD/DIFF/QA/APPROVAL/APPLY cycle until it lands.)*
- **DEBRIEF**: terminal phase. Applies the five-gate learning rubric. Proposes diffs to operational-context.md. Routes task history and decisions to the human side. Replaces v1 DOCS.

See [`claude-rules-v2/state-machine.v2.md`](./claude-rules-v2/state-machine.v2.md).

---

## v2 source structure

```
v2/
├── README.md                               ← this file
├── AGENTS.v2.md                            ← v2 operating model (all agent types)
├── CLAUDE.v2.md                            ← Claude Code adapter
├── bootstrap-memory-bank-v2-contract.md    ← cold-start contract
├── claude-rules-v2/
│   ├── sacred-rules.v2.md                 ← four sacred rules + v2 additions
│   ├── memory-bank.v2.md                  ← two-domain structure and load rules
│   ├── authority-order.v2.md              ← strict authority stack
│   └── state-machine.v2.md               ← PLAN > BUILD LOOP > DEBRIEF spec
├── templates/
│   ├── machine/
│   │   ├── constitution.md               ← blank constitution template
│   │   └── operational-context.md        ← blank operational-context template
│   └── human/
│       └── README.md                     ← human-side landing page template
└── skills/
    ├── memory-bank-v2/
    │   ├── update-constitution/SKILL.md
    │   ├── update-operational-context/SKILL.md
    │   └── update-human-log/SKILL.md
    └── state-machine-v2/
        └── debrief/SKILL.md
```

---

## Coexistence with v1

- v1 source: `agent/`, `skills/` → writes to `.memory-bank/`
- v2 source: `v2/` → writes to `.memory-bank-v2/`
- No file is shared between regimes.
- When both are installed: v2 is canonical (declared in `AGENTS.v2.md`).
- v1 is unaware of v2; the tie-break lives inside the v2 model.

---

## What is deferred to future passes

- `build-loop/SKILL.md` — full BUILD LOOP decomposition
- `writing-plans-v2/SKILL.md`
- `mb-rebase-v2/SKILL.md`
- `compaction.v2.md`
- `v2/docs/` — doctrine prose, migration-from-v1 mapping table
- Skill-pack v2 parallels
- Installer wiring (`bin/`, `lib/`)
