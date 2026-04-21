# Agent Zero — User Cheat Sheet

> Legacy quick reference for humans working with the Torque Coding state machine.
> This is not the spec — read `AGENTS.md` for the full operating model.

---

## Driving The Agent — What To Say

These phrases control the state machine. Use them to move forward, go back, or force a state.

| You say | Agent hears | Transition |
|---------|-------------|------------|
| *[paste raw idea]* | "Define the work before planning" | PLAN/IDLE → DEFINE |
| *[paste precise task contract]* | "I have scoped work to plan" | PLAN/IDLE → PLAN |
| "approved" / "looks good" / "proceed" | "Plan is confirmed" | PLAN → PLAN-CONTEXTUALIZE |
| "change X" / "fix Y" / "try again" | "Revise the plan or rebuild after QA" | PLAN or QA → BUILD |
| "debrief" / "capture what we learned" | "Close or summarize the task" | Any → DEBRIEF |
| "revert" | "Throw it all away" | Any → abandon current task |

### Forcing / Recovering State

| You say | What it does |
|---------|-------------|
| "What state are you in?" | Agent announces current position |
| "You are in DEFINE. No file changes." | Corrects an agent that jumped ahead |
| "Re-read activeContext.md and resume." | Recovery after compaction or confusion |
| "Stop. Go back to PLAN." | Forces a retreat when approach is wrong |
| "You're in BUILD, not PLAN. Execute the approved plan." | Corrects an agent replanning instead of building |

---

## The Loop

```
DEFINE → PLAN → PLAN-CONTEXTUALIZE → BUILD → QA → DEBRIEF
```

| State | What happens | You do | Agent does |
|-------|-------------|--------|------------|
| **DEFINE** | Refine the task | Answer sharpening questions | Writes `definition.md`. Changes no product code. |
| **PLAN** | Design the approach | Review and approve the plan | Cites `file:line`, maps reuse, identifies risks |
| **PLAN-CONTEXTUALIZE** | Build the executor pack | Optionally review | Writes `plan_context.md` |
| **BUILD** | Write the code | Wait (or watch) | Implements plan and logs attempts |
| **QA** | Run tests | Wait | Tests, lints, build verification, acceptance checks |
| **DEBRIEF** | Capture learning | Approve any memory updates | Archives task and resets active context |

---

## Starting A Session

Every fresh task starts from **PLAN/IDLE**. From there:

| You want to... | Do this |
|----------------|---------|
| Jump straight to planning | Paste a precise task contract |
| Shape a vague idea first | Say `idea-refine` or `define this`, then proceed from `definition.md` |
| Just understand the code | Ask questions — no state-machine task is needed |
| Fix a bug quickly | Paste a minimal task contract and explicitly skip DEFINE if scope is already clear |

---

## Writing A Task Contract

The agent needs this to skip DEFINE and enter PLAN directly. Minimum viable contract:

```
Task: [what to do]
Context: [what exists, what's affected]
Acceptance criteria:
1. [testable condition]
2. [testable condition]
Constraints: [must/must not]
Instructions: Create a plan for approval. Do not code until approved.
```

Full format lives in `AGENTS.md` and `rules/state-machine.md`. For vague ideas, run `idea-refine` first and let it write `current-task/definition.md`.

---

## Approval Keywords

| Say this | Agent does |
|----------|-----------|
| "approved" / "looks good" / "proceed" | Records plan approval and proceeds to PLAN-CONTEXTUALIZE |
| "change X" / "fix Y" | Revises the plan or returns QA failures to BUILD |
| "revert" | Discards everything |

---

## Memory Bank — What's In It

```
.memory-bank/
├── architecture.md      ← Tech Stack + Patterns + Rules (the big one)
├── activeContext.md      ← Current state + Progress + Session shortcuts
├── projectBrief.md       ← What the project IS
├── productContext.md     ← Who uses it and why
├── decisions.md          ← Architectural Decision Records (append-only)
└── tasks/YYYY-MM/        ← Monthly summaries + task docs
```

The Memory Bank is intentionally hidden under `.memory-bank/`. Treat that as
the canonical path rather than looking for a visible `memory-bank/` folder.

**You rarely touch these directly.** The agent uses per-document skills to write them correctly.

---

## Memory Bank Maintenance

| Situation | Action |
|-----------|--------|
| After first install | Run bootstrap: `Read docs/memory-bank/bootstrap-memory-bank-contract.md and execute it.` |
| Calibrate with human knowledge | `mb-rebase projectBrief.md` (one file at a time) |
| Docs feel stale | `mb-rebase architecture.md` — agent checks for drift, shows you, you confirm |
| Major pivot or refactor | Rebase all foundation docs one by one |
| Total reset | Re-run bootstrap, then rebase each doc |

`mb-rebase` always asks you before writing. Bootstrap never asks — it just scans code and flags gaps.

---

## Skill Injection — Making The Agent Care

The agent loads behavioural skills (accessibility, security, React patterns, etc.) from injection files. You control what gets loaded:

| File | Controls |
|------|----------|
| `.agent/skills/state-machine/writing-plans/references/injected-skills.md` | What disciplines apply during PLAN |
| `.agent/skills/state-machine/build-execution/references/injected-skills.md` | What disciplines apply during BUILD |

Edit these files to add or remove skills. See `skill-packs/plan.injected-skills.md` and `skill-packs/build.injected-skills.md` for pre-populated examples by domain.

For API/framework docs (not behaviour), the agent queries **Context7 MCP** automatically.

---

## When Things Go Wrong

| Symptom | What's happening | Fix |
|---------|-----------------|-----|
| Agent writes code in DEFINE or PLAN | Skipped the state machine | Tell it: "You're in [STATE]. No file changes." |
| Agent builds without plan approval | Broke the PLAN approval gate | Revert. Re-state the rule. |
| Same diff twice | Stall detected | Agent should halt. Give it more context or a different approach. |
| Agent ignores accessibility / security | Injected skills not loaded | Check injection files. Add the missing skill. |
| Post-compaction confusion | Context was compressed | Agent should auto-recover from activeContext.md. If not: "Re-read activeContext.md and resume." |
| MB files getting messy | Drift over time | `mb-rebase` the stale file |
| Agent dumps content in wrong MB section | Update skill not loaded | Tell it: "Use the update-architecture skill." |

---

## The Four Sacred Rules

1. **No new files** without exhaustive reuse analysis
2. **No rewrites** when refactoring is possible
3. **No generic advice** — always cite `file:line`
4. **No ignoring existing architecture** — load patterns before changes

If the agent breaks these, call it out. They're non-negotiable.

---

## Quick Commands

| What | Prompt |
|------|--------|
| Bootstrap memory bank | `Read docs/memory-bank/bootstrap-memory-bank-contract.md and execute it.` |
| Rebase a document | `mb-rebase architecture.md` |
| Start from an idea | Run `idea-refine` / DEFINE, then proceed from `definition.md` |
| Force state awareness | `"What state are you in? Show your state machine position."` |
| Recover after compaction | Usually automatic. If not: `"Re-read activeContext.md and resume from saved state."` |
