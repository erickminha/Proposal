import {
  assertRole,
  countOwners,
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

type ChangeRoleBody = {
  organization_id?: string;
  target_user_id?: string;
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

    const body = (await req.json()) as ChangeRoleBody;
    const organizationId = body.organization_id?.trim();
    const targetUserId = body.target_user_id?.trim();
    const role = body.role?.trim();

    if (!organizationId || !targetUserId || !role) {
      throw new HttpError(400, "organization_id, target_user_id e role são obrigatórios.");
    }

    assertRole(role);

    const requesterMembership = await getMembership(adminClient, organizationId, requesterId);
    ensureCanManageMembers(requesterMembership.role);

    const targetMembership = await getMembership(adminClient, organizationId, targetUserId);

    if (requesterMembership.role === "admin" && ["owner", "admin"].includes(targetMembership.role)) {
      throw new HttpError(403, "Admin não pode alterar role de owner/admin.");
    }

    if (requesterMembership.role === "admin" && role !== "member") {
      throw new HttpError(403, "Admin só pode definir role member.");
    }

    if (requesterId === targetUserId && requesterMembership.role === "owner" && role !== "owner") {
      throw new HttpError(400, "Auto-downgrade de owner não é permitido.");
    }

    if (targetMembership.role === "owner" && role !== "owner") {
      const owners = await countOwners(adminClient, organizationId);
      if (owners <= 1) {
        throw new HttpError(400, "Não é permitido remover o último owner.");
      }
    }

    const { data, error } = await adminClient
      .from("organization_members")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("organization_id", organizationId)
      .eq("user_id", targetUserId)
      .select("organization_id, user_id, role")
      .single();

    if (error) throw new HttpError(500, error.message);

    await writeAuditLog(adminClient, {
      organizationId,
      actorUserId: requesterId,
      targetUserId,
      action: "change_member_role",
      payload: {
        previous_role: targetMembership.role,
        new_role: role,
      },
    });

    return jsonResponse({ member: data });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    return jsonResponse({ error: "Erro interno inesperado." }, 500);
  }
});
