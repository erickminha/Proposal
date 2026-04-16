import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  console.error(
    "Supabase URL or Anon Key is missing. Running with a safe placeholder client to avoid app crash."
  );
}

const safeUrl = isSupabaseConfigured ? SUPABASE_URL : "https://placeholder.invalid";
const safeAnonKey = isSupabaseConfigured ? SUPABASE_ANON_KEY : "placeholder-anon-key";

export const supabase = createClient(safeUrl, safeAnonKey);

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente."
    );
  }
}

async function invokeAdminFunction(functionName, payload) {
  ensureSupabaseConfigured();

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

export function submitCandidate(payload) {
  return invokeAdminFunction("submit_candidate", payload);
}
