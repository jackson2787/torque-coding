# Optional Skills

`optional-skills/` contains manually invoked skill packages for Codex-style
clients.

These packages are the skill-oriented counterparts to the older
`optional-workflows/` packages. They are intended for tasks that should be
available on demand, but should not be part of the default always-on skill
surface for normal coding work.

Each package follows a package-oriented Codex layout:

```text
optional-skills/<skill-name>/
├── installation.md         # human-facing install/setup guide
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md
│       └── agents/
│           └── openai.yaml
└── resources/              # optional shared assets/scripts/templates
```

Current optional skills:

- `idea-to-task/` - turns loose ideas into task contracts, triggered by `Create task contract`, and announces `Ideas to Task Contract running...`
- `best-practices-audit/`
- `sync-api/`

Design intent:

- Keep the operational instructions in the installed skill's `SKILL.md`
- Put Codex-specific invocation policy in `agents/openai.yaml`
- Use package-level `installation.md` for setup guidance
- Carry scripts and templates in `resources/` when they are part of the
  repeatable workflow or installation flow
