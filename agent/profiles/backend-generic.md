**Active Profile**: `backend-generic`

Use this profile for general backend repositories where the production surface
is an API, service layer, worker, or data system, but the stack is not tightly
opinionated around Hono + Supabase Edge Functions.

**Default Domain Skill Packs**:
- `.agent/skills/backend-architect/SKILL.md`
- `.agent/skills/supabase-postgres-best-practices/SKILL.md` when the repo uses Postgres or Supabase

**Primary Bias**:
- Optimize for durable service boundaries, security-first APIs, migration discipline, observability, and reliability under real production load.

**PLAN Bias**:
- Treat auth/authz, data contracts, service boundaries, and migration strategy as expensive-to-reverse decisions.
- Require explicit integration points, rollback thinking, and test strategy for backend changes.

**BUILD Bias**:
- Prefer incremental extension of existing services over parallel architecture.
- Keep API contracts explicit, validation strong, and operational behavior visible.
- Treat migrations, background jobs, and failure handling as part of the feature, not follow-up work.

**QA Bias**:
- Check contract correctness, security boundaries, migrations, error handling, observability hooks, and scalability/reliability regressions.

**Red Flags**:
- Public interfaces without validation or auth.
- Database or infra changes without migration/rollback thinking.
- “We will add security, monitoring, or operational hardening later.”
