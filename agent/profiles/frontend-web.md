**Active Profile**: `frontend-web`

Use this profile for browser-first product repositories such as Next.js, React,
or other web frontends where the primary production surface is the web app.

**Default Domain Skill Packs**:
- `.agent/skills/react-best-practices/SKILL.md`
- `.agent/skills/composition-patterns/SKILL.md`
- `.agent/skills/accessible-ui/SKILL.md`
- `.agent/skills/api-feature-request/SKILL.md` for any backend integration planning
- `.agent/skills/next-best-practices/SKILL.md` when the repo uses Next.js
- `.agent/skills/next-cache-components/SKILL.md` when working on App Router caching boundaries

**Primary Bias**:
- Optimize for production web UX, accessibility, rendering strategy, cache/data-fetching discipline, and browser-safe security posture.

**PLAN Bias**:
- Treat route/data boundaries and UI composition as expensive decisions.
- Require clear loading/error/empty states and client-server data ownership.
- For backend-facing work, plan the API surface before implementation.

**BUILD Bias**:
- Preserve existing design-system and composition patterns.
- Prefer API-first data access over direct database access from the frontend.
- Treat accessibility, responsive behavior, and cache invalidation as part of the implementation, not polish.

**QA Bias**:
- Check rendering behavior, loading transitions, keyboard/accessibility behavior, and frontend API contract alignment.

**Red Flags**:
- Bypassing established frontend data-fetching conventions.
- Shipping inaccessible interactions or incomplete loading/error states.
- Mixing page logic, data logic, and presentation in a way that breaks composition patterns.
