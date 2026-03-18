---
description: >
  Dynamic script to generate a project-specific CI/CD and Deployment pipeline skill.
  Run this script on a new repository to analyze the hosting platform (Vercel, AWS, Expo, etc.)
  and generate strict, non-negotiable rules for deployments, environment variables, and branch protection.
---

# Dynamic Skill Generator: Deployment & CI/CD Pipelines

**Purpose:** This script instructs the AI agent to analyze the current repository's hosting and deployment targets, and then explicitly negotiate a set of non-negotiable DevOps rules tailored to this exact infrastructure, immortalized as a specific AI skill. This prevents the AI from hallucinating generic GitHub Actions or leaking environment variables.

## Phase 1: Infrastructure Discovery 🔍
Agent, before generating any rules, you must run the following checks on the target repository:
1. **Hosting Provider:** Scan for platform-specific configurations like `vercel.json` (Vercel), `netlify.toml` (Netlify), or AWS CDK/Terraform setups.
2. **Mobile Deployment:** If React Native/Expo, check `app.json` or `eas.json` to confirm if Expo Application Services (EAS) is being used for builds and updates.
3. **Existing CI/CD:** Check the `.github/workflows/` directory to see if there are already established linting, testing, or deployment scripts.
4. **Environment Variables:** Look at `.env.example` or conventions in use (e.g., `NEXT_PUBLIC_` vs `EXPO_PUBLIC_`).

## Phase 2: Dynamic Negotiation (Chat with the User) 💬
Once you have analyzed the repo, you MUST pause and start a direct conversation with the human user.

**Present your analysis (e.g., "I see we are deploying a Next.js web app to Vercel and an Expo mobile app via EAS...") and propose this baseline set of Ironclad DevOps Rules to the user:**

> "I have analyzed the repository's infrastructure. To ensure we never break a deployment or leak secrets, I propose these strict non-negotiable DevOps boundaries for this project:
> 
> 1.  **Deployment Methodology:** [IF VERCEL: We rely natively on Vercel's GitHub integration. It is strictly forbidden to write custom GitHub Actions for deployment.] [IF EXPO: All mobile app builds and over-the-air updates MUST be triggered exclusively via the `eas build` and `eas update` CLI tools.]
> 2.  **Environment Variables:** [IF NEXT.js: All client-side secrets MUST be prefixed with `NEXT_PUBLIC_`. All server-side secrets must remain unprefixed.] You are strictly forbidden from committing actual `.env` files to Git.
> 3.  **Mandatory CI Checks:** All code MUST pass the `npm run lint` and `npm run test` suites before it can be merged into the `main` deployment branch.
> 
> Here are the **Red Flags (Automatic Rejection)** I will watch for:
> * 'I will just write entirely new GitHub Actions yaml file instead of using the host provider.'
> * 'I will hardcode this API key just for testing.'
>
> Hey, what do you think of these deployment rules? Are there any specific staging environments, branch protection rules, or custom scripts you want me to add before I record these for us?"

*Proceed to Phase 3 ONLY after the user has responded, negotiated, and explicitly approved the final non-negotiables.*

## Phase 3: Skill Generation ⚙️
Using the agreed-upon constraints from Phase 2, generate a highly specific constraint document tailored to this repository. This document will become a new AI skill.

**Critical Formatting Constraints:**
*   You must generate a valid `SKILL.md` format, including YAML frontmatter with a `name: project-deployment-pipeline` and a `description:` that starts with "Use when..."
*   The skill must be highly concise, bulleted, and no longer than necessary to prevent LLM context bloat. Avoid verbose explanations.
*   You MUST include an explicit meta-rule stating: *"This skill defers to `AGENTS.md`, the relevant installed domain skills, and the repo Memory Bank as the higher-order sources of truth. This skill ONLY defines our specific project wiring and choices."*

## Phase 4: Output and Delivery 💾
You MUST adhere to the `AGENTS.md` state machine (PLAN -> BUILD -> DIFF -> QA -> APPROVAL -> APPLY).

1. Generate a proposed `DIFF` containing the new `SKILL.md` file layout.
2. The destination path for this new skill must be `.agent/skills/project-deployment-pipeline/SKILL.md` within the target repository.
3. Present the `DIFF` to the user and ask for explicit `APPROVAL`.
4. Once approved, write the generated, agreed-upon `SKILL.md` directly into the target project. 
**Do NOT** write the project-specific skill back into the generic `uber-ai-workflow` repository. 
Notify the user with a brief summary of the exact deployment and environment constraints that were immortalized as a skill.
