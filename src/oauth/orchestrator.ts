export interface OrgWorkspace {
  user_type: string;
  workspace_id: string;
  prism_url: string;
  workspace_name: string;
  org_name: string;
  owner_email: string;
  plan: string;
  state: string;
  multi_tenant?: boolean;
  invitation_status?: string;
}

export interface OrganizationResponse {
  user_id: string;
  username: string;
  workspaces?: OrgWorkspace[];
}

export class OrchestratorError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "OrchestratorError";
  }
}

// Parseable Cloud orchestrator (control plane).
const DEFAULT_ORCHESTRATOR_URL = "https://orchestrator.cloud.parseable.com";
// Service-level static bearer used by Prism's cloudAxios interceptor to gate orchestrator access.
// Override via ORCHESTRATOR_BEARER env var if prod uses a different service token.
const DEFAULT_ORCHESTRATOR_BEARER = "aMNIgqb7lw7cqrQvDiw8bEpV8mlzrkRt1siybx2Tlrk=";

function getOrchestratorConfig(): { baseUrl: string; serviceBearer: string } {
  const baseUrl = (process.env.ORCHESTRATOR_URL ?? DEFAULT_ORCHESTRATOR_URL).replace(/\/+$/, "");
  return {
    baseUrl,
    serviceBearer: process.env.ORCHESTRATOR_BEARER ?? DEFAULT_ORCHESTRATOR_BEARER,
  };
}

/**
 * GET /api/v1/organizations?user_id={userId}
 * Headers used by Prism: Authorization: Bearer <service> + X-CLERK-SESSION-TOKEN: <user>
 */
export async function getOrganization(
  clerkUserId: string,
  clerkSessionToken: string,
): Promise<OrganizationResponse> {
  const { baseUrl, serviceBearer } = getOrchestratorConfig();
  const url = `${baseUrl}/api/v1/organizations?user_id=${encodeURIComponent(clerkUserId)}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serviceBearer}`,
    "X-CLERK-SESSION-TOKEN": clerkSessionToken,
  };

  const res = await fetch(url, { method: "GET", headers });
  const text = await res.text();
  if (!res.ok) {
    throw new OrchestratorError(
      res.status,
      `Orchestrator ${res.status} ${res.statusText}: ${text.slice(0, 500)}`,
    );
  }
  try {
    return JSON.parse(text) as OrganizationResponse;
  } catch {
    throw new OrchestratorError(500, `Orchestrator returned non-JSON: ${text.slice(0, 200)}`);
  }
}
