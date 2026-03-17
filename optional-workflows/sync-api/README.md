# sync-api

`sync-api` is an optional workflow package for TypeScript frontend projects that
need to keep their client code strictly aligned with a backend OpenAPI contract.

This package is designed to be installed into a target project by following this
README. The workflow file is copied into the target repo's `.agent/workflows/`
directory, and the supporting resources are copied into normal project
locations such as `scripts/` and the repo root.

This package is intentionally separate from the core skill packs. Think of it as
a human-invoked IDE workflow plus the project files required to support it.

Recommended usage: run this workflow in a fresh chat in the target repository so
the context stays focused on the sync task.

If the target repository uses `AGENTS.md`, this workflow should still operate
within that contract. `sync-api` complements the repo's operating model; it does
not replace approval gates, QA expectations, or documentation rules unless the
user explicitly chooses to work outside them.

---

## Package Layout

```text
optional-workflows/sync-api/
├── README.md
├── workflow/
│   └── sync-api.md
└── resources/
    ├── orval.config.template.ts
    └── scripts/
        ├── slice-openapi.js
        └── generate-api.js
```

---

## What This Package Installs

Copy these files into the target repository:

| Source in this repo | Destination in target repo |
| --- | --- |
| `optional-workflows/sync-api/workflow/sync-api.md` | `.agent/workflows/sync-api.md` |
| `optional-workflows/sync-api/resources/scripts/slice-openapi.js` | `scripts/slice-openapi.js` |
| `optional-workflows/sync-api/resources/scripts/generate-api.js` | `scripts/generate-api.js` |
| `optional-workflows/sync-api/resources/orval.config.template.ts` | `orval.config.ts` |

The workflow file is the IDE-facing entrypoint.

The `resources/` directory contains the project files that make the workflow
work inside the installed repo.

---

## Who Should Install This

This package is a good fit for frontend repositories that:

- consume a backend OpenAPI 3.x specification
- generate client types and request helpers with Orval
- use React Query, `fetch`, or `axios`
- want a repeatable workflow for syncing contract changes into the frontend

Works with Expo / React Native, Next.js, Vite, and other TypeScript frontend
projects.

---

## Installation Steps

### 1. Copy the workflow file

Copy:

```text
optional-workflows/sync-api/workflow/sync-api.md
```

to:

```text
.agent/workflows/sync-api.md
```

This is the file the human will invoke from the IDE workflow layer.

### 2. Copy the support resources

Copy:

```text
optional-workflows/sync-api/resources/scripts/slice-openapi.js
optional-workflows/sync-api/resources/scripts/generate-api.js
```

to:

```text
scripts/slice-openapi.js
scripts/generate-api.js
```

Copy:

```text
optional-workflows/sync-api/resources/orval.config.template.ts
```

to:

```text
orval.config.ts
```

### 3. Update `package.json`

Add the following scripts to the target repo's `package.json`:

```json
{
  "scripts": {
    "api:sync": "curl -H \"apikey: $YOUR_API_KEY\" https://your-api-url/doc -o src/lib/api-schema.json",
    "api:slice": "node scripts/slice-openapi.js",
    "api:gen": "node scripts/generate-api.js",
    "api:gen:full": "node scripts/generate-api.js --full"
  }
}
```

`api:slice`, `api:gen`, and `api:gen:full` are the canonical workflow scripts.

`api:sync` is installation-specific and must be adapted to the target project's
OpenAPI endpoint and auth model.

### 4. Install dependencies

Install Orval:

```bash
npm install --save-dev orval
```

Install peer dependencies if the target repo does not already have them:

```bash
npm install @tanstack/react-query zod
```

---

## Project-Specific Customization

This package is reusable, but it is not zero-config. Before using it in a real
project, customize the following.

### `api:sync`

Replace the placeholder `api:sync` command with the real endpoint, auth header,
and output path for the target project.

Example for the current PointReady / Expo setup:

```json
{
  "scripts": {
    "api:sync": "curl -H \"apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY\" https://api.personal.pointready.app/functions/v1/api/doc -o src/lib/api-schema.json"
  }
}
```

### `orval.config.ts`

After copying `orval.config.template.ts` to `orval.config.ts`, update:

1. `output.client` to match the project: `react-query`, `fetch`, or `axios`
2. `override.mutator.path` to point to the project's hardened request wrapper
3. `override.mutator.name` to the exported function used by that wrapper

### Path assumptions

This package currently assumes the target repo uses:

- `src/lib/api-schema.json` for the downloaded spec
- `src/lib/api/` for generated client output
- `src/lib/api/zod/` for generated Zod output

If the target project uses different paths, update:

- `scripts/slice-openapi.js`
- `scripts/generate-api.js` if needed
- `orval.config.ts`

to match the target repo's structure.

---

## How The Workflow Is Used

After installation, the workflow is triggered by the human from the IDE using
the installed workflow file at:

```text
.agent/workflows/sync-api.md
```

The workflow then runs the package scripts inside the target repo:

```bash
npm run api:sync
npm run api:slice
npm run api:gen
npx tsc --noEmit
npm run lint
npm test
git diff
```

---

## Verification Checklist

After installing this package into a target repo, verify that:

- `.agent/workflows/sync-api.md` exists
- `scripts/slice-openapi.js` exists
- `scripts/generate-api.js` exists
- `orval.config.ts` exists
- `package.json` contains the required `api:*` scripts
- `npm run api:sync` downloads the latest spec successfully
- `npm run api:slice` creates the slice artefacts
- `npm run api:gen` generates client files without errors

---

## Important Rules

- Generated API files are read-only and should not be hand-edited.
- If the contract is insufficient, stop and report the gap rather than guessing.
- Full regeneration remains the escape hatch when incremental slices become
  inconsistent:

```bash
npm run api:gen:full
```

---

## Summary

Each optional workflow package in `optional-workflows/` should work like this:

- the package README is the install contract
- `workflow/` contains the IDE workflow entrypoint
- `resources/` contains the files copied into the target repo

`sync-api` is the first package following that model.
