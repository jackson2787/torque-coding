# Install Into An Existing Repo

Use this document as the single install entrypoint when you want an AI to set up this workflow inside a real project repository.

## What You Are Installing

You are bootstrapping two interconnected systems into the target repository:

1. **The operating model**: `agent/AGENTS.md`
   This is the source asset in this template repo. Copy it into the target repo root as `AGENTS.md`; that installed file becomes the primary source of truth for how the agent should work in the target repo.

2. **The capability layer**: the reusable skill packs
   These complement `AGENTS.md` with domain-specific guidance for execution, planning, verification, frontend work, mobile work, backend work, and documentation.

There is also an optional third layer:

3. **The local project layer**: generated project-specific skills
   These are created from the prompts in `dynamic-skills/` and live under `.agent/skills/project-*/` in the target repo.

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
- The root `AGENTS.md` in this template repo is intentionally lightweight and exists only to prevent confusion; the deployable operating model source is `agent/AGENTS.md`.
- The `dynamic-skills/` directory is different from the installed skill packs: those files are prompt-generators used to create project-specific skills, not reusable skills that the AI should load for normal day-to-day execution.

## Copy Targets

Copy these files and directories into the target repository:

- `agent/AGENTS.md` -> copy to the target repo root as `AGENTS.md`
- `skills/` -> copy to the target repo as `.agent/skills/`
- `backend-skills/` -> copy only if the target repo has backend code
- `frontend-skills/frontend-shared-skills/` -> copy if the target repo has any frontend code
- `frontend-skills/frontend-web-skills/` -> copy only if the target repo has web frontend code
- `frontend-skills/frontend-mobile-skills/` -> copy only if the target repo has mobile frontend code
- `dynamic-skills/` -> optional; copy only if you want prompt-generators that help the AI create project-specific skills on Day 1

Recommended target layout:

```text
target-repo/
├── AGENTS.md
└── .agent/
    └── skills/
        ├── brainstorming-features/
        ├── executing-plans/
        ├── legal-compliance-checker/
        ├── systematic-debugging/
        ├── test-driven-development/
        ├── verification-before-completion/
        ├── writing-docs/
        ├── writing-plans/
        ├── writing-skills/
        ├── backend-architect/                 # optional
        ├── backend-architect-supabase-hono/   # optional
        ├── supabase-postgres-best-practices/  # optional
        ├── accessible-ui/                     # optional
        ├── api-feature-request/               # optional
        ├── composition-patterns/              # optional
        ├── expo-native-data-fetching/         # optional
        ├── react-best-practices/              # optional
        └── react-native-skills/               # optional
```

## First Question To Ask

Before choosing skill packs, the AI should ask the user:

```text
Is this repository frontend web, frontend mobile, backend, or a full-stack/monorepo combination?
```

Do not force the AI to infer this when the user can answer it directly in one line.

## Minimum Install

For most repos, the minimum useful install is:

1. Copy `agent/AGENTS.md` to the target repo root as `AGENTS.md`.
2. Copy `skills/` to `.agent/skills/` in the target repo.
3. Copy only the domain packs the target repo actually needs.

Examples:

- Frontend web: add `frontend-skills/frontend-shared-skills/` and `frontend-skills/frontend-web-skills/`
- Frontend mobile: add `frontend-skills/frontend-shared-skills/` and `frontend-skills/frontend-mobile-skills/`
- Backend: add `backend-skills/`
- Full-stack monorepo: combine `backend-skills/` with the relevant frontend packs

## Day 1 Optional Step: Generate Project-Specific Skills

If you copied `dynamic-skills/`, treat them as setup prompts, not as installed runtime skills.

Use them inside the target repo to generate project-specific rules:

- `.agent/skills/project-frontend-architecture/SKILL.md`
- `.agent/skills/project-secure-coding/SKILL.md`
- `.agent/skills/project-deployment-pipeline/SKILL.md`

These generated skills belong in the target repo, not in this template repo.

## What To Tell The AI

After copying the files, open the target repo and point the AI at:

- `AGENTS.md` in the target repo root
- `.agent/skills/`
- Any generated `.agent/skills/project-*/SKILL.md` files

Do not tell the AI to load `dynamic-skills/` as if they were ordinary installed skills for day-to-day coding. Use them only during setup to create the project-specific skills above.

Initial repository bootstrap prompt:

```text
Read AGENTS.md first. This repository uses AGENTS.md as the primary operating model and .agent/skills/ as the complementary capability layer.
Before choosing optional domain skill packs, ask me whether this repo is frontend web, frontend mobile, backend, or a full-stack/monorepo combination.
Examine the code base to create the memory bank according to the AGENTS 2.2 spec. Do not use readme files or other documentation as the primary source; examine the code and logic.
After that, load the relevant universal skills from .agent/skills/ and follow the PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY -> DOCS workflow.
If project-specific skills exist under .agent/skills/project-*/, use them alongside the universal skills: they define this repo's specific wiring and local constraints, while the universal skills remain the higher-level source of truth for architecture, quality, and execution discipline.
```

Optional Day 1 dynamic-skills prompt:

```text
This repo already uses AGENTS.md as the operating model. We are in setup mode.
Please run through the dynamic skill generators one at a time, starting with 01.
Treat the files in dynamic-skills/ as setup prompts, not runtime skills.
Analyze this repository, discuss the proposed non-negotiables with me before writing anything, then generate the approved project-specific skill files under .agent/skills/project-*/.
Those generated skills must complement the universal skills and defer to AGENTS.md and the higher-order skill packs.
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
- Only install the skill packs the target repo actually needs.
