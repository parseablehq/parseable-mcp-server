import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  target_id: z.string().min(1).describe("Target ID (ULID). Use list_alert_targets to discover."),
};

export const getAlertTarget: ToolDef<typeof schema> = {
  name: "get_alert_target",
  title: "Get alert target",
  description:
    "Get full config for one alert target (endpoint URL, auth, headers, notification interval).",
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.getTarget(String(args.target_id));
  },
};
