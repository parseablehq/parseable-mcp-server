import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  alert_id: z.string().min(1).describe("Alert ID (UUID) to enable."),
};

export const enableAlert: ToolDef<typeof schema> = {
  name: "enable_alert",
  title: "Enable alert",
  description: "Enable a previously-disabled alert.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.enableAlert(String(args.alert_id));
  },
};
