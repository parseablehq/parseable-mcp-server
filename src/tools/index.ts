import { createAlert } from "./create_alert.js";
import { createAlertTarget } from "./create_alert_target.js";
import { disableAlert } from "./disable_alert.js";
import { enableAlert } from "./enable_alert.js";
import { evaluateAlert } from "./evaluate_alert.js";
import { explainQuery } from "./explain_query.js";
import { getAlert } from "./get_alert.js";
import { getAlertTarget } from "./get_alert_target.js";
import { getClusterMetrics } from "./get_cluster_metrics.js";
import { getClusterStatus } from "./get_cluster_status.js";
import { getDatasetInfo } from "./get_dataset_info.js";
import { getDatasetSchema } from "./get_dataset_schema.js";
import { getDatasetStats } from "./get_dataset_stats.js";
import { getDefaultRole } from "./get_default_role.js";
import { getRetention } from "./get_retention.js";
import { getRole } from "./get_role.js";
import { getUserRoles } from "./get_user_roles.js";
import { listAlertTags } from "./list_alert_tags.js";
import { listAlertTargets } from "./list_alert_targets.js";
import { listAlerts } from "./list_alerts.js";
import { listDatasets } from "./list_datasets.js";
import { listRoles } from "./list_roles.js";
import { listUsers } from "./list_users.js";
import { ping } from "./ping.js";
import { queryPromql } from "./query_promql.js";
import { querySql } from "./query_sql.js";
import { sampleEvents } from "./sample_events.js";
import type { ToolDef } from "./types.js";

export const tools: ToolDef[] = [
  listDatasets,
  getDatasetSchema,
  getDatasetInfo,
  getDatasetStats,
  sampleEvents,
  querySql,
  queryPromql,
  listAlerts,
  getAlert,
  listAlertTags,
  enableAlert,
  disableAlert,
  evaluateAlert,
  createAlert,
  listAlertTargets,
  getAlertTarget,
  createAlertTarget,
  ping,
  explainQuery,
  listUsers,
  getUserRoles,
  listRoles,
  getRole,
  getDefaultRole,
  getClusterStatus,
  getClusterMetrics,
  getRetention,
];
