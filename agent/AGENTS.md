# AGENTS.md

**Version**: 2.4 (2026-03-19) | **Compatibility**: Claude, Cursor, Copilot, Cline, Aider, all AGENTS.md-compatible tools

---

## Table of Contents

1. [Core Rules](#1-core-rules)
2. [Session Startup](#2-session-startup)
3. [Memory Bank](#3-memory-bank)
4. [State Machine](#4-state-machine)
5. [Task Contract & Stall Detection](#5-task-contract--stall-detection)
6. [Quality & Documentation](#6-quality--documentation)
7. [Example Workflow](#7-example-workflow)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Core Rules

### Startup Compliance (Output Every Session)

```
COMPLIANCE CONFIRMED: Reuse over creation
[Continue with Memory Bank loading...]
```

### The Four Sacred Rules

| Rule | Requirement | Validation |
|------|-------------|------------|
| ❌ **No new files without reuse analysis** | Search codebase, reference files that cannot be extended, provide exhaustive justification | Before creating: "Analyzed X, Y, Z. Cannot extend because [technical reason]" |
| ❌ **No rewrites when refactoring possible** | Prefer incremental improvements, justify why refactoring won't work | "Refactoring X impossible because [specific limitation]" |
| ❌ **No generic advice** | Cite `file:line`, show concrete integration points. ✅ `"Extended services/auth.ext:45 following architecture.md#Service Extension Pattern"` ❌ `"Updated service per architecture.md"` | Every suggestion includes `file:line` citation |
| ❌ **No ignoring existing architecture** | Load patterns before changes, extend existing services/components, consolidate duplicates | "Extends existing pattern at `file:line`" |

**Reuse Proof** (required before creating any new file):

```markdown
- [ ] Searched: [search terms] → found: [list files]
- [ ] Analyzed extension:
  - [ ] `existing/file1.ext` - Cannot extend: [specific technical reason]
  - [ ] `existing/file2.ext` - Cannot extend: [specific technical reason]
- [ ] Checked patterns: `architecture.md#[section]`
- [ ] Justification: New file needed because [exhaustive reasoning]
```

---

## 2. Session Startup

### Every Session

1. Output compliance statement (Section 1)
2. Attach MCP servers: Read `.brain/mcp.config.json` or `.mcp.json` if present
3. Load Memory Bank:
   ```
   - [ ] activeContext.md (current state, progress, session data)
   - [ ] architecture.md (patterns, rules, tech stack)
   - [ ] projectBrief.md (project identity)
   - [ ] toc.md (file index)
   - [ ] tasks/YYYY-MM/README.md (current month)
   ```
4. Enter EXPLORE state
5. Output state: `[STATE: EXPLORE/IDLE] Task: none`

**Canonical path**: The Memory Bank lives in the hidden `.memory-bank/`
directory.

Load `decisions.md`, `productContext.md`, or specific task docs on demand when
needed during the session. Do not pre-load everything.

### Compaction Protocol (Mid-Session Context Preservation)

Compaction (context compression) can happen at any time — triggered by the system automatically, by the user via `/compact`, or by platform-level context management. **The agent does not control compaction timing and may not get advance notice.** Therefore, state persistence must be continuous, not deferred to a pre-compaction moment.

#### Continuous State Persistence (At Every State Transition)

At each state transition (`EXPLORE → PLAN → BUILD → DIFF → QA → APPROVAL → APPLY → DOCS`), persist the following to the Memory Bank:

1. **State machine position**: Load `.agent/skills/memory-bank/update-active-context/SKILL.md` → update Current State section with current state, substate, cycle count, and loose context
2. **Task progress**: Append current status to `tasks/YYYY-MM/README.md` with `[IN-PROGRESS]` tag
3. **Decisions**: If new architectural decisions, load `.agent/skills/memory-bank/update-decisions/SKILL.md` → append entry

This ensures that when compaction occurs — without warning — the Memory Bank already reflects the latest state.

#### After Compaction (Recovery)

When context has been compressed (detected by loss of earlier conversation detail, or after `/compact`):

1. Re-read `activeContext.md` — it was updated at the last transition
2. Confirm state machine position and cycle count from Current State section
3. Resume from saved state — do not restart the current task from scratch
4. Output recovery confirmation:
   ```
   COMPACTION RECOVERY: Resumed [STATE] for [task name]
   Cycle: [n]/[max] | Context restored from: activeContext.md
   ```

#### Rules

- State persistence happens at every transition, not "before compaction" — you cannot rely on advance notice
- After detecting compaction, always re-read Memory Bank before taking any action
- If the current state is `APPROVAL` or `DIFF`, the diff summary should already be in `activeContext.md` from the transition save
- Compaction does not reset budgets — cycle count is persisted in `activeContext.md` Current State section

---

## 3. Memory Bank

### Structure

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

### Document Skills

Each memory-bank document has a dedicated update skill that enforces its internal
structure and write rules. See `skills/memory-bank/` for the full set:

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

---

## 4. State Machine

### Overview

**States**: `EXPLORE → PLAN → BUILD → DIFF → QA → APPROVAL → APPLY → DOCS`
**Substates**: `CODING` (building), `WAITING_TOOL` (permissions), `RUNNING` (QA), `IDLE`

```
EXPLORE [task contract] → PLAN [approve] → BUILD → DIFF → QA [pass] → APPROVAL [approve] → APPLY → DOCS
  ↑                         ↑               ↑______↓______↓_____[fail/changes]______________↓       │
  │                         └───────────────────────────────────[major changes needed]─────┘         │
  └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Core Skill Usage Rule**:
- The state machine is the source of truth for transitions and gates.
- Universal skills nudge behavior *inside* a state; they do not redefine the state machine.

**State Announcement Rule**:
At every state transition, output a state line:
```
[STATE: <STATE>/<SUBSTATE>] Task: <task name or "none">
```
This is your breadcrumb. If you lose track, your last state line and `activeContext.md` Current State section are the truth. If the user asks "what state are you in?", read `activeContext.md` and announce.

---

### EXPLORE (Default Entry State)

**In**: Session startup complete | **Out**: Understanding, discussion, research | **Exit**: User provides task contract

Every session begins in EXPLORE. This is the read-only state for investigation,
discussion, and pre-planning. The agent can look at anything, discuss anything,
and research anything — but it cannot change anything.

**Allowed**:
- Read any file in the codebase
- Read any memory bank document
- Query Context7 MCP for framework/library documentation
- Discuss approaches, trade-offs, and options with the user
- Answer questions about existing code, architecture, or patterns
- Research dependencies, flows, and integration points
- Help the user shape a vague idea (the user may choose to use the `idea-to-task` optional skill)

**Forbidden**:
- Writing or modifying any file
- Creating any file
- Making architectural decisions (that requires PLAN → decisions.md)
- Updating the memory bank (that requires DOCS or explicit `mb-rebase`)
- Generating diffs or applying changes

**Exit**: User provides a task contract → transition to PLAN
**No task**: User ends the session → END. Not every session needs to produce work.

---

### PLAN

**In**: Task contract + MB context | **Out**: Implementation plan | **Exit**: User approves

**Core Skill Nudge**:
- Load `.agent/skills/state-machine/writing-plans/SKILL.md` while operating in PLAN.

**Required Content**:
```markdown
## Plan: [Task Name]

**Analyzed**:
- `path/file.ext:50-100` - Current implementation of X
- `.memory-bank/architecture.md#Pattern` - Established pattern for Y
- `path/service.ext` - Service handling Z

**Reuse Strategy**:
- Extend `file.ext` - Add method for [functionality]
- Integrate `service.ext:line` - New behavior at [point]
- Cannot reuse [component] because: [specific technical reason]

**Steps**:
1. [Action] - extends pattern at `file:line`
2. [Action] - integrates with [component]
3. [Action] - adds tests mirroring `test.ext`

**Integration**: [Component A] calls via [method] | [Service B] update at `file:line`
**Risks**: [Risk] → mitigation: [approach]
**Tests**: Unit: [scenarios] | Integration: [flows] | Manual: [paths]
```

**Exit**: User responds "approved", "proceed", "looks good"
**Failures**: Insufficient reuse → load more MB | Ambiguous → ask user | Rejected → iterate

---

### BUILD

**In**: Approved plan | **Out**: Proposed diff (NOT APPLIED) | **Exit**: All changes complete, diff generated

**Substate**: Set to `CODING`

**Core Skill Nudge**:
- Load `.agent/skills/state-machine/build-execution/SKILL.md` when entering BUILD.

**Actions**:
1. Work in branch/temp clone (never main)
2. Create/modify files per approved plan
3. Implement minimal changes achieving objective
4. Follow patterns from `architecture.md`
5. Add tests alongside implementation
6. Generate unified diff
7. **DO NOT APPLY**

**Exit**: All planned changes done, tests written, no syntax errors, diff generated, **NOT APPLIED**
**Failures**: Compilation errors → fix, stay in BUILD | Pattern violations or integration conflicts → review `architecture.md` | Two identical diffs → STALL DETECTED

---

### DIFF

**In**: BUILD complete | **Out**: Rationale + diff | **Exit**: Ready for QA

Present the diff with:
- **Rationale**: Why each file was modified or created, citing `architecture.md` patterns
- **MB References**: Which memory bank entries informed the changes
- **New file justification**: If any new files were created, the reuse proof from Section 1

**Exit**: Changes presented with rationale, MB references, new file justification (if any)
**Failures**: Cannot justify new file → return to BUILD, refactor | Missing MB refs → add explicit refs

---

### QA

**In**: DIFF complete | **Out**: Structured test results | **Exit**: Tests pass OR user waiver

**Substate**: Set to `RUNNING`

**Core Skill Nudges**:
- Load `.agent/skills/state-machine/verification-before-completion/SKILL.md` before making any pass, fixed, or complete claims.
- If checks fail, the root cause is unclear, or repeated fixes start thrashing, load `.agent/skills/state-machine/systematic-debugging/SKILL.md` and return to BUILD with a grounded fix.

**Execute**:
1. Test suite (via MCP or project command)
2. Linters and code quality checks
3. Coverage checks
4. Build verification
5. Report structured results

**Report Format**:
```markdown
## QA Results

**Tests**: ✅ PASS | ❌ FAIL | Total: 145 | Passed: 145 | Failed: 0 | Duration: 23.5s
**Linter**: ✅ PASS | ⚠️  WARNINGS | ❌ FAIL | Errors: 0 | Warnings: 2 (non-blocking)
**Coverage**: Overall: 87.3% (+2.1%) | New code: 95.2% | Below threshold: None
**Build**: ✅ SUCCESS | ❌ FAILURE | Duration: 12.3s

**Verdict**: ✅ Ready for APPROVAL | ❌ Return to BUILD
```

**Exit (PASS)**: All tests passing, no lint errors (warnings OK with justification), coverage meets threshold, build succeeds
**Exit (CONDITIONAL)**: Tests fail with documented waiver OR user grants waiver

**Failures**: Tests fail → synthesize minimal patch, return to BUILD | Lint errors → fix, retry | Build fails → diagnose, return to BUILD

**Retry Protocol**:
- 1st fail: Analyze output, minimal fix, re-test
- 2nd fail: Re-analyze approach, check environment, fix, re-test
- 3rd fail: **STALL DETECTED** → request user input or agent swap

---

### APPROVAL (HUMAN GATE)

**In**: QA passed | **Out**: User decision | **Exit**: User approves explicitly

**Security Checklist** (verify before presenting for approval):
- [ ] **Auth/Authz**: No hardcoded creds | Auth checked before sensitive ops | Authz at boundaries
- [ ] **Data Handling**: Input validation on external data | Output encoding prevents injection
- [ ] **Error Handling**: No sensitive data in errors | Errors logged appropriately
- [ ] **Dependencies**: No known vulnerabilities | Versions pinned

**Present**: Files modified, test results, review gates (tests, security, linter), approval keywords.

**Approval keywords**: "approved" | "looks good" | "document it" | "apply it" | "ship it" → APPLY
**Change keywords**: "change X" | "fix Y" → BUILD
**Reject keywords**: "revert" → discard all, return to EXPLORE

**Failures**: Ambiguous response → ask for explicit approval | Approval without gates passing → warn, request waiver

---

### APPLY

**In**: User approved | **Out**: Changes applied or rollback | **Exit**: Applied successfully OR rolled back

**Actions**:
1. Apply all proposed changes to sandbox branch
2. Verify application successful
3. Optional: Quick smoke test
4. Report success or initiate rollback

**Exit (Success)**: All changes applied, sandbox updated, optional smoke test passed
**Exit (Failure)**: Rollback complete, sandbox restored, error diagnosed
**Failures**: File conflicts → resolve, retry | Permission errors → check perms, retry | Verification fail → rollback, return to BUILD | Rollback fails → **CRITICAL** → user intervention

---

### DOCS

**In**: APPLY succeeded + user approved code | **Out**: Task docs, MB updates | **Exit**: All docs complete

**CRITICAL**: Only enter after user approved code changes (from APPROVAL state)

**Per-Document Skills**: Each memory-bank file has a dedicated update skill.
Load the relevant skill for each file you need to update. Skills enforce
document structure, validation, and write rules.

**DOCS Execution Order**:
1. Load `.agent/skills/memory-bank/update-task-docs/SKILL.md` → Create task doc + update monthly README
2. Load `.agent/skills/memory-bank/update-architecture/SKILL.md` → If new patterns, rules, or tech stack changes
3. Load `.agent/skills/memory-bank/update-decisions/SKILL.md` → If architectural decisions were made
4. Load `.agent/skills/memory-bank/update-active-context/SKILL.md` → Update Progress section (milestone completion)
5. Load `.agent/skills/memory-bank/update-toc/SKILL.md` → If any new MB files were created
6. Open documentation PR (or commit if user prefers)

**Rule**: Do not write to any memory-bank file without loading its skill first.

**Exit**: Task doc created, monthly README updated, relevant MB files updated via their skills, docs PR opened → return to EXPLORE
**Failures**: Template violations → skill validation catches them | Missing references → skill requires them | Wrong section → skill placement test prevents it

---

## 5. Task Contract & Stall Detection

### Task Contract

A task contract must include:

- **Task name**: clear, specific objective
- **Context**: what exists, what's affected, related prior work
- **Acceptance criteria**: numbered, testable conditions
- **Constraints**: must-follow patterns, must-extend files, must-not anti-patterns
- **Instructions**: "Create a plan for approval. Do not code until approved."

For the full template format, use the `idea-to-task` optional skill or see
`.agent/skills/memory-bank/update-task-docs/SKILL.md`.

### Stall Detection

**Cycle Budget**: Max 3 BUILD → QA iterations per task. Tracked in `activeContext.md` Current State section.

**Condition**: Two consecutive identical diffs (same files, same changes) OR cycle count reaches 3.

**Response**:
```markdown
## STALL DETECTED

⚠️  Unable to progress

**Diagnosis**:
- Cause: [specific technical reason]
- Attempted: [what was tried]
- Blocker: [what prevents progress]

**Recommendations**:
1. More Context: Load [specific MB files/codebase areas]
2. Alternative: [different technical strategy]
3. Agent Swap: Switch to [specialized agent] for subtask

**Cycle**: [n]/3
```

---

## 6. Quality & Documentation

### Absolute Prohibitions

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

---

## 7. Example Workflow

### Task: Add Email Notification on Onboarding Complete

#### EXPLORE → PLAN

```
[STATE: EXPLORE/IDLE] Task: none

Session started. Memory Bank loaded. Ready for a task contract.
```

**User**: Provides task contract for onboarding email notification.

```
[STATE: PLAN/IDLE] Task: onboarding-email
```

```markdown
## Plan: Onboarding Email

**Analyzed**:
- `services/onboarding.ext:120-150` - Current completion logic
- `services/notification.ext` - Existing notification service
- `architecture.md#Patterns/Event-Driven` - Event pattern

**Reuse**:
- Extend `onboarding.ext:145` - emit "onboarding_completed" event
- Extend `notification.ext:67` - add event listener
- Add `templates/emails/onboarding_complete.template` - follow `welcome.template` pattern

**Steps**:
1. `onboarding.ext:145` - emit event on completion
2. `notification.ext:67` - add listener for event
3. Create template following `welcome.template`
4. Add tests mirroring `tests/notification_test.ext`

**Tests**: Unit (event emission, listener) | Integration (e2e onboarding → email)

Ready for approval.
```

**User**: "approved"

#### BUILD → QA → APPROVAL

```
[STATE: BUILD/CODING] Task: onboarding-email
```

Agent implements plan, generates diff, runs QA (all tests pass), presents for approval with security checklist verified.

**User**: "looks good"

#### APPLY → DOCS → EXPLORE

```
[STATE: APPLY/IDLE] Task: onboarding-email
```

Changes applied. Per-document skills update task docs and activeContext.md.

```
[STATE: EXPLORE/IDLE] Task: none

Task complete. Returning to EXPLORE.
```

---

## 8. Troubleshooting

### Decision Tree: Agent Stuck

```
Stuck? → Cycles ≥3?
           ↓ YES
         Identical diffs?
           ↓ YES → Load more MB context OR agent swap
           ↓ NO
         Different diffs?
           ↓ YES
         Same QA failure?
           ↓ YES → Environment issue OR requirement ambiguity
           ↓ NO
         Analyze failure pattern → Adjust approach
```

### Common Issues

| Issue | Symptoms | Resolution |
|-------|----------|------------|
| **Loop** | Same diff multiple times, QA fails repeatedly, no progress after 3+ cycles | Load more MB → Clarify requirements → Check environment → Agent swap |
| **Context Exceeded** | Token limit approaching, slow/truncated responses, forgetting earlier info | State already persisted via **Compaction Protocol** (Section 2) → Break into subtasks → Agent swap |
| **CI ≠ Local** | QA passes, CI fails | Compare environments → Verify dependency versions → Check timing/concurrency → Document waiver if CI issue |
| **Security Fail** | Security checklist incomplete, sensitive data exposed | Never bypass → Return to BUILD → Fix all issues → Re-test |

### Recovery Procedures

**Full Reset** (complete breakdown):
1. Update `activeContext.md` with current state
2. Discard uncommitted changes
3. Reset to last known good state
4. Start new session with fresh agent
5. Agent loads MB at startup and resumes from `activeContext.md`

**Partial Rollback** (recent regression):
1. Identify last working state
2. Rollback only problematic changes
3. Keep working changes
4. Re-test to verify stability
5. Continue from DIFF or BUILD

**Agent Swap** (capability mismatch):
1. Complete current state (clean boundary)
2. Update `activeContext.md` with current progress and handoff context
3. Prepare focused context: task contract, relevant MB files, current work state
4. Spawn specialized agent with focused context
5. Let specialized agent complete subtask
6. Integrate results back into main workflow

---

## Quick Reference

### State Transitions

`EXPLORE [task contract] → PLAN [user approves] → BUILD → DIFF → QA [pass] → APPROVAL [user approves] → APPLY → DOCS → EXPLORE`

Iterations on failure: `BUILD ← DIFF ← QA ← APPROVAL`
Major changes: Return to `PLAN`
Task complete: Return to `EXPLORE`

### Critical Rules

1. 🚫 No new files without exhaustive reuse analysis
2. 🚫 No applying changes without user approval
3. 🚫 No documentation until code approved
4. 🚫 No fake/mock data in production
5. ✅ Always cite `file:line` for code, `file.md#Section` for MB
6. ✅ Always work in sandbox (never main)
7. ✅ Always validate reuse opportunities first

### When Stuck

1. Check cycle count (>3 = stall)
2. Check for identical diffs (stall indicator)
3. Load more MB context
4. Break into smaller subtasks
5. Request user intervention
6. Consider agent swap

### Files Never Created Without Approval

- `.memory-bank/tasks/*/` (task docs)
- `.memory-bank/tasks/*/README.md` (monthly summaries)
- Any commits to version control

---

**Each session starts in EXPLORE. Memory Bank is your only persistent memory. Maintain it with precision.**

**Mission**: Build software respecting existing architecture, following established patterns, improving incrementally. Reuse over creation. Quality over speed. Approval over assumption.
