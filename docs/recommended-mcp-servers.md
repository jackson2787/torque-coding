# Recommended MCP Servers for AGENTS.md

**For**: AGENTS.md v2.2+
**Purpose**: MCP servers that directly support the AGENTS.md workflow — mapped to specific states, rules, and operations in the system.

AGENTS.md lists "MCP Preferred" as a Non-Negotiable. This guide explains which MCP servers to connect and why, tied back to the parts of the workflow they serve. Only servers that meaningfully improve the state machine, Memory Bank, or quality gates are included.

---

## How MCP Servers Fit the Workflow

AGENTS.md defines a state machine (`PLAN → BUILD → DIFF → QA → APPROVAL → APPLY → DOCS`) with supporting systems (Memory Bank, compaction protocol, reuse enforcement, budgets). MCP servers improve this workflow by giving the agent structured tool access to operations it would otherwise do through raw shell commands or brute-force file reads.

The agent doesn't need MCP servers to function — the system works with direct file access and shell commands as a baseline. MCP servers are an upgrade path that makes specific states faster, more reliable, or more context-efficient.

---

## Tier 1: Core — Connect These First

### GitHub MCP Server (Remote)

**What it serves**: BUILD, APPLY, Rollback Protocol, Sandbox-First rule, DOCS

**Server**: [GitHub Official MCP Server](https://github.com/github/github-mcp-server) — Remote (GitHub-hosted)

Your state machine works in sandbox branches. BUILD creates changes without applying them. APPLY commits approved changes. The rollback protocol restores to the last known good state. The DOCS state opens documentation PRs. All of this requires GitHub access.

GitHub's remote MCP server is hosted by GitHub — no Docker, no local runtime, no token rotation. It uses OAuth authentication, auto-updates, and provides structured access to repository management, PR creation, issue tracking, CI/CD visibility, and security alerts. It covers the full GitHub platform layer your workflow needs.

Local git operations (staging files, creating branches in your working directory, generating local diffs) are handled natively by your IDE or coding tool — Claude Code, Cursor, and similar tools already have direct terminal access for these. You don't need a separate local git MCP server. The GitHub remote server handles the platform layer; your tool handles the local layer.

**Configuration**:
```json
{
  "github": {
    "url": "https://api.githubcopilot.com/mcp/"
  }
}
```

OAuth will prompt on first use. For PAT-based auth:
```json
{
  "github": {
    "url": "https://api.githubcopilot.com/mcp/",
    "headers": {
      "Authorization": "Bearer ${GITHUB_TOKEN}"
    }
  }
}
```

**Note**: If you need an air-gapped environment, use the local version instead (runs via Docker). Otherwise, remote is simpler in every way.

**State machine touchpoints**: BUILD (branch work), DIFF (diff generation), APPLY (commit), DOCS (PR creation), Rollback Protocol (revert)

---

### Probe — Code Search MCP Server

**What it serves**: The Four Sacred Rules, PLAN state, Reuse Validation Checklist, Bootstrap Memory Bank evidence sweep

**Server**: [Probe](https://github.com/probelabs/probe) — Local, zero-setup

The single most enforced behaviour in AGENTS.md is reuse-over-creation. Before creating any new file, the agent must search the codebase, identify existing files that could be extended, and justify why they can't be. This requires fast, reliable, structure-aware codebase search.

Probe combines ripgrep's speed with tree-sitter AST parsing. Unlike plain text search, it returns complete functions, classes, and code blocks — not just matching lines. This is critical for the reuse analysis in PLAN: understanding whether an existing file can be extended requires seeing the full function, not a grep hit. It runs fully locally (your code never leaves your machine), requires zero indexing (no embedding models, no vector databases, no setup), and produces deterministic results.

It's also token-aware — you can set a `--max-tokens` budget and it deduplicates results across a session to avoid repeating context. This directly supports AGENTS.md's context management strategy.

Probe supports JavaScript, TypeScript, Python, Go, Rust, C/C++, Java, Ruby, PHP, Swift, C#, and more — covering any stack you work in.

Probe is also the best fit for the Day 1 bootstrap contract in
`docs/memory-bank/bootstrap-memory-bank-contract.md`. That contract intentionally
quarantines markdown and other prose during the primary evidence sweep, so the
agent has to learn the repo from code, config, tests, schemas, and runtime
files alone. If Probe is connected, the agent can do that sweep with structural
repo-wide search instead of manually traversing directories, which makes the
bootstrap faster and more thorough without weakening the anti-contamination
rule.

**Configuration**:
```json
{
  "probe": {
    "command": "npx",
    "args": ["-y", "@probelabs/probe@latest", "agent", "--mcp"]
  }
}
```

**State machine touchpoints**: PLAN (analysing existing code, reuse strategy), BUILD (finding integration points, extending patterns), Bootstrap Memory Bank evidence sweep, Reuse Validation Checklist (codebase search)

---

## Tier 2: Stack-Specific — Connect Based on Your Project

These servers provide domain knowledge for your specific tech stack. They replace the need to maintain local copies of framework skill files in `.agent/skills/` — the agent queries the MCP server for current best practices instead of loading a static snapshot.

### Your Backend / Database MCP Server

**What it serves**: PLAN (understanding data model), BUILD (extending backend), Security Review

Whatever your backend is — Supabase, Firebase, Postgres, a custom API — connecting it via MCP lets the agent inspect your actual data model, policies, and configuration rather than relying on a potentially stale `database-schema.md` in the Memory Bank.

This directly supports the "no ignoring existing architecture" rule. The agent can check the real schema before proposing changes, verify that RLS policies or auth rules are in place during the Security Review, and understand the actual API surface when planning frontend work.

**Examples**:
- Supabase → [Supabase Official MCP Server](https://github.com/supabase-community/supabase-mcp)
- PostgreSQL → Postgres MCP Server
- Firebase → Firebase MCP Server

**State machine touchpoints**: PLAN (data model analysis), BUILD (backend integration), APPROVAL (Security Review checklist)

---

### Your Framework's MCP Server

**What it serves**: BUILD skill nudges, QA skill nudges

If you're using a domain-tuned variant of AGENTS.md (e.g., the web variant with React/Next.js skills), framework MCP servers can replace locally maintained skill files. Instead of loading `.agent/skills/react-best-practices/SKILL.md` from a local copy, the agent queries the framework's MCP server for current guidance.

This has two advantages: the knowledge stays up to date without you pulling updates manually, and the agent can query for task-specific guidance rather than loading an entire skill file.

Your local `.agent/skills/` directory should still hold process skills that are specific to your workflow (writing-plans, build-execution, verification-before-completion, systematic-debugging, writing-docs). These are yours. Framework knowledge comes from the framework's MCP server.

**Examples**:
- Next.js / React → [Vercel MCP Server](https://vercel.com/docs/vercel-mcp-server)
- Expo / React Native → Expo MCP Server
- Tailwind → Tailwind MCP Server
- Your UI component library → Check if an MCP server is published

**State machine touchpoints**: BUILD (framework-specific implementation), QA (framework-specific verification)

---

## Tier 3: Build When Needed — Custom Servers for Your Workflow

These don't exist off the shelf. They're small custom MCP servers tailored to your specific AGENTS.md workflow. Build them when you hit the scaling triggers described below.

### Memory Bank MCP Server

**What it serves**: Session Startup, Compaction Recovery, all MB read operations

Replaces brute-force file loading with query-based retrieval over your `memory-bank/` directory. The agent asks "find decisions about caching" and gets back the relevant ADR section rather than loading all of `decisions.md`.

**When to build**: When your Memory Bank grows large enough that loading whole files wastes meaningful context. Rules of thumb:
- Total MB content exceeds 15-20K tokens
- `decisions.md` has more than 20 entries
- `tasks/` spans more than 4-5 months
- The agent is loading files just to find one section

**What it does**: Indexes MB files by heading structure, supports keyword and (optionally) semantic search, returns sections with source paths. Also supports the `mb_read_section` pattern for following citations like `decisions.md#2025-09-15-caching-strategy`.

**Architecture**: Local process, reads from `memory-bank/` directory, no external dependencies. Travels with the repo. Falls back gracefully — if the server isn't running, the agent reads files directly as it does today.

**State machine touchpoints**: Session Startup (all loading modes), Compaction Recovery, PLAN (MB context), DOCS (MB writes)

---

### Project QA MCP Server

**What it serves**: QA state

Wraps your project's test runner, linter, coverage tool, and build command into structured MCP tool calls. Instead of the agent running `npm test` and parsing terminal output, it calls a tool and gets structured results:

```json
{
  "tests": { "total": 145, "passed": 145, "failed": 0, "duration": "23.5s" },
  "linter": { "errors": 0, "warnings": 2 },
  "coverage": { "overall": 87.3, "new_code": 95.2 },
  "build": { "status": "success", "duration": "12.3s" }
}
```

This maps directly to the QA Report Format in Section 4 and eliminates parsing failures that can cause false stalls.

**When to build**: When you notice the agent misinterpreting test output, spending cycles parsing linter results, or reporting incorrect coverage numbers. Also useful when your QA pipeline involves multiple commands that need to run in sequence.

**Architecture**: Local process, wraps your existing test/lint/build commands, returns structured JSON. Project-specific — the server knows your test runner and configuration.

**State machine touchpoints**: QA (all verification steps), Budget tracking (cycle counting)

---

## What NOT to Connect

**Communication tools** (Slack, email, calendar) — AGENTS.md is a development workflow. Adding communication tools expands the agent's surface area beyond its defined role and introduces security considerations the system isn't designed for.

**Generic AI tool aggregators** — Servers that bundle many tools into one package. They add breadth without depth and increase the chance of the agent reaching for the wrong tool. Your system is opinionated by design — keep the tool surface tight.

**Duplicate coverage** — If your IDE already provides filesystem access and terminal execution, an additional filesystem MCP server may be redundant. Check what your tool provides natively before adding servers.

**Anything requiring credentials you wouldn't give a junior developer** — The agent operates within your AGENTS.md's security boundaries. Don't connect servers that give it access beyond what the workflow requires.

---

## Configuration

MCP servers are configured in your project's MCP config file (`.brain/mcp.config.json` or `.mcp.json`, referenced in AGENTS.md Section 2). The agent reads this at session startup.

Example configuration with Tier 1 and Tier 2 servers:

```json
{
  "mcpServers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "probe": {
      "command": "npx",
      "args": ["-y", "@probelabs/probe@latest", "agent", "--mcp"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "supabase-mcp-server", "--project-ref", "${SUPABASE_PROJECT_REF}"]
    },
    "memory-bank": {
      "command": "node",
      "args": ["./mcp-servers/memory-bank/index.js"],
      "cwd": "${PROJECT_ROOT}"
    }
  }
}
```

Note: Exact configuration syntax varies by host tool (Claude Code, Cursor, etc.). Check your tool's documentation for the correct format. The example above shows the general pattern — remote servers use URLs, local servers use commands.

---

## Summary

| Server | Tier | What It Serves | Install When |
|--------|------|---------------|--------------|
| [GitHub Remote](https://github.com/github/github-mcp-server) | 1 — Core | BUILD, APPLY, Rollback, DOCS | Immediately |
| [Probe](https://github.com/probelabs/probe) | 1 — Core | Four Sacred Rules, PLAN, bootstrap evidence sweep, Reuse | Immediately |
| Backend (Supabase, etc.) | 2 — Stack | PLAN, BUILD, Security Review | When project has a backend |
| Framework (Vercel, etc.) | 2 — Stack | BUILD skills, QA skills | When using domain-tuned variant |
| Memory Bank (custom) | 3 — Custom | Session Startup, MB reads | When MB exceeds ~15K tokens |
| Project QA (custom) | 3 — Custom | QA state | When QA parsing becomes unreliable |

Connect Tier 1 for any project. Add Tier 2 based on your stack. Build Tier 3 when you hit the scaling triggers.
