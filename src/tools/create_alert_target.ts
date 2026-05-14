import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  spec: z.record(z.unknown()).describe(
    `Target spec, camelCase JSON. Shape varies by type:

Slack:
{ "name": "...", "type": "slack", "endpoint": "https://hooks.slack.com/..." }

Generic webhook:
{ "name": "...", "type": "webhook", "endpoint": "https://...", "headers": {...}, "skipTlsCheck": false }

Alertmanager:
{ "name": "...", "type": "alertManager", "endpoint": "https://...", "skipTlsCheck": false, "username": "...", "password": "..." }

Optional on all: { "notificationConfig": { "interval": 60 } }

Reference: https://www.parseable.com/docs/user-guide/alerting`,
  ),
};

export const createAlertTarget: ToolDef<typeof schema> = {
  name: "create_alert_target",
  title: "Create alert target",
  description:
    "Create a new notification target (Slack/webhook/Alertmanager). Ask the user step-by-step: name, type, endpoint URL, then type-specific fields (headers for webhook, basic auth for Alertmanager). Confirm full JSON before submitting.",
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.createTarget(args.spec);
  },
};
