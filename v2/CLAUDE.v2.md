# CLAUDE.v2.md

**Version**: 2.0-dev | **Compatibility**: Claude Code
**Parallel to**: `agent/CLAUDE.md` (v1 — untouched)

---

## Session Startup

1. Output v2 compliance statement:
   ```
   COMPLIANCE CONFIRMED [v2]: Reuse over creation | Constitution over convenience
   ```
2. Attach MCP servers: read `.brain/mcp.config.json` or `.mcp.json` if present
3. Load Machine Memory (default set — machine side only):
   ```
   - [ ] .memory-bank-v2/machine/constitution.md
   - [ ] .memory-bank-v2/machine/operational-context.md
   - [ ] .memory-bank-v2/machine/activeContext.md
   - [ ] .memory-bank-v2/machine/toc.md
   ```
4. Do NOT load human-side memory at startup
5. Resume from `activeContext.md` if a task is in progress; otherwise enter PLAN state
6. Output state: `[v2 STATE: PLAN/IDLE] Task: none`

**Canonical paths**:
- Machine memory: `.memory-bank-v2/machine/`
- Human memory: `.memory-bank-v2/human/` (on-demand only)

---

## Table of Contents

1. [Core Rules & Prohibitions](@v2/claude-rules-v2/sacred-rules.v2.md)
2. [Memory Bank v2](@v2/claude-rules-v2/memory-bank.v2.md)
3. [Authority Order](@v2/claude-rules-v2/authority-order.v2.md)
4. [State Machine v2](@v2/claude-rules-v2/state-machine.v2.md)

---

@v2/claude-rules-v2/sacred-rules.v2.md
@v2/claude-rules-v2/memory-bank.v2.md
@v2/claude-rules-v2/authority-order.v2.md
@v2/claude-rules-v2/state-machine.v2.md

---

## Quick Reference

### Authority order

`constitution.md > operational-context.md > task instructions > reasoning`

### State flow

`PLAN → BUILD LOOP → DEBRIEF → PLAN`
*(BUILD LOOP currently uses v1 BUILD/DIFF/QA/APPROVAL/APPLY; DEBRIEF replaces v1 DOCS)*

### Critical rules

1. Never write `constitution.md` from task work
2. Never write `operational-context.md` directly — debrief proposes a diff first
3. Never load human-side memory at startup
4. Never let task instructions override operational-context `Do This` / `Do Not Do This` entries
5. Always cite `file:line` for code; `constitution.md#Section` or `operational-context.md#Section` for doctrine
6. Debrief is mandatory — every task runs it

### Files never created without approval

- `.memory-bank-v2/machine/constitution.md` entries (require `ratified` keyword)
- `.memory-bank-v2/human/tasks/` entries
- `.memory-bank-v2/human/decisions/` entries
- Any commits to version control

---

**Constitution is the highest authority. Operational-context is the current truth. Debrief is how you learn.**
