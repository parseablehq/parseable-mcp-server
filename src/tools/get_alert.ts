import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  alert_id: z.string().min(1).describe("Alert ID (UUID). Use list_alerts to discover."),
};

export const getAlert: ToolDef<typeof schema> = {
  name: "get_alert",
  title: "Get alert",
  description:
    "Get full configuration for one alert: query, threshold, evaluation window, targets, tags, state, last fired timestamp.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.getAlert(String(args.alert_id));
  },
};
