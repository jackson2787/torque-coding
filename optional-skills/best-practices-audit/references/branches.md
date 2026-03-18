# Branch Guidance

## `nextjs`

Load and use:

- `react-best-practices/`
- `accessible-ui/`
- `composition-patterns/`

Optionally include:

- `api-feature-request/` if API integration quality,
  request boundaries, or frontend-backend contract shape is materially relevant

Audit for:

- rendering and performance problems
- data-fetching and request-boundary problems
- accessibility issues
- component composition drift
- repo-local drift from the installed frontend playbook

## `expo`

Load and use:

- `react-native-skills/`
- `expo-native-data-fetching/`
- `accessible-ui/`
- `composition-patterns/`

Optionally include:

- `api-feature-request/` if API integration quality is
  in scope

Audit for:

- list and rendering performance problems
- app structure and navigation issues
- platform-aware UI problems
- accessibility issues
- data-fetching and request-boundary problems
- repo-local drift from the installed mobile playbook

Also load:

- `supabase-postgres-best-practices/` when the repo uses
  Postgres or Supabase, or when SQL/schema quality is in scope

Audit for:

- API and service boundary issues
- missing or weak auth, authz, validation, or rate limiting
- schema, query, and indexing issues
- resilience and observability issues
- repo-local drift from the installed backend playbook
