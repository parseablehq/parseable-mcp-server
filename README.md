# Parseable MCP Server

Model Context Protocol server for [Parseable](https://www.parseable.com). Lets any MCP-capable client (Claude Desktop, Claude Code, Cursor, Codex, VS Code Copilot, Continue, Windsurf, Cline, Zed) discover, query, and manage Parseable datasets and alerts.

> **Status:** v0.4 — 27 tools across discovery, query (SQL + PromQL), alerts, alert targets, diagnostics, RBAC (read-only), and admin (read-only). Tools-only over stdio for maximum cross-client compatibility.

## Tools

### Discovery
| Tool | Purpose |
|---|---|
| `list_datasets` | List all log datasets on the server. |
| `get_dataset_schema` | Get column names + types for a dataset. |
| `get_dataset_info` | Get dataset metadata (created_at, retention, owner, time window). |
| `get_dataset_stats` | Get event count and storage bytes for a dataset. |
| `sample_events` | Return the most recent N events from a dataset (time-bounded, row-capped). |

### Query
| Tool | Purpose |
|---|---|
| `query_sql` | Run a SQL `SELECT` over a time window. DDL/DML blocked. Auto-injects `LIMIT`. |
| `query_promql` | Run PromQL instant or range query against a metrics dataset. Auto-routes by `start`+`end`. |

### Alerts
| Tool | Purpose |
|---|---|
| `list_alerts` | List all alerts with state, severity, tags. |
| `get_alert` | Get full config for one alert. |
| `list_alert_tags` | List all alert tags in use. |
| `enable_alert` | Enable an alert. |
| `disable_alert` | Disable an alert. |
| `evaluate_alert` | Force-evaluate an alert now. **May fire real notifications.** |
| `create_alert` | Create a new alert. Walks user through 8 questions (title, dataset, condition, window, frequency, severity, tags, targets), confirms assembled spec before submitting. |

### Alert targets
Notification destinations referenced by alerts. Three supported types: **Slack**, **generic webhook**, **Alertmanager**.

| Tool | Purpose |
|---|---|
| `list_alert_targets` | List all configured targets with ID, name, type. Called automatically by `create_alert` so the user picks targets by name instead of typing UUIDs. |
| `get_alert_target` | Get full config for one target (endpoint, headers, auth, notification interval). |
| `create_alert_target` | Create a new Slack/webhook/Alertmanager target. |

### Diagnostics
| Tool | Purpose |
|---|---|
| `ping` | Check server connectivity and return version/build info (`/about`), `/liveness`, `/readiness`. Use to debug MCP-server → Parseable connection issues. |
| `explain_query` | Run `EXPLAIN` on a SQL query without executing it. Returns DataFusion plan for debugging slow queries, predicate pushdown, partition pruning. |

### RBAC (read-only)
Inspect users, roles, and effective access. **No tools for creating, modifying, or deleting users/roles** — RBAC mutation stays in the Parseable UI/CLI by design.

| Tool | Purpose |
|---|---|
| `list_users` | List all registered users. |
| `get_user_roles` | Get the roles assigned to a specific user. |
| `list_roles` | List all role names defined on the server. |
| `get_role` | Get the privilege definition for a role (actions + datasets). |
| `get_default_role` | Get the default role assigned to new users. |

These compose for permission audits: "Does user X have write access to dataset Y?" → call `get_user_roles(X)` → for each role call `get_role` → check if `Ingest` or `PutAlert` privilege covers Y.

### Admin (read-only)
Inspect cluster health and dataset lifecycle. **No tools for mutating cluster state or retention** — keep changes in UI/CLI by design.

| Tool | Purpose |
|---|---|
| `get_cluster_status` | List all nodes (Prism, Querier, Ingestor, Indexer) with status. Distributed mode only. |
| `get_cluster_metrics` | Aggregated metrics across all nodes (ingest rate, query latency, storage). Distributed mode only. |
| `get_retention` | Get retention policy for a dataset. |

## Prerequisites

- Node.js 18+
- A reachable Parseable server (cloud, BYOC, or self-hosted)

## Install

No install step — every MCP client invokes the server via `npx`, which fetches it on demand:

```
npx -y @parseable/parseable-mcp-server
```

For local development (hacking on the server itself):

```bash
git clone https://github.com/parseablehq/parseable-mcp-server.git
cd parseable-mcp-server
npm install
npm run build
node dist/server.js
```

## Configure

All configuration via environment variables (set in your MCP client's config file, not a `.env`):

| Var | Required | Default | Purpose |
|---|---|---|---|
| `PARSEABLE_URL` | ✅ | — | Parseable server base URL, no trailing slash |
| `PARSEABLE_USERNAME` | ✅ | — | Basic auth username |
| `PARSEABLE_PASSWORD` | ✅ | — | Basic auth password |
| `PARSEABLE_DEFAULT_DATASET` | | — | Scope a tool prompt to one dataset (advisory) |
| `PARSEABLE_MAX_ROWS` | | 1000 | Hard cap on query result rows |
| `PARSEABLE_QUERY_TIMEOUT_MS` | | 30000 | HTTP request timeout |

## Client setup

The command and args are the same for every client — only the config file location and syntax differ.

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) · `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "parseable": {
      "command": "npx",
      "args": ["-y", "@parseable/parseable-mcp-server"],
      "env": {
        "PARSEABLE_URL": "https://your-parseable.example.com",
        "PARSEABLE_USERNAME": "admin",
        "PARSEABLE_PASSWORD": "your-password"
      }
    }
  }
}
```

Restart Claude Desktop. Tools appear under the hammer icon.

### Claude Code

```bash
claude mcp add parseable \
  --env PARSEABLE_URL=https://your-parseable.example.com \
  --env PARSEABLE_USERNAME=admin \
  --env PARSEABLE_PASSWORD=your-password \
  -- npx -y @parseable/parseable-mcp-server
```

Verify with `claude mcp list`.

### Cursor

`~/.cursor/mcp.json` (global) or `<project>/.cursor/mcp.json` (per-project):

```json
{
  "mcpServers": {
    "parseable": {
      "command": "npx",
      "args": ["-y", "@parseable/parseable-mcp-server"],
      "env": {
        "PARSEABLE_URL": "https://your-parseable.example.com",
        "PARSEABLE_USERNAME": "admin",
        "PARSEABLE_PASSWORD": "your-password"
      }
    }
  }
}
```

Reload Cursor. Tools surface in chat.

### Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.parseable]
command = "npx"
args = ["-y", "@parseable/parseable-mcp-server"]

[mcp_servers.parseable.env]
PARSEABLE_URL = "https://your-parseable.example.com"
PARSEABLE_USERNAME = "admin"
PARSEABLE_PASSWORD = "your-password"
```

### VS Code (Copilot Chat)

`.vscode/mcp.json` in workspace, or user settings:

```json
{
  "servers": {
    "parseable": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@parseable/parseable-mcp-server"],
      "env": {
        "PARSEABLE_URL": "https://your-parseable.example.com",
        "PARSEABLE_USERNAME": "admin",
        "PARSEABLE_PASSWORD": "your-password"
      }
    }
  }
}
```

### Windsurf · Continue · Cline · Zed

Same shape as Cursor's `mcp.json`. Consult each client's MCP docs for the exact config file path.

## Try it

Once wired:

- *"What datasets do I have in Parseable?"*
- *"Show schema for `nginx_access`."*
- *"Run SQL: count events per status code in `nginx_access` over the last hour."*
- *"Plot rate(http_requests_total[5m]) from `otel_metrics` over last 30 min, step 1m."*
- *"List my alerts and which ones are disabled."*
- *"Disable alert `<id>`, too noisy."*
- *"Create an alert that fires when 5xx count in `nginx_access` > 50 over 5 min, severity high, notify the ops Slack channel."* — the client walks the 8-step Q&A, calls `list_alert_targets` to pick "ops Slack" by name, then submits.
- *"What notification targets are configured?"* — calls `list_alert_targets`.
- *"Add a Slack target pointing at `https://hooks.slack.com/services/...` named ops-alerts."* — calls `create_alert_target`.

## Security notes

- Basic-auth credentials live in the MCP client config in plaintext. Use a Parseable user scoped to the minimum permissions the tools need.
- Mutating tools (`enable_alert`, `disable_alert`, `evaluate_alert`, `create_alert`) are NOT gated by env flag — every MCP client already shows per-call approval UI. `evaluate_alert` can fire real notifications; review the call before approving.
- `query_sql` rejects DDL/DML keywords and injects a row `LIMIT`. Time window is mandatory.
- This server makes outbound HTTPS calls to your Parseable instance only. No telemetry.

## Develop

```bash
npm run dev          # tsc --watch
npm start            # node dist/server.js
npm test             # run unit tests
npm run test:watch   # vitest watch mode
npm run test:coverage
npm run lint         # biome check
npm run fix          # biome auto-fix + format
npm run format       # biome format only
```

CI (GitHub Actions) runs lint + build + test on every push and PR to `main`, on Node 20.

## Alert creation flow

`create_alert` is Q&A-driven via tool description — works on every MCP client (Claude Desktop, Claude Code, Cursor, Codex, VS Code, etc.) since it relies only on the client reading the tool description, not on client-specific UI primitives.

When you ask the client to create an alert, it asks one question per turn:

1. **Title** — what the alert is called
2. **Dataset** — which stream to watch (calls `list_datasets` if unsure)
3. **Condition** — translates natural language into SQL + operator + numeric threshold, confirms back
4. **Window** — how far back each check looks (e.g. `5m`, `15m`, `1h`)
5. **Frequency** — how often to evaluate (integer minutes)
6. **Severity** — `critical` / `high` / `medium` / `low`
7. **Tags** — comma-separated, optional
8. **Targets** — calls `list_alert_targets`, shows a numbered list, you pick by name

Then it shows the fully assembled JSON spec, you confirm, and it submits via `create_alert`. The same flow works for `create_alert_target` (asks name → type → endpoint → type-specific fields).

## Roadmap

- Dashboards tier (`list_dashboards`, `get_dashboard`, `create_dashboard`, `add_dashboard_tile`)
- Saved filters tier
- Diagnostic tools (`ping`, `explain_query`)
- Admin tier (cluster status, retention, users — opt-in)
- `npm publish @parseable/mcp-server` (one-line install via `npx`)
- Docker image
- Streamable HTTP transport for hosted `mcp.parseable.com`
- OAuth (replace Basic auth)
- Submission to `modelcontextprotocol/servers` registry + Smithery

## License

Apache-2.0. See [LICENSE](LICENSE).
