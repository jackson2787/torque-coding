---
name: idea-to-task
description: >-
  Use when the user has a vague idea, feature request, or loose requirement that
  is not yet a formal task contract. Turns raw human intent into a structured
  task contract ready for the AGENTS.md PLAN state. Outputs a prompt — never
  code, never a plan, never architecture.
metadata:
  author: uber-ai-workflow
  version: "1.0"
---

# Idea To Task Contract

## Purpose

Transform a vague human idea into a precise task contract that the AGENTS.md
state machine can execute. You produce the **input** to PLAN — you do not
produce the plan itself.

## When To Use

- User describes a feature, idea, or change in loose terms
- User says "I want to..." or "we need..." or "what if we..." without a formal
  task contract
- User provides a half-formed requirement and wants help shaping it

## When NOT To Use

- User already has a complete task contract — go straight to PLAN
- User is asking you to execute an approved plan — use BUILD
- User wants to discuss architecture without building anything — just have the
  conversation

## The One Rule

**You produce a task contract. Nothing else.**

You do not write code. You do not write a plan. You do not make architectural
decisions. You do not create files. You ask questions, get clarity, and output a
structured prompt that another agent session can execute.

## Procedure

### Step 1: Evaluate What's Missing

Read the user's input. Check it against the task contract fields below. Identify
which fields are missing or vague.

Required fields:
- **Task name**: clear, specific objective
- **Context**: what exists now, what needs to change, affected systems
- **Desired outcome**: what "done" looks like
- **Acceptance criteria**: numbered, testable conditions
- **Constraints**: architectural rules, do's and don'ts

Optional but valuable:
- **Historical context**: prior tasks, related decisions, memory bank references
- **Affected systems**: components, services, modules involved
- **Success metrics**: how to measure completion beyond pass/fail

### Step 2: Ask Questions (Iteratively)

Ask **1–2 targeted questions** at a time. Wait for answers before asking more.

Good questions:
- "What should happen when [edge case]?"
- "Is this extending [existing component] or replacing it?"
- "Should this work for [user type A] or all users?"
- "What's the priority — speed, correctness, or simplicity?"

Bad questions:
- Dumping 10 questions at once
- Asking about implementation details (that's PLAN's job)
- Asking questions the memory bank already answers

If you need framework or library context to ask better questions, use Context7
MCP. But remember — you are shaping requirements, not designing solutions.

### Step 3: Check The Memory Bank

Before finalising, scan these memory bank files if they exist:

- `architecture.md` — are there patterns or rules that constrain this task?
- `decisions.md` — has a related decision already been made?
- `activeContext.md` — does this relate to current work in progress?

Incorporate relevant constraints into the task contract. Do not invent
constraints the memory bank does not support.

### Step 4: Output The Task Contract

Once all required fields are clear, output the contract in this exact format and
stop:

```markdown
## Task: [Clear, specific objective]

### Context
- **Repository**: [path or monorepo location]
- **Current state**: [what exists now]
- **Related work**: [prior tasks, MB entries, or "none"]
- **Affected systems**: [components, services, modules]

### Desired Outcome
[One to three sentences describing what "done" looks like]

### Acceptance Criteria
1. [Specific, testable criterion]
2. [Specific, testable criterion]
3. [Specific, testable criterion]

### Constraints
- **Must follow**: [specific patterns from architecture.md]
- **Must extend**: [specific existing files/components]
- **Must not**: [anti-patterns, approaches to avoid]

### Historical Reference
- **Prior tasks**: [links to tasks/YYYY-MM/DDMMDD_*.md or "none"]
- **Arch decisions**: [links to decisions.md entries or "none"]
- **Related patterns**: [refs to architecture.md sections or "none"]

### Instructions
Create a PLAN for approval. After approval, execute. Do not write code until
the plan is approved. Do not create documentation until code is approved.
```

**Then stop.** Do not continue into PLAN. The user takes this contract to a new
session or confirms they want to proceed.

## Red Flags — Stop And Start Over

- You are writing implementation code → stop
- You are designing the technical approach → stop, that's PLAN
- You are making architectural decisions without asking → stop
- You are inventing requirements the user didn't state → stop
- You are writing more than 1–2 questions at a time → slow down

## Common Traps

| Trap | Why It's Wrong |
|------|---------------|
| "I'll just write the plan now to save time" | You produce the input to PLAN, not the plan itself |
| "The idea is clear enough, I'll skip questions" | Verify every required field is explicitly covered |
| "I'll scaffold the code to show what I mean" | No code. Ever. During this skill. |
| "I'll dump all my questions at once" | 1–2 at a time. Iterate. |
| "I'll add some nice-to-have acceptance criteria" | Only what the human confirmed. No padding. |
