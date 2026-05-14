import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  spec: z.record(z.unknown()).describe(
    `Full alert spec, camelCase JSON. Required:
- title (string)
- query (string, SQL SELECT returning a single numeric column)
- alertType ("threshold" | "anomaly" | "forecast")
- thresholdConfig { operator: ">"|"<"|"="|">="|"<="|"!=", value: number }
- evalConfig { rollingWindow: { evalStart: "5m", evalEnd: "now", evalFrequency: 1 } }
- targets (string[] — target UUIDs; empty array if no destinations)

Optional:
- severity ("critical"|"high"|"medium"|"low", default "medium")
- tags (string[])
- notificationConfig (object)

Reference: https://www.parseable.com/docs/user-guide/alerting`,
  ),
};

export const createAlert: ToolDef<typeof schema> = {
  name: "create_alert",
  title: "Create alert",
  description: `Create a new Parseable alert.

BEFORE calling this tool, gather inputs from the user ONE QUESTION AT A TIME. Do not invent values. Ask in this order:

1. "What should this alert be called?" → title
2. "Which dataset should it watch?" → call list_datasets if user is unsure, then pick
3. "What condition should trigger it?" → translate user's natural-language condition into:
   - a SQL SELECT against the dataset that returns a single numeric column
   - operator from > < = >= <= !=
   - numeric threshold value
   Confirm the translated SQL + operator + value back to the user.
4. "How far back should each check look?" → evalStart (e.g. "5m", "15m", "1h")
5. "How often should it evaluate?" → evalFrequency in minutes (integer)
6. "Severity: critical, high, medium, or low?" → default medium
7. "Any tags? (comma-separated, optional)" → tags array, empty if none
8. "Notification targets?" → call list_alert_targets to fetch existing targets, present them as a numbered list, ask user to pick by number/name. Collect chosen target IDs into the targets array. If no targets exist or user wants none, use an empty array.

Then show the fully assembled JSON spec to the user and ask "Create this alert?" Only call create_alert after explicit confirmation. If user wants edits, update fields and re-confirm.`,
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.createAlert(args.spec);
  },
};
