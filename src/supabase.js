import { createClient } from "@supabase/supabase-js";

// Substitua pelos seus dados do Supabase:
// Painel Supabase → Settings → API → Project URL e anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function invokeAdminFunction(functionName, payload) {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || `Erro ao executar ${functionName}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export function inviteMember(payload) {
  return invokeAdminFunction("invite_member", payload);
}

export function changeMemberRole(payload) {
  return invokeAdminFunction("change_member_role", payload);
}

export function removeMember(payload) {
  return invokeAdminFunction("remove_member", payload);
}
