import { defineConfig } from 'orval';

// Set ORVAL_TAG env var to regenerate a single tag slice only.
// Leave unset for a full regeneration.
const tag = process.env.ORVAL_TAG;
const input = tag ? `src/lib/api/slices/${tag}.json` : 'src/lib/api-schema.json';

export default defineConfig({
  api: {
    input,
    output: {
      target: `src/lib/api/index.ts`,
      client: 'react-query',   // swap to 'fetch' or 'axios' for non-React-Query projects
      mode: 'tags-split',
      clean: !tag,             // Only clean during full regeneration
      override: {
        mutator: {
          // Point to your project's hardened fetch wrapper
          path: 'src/lib/apiClient.ts',
          name: 'customInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write --ignore-unknown',
    },
  },
  zod: {
    input,
    output: {
      target: `src/lib/api/zod/index.ts`,
      client: 'zod',
      mode: 'tags-split',
      clean: !tag,
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write --ignore-unknown',
    },
  },
});
