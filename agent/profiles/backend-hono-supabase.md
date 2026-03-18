**Active Profile**: `backend-hono-supabase`

Use this profile for repositories where backend production work is centered on
Hono running inside Supabase Edge Functions with Supabase/Postgres as the
system of record.

**Default Domain Skill Packs**:
- `.agent/skills/backend-architect-supabase-hono/SKILL.md`
- `.agent/skills/backend-architect/SKILL.md`
- `.agent/skills/supabase-postgres-best-practices/SKILL.md`

**Primary Bias**:
- Optimize for complete API + database vertical slices, thin Hono routes, explicit request/response contracts, database-centered business logic, and Supabase-safe operational discipline.

**PLAN Bias**:
- Treat route contracts, SQL function signatures, authority modeling, and migration strategy as one design problem.
- Prefer architect posture until request/response schema, SQL boundary, and access model are explicit.

**BUILD Bias**:
- Keep route handlers thin and boring.
- Prefer shared route factories and database bridge patterns such as `callDb(...)`.
- Push durable business logic into SQL boundaries, not TypeScript route code.
- Treat the API and database as one integrated delivery surface for each backend feature.

**QA Bias**:
- Check route-schema alignment, auth and authority boundaries, migration correctness, error mapping, and whether the response contract is strong enough for zero-inference clients.

**Red Flags**:
- Direct `supabase.from(...)` table orchestration in Hono handlers where a DB bridge exists.
- Generic mutation payloads like `{ success: true }`.
- Backend work planned as “route now, schema later”.
- Blurring this profile with deep Postgres tuning instead of loading `supabase-postgres-best-practices`.
