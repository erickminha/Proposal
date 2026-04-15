import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const STATUS_OPTIONS = ["novo", "triagem", "entrevista", "aprovado", "reprovado"];

const statusColors = {
  novo: "#6366f1",
  triagem: "#f59e0b",
  entrevista: "#0ea5e9",
  aprovado: "#10b981",
  reprovado: "#ef4444"
};

export default function CandidateList({ user, corPrimaria, onBackToProposals, onSignOut }) {
  const [organizationId, setOrganizationId] = useState(null);
  const [candidaturas, setCandidaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [savingMap, setSavingMap] = useState({});

  useEffect(() => {
    const fetchOrgId = async () => {
      if (!user) {
        setOrganizationId(null);
        return;
      }

      const metadataOrgId = user?.app_metadata?.organization_id || user?.user_metadata?.organization_id;
      if (metadataOrgId) {
        setOrganizationId(metadataOrgId);
        return;
      }

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        return;
      }

      setOrganizationId(data?.organization_id || null);
    };

    fetchOrgId();
  }, [user]);

  useEffect(() => {
    if (!organizationId) return;
    fetchCandidaturas();
  }, [organizationId]);

  const fetchCandidaturas = async () => {
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from("candidaturas")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setCandidaturas([]);
    } else {
      setCandidaturas(data || []);
    }
    setLoading(false);
  };

  const filteredCandidaturas = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return candidaturas.filter((item) => {
      const itemStatus = String(item.status || "novo").toLowerCase();
      const nome = String(item.nome || item.candidato_nome || item.dados?.nome || "").toLowerCase();
      const cargo = String(item.cargo || item.vaga || item.dados?.cargo || "").toLowerCase();
      const statusMatch = statusFilter === "todos" || itemStatus === statusFilter;
      const searchMatch = !term || nome.includes(term) || cargo.includes(term);
      return statusMatch && searchMatch;
    });
  }, [candidaturas, searchTerm, statusFilter]);

  const statusSummary = useMemo(() => (
    STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = filteredCandidaturas.filter((item) => (item.status || "novo") === status).length;
      return acc;
    }, {})
  ), [filteredCandidaturas]);

  const updateCandidatura = async (id, payload) => {
    setSavingMap(prev => ({ ...prev, [id]: true }));
    const { data, error: updateError } = await supabase
      .from("candidaturas")
      .update(payload)
      .eq("id", id)
      .eq("organization_id", organizationId)
      .select()
      .single();

    if (updateError) {
      alert(`Erro ao atualizar candidatura: ${updateError.message}`);
    } else if (data) {
      setCandidaturas(prev => prev.map((item) => (item.id === id ? data : item)));
    }
    setSavingMap(prev => ({ ...prev, [id]: false }));
  };

  const handleStatusChange = (id, nextStatus) => {
    updateCandidatura(id, { status: nextStatus });
  };

  const handleObservacoesBlur = (id, observacoesInternas) => {
    const current = candidaturas.find(item => item.id === id)?.observacoes_internas || "";
    if (current === observacoesInternas) return;
    updateCandidatura(id, { observacoes_internas: observacoesInternas });
  };

  const getCurriculoPath = (candidatura) =>
    candidatura.curriculo_path ||
    candidatura.cv_path ||
    candidatura.storage_path ||
    candidatura.dados?.curriculo_path ||
    candidatura.dados?.cv_path ||
    null;

  const handleDownloadCurriculo = async (candidatura) => {
    const curriculoPath = getCurriculoPath(candidatura);
    if (!curriculoPath) {
      alert("Currículo não encontrado para esta candidatura.");
      return;
    }

    const bucketName = candidatura.storage_bucket || "curriculos";
    const { data, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(curriculoPath, 60);

    if (signedUrlError || !data?.signedUrl) {
      alert(`Não foi possível gerar link temporário do currículo: ${signedUrlError?.message || "erro desconhecido"}`);
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0, color: "#0f172a" }}>Banco de Candidaturas</h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{user?.email}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onBackToProposals} style={{ border: "1px solid #e2e8f0", background: "white", color: "#334155", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            ← Propostas
          </button>
          <button onClick={onSignOut} style={{ border: "1px solid #e2e8f0", background: "white", color: "#334155", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            🚪 Sair
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e2e8f0", background: "white", borderRadius: 10, padding: "0 12px" }}>
          <span>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nome do candidato ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", border: "none", outline: "none", padding: "12px 0", fontSize: 14, background: "transparent" }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ border: "1px solid #e2e8f0", background: "white", borderRadius: 10, padding: "12px 10px", fontSize: 14 }}
        >
          <option value="todos">Todos os status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 16 }}>
          {STATUS_OPTIONS.map((status) => (
            <div key={status} style={{ background: "white", borderRadius: 10, border: "1px solid #e2e8f0", padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "capitalize" }}>{status}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: statusColors[status], marginTop: 4 }}>{statusSummary[status] || 0}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <div style={{ textAlign: "center", color: "#64748b", padding: 24 }}>Carregando candidaturas...</div>}
      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 8, padding: 12 }}>❌ Erro: {error}</div>}

      {!loading && !error && filteredCandidaturas.length === 0 && (
        <div style={{ background: "white", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 24, textAlign: "center", color: "#64748b" }}>
          Nenhuma candidatura encontrada para os filtros aplicados.
        </div>
      )}

      {!loading && !error && filteredCandidaturas.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {filteredCandidaturas.map((candidatura) => {
            const nome = candidatura.nome || candidatura.candidato_nome || candidatura.dados?.nome || "Sem nome";
            const cargo = candidatura.cargo || candidatura.vaga || candidatura.dados?.cargo || "Cargo não informado";
            const status = candidatura.status || "novo";
            return (
              <div key={candidatura.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#0f172a", fontSize: 18 }}>{nome}</h3>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>{cargo}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(candidatura.id, e.target.value)}
                      disabled={savingMap[candidatura.id]}
                      style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 13, textTransform: "capitalize" }}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDownloadCurriculo(candidatura)}
                      style={{ background: corPrimaria || "#1976D2", color: "white", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    >
                      ⬇️ Currículo
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                    Observações internas
                  </label>
                  <textarea
                    defaultValue={candidatura.observacoes_internas || ""}
                    onBlur={(e) => handleObservacoesBlur(candidatura.id, e.target.value)}
                    placeholder="Ex.: pontos fortes, feedback da entrevista, próximos passos..."
                    style={{ width: "100%", minHeight: 80, border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, fontSize: 13, resize: "vertical" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
