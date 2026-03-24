# State Machine

## Overview

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

## EXPLORE (Default Entry State)

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

## PLAN

**In**: Task contract + MB context | **Out**: Implementation plan | **Exit**: User approves

**Core Skill Nudge**:
- Load `.claude/skills/state-machine/writing-plans/SKILL.md` while operating in PLAN.

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

## BUILD

**In**: Approved plan | **Out**: Proposed diff (NOT APPLIED) | **Exit**: All changes complete, diff generated

**Substate**: Set to `CODING`

**Core Skill Nudge**:
- Load `.claude/skills/state-machine/build-execution/SKILL.md` when entering BUILD.

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

## DIFF

**In**: BUILD complete | **Out**: Rationale + diff | **Exit**: Ready for QA

Present the diff with:
- **Rationale**: Why each file was modified or created, citing `architecture.md` patterns
- **MB References**: Which memory bank entries informed the changes
- **New file justification**: If any new files were created, the reuse proof from the sacred rules

**Exit**: Changes presented with rationale, MB references, new file justification (if any)
**Failures**: Cannot justify new file → return to BUILD, refactor | Missing MB refs → add explicit refs

---

## QA

**In**: DIFF complete | **Out**: Structured test results | **Exit**: Tests pass OR user waiver

**Substate**: Set to `RUNNING`

**Core Skill Nudges**:
- Load `.claude/skills/state-machine/verification-before-completion/SKILL.md` before making any pass, fixed, or complete claims.
- If checks fail, the root cause is unclear, or repeated fixes start thrashing, load `.claude/skills/state-machine/systematic-debugging/SKILL.md` and return to BUILD with a grounded fix.

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

## APPROVAL (HUMAN GATE)

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

## APPLY

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

## DOCS

**In**: APPLY succeeded + user approved code | **Out**: Task docs, MB updates | **Exit**: All docs complete

**CRITICAL**: Only enter after user approved code changes (from APPROVAL state)

**Per-Document Skills**: Each memory-bank file has a dedicated update skill.
Load the relevant skill for each file you need to update. Skills enforce
document structure, validation, and write rules.

**DOCS Execution Order**:
1. Load `.claude/skills/memory-bank/update-task-docs/SKILL.md` → Create task doc + update monthly README
2. Load `.claude/skills/memory-bank/update-architecture/SKILL.md` → If new patterns, rules, or tech stack changes
3. Load `.claude/skills/memory-bank/update-decisions/SKILL.md` → If architectural decisions were made
4. Load `.claude/skills/memory-bank/update-active-context/SKILL.md` → Update Progress section (milestone completion)
5. Load `.claude/skills/memory-bank/update-toc/SKILL.md` → If any new MB files were created
6. Open documentation PR (or commit if user prefers)

**Rule**: Do not write to any memory-bank file without loading its skill first.

**Exit**: Task doc created, monthly README updated, relevant MB files updated via their skills, docs PR opened → return to EXPLORE
**Failures**: Template violations → skill validation catches them | Missing references → skill requires them | Wrong section → skill placement test prevents it

---

## Task Contract & Stall Detection

### Task Contract

A task contract must include:

- **Task name**: clear, specific objective
- **Context**: what exists, what's affected, related prior work
- **Acceptance criteria**: numbered, testable conditions
- **Constraints**: must-follow patterns, must-extend files, must-not anti-patterns
- **Instructions**: "Create a plan for approval. Do not code until approved."

For the full template format, use the `idea-to-task` optional skill or see
`.claude/skills/memory-bank/update-task-docs/SKILL.md`.

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

## Troubleshooting

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
| **Context Exceeded** | Token limit approaching, slow/truncated responses, forgetting earlier info | State already persisted via **Compaction Protocol** → Break into subtasks → Agent swap |
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
