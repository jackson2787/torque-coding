# Torque Coding — Roadmap

**Status as of 2026-04**: v3.0.0-dev. All Tier 1 and Tier 2 items are now complete. The operating model runs end-to-end: `torque-coding init` → bootstrap → DEFINE → PLAN → PLAN-CONTEXTUALIZE → BUILD → QA → DEBRIEF, with compaction recovery, escalation, and memory-bank maintenance all covered. Tier 3 is polish and trails.

---

## Done

### Foundational alignment (2026-04)

- [x] **Promote v2 to root and delete v1.** `agent/`, `skills/`, `optional-skills/`, `skill-packs/` gone; `v2/` flattened to root. Package version bumped to `3.0.0-dev`.
- [x] **Rename `claude-rules/` → `rules/`.** The rule files are tool-neutral; the installer replicates them into tool-specific locations in consumer repos.
- [x] **Align AGENTS.md and CLAUDE.md.** Byte-identical tripwire sections. CLAUDE.md uses `@-imports`; AGENTS.md uses an explicit "read these files in full" contract.
- [x] **Scrub v1/v2 framing.** No "Relationship to v1" appendices, no `(v2.2)` inline tags, frontmatter names normalised.
- [x] **`limits.md` template.** Per-state soft/hard caps and escalation ladder.
- [x] **All seven state-machine skills.** `idea-refine`, `writing-plans`, `plan-contextualize`, `build-loop`, `qa`, `escalate`, `debrief`.
- [x] **Three ceremony memory-bank skills.** `update-constitution`, `update-operational-context`, `update-human-log`.

### Tier 1 — Completed (2026-04)

- [x] **1. Installer (`bin/`, `lib/`).** `torque-coding init` scaffolds `.memory-bank-v2/` and deploys rules/skills to `.claude/rules/`, `.claude/skills/`. `torque-coding update` re-syncs without touching memory-bank data. `package.json` has `bin` field; `prompts` handles interaction.

- [x] **2. `update-active-context` skill.** `skills/memory-bank/update-active-context/SKILL.md` — writes the full `activeContext.md` shape. Pre-checks valid state name, valid transition, and cycle counter coherence. Lists all ten callers (every state-machine skill + human direct for compaction recovery).

- [x] **3. `update-toc` skill + `templates/machine/toc.md`.** `templates/machine/toc.md` defines the snapshot structure (machine half, current-task sub-table, human half). `skills/memory-bank/update-toc/SKILL.md` overwrites the file on each call. Coupled to `update-human-log` — called automatically after every human-side write.

- [x] **4. `GETTING-STARTED.md`.** Walks a new user from `torque-coding init` through bootstrap, first task (DEFINE → PLAN → PLAN-CONTEXTUALIZE → BUILD → QA → DEBRIEF), and debrief. References `examples/sample-task/` throughout. Includes a common-problems table.

### Tier 2 — Completed (2026-04)

- [x] **5. `rules/compaction.md`.** Pre-compaction checklist, step-by-step post-compaction restore, survival table. Cross-referenced in `AGENTS.md` (explicit read contract) and `CLAUDE.md` (`@-import`).

- [x] **6. `mb-rebase` skill.** `skills/memory-bank/mb-rebase/SKILL.md` — three-category rubric (merge near-duplicates, retire outdated to `human/rationale/`, extract narrative leak). Human reviews all candidates before any write. Never silently deletes a directive.

- [x] **7. Worked example (`examples/sample-task/`).** Task `add-rate-limit-middleware` on a fictional Express API. Seven artifacts: `README.md`, `definition.md` (Status: Ready for PLAN), `plan.md` (Status: Approved), `plan_context.md` (zero-exploration property demonstrated), `build-log.md` (single attempt, does not claim to run tests), `qa-report.md` (six checks, pasted terminal evidence, PASS → DEBRIEF), `consumer-guide.md` (non-dev user/support explanation). All file:line citations internally consistent.

- [x] **8. `update-limits` skill.** `skills/memory-bank/update-limits/SKILL.md` — enforces five invariants (final rung = `<user-switched session>`, non-duplicate rungs, soft ≤ hard per state, at least 3 rungs, executor rung never an escalation target). Hard blocks prevent write; warnings ask for confirmation.

---

## Tier 3 — Polish (not blocking)

### 9. Skill-pack parallels

Stack-specific packs (Next.js + Supabase, Python CLI, etc.) that layer concrete patterns onto the base operating model. None exist yet.

### [x] 10. Telemetry feedback into `limits.md`

Cap-crossing detection added to `debrief` skill as Phase 3.5. Scans `build-log.md` and `qa-report.md` for soft/hard cap crossings per attempt/cycle. Advisory recommendations surface in the Debrief Report. No writes — human adjusts `limits.md` directly.

### [x] 11. `docs/` doctrine prose

Two teaching docs created under `docs/doctrine/`:
- `where-rules-live.md` — constitution vs operational-context decision guide with the gray-area cases
- `authority-order-gray-areas.md` — 7 hard cases the rule file's worked examples don't cover (implicit contradictions, stale directives, task-as-policy promotion, etc.)

### [x] 12. Structural validator

`skills/memory-bank/check/SKILL.md` — nine-check read-only validator. Asserts: directory scaffold, required machine files, `limits.md` invariants (via `update-limits`), `activeContext.md` state validity, `current-task/` consistency with state, Approval Record gate, ghost tasks, debrief hygiene, legacy v1 artifacts. Invoked as `torque-coding check` or explicit "run check".

---

*Open this alongside `README.md` (doctrine) and `AGENTS.md` / `CLAUDE.md` (entry points) to see where Torque Coding stands and what's next.*
