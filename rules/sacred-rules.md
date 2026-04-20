# Core Rules

---

## Startup Compliance (Output Every Session)

```
COMPLIANCE CONFIRMED: Reuse over creation | Constitution over convenience
[Continue with Memory Bank loading...]
```

---

## The Six Sacred Rules

| Rule | Requirement | Validation |
|------|-------------|------------|
| ❌ **No new files without reuse analysis** | Search codebase, reference files that cannot be extended, provide exhaustive justification | Before creating: "Analyzed X, Y, Z. Cannot extend because [technical reason]" |
| ❌ **No rewrites when refactoring possible** | Prefer incremental improvements, justify why refactoring won't work | "Refactoring X impossible because [specific limitation]" |
| ❌ **No editing committed migration files** | Treat database migrations as append-only history. Add a new corrective migration instead of rewriting an existing one | "Added a new migration; left historical migrations untouched" |
| ❌ **No generic advice** | Cite `file:line`, show concrete integration points. ✅ `"Extended services/auth.ts:45 following operational-context.md#Active Patterns"` ❌ `"Updated service per the docs"` | Every suggestion includes `file:line` citation |
| ❌ **No ignoring existing architecture** | Load `constitution.md` and `operational-context.md` before changes; extend existing patterns; consolidate duplicates | "Extends existing pattern at `file:line` per `operational-context.md#Active Patterns`" |
| ❌ **No building without an approved plan** | BUILD cannot run until `activeContext.md#Approval-Record` records a verbatim human approval string. Tool-agnostic: works whether or not the CLI has a native plan mode. | `plan.md` Status=Approved AND `activeContext.md` Approval Record non-empty AND State ∈ {PLAN-CONTEXTUALIZE, BUILD, QA} |

**Reuse Proof** (required before creating any new file):

```markdown
- [ ] Searched: [search terms] → found: [list files]
- [ ] Analyzed extension:
  - [ ] `existing/file1.ext` — Cannot extend: [specific technical reason]
  - [ ] `existing/file2.ext` — Cannot extend: [specific technical reason]
- [ ] Checked patterns: `operational-context.md#[Section]` and `constitution.md#[Section]`
- [ ] Justification: New file needed because [exhaustive reasoning]
```

---

## Additional Memory-Bank Rules

| Rule | Requirement | Consequence |
|------|-------------|------------|
| ❌ **No writing constitution.md from task work** | `constitution.md` is written only by `update-constitution` skill, only after human says `ratified` | Stop, route to `human/decisions/` proposal |
| ❌ **No writing operational-context.md directly** | Only `update-operational-context` skill writes it, called by debrief with propose-diff | Debrief always shows the human a diff before applying |
| ❌ **No loading human-side memory at startup** | Human side (`human/`) is on-demand only | Default load set is machine side: `constitution.md`, `operational-context.md`, `limits.md`, `activeContext.md` |
| ❌ **No task instruction overriding operational-context** | `Do This` / `Do Not Do This` / `Current Known Constraints` directives cannot be overridden by task instructions | Flag conflict, ask human to amend `operational-context.md` first |
| ❌ **No skipping debrief** | Debrief runs after every task, including tasks where nothing was learned (produces at minimum a task history entry) | Debrief is mandatory |

---

## Absolute Prohibitions

| Prohibition | Consequence |
|-------------|-------------|
| ❌ No fake/simulated/mock data in production code | Rollback + restart |
| ❌ No stubbed functions marked complete | Rollback + restart |
| ❌ No ignoring test failures | Rollback + restart |
| ❌ No "defensive programming" (fix root cause) | Rollback + restart |
| ❌ No applying changes without approval | Rollback + restart |

Test fixtures and test mocks are acceptable. Production fake data is never acceptable.

---

## Documentation Standards

**Files requiring approval before creation or modification**:
- `.memory-bank-v2/machine/constitution.md` entries (require `ratified` keyword)
- `.memory-bank-v2/human/tasks/*/` files (task histories)
- `.memory-bank-v2/human/decisions/*/` files (ADRs)
- Any commits to version control

**Files NOT requiring approval**: App code, tests, config updates

**When to update memory** (always use the corresponding skill):
- ✅ Task complete → `debrief` skill (handles all memory updates)
- ✅ Compaction recovery → `update-active-context`
- ✅ Human explicitly requests memory update → relevant skill
- ❌ During task execution — memory updates happen in DEBRIEF, not during BUILD LOOP

---

## Versioning & Rollback

**Rollback triggers**: APPLY fails | User requests revert | Critical error | Security vulnerability

**Rollback protocol**:
1. Identify last known good state
2. Restore all files to that state
3. Verify rollback successful
4. Update `activeContext.md` Current State via `update-active-context`
5. Report to user: reason, reverted changes, current state, recommendation
