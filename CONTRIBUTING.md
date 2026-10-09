# Contributing

`parseable-mcp-server` is a thin MCP-to-Parseable adapter. Parseable owns tool
definitions, validation, RBAC, execution, and edition-specific capabilities.
This repository must not duplicate tool implementations.

## Architecture

```text
MCP tools/list
  -> GET /api/prism/v1/llm/tools/list

MCP tools/call
  -> POST /api/prism/v1/llm/tools/call
```

Registry responses are validated, cached per Parseable URL, tenant, and
credential scope, then revalidated with `ETag`. Invocation results must be a
valid MCP `CallToolResult` and are never cached.

Key files:

```text
src/bootstrap.ts       MCP tools/list and tools/call handlers
src/client.ts          Parseable registry and invocation HTTP client
src/remote-tools.ts    registry validation, LRU/TTL cache, ETag state
src/http.ts            stateless Streamable HTTP transport and request auth
src/stdio.ts           stdio transport
src/cloud.ts           Parseable Cloud API-key routing
```

## Adding or changing tools

Tool changes belong in the Parseable server catalog and executor. This adapter
should change only when the REST or MCP contract changes.

Required invariants:

- Forward caller authentication and tenant routing on every upstream request.
- Reject malformed registries, invalid schemas, and duplicate tool names.
- Never cache tool invocation results.
- Scope registry cache entries so credentials cannot share private catalogs.
- Forward structured Parseable tool failures as MCP tool results.
- Convert malformed upstream results and transport failures into MCP errors.
- Do not log API keys, tool arguments, or tool results.

## Verification

```bash
npm run lint
npm run build:all
npm test
```

Tests use Vitest, native `fetch` mocks, and linked in-memory MCP transports.
Add coverage for both REST mapping and complete MCP discovery/invocation flows.

## Style and release

Biome owns formatting and linting (`npm run fix`). GitHub releases trigger npm
publishing; release tag and `package.json` version must match.
