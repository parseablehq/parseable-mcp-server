import { describe, expect, it } from "vitest";
import { tools } from "../src/tools/index.js";

describe("tool registry", () => {
  it("registers a non-empty list of tools", () => {
    expect(tools.length).toBeGreaterThan(0);
  });

  it("has unique tool names", () => {
    const names = tools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every tool has snake_case name", () => {
    for (const t of tools) {
      expect(t.name).toMatch(/^[a-z][a-z0-9_]*$/);
    }
  });

  it("every tool has a title and non-empty description", () => {
    for (const t of tools) {
      expect(t.title.length, `${t.name} title`).toBeGreaterThan(0);
      expect(t.description.length, `${t.name} description`).toBeGreaterThan(10);
    }
  });

  it("every tool has an inputSchema object", () => {
    for (const t of tools) {
      expect(typeof t.inputSchema, `${t.name} inputSchema`).toBe("object");
    }
  });

  it("every tool has a handler function", () => {
    for (const t of tools) {
      expect(typeof t.handler, `${t.name} handler`).toBe("function");
    }
  });

  it("destructive tools are excluded by design", () => {
    const names = new Set(tools.map((t) => t.name));
    const forbidden = [
      "delete_dataset",
      "delete_alert",
      "delete_user",
      "delete_role",
      "delete_target",
      "remove_node",
      "set_retention",
      "create_user",
      "create_role",
      "modify_alert",
    ];
    for (const f of forbidden) {
      expect(names.has(f), `${f} must NOT be registered`).toBe(false);
    }
  });
});
