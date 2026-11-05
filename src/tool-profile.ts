import type { RemoteTool } from "./remote-tools.js";

export const TOOL_PROFILE_HEADER = "X-Parseable-Tool-Profile";

export type ToolProfile = "core" | "full";

const CORE_TOOL_NAMES = new Set(["list_datasets", "get_dataset_schema", "query_sql"]);

export class ToolProfileError extends Error {
  readonly status = 400;

  constructor(value: string) {
    super(`Invalid ${TOOL_PROFILE_HEADER} value "${value}". Expected "core" or "full".`);
    this.name = "ToolProfileError";
  }
}

export function parseToolProfile(value: string | null | undefined): ToolProfile {
  if (value === undefined || value === null || value.trim() === "") return "full";
  const profile = value.trim().toLowerCase();
  if (profile === "core" || profile === "full") return profile;
  throw new ToolProfileError(value);
}

export function toolAllowed(profile: ToolProfile, name: string): boolean {
  return profile === "full" || CORE_TOOL_NAMES.has(name);
}

export function filterToolsForProfile(profile: ToolProfile, tools: RemoteTool[]): RemoteTool[] {
  return profile === "full" ? tools : tools.filter((tool) => toolAllowed(profile, tool.name));
}
