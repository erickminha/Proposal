import {
  countOwners,
  ensureCanManageMembers,
  getClients,
  getMembership,
  getRequester,
  HttpError,
  jsonResponse,
  writeAuditLog,
} from "../_shared/admin.ts";

type RemoveMemberBody = {
  organization_id?: string;
  target_user_id?: string;
};

Deno.serve(async (req) => {
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

    if (targetMembership.role === "owner") {
      const owners = await countOwners(adminClient, organizationId);
      if (owners <= 1) {
        throw new HttpError(400, "Não é permitido remover o último owner.");
      }
    }

    const { error } = await adminClient
      .from("organization_members")
      .delete()
      .eq("organization_id", organizationId)
      .eq("user_id", targetUserId);

    if (error) throw new HttpError(500, error.message);

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
