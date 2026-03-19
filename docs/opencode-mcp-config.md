# OpenCode MCP Configuration

**For**: AGENTS.md v2.2+ with [OpenCode](https://opencode.ai)
**File**: `opencode.json` (project root)

---

## About

OpenCode uses an `opencode.json` file in your project root for configuration. MCP servers are defined under the `mcp` key. Local servers use `type: "local"` with a command array. Remote servers use `type: "remote"` with a URL.

OpenCode handles OAuth automatically for remote servers — it detects the auth requirement and prompts you in the browser on first use.

**Note on context**: MCP servers add to your context window. OpenCode's docs recommend being selective about which servers you enable. The configuration below includes only servers that directly serve the AGENTS.md workflow. See `recommended-mcp-servers.md` for the full rationale behind each choice.

---

## Tier 1: Core Configuration

Minimal setup for any project using AGENTS.md.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "github": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp/",
      "enabled": true
    },
    "probe": {
      "type": "local",
      "command": ["npx", "-y", "@probelabs/probe@latest", "agent", "--mcp"],
      "enabled": true
    }
  }
}
```

**GitHub Remote** — OAuth will prompt on first use. No PAT needed. If you prefer PAT-based auth:

```json
{
  "github": {
    "type": "remote",
    "url": "https://api.githubcopilot.com/mcp/",
    "enabled": true,
    "headers": {
      "Authorization": "Bearer ${GITHUB_TOKEN}"
    }
  }
}
```

**Probe** — Downloads automatically via `npx` on first use. No manual install required. Requires Node.js/npm (which you already have).

---

## Tier 1 + Tier 2: With Supabase Backend

For projects using Supabase as the backend.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "github": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp/",
      "enabled": true
    },
    "probe": {
      "type": "local",
      "command": ["npx", "-y", "@probelabs/probe@latest", "agent", "--mcp"],
      "enabled": true
    },
    "supabase": {
      "type": "local",
      "command": ["npx", "-y", "supabase-mcp-server", "--project-ref", "${SUPABASE_PROJECT_REF}"],
      "enabled": true,
      "environment": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

---

## Full Stack: Web + Mobile + Backend

For projects with React/Next.js frontend, React Native/Expo mobile, and Supabase backend.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "github": {
      "type": "remote",
      "url": "https://api.githubcopilot.com/mcp/",
      "enabled": true
    },
    "probe": {
      "type": "local",
      "command": ["npx", "-y", "@probelabs/probe@latest", "agent", "--mcp"],
      "enabled": true
    },
    "supabase": {
      "type": "local",
      "command": ["npx", "-y", "supabase-mcp-server", "--project-ref", "${SUPABASE_PROJECT_REF}"],
      "enabled": true,
      "environment": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    },
    "vercel": {
      "type": "remote",
      "url": "https://vercel.com/api/mcp",
      "enabled": true
    }
  }
}
```

---

## Environment Variables

Store sensitive values as environment variables rather than hardcoding them in `opencode.json`. OpenCode supports `${VAR_NAME}` syntax for referencing environment variables.

| Variable | Required For | How To Get It |
|----------|-------------|---------------|
| `GITHUB_TOKEN` | GitHub (PAT auth only) | GitHub → Settings → Developer settings → Personal access tokens |
| `SUPABASE_PROJECT_REF` | Supabase | Supabase dashboard → Project Settings → General |
| `SUPABASE_ACCESS_TOKEN` | Supabase | Supabase dashboard → Account → Access tokens |

GitHub with OAuth (the default remote config) does not require a token — OpenCode handles the browser-based auth flow automatically.

---

## Disabling Servers Temporarily

Set `enabled` to `false` to disable a server without removing it from the config:

```json
{
  "probe": {
    "type": "local",
    "command": ["npx", "-y", "@probelabs/probe@latest", "agent", "--mcp"],
    "enabled": false
  }
}
```

This is useful when debugging context window issues or when a server isn't needed for a particular task.

---

## Adding the Memory Bank MCP Server (Tier 3 — Future)

When your Memory Bank grows large enough to justify query-based access, add it as a local server:

```json
{
  "memory-bank": {
    "type": "local",
    "command": ["node", "./mcp-servers/memory-bank/index.js"],
    "enabled": true
  }
}
```

This server would live in your repo and travel with it via git. See `recommended-mcp-servers.md` for when to build this.
