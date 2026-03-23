# Sync API Installation

This skill package was staged here by `torque-coding init`. It requires
agent-assisted installation because it adds scripts and config to the project
root, not just a skill to `.agent/skills/`.

This package is intended for TypeScript frontend repositories that:

- consume an OpenAPI 3.x specification
- generate client types and request helpers with Orval
- use React Query, `fetch`, or `axios`
- want a repeatable workflow for syncing contract changes into the frontend

## What Gets Installed

Copy these files from this staged directory into the target repository:

| Source (this directory) | Destination |
| --- | --- |
| `resources/scripts/slice-openapi.js` | `scripts/slice-openapi.js` |
| `resources/scripts/generate-api.js` | `scripts/generate-api.js` |
| `resources/assets/orval.config.template.ts` | `orval.config.ts` |
| `skills/sync-api/` | `.agent/skills/sync-api/` |

The installed `.agent/skills/sync-api/` directory is the small operational
skill that can be manually invoked later inside the target repo.

## Package Scripts

After copying the resources, add these scripts to the project's `package.json`:

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

`api:sync` is installation-specific and must be adapted to the target project's
OpenAPI endpoint and auth model.

## Dependencies

Install Orval:

```bash
npm install --save-dev orval
```

Install peer dependencies if the target repo does not already have them:

```bash
npm install @tanstack/react-query zod
```

## Project-Specific Customization

### `api:sync`

Replace the placeholder `api:sync` command with the real endpoint, auth header,
and output path for the target project.

### `orval.config.ts`

After copying the template, update:

1. `output.client` to match the project: `react-query`, `fetch`, or `axios`
2. `override.mutator.path` to the project's hardened request wrapper
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

## Cleanup

After installation is complete and verified, delete this staged directory:

```bash
rm -rf docs/memory-bank/skills-to-install/sync-api
```

If no other skills remain in `docs/memory-bank/skills-to-install/`, remove
that directory too:

```bash
rmdir docs/memory-bank/skills-to-install 2>/dev/null
```

## Recommended Usage

1. Follow this guide to copy the scripts, template, and `.agent/skills/sync-api/`
   directory into the target repo.
2. Verify the copied files, `orval.config.ts`, and `package.json` entries.
3. Run the cleanup step above to remove this staging directory.
4. Invoke the installed `.agent/skills/sync-api/` skill only when you need to
   run an API sync or investigate contract drift.
