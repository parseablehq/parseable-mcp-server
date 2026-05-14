import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  alert_id: z.string().min(1).describe("Alert ID (UUID) to disable."),
};

export const disableAlert: ToolDef<typeof schema> = {
  name: "disable_alert",
  title: "Disable alert",
  description: "Disable an active alert (stops evaluating + firing).",
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.disableAlert(String(args.alert_id));
  },
};
