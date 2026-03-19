# Product Context

<!-- RULE: This file captures USER and PRODUCT context — who uses it, what they need, what matters. -->
<!-- RULE: Most content requires human confirmation. Do not invent user segments from code. -->
<!-- RULE: Unconfirmed claims MUST stay in "Pending Human Confirmation" until confirmed. -->

## Primary Users

<!-- Confirmed user segments or roles. Only list users the human has confirmed. -->
<!-- Example:
- **Engineering leads**: Create sprints, assign tasks, review velocity reports
- **Individual contributors**: Pick up tasks, link PRs, update status
- **Product managers**: View progress dashboards, create feature-level epics (read-mostly)
-->

## Jobs To Be Done

<!-- What users are trying to accomplish. Frame as outcomes, not features. -->
<!-- Example:
- **Engineering lead** needs to see what's blocked without asking in Slack
- **IC developer** needs to pick their next task and know exactly what "done" means
- **Product manager** needs to understand sprint capacity before committing to deadlines
-->

## Critical Flows

<!-- The most important user-facing flows. These are the paths that must never break. -->
<!-- Example:
- **Task lifecycle**: Create → Assign → In Progress → In Review → Done
- **Sprint planning**: Create sprint → Drag tasks in → Set capacity → Start sprint
- **PR linking**: Push branch with task ID → PR auto-links → Status updates on merge
- **Dashboard view**: Open dashboard → See sprint progress, blockers, velocity trend
-->

## Product Priorities

<!-- What the product optimizes for, and the trade-offs it accepts. -->
<!-- Example:
- **Speed over completeness**: Ship a usable tool fast; polish later
- **Convention over configuration**: Opinionated defaults, minimal settings
- **Team transparency over individual privacy**: All task status is visible to the team
- **Git-native over tool-native**: The Git workflow is primary; the tool adapts to it, not the reverse
-->

## Pending Human Confirmation

<!-- Inferred claims that need human verification. Each item states the inference and supporting evidence. -->
<!-- Example:
- Product managers are a primary user segment — Evidence: dashboard views exist in code, role "pm" in auth config — Status: Unconfirmed
- Mobile access is not a priority — Evidence: no mobile views or responsive breakpoints found — Status: Unconfirmed
- Notifications are expected via email — Evidence: email templates exist in /templates/emails/ — Status: Unconfirmed
- The product targets teams using GitHub specifically (not GitLab/Bitbucket) — Evidence: only GitHub OAuth and webhook integrations found — Status: Unconfirmed
-->
