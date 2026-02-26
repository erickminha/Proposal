import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function ProposalList({ user, onNew, onLoad, corPrimaria = "#1976D2" }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchProposals(); }, []);

  const fetchProposals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("propostas")
      .select("id, cliente_nome, proposta_numero, created_at, data_proposta, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setProposals(data || []);
    setLoading(false);
  };

  const handleLoad = async (id) => {
    const { data, error } = await supabase
      .from("propostas")
      .select("dados")
      .eq("id", id)
      .single();
    if (!error && data) onLoad(data.dados);
  };

  const handleDuplicate = async (id) => {
    const { data, error } = await supabase
      .from("propostas")
      .select("dados")
      .eq("id", id)
      .single();
    if (!error && data) {
      const newData = { ...data.dados, propostaNumero: "" };
      onLoad(newData);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Rascunho": { bg: "#f5f5f5", text: "#666", emoji: "📝" },
      "Enviada": { bg: "#e3f2fd", text: "#1976d2", emoji: "📤" },
      "Aceita": { bg: "#e8f5e9", text: "#388e3c", emoji: "✅" },
      "Recusada": { bg: "#ffebee", text: "#c62828", emoji: "❌" }
    };
    return colors[status] || colors["Rascunho"];
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    await supabase.from("propostas").delete().eq("id", id);
    setProposals(p => p.filter(x => x.id !== id));
    setDeleting(null);
    setConfirmDelete(null);
  };

  const filtered = proposals.filter(p =>
    p.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
    p.proposta_numero?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI', Calibri, sans-serif" }}>

      {/* Header */}
      <div style={{ background: corPrimaria, padding: "0 0 0 0" }}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "white" }}>📋 Minhas Propostas</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{proposals.length} proposta{proposals.length !== 1 ? "s" : ""} salva{proposals.length !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={onNew}
            style={{ background: "white", color: corPrimaria, border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            + Nova Proposta
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "0 20px 16px" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Buscar por cliente ou nº da proposta..."
            style={{ width: "100%", border: "none", borderRadius: 10, padding: "11px 16px", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.15)", color: "white", "::placeholder": { color: "rgba(255,255,255,0.6)" } }} />
        </div>
      </div>

      {/* List */}
      <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            <div>Carregando propostas...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#aaa" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{search ? "🔍" : "📭"}</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
              {search ? "Nenhuma proposta encontrada" : "Nenhuma proposta salva ainda"}
            </div>
            <div style={{ fontSize: 13 }}>
              {search ? "Tente outro termo de busca" : "Crie sua primeira proposta!"}
            </div>
            {!search && (
              <button onClick={onNew}
                style={{ marginTop: 20, background: corPrimaria, color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                + Criar proposta
              </button>
            )}
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} style={{
              background: "white", borderRadius: 12, padding: "16px 18px", marginBottom: 12,
              boxShadow: "0 2px 10px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.cliente_nome || "Cliente não informado"}
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  {p.proposta_numero && (
                    <span style={{ fontSize: 12, color: "#888" }}>Nº {p.proposta_numero}</span>
                  )}
                  <span style={{ fontSize: 12, color: "#aaa" }}>Salva em {formatDate(p.created_at)}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                {p.status && (
                  <div style={{ ...getStatusColor(p.status), padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                    {getStatusColor(p.status).emoji} {p.status}
                  </div>
                )}
                <button onClick={() => handleLoad(p.id)}
                  style={{ background: corPrimaria, color: "white", border: "none", padding: "8px 16px", borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Abrir
                </button>
                <button onClick={() => handleDuplicate(p.id)}
                  style={{ background: "#f0f0f0", color: "#666", border: "1px solid #ddd", padding: "8px 12px", borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  title="Duplicar proposta">
                  📋
                </button>
                <button onClick={() => setConfirmDelete(p.id)}
                  style={{ background: "#fff0f0", color: "#c00", border: "1px solid #fcc", padding: "8px 12px", borderRadius: 7, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "white", borderRadius: 14, padding: "28px 24px", maxWidth: 320, width: "100%", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Excluir proposta?</div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>Esta ação não pode ser desfeita.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: "11px 0", border: "1px solid #ddd", borderRadius: 8, background: "white", fontWeight: 600, fontSize: 14, cursor: "pointer", color: "#555" }}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deleting === confirmDelete}
                style={{ flex: 1, padding: "11px 0", border: "none", borderRadius: 8, background: "#c00", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {deleting === confirmDelete ? "..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
