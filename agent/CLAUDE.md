# CLAUDE.md

**Version**: 2.4 (2026-03-19) | **Compatibility**: Claude Code

---

## Session Startup

1. Output compliance statement: `COMPLIANCE CONFIRMED: Reuse over creation`
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

**Canonical path**: The Memory Bank lives in the hidden `.memory-bank/` directory.

Load `decisions.md`, `productContext.md`, or specific task docs on demand when
needed during the session. Do not pre-load everything.

---

## Table of Contents

1. [Core Rules & Prohibitions](@.claude/rules/sacred-rules.md)
2. [State Machine](@.claude/rules/state-machine.md)
3. [Memory Bank](@.claude/rules/memory-bank.md)
4. [Compaction Protocol](@.claude/rules/compaction.md)

---

@.claude/rules/sacred-rules.md
@.claude/rules/state-machine.md
@.claude/rules/memory-bank.md
@.claude/rules/compaction.md

---

## Quick Reference

### State Transitions

`EXPLORE [task contract] → PLAN [user approves] → BUILD → DIFF → QA [pass] → APPROVAL [user approves] → APPLY → DOCS → EXPLORE`

Iterations on failure: `BUILD ← DIFF ← QA ← APPROVAL`
Major changes: Return to `PLAN`
Task complete: Return to `EXPLORE`

### Critical Rules

1. No new files without exhaustive reuse analysis
2. No applying changes without user approval
3. No documentation until code approved
4. No fake/mock data in production
5. Always cite `file:line` for code, `file.md#Section` for MB
6. Always work in sandbox (never main)
7. Always validate reuse opportunities first

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
