# AGENTS.md — User Guide

**For**: Developers using AGENTS.md v2.2 to work with AI coding agents
**Compatible with**: Claude, Cursor, Copilot, Cline, Aider, and all AGENTS.md-compatible tools

---

## What Is AGENTS.md?

AGENTS.md is a single configuration file that controls how an AI coding agent behaves in your project. Instead of giving the agent a personality or pretending it's a team of specialists, AGENTS.md defines a structured workflow — a set of rules, states, and quality gates that the agent follows every time it works on your code.

Think of it as a process manual for an employee who starts fresh every morning with no memory of yesterday. The file tells the agent: here's how you work here, here's where to find what you need to know, here's what you're not allowed to do, and here's how to ask for help when you're stuck.

The agent reads this file at the start of every session. Everything it needs to behave consistently lives in this one document.

---

## Core Concepts

### You Lead, the Agent Executes

AGENTS.md is built on a principle it calls GIGO — garbage in, garbage out. The quality of the agent's work is directly proportional to the quality of your input. The agent will remind you of this at the start of every session:

```
COMPLIANCE CONFIRMED: Reuse over creation

⚠️  GIGO PREVENTION - User Responsibilities:
📋 Clear task objectives | 🔗 Historical context | 🎯 Success criteria
⚙️  Architectural constraints | 🎖️ You lead - clear input = excellent output
```

This means your job is to provide clear task objectives, point the agent to relevant history, define what success looks like, and flag any architectural constraints. The agent's job is to execute within those boundaries.

### Reuse Over Creation

The single most important rule in the entire system. AI coding agents have a strong tendency to create new files and write new code from scratch rather than extending what already exists. This leads to duplication, inconsistency, and an expanding codebase that drifts away from its own patterns.

AGENTS.md enforces four rules to prevent this:

1. **No new files without reuse analysis** — The agent must search the codebase, identify existing files that could be extended, and explain why they can't be before creating anything new.
2. **No rewrites when refactoring is possible** — Incremental improvement over starting over.
3. **No generic advice** — Every suggestion must cite a specific file and line number.
4. **No ignoring existing architecture** — The agent must load and follow your project's established patterns.

If the agent proposes creating a new file, it should show you a checklist proving it looked for alternatives first.

### The Memory Bank

The agent has no memory between sessions. When a conversation ends or the context window resets, everything the agent learned is gone. The Memory Bank solves this by giving the agent a structured set of files on disk that persist between sessions.

The Memory Bank lives in a `memory-bank/` directory in your project:

```
memory-bank/
├── toc.md                    # Index of everything
├── projectbrief.md           # What the project is, its goals
├── productContext.md          # Who uses it, market context
├── systemPatterns.md          # How the architecture works
├── techContext.md             # Tech stack, tools, versions
├── activeContext.md           # What's happening right now
├── progress.md                # Current status, blockers
├── projectRules.md            # Coding standards, conventions
├── decisions.md               # Architectural decision records
├── quick-start.md             # Common patterns, shortcuts
├── database-schema.md         # Data models (if applicable)
├── build-deployment.md        # How to build and deploy
├── testing-patterns.md        # How tests are structured
└── tasks/
    └── YYYY-MM/
        ├── README.md          # Monthly summary of work done
        └── DDMMDD_task.md     # Individual task records
```

**Your responsibility**: Keep the Memory Bank accurate. It's the agent's only source of truth about your project. If `systemPatterns.md` is outdated, the agent will follow outdated patterns. If `activeContext.md` doesn't reflect current priorities, the agent will work on the wrong things.

**When files get updated**: The agent updates the Memory Bank at specific moments — after major features are completed, when new patterns are discovered, when architectural decisions are made, or when you explicitly ask it to. Routine bug fixes and small changes don't trigger full MB updates.

### Creating The Initial Memory Bank

On Day 1, create the initial Memory Bank by pointing the AI to
`.agent/bootstrap-memory-bank-contract.md`.

That contract tells the AI to:

- inspect code, config, tests, manifests, CI, schemas, and runtime files first
- avoid using README files or other prose as grounding truth during the primary sweep
- draft the five foundation files of the Memory Bank
- keep anything human-dependent in clearly labeled pending-confirmation sections
- add the minimum operational scaffolding needed for normal AGENTS.md startup

This keeps the initial Memory Bank grounded in repo evidence without forcing the
agent to invent product goals or local rules that the codebase cannot prove.

---

## How a Session Works

### Starting a Session

Every session follows the same startup sequence:

1. The agent outputs the compliance confirmation
2. It attaches any MCP servers defined in your project
3. It loads the Memory Bank
4. It logs the session start

The amount of Memory Bank the agent loads depends on what you're about to do. There are three loading modes:

**Fast Track** — For bug fixes and small changes. The agent reads only the current month's task README and recent priorities. It gets oriented in seconds and starts working. This is also the mode used after a context compression event (more on that below).

**Standard Discovery** — For features, tests, and quality-critical work. The agent reads the full set of core Memory Bank files: project brief, system patterns, tech context, active context, and progress. It scans for any additional instruction files. This gives it a complete picture of your project before it starts making changes.

**Deep Dive** — For architectural changes and legacy investigation. The agent reads everything Standard does, plus historical task records and the decisions log. This gives it the full history of why things were built the way they were — not just what exists, but what was considered and rejected.

You don't need to tell the agent which mode to use. It chooses based on the complexity of your task. But you can guide it — if you're asking for a quick fix and the agent starts doing a Deep Dive, tell it to use Fast Track.

### Giving the Agent a Task

The most effective way to hand the agent a task is with a structured task contract. This isn't mandatory for simple work, but for anything non-trivial it dramatically improves results:

```markdown
## Task: [Clear, specific objective]

### Context
- **Repository**: [path or monorepo location]
- **Related Work**: [prior tasks, MB entries]
- **Constraints**: [arch rules, security, performance]
- **Affected Systems**: [components, services, modules]

### Expected Outcomes
- **Acceptance Criteria**:
  1. [Specific, testable criterion]
  2. [Specific, testable criterion]
- **Definition of Done**: [when truly complete]

### Historical Reference
- **Prior Tasks**: [links to tasks/YYYY-MM/DDMMDD_*.md]
- **Arch Decisions**: [links to decisions.md entries]
- **Related Patterns**: [refs to systemPatterns.md, projectRules.md]

### Architectural Constraints
- **Must Follow**: [specific patterns from MB]
- **Must Extend**: [specific existing files]
- **Must Not**: [anti-patterns, approaches to avoid]

### Instructions
Create outline for approval. After approval, do work.
Do not document until I approve completion.
```

For simple tasks, a clear one-liner is fine: "Fix the null check in `services/auth.ext:45` — it should return 401, not 500." The agent will still follow the full workflow, but it doesn't need a formal contract to understand what you want.

---

## The State Machine: How Work Progresses

Every task moves through a defined sequence of states. The agent cannot skip states or reorder them. This is the backbone of the system.

```
PLAN → BUILD → DIFF → QA → APPROVAL → APPLY → DOCS
```

Here's what happens at each state and what's expected of you:

### PLAN

The agent analyses your task against the codebase and Memory Bank, then presents an implementation plan. The plan includes what files it analysed, its reuse strategy (what it will extend vs. create new), the steps it will take, integration points, risks, and a testing approach.

**What you do**: Read the plan. If it looks right, approve it with "approved", "proceed", or "looks good". If something is wrong, tell the agent what to change — it will revise the plan and present it again. If the plan shows the agent creating unnecessary new files, push back.

### BUILD

The agent implements the approved plan. It works in a sandbox branch, never on main. It writes code, adds tests, and generates a diff. Critically, it does not apply the changes yet — it just prepares them.

**What you do**: Nothing. This state is automated. The agent moves to DIFF when implementation is complete.

### DIFF

The agent presents the proposed changes as a unified diff with rationale. It explains what it modified, why, and how the changes integrate with existing code. Every change references specific Memory Bank entries and existing patterns.

**What you do**: Review the diff if you want to see the details. The agent automatically moves to QA after presenting it.

### QA

The agent runs the test suite, linters, coverage checks, and build verification. It reports structured results:

```
Tests: ✅ PASS | Total: 145 | Passed: 145 | Failed: 0
Linter: ✅ PASS | Errors: 0 | Warnings: 0
Coverage: Overall: 87.3% (+2.1%) | New code: 95.2%
Build: ✅ SUCCESS
```

If QA fails, the agent loops back to BUILD to fix the issues. It gets three attempts. After three consecutive failures, it halts and asks you for help (this is the stall detection protocol — more on that below).

**What you do**: Nothing if QA passes. If the agent reports a stall, you'll need to provide guidance.

### APPROVAL (Human Gate)

This is the most important state for you. The agent presents the completed work — files modified, test results, security review, and a documentation plan — and waits for your explicit approval.

**What you say**:
- "approved", "looks good", "ship it" → The agent applies the changes
- "change X", "fix Y" → The agent goes back to BUILD with your feedback
- "revert" → The agent discards everything

The agent will not proceed without a clear response. If your answer is ambiguous, it will ask for clarification.

### APPLY

The agent applies the approved changes to the sandbox branch and verifies the application was successful. If something goes wrong, it rolls back automatically and reports the error.

**What you do**: Nothing. This is automated.

### DOCS

The agent creates documentation: a task record in `memory-bank/tasks/YYYY-MM/`, an update to the monthly README, and updates to any relevant Memory Bank files (new patterns, architectural decisions, etc.).

**What you do**: Nothing. The task is complete after this state.

### Failure Loops

The state machine isn't just a straight line. When things fail:

- **QA fails** → Back to BUILD (up to 3 times, then stall)
- **User requests changes at APPROVAL** → Back to BUILD
- **APPLY fails** → Automatic rollback, back to BUILD
- **Major rethink needed** → All the way back to PLAN

---

## Skills: Specialised Behaviour Within States

AGENTS.md uses optional skill files (stored in `.agent/skills/`) to nudge the agent's behaviour inside specific states. These are not personas or sub-agents — they're focused instruction sets that load alongside the state machine.

The current skill nudges are:

| State | Skill | Purpose |
|-------|-------|---------|
| PLAN | `writing-plans/SKILL.md` | Structures how the agent writes implementation plans |
| BUILD | `build-execution/SKILL.md` | Guides implementation approach |
| QA | `verification-before-completion/SKILL.md` | Prevents premature "pass" claims |
| QA (on failure) | `systematic-debugging/SKILL.md` | Structures debugging when tests fail |
| DOCS | `writing-docs/SKILL.md` | Formats documentation output |

The key rule: **the state machine is the source of truth.** Skills nudge behaviour inside a state; they never redefine transitions, skip gates, or override the workflow.

---

## Compaction: What Happens When Context Gets Full

AI models have a finite context window — the total amount of text they can "see" at once. As a session gets long (lots of back-and-forth, large diffs, tool outputs), older parts of the conversation get compressed or dropped to make room. This is called compaction.

**Why it matters**: If the agent was holding important information only in conversation memory — a verbal constraint you mentioned, a design decision you discussed but never wrote down — that information disappears when compaction happens.

**How AGENTS.md handles it**: The Compaction Protocol ensures the agent never relies on conversation memory for anything important. At every state transition, the agent writes its current state to the Memory Bank:

- Where it is in the state machine → `activeContext.md`
- Task progress → monthly README
- Decisions made → `decisions.md`
- Anything that only exists in conversation → `activeContext.md`

This happens continuously, not as a "save before compaction" event — because the agent can't predict when compaction will occur.

**After compaction**: The agent detects that it's lost conversation detail, re-reads the Memory Bank using Fast Track mode, confirms where it was, and resumes. You'll see a recovery message:

```
COMPACTION RECOVERY: Resumed [STATE] for [task name]
Context restored from: activeContext.md, tasks/YYYY-MM/README.md
```

**What you should do**: Nothing special. If you notice the agent seems to have forgotten something that was only discussed verbally and not captured in the MB, remind it. The system is designed to minimise this, but verbal-only context is always the most vulnerable.

---

## Budgets: Preventing Runaway Work

Every task has three budget types that prevent the agent from spinning indefinitely:

**Cycles** (default: 3) — The maximum number of BUILD → QA loops before the agent must stop and ask for help. If the agent has tried three times and QA still fails, something is fundamentally wrong and more attempts won't fix it.

**Tokens** — The maximum context tokens the agent should consume. When approaching the limit, the agent switches to minimal context mode or suggests an agent swap.

**Minutes** (default: 30) — Wall-clock time. When exceeded, the agent presents its current progress and asks whether to continue.

When any budget is exceeded, the agent stops and reports to you. It will explain what it tried, where it's stuck, and what it recommends. You can then grant an extension, change approach, or take over.

---

## When Things Go Wrong

### Stall Detection

If the agent produces two consecutive identical diffs (same files, same changes, same failures), it declares a stall and halts. You'll see:

```
⚠️  STALL DETECTED

Two identical diffs - unable to progress

Diagnosis: [what's wrong]
Attempted: [what was tried]
Recommendations: [options]

Request: Provide direction or choose recommendation
```

**Your options**:
- Provide more context (point to relevant files or MB entries the agent missed)
- Suggest an alternative approach
- Ask for an agent swap (a fresh agent instance with focused context)

### Agent Swap

When the current agent session can't make progress, you can swap to a fresh agent. The current agent saves its state to the Memory Bank, and the new agent picks up from there. This is useful when the agent is stuck in a loop, the context window is too polluted with failed attempts, or the task needs a fresh perspective.

### Full Reset

For complete breakdowns, the nuclear option: discard all uncommitted changes, reset to the last known good state, start a new session, and have the agent load the full Memory Bank from scratch.

### Common Issues at a Glance

| Problem | What you'll see | What to do |
|---------|----------------|------------|
| Agent is looping | Same diff repeated, QA fails the same way | Check if requirements are ambiguous, provide more context, or try agent swap |
| Context getting long | Slower responses, agent forgetting earlier details | Compaction will handle it automatically; or trigger `/compact` manually |
| QA passes locally, CI fails | Agent reports success but your pipeline disagrees | Compare environments, check dependency versions, look for timing issues |
| Agent wants to create too many files | Reuse checklist shows thin justifications | Push back — ask it to extend existing files instead |
| Agent skipping steps | Missing states in the workflow | Remind it to follow the state machine; check that AGENTS.md is loaded |

---

## Best Practices

### Writing Good Task Descriptions

The single highest-leverage thing you can do is write clear tasks. Compare:

**Weak**: "Fix the login bug"
**Strong**: "Fix the null pointer in `services/auth.ext:45` — when `user.session` is undefined, the function throws instead of returning a 401. See `tasks/2025-09/250915_auth-refactor.md` for the recent auth changes that may have introduced this. Must follow the error handling pattern in `projectRules.md#ErrorHandling`."

The strong version gives the agent a specific location, expected behaviour, historical context, and the pattern to follow. The agent can go straight to BUILD with this. The weak version forces the agent into a long discovery phase where it may or may not find the right bug.

### Maintaining the Memory Bank

Treat the Memory Bank like documentation you actually use, not documentation you write once and forget:

- **Update `activeContext.md` weekly** — This is the file the agent reads most often. If it's stale, the agent starts every session with wrong assumptions.
- **Record architectural decisions in `decisions.md`** — Not just what you decided, but what you considered and rejected. The agent uses this to avoid revisiting dead ends.
- **Keep `systemPatterns.md` current** — When your architecture evolves, this file must evolve with it. The agent follows whatever patterns are documented here.
- **Review monthly READMEs** — These are the agent's historical record. If they're thin or inaccurate, the agent's understanding of the project's trajectory suffers.

### When to Provide More Context vs. Less

- **Bug fixes**: Minimal context. Point to the file and line, describe the expected behaviour, let the agent work.
- **Features**: Moderate context. Task contract with acceptance criteria, point to related patterns and prior work.
- **Architecture changes**: Maximum context. Full task contract, point to decisions log, flag constraints and anti-patterns explicitly.

### Reviewing Agent Output Effectively

You don't need to read every line of every diff. Focus your review on:

1. **The PLAN** — Did the agent understand the task? Is the reuse strategy sensible? This is where you catch misunderstandings cheaply.
2. **The APPROVAL summary** — Are all gates green? Does the file list match your expectations? Any unexpected new files?
3. **New file justifications** — If the agent created new files, read its reuse analysis. Is the justification convincing or thin?

If the plan is good and the tests pass, the implementation is usually fine. The state machine is designed so that your attention is concentrated at the two human gates (PLAN approval and APPROVAL) rather than spread across every state.

### Knowing When to Intervene

The system is designed to surface problems to you rather than hide them. Pay attention to:

- **Cycle counts above 2** — The agent is struggling. Read its diagnosis before it hits the stall threshold.
- **Thin reuse justifications** — "Cannot extend because it would be complex" is not a real reason. Push back.
- **Approval gates with warnings** — Lint warnings, coverage dips, or conditional QA passes are signals to look more closely.
- **Long silences in BUILD** — If the agent is taking a long time, it may be stuck in a loop before formally declaring a stall. Check in.

---

## Quick Reference Card

### State Machine Flow
```
PLAN [you approve] → BUILD → DIFF → QA [pass] → APPROVAL [you approve] → APPLY → DOCS
```

### Your Approval Keywords
- **Approve**: "approved", "looks good", "proceed", "ship it", "document it"
- **Request changes**: "change X", "fix Y"
- **Reject**: "revert"

### Loading Modes
- **Fast Track**: Bug fixes, small changes, post-compaction recovery
- **Standard Discovery**: Features, tests, quality-critical work
- **Deep Dive**: Architecture changes, legacy investigation

### Memory Bank — Key Files
- `activeContext.md` — What's happening now (read every session)
- `systemPatterns.md` — How the architecture works (read before changes)
- `decisions.md` — Why things were built this way (read for arch work)
- `tasks/YYYY-MM/README.md` — What was done this month

### Budget Defaults
- Cycles: 3 (BUILD → QA loops before stall)
- Minutes: 30 (wall-clock time per task)

### Non-Negotiable Rules
1. No new files without exhaustive reuse analysis
2. No changes applied without your explicit approval
3. No documentation until code is approved
4. No mock/fake data in production code
5. All work in sandbox branches, never main
