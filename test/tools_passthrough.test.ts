import { describe, expect, it, vi } from "vitest";
import type { Config } from "../src/config.js";
import { createAlert } from "../src/tools/create_alert.js";
import { createAlertTarget } from "../src/tools/create_alert_target.js";
import { disableAlert } from "../src/tools/disable_alert.js";
import { enableAlert } from "../src/tools/enable_alert.js";
import { evaluateAlert } from "../src/tools/evaluate_alert.js";
import { getAlert } from "../src/tools/get_alert.js";
import { getAlertTarget } from "../src/tools/get_alert_target.js";
import { getClusterMetrics } from "../src/tools/get_cluster_metrics.js";
import { getClusterStatus } from "../src/tools/get_cluster_status.js";
import { getDatasetInfo } from "../src/tools/get_dataset_info.js";
import { getDatasetSchema } from "../src/tools/get_dataset_schema.js";
import { getDatasetStats } from "../src/tools/get_dataset_stats.js";
import { getDefaultRole } from "../src/tools/get_default_role.js";
import { getRetention } from "../src/tools/get_retention.js";
import { getRole } from "../src/tools/get_role.js";
import { getUserRoles } from "../src/tools/get_user_roles.js";
import { listAlertTags } from "../src/tools/list_alert_tags.js";
import { listAlertTargets } from "../src/tools/list_alert_targets.js";
import { listAlerts } from "../src/tools/list_alerts.js";
import { listDatasets } from "../src/tools/list_datasets.js";
import { listRoles } from "../src/tools/list_roles.js";
import { listUsers } from "../src/tools/list_users.js";
import { ping } from "../src/tools/ping.js";
import { sampleEvents } from "../src/tools/sample_events.js";
import type { ToolContext } from "../src/tools/types.js";

const config: Config = {
  url: "http://example.test",
  username: "admin",
  password: "pw",
  maxRows: 100,
  queryTimeoutMs: 5000,
};

function mkCtx(): { ctx: ToolContext; client: Record<string, ReturnType<typeof vi.fn>> } {
  const client = {
    listDatasets: vi.fn().mockResolvedValue(["a", "b"]),
    getDatasetSchema: vi.fn().mockResolvedValue({}),
    getDatasetInfo: vi.fn().mockResolvedValue({}),
    getDatasetStats: vi.fn().mockResolvedValue({}),
    query: vi.fn().mockResolvedValue([]),
    listAlerts: vi.fn().mockResolvedValue([]),
    getAlert: vi.fn().mockResolvedValue({}),
    listAlertTags: vi.fn().mockResolvedValue([]),
    enableAlert: vi.fn().mockResolvedValue({}),
    disableAlert: vi.fn().mockResolvedValue({}),
    evaluateAlert: vi.fn().mockResolvedValue({}),
    createAlert: vi.fn().mockResolvedValue({}),
    listTargets: vi.fn().mockResolvedValue([]),
    getTarget: vi.fn().mockResolvedValue({}),
    createTarget: vi.fn().mockResolvedValue({}),
    about: vi.fn().mockResolvedValue({ version: "1" }),
    liveness: vi.fn().mockResolvedValue("ok"),
    readiness: vi.fn().mockResolvedValue("ready"),
    listUsers: vi.fn().mockResolvedValue([]),
    getUserRoles: vi.fn().mockResolvedValue({}),
    listRoles: vi.fn().mockResolvedValue([]),
    getRole: vi.fn().mockResolvedValue({}),
    getDefaultRole: vi.fn().mockResolvedValue({}),
    getClusterInfo: vi.fn().mockResolvedValue([]),
    getClusterMetrics: vi.fn().mockResolvedValue([]),
    getRetention: vi.fn().mockResolvedValue([]),
  };
  return {
    ctx: { client: client as unknown as ToolContext["client"], config },
    client,
  };
}

describe("discovery pass-through tools", () => {
  it("list_datasets → client.listDatasets", async () => {
    const { ctx, client } = mkCtx();
    await listDatasets.handler({}, ctx);
    expect(client.listDatasets).toHaveBeenCalledOnce();
  });

  it("get_dataset_schema → client.getDatasetSchema", async () => {
    const { ctx, client } = mkCtx();
    await getDatasetSchema.handler({ dataset: "x" }, ctx);
    expect(client.getDatasetSchema).toHaveBeenCalledWith("x");
  });

  it("get_dataset_info → client.getDatasetInfo", async () => {
    const { ctx, client } = mkCtx();
    await getDatasetInfo.handler({ dataset: "x" }, ctx);
    expect(client.getDatasetInfo).toHaveBeenCalledWith("x");
  });

  it("get_dataset_stats → client.getDatasetStats", async () => {
    const { ctx, client } = mkCtx();
    await getDatasetStats.handler({ dataset: "x" }, ctx);
    expect(client.getDatasetStats).toHaveBeenCalledWith("x");
  });

  it("sample_events builds time-bounded query with row cap", async () => {
    const { ctx, client } = mkCtx();
    await sampleEvents.handler({ dataset: "x", limit: 5, minutes: 30 }, ctx);
    expect(client.query).toHaveBeenCalledOnce();
    const arg = client.query.mock.calls[0][0];
    expect(arg.query).toMatch(/SELECT \* FROM "x" ORDER BY p_timestamp DESC LIMIT 5/);
    expect(typeof arg.startTime).toBe("string");
    expect(typeof arg.endTime).toBe("string");
  });

  it("sample_events caps limit at config.maxRows", async () => {
    const { ctx, client } = mkCtx();
    await sampleEvents.handler({ dataset: "x", limit: 9999 }, ctx);
    const arg = client.query.mock.calls[0][0];
    expect(arg.query).toMatch(/LIMIT 100$/);
  });
});

describe("alerts pass-through tools", () => {
  it("list_alerts", async () => {
    const { ctx, client } = mkCtx();
    await listAlerts.handler({}, ctx);
    expect(client.listAlerts).toHaveBeenCalledOnce();
  });

  it("get_alert", async () => {
    const { ctx, client } = mkCtx();
    await getAlert.handler({ alert_id: "a1" }, ctx);
    expect(client.getAlert).toHaveBeenCalledWith("a1");
  });

  it("list_alert_tags", async () => {
    const { ctx, client } = mkCtx();
    await listAlertTags.handler({}, ctx);
    expect(client.listAlertTags).toHaveBeenCalledOnce();
  });

  it("enable_alert", async () => {
    const { ctx, client } = mkCtx();
    await enableAlert.handler({ alert_id: "a1" }, ctx);
    expect(client.enableAlert).toHaveBeenCalledWith("a1");
  });

  it("disable_alert", async () => {
    const { ctx, client } = mkCtx();
    await disableAlert.handler({ alert_id: "a1" }, ctx);
    expect(client.disableAlert).toHaveBeenCalledWith("a1");
  });

  it("evaluate_alert", async () => {
    const { ctx, client } = mkCtx();
    await evaluateAlert.handler({ alert_id: "a1" }, ctx);
    expect(client.evaluateAlert).toHaveBeenCalledWith("a1");
  });

  it("create_alert", async () => {
    const { ctx, client } = mkCtx();
    const spec = { title: "t" };
    await createAlert.handler({ spec }, ctx);
    expect(client.createAlert).toHaveBeenCalledWith(spec);
  });
});

describe("alert targets pass-through tools", () => {
  it("list_alert_targets", async () => {
    const { ctx, client } = mkCtx();
    await listAlertTargets.handler({}, ctx);
    expect(client.listTargets).toHaveBeenCalledOnce();
  });

  it("get_alert_target", async () => {
    const { ctx, client } = mkCtx();
    await getAlertTarget.handler({ target_id: "t1" }, ctx);
    expect(client.getTarget).toHaveBeenCalledWith("t1");
  });

  it("create_alert_target", async () => {
    const { ctx, client } = mkCtx();
    const spec = { name: "ops", type: "slack" };
    await createAlertTarget.handler({ spec }, ctx);
    expect(client.createTarget).toHaveBeenCalledWith(spec);
  });
});

describe("diagnostics", () => {
  it("ping calls about + liveness + readiness in parallel", async () => {
    const { ctx, client } = mkCtx();
    const res = (await ping.handler({}, ctx)) as Record<string, unknown>;
    expect(client.about).toHaveBeenCalledOnce();
    expect(client.liveness).toHaveBeenCalledOnce();
    expect(client.readiness).toHaveBeenCalledOnce();
    expect(res.target).toBeDefined();
    expect(res.about).toEqual({ version: "1" });
    expect(res.liveness).toBe("ok");
    expect(res.readiness).toBe("ready");
  });

  it("ping tolerates individual endpoint failures", async () => {
    const { ctx, client } = mkCtx();
    client.liveness.mockRejectedValueOnce(new Error("dead"));
    const res = (await ping.handler({}, ctx)) as Record<string, unknown>;
    expect(res.liveness).toMatchObject({ error: "dead" });
    expect(res.about).toEqual({ version: "1" });
  });
});

describe("RBAC pass-through tools", () => {
  it("list_users", async () => {
    const { ctx, client } = mkCtx();
    await listUsers.handler({}, ctx);
    expect(client.listUsers).toHaveBeenCalledOnce();
  });

  it("get_user_roles", async () => {
    const { ctx, client } = mkCtx();
    await getUserRoles.handler({ userid: "alice" }, ctx);
    expect(client.getUserRoles).toHaveBeenCalledWith("alice");
  });

  it("list_roles", async () => {
    const { ctx, client } = mkCtx();
    await listRoles.handler({}, ctx);
    expect(client.listRoles).toHaveBeenCalledOnce();
  });

  it("get_role", async () => {
    const { ctx, client } = mkCtx();
    await getRole.handler({ name: "admin" }, ctx);
    expect(client.getRole).toHaveBeenCalledWith("admin");
  });

  it("get_default_role", async () => {
    const { ctx, client } = mkCtx();
    await getDefaultRole.handler({}, ctx);
    expect(client.getDefaultRole).toHaveBeenCalledOnce();
  });
});

describe("admin pass-through tools", () => {
  it("get_cluster_status", async () => {
    const { ctx, client } = mkCtx();
    await getClusterStatus.handler({}, ctx);
    expect(client.getClusterInfo).toHaveBeenCalledOnce();
  });

  it("get_cluster_metrics", async () => {
    const { ctx, client } = mkCtx();
    await getClusterMetrics.handler({}, ctx);
    expect(client.getClusterMetrics).toHaveBeenCalledOnce();
  });

  it("get_retention", async () => {
    const { ctx, client } = mkCtx();
    await getRetention.handler({ dataset: "x" }, ctx);
    expect(client.getRetention).toHaveBeenCalledWith("x");
  });
});
