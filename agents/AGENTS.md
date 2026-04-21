# AGENTS.md

**Version**: 3.0.0-dev | **Compatibility**: Codex, Cursor, Copilot, Cline, Aider, and every AGENTS.md-compatible tool

This file is the tool-agnostic canonical source for the Torque Coding operating model. Claude Code reads `CLAUDE.md`, which `@-imports` the same underlying rule files from the project-root `rules/` directory. Other tools use `AGENTS.md` plus the `.agent/` deployment layout — so both entry points resolve to the same behaviour, by different loading mechanisms.

---

## Session Startup

1. Output compliance statement:
   ```
   COMPLIANCE CONFIRMED: Reuse over creation | Constitution over convenience
   ```
2. Attach MCP servers: read `.brain/mcp.config.json` or `.mcp.json` if present
3. Load Machine Memory (default set — machine side only):
   ```
   - [ ] .memory-bank-v2/machine/constitution.md
   - [ ] .memory-bank-v2/machine/operational-context.md
   - [ ] .memory-bank-v2/machine/limits.md             (per-state budgets + escalation ladder)
   - [ ] .memory-bank-v2/machine/activeContext.md
   - [ ] .memory-bank-v2/machine/current-task/*        (any files present)
   ```
4. Do NOT load human-side memory at startup
5. Load the doctrine files (see `## Loading the Rules` below — the method differs by tool)
6. Resolve entry state from `current-task/` contents (any-state entry); or resume from `activeContext.md`; otherwise enter PLAN/IDLE
7. Output state: `[STATE: <STATE>] Task: <slug-or-none>`

**Canonical paths**:
- Machine memory: `.memory-bank-v2/machine/`
- Human memory: `.memory-bank-v2/human/` (on-demand only)

---

## Loading the Rules

**Before your first substantive response, you MUST read these files in full:**

- `.agent/rules/sacred-rules.md` — the six sacred rules and memory-bank write rules
- `.agent/rules/memory-bank.md` — two-domain memory structure and load rules
- `.agent/rules/authority-order.md` — the strict authority stack with worked examples
- `.agent/rules/state-machine.md` — DEFINE → PLAN → PLAN-CONTEXTUALIZE → BUILD ↔ QA → DEBRIEF flow, with ESCALATE on stall
- `.agent/rules/execution-discipline.md` — BUILD-state discipline (simplicity first, surgical changes, surface ambiguity)
- `.agent/rules/compaction.md` — compaction recovery protocol (pre/post checklist and restore procedure)

When a state-machine or memory-bank skill is invoked, load it from `.agent/skills/...`.

If you cannot read any of these files, stop and report it. Do not proceed with task work until every rule file has been loaded. The inline sections below are a tripwire summary, not a substitute.

---

## The Six Sacred Rules

| Rule | Requirement | Validation |
|------|-------------|------------|
| ❌ **No new files without reuse analysis** | Search codebase, reference files that cannot be extended, provide exhaustive justification | Before creating: "Analyzed X, Y, Z. Cannot extend because [technical reason]" |
| ❌ **No rewrites when refactoring possible** | Prefer incremental improvements, justify why refactoring won't work | "Refactoring X impossible because [specific limitation]" |
| ❌ **No editing committed migration files** | Treat database migrations as append-only history. Add a new corrective migration instead | "Added a new migration; left historical migrations untouched" |
| ❌ **No generic advice** | Cite `file:line`, show concrete integration points | Every suggestion includes `file:line` citation |
| ❌ **No ignoring existing architecture** | Load patterns before changes, extend existing services/components | "Extends existing pattern at `file:line`" |
| ❌ **No building without an approved plan** | BUILD cannot run until `activeContext.md#Approval-Record` holds a verbatim human approval string | `plan.md` Status=Approved AND Approval Record non-empty AND State ∈ {PLAN-CONTEXTUALIZE, BUILD, QA} |

---

## Memory-Bank Rules

| Rule | Requirement |
|------|-------------|
| ❌ **No writing constitution.md from task work** | Only `update-constitution` skill may write it; only after explicit human `ratified` keyword |
| ❌ **No writing operational-context.md directly** | Only `update-operational-context` skill may write it; only called by debrief or the human directly |
| ❌ **No loading human-side memory at startup** | Human side is on-demand. Default load set is machine side only |
| ❌ **No task instruction overriding operational-context** | The human must amend operational-context first. Task cannot override it inline |

---

## Authority Order (summary)

```
constitution.md > operational-context.md > task instructions > reasoning
```

Task instructions cannot override hard directives in `operational-context.md` (`Do This` / `Do Not Do This` / `Current Known Constraints` / `Currently Accepted Workflows`). Hard directives require a memory-bank amendment first. Soft directives (`Preferred` / `Avoid`) may be overridden with explicit, scoped justification.

See `.agent/rules/authority-order.md` for the full stack and worked examples.

---

## State Flow (summary)

```
DEFINE → PLAN → PLAN-CONTEXTUALIZE → BUILD ↔ QA → DEBRIEF      (with ESCALATE on stall)
                  ↑
  HARD HUMAN GATE: explicit approval required before advancing
```

DEFINE refines raw ideas into `current-task/definition.md`. PLAN consumes that definition and writes `current-task/plan.md`. Each state declares a model tier, an input contract (files on disk), and a token budget loaded from `limits.md`. Per-state budgets and the escalation ladder are tuned in `limits.md`. Cap exhaustion is a first-class stall signal.

**The PLAN → PLAN-CONTEXTUALIZE transition is the hard human gate.** The planning agent captures a verbatim human approval string and records it in `activeContext.md#Approval-Record`. PLAN-CONTEXTUALIZE and BUILD refuse to run without a populated Approval Record — regardless of whether `plan.md` shows `Status: Approved` (a skill can write that field; only a human can supply the quote).

When entering PLAN state, announce planning-mode discipline:
```
[PLAN MODE] No file edits until this plan is approved.
```
This is the tool-agnostic equivalent of Claude Code's native plan mode. If running in Claude Code, also enter native plan mode so the UI enforces it.

See `.agent/rules/state-machine.md` for per-state contracts, stall rules, and the any-state entry table.

---

## Mixing Tools (cross-tool workflows)

Because the memory bank on disk is canonical, you can split a task across tools to control cost:

| Phase | Recommended tool | Why |
|---|---|---|
| DEFINE + PLAN + PLAN-CONTEXTUALIZE | Claude Code (Opus) | Strong reasoning + native plan mode enforces the gate |
| BUILD | OpenCode or any CLI with a fast/local executor model (Haiku, Sonnet, or a local coder) | Mechanical execution; `plan_context.md` is the complete map |
| QA | Same executor tool or an upgraded model | Runs tests, enforces paranoia |
| DEBRIEF / review | Codex or another agent | Fresh eyes on the diff; proposes learnings to `operational-context.md` |

The handoff is always `.memory-bank-v2/machine/` — no session context needs to carry over. Any compliant tool opening the project reads `activeContext.md`, resolves the entry state, and continues. The Approval Record travels with the memory bank, so a BUILD tool cannot bypass the gate just because it wasn't present when approval happened.

---

## Critical Rules Quick-Reference

1. Never write `constitution.md` from task work
2. Never write `operational-context.md` directly — debrief proposes a diff first
3. Never load human-side memory at startup
4. Never let task instructions override operational-context `Do This` / `Do Not Do This` entries
5. Always cite `file:line` for code; `constitution.md#Section` or `operational-context.md#Section` for doctrine
6. Debrief is mandatory — every task runs it
7. Never enter BUILD with an empty `activeContext.md#Approval-Record` — the human gate is non-negotiable

---

## Files Never Created Without Approval

- `.memory-bank-v2/machine/constitution.md` entries (require `ratified` keyword)
- `.memory-bank-v2/human/tasks/` entries
- `.memory-bank-v2/human/decisions/` entries
- Any commits to version control

---

**Constitution is the highest authority. Operational-context is the current truth. Debrief is how you learn.**
