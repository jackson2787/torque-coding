# Human Memory

This directory contains material that is valuable for people but not needed in agent context windows at runtime.

**Agents do not load this directory at session startup.** It is loaded on demand only — when a task genuinely requires historical context, when the debrief skill writes to it, or when explicitly requested.

---

## What lives here

| Directory | What it contains |
|---|---|
| `decisions/` | Architectural decision records — one file per decision. Full rationale, alternatives considered, consequences. |
| `tasks/` | Task histories — what was built, files modified, patterns applied, outcomes. Organised by month. |
| `meetings/` | Meeting outcomes, discussion summaries, alignment notes. |
| `rationale/` | Standing "why we do X" documents. These back up directives in `../machine/operational-context.md`. |
| `progress/` | Quarterly progress notes, trajectory, known-gap rollups. |

---

## What does NOT live here

- Implementation code or config — that belongs in the repo
- Current directives — those belong in `../machine/operational-context.md`
- Stable architectural laws — those belong in `../machine/constitution.md`
- Active state or current task — that belongs in `../machine/activeContext.md`

---

## How writes happen

All writes to this directory go through the `update-human-log` skill.

The debrief skill calls `update-human-log` after each task. The skill routes the write to the correct subdirectory and template, then updates the relevant `INDEX.md`.

Never write to this directory directly. Use the skill.

---

## How reads happen

Load files from this directory on demand. Common load triggers:

- A task needs context from a prior decision: load `decisions/YYYY/<slug>.md`
- A task needs to understand why a pattern exists: load `rationale/<topic>.md`
- A task references historical work: load `tasks/YYYY-MM/<slug>.md`
- `mb-rebase` is comparing current docs to historical intent: may load any file here

Do not bulk-load this directory. Load specific files as needed.

---

## INDEX files

Each subdirectory has an `INDEX.md` that is a flat, chronological list of entries. The `update-human-log` skill updates the relevant `INDEX.md` on every write. If you need to find something, start with the relevant `INDEX.md`.

---

## Directory structure

```
human/
├── README.md                       ← this file
├── decisions/
│   ├── INDEX.md
│   └── YYYY/
│       └── YYYY-MM-DD-<slug>.md   ← one ADR per file
├── tasks/
│   ├── INDEX.md
│   └── YYYY-MM/
│       ├── README.md              ← monthly digest
│       └── DDMMDD_<task>.md       ← individual task history
├── meetings/
│   ├── INDEX.md
│   └── YYYY-MM-DD-<topic>.md
├── rationale/
│   ├── INDEX.md
│   └── <topic>.md
└── progress/
    └── YYYY-Qn.md
```
