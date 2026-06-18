# Parseable MCP Server

Model Context Protocol server for [Parseable](https://www.parseable.com). Lets any MCP-capable client (Claude Desktop, Claude Code, Cursor, VS Code Copilot, Windsurf, Continue, Cline, Zed, Codex) discover, query, and manage Parseable datasets and alerts using natural language.

**Two transports:**

| Mode | Transport | Auth | Use when |
|------|-----------|------|----------|
| `stdio` | Stdin/stdout | Basic auth via env vars | Claude Desktop, Cursor, VS Code, local clients |
| `http` | HTTP + SSE | OAuth 2.0 via Clerk | Claude Desktop custom connector, hosted deployments |

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
  --username admin \
  --password "$PARSEABLE_PASSWORD"
```

Supported `--client` values: `claude-desktop`, `cursor`.

---

## Quickstart — HTTP + OAuth (hosted)

The HTTP mode serves a landing page, OAuth login UI, and the MCP endpoint — all from one process.

### 1. Set env vars

```bash
# .env
PARSEABLE_URL=https://your-parseable.example.com
PARSEABLE_USERNAME=admin
PARSEABLE_PASSWORD=your-password

PORT=8787
MCP_PUBLIC_BASE_URL=https://mcp.your-domain.com   # public URL of this server

CLERK_PUBLISHABLE_KEY=pk_live_xxx   # Clerk Dashboard → API Keys
CLERK_SECRET_KEY=sk_live_xxx        # Clerk Dashboard → API Keys (server-side only)
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
- URL: `https://mcp.your-domain.com`
- Click Add → Connect → complete OAuth

### 4. Connect from Claude Code

```bash
claude mcp add --transport http parseable https://mcp.your-domain.com --scope user
```

### 5. Connect from Cursor / VS Code

```json
{
  "mcpServers": {
    "parseable": { "type": "http", "url": "https://mcp.your-domain.com" }
  }
}
```

---

## How the OAuth flow works

```
MCP client → GET /.well-known/oauth-authorization-server  (discover endpoints)
           → GET /oauth/authorize?...                      (redirect to /login)
           → GET /login                                    (React UI, Clerk sign-in)
           → Clerk OAuth (Google / LinkedIn / GitHub / email)
           → GET /sso-callback                             (Clerk handshake)
           → GET /post-auth                                (read session, forward to /oauth/callback)
           → GET /oauth/callback                           (verify Clerk session, resolve workspace)
           → POST /oauth/token                             (exchange code → access token)
           → POST /                                        (MCP calls with Bearer token)
```

### How Clerk keys reach the browser

`CLERK_SECRET_KEY` never leaves the server. `CLERK_PUBLISHABLE_KEY` is designed to be public — it's injected inline into `index.html` at serve time:

```
GET /login
  → serveIndex() reads dist/ui/index.html
  → injects: window.__PARSEABLE_CONFIG__ = {"publishableKey":"pk_live_...","publicBaseUrl":"https://..."}
  → sends HTML to browser

React reads window.__PARSEABLE_CONFIG__ synchronously → passes publishableKey to <ClerkProvider>
```

No separate `/config` endpoint. No network call from the browser to fetch keys.

---

## Environment variables

### stdio mode

| Var | Required | Default | Purpose |
|-----|----------|---------|---------|
| `PARSEABLE_URL` | ✅ | — | Parseable base URL |
| `PARSEABLE_USERNAME` | ✅ | — | Basic auth username |
| `PARSEABLE_PASSWORD` | ✅ | — | Basic auth password |
| `PARSEABLE_DEFAULT_DATASET` | | — | Advisory default dataset |
| `PARSEABLE_MAX_ROWS` | | 1000 | Hard cap on query rows |
| `PARSEABLE_QUERY_TIMEOUT_MS` | | 30000 | HTTP timeout (ms) |

### HTTP + OAuth mode (additional)

| Var | Required | Default | Purpose |
|-----|----------|---------|---------|
| `PORT` | | 8787 | HTTP listen port |
| `MCP_PUBLIC_BASE_URL` | ✅ | — | Public URL of this server (used in OAuth redirects) |
| `CLERK_PUBLISHABLE_KEY` | ✅ | — | Clerk `pk_live_` or `pk_test_` key |
| `CLERK_SECRET_KEY` | ✅ | — | Clerk `sk_live_` or `sk_test_` key (server-side only) |

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
        "PARSEABLE_USERNAME": "admin",
        "PARSEABLE_PASSWORD": "your-password"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add Parseable \
  --env PARSEABLE_URL=https://your-parseable.example.com \
  --env PARSEABLE_USERNAME=admin \
  --env PARSEABLE_PASSWORD=your-password \
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
        "PARSEABLE_USERNAME": "admin",
        "PARSEABLE_PASSWORD": "your-password"
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
        "PARSEABLE_USERNAME": "admin",
        "PARSEABLE_PASSWORD": "your-password"
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
node dist/server.js http    # HTTP + OAuth mode (port 8787)

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

- Basic-auth credentials in stdio mode live in the MCP client config. Use a Parseable user scoped to minimum permissions.
- `CLERK_SECRET_KEY` is server-side only — it never reaches the browser. The publishable key (`pk_`) is injected inline into HTML and is designed to be public.
- `query_sql` blocks DDL/DML and enforces a row `LIMIT`. Time window is mandatory.
- `evaluate_alert` can fire real notifications — review the call before approving.
- No telemetry. Outbound calls go to your Parseable instance and Clerk only.

---

## License

Apache-2.0. See [LICENSE](LICENSE).
