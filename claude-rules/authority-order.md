# Authority Order v2

**New in v2** — no v1 equivalent.

---

## The Stack

```
Level 1 — constitution.md          (highest authority)
Level 2 — operational-context.md
Level 3 — task instructions
Level 4 — temporary reasoning      (lowest authority)
```

When two levels conflict, the higher level wins. Always.

---

## Level 1: constitution.md

The highest authority in the system. Overrides everything below it.

**Characteristics**:
- Stable. Does not change for weeks or months.
- Boring by design. Every line should feel obvious in retrospect.
- Difficult to change. Requires explicit human `ratified` keyword.
- Short. If it is growing, something is wrong — operational facts are leaking in.

**What conflicts look like**:
- A task says "store user PII in the application cache." Constitution says "No PII in application cache." → Task is invalid. Stop.
- `operational-context.md` tries to introduce a rule contradicting a domain definition in constitution. → Operational-context entry is invalid. Route to `human/decisions/` for a proper constitutional amendment.

**Response to a constitution conflict**:
```
This [task instruction / proposed change] conflicts with constitution.md#[Section]:
"[quoted line]"

I cannot proceed. To change this rule, we need a ratification:
1. I can write a proposal to human/decisions/YYYY/YYYY-MM-DD-<slug>.md.
2. You review and ratify with the keyword "ratified".
3. update-constitution applies the change to constitution.md.

Would you like me to write the proposal?
```

---

## Level 2: operational-context.md

The current working truth. Overrides task instructions and reasoning.

**Characteristics**:
- Present-tense directives. "Do this." "Do not do this."
- Changes when the repo evolves or debrief identifies a learning.
- Updated by `update-operational-context` via debrief (propose-diff flow).
- Does not require ratification — but debrief always proposes a diff first.

### Directive strength — two tiers

| Section | Strength | Can task instructions override? |
|---|---|---|
| `Active Patterns — Do This` | Hard | No |
| `Active Anti-Patterns — Do Not Do This` | Hard | No |
| `Current Known Constraints` | Hard | No |
| `Currently Accepted Workflows` | Hard | No |
| `Preferred Patterns — Prefer This When Choosing` | Soft | Yes — with explicit scoped justification |
| `Patterns To Avoid — Avoid Unless Justified` | Soft | Yes — with explicit justification in the task |

**Hard directives are non-negotiable**. A task instruction that says "do not follow [hard directive]" is invalid.

**Soft directives** yield to explicit, scoped, justified overrides in task instructions.

**Response to a hard operational-context conflict**:
```
This task instructs [X], but operational-context.md#[Section] has a hard directive:
"[quoted directive]"

Task instructions cannot override hard directives. To proceed, one of these must happen:
1. Amend operational-context.md (via debrief after this task, or directly now).
2. Confirm this task is explicitly scoped as an exception — which would itself be a
   meaningful debrief learning and should be captured.

Which would you prefer?
```

---

## Level 3: task instructions

Task instructions govern what happens in the current task only. They define:
- What to build
- What acceptance criteria to meet
- Constraints specific to this task
- Any scoped exceptions to soft directives

**Task instructions cannot**:
- Override hard operational-context directives
- Override anything in constitution.md
- Silently contradict v2 rules (must be explicit)

**Task instructions can**:
- Override soft operational-context directives (Preferred / Avoid) with justification
- Specify a tighter constraint than operational-context for this task
- Expand scope beyond the default load set (e.g., "also read `human/decisions/YYYY/`")

---

## Level 4: Temporary reasoning

Agent inference, chain-of-thought, ad hoc analysis generated during a session.

This is the lowest authority. It must not be used to justify overriding levels 1–3.

"I think it would be better to do X" is temporary reasoning. If "X" contradicts an operational-context directive, the directive wins — unless the human agrees and instructs an amendment.

---

## Worked Examples

### Example 1: Task contradicts a hard directive

**Situation**: `operational-context.md#Active Anti-Patterns` says:
> Do not import from `src/legacy/**`. It is quarantined pending removal.

**Task instruction says**: "Extend the `LegacyReportBuilder` in `src/legacy/reports.ts`."

**Resolution**:
```
This task asks me to import from src/legacy/reports.ts, but operational-context.md
has a hard anti-pattern:
"Do not import from src/legacy/**. It is quarantined pending removal."

I cannot follow the task instruction as written. Options:
1. Amend operational-context.md to remove or narrow this restriction (requires a debrief learning).
2. Refactor the needed logic out of src/legacy/ first, then extend it.
3. If this is a deliberate one-off exception, confirm it — and I will capture it in
   debrief as a potential "Pending Deprecations" entry.

Which would you prefer?
```

### Example 2: Task overrides a soft preference — valid

**Situation**: `operational-context.md#Preferred Patterns` says:
> Prefer server components over client components unless interactivity is required.

**Task instruction says**: "This widget must be a client component for animation reasons."

**Resolution**: Valid. "Prefer" is a soft directive. Task justifies the override. No conflict flag needed. Agent notes the override in the debrief, but it does not become a new directive (one-off, not generalisable).

### Example 3: Proposed operational-context change contradicts constitution

**Situation**: Debrief proposes adding to `operational-context.md#Active Patterns`:
> Cache user profile data client-side for offline access.

**Constitution says**: `constitution.md#Security & Compliance Boundaries`:
> User profile data must not be stored outside the authenticated session. No client-side persistence of user records.

**Resolution**:
```
The proposed operational-context entry contradicts constitution.md#Security:
"User profile data must not be stored outside the authenticated session."

I cannot add this entry. Options:
1. Drop the proposed entry.
2. If the codebase reality has genuinely changed and this constraint is outdated,
   initiate a constitutional amendment: I will write a proposal to human/decisions/
   for human ratification.

Which would you prefer?
```

### Example 4: Task instruction adds a tighter constraint

**Situation**: `operational-context.md` has no directive about test coverage thresholds.

**Task instruction says**: "New code must have 90% coverage or the task is not complete."

**Resolution**: Valid. Task instructions can add tighter constraints than operational-context. Agent applies the 90% threshold for this task. If this becomes standard, debrief may propose it as a new `Current Known Constraints` entry.

### Example 5: Temporary reasoning contradicts a rule

**Situation**: During BUILD LOOP, the agent reasons: "The `http-client` wrapper adds overhead; a direct `fetch` here would be faster."

`operational-context.md#Active Anti-Patterns` says:
> Do not use `fetch` directly. Use the `http-client` wrapper at `src/lib/http-client.ts`.

**Resolution**: Reasoning loses. The directive wins. If the reasoning reveals a genuine performance constraint, surface it in debrief as a candidate learning — but it does not grant permission to deviate mid-task.

---

## Common Mistakes

| Mistake | Correct behaviour |
|---|---|
| Silently following a task instruction that contradicts a hard directive | Flag the conflict before starting |
| Treating a "Prefer" as a hard rule | Soft directives can be overridden with justification |
| Writing to `constitution.md` because it "seems right" | Never. Requires ratification. |
| Adding a constitutional change to `operational-context.md` to avoid ratification | Flag it; route to `human/decisions/` proposal |
| Treating chain-of-thought reasoning as sufficient authority to override a directive | It is not. Directives win over reasoning. |
