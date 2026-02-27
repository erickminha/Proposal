import { supabase } from "./supabase";

export async function runOnboarding(companyName) {
  const { error } = await supabase.rpc("complete_onboarding", {
    p_company_name: companyName || null,
  });

  if (error) {
    throw new Error(
      "Não foi possível concluir o onboarding da sua conta. Tente novamente em alguns segundos. Se o problema continuar, saia e entre de novo para repetir com segurança."
    );
  }
}
