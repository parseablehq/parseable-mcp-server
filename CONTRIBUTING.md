# Contributing

Thanks for helping improve `parseable-mcp-server`. This document covers the design principles, layout, and the practical mechanics of adding a tool or fixing a bug.

## Design principles

1. **Auth is the trust boundary.** If a user supplies credentials, they trust the MCP client. No env-var write-gates — MCP clients already show per-call approval UI. Re-introduce gates only for hosted/multi-tenant variants.
2. **Time-bounded queries are mandatory.** Never unbounded scans. Default window 60 minutes, max 1440.
3. **Row caps are enforced.** Default 100, hard max via `PARSEABLE_MAX_ROWS` (default 1000).
4. **One tool, one verb.** No mega-tools.
5. **Tool descriptions are user-facing.** They tell the calling client when to use the tool, not just what.
6. **No `ingest_event` tool.** Wrong shape, encourages garbage data — use Parseable's ingest API directly.
7. **No destructive tools** (`delete_*`). Force the Parseable UI for safety. Destructiveness is asymmetric.
8. **Loud descriptions on side-effecting tools.** `evaluate_alert` warns "MAY TRIGGER REAL NOTIFICATIONS" so callers confirm with the user first.
9. **Cross-platform first.** Tools-only over stdio is universal. Optional MCP features (elicitation, prompts, resources) only with a chat-Q&A fallback that works everywhere.

## Parseable API gotchas

Reference docs:
- [API Reference](https://www.parseable.com/docs/api)
- [Alerting](https://www.parseable.com/docs/user-guide/alerting)
- [RBAC](https://www.parseable.com/docs/user-guide/rbac)
- [PromQL](https://www.parseable.com/docs/user-guide/promql)
- [Retention](https://www.parseable.com/docs/user-guide/retention)
- [Installation modes (self-hosted)](https://www.parseable.com/docs/self-hosted/installation)
- [SQL Editor](https://www.parseable.com/docs/user-guide/sql-editor)

Things we learned the hard way (not always obvious from docs):
- Query payload uses **camelCase** keys. Required: `query`, `startTime`, `endTime`. Optional: `sendNull`.
- Auth is **Basic** (username:password base64). Switch to PAT when Parseable ships it server-side.
- All paths prefixed `/api/v1` — except PromQL.
- **PromQL endpoints live under `/prometheus/api/v1/`** (different base). `start`/`end`/`time` params must be **unix epoch seconds** in practice — `query_promql` auto-converts RFC3339 → epoch before sending.
- Cluster endpoints (`/cluster/info`, `/cluster/metrics`) only exist on **distributed** Parseable. Standalone returns 404. The `classifyStatus` helper surfaces a clear hint.

## File layout

```
src/
├── server.ts              # MCP wire-up, stdio transport, tool registration loop
├── config.ts              # env loader
├── client.ts              # Parseable HTTP client (Basic auth, AbortController timeout, error classification)
└── tools/
    ├── types.ts           # ToolDef interface + jsonResult/errorResult helpers
    ├── index.ts           # tool registry — add new tools here
    └── <tool_name>.ts     # one file per tool
test/
├── client.test.ts         # parseErrorBody, classifyStatus, request behavior
├── client_methods.test.ts # parametrized: every client method's verb + URL + body
├── tools.test.ts          # logic-heavy tools (query_sql, query_promql, explain_query)
├── tools_passthrough.test.ts  # every pass-through tool delegates correctly
├── registry.test.ts       # meta: unique names, snake_case, no destructive tools
├── config.test.ts         # env vars, defaults, overrides
└── types.test.ts          # jsonResult / errorResult helpers
```

## Adding a tool

1. Create `src/tools/<name>.ts` exporting a `ToolDef`.
2. Append to the array in `src/tools/index.ts`. The server auto-registers everything in that array.
3. Add a HTTP method to `src/client.ts` if a new endpoint is involved.
4. Add a test entry to `test/client_methods.test.ts` (verb + URL).
5. Add a pass-through test to `test/tools_passthrough.test.ts` for boring tools, or a logic test in `test/tools.test.ts` for tools with their own behavior.
6. `npm run lint && npm test && npm run build`.

Tool description guidelines:
- Tell the caller *when* to use the tool, not just what.
- Mention prerequisite tools (e.g. "Use `list_datasets` first to discover names").
- Loud-warn on side effects: "MAY FIRE REAL NOTIFICATIONS", "Destructive — confirm first".
- Keep description under ~500 chars unless steering a multi-step flow.

## TypeScript gotcha

`McpServer.registerTool` has deeply nested generic inference (`OutputArgs`/`InputArgs` union with `AnySchema`). Calling it inside a `for (const tool of tools)` loop triggers `TS2589: Type instantiation is excessively deep`. Workaround in `src/server.ts`: cast to a simpler function signature before invocation. Don't unwind into per-file registrations — the loop is fine, the cast is the right fix.

## Lint + format — Biome

Single tool replaces ESLint + Prettier. Config in `biome.json`.

- 2-space indent, 100-char line width
- Double quotes, semicolons, trailing commas
- Imports auto-organized on `npm run fix`
- `useImportType` (warn) — prefer `import type` for types
- `useNodejsImportProtocol` (warn) — `node:fs` not `fs`
- `noNonNullAssertion` (warn) — prefer `if (x)` narrowing over `x!`
- `noExplicitAny` (warn)

Commands:
- `npm run lint` — check only (CI uses this)
- `npm run fix` — apply all safe auto-fixes (imports, formatting, lint rules)
- `npm run format` — formatting only

Biome runs in ~10ms across the whole repo.

## Testing

Vitest + native `fetch` mocking. Tests live in `test/*.test.ts`. Coverage via `npm run test:coverage` (v8 provider). Excluded: `src/server.ts` (boot wiring), `src/tools/index.ts` (registry — covered by `registry.test.ts`).

Current: **95% statements / 98% functions / 95% lines / 108 tests**.

## CI

`.github/workflows/ci.yml` runs on push + PR to main: `npm ci` → `npm run lint` → `npm run build` → `npm test`. Node 20.

## Deliberately excluded — won't be accepted

- `ingest_event` — wrong shape for this protocol
- `delete_*` — destructive, UI only
- `create_user` / `create_role` / RBAC mutation — UI/CLI only
- Live tail / streaming subscriptions — stdio transport not the right fit; use Parseable UI

## Releasing

Tag-triggered via `.github/workflows/release.yml` (planned): on `git tag v1.x.y && git push --tags`, the workflow runs lint + build + test, publishes to npm, builds and pushes a Docker image to GHCR, and drafts a GitHub Release.

For now: manual `npm publish` after `npm run build && npm test && npm run lint` pass locally.
