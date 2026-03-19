# AGENTS.md

This repository is a template and source library for agent workflow assets.
It is not the installed day-to-day operating environment unless the user
explicitly says they want to work on the template itself.

## Purpose Of This Root File

This lightweight root `AGENTS.md` exists to prevent confusion in
`AGENTS.md`-aware tools.

The full deployable operating model for real project repositories lives at:

- `agent/AGENTS.md`

When installing this playbook into a target repo, copy:

- `agent/AGENTS.md` -> `AGENTS.md` in the target repo root
- `agent/bootstrap-memory-bank-contract.md` -> `.agent/bootstrap-memory-bank-contract.md`
- `skills/` -> `.agent/skills/`
- selected domain packs -> `.agent/skills/`
- generated project-specific skills -> `.agent/skills/project-*/`

## Ground Rules For This Template Repo

- Treat this repository as the source of reusable assets, not as the target
  application being operated under the full AGENT-ZERO workflow.
- Do not assume the root `AGENTS.md` here is the real operating contract for a
  deployed repo. The deployable source file is `agent/AGENTS.md`.
- Skills in `skills/`, `backend-skills/`, and `frontend-skills/` are source
  assets that get copied into a target repo's `.agent/skills/`.
- Generated project-specific skills belong only in the target repo under
  `.agent/skills/project-*/`, not back in this template repo.
- Optional skills remain manually invoked add-ons even after installation.
- Do not create or maintain a Memory Bank in this template repo unless the
  user explicitly asks for template-repo documentation work.
- If the user's intent is ambiguous, first determine whether they want to
  modify this template repo or bootstrap a separate target repo from it.

## Canonical Paths

- Full operating model source in this repo: `agent/AGENTS.md`
- Bootstrap contract source in this repo: `agent/bootstrap-memory-bank-contract.md`
- Install guide: `docs/install-ai-guide.md`
- Optional skill install guide: `docs/install-optional-skills.md`

If asked where the real agent instructions live, answer with
`agent/AGENTS.md`.
