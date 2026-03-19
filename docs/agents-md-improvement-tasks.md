# AGENTS.md v2.2 — Improvement Task List

**Based on**: Independent review of `AGENTS.md` v2.2 (2025-03-04)
**Created**: 2026-03-19

---

## Task 1: Add General Duty Mode to the State Machine

**Priority**: High
**Section affected**: §4 State Machine, §2 Session Startup

**What to do**: Add a lightweight execution path that collapses the full state machine for trivially scoped changes. The General Duty path should run `BUILD → QA → APPLY` — skipping the formal PLAN presentation, the separate DIFF state, the full APPROVAL gate, and reducing DOCS to an optional one-liner in the monthly README.

**Qualification criteria** (all must be true for a task to enter General Duty):

- Single file change
- No new files created
- No logic, data flow, or architectural changes
- No security surface affected
- Intent is unambiguous from the user's request

**Escalation rule**: If at any point the change touches more than one file, affects shared patterns, or fails QA, the task automatically promotes to Standard mode and re-enters at PLAN.

**Who decides**: The agent proposes General Duty based on scope analysis; the user confirms with a single acknowledgement. This keeps the human in the loop without adding ceremony.

**Rationale**: The current state machine treats every task identically. A button colour change goes through the same seven-state ceremony as an architectural refactor. This creates approval fatigue on low-risk work and trains the user to rubber-stamp gates — which undermines the gates' purpose on high-risk work. A tiered execution path matches the tiered loading pattern (Fast Track / Standard / Deep Dive) already in §2, making the system internally consistent.

---

## Task 2: Reduce Token Weight of the File Itself

**Priority**: High
**Section affected**: Entire document

**What to do**: Restructure `AGENTS.md` into a slim core (~300 lines) that is always loaded, with on-demand sections the agent pulls when entering a specific state. Options:

1. **Single file with markers**: Keep one file but define "load zones" — the agent only reads the section for its current state (e.g., skip the full DOCS template when in PLAN)
2. **Split into core + modules**: A root `AGENTS.md` with the state machine, rules, and Memory Bank structure. Separate files for each state's detailed templates and checklists (e.g., `.agent/states/PLAN.md`, `.agent/states/QA.md`)
3. **Progressive disclosure within the file**: Move detailed templates and examples into collapsed/fenced blocks that agents are instructed to skip unless operating in that state

**Rationale**: At ~1,039 lines, the full file consumes a significant chunk of the context window before any task-specific work begins. Every session pays this cost regardless of task complexity. The Memory Bank already uses a "Load When" pattern — the process document itself should follow the same principle. The state machine and core rules need to be always-present; the QA report template does not.

---

## Task 3: Merge DIFF into BUILD

**Priority**: Medium
**Section affected**: §4 State Machine (DIFF state)

**What to do**: Collapse the DIFF state into the tail end of BUILD. When BUILD completes, the agent presents the unified diff with rationale, MB references, and new-file justification as the final BUILD output — then transitions directly to QA.

Update the state machine from:
```
PLAN → BUILD → DIFF → QA → APPROVAL → APPLY → DOCS
```
To:
```
PLAN → BUILD → QA → APPROVAL → APPLY → DOCS
```

(General Duty: `BUILD → QA → APPLY`)

The DIFF state's exit criteria ("changes presented with rationale, MB references, new file justification") become BUILD's exit criteria. All current DIFF content requirements move into the BUILD output template.

**Rationale**: BUILD already produces the diff. DIFF then re-presents it with added rationale — but a well-structured BUILD output already includes what DIFF restates. The separate state adds a transition, a persistence write (per the Compaction Protocol), and output tokens without introducing new information or a decision gate. Every other state either does work (BUILD, QA, APPLY, DOCS), requires a decision (PLAN approval, APPROVAL), or both. DIFF does neither — it's a formatting pass. Merging it removes one state transition per task without losing any information.

---

## Task 4: Make the GIGO Compliance Banner Session-Aware

**Priority**: Low
**Section affected**: §1 Compliance & Core Rules

**What to do**: Change the startup compliance block so it outputs the full GIGO prevention banner only on the first session (or when no Memory Bank exists yet). On subsequent sessions, reduce it to a single confirmation line:

```
COMPLIANCE CONFIRMED: Reuse over creation | [Fast Track|Standard|Deep Dive]
```

Detection: If `activeContext.md` exists and has been updated within the last 7 days, the user is an active collaborator — skip the full banner. If the Memory Bank is empty or stale, output the full banner as onboarding.

**Rationale**: The full banner consumes output tokens every session on a message directed at the human, not the agent. After the second or third session, an active user will have internalised the responsibilities or will be ignoring the banner entirely. Reducing it to a one-liner for returning users preserves the compliance signal without the noise. The full banner still serves its purpose for new projects or cold starts.

---

## Task 5: Specify Agent Swap Mechanics

**Priority**: Medium
**Section affected**: §8 Troubleshooting (Agent Swap), §5 Task Contract (Parallel Execution)

**What to do**: Define the concrete protocol for agent swap, covering:

1. **Context handoff format**: What exactly gets passed to the new agent — a minimal package consisting of the task contract, current state machine position, relevant MB file paths, and the specific subtask to complete. Define this as a template.
2. **Boundary rules**: The spawned agent operates only within its subtask scope. It does not modify the Memory Bank. It does not advance the parent state machine. It returns a result artifact (code, analysis, or recommendation) to the parent workflow.
3. **Integration protocol**: How the parent session consumes the result — re-enter at BUILD or QA with the spawned agent's output as input, then proceed through normal gates.
4. **When NOT to swap**: If the stall is caused by ambiguous requirements or environment issues, swapping agents won't help. The troubleshooting decision tree should route these to user intervention instead.

**Rationale**: Agent swap is referenced in three places (stall detection, troubleshooting, context exceeded) but the mechanics are left vague. This is the one area where your single-agent philosophy necessarily involves coordination between agent invocations, and it's arguably the hardest problem in multi-agent workflows. Without a defined protocol, the guidance to "spawn specialized agent with focused context" is exactly the kind of generic advice the Four Sacred Rules prohibit. The protocol should have the same rigour as the state machine — explicit inputs, outputs, and transitions.

---

## Task 6: Add a "Trusted Batch" Variant for Repetitive Low-Risk Work

**Priority**: Low
**Section affected**: §4 State Machine (new mode, adjacent to General Duty)

**What to do**: Define a batch execution mode for when the user has a list of similar, low-risk changes (e.g., "rename these six CSS classes", "update the copyright year in all footers", "fix these lint warnings"). The agent presents a single plan covering all items, executes them as a batch, runs QA once across the full set, and presents a single approval gate.

The flow: `PLAN (batch) → BUILD (all items) → QA (full suite) → APPROVAL (single gate) → APPLY → DOCS (summary only)`

**Constraints**: All items must independently qualify for General Duty. If any single item fails QA or requires a new file, that item is extracted from the batch and promoted to Standard mode. The rest of the batch proceeds.

**Rationale**: A common real-world pattern is a user with ten small fixes that each individually qualify as trivial. Under the current system, that's ten full cycles through the state machine, ten approval gates, and ten documentation entries. Under General Duty alone, it's still ten separate passes. Batch mode reduces this to one pass with one approval, which matches how a human developer would handle the same list — do them all, test once, commit once.

---

## Task 7: Add Explicit Context Budget Guidance to Memory Bank Loading

**Priority**: Medium
**Section affected**: §3 Memory Bank

**What to do**: Add token budget estimates to the File Reference Table. Each MB file should have an approximate size indicator (small/medium/large or a token range) so the agent can make informed loading decisions within its context budget.

Example addition to the table:

| File | Typical Size | Load Priority |
|------|-------------|---------------|
| `activeContext.md` | Small (500-1K tokens) | Always |
| `systemPatterns.md` | Large (3-8K tokens) | Before arch changes |
| `projectbrief.md` | Medium (1-3K tokens) | Complex tasks only |

Also add a "Context Budget Protocol" — when total loaded MB content would exceed a defined threshold (e.g., 40% of available context), the agent should summarise rather than load full files, starting with the lowest-priority files.

**Rationale**: The Memory Bank loading guidance tells the agent *when* to load each file but not *how much context it costs*. Combined with the `AGENTS.md` file itself, task context, and conversation history, the agent can easily overload its context window without realising it. Explicit size guidance lets the agent make trade-offs — loading a summary of `systemPatterns.md` instead of the full file when context is tight. This is the same context engineering principle the document already advocates, applied to its own infrastructure.

---

## Task 8: Consolidate QA Skill Loads in Domain-Tuned Variants

**Priority**: Medium (Low if context window is 400K+)
**Section affected**: §4 State Machine (QA state) in domain-tuned variants (e.g., `AGENTS_web.md`)

**What to do**: In domain-tuned variants like the web version, the QA state currently has six conditional skill nudges, each with its own trigger condition:

- `verification-before-completion/SKILL.md` (always)
- `systematic-debugging/SKILL.md` (on failure)
- `accessible-ui/SKILL.md` (if UI changed)
- `react-best-practices/SKILL.md` (if React rendering touched)
- `next-best-practices/SKILL.md` (if Next.js routing/RSC touched)
- `next-cache-components/SKILL.md` (if caching touched)

In practice, most web tasks trigger three or four of these simultaneously. That's three or four separate skill files loaded into context at QA time, on top of the task context and Memory Bank.

Consolidate domain-specific QA checks into a single skill file per domain variant — e.g., `.agent/skills/web-qa-checklist/SKILL.md` — that covers accessibility, React patterns, Next.js patterns, and cache verification in one document. The consolidated skill should be organised by concern (accessibility, rendering, routing, caching) so the agent can focus on relevant sections, but loaded as a single file to reduce the number of context-loading operations.

Keep `verification-before-completion` and `systematic-debugging` as separate skills since those are universal (used in the base `AGENTS.md` too), and their trigger conditions are different (always vs. on-failure) rather than domain-conditional.

**When NOT to do this**: If your context window is 400K+ and the individual skill files are small (under 1K tokens each), the overhead of loading them separately is negligible. In that case, the current granular approach has the advantage of only loading what's relevant — a pure CSS change loads `accessible-ui` but skips `next-cache-components`. The consolidation becomes worthwhile when either the skill files are large, the context window is tighter (128K-200K), or you find the agent is spending noticeable time on skill-loading steps during QA.

**How to apply across domain variants**: This pattern should be documented as guidance for anyone creating new domain-tuned variants. The rule of thumb: if a single state accumulates more than four conditional domain skill loads, consolidate them into one domain QA skill. The base `AGENTS.md` doesn't need this because it only has two QA skills (both universal).

**Rationale**: The skill-as-nudge pattern works well when each state loads one or two skills. When a state accumulates six conditional loads, the agent spends time evaluating conditions and loading files rather than doing QA. More importantly, the domain skills likely have overlapping concerns — React best practices and Next.js best practices share guidance on component boundaries, hydration, and rendering. A consolidated file can deduplicate that overlap and present a coherent QA checklist rather than forcing the agent to synthesise across multiple documents.

---

## Summary

| # | Task | Priority | Complexity | Key Outcome |
|---|------|----------|------------|-------------|
| 1 | General Duty Mode | High | Medium | Low-risk tasks skip unnecessary ceremony |
| 2 | Reduce token weight | High | Medium | More context available for actual work |
| 3 | Merge DIFF into BUILD | Medium | Low | One fewer state, no information lost |
| 4 | Session-aware GIGO banner | Low | Low | Less noise for returning users |
| 5 | Specify agent swap mechanics | Medium | Medium | Coordination protocol matches state machine rigour |
| 6 | Trusted Batch mode | Low | Medium | Repetitive fixes handled in one pass |
| 7 | Context budget guidance for MB | Medium | Low | Agent makes informed loading trade-offs |
| 8 | Consolidate QA skills in domain variants | Medium | Low | Fewer skill loads, less overlap, cleaner QA |

**Recommended order**: 3 → 1 → 5 → 8 → 7 → 6 → 4 → 2

Start with Task 3 (merging DIFF) because it's the simplest structural change and immediately simplifies the state machine that Tasks 1 and 6 build on. Then Task 1 (General Duty) because it's the highest-impact improvement. Task 5 (agent swap) adds rigour to an under-specified area. Task 8 (QA skill consolidation) is a quick win for domain variants. Tasks 2 and 7 (token weight and context budgets) are deprioritised for large context windows (400K+) — move them up if working with smaller windows. The rest can be tackled in any order.
