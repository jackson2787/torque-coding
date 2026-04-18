# Torque Coding v2 — Notice

A second-generation operating model is under development in this repository.

**v2 source lives in [`v2/`](./v2/README.md).**

---

## What is different in v2

| Topic | v1 | v2 |
|---|---|---|
| Memory domains | One `.memory-bank/` directory | Two domains: `machine/` (loaded every session) and `human/` (on-demand) |
| Governance documents | `projectBrief.md`, `productContext.md`, `architecture.md` mixed together | `constitution.md` (stable truths) + `operational-context.md` (current working rules) |
| Authority order | Implied | Explicit: constitution > operational-context > task instructions > reasoning |
| Terminal phase | DOCS (updates memory bank) | DEBRIEF (applies the five-gate learning rubric before any write) |
| State machine | EXPLORE → PLAN → BUILD → DIFF → QA → APPROVAL → APPLY → DOCS | PLAN → BUILD LOOP → DEBRIEF *(BUILD LOOP decomposition is a future pass)* |
| Task instructions vs. rules | Not formally specified | Task instructions cannot override operational-context; the human must amend it first |

## What is NOT changed

- All v1 files remain untouched. v1 is fully functional.
- Existing skills, agent rules, and claude-rules are not modified.
- The `.memory-bank/` directory (if instantiated) is not affected.

## Where to go

| Goal | File |
|---|---|
| Understand the v2 doctrine | [`v2/README.md`](./v2/README.md) |
| Read the v2 operating model | [`v2/AGENTS.v2.md`](./v2/AGENTS.v2.md) |
| Read the authority order rules | [`v2/claude-rules-v2/authority-order.v2.md`](./v2/claude-rules-v2/authority-order.v2.md) |
| See the constitution template | [`v2/templates/machine/constitution.md`](./v2/templates/machine/constitution.md) |
| See the operational-context template | [`v2/templates/machine/operational-context.md`](./v2/templates/machine/operational-context.md) |
| Read the debrief skill | [`v2/skills/state-machine-v2/debrief/SKILL.md`](./v2/skills/state-machine-v2/debrief/SKILL.md) |

---

*v1 `README.md` is untouched. This file is the v2 pointer only.*
