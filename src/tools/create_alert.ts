import { z } from "zod";
import type { ToolDef } from "./types.js";

const schema = {
  spec: z.record(z.unknown()).describe(
    `Complete alert object sent as the POST /api/v1/alerts request body. Use camelCase JSON:
{
  "title": "High error count",
  "alertType": "threshold",
  "query": "SELECT ... FROM logs ...",
  "severity": "high",
  "thresholdConfig": { "operator": ">", "value": 10 },
  "evalConfig": {
    "rollingWindow": {
      "evalStart": "10 minutes",
      "evalEnd": "now",
      "evalFrequency": 10
    }
  },
  "anomalyConfig": { "historicDuration": "1d" },
  "forecastConfig": { "historicDuration": "1d", "forecastDuration": "3h" },
  "notificationConfig": { "interval": 1 },
  "targets": ["target-id"],
  "tags": []
}

Required by the Prism create-alert flow: title, alertType, query, severity,
thresholdConfig, evalConfig, anomalyConfig, forecastConfig,
notificationConfig, targets, and tags. thresholdConfig.value and both interval
fields are numbers. evalStart uses a duration such as "10 minutes"; evalEnd is
"now"; evalFrequency is minutes. targets must contain valid alert-target IDs.
For threshold alerts, use alertType "threshold". Prism currently shows anomaly
and forecast as unavailable creation modes; retain their default config objects.

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
   - alert SQL against the selected dataset, matching Parseable's alert-query format
   - operator from > < = >= <= !=
   - numeric threshold value
   Confirm the translated SQL + operator + value back to the user.
4. "How far back should each check look?" → evalStart (e.g. "5 minutes", "15 minutes", "1 hour")
5. "How often should it evaluate?" → evalFrequency in minutes (integer)
6. "Severity: critical, high, medium, or low?" → default high
7. "Any tags? (comma-separated, optional)" → tags array, empty if none
8. "Notification targets?" → call list_alert_targets to fetch existing targets, present them as a numbered list, ask user to pick by number/name. Collect chosen target IDs into the targets array. Prism requires at least one target to create an alert.

Assemble alertType "threshold", evalEnd "now", anomalyConfig
{ historicDuration: "1d" }, forecastConfig { historicDuration: "1d",
forecastDuration: "3h" }, and notificationConfig { interval: 1 } unless the user
requests supported alternatives. Then show the complete JSON spec and ask "Create
this alert?" Only call create_alert after explicit confirmation. If user wants
edits, update fields and re-confirm.`,
  inputSchema: schema,
  handler: async (args, { client }) => {
    return await client.createAlert(args.spec);
  },
};
