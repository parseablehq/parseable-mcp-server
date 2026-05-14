import type { ToolDef } from "./types.js";

export const ping: ToolDef = {
  name: "ping",
  title: "Ping Parseable server",
  description:
    "Check connectivity and report server version/build info. Returns about (version, mode, license, deployment id), liveness, and readiness. Use for diagnosing MCP-server-to-Parseable connection issues.",
  inputSchema: {},
  handler: async (_args, { client, config }) => {
    const result: Record<string, unknown> = { target: config.url };

    const settle = async <T>(label: string, p: Promise<T>) => {
      try {
        result[label] = await p;
      } catch (err) {
        result[label] = {
          error: err instanceof Error ? err.message : String(err),
        };
      }
    };

    await Promise.all([
      settle("about", client.about()),
      settle("liveness", client.liveness()),
      settle("readiness", client.readiness()),
    ]);

    return result;
  },
};
