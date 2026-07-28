# Parseable MCP Server

Model Context Protocol server for [Parseable](https://www.parseable.com). Lets any MCP-capable client (Claude Desktop, Claude Code, Cursor, VS Code Copilot, Windsurf, Continue, Cline, Zed, Codex) discover, query, and manage Parseable datasets and alerts using natural language.

**Two transports:**

| Mode | Transport | Auth | Use when |
|------|-----------|------|----------|
| `stdio` | Stdin/stdout | API key via env vars | Claude Desktop, Cursor, VS Code, local clients |
| `http` | Streamable HTTP | Cloud API key, or self-hosted URL + API key | Hosted deployments and remote clients |

---

## Quickstart — stdio (local)

One command — interactive setup, detects Claude Desktop / Cursor, writes config files:

```bash
npx -y @parseable/parseable-mcp-server init
```

Restart your MCP client. Tools appear. Done.

Scripted:

```bash
npx -y @parseable/parseable-mcp-server init \
  --client claude-desktop \
  --url https://your-parseable.example.com \
  --api-key "$PARSEABLE_API_KEY"
```

Supported `--client` values: `claude-desktop`, `cursor`.

---

## Quickstart — HTTP (hosted)

HTTP mode serves a setup page and MCP endpoint from one process. Cloud clients supply an API key. Self-hosted clients supply their Parseable URL and API key.

### 1. Set env vars

```bash
# .env
PORT=8787
```

### 2. Run

```bash
# From source
npm run build:all
node dist/server.js http

# Docker
docker build -t parseable-mcp-server .
docker run -p 8787:8787 --env-file .env parseable-mcp-server
```

### 3. Connect from Claude

- Claude Desktop → Settings → Connectors → Add custom connector
- Name: `Parseable`
- URL: `https://mcp.your-domain.com/mcp`
- Header `X-Parseable-URL`: `https://your-parseable.example.com`
- Header `X-API-Key`: your Parseable API key
- Click Add → Connect

### 4. Connect from Claude Code

```bash
claude mcp add --transport http parseable https://mcp.your-domain.com/mcp --scope user \
  --header "X-Parseable-URL: https://your-parseable.example.com" \
  --header "X-API-Key: $PARSEABLE_API_KEY"
```

### 5. Connect from Cursor / VS Code

```json
{
  "mcpServers": {
    "parseable": {
      "type": "http",
      "url": "https://mcp.your-domain.com/mcp",
      "headers": {
        "X-Parseable-URL": "https://your-parseable.example.com",
        "X-API-Key": "your-parseable-api-key"
      }
    }
  }
}
```

---

## HTTP authentication

Each `POST /mcp` request requires `X-API-Key` and supports two modes:

| Mode | Headers |
|------|---------|
| Cloud | `X-Parseable-Mode: cloud`, `X-API-Key` |
| Self-hosted (default) | `X-Parseable-URL`, `X-API-Key` |

`X-Parseable-Mode` is checked first when present. Omitting it selects self-hosted mode; clients do not need to send `X-Parseable-Mode: self-hosted`. In cloud mode, server validates API key with Parseable Cloud, caches returned URL and tenant routing in a bounded in-memory LRU for 24 hours, and sends `x-p-tenant` on Parseable requests. Cache is disposable; misses and process restarts resolve through Cloud again.

For self-hosted mode, HTTP server validates supplied URL and forwards API key to that Parseable instance. By default, private and loopback Parseable URLs are rejected to limit SSRF. Set `PARSEABLE_MCP_ALLOW_PRIVATE=true` only for trusted deployments that need private network targets.

---

## Environment variables

### stdio mode

| Var | Required | Default | Purpose |
|-----|----------|---------|---------|
| `PARSEABLE_URL` | ✅ | — | Parseable base URL |
| `PARSEABLE_API_KEY` | ✅ | — | API key for self-hosted Parseable |
| `PARSEABLE_DEFAULT_DATASET` | | — | Advisory default dataset |
| `PARSEABLE_MAX_ROWS` | | 1000 | Hard cap on query rows |
| `PARSEABLE_QUERY_TIMEOUT_MS` | | 30000 | HTTP timeout (ms) |

### HTTP mode

| Var | Required | Default | Purpose |
|-----|----------|---------|---------|
| `PORT` | | 8787 | HTTP listen port |
| `PARSEABLE_MCP_ALLOW_PRIVATE` | | false | Permit private/loopback Parseable URLs supplied in request headers |
| `PARSEABLE_ORCHESTRATOR_URL` | Cloud only | - | Parseable Cloud orchestrator base URL |
| `PARSEABLE_CLOUD_AUTH_TOKEN` | Cloud only | - | Service bearer token for API-key validation |
| `PARSEABLE_CLOUD_CACHE_TTL_SECONDS` | | 86400 | Cloud routing LRU TTL |
| `PARSEABLE_CLOUD_CACHE_MAX_ENTRIES` | | 10000 | Maximum cached cloud API-key routes |
| `PARSEABLE_CLOUD_VALIDATE_TIMEOUT_MS` | | 10000 | Cloud validation timeout |

### OpenTelemetry (optional)

| Var | Default | Purpose |
|-----|---------|---------|
| `PARSEABLE_OTEL_ENABLED` | false | Enable trace export to Parseable |
| `PARSEABLE_OTEL_ENDPOINT` | — | Parseable OTLP endpoint |
| `PARSEABLE_OTEL_USERNAME` | — | Basic auth for OTLP |
| `PARSEABLE_OTEL_PASSWORD` | — | Basic auth for OTLP |
| `PARSEABLE_OTEL_TRACES_STREAM` | mcp-traces | Stream name for traces |
| `PARSEABLE_OTEL_DEBUG` | false | Log OTLP export errors |

Copy `.env.example` → `.env` for a full template.

---

## Tools

### Discovery

| Tool | Purpose |
|------|---------|
| `list_datasets` | List all log datasets |
| `get_dataset_schema` | Column names + types |
| `get_dataset_info` | Metadata (created_at, retention, time window) |
| `get_dataset_stats` | Event count and storage bytes |
| `sample_events` | Most recent N events (time-bounded, row-capped) |

### Query

| Tool | Purpose |
|------|---------|
| `query_sql` | SQL `SELECT` over a time window. DDL/DML blocked. Auto-injects `LIMIT`. |
| `query_promql` | PromQL instant or range query against a metrics dataset |

### Alerts

| Tool | Purpose |
|------|---------|
| `list_alerts` | List all alerts with state, severity, tags |
| `get_alert` | Full config for one alert |
| `list_alert_tags` | All alert tags in use |
| `enable_alert` | Enable an alert |
| `disable_alert` | Disable an alert |
| `evaluate_alert` | Force-evaluate now. **May fire real notifications.** |
| `create_alert` | Create alert via guided Q&A (8 questions, confirms before submit) |

### Alert targets

| Tool | Purpose |
|------|---------|
| `list_alert_targets` | List targets (Slack, webhook, Alertmanager) |
| `get_alert_target` | Full config for one target |
| `create_alert_target` | Create a new Slack / webhook / Alertmanager target |

### Diagnostics

| Tool | Purpose |
|------|---------|
| `ping` | Check connectivity, return version + health |
| `explain_query` | `EXPLAIN` a SQL query without executing it |

### RBAC (read-only)

| Tool | Purpose |
|------|---------|
| `list_users` | List all users |
| `get_user_roles` | Roles for a specific user |
| `list_roles` | All role names |
| `get_role` | Privilege definition for a role |
| `get_default_role` | Default role for new users |

### Admin (read-only)

| Tool | Purpose |
|------|---------|
| `get_cluster_status` | All nodes with status (distributed mode) |
| `get_cluster_metrics` | Aggregated ingest/query/storage metrics |
| `get_retention` | Retention policy for a dataset |

---

## Client setup — stdio

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "Parseable": {
      "command": "npx",
      "args": ["-y", "@parseable/parseable-mcp-server"],
      "env": {
        "PARSEABLE_URL": "https://your-parseable.example.com",
        "PARSEABLE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add Parseable \
  --env PARSEABLE_URL=https://your-parseable.example.com \
  --env PARSEABLE_API_KEY=your-api-key \
  -- npx -y @parseable/parseable-mcp-server
```

### Cursor

`~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "Parseable": {
      "command": "npx",
      "args": ["-y", "@parseable/parseable-mcp-server"],
      "env": {
        "PARSEABLE_URL": "https://your-parseable.example.com",
        "PARSEABLE_API_KEY": "your-api-key"
      }
    }
  }
}
```

### VS Code

`.vscode/mcp.json`:

```json
{
  "servers": {
    "Parseable": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@parseable/parseable-mcp-server"],
      "env": {
        "PARSEABLE_URL": "https://your-parseable.example.com",
        "PARSEABLE_API_KEY": "your-api-key"
      }
    }
  }
}
```

---

## Development

```bash
git clone https://github.com/parseablehq/parseable-mcp-server.git
cd parseable-mcp-server
npm install
cp .env.example .env    # fill in your values

# Build
npm run build           # server only (tsc)
npm run build:ui        # React UI only (vite)
npm run build:all       # both

# Run
node dist/server.js         # stdio mode
node dist/server.js http    # HTTP mode (port 8787)

# Dev
npm run dev             # tsc --watch
npm run dev:ui          # vite dev server (proxies API to :8787)
npm test
npm run lint
npm run fix             # biome auto-fix
```

CI (GitHub Actions) runs lint + `build:all` + test on every push/PR to `main` on Node 22. On merge to `main`, Docker image is published to `ghcr.io/parseablehq/parseable-mcp-server`.

---

## Security

- Parseable API keys live in MCP client configuration. Use keys scoped to minimum required permissions.
- HTTP clients send credentials in `X-Parseable-URL` and `X-API-Key`; always use HTTPS for remote deployments.
- `query_sql` blocks DDL/DML and enforces a row `LIMIT`. Time window is mandatory.
- `evaluate_alert` can fire real notifications — review the call before approving.
- No telemetry. Outbound calls go only to the Parseable instance configured by the user.

---

## License

Apache-2.0. See [LICENSE](LICENSE).
