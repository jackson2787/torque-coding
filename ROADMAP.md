# Torque Coding — Roadmap

**Status as of 2026-04**: v3.0.0-dev. Doctrine, rules, templates, and all six state-machine skills exist. AGENTS.md and CLAUDE.md are aligned and point at a single source of truth under `rules/`. What follows is what remains to make this a coherent start-to-finish project — i.e. "clone → install → run a task through PLAN → DEBRIEF without a dead end".

Tiered by whether the gap blocks end-to-end use.

---

## Tier 1 — Blocks end-to-end use today

These are the items that stop a new user from running Torque Coding at all.

### 1. Installer wiring (`bin/`, `lib/`)

The biggest gap. `bootstrap-memory-bank-contract.md` describes seeding `.memory-bank-v2/`, but nothing runs it. No `npx torque-coding init` path. Users would copy `templates/machine/*` by hand, which nobody will do.

The installer also has a second job: placing `rules/`, `skills/`, `AGENTS.md`, and `CLAUDE.md` into tool-specific locations in the consumer repo (`.claude/skills/` for Claude Code's native convention, plus root-level `AGENTS.md`/`CLAUDE.md` for cross-tool visibility) and rewriting internal paths where needed.

**Done when**: a single command scaffolds a complete `.memory-bank-v2/` into a target project and deploys the rules/skills/entry-points into the right tool-specific locations, with a companion `torque-coding update` command that re-syncs from the installed package.

### 2. `update-active-context` skill

Every state skill and the bootstrap contract reference `skills/memory-bank/update-active-context/SKILL.md` — but the skill does not exist in this repo. The `activeContext.md` template carries fields (`Cycle`, `Ladder step last used`, `Current Task Pointer`) that any writing skill must know about.

**Done when**: `skills/memory-bank/update-active-context/SKILL.md` exists and writes the full `activeContext.md` shape defined in `templates/machine/activeContext.md`.

### 3. `update-toc` skill and `templates/machine/toc.md`

Same shape of problem as #2. Referenced everywhere, exists nowhere. The `toc.md` template is also missing — the mechanical index has no shape to be mechanical against.

**Done when**: the template and the skill both exist, the skill reflects both `machine/` and `human/` halves, and bootstrap step 5 actually runs end-to-end.

### 4. Getting-started doc

`README.md` is doctrine. There's no "clone, install, run your first task" page for a developer who's never seen this.

**Done when**: `GETTING-STARTED.md` walks a new user from clean repo to first completed task (PLAN approved, BUILD ran, QA passed, DEBRIEF archived).

---

## Tier 2 — Important gaps (runs but loses advertised features)

### 5. `compaction.md` rule

Explicitly deferred. The "session survives compaction because `activeContext` + `current-task/` restores state" claim depends on this rule existing and being enforced. Without it, compaction recovery is doctrine without a procedure.

**Done when**: `rules/compaction.md` exists with explicit compact/restore procedure, and `AGENTS.md` cross-references it.

### 6. `mb-rebase` skill

Explicitly deferred. Over months of debriefs, `operational-context.md` grows. Without a rebase pass, there is no way to prune/consolidate. The debrief five-gate keeps it slower to rot than freehand editing, but it will still rot.

**Done when**: rebase skill exists and documents its own rubric (what gets merged, what gets retired, what moves to `human/rationale/`).

### 7. Worked example (`examples/sample-task/`)

A single fake task carried all the way through with `plan.md`, `plan_context.md`, `build-log.md`, `qa-report.md`, optionally an `escalation-brief.md`, and the debrief-archived output. Templates exist but no filled-in exemplar, which makes the "a budget model can read this and start coding" claim abstract.

Building this will probably flush out any remaining gaps in items 1–4 because you'll find them by trying to run the example.

**Done when**: the example directory contains each artifact as it would look mid-task, plus a README walking through the state transitions.

### 8. `update-limits` skill

`limits.md` has invariants: final rung must be `<user-switched session>`, each rung strictly stronger, soft ≤ hard, budget rung (rung 1) is never an escalation target. Today the human edits freehand; nothing validates.

**Done when**: `skills/memory-bank/update-limits/SKILL.md` exists and enforces the invariants before writing.

---

## Tier 3 — Polish, needed to call this "finished"

### 9. Skill-pack parallels

Stack-specific packs (Next.js + Supabase, Python CLI, etc.) that layer concrete patterns onto the base operating model. None exist yet.

### 10. Telemetry feedback into `limits.md`

The "you crossed the soft cap 8/10 times this week — consider raising it" loop. Deferred to a future pass; worth it but not blocking.

### 11. `docs/` doctrine prose

Authority-order worked examples, constitution vs operational-context boundary cases, doctrine essays. The rule files carry the load today; docs would make them teachable.

### 12. Structural validator

A `torque-coding check` command that asserts `.memory-bank-v2/` has the right shape, `limits.md` ladder is valid, no orphan `current-task/` with no `activeContext.md` state, etc. Currently all invariants live in prose across skills.

---

## Smallest coherent next release

If the goal is "one end-to-end path works", ship **1 + 2 + 3 + 4 + 7** (installer, `update-active-context`, `update-toc` + template, getting-started, worked example). Building #7 will surface any remaining gaps in #1–#4.

Tier 2 items 5, 6, 8 are the next cut — they turn it from "usable if you're greenfield and sessions never compact" into "usable at scale".

Tier 3 is polish and can trail.

---

*Open this alongside `README.md` (doctrine) and `AGENTS.md` / `CLAUDE.md` (entry points) to see where Torque Coding stands and what's next.*
