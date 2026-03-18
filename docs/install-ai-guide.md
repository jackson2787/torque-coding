# Fresh Install AI Guide

Use this guide when you want an AI to install this playbook into a real target
repository.

## Install Goal

The AI should:

1. Ask which domain the target repo should use.
2. Copy the correct `AGENTS` file into the target repo root as `AGENTS.md`.
3. Copy the universal skills into the target repo under `.agent/skills/`.
4. Copy the selected domain skill pack roots into `.agent/skills/`.
5. Ask which optional skills to install.
6. Copy the selected optional skill roots into `.agent/skills/`.

All installed skills must end up at:

```text
.agent/skills/<root-directory-of-skill>/
```

Do not nest them by source category such as `frontend-skills/` or
`backend-skills/` inside the target repo.

## Step 1: Ask The Domain

The AI should ask:

```text
Which domain do you want to install AGENT-ZERO into: universal, web, mobile, or supabase backend?
```

## Step 2: Copy The Correct AGENTS File

Use this mapping:

- `universal` -> copy `agent/AGENTS.md` to `AGENTS.md` in the target repo root
- `web` -> copy `agent/AGENTS.web.md` to `AGENTS.md` in the target repo root
- `mobile` -> copy `agent/AGENTS.mobile.md` to `AGENTS.md` in the target repo root
- `supabase backend` -> copy `agent/AGENTS.backend.supabase.md` to `AGENTS.md` in the target repo root

## Step 3: Always Copy The Universal Skills

Always install these skill roots into `.agent/skills/`:

- `skills/bootstrap-memory-bank/` -> `.agent/skills/bootstrap-memory-bank/`
- `skills/build-execution/` -> `.agent/skills/build-execution/`
- `skills/systematic-debugging/` -> `.agent/skills/systematic-debugging/`
- `skills/verification-before-completion/` -> `.agent/skills/verification-before-completion/`
- `skills/writing-docs/` -> `.agent/skills/writing-docs/`
- `skills/writing-plans/` -> `.agent/skills/writing-plans/`

## Step 4: Copy The Domain Skill Roots

### `universal`

No additional domain pack is required.

### `web`

Copy these roots into `.agent/skills/`:

- `frontend-skills/frontend-shared-skills/accessible-ui/`
- `frontend-skills/frontend-shared-skills/api-feature-request/`
- `frontend-skills/frontend-shared-skills/composition-patterns/`
- `frontend-skills/frontend-web-skills/react-best-practices/`
- `frontend-skills/frontend-web-skills/next-best-practices/`
- `frontend-skills/frontend-web-skills/next-cache-components/`
- `frontend-skills/frontend-web-skills/next-upgrade/`

### `mobile`

Copy these roots into `.agent/skills/`:

- `frontend-skills/frontend-shared-skills/accessible-ui/`
- `frontend-skills/frontend-shared-skills/api-feature-request/`
- `frontend-skills/frontend-shared-skills/composition-patterns/`
- `frontend-skills/frontend-mobile-skills/react-native-skills/`
- `frontend-skills/frontend-mobile-skills/expo-native-data-fetching/`

### `supabase backend`

Copy these roots into `.agent/skills/`:

- `backend-skills/backend-architect-supabase-hono/`
- `backend-skills/supabase-postgres-best-practices/`

## Step 5: Ask Which Optional Skills To Install

After the universal skills and chosen domain pack are copied, the AI should ask:

```text
Which optional skills do you want to install: brainstorming-features, legal-compliance-checker, best-practices-audit, sync-api, or none?
```

## Step 6: Optional Skill Mapping

If the user selects one or more optional skills, copy them into
`.agent/skills/` like this:

- `optional-skills/brainstorming-features/` -> `.agent/skills/brainstorming-features/`
- `optional-skills/legal-compliance-checker/` -> `.agent/skills/legal-compliance-checker/`
- `optional-skills/best-practices-audit/` -> `.agent/skills/best-practices-audit/`
- `optional-skills/sync-api/skills/sync-api/` -> `.agent/skills/sync-api/`

### `sync-api` Special Note

`sync-api` also has extra installation instructions and support files.

If the user chooses `sync-api`, the AI should also read:

- `optional-skills/sync-api/installation.md`

Then copy any required supporting scripts or assets described there.

## Ready-To-Paste AI Prompt

```text
We are installing AGENT-ZERO from this template repo into a target repository.

1. Ask me which domain to install: universal, web, mobile, or supabase backend.
2. Copy the matching file from agent/ into the target repo root as AGENTS.md.
3. Copy the universal skills into .agent/skills/ using the root skill directory names only.
4. Copy the selected domain skill roots into .agent/skills/.
5. Ask me which optional skills to install: brainstorming-features, legal-compliance-checker, best-practices-audit, sync-api, or none.
6. Install the selected optional skills into .agent/skills/<root-directory-of-skill>/.
7. If sync-api is selected, also follow optional-skills/sync-api/installation.md for any extra support files.

All skills must end up directly under .agent/skills/<skill-root>/ in the target repo.
Do not use the old dynamic-skills flow.
Do not nest skills by source folder name.
```
