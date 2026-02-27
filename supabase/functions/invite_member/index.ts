import {
  assertRole,
  ensureCanManageMembers,
  getClients,
  getMembership,
  getRequester,
  HttpError,
  isPreflightRequest,
  jsonResponse,
  preflightResponse,
  writeAuditLog,
} from "../_shared/admin.ts";

type InviteBody = {
  organization_id?: string;
  email?: string;
  role?: string;
};

Deno.serve(async (req) => {
  if (isPreflightRequest(req)) {
    return preflightResponse();
  }

  try {
    if (req.method !== "POST") {
      throw new HttpError(405, "Method not allowed.");
    }

    const requesterId = await getRequester(req);
    const { adminClient } = getClients(req);

    const body = (await req.json()) as InviteBody;
    const organizationId = body.organization_id?.trim();
    const email = body.email?.trim().toLowerCase();
    const role = body.role?.trim() ?? "member";

    if (!organizationId || !email) {
      throw new HttpError(400, "organization_id e email são obrigatórios.");
    }

    assertRole(role);

    const requesterMembership = await getMembership(adminClient, organizationId, requesterId);
    ensureCanManageMembers(requesterMembership.role);

    if (requesterMembership.role === "admin" && role === "owner") {
      throw new HttpError(403, "Admin não pode convidar novo owner.");
    }

    const { data, error } = await adminClient
      .from("organization_invites")
      .upsert(
        {
          organization_id: organizationId,
          email,
          role,
          invited_by: requesterId,
          status: "pending",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id,email" },
      )
      .select("id, organization_id, email, role, status, created_at, updated_at")
      .single();

    if (error) throw new HttpError(500, error.message);

    await writeAuditLog(adminClient, {
      organizationId,
      actorUserId: requesterId,
      action: "invite_member",
      payload: { email, role, invite_id: data.id },
    });

    return jsonResponse({ invite: data });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    return jsonResponse({ error: "Erro interno inesperado." }, 500);
  }
});
