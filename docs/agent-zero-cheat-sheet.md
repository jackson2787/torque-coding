# Agent Zero — User Cheat Sheet

> Quick reference for humans working with the AGENTS 2.3 state machine.
> This is not the spec — read `AGENTS.md` for the full operating model.

---

## Driving The Agent — What To Say

These phrases control the state machine. Use them to move forward, go back, or force a state.

| You say | Agent hears | Transition |
|---------|-------------|------------|
| *[paste task contract]* | "I have work to do" | EXPLORE → PLAN |
| "approved" / "looks good" / "proceed" | "Plan is confirmed" | PLAN → BUILD |
| "change X" / "fix Y" / "try again" | "Go back and revise" | APPROVAL → BUILD |
| "approved" / "looks good" / "ship it" | "Code is confirmed" | APPROVAL → APPLY |
| "document it" / "update the memory bank" | "Write the docs" | APPLY → DOCS |
| "revert" | "Throw it all away" | Any → discard, back to EXPLORE |

### Forcing / Recovering State

| You say | What it does |
|---------|-------------|
| "What state are you in?" | Agent announces current position |
| "You are in EXPLORE. No file changes." | Corrects an agent that jumped ahead |
| "Re-read activeContext.md and resume." | Recovery after compaction or confusion |
| "Stop. Go back to PLAN." | Forces a retreat when approach is wrong |
| "You're in BUILD, not PLAN. Execute the approved plan." | Corrects an agent replanning instead of building |

---

## The Loop

```
EXPLORE → PLAN → BUILD → DIFF → QA → APPROVAL → APPLY → DOCS → EXPLORE
```

| State | What happens | You do | Agent does |
|-------|-------------|--------|------------|
| **EXPLORE** | Read-only investigation | Ask questions, explore ideas | Reads code, discusses, researches. Changes nothing. |
| **PLAN** | Design the approach | Review and approve the plan | Cites `file:line`, maps reuse, identifies risks |
| **BUILD** | Write the code | Wait (or watch) | Implements plan, writes tests, generates diff. Does NOT apply. |
| **DIFF** | Present changes | Review the diff | Shows rationale, MB references, integration points |
| **QA** | Run tests | Wait (or grant waiver) | Tests, lints, coverage, build verification |
| **APPROVAL** | Human gate | Say "approved" or request changes | Presents summary, waits for your word |
| **APPLY** | Apply to branch | Nothing | Applies diff, verifies, reports |
| **DOCS** | Update memory bank | Nothing | Uses per-document skills to update MB files |

---

## Starting A Session

Every session lands in **EXPLORE**. From there:

| You want to... | Do this |
|----------------|---------|
| Jump straight to work | Paste a task contract |
| Shape a vague idea first | Say `Create task contract` or use the `idea-to-task` skill, then paste the output |
| Just understand the code | Ask questions — stay in EXPLORE as long as you want |
| Fix a bug quickly | Paste a minimal task contract, agent uses Fast Track MB load |

---

## Writing A Task Contract

The agent needs this to leave EXPLORE. Minimum viable contract:

```
Task: [what to do]
Context: [what exists, what's affected]
Acceptance criteria:
1. [testable condition]
2. [testable condition]
Constraints: [must/must not]
Instructions: Create a plan for approval. Do not code until approved.
```

Full format in AGENTS.md Section 5. Or say `Create task contract` / use `idea-to-task` to generate one from conversation. When the skill runs, it will announce `Ideas to Task Contract running...` in-session first.

---

## Approval Keywords

| Say this | Agent does |
|----------|-----------|
| "approved" / "looks good" / "ship it" | Proceeds to APPLY |
| "change X" / "fix Y" | Returns to BUILD |
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
├── toc.md                ← File index
└── tasks/YYYY-MM/        ← Monthly summaries + task docs
```

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
| Agent writes code in EXPLORE | Skipped the state machine | Tell it: "You're in EXPLORE. No file changes." |
| Agent applies without approval | Broke the APPROVAL gate | Revert. Re-state the rule. |
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
| Start from an idea | Use `idea-to-task` skill, then paste the contract |
| Force state awareness | `"What state are you in? Show your state machine position."` |
| Recover after compaction | Usually automatic. If not: `"Re-read activeContext.md and resume from saved state."` |
