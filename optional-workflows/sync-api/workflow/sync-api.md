---
description: Client-side sync workflow for keeping the app aligned with the backend contract.
---

# Client-Side Sync Workflow (API is God)

**Purpose:**

- Keep the client strictly contract-driven (API is authoritative).
- Detect contract drift early.
- Prevent client-side "patching around" missing or ambiguous API behaviour.

**Non-negotiable scope:**

- This workflow operates in the client repository only.
- You are not authorised to modify backend code, database schema, or the OpenAPI
  spec in the backend repo.
- If the API contract is insufficient, halt and report the gap.

---

## Operating rule (API is God)

- The client must not infer, guess, widen, default, or hallucinate
  request/response shapes.
- Mutations must be observable:
  - Prefer returning the updated model (typed) and using it to update caches, or
  - Explicitly handle 204 No Content.
- Errors must be typed and handled via stable codes, not string matching.

---

## Inputs

- OpenAPI spec (source of truth):
  - Either checked into this repo, or fetched during generation.
  - Generated types/client output directory (do not hand-edit).

---

## Step-by-step workflow

### 0) Refresh the contract (spec)

Fetch the latest OpenAPI spec (canonical source of truth) from the server.

// turbo

```bash
npm run api:sync
```

**Hard rule:**

- Do not manually "fix" generated outputs. Fix the contract inputs (`src/lib/api-schema.json`) or the callsites.

---

### 1) Slice and Checksum

Slice the full spec by tag into `src/lib/api/slices/` and compute checksums. This step identifies which functional domains have changed.

// turbo

```bash
npm run api:slice
```

**Artefacts produced:**

- `src/lib/api/slices/*.json`: Tag-specific mini-specs.
- `src/lib/api/slices/.checksums.json`: Record of last-known states.

---

### 2) Incremental Code Generation (Orval)

Run the orchestrated generator. It only runs Orval on dirty slices (where checksums mismatched).

// turbo

```bash
npm run api:gen
```

**Expected outcome:**

- Only files in `src/lib/api/${dirty_tag}/` and `src/lib/api/zod/${dirty_tag}/` are updated.
- `index.schemas.ts` and `index.ts` remain stable across incremental runs.

**Manual Full Regeneration (Escape Hatch):**
If things get out of sync or global types change unexpectedly:

```bash
npm run api:gen:full
```

**Hard rules:**

- Generated files are treated as read-only.
- No `as any` or casting to silence type errors in callsites.

---

### 2) Compile gate (contract alignment)

// turbo

```bash
npx tsc --noEmit
```

If this fails:

- Treat as a contract mismatch at a callsite.
- Fix the client code to match the generated contract.

**Prohibited fixes:**

- `as any`, `as unknown as X`, widening types, adding fake defaults.

---

### 3) Lint / format gate (consistency)

// turbo

```bash
npm run lint
```

// turbo

```bash
npm run format:check || true
```

(Use your repo's actual lint/format scripts.)

---

### 4) Test gate (behaviour alignment)

// turbo

```bash
npm test
```

If this fails:

- Investigate whether the API contract changed (response shape, status codes,
  error schema).
- Update tests and callsites to match the new contract.

---

## Contract discipline gates

These checks prevent semantic drift where types might technically pass but intent fails.

### 5) Drift Prevention Review

While TypeScript handles structural alignment, semantic drift must be caught by review.
Use `git diff` to verify:

1.  **Observability**: Mutations must return models or handle 204s explicitly. No void/any returns.
2.  **Error Handling**: Errors must rely on stable codes, not string messages.
3.  **Zero Inference**: No defaulting or guessing on partial payloads.

### 6) Generated contract diff review gate

```bash
git diff
```

Review specifically:

- Nullable vs optional flips
- Enum changes
- Response models added/removed
- Error schema changes

**Hard rule:**

- If the diff implies a behaviour change, the client must be updated
  accordingly.

---

## Reporting contract gaps (halt, don't patch)

If you discover the client cannot implement a feature safely because the API
does not provide enough information:

- Stop.
- Create a short "Contract Gap" note (in the client repo) containing:
  - Endpoint + method
  - What is missing
  - Why the client cannot proceed without guessing
  - The minimal contract change needed

**Do not:**

- invent client-side assumptions
- add fake defaults
- loosen types

Any API/spec change requires explicit authorisation and happens outside this
workflow.

---

## Completion checklist

A sync is only "done" when:

- [ ] OpenAPI contract is up to date in the client
- [ ] Types/client regenerated successfully
- [ ] `tsc --noEmit` passes
- [ ] Tests pass
- [ ] Drift Prevention Review passes
- [ ] Contract diff reviewed
- [ ] Any contract gaps logged (if found)

---
