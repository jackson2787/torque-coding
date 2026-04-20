# Where Rules Live: Constitution vs Operational-Context

The most common confusion in Torque Coding is deciding whether a new rule belongs in `constitution.md` or `operational-context.md`. The files look similar — both carry rules the agent must follow — but they answer different questions and have very different update ceremonies.

---

## The one-sentence version

**Constitution** is what is permanently true about the project. **Operational-context** is how we work right now.

---

## The decision question

Ask yourself: *"If this rule turned out to be wrong, how would we discover it and how hard would it be to change?"*

| Answer | → Where it goes |
|---|---|
| We'd discover it through a fundamental product or legal event. Changing it requires a serious conversation. | → `constitution.md` |
| We'd discover it through a bad PR or a painful debrief. Changing it is a one-line diff after the next task. | → `operational-context.md` |

---

## The two files compared

| | `constitution.md` | `operational-context.md` |
|---|---|---|
| **Timescale** | Months to years | Days to months |
| **Changes via** | Explicit `ratified` keyword, human in the loop | Debrief propose-diff flow |
| **Written in** | Present-tense facts ("The project is…", "No X may…") | Imperative directives ("Do this", "Do not do this") |
| **Wrong entries look like** | Product scope creep, technology choices that will change | Rules that became outdated after a library upgrade |
| **If uncertain** | Go here only if sure | Default here |

---

## What goes in constitution.md

**Domain definitions** — terms that appear throughout the codebase with a specific, locked meaning.

> "An `Order` is a confirmed purchase. A `Cart` is a pre-purchase collection. These terms must not be used interchangeably in code, comments, or API contracts."

**Scope boundaries** — what is explicitly inside and outside this system.

> "This service handles authentication only. It does not handle authorisation — that is the caller's responsibility."

**Durable architectural laws** — structural rules enforced by the entire codebase shape that would require a major migration to change.

> "All database writes go through the repository layer. Direct SQL from controllers is prohibited."

**Security and compliance constraints** — rules with legal or regulatory backing.

> "User PII must not be stored outside the authenticated session. No client-side persistence of user records."

**What NOT to put here**: technology choices (Next.js today, something else tomorrow), team workflow preferences, patterns that emerged from convenience rather than necessity.

---

## What goes in operational-context.md

**Patterns that have proven themselves** — applied in 2+ places, confirmed correct.

> "Do This: Route all outbound HTTP through `src/lib/http-client.ts`."

**Anti-patterns that burned us** — discovered through a bad experience, now codified.

> "Do Not Do This: Do not import from `src/legacy/**`. Quarantined pending removal."

**Current technology constraints** — what we're on today and what that implies.

> "Currently Known Constraint: Node 20 LTS. No top-level await outside ES module context."

**Workflow rules** — how we do the work, not what the product is.

> "Currently Accepted Workflow: Feature branches off `main`, squash-merged. No long-lived branches."

**What NOT to put here**: product domain definitions (those are constitutional), rules that apply only to one task, past-tense observations ("we did X in that task").

---

## The gray areas

### "This feels important enough for constitution but it might change."

It probably belongs in operational-context. Constitution is not for "important" rules — it's for rules whose discovery cycle is measured in months, not weeks. If you can imagine a debrief conversation eighteen months from now where this rule gets updated, it's operational.

### "This is a technology choice but we're very committed to it."

Still operational. Framework allegiance is not a constitutional fact. If your team has been using Postgres for five years, that belongs in `operational-context.md#Currently Known Constraints`, not in constitution. The day you start the migration, a debrief retires the entry.

### "This emerged from legal / compliance / security."

Constitutional. These are the clearest cases. If an external authority (law, contract, regulation) is the reason for the rule, put it in constitution. External authorities don't get overridden by a debrief.

### "This is a pattern we want future agents to follow but we've only done it once."

Operational-context, but only after it passes the five-gate rubric in debrief. Single-use patterns are churn until they recur. Mark it as a candidate in the next debrief; if it holds after a second task, add it.

### "An operational-context entry seems to be contradicting a constitution entry."

The constitution wins. But before flagging a conflict, check whether they actually conflict or just address adjacent territory. "Route all HTTP through the wrapper" (operational) and "No PII outside authenticated session" (constitutional) can both be true simultaneously. If they genuinely conflict, route to `human/decisions/` — this is a constitutional amendment proposal.

---

## The update ceremony gap

The most important practical difference: **how hard it is to change**.

`operational-context.md` updates through debrief's propose-diff flow. The agent identifies a candidate, runs the five-gate rubric, proposes a visible diff, waits for human "apply". This takes one debrief session.

`constitution.md` updates through ratification. The agent writes a proposal to `human/decisions/`, the human must explicitly use the keyword `ratified`, and only then does `update-constitution` apply the change. This can take days.

The asymmetry is intentional. Constitution drift is silent and dangerous — a `constitution.md` that changes easily stops being authoritative. Operational-context entries should evolve freely; constitution entries should feel slightly painful to change.

---

## Quick test

If you're not sure, answer these three questions:

1. Would a completely different type of project — same domain, different team — have the same rule? → **Yes → likely constitutional. No → likely operational.**
2. Would you expect this rule to still apply after the main framework is upgraded? → **Yes → likely constitutional. No → likely operational.**
3. Does this rule come from something external (law, contract, regulator) or from internal team practice? → **External → constitutional. Internal → operational.**

Two or three "constitutional" answers → put it in constitution.
Two or three "operational" answers → put it in operational-context.
Mixed → default to operational. You can always promote it later.
