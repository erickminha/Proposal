import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function ProposalList({ user, onNew, onLoad, onSignOut, corPrimaria }) {
  const [propostas, setPropostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchPropostas();
  }, [user]);

  const fetchPropostas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("propostas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPropostas(data || []);
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
      const { error } = await supabase.from("propostas").delete().eq("id", id);
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Inter', sans-serif",
      padding: "24px"
    }}>
      {/* Cabeçalho com título e botão de logout */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
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

      {!loading && !error && propostas.length === 0 && (
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: 60,
          textAlign: "center",
          color: "#94a3b8",
          border: "2px dashed #e2e8f0"
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#334155", marginBottom: 8 }}>
            Nenhuma proposta ainda
          </h3>
          <p style={{ marginBottom: 24 }}>
            Clique em "Nova Proposta" para começar a criar suas propostas comerciais.
          </p>
          <button
            onClick={onNew}
            style={{
              background: corPrimaria || "#1976D2",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Criar primeira proposta
          </button>
        </div>
      )}

      {!loading && !error && propostas.length > 0 && (
        <div style={{ display: "grid", gap: 16 }}>
          {propostas.map((proposta) => (
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
