# Memory Bank

## Structure

```
.memory-bank/
├── toc.md                    # Index (update after new files/tasks)
├── projectBrief.md           # Vision, goals (rarely change)
├── productContext.md         # User goals, market (quarterly)
├── architecture.md           # Patterns, rules, tech stack
├── activeContext.md          # Working state: current focus, progress, session data
├── decisions.md              # ADRs - append-only (architectural decisions)
├── database-schema.md        # Data models (if applicable)
├── build-deployment.md       # Build/deploy procedures
├── testing-patterns.md       # Test strategies
└── tasks/
    ├── YYYY-MM/
    │   ├── README.md         # Monthly summary (month end)
    │   └── DDMMDD_*.md       # Task docs (after approval)
    └── YYYY-MM/README.md
```

## Document Skills

Each memory-bank document has a dedicated update skill that enforces its internal
structure and write rules. See `.claude/skills/memory-bank/` for the full set:

| Document | Update Skill | Structure Enforced |
|----------|-------------|-------------------|
| `architecture.md` | `update-architecture` | Three sections: Tech Stack, Patterns, Rules |
| `activeContext.md` | `update-active-context` | Three sections: Current State, Progress, Session Data |
| `decisions.md` | `update-decisions` | Append-only ADR entries |
| `tasks/YYYY-MM/*.md` | `update-task-docs` | Task doc + monthly README pair |
| `toc.md` | `update-toc` | Mechanical file index |
| `projectBrief.md` | `update-project-brief` | Identity and mission (requires human approval) |
| `productContext.md` | `update-product-context` | User/product context (requires human confirmation) |

**Rule**: Always use the corresponding skill when writing to a memory-bank file.
Do not write directly. The skill enforces the document's constitutional structure
and validation rules.

**Templates**: Bootstrap uses `agent/templates/architecture.md` and
`agent/templates/activeContext.md` as structural templates for initial file creation.

## Update Rules

**When to Update MB** (always use the per-document skill):
- ✅ Completing major features → `update-active-context` (Progress section)
- ✅ Discovering new patterns → `update-architecture` (Patterns section)
- ✅ Making arch decisions → `update-decisions`
- ✅ User explicitly requests: "update memory bank" → relevant skill(s)
- ✅ Milestone completion → `update-task-docs` + `update-active-context`
- ❌ Minor bug fixes (task doc only)
- ❌ Code formatting (no doc needed)
- ❌ Dependency updates (task doc only)
- ❌ Routine maintenance (task doc only)
