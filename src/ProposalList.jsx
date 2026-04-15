import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function ProposalList({ user, onNew, onLoad, onSignOut, onBack, corPrimaria }) {
  const [propostas, setPropostas] = useState([]);
  const [filteredPropostas, setFilteredPropostas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizationId, setOrganizationId] = useState(null);

  // Buscar organization_id dos metadados ou da tabela profiles
  useEffect(() => {
    const fetchOrgId = async () => {
      if (!user) {
        setOrganizationId(null);
        return;
      }

      // Tenta obter dos metadados primeiro
      let orgId = user?.app_metadata?.organization_id || user?.user_metadata?.organization_id;
      if (orgId) {
        setOrganizationId(orgId);
        return;
      }

      // Se não tiver nos metadados, busca da tabela profiles
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single();

        if (!error && data?.organization_id) {
          orgId = data.organization_id;
          setOrganizationId(orgId);
          // Atualiza os metadados para evitar nova consulta
          await supabase.auth.updateUser({
            data: { organization_id: orgId }
          });
        } else {
          setOrganizationId(null);
        }
      } catch (err) {
        console.error("Erro ao buscar organization_id:", err);
        setOrganizationId(null);
      }
    };

    fetchOrgId();
  }, [user]);

  // Buscar propostas quando organizationId estiver disponível
  useEffect(() => {
    if (!user || !organizationId) return;
    fetchPropostas();
  }, [user, organizationId]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPropostas(propostas);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = propostas.filter(proposta => {
        const clienteNome = proposta.dados?.clienteNome?.toLowerCase() || "";
        const propostaNumero = proposta.proposta_numero?.toLowerCase() || "";
        const cnpj = proposta.dados?.clienteCNPJ?.toLowerCase() || "";
        return clienteNome.includes(term) || 
               propostaNumero.includes(term) || 
               cnpj.includes(term);
      });
      setFilteredPropostas(filtered);
    }
  }, [searchTerm, propostas]);

  const fetchPropostas = async () => {
    try {
      if (!organizationId) {
        setError("Organização não identificada para listar propostas.");
        setPropostas([]);
        setFilteredPropostas([]);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("propostas")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPropostas(data || []);
      setFilteredPropostas(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir esta proposta?")) return;
    try {
      if (!organizationId) throw new Error("Organização não identificada para excluir proposta.");
      const { error } = await supabase
        .from("propostas")
        .delete()
        .eq("id", id)
        .eq("organization_id", organizationId);
      if (error) throw error;
      setPropostas(propostas.filter(p => p.id !== id));
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Rascunho": return "#94a3b8";
      case "Enviada": return "#3b82f6";
      case "Aceita": return "#10b981";
      case "Recusada": return "#ef4444";
      default: return "#94a3b8";
    }
  };

  const statusSummary = filteredPropostas.reduce((acc, proposta) => {
    const status = proposta.status || "Rascunho";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Inter', sans-serif",
      padding: "24px"
    }}>
      {/* Cabeçalho com título e botões */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 16
      }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#0f172a",
            margin: 0
          }}>
            Minhas Propostas
          </h1>
          <p style={{
            fontSize: 14,
            color: "#64748b",
            marginTop: 4
          }}>
            {user?.email}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: "white",
                color: "#475569",
                border: "1px solid #e2e8f0",
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ← Módulos
            </button>
          )}
          <button
            onClick={onNew}
            style={{
              background: corPrimaria || "#1976D2",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: `0 4px 12px ${corPrimaria || "#1976D2"}33`
            }}
          >
            ➕ Nova Proposta
          </button>
          <button
            onClick={onSignOut}
            style={{
              background: "white",
              color: "#475569",
              border: "1px solid #e2e8f0",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s"
            }}
          >
            🚪 Sair
          </button>
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div style={{
        marginBottom: 24,
        background: "white",
        borderRadius: 12,
        padding: "4px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
      }}>
        <span style={{ color: "#94a3b8", fontSize: 18 }}>🔍</span>
        <input
          type="text"
          placeholder="Pesquisar por cliente, número ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            padding: "14px 0",
            fontSize: 14,
            outline: "none",
            background: "transparent"
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 14,
              padding: "4px 8px"
            }}
          >
            ✕
          </button>
        )}
      </div>

      {!loading && !error && filteredPropostas.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 18 }}>
          {["Rascunho", "Enviada", "Aceita", "Recusada"].map((status) => (
            <div key={status} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{status}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: getStatusColor(status), marginTop: 2 }}>{statusSummary[status] || 0}</div>
            </div>
          ))}
        </div>
      )}

      {/* Contador de resultados */}
      {!loading && !error && filteredPropostas.length > 0 && (
        <div style={{
          fontSize: 13,
          color: "#64748b",
          marginBottom: 16,
          fontWeight: 500
        }}>
          {filteredPropostas.length} {filteredPropostas.length === 1 ? "proposta encontrada" : "propostas encontradas"}
          {searchTerm && ` para "${searchTerm}"`}
        </div>
      )}

      {!loading && !error && filteredPropostas.length === 0 && (
        <div style={{ background: "white", border: "1px dashed #cbd5e1", borderRadius: 14, padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🧾</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
            {searchTerm ? "Nenhuma proposta encontrada" : "Você ainda não criou propostas"}
          </div>
          <div style={{ fontSize: 14, marginBottom: 16 }}>
            {searchTerm ? "Tente pesquisar por outro cliente, número ou CNPJ." : "Comece criando sua primeira proposta comercial com um clique."}
          </div>
          {!searchTerm && (
            <button
              onClick={onNew}
              style={{
                background: corPrimaria || "#1976D2",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              ➕ Criar primeira proposta
            </button>
          )}
        </div>
      )}

      {/* Conteúdo da lista */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          Carregando propostas...
        </div>
      )}

      {error && (
        <div style={{
          background: "#fee2e2",
          color: "#b91c1c",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24
        }}>
          ❌ Erro: {error}
        </div>
      )}

      {!loading && !error && filteredPropostas.length > 0 && (
        <div style={{ display: "grid", gap: 16 }}>
          {filteredPropostas.map((proposta) => (
            <div
              key={proposta.id}
              onClick={() => onLoad(proposta.dados, proposta.id)}
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                cursor: "pointer",
                border: "1px solid #e2e8f0",
                transition: "all 0.2s",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)"}
            >
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <span style={{
                    background: getStatusColor(proposta.dados?.status || "Rascunho"),
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: 20,
                    letterSpacing: 0.3
                  }}>
                    {proposta.dados?.status || "Rascunho"}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {formatDate(proposta.dados?.propostaData || proposta.created_at)}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                  {proposta.dados?.clienteNome || "Sem cliente"}
                </h3>
                <div style={{ fontSize: 13, color: "#475569" }}>
                  {proposta.proposta_numero && <span>Nº {proposta.proposta_numero} • </span>}
                  Atualizada em {new Date(proposta.updated_at || proposta.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={(e) => handleDelete(proposta.id, e)}
                  style={{
                    background: "none",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 12,
                    color: "#ef4444",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  🗑️
                </button>
                <span style={{ color: corPrimaria || "#1976D2", fontSize: 14 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
