# Core Rules

## Startup Compliance (Output Every Session)

```
COMPLIANCE CONFIRMED: Reuse over creation
[Continue with Memory Bank loading...]
```

## The Four Sacred Rules

| Rule | Requirement | Validation |
|------|-------------|------------|
| ❌ **No new files without reuse analysis** | Search codebase, reference files that cannot be extended, provide exhaustive justification | Before creating: "Analyzed X, Y, Z. Cannot extend because [technical reason]" |
| ❌ **No rewrites when refactoring possible** | Prefer incremental improvements, justify why refactoring won't work | "Refactoring X impossible because [specific limitation]" |
| ❌ **No editing committed migration files** | Treat database migrations as append-only history. Add a new corrective migration instead of rewriting an existing one. | "Added a new migration; left historical migrations untouched" |
| ❌ **No generic advice** | Cite `file:line`, show concrete integration points. ✅ `"Extended services/auth.ext:45 following architecture.md#Service Extension Pattern"` ❌ `"Updated service per architecture.md"` | Every suggestion includes `file:line` citation |
| ❌ **No ignoring existing architecture** | Load patterns before changes, extend existing services/components, consolidate duplicates | "Extends existing pattern at `file:line`" |

## Reuse Proof

Required before creating any new file:

```markdown
- [ ] Searched: [search terms] → found: [list files]
- [ ] Analyzed extension:
  - [ ] `existing/file1.ext` - Cannot extend: [specific technical reason]
  - [ ] `existing/file2.ext` - Cannot extend: [specific technical reason]
- [ ] Checked patterns: `architecture.md#[section]`
- [ ] Justification: New file needed because [exhaustive reasoning]
```

## Absolute Prohibitions

| Prohibition | Consequence |
|-------------|-------------|
| ❌ No fake/simulated/mock data in production code | Rollback + restart |
| ❌ No stubbed functions marked complete | Rollback + restart |
| ❌ No ignoring test failures | Rollback + restart |
| ❌ No "defensive programming" (fix root cause) | Rollback + restart |
| ❌ No applying changes without approval | Rollback + restart |

Test fixtures and test mocks are acceptable. Production fake data is never acceptable.

### Documentation Standards

**Files Requiring Approval Before Creation**:
- Any `.memory-bank/tasks/*/` files (task docs)
- Updates to `.memory-bank/tasks/*/README.md` (monthly summaries)
- Updates to `.memory-bank/decisions.md` (ADRs)
- Updates to `.memory-bank/architecture.md` (patterns/rules)
- Any commits to version control

**Files NOT Requiring Approval**: App code, tests, config updates

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

### Versioning & Rollback

**Version Management**: Do not invent release/milestone IDs. If new milestone needed, output Proposal block for user to assign ID.

**Rollback Triggers**: APPLY fails | User requests revert | Critical error | Security vulnerability

**Rollback Protocol**:
1. Identify last known good state
2. Restore all files to that state
3. Verify rollback successful
4. Update `activeContext.md` Current State section with rollback status
5. Report to user: reason, reverted changes, current state, recommendation
