import { supabase } from './supabase'

const PENDING_INVITE_STORAGE_KEY = 'pending-org-invite-token'

export function getInviteTokenFromUrl(search = window.location.search) {
  const params = new URLSearchParams(search)
  return params.get('token') || ''
}

export function savePendingInviteToken(token) {
  if (!token) return
  sessionStorage.setItem(PENDING_INVITE_STORAGE_KEY, token)
}

export function getPendingInviteToken() {
  return sessionStorage.getItem(PENDING_INVITE_STORAGE_KEY) || ''
}

export function clearPendingInviteToken() {
  sessionStorage.removeItem(PENDING_INVITE_STORAGE_KEY)
}

function isInviteExpired(expiresAt) {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() <= Date.now()
}

export async function validateInviteToken(token) {
  if (!token) {
    return { ok: false, reason: 'Token de convite não informado.' }
  }

  const inviteQuery = await supabase
    .from('organization_invites')
    .select('id, token, email, role, organization_id, expires_at, accepted_at, accepted_by')
    .eq('token', token)
    .maybeSingle()

  if (inviteQuery.error) {
    return { ok: false, reason: inviteQuery.error.message }
  }

  if (!inviteQuery.data) {
    return { ok: false, reason: 'Convite não encontrado.' }
  }

  if (inviteQuery.data.accepted_at) {
    return { ok: false, reason: 'Este convite já foi aceito.' }
  }

  if (isInviteExpired(inviteQuery.data.expires_at)) {
    return { ok: false, reason: 'Este convite expirou.' }
  }

  return { ok: true, invite: inviteQuery.data }
}

export async function acceptInviteForUser({ token, user }) {
  const validation = await validateInviteToken(token)
  if (!validation.ok) return validation

  const invite = validation.invite
  const inviteEmail = (invite.email || '').toLowerCase().trim()
  const userEmail = (user?.email || '').toLowerCase().trim()

  if (inviteEmail && userEmail !== inviteEmail) {
    return {
      ok: false,
      reason: 'O e-mail autenticado é diferente do e-mail do convite.',
      expectedEmail: invite.email,
    }
  }

  const membershipResult = await supabase
    .from('organization_members')
    .upsert(
      {
        organization_id: invite.organization_id,
        user_id: user.id,
        role: invite.role,
      },
      { onConflict: 'organization_id,user_id' },
    )

  if (membershipResult.error) {
    return { ok: false, reason: membershipResult.error.message }
  }

  const acceptedAt = new Date().toISOString()
  const inviteUpdate = await supabase
    .from('organization_invites')
    .update({
      accepted_at: acceptedAt,
      accepted_by: user.id,
      token: null,
    })
    .eq('id', invite.id)

  if (inviteUpdate.error) {
    return { ok: false, reason: inviteUpdate.error.message }
  }

  return {
    ok: true,
    invite,
    acceptedAt,
  }
}
