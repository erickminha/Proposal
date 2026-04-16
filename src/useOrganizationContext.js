import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const resolveUiRole = (role) => {
  if (role === "owner" || role === "admin") return role;
  return "recruiter";
};

export function useOrganizationContext(user) {
  const [organization, setOrganization] = useState(null);
  const [userRole, setUserRole] = useState("recruiter");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadContext = async () => {
      if (!user) {
        setOrganization(null);
        setUserRole("recruiter");
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const metadataOrgId = user?.app_metadata?.organization_id || user?.user_metadata?.organization_id || null;
      const metadataRole = user?.app_metadata?.role || user?.user_metadata?.role || null;

      let organizationId = metadataOrgId;
      let role = metadataRole;

      if (!organizationId || !role) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("organization_id, role")
          .eq("id", user.id)
          .single();

        if (profileError && !cancelled) {
          console.error("Erro ao carregar profile:", profileError);
          setError(profileError.message);
        }

        if (profileData?.organization_id) {
          organizationId = profileData.organization_id;
        }

        if (profileData?.role) {
          role = profileData.role;
        }

        if (!metadataOrgId && profileData?.organization_id) {
          const { error: updateMetadataError } = await supabase.auth.updateUser({
            data: { organization_id: profileData.organization_id },
          });
          if (updateMetadataError) {
            console.error("Erro ao atualizar metadata com organization_id:", updateMetadataError);
          }
        }
      }

      let organizationData = null;
      if (organizationId) {
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", organizationId)
          .single();

        if (orgError && !cancelled) {
          console.error("Erro ao carregar organização:", orgError);
          setError(orgError.message);
        }

        organizationData = orgData || null;
      }

      if (!cancelled) {
        setOrganization(organizationData);
        setUserRole(resolveUiRole(role));
        setLoading(false);
      }
    };

    loadContext();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    organization,
    userRole,
    loading,
    error,
  };
}
