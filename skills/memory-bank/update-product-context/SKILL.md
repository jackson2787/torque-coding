---
name: update-product-context
description: Use when updating .memory-bank/productContext.md. Rarely triggered — only when human-confirmed user or product context changes. Unconfirmed claims must stay in a pending section. Do not invent user segments or product value from code alone.
metadata:
  author: uber-ai-workflow
  version: "1.0"
---

# Update Product Context

## Overview

This skill owns all writes to `.memory-bank/productContext.md`. This file
captures user and product context — who uses the product, what jobs they are
trying to do, and what the product priorities are. This is the least
code-provable file in the memory bank. Most content requires human confirmation.

## What This Skill Owns

- All writes to `.memory-bank/productContext.md`
- Enforcing the human-confirmation requirement
- Keeping unconfirmed claims in the pending section
- Preventing agent-invented user or market claims

## What This Skill Does Not Own

- Creating `productContext.md` from scratch (that is bootstrap)
- Project identity or mission (use `update-project-brief`)
- Technical or architectural context (use `update-architecture`)
- Implementation details (use other skills)

## When To Use

Use this skill only when:

- The human provides new information about users, audiences, or product context
- The human confirms a previously pending claim
- Product priorities or trade-offs have shifted (human-confirmed)
- User research or feedback has been shared by the human

## Do Not Use When

- You inferred user context from code (do not write inferences as facts)
- A feature was added (that does not change product context)
- Technology changed (use `update-architecture`)
- You think the file "could be more detailed" (resist this urge)

## Canonical Template

```markdown
# Product Context

<!-- RULE: This file captures USER and PRODUCT context — who uses it, what they need, what matters. -->
<!-- RULE: Most content requires human confirmation. Do not invent user segments from code. -->
<!-- RULE: Unconfirmed claims MUST stay in "Pending Human Confirmation" until confirmed. -->

## Primary Users
[Who uses this product. Confirmed user segments or roles.]

## Jobs To Be Done
[What users are trying to accomplish. Confirmed user goals.]

## Critical Flows
[The most important user-facing flows. May be inferred from code but should be confirmed.]

## Product Priorities
[What the product optimizes for. Trade-offs the product accepts.]

## Pending Human Confirmation
[Claims that are inferred but not confirmed. Each item should state the inference and what evidence supports it.]
- [Inferred claim] — Evidence: [what suggests this] — Status: Unconfirmed
```

## Confirmation Rules

| Content Type | Can Write Without Human Confirmation? |
|---|---|
| User segments / personas | No — always requires confirmation |
| Jobs to be done | No — always requires confirmation |
| Product priorities | No — always requires confirmation |
| Critical flows visible in code | Yes, but label as "Inferred from code" and add to Pending |
| Market positioning | No — always requires confirmation |
| Pain points or value claims | No — always requires confirmation |

## Write Procedure

### Step 1: Determine Confirmation Status

For each piece of content:

- If the human directly stated it → Write to the main section
- If you inferred it from code → Write to "Pending Human Confirmation"
- If you are guessing → Do not write it at all

### Step 2: Read Current File

Read `.memory-bank/productContext.md` in full.

### Step 3: Make Changes

- Confirmed content goes in the appropriate main section
- Move items from Pending to main sections when the human confirms them
- New inferences go in Pending with evidence and "Unconfirmed" status
- Do not remove Pending items unless the human explicitly rejects them

### Step 4: Validate

Before saving, confirm:

- [ ] No unconfirmed claims are in the main sections
- [ ] All inferences are in "Pending Human Confirmation" with evidence
- [ ] No user segments were invented from code alone
- [ ] No market or value claims were invented
- [ ] The template structure is intact
- [ ] Header comments are preserved
- [ ] No technical/architectural content was added (belongs in `architecture.md`)

## Red Flags — Stop And Do Not Write

- Writing user segments you inferred from code as confirmed facts
- Inventing market positioning or competitive context
- Adding product value claims without human confirmation
- Moving items from Pending to confirmed without human approval
- Adding implementation details (belongs elsewhere)
- Removing the "Pending Human Confirmation" section

## Exit Condition

This skill is complete when the change has been made and validated. Return
control to the calling state.
