import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

export type MemberRole = "owner" | "admin" | "member";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function isPreflightRequest(req: Request) {
  return req.method === "OPTIONS";
}

export function preflightResponse() {
  return new Response("ok", {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

export function getClients(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new HttpError(500, "Supabase env vars are missing.");
  }

  const authHeader = req.headers.get("Authorization") ?? "";

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  return { userClient, adminClient };
}

export async function getRequester(req: Request) {
  const { userClient } = getClients(req);
  const { data, error } = await userClient.auth.getUser();

  if (error || !data.user?.id) {
    throw new HttpError(401, "Unauthorized.");
  }

  return data.user.id;
}

export function assertRole(value: string): asserts value is MemberRole {
  if (!["owner", "admin", "member"].includes(value)) {
    throw new HttpError(400, "Role inválida.");
  }
}

export async function getMembership(
  adminClient: SupabaseClient,
  organizationId: string,
  userId: string,
) {
  const { data, error } = await adminClient
    .from("organization_members")
    .select("organization_id, user_id, role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new HttpError(500, error.message);
  if (!data) throw new HttpError(403, "Usuário sem acesso à organização.");

  return data as { organization_id: string; user_id: string; role: MemberRole };
}

export function ensureCanManageMembers(actorRole: MemberRole) {
  if (!["owner", "admin"].includes(actorRole)) {
    throw new HttpError(403, "Apenas owner/admin pode gerir membros.");
  }
}

export async function countOwners(adminClient: SupabaseClient, organizationId: string) {
  const { count, error } = await adminClient
    .from("organization_members")
    .select("user_id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("role", "owner");

  if (error) throw new HttpError(500, error.message);

  return count ?? 0;
}

export async function writeAuditLog(
  adminClient: SupabaseClient,
  params: {
    organizationId: string;
    actorUserId: string;
    action: string;
    targetUserId?: string | null;
    payload?: Record<string, unknown>;
  },
) {
  const { error } = await adminClient.from("admin_audit_logs").insert({
    organization_id: params.organizationId,
    actor_user_id: params.actorUserId,
    target_user_id: params.targetUserId ?? null,
    action: params.action,
    payload: params.payload ?? {},
  });

  if (error) throw new HttpError(500, `Falha ao gravar log de auditoria: ${error.message}`);
}
