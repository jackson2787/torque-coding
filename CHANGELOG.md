# Changelog

All notable changes to Torque Coding are recorded here. Format loosely follows [Keep a Changelog](https://keepachangelog.com/); dates are ISO (YYYY-MM-DD).

## [3.0.0-beta.1] — 2026-04-20

First public beta. Feature-complete and internally coherent; awaits external end-to-end runs before `3.0.0` final.

### Added — operating model

- Six-state machine: `PLAN → PLAN-CONTEXTUALIZE → BUILD ↔ QA → DEBRIEF`, with `ESCALATE` as a stall-break state reachable from any active state.
- Two-domain memory bank (`.memory-bank-v2/machine/` always-loaded, `.memory-bank-v2/human/` on-demand).
- Hard human approval gate via `activeContext.md#Approval-Record` — verbatim quote required before BUILD runs.
- Cap exhaustion as a first-class stall signal with per-state soft/hard caps and a configurable escalation ladder in `limits.md`.
- Planner-executor split: powerful model plans + contextualizes, executor model (fast/local/cheap) builds, with the hand-off as files on disk.

### Added — skills

- Six state-machine skills: `writing-plans`, `plan-contextualize`, `build-loop`, `qa`, `escalate`, `debrief`.
- Six memory-bank maintenance skills: `update-active-context`, `update-toc`, `update-limits`, `update-constitution`, `update-operational-context`, `update-human-log`, `mb-rebase`, `check`.
- `check` — read-only nine-check structural validator, invokable as "torque-coding check" or in natural language.

### Added — installer and tooling

- `torque-coding init` scaffolds `.memory-bank-v2/` and deploys rules/skills to `.claude/rules/`, `.claude/skills/`.
- `torque-coding update` re-syncs rules/skills without touching memory-bank data.
- Bootstrap contract with legacy-artifact detection (Step 0) — non-destructive scan for pre-v3 paths.

### Added — docs

- `README.md` with explicit problem statement and tagline.
- `GETTING-STARTED.md` — new-user walkthrough from init through first debrief.
- `docs/doctrine/where-rules-live.md` — constitution vs operational-context decision guide.
- `docs/doctrine/authority-order-gray-areas.md` — 7 hard cases the rule file's examples don't cover.
- `examples/sample-task/` — complete worked example on a fictional Express API.

### Added — telemetry

- Debrief Phase 3.5 "Limits Tuning Check" — scans `build-log.md` and `qa-report.md` for soft/hard cap crossings, surfaces advisory recommendations. Never writes `limits.md` directly.

### Changed from v1/v2 framing

- `v2/` flattened to repo root; v1 layout removed.
- `claude-rules/` renamed to `rules/` (tool-neutral; installer replicates to tool-specific locations).
- "Budget model" terminology renamed to "executor model" throughout (speed/availability, not just cost).
- `AGENTS.md` (tool-agnostic) and `CLAUDE.md` (Claude Code `@-imports`) have byte-identical tripwire sections.

### Known gaps

- No skill-packs yet (stack-specific layers for Next.js + Supabase, Python CLI, etc.).
- Only one worked example (`sample-task`); real external end-to-end runs pending.
- No automated tests for the installer or skill files.
