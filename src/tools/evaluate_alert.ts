import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  alert_id: z.string().min(1).describe("Alert ID (UUID) to evaluate now."),
};

export const evaluateAlert: ToolDef<typeof schema> = {
  name: "evaluate_alert",
  title: "Evaluate alert now",
  description:
    "Force-evaluate an alert immediately (out-of-schedule). MAY TRIGGER REAL NOTIFICATIONS if threshold breached — confirm with user before running on production alerts.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.evaluateAlert(String(args.alert_id));
  },
};
