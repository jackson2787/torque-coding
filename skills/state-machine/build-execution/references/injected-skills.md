# Injected Skills — BUILD Phase

<!--
  PURPOSE: List behavioural skills the agent MUST load before building.

  These are not reference docs — they are discipline injections that change
  HOW the agent works during implementation. Without them, the agent will
  not apply these concerns while writing code.

  HOW TO USE:
  1. Add one skill per line using the format below
  2. The agent will load each skill before starting the BUILD execution loop
  3. Skills listed here are MANDATORY for every build session
  4. Use Context7 MCP for framework/library reference docs — this file is
     for behavioural skills only
  5. You may list the same skills as the PLAN phase, or different ones —
     some disciplines matter more at build time than plan time, and vice versa

  FORMAT:
  - `path/to/skill/` — Brief reason this discipline matters during build

  EXAMPLE:
  - `.agent/skills/accessible-ui/` — Components must follow accessibility patterns
  - `.agent/skills/security-hardening/` — Code must pass security checks
  - `.agent/skills/error-handling-patterns/` — Error handling must follow project standards
-->

## Required Skills

<!-- Add your project's behavioural skills below. Remove the examples. -->
