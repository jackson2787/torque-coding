# Dynamic Project Skills

Welcome to the **Dynamic Skills** folder.

This folder is no longer the place for security or architecture rule generation.

Those concerns are now handled by:

- `skills/bootstrap-memory-bank/` for human-confirmed Memory Bank grounding
- static domain skills for reusable frontend, mobile, and backend security
  posture

This folder now exists only for the remaining setup prompts that still need to
generate a repo-local helper on Day 1.

## Execution Sequence

There is currently one remaining setup prompt:

### `03-deployment-pipeline.md`
* **What it does:** Investigates where the project is hosted (Vercel, EAS, AWS).
* **Output:** Generates unbreakable CI/CD and deployment rules. Instead of the AI hallucinating generic 2021 GitHub Action YAML files, it is strictly bound to use the native CLI tools for your platform and enforces strict environment variable naming conventions (`NEXT_PUBLIC_`, `EXPO_PUBLIC_`, etc.).

---

## How to Trigger

On Day 1 of a new repository, open an AI Chat or Agent and provide the following prompt:

> "I have just initialized this repository. Read `AGENTS.md` first. Use `bootstrap-memory-bank` to create the Memory Bank with human confirmation. Use the installed domain security skills for secure coding decisions. Only use the remaining prompt in `dynamic-skills/` if we want a generated project-specific deployment helper."
