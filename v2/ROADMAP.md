# Torque Coding v2 — Roadmap

**Status as of 2026-04**: v2.2-dev landed (budgets + configurable escalation ladder). Doctrine, rules, templates, and all six state-machine skills exist. What follows is what remains to make v2 a coherent start-to-finish project — i.e. "clone → install → run a task through PLAN → DEBRIEF without a dead end".

Tiered by whether the gap blocks end-to-end use.

---

## Tier 1 — Blocks end-to-end use today

These are the items that stop a new user from running v2 at all.

### 1. Installer wiring (`bin/`, `lib/`)

The biggest gap. `bootstrap-memory-bank-v2-contract.md` describes seeding `.memory-bank-v2/`, but nothing runs it. No `npx torque-coding init --v2` path. Users would copy `v2/templates/machine/*` by hand, which nobody will do.

**Done when**: a single command scaffolds a complete `.memory-bank-v2/` into a target project, including `constitution.md`, `operational-context.md`, `limits.md`, `activeContext.md`, `toc.md`, empty `current-task/`, and empty `human/` subdirs.

### 2. `update-active-context` — v2 variant or extension

The v2 `activeContext.md` template now carries fields the v1 skill doesn't know: `Cycle`, `Ladder step last used` (v2.2), `Current Task Pointer`. Every state skill says "update via `update-active-context` (v1 skill, reused)" — but the v1 skill will strip those fields.

**Done when**: either `v2/skills/memory-bank-v2/update-active-context-v2/SKILL.md` exists and all state skills reference it, or the v1 skill is extended with v2-aware sections documented in both places.

### 3. `v2/templates/machine/toc.md`

Listed as "carried from v1" in the machine-memory table, but v2's file set is different (constitution + operational-context + limits + current-task/*, not architecture + decisions + productContext). Without a v2-shaped `toc.md` template, the mechanical index either doesn't exist or points at v1 files that aren't there.

**Done when**: a v2-specific `toc.md` template is in `v2/templates/machine/` and the bootstrap contract copies it.

### 4. Getting-started doc

`v2/README.md` is doctrine. There's no "clone, install, run your first task" page for a developer who's never seen this. v1's `README.md` fills that role for v1; v2 has no equivalent.

**Done when**: `v2/GETTING-STARTED.md` walks a new user from clean repo to first completed task (PLAN approved, BUILD ran, QA passed, DEBRIEF archived).

---

## Tier 2 — Important gaps (v2 runs but loses advertised features)

### 5. `compaction.v2.md` rule

Explicitly deferred. The "session survives compaction because `activeContext` + `current-task/` restores state" claim depends on this rule existing and being enforced. Without it, compaction recovery is doctrine without a procedure.

**Done when**: `v2/claude-rules-v2/compaction.v2.md` exists with explicit compact/restore procedure, and `AGENTS.v2.md` cross-references it.

### 6. `mb-rebase-v2/SKILL.md`

Explicitly deferred. Over months of debriefs, `operational-context.md` grows. v1 had rebase; v2 has no way to prune/consolidate. The debrief five-gate keeps it slower to rot than v1, but it will still rot.

**Done when**: rebase skill exists and documents its own rubric (what gets merged, what gets retired, what moves to `human/rationale/`).

### 7. Worked example (`v2/examples/sample-task/`)

A single fake task carried all the way through with `plan.md`, `plan_context.md`, `build-log.md`, `qa-report.md`, optionally an `escalation-brief.md`, and the debrief-archived output. Right now templates exist but no filled-in exemplar, which makes the "a budget model can read this and start coding" claim abstract.

Building this will probably flush out any remaining gaps in items 1–4 because you'll find them by trying to run the example.

**Done when**: the example directory contains each artifact as it would look mid-task, plus a README walking through the state transitions.

### 8. Migration-from-v1 doc + script

Deferred in `v2/docs/`. Every existing v1 user hits this immediately: what happens to their `architecture.md`, `productContext.md`, `decisions.md`? Without a mapping doc, v2 is only adoptable by greenfield projects.

**Done when**: `v2/docs/migration-from-v1.md` with a field-by-field mapping table, and (stretch) a one-shot migration script in `bin/`.

### 9. `update-limits` skill

`limits.md` has invariants: final rung must be `<user-switched session>`, each rung strictly stronger, soft ≤ hard, budget rung (rung 1) is never an escalation target. Today the human edits freehand; nothing validates.

**Done when**: `v2/skills/memory-bank-v2/update-limits/SKILL.md` exists and enforces the invariants before writing.

---

## Tier 3 — Polish, needed to call v2 "finished"

### 10. Skill-pack v2 parallels

`skill-packs/nextjs-supabase`, `python-cli`, etc. are v1-only. v2 has no stack-specific packs. Projects using a v1 pack can't move.

### 11. Telemetry feedback into `limits.md`

The "you crossed the soft cap 8/10 times this week — consider raising it" loop. Deferred to a future pass; worth it but not blocking.

### 12. `v2/docs/` prose

Authority-order worked examples, constitution vs operational-context boundary cases, doctrine essays. The rules files carry the load today; docs make them teachable.

### 13. Structural validator

A `torque-coding check` command that asserts `.memory-bank-v2/` has the right shape, `limits.md` ladder is valid, no orphan `current-task/` with no `activeContext.md` state, etc. Currently all invariants live in prose across skills.

---

## Smallest coherent v2.3

If the goal is "one end-to-end path works", ship **1 + 2 + 3 + 4 + 7** (installer, activeContext skill mismatch, v2 toc template, getting-started page, worked example). Building #7 will surface any remaining gaps in #1–#4.

Tier 2 items 5, 6, 8 are the next cut — they turn v2 from "usable if you're greenfield and sessions never compact" into "usable at scale".

Tier 3 is polish and can trail.

---

*Open this alongside `v2/README.md` (doctrine) and `V2-README.md` (root pointer) to see where v2 stands and what's next.*
