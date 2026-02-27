import {
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

type RemoveMemberBody = {
  organization_id?: string;
  target_user_id?: string;
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

    const body = (await req.json()) as RemoveMemberBody;
    const organizationId = body.organization_id?.trim();
    const targetUserId = body.target_user_id?.trim();

    if (!organizationId || !targetUserId) {
      throw new HttpError(400, "organization_id e target_user_id são obrigatórios.");
    }

    const requesterMembership = await getMembership(adminClient, organizationId, requesterId);
    ensureCanManageMembers(requesterMembership.role);

    const targetMembership = await getMembership(adminClient, organizationId, targetUserId);

    if (requesterMembership.role === "admin" && ["owner", "admin"].includes(targetMembership.role)) {
      throw new HttpError(403, "Admin não pode remover owner/admin.");
    }

    const { error } = await adminClient.rpc("remove_member_safely", {
      p_organization_id: organizationId,
      p_target_user_id: targetUserId,
    });

    if (error) {
      if (error.message.includes("Não é permitido remover o último owner.")) {
        throw new HttpError(400, error.message);
      }

      throw new HttpError(500, error.message);
    }

    await writeAuditLog(adminClient, {
      organizationId,
      actorUserId: requesterId,
      targetUserId,
      action: "remove_member",
      payload: { removed_role: targetMembership.role },
    });

    return jsonResponse({ removed: true });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    return jsonResponse({ error: "Erro interno inesperado." }, 500);
  }
});
