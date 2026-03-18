# Install Into An Existing Repo

Use this document as the single install entrypoint when you want an AI to set up this workflow inside a real project repository.

## What You Are Installing

You are bootstrapping two interconnected systems into the target repository:

1. **The operating model**: a rendered `AGENTS` production profile
   Select one rendered file from `agent/generated/AGENTS.<profile>.md` and copy it into the target repo root as `AGENTS.md`; that installed file becomes the primary source of truth for how the agent should work in the target repo.

2. **The capability layer**: the reusable skill packs
   These complement `AGENTS.md` with domain-specific guidance for execution, planning, verification, frontend work, mobile work, backend work, and documentation.

There is also an optional third layer:

3. **The local project layer**: generated project-specific skills
   These are optional repo-local helpers created from any remaining setup prompts in `dynamic-skills/` and live under `.agent/skills/project-*/` in the target repo.

## Source Of Truth

The operating-model source of truth is:

- upstream conceptual source: [AGENT-ZERO](https://github.com/msitarzewski/AGENT-ZERO)
- local installed source: `AGENTS.md` in the target repo

Use this authority order:

1. `AGENTS.md`
2. Universal skill packs in `.agent/skills/`
3. Generated project-specific skills in `.agent/skills/project-*/`

Project-specific skills should complement the universal skills by defining local wiring and repo-specific constraints. They should not replace the workflow, approval model, or architectural discipline defined by `AGENTS.md`.

## What This Template Repo Is

This repository is a template and source library.

- The files here are the canonical source assets.
- You do not run day-to-day work inside this template repo.
- You copy the relevant files into the target repository, then point your AI at the copied files inside that target repo.
- The root `AGENTS.md` in this template repo is intentionally lightweight and exists only to prevent confusion.
- The profile-aware operating-model sources live under `agent/AGENTS.core.md`, `agent/profiles/`, and `agent/generated/`.
- `agent/AGENTS.md` is the default `backend-generic` rendered output.
- The `dynamic-skills/` directory is different from the installed skill packs: those files are setup prompts for any remaining generated helpers, not reusable skills that the AI should load for normal day-to-day execution.

If you update the core or profile sources, regenerate the rendered outputs with:

```text
node agent/scripts/render-agents.js --all
```

## Copy Targets

Copy these files and directories into the target repository:

- One of the rendered production profiles:
  - `agent/generated/AGENTS.frontend-web.md` -> copy to the target repo root as `AGENTS.md`
  - `agent/generated/AGENTS.frontend-mobile.md` -> copy to the target repo root as `AGENTS.md`
  - `agent/generated/AGENTS.backend-generic.md` -> copy to the target repo root as `AGENTS.md`
  - `agent/generated/AGENTS.backend-hono-supabase.md` -> copy to the target repo root as `AGENTS.md`
- `skills/` -> copy to the target repo as `.agent/skills/`
- `backend-skills/` -> copy only if the target repo has backend code
- `frontend-skills/frontend-shared-skills/` -> copy if the target repo has any frontend code
- `frontend-skills/frontend-web-skills/` -> copy only if the target repo has web frontend code
- `frontend-skills/frontend-mobile-skills/` -> copy only if the target repo has mobile frontend code
- `dynamic-skills/` -> optional; copy only if you want the remaining deployment-pipeline setup prompt on Day 1

Recommended target layout:

```text
target-repo/
├── AGENTS.md
└── .agent/
    └── skills/
        ├── brainstorming-features/
        ├── bootstrap-memory-bank/
        ├── build-execution/
        ├── legal-compliance-checker/
        ├── systematic-debugging/
        ├── verification-before-completion/
        ├── writing-docs/
        ├── writing-plans/
        ├── backend-secure-coding/             # optional
        ├── backend-architect-supabase-hono/   # optional
        ├── backend-supabase-hono-secure-coding/ # optional
        ├── supabase-postgres-best-practices/  # optional
        ├── accessible-ui/                     # optional
        ├── api-feature-request/               # optional
        ├── composition-patterns/              # optional
        ├── expo-native-data-fetching/         # optional
        ├── frontend-mobile-secure-coding/     # optional
        ├── frontend-web-secure-coding/        # optional
        ├── react-best-practices/              # optional
        └── react-native-skills/               # optional
```

## First Question To Ask

Before choosing an `AGENTS` profile or skill packs, the AI should ask the user:

```text
Which production profile should this repository use: frontend web, frontend mobile, backend generic, or backend hono-supabase?
```

Do not force the AI to infer this when the user can answer it directly in one line.

## Minimum Install

For most repos, the minimum useful install is:

1. Copy the selected rendered `AGENTS.<profile>.md` file to the target repo root as `AGENTS.md`.
2. Copy `skills/` to `.agent/skills/` in the target repo.
3. Copy only the domain packs the target repo actually needs for that profile.

Examples:

- Frontend web: use `AGENTS.frontend-web.md` and add `frontend-skills/frontend-shared-skills/` plus `frontend-skills/frontend-web-skills/`
- Frontend mobile: use `AGENTS.frontend-mobile.md` and add `frontend-skills/frontend-shared-skills/` plus `frontend-skills/frontend-mobile-skills/`
- Backend generic: use `AGENTS.backend-generic.md` and add `backend-skills/`
- Backend Hono + Supabase: use `AGENTS.backend-hono-supabase.md` and add `backend-skills/`
- Full-stack monorepo: choose the dominant production profile first, then combine the other relevant domain packs and project-specific generated skills as needed

## Day 1 Optional Step: Generate A Project-Specific Deployment Skill

If you copied `dynamic-skills/`, treat the remaining prompt there as a setup
prompt, not as an installed runtime skill.

Use it inside the target repo only if you want a repo-local deployment helper:

- `.agent/skills/project-deployment-pipeline/SKILL.md`

That generated skill belongs in the target repo, not in this template repo.

## What To Tell The AI

After copying the files, open the target repo and point the AI at:

- `AGENTS.md` in the target repo root
- `.agent/skills/`
- Any generated `.agent/skills/project-*/SKILL.md` files

Do not tell the AI to load `dynamic-skills/` as if they were ordinary installed skills for day-to-day coding. Use them only during setup to create the project-specific skills above.

Initial repository bootstrap prompt:

```text
Read AGENTS.md first. This repository uses AGENTS.md as the primary operating model and .agent/skills/ as the complementary capability layer.
Before loading domain skills, confirm which production profile this repo is using: frontend web, frontend mobile, backend generic, or backend hono-supabase.
When creating or refreshing `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`, or `projectRules.md`, load `.agent/skills/bootstrap-memory-bank/SKILL.md` and work one document at a time with explicit human confirmation before writing.
Examine the code base to create the memory bank according to the AGENTS 2.2 spec. Do not use readme files or other documentation as the primary source; examine the code and logic.
After that, load the relevant universal skills from .agent/skills/ and follow the PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY -> DOCS workflow.
If project-specific skills exist under .agent/skills/project-*/, use them alongside the universal skills: they define this repo's specific wiring and local constraints, while the universal skills remain the higher-level source of truth for architecture, quality, and execution discipline.
```

Optional Day 1 dynamic-skills prompt:

```text
This repo already uses AGENTS.md as the operating model. We are in setup mode.
Treat the files in dynamic-skills/ as setup prompts, not runtime skills.
If we need a project-specific deployment helper, run the remaining deployment prompt, discuss the proposed non-negotiables with me before writing anything, then generate the approved project-specific skill file under .agent/skills/project-*/.
That generated skill must complement the universal skills and defer to AGENTS.md and the higher-order skill packs.
```

Normal session commands after bootstrap:

```text
startup
BUILD
QA
Document it. Update the memory bank.
/compact
```

## Rules Of Thumb

- Treat this template repo as the source of truth for reusable workflow assets.
- Treat the target repo as the place where installation, generated skills, and project memory live.
- Do not write generated project-specific skills back into this template repo.
- Choose the target repo's production profile deliberately; it tunes `AGENTS.md` toward that production domain.
- Only install the skill packs the target repo actually needs.
