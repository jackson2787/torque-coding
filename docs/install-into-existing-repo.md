# Install Into An Existing Repo

Use this document as the single install entrypoint when you want an AI to set up this workflow inside a real project repository.

## What This Repo Is

This repository is a template and source library.

- The files here are the canonical source assets.
- You do not run day-to-day work inside this template repo.
- You copy the relevant files into the target repository, then point your AI at the copied files inside that target repo.
- The `dynamic-skills/` directory is different from the installed skill packs: those files are prompt-generators used to create project-specific skills, not reusable skills that the AI should load for normal day-to-day execution.

## Copy Targets

Copy these files and directories into the target repository:

- `AGENTS.md` -> copy to the target repo root as `AGENTS.md`
- `skills/` -> copy to the target repo as `.agent/skills/`
- `backend-skills/` -> copy only if the target repo has backend code
- `frontend-web-skills/` -> copy only if the target repo has web frontend code
- `frontend-mobile-skills/` -> copy only if the target repo has mobile frontend code
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

1. Copy `AGENTS.md` to the target repo root.
2. Copy `skills/` to `.agent/skills/` in the target repo.
3. Copy only the domain packs the target repo actually needs.

Examples:

- Frontend web: add `frontend-web-skills/`
- Frontend mobile: add `frontend-mobile-skills/`
- Backend: add `backend-skills/`
- Full-stack monorepo: combine the relevant packs

## Day 1 Optional Step: Generate Project-Specific Skills

If you copied `dynamic-skills/`, treat them as setup prompts, not as installed runtime skills.

Use them inside the target repo to generate project-specific rules:

- `.agent/skills/project-frontend-architecture/SKILL.md`
- `.agent/skills/project-secure-coding/SKILL.md`
- `.agent/skills/project-deployment-pipeline/SKILL.md`

These generated skills belong in the target repo, not in this template repo.

## What To Tell The AI

After copying the files, open the target repo and point the AI at:

- `AGENTS.md`
- `.agent/skills/`
- Any generated `.agent/skills/project-*/SKILL.md` files

Do not tell the AI to load `dynamic-skills/` as if they were ordinary installed skills for day-to-day coding. Use them only during setup to create the project-specific skills above.

Suggested bootstrap prompt:

```text
This repository uses the AI workflow installed in AGENTS.md and .agent/skills/.
Read AGENTS.md first, then load the relevant skills for this repo.
Before choosing optional skill packs, ask me whether this repo is frontend web, frontend mobile, backend, or a full-stack/monorepo combination.
Follow the PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY -> DOCS workflow.
If project-specific skills exist under `.agent/skills/project-*/`, use them alongside the universal skills: they define this repo's specific wiring and local constraints, while the universal skills remain the higher-level source of truth for architecture, quality, and execution discipline.
```

Suggested Day 1 dynamic-skills prompt:

```text
This repo has the workflow installed in AGENTS.md and .agent/skills/.
Please run through the dynamic skill generators one at a time, starting with 01.
Analyze this repository, discuss the proposed non-negotiables with me before writing anything, then generate the approved project-specific skill files under .agent/skills/project-*/.
```

## Rules Of Thumb

- Treat this template repo as the source of truth for reusable workflow assets.
- Treat the target repo as the place where installation, generated skills, and project memory live.
- Do not write generated project-specific skills back into this template repo.
- Only install the skill packs the target repo actually needs.
