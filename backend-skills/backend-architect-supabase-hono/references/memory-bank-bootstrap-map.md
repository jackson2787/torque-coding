# Memory Bank Bootstrap Map

## Purpose

Use this reference when the bootstrap contract is creating or refreshing Memory
Bank documents for a repo that uses Hono inside Supabase Edge Functions with
Supabase/Postgres.

This file translates reusable stack doctrine into the subset that is appropriate
for repo-local grounding truth.

## Golden Rule

Do not copy the stack philosophy into the Memory Bank wholesale.

The references in this package are reusable stack doctrine.

The Memory Bank should only record:

- what this repo actually does
- what this repo intentionally adopts as local law
- what the human has confirmed is true for this repo

## Primary Targets

The main foundation documents for this stack are:

- `memory-bank/projectbrief.md`
- `memory-bank/productContext.md`
- `memory-bank/techContext.md`
- `memory-bank/systemPatterns.md`
- `memory-bank/projectRules.md`

## `projectbrief.md`

### Suggested Stack Input

Usually very light.

Only include stack information here if it is central to the identity or scope of
the product, for example:

- the product is intentionally built around a one-repo backend slice model
- the backend architecture is part of the product's delivery promise

### Do Not Put Here

- route mechanics
- Hono handler rules
- triple-lock details
- SQL boundary doctrine

### Human Confirmation Required

- whether the backend shape matters to product identity
- whether the product scope explicitly depends on this backend model

## `productContext.md`

### Suggested Stack Input

Usually none or nearly none.

At most, note product implications that are truly human-confirmed, such as:

- the product depends on secure user-scoped data flows
- the product expects integrated API and database delivery for rapid iteration

### Do Not Put Here

- architectural philosophy
- route or SQL rules
- inferred product value drawn from backend code alone

### Human Confirmation Required

- all user and product claims
- any statement about why the stack matters to product outcomes

## `techContext.md`

### Suggested Stack Input

This is a major consumer of the stack references.

Good candidates:

- Hono runs inside Supabase Edge Functions
- Supabase/Postgres is the system of record
- Deno runtime and dependency hygiene constraints
- deployment shape for edge-function route entrypoints
- versioned migration workflow
- the repo also relies on `supabase-postgres-best-practices` for deep tuning

### Relevant Source Sections

- `supabase-hono-api-philosophy.md`
  - `Why This Exists`
  - `The Core Bet`
  - `The Role of Hono`
  - `The Role of the Database`
- `hono-api-delivery-rules.md`
  - `Deno and Dependency Hygiene`
  - `Deployment Shape`
- `database-boundary-and-triple-lock.md`
  - `Versioned Change Workflow`

### Do Not Put Here

- motivational philosophy prose
- anti-pattern lists
- local laws that belong in `projectRules.md`

### Human Confirmation Required

- actual production runtime and hosting details
- any local deployment or migration conventions not provable from the repo

## `systemPatterns.md`

### Suggested Stack Input

This is the main consumer of the stack references.

Good candidates:

- route layer as an adapter over explicit database contracts
- thin routes, strong contracts
- schema-first route design
- single-slice backend delivery
- app factory or route factory reuse when present
- database bridge pattern such as `callDb(...)`
- explicit authority anchors
- triple-lock structure if the repo actually uses it

Write these as repo patterns, not as universal truths.

### Relevant Source Sections

- `supabase-hono-api-philosophy.md`
  - `The Core Bet`
  - `Architect First, Builder Second`
  - `The Single-Slice Principle`
  - `Thin Routes, Strong Contracts`
  - `Zero-Inference APIs`
  - `Security Posture`
  - `The Triple-Lock Mental Model`
- `hono-api-delivery-rules.md`
  - `The Role of the Route Layer`
  - `Schema First`
  - `Use the Existing App Factory`
  - `Middleware Order Matters`
  - `Handler Rules`
  - `Database Bridge Rule`
  - `Response Contract Rules`
- `database-boundary-and-triple-lock.md`
  - `The Database Is The Source Of Truth`
  - `Triple-Lock Mental Model`
  - `Authorization Model`
  - `Reusable RLS Helpers`

### Do Not Put Here

- patterns that appear only once
- aspirational architecture not yet adopted
- generic doctrine copied verbatim from the philosophy documents

### Human Confirmation Required

- which visible patterns are intentional
- which visible patterns are legacy or transitional
- whether triple-lock is a real repo pattern or only a design aspiration

## `projectRules.md`

### Suggested Stack Input

Only write stack-derived local laws here if the human confirms they should be
permanent repo rules.

Typical candidates:

- do not put business logic in Hono routes
- define request and response schemas before handlers
- use the repo's database bridge instead of raw `supabase.from(...)` in handlers
- avoid generic mutation responses like `{ success: true }`
- version database changes through migrations
- make authority models explicit rather than relying on vague role labels

### Relevant Source Sections

- `supabase-hono-api-philosophy.md`
  - `Thin Routes, Strong Contracts`
  - `Zero-Inference APIs`
  - `Security Posture`
  - `Anti-Patterns This Philosophy Rejects`
- `hono-api-delivery-rules.md`
  - `Schema First`
  - `Handler Rules`
  - `Database Bridge Rule`
  - `Response Contract Rules`
- `database-boundary-and-triple-lock.md`
  - `Versioned Change Workflow`
  - `Authorization Model`
  - `Forbidden Patterns`

### Do Not Put Here

- generic backend philosophy
- rules already covered well enough by `AGENTS.md`
- temporary migration behavior
- stack preferences the human did not explicitly adopt as repo law

### Human Confirmation Required

- whether each candidate rule is mandatory, preferred, or not local law at all

## Optional Follow-Up: `decisions.md`

If the repo chooses a specific variation of the stack, record it in
`decisions.md`, for example:

- why this repo uses the bridge pattern it uses
- why this repo adopts triple-lock
- why this repo keeps certain logic in SQL instead of TypeScript

Use `decisions.md` for repo-specific choices, not for general stack doctrine.
