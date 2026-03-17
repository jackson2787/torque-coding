# Install Optional Workflows

Use this document when you want an AI to install one of the optional workflow
packages from `optional-workflows/` into a real project repository.

This is separate from the main repo bootstrap flow. The core install flow sets
up `AGENTS.md`, skill packs, and optional project-specific skills. This document
covers optional workflow packages that a human can choose to install later.

---

## What An Optional Workflow Is

An optional workflow is a small installable package that lives under:

```text
optional-workflows/<workflow-name>/
```

Each package is self-contained and includes:

- a package-level `README.md` that acts as the install contract
- a `workflow/` directory containing the IDE workflow file to copy into
  `.agent/workflows/`
- a `resources/` directory containing project files that support the workflow

The package `README.md` is the source of truth for how that workflow should be
installed.

---

## AI Installer Rule

When the user asks to install an optional workflow, the AI should:

1. Ask which workflow package they want to install.
2. Locate the package under `optional-workflows/<workflow-name>/`.
3. Read that package's `README.md`.
4. Follow the package README exactly.
5. Copy the workflow file into `.agent/workflows/`.
6. Copy any supporting resources into the target repo locations defined by the
   package README.
7. Update any required project files such as `package.json`, config files, or
   scripts exactly as instructed by the package README.
8. Report what was installed and what still requires project-specific
   customization.

Do not invent installation steps that are not described in the workflow package
README unless the user explicitly asks for an adaptation.

---

## Recommended Session Model

Optional workflows are best installed and run in a fresh chat so the context
stays focused on that workflow and the target repository.

If the target repository uses `AGENTS.md`, the optional workflow should still
operate within that contract. Optional workflows complement the repo's
operating model; they do not replace approval gates, QA expectations, or
documentation rules unless the user explicitly asks to work outside those
constraints.

In short:

- use a fresh chat for context hygiene
- keep `AGENTS.md` as the governing contract when it exists in the target repo

---

## First Question To Ask

Start with:

```text
Which optional workflow would you like to install?
```

If helpful, the AI may also list the currently available packages by scanning:

```text
optional-workflows/*/README.md
```

---

## Current Package Model

Each optional workflow package should follow this structure:

```text
optional-workflows/<workflow-name>/
├── README.md
├── workflow/
│   └── <workflow-file>.md
└── resources/
    └── ...
```

Interpretation:

- `README.md`: installation instructions for humans and AI
- `workflow/`: the workflow file copied to `.agent/workflows/`
- `resources/`: support files copied into normal project locations

---

## Installation Procedure

After the user chooses a workflow:

1. Open `optional-workflows/<workflow-name>/README.md`.
2. Treat that README as the canonical install guide for the package.
3. Install the workflow into the target repository exactly as described.
4. Preserve the distinction between:
   - workflow files copied into `.agent/workflows/`
   - support resources copied into application folders
   - project-specific customization the user must provide or approve

---

## Example Prompt For The AI

```text
Please install one of the optional workflows from this repository.
First, ask me which workflow I want.
Then read the selected package README under optional-workflows/<workflow-name>/README.md
and carry out the installation exactly as described there.
Treat the package README as the source of truth for copy targets, scripts,
dependencies, and required project-specific customization.
```

---

## Example With `sync-api`

If the user selects `sync-api`, the AI should read:

```text
optional-workflows/sync-api/README.md
```

and then follow that README for:

- the workflow file copy target
- the `resources/` copy targets
- `package.json` script updates
- dependency installation
- project-specific `api:sync` customization

---

## Notes

- Optional workflows are not core skill packs.
- Optional workflows still complement the broader AI operating model used by the
  target repository.
- Each workflow package should remain independently installable through its own
  `README.md`.
