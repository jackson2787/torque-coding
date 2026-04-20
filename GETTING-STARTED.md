# Getting Started with Torque Coding

This guide walks you from a clean project to completing your first task through the full PLAN → BUILD → QA → DEBRIEF cycle. It assumes you have read `AGENTS.md` and understand what the memory bank is. If you haven't, read `AGENTS.md` first.

---

## 1. Install

```bash
npm install -g torque-coding
```

Or use it without installing:

```bash
npx torque-coding init
```

---

## 2. Initialise your project

Run `init` inside your project root:

```bash
cd my-project
torque-coding init
```

The installer will:
- Ask to confirm the target directory (default: current directory)
- Warn you if `.memory-bank-v2/` already exists and ask before overwriting templates
- Create the full memory-bank directory tree and copy the machine templates
- Ask which platform to configure: `Claude Code`, `Other`, or `Both`
- Deploy the entry files and supporting `rules/` / `skills/` directories to the correct platform-specific locations

What appears on disk after `init`:

```
my-project/
├── AGENTS.md                       ← entry point for Codex, Cursor, Aider, etc.
├── CLAUDE.md                       ← entry point for Claude Code (@-imports)
├── bootstrap-memory-bank-contract.md
├── .agent/
│   ├── rules/                      ← rules for AGENTS.md-compatible tools
│   └── skills/                     ← skills for AGENTS.md-compatible tools
├── rules/                          ← project-root rules for Claude Code's @rules imports
├── .claude/
│   ├── rules/                      ← copy of rules for Claude Code's native convention
│   └── skills/                     ← copy of skills for Claude Code
└── .memory-bank-v2/
    ├── machine/
    │   ├── constitution.md         ← [NEEDS CONFIRMATION] placeholders
    │   ├── operational-context.md  ← [NEEDS CONFIRMATION] placeholders
    │   ├── limits.md               ← default token budgets (ready to use)
    │   ├── activeContext.md        ← State: PLAN/IDLE
    │   └── current-task/           ← empty — populated by state-machine skills
    └── human/
        ├── README.md
        ├── decisions/INDEX.md
        ├── tasks/INDEX.md
        ├── meetings/INDEX.md
        └── rationale/INDEX.md
```

---

## 3. Populate constitution.md and operational-context.md

The machine templates ship with `[NEEDS CONFIRMATION]` placeholders. Before running any task, populate them with your project's specifics.

### Recommended: run the bootstrap contract

Open a new session with your AI agent and paste this prompt:

> "Read `bootstrap-memory-bank-contract.md` and follow the bootstrap procedure to populate `.memory-bank-v2/machine/constitution.md` and `.memory-bank-v2/machine/operational-context.md` for this project."

The agent scans your codebase, proposes content for each section, and waits for you to review. Constitutional entries require the `ratified` keyword from you before being written.

### Alternative: fill in manually

Open `.memory-bank-v2/machine/constitution.md` and replace each `[NEEDS CONFIRMATION]` block. The template comments explain what each section accepts. Do the same for `operational-context.md`.

### Limits

`.memory-bank-v2/machine/limits.md` ships with defaults tuned for a mid-tier £20/month plan. Review it but you do not need to change it before your first task.

---

## 4. Run your first task end-to-end

This section walks through the complete state flow for a fictional task — adding rate limiting to a login endpoint. The `examples/sample-task/` directory contains all the artifacts for this exact example if you want to read them alongside this walkthrough.

---

### PLAN

**What you do**: describe the task to your agent in natural language.

> "I want to add per-route rate limiting to protect `/api/auth/login`. Use `express-rate-limit`, 5 requests per minute per IP. No other routes should be affected."

**What the agent does**:
1. Loads machine memory and the rule files
2. Checks the task against `constitution.md` and `operational-context.md` for conflicts
3. Runs the `writing-plans` skill — analyzes existing files, performs a reuse analysis, writes `plan.md`
4. Presents the plan and waits for your approval

**What appears on disk**:
```
.memory-bank-v2/machine/current-task/plan.md
```

**State announcement you will see**:
```
[STATE: PLAN] Task: add-rate-limit-middleware
```

**You approve the plan** by saying "approved", "looks good", or "proceed".

---

### PLAN-CONTEXTUALIZE

**What you do**: nothing — this state runs automatically after plan approval.

**What the agent does**:
Runs the `plan-contextualize` skill. It reads your codebase deeply — pasting the relevant file ranges, extracting the applicable patterns from `operational-context.md`, noting dead-ends to avoid — and produces a context pack complete enough that the executor model needs **zero exploration tool calls** to start coding.

**What appears on disk**:
```
.memory-bank-v2/machine/current-task/plan_context.md
```

**State announcement**:
```
[STATE: PLAN-CONTEXTUALIZE] Task: add-rate-limit-middleware
```

This is the most important state for budget control. The better the context pack, the fewer tokens BUILD wastes.

---

### BUILD

**What you do**: switch to your executor model (fast/local/cheap — Haiku, Sonnet, a local coder) if you're managing tiers manually, or let your tool route to the executor tier automatically.

**What the agent does**:
Runs the `build-loop` skill. It reads `plan.md` and `plan_context.md` — no exploration required — and applies the changes. Each attempt is logged in `build-log.md`. When the implementation is complete, the agent declares done.

**What appears on disk**:
```
.memory-bank-v2/machine/current-task/build-log.md   ← created/updated per attempt
```

**State announcement**:
```
[STATE: BUILD] Task: add-rate-limit-middleware
```

**Important**: BUILD does not run tests or the linter. It applies the plan and declares done. Verification is QA's job.

If BUILD fails 3 times on the same error, it escalates automatically (see ESCALATE below).

---

### QA

**What you do**: nothing — QA runs automatically after BUILD declares done.

**What the agent does**:
Runs the `qa` skill — skeptical by design. It runs six checks, in order:
1. Runs the tests (does not just look at them — actually executes `npm test`)
2. Runs the linter
3. Runs the build (if the project has a build step)
4. Verifies each applicable `operational-context.md` directive was followed in the diff
5. Scans for any `constitution.md` boundary crossings
6. Verifies each acceptance criterion from the plan is met

**What appears on disk**:
```
.memory-bank-v2/machine/current-task/qa-report.md   ← overwritten each cycle
```

**State announcement**:
```
[STATE: QA] Task: add-rate-limit-middleware
```

On PASS: QA transitions to DEBRIEF.
On FAIL: QA returns specific issues to BUILD with `file:line` precision. BUILD cycle counter increments. After 3 failed cycles, escalation triggers.

---

### ESCALATE (if needed)

If BUILD or QA stalls:

**Inside Claude Code** — the `escalate` skill writes `escalation-brief.md` and spawns a subagent at the next rung of the escalation ladder from `limits.md`. The subagent receives the full brief and attempts a fix.

**Outside Claude Code** — the skill writes `escalation-brief.md` and instructs you to switch to a stronger model manually:

> "Stalled after 3 attempts. Switch to a stronger model and re-enter the task. The memory bank at `.memory-bank-v2/machine/current-task/` has everything needed to resume."

Because the memory bank is canonical, switching tools or models mid-task is seamless — the new session reads `current-task/` and resumes at the stalled state.

---

### DEBRIEF

**What you do**: let it run. Debrief is mandatory after every task.

**What the agent does**:
Runs the `debrief` skill, which applies the five-gate rubric to decide what the task taught us:

1. **Generalisable?** Does this apply beyond the current task?
2. **Repeatable?** Would we want future agents to do this the same way?
3. **Conflict or supersession?** Does it refine or fill a gap in `operational-context.md`?
4. **Evidenced?** Is there at least one `file:line` proving it?
5. **Durable?** Expected to stay true for 6+ months?

A learning that passes all five gates is proposed as a diff to `operational-context.md`. Debrief shows you the diff and waits for approval before writing.

**What debrief produces**:
- A proposed `operational-context.md` diff (if there is a learning)
- A task history entry written to `human/tasks/YYYY-MM/DDMMDD_<slug>.md`
- `current-task/` archived to `human/tasks/` and cleared
- `activeContext.md` reset to `State: PLAN/IDLE`

**State announcement**:
```
[STATE: DEBRIEF] Task: add-rate-limit-middleware
```

When you see the proposed operational-context diff, review it. If it looks right, say "apply". If not, say "no" and debrief will note the task without updating `operational-context.md`.

---

## 5. After your first task

Once debrief completes, check:

- `activeContext.md` shows `State: PLAN/IDLE` and `Task: none`
- `.memory-bank-v2/machine/current-task/` is empty
- A task history entry exists at `.memory-bank-v2/human/tasks/YYYY-MM/`

You are ready for the next task.

---

## 6. Keeping rules and skills up to date

When a new version of `torque-coding` is released, re-sync the rules and skills without touching your memory bank:

```bash
torque-coding update
```

This updates `.agent/rules/`, `.agent/skills/`, and, when Claude Code is installed, `rules/`, `.claude/rules/`, `.claude/skills/`. It offers to update the relevant root-level entry files if you want the latest versions. It never touches `.memory-bank-v2/`.

---

## 7. Common first-run problems

| Problem | Cause | Fix |
|---|---|---|
| Agent reads `constitution.md` and surfaces `[NEEDS CONFIRMATION]` | Bootstrap hasn't run yet | Run the bootstrap prompt (Step 3) |
| Agent says "`update-active-context` skill not found" | Skill files not in the expected platform directory (`.agent/skills/` or `.claude/skills/`) | Run `torque-coding update` |
| QA fails Check 1: "no tests found" | BUILD claimed to add tests but didn't | Return to BUILD with QA's specific issue; BUILD will add the missing tests in its next attempt |
| Session compacted mid-task | Context window truncated by the tool | Read `.agent/rules/compaction.md` for AGENTS.md-compatible tools, or `rules/compaction.md` in Claude Code — start a new session, load machine memory, check `activeContext.md` for the resume state |
| Task description produces a very large plan | Task too broad for current limits | Split the task; or raise the PLAN hard cap in `limits.md` |

---

## 8. See also

- `AGENTS.md` — the full operating model and authority rules
- `CLAUDE.md` — Claude Code entry point with @-imports
- `examples/sample-task/` — complete worked example (all five artifacts for `add-rate-limit-middleware`)
- `.agent/rules/state-machine.md` — full state contracts, stall rules, any-state entry table for AGENTS.md-compatible tools
- `.agent/rules/compaction.md` — compaction recovery procedure for AGENTS.md-compatible tools
- `rules/state-machine.md` — Claude Code state-machine reference
- `rules/compaction.md` — Claude Code compaction reference
- `ROADMAP.md` — what is planned next
