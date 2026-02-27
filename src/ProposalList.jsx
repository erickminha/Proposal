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
    
    if (error && error.message && error.message.includes("status")) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("propostas")
        .select("id, cliente_nome, proposta_numero, created_at, data_proposta")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!fallbackError) setProposals(fallbackData || []);
    } else if (!error) {
      setProposals(data || []);
    }
    setLoading(false);
  };

  const handleLoad = async (id) => {
    const { data, error } = await supabase
      .from("propostas")
      .select("dados")
      .eq("id", id)
      .single();
    if (!error && data) onLoad(data.dados, id);
  };

  const handleDuplicate = async (id) => {
    const { data, error } = await supabase
      .from("propostas")
      .select("dados")
      .eq("id", id)
      .single();
    if (!error && data) {
      const newData = { ...data.dados, propostaNumero: "" };
      onLoad(newData, null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Rascunho": { bg: "#f1f5f9", text: "#475569", emoji: "📝" },
      "Enviada": { bg: "#eff6ff", text: "#2563eb", emoji: "📤" },
      "Aceita": { bg: "#ecfdf5", text: "#059669", emoji: "✅" },
      "Recusada": { bg: "#fef2f2", text: "#dc2626", emoji: "❌" }
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

  const filtered = proposals.filter(p => {
    const searchLower = search.toLowerCase();
    const cliente = (p.cliente_nome || "").toLowerCase();
    const numero = (p.proposta_numero || "").toLowerCase();
    return cliente.includes(searchLower) || numero.includes(searchLower);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .card-hover { transition: all 0.2s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 20px rgba(0,0,0,0.08) !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "24px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: 24, color: "#0f172a", letterSpacing: "-0.02em" }}>Minhas Propostas</h1>
            <div style={{ fontSize: 14, color: "#64748b", marginTop: 4, fontWeight: 500 }}>
              {proposals.length} proposta{proposals.length !== 1 ? "s" : ""} no total
            </div>
          </div>
          <button onClick={onNew}
            style={{ background: corPrimaria, color: "white", border: "none", padding: "12px 24px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: `0 4px 12px ${corPrimaria}33`, transition: "all 0.2s" }}>
            + Nova Proposta
          </button>
        </div>

        {/* Search */}
        <div style={{ maxWidth: 800, margin: "24px auto 0", padding: "0 20px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por cliente ou número da proposta..."
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "14px 16px 14px 48px", fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: "#f8fafc", color: "#1e293b", transition: "all 0.2s" }} />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: "32px 20px", maxWidth: 800, margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
            <div className="spinner" style={{ margin: "0 auto 16px", width: 32, height: 32, borderWeight: 3 }} />
            <div style={{ fontWeight: 600 }}>Carregando suas propostas...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, background: "white", borderRadius: 20, border: "1px dashed #cbd5e1" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{search ? "🔍" : "📭"}</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
              {search ? "Nenhuma proposta encontrada" : "Comece agora mesmo!"}
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
              {search ? "Tente buscar por outro termo ou limpe o filtro." : "Crie sua primeira proposta comercial profissional em minutos."}
            </p>
            {!search && (
              <button onClick={onNew}
                style={{ background: corPrimaria, color: "white", border: "none", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                + Criar Minha Primeira Proposta
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {filtered.map(p => (
              <div key={p.id} className="card-hover" style={{
                background: "white", borderRadius: 16, padding: "20px 24px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)", 
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
                border: "1px solid #f1f5f9"
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.cliente_nome || "Cliente não informado"}
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                    {p.proposta_numero && (
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600, background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>
                        Nº {p.proposta_numero}
                      </span>
                    )}
                    <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
                      📅 {formatDate(p.created_at)}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                  <div style={{ 
                    background: getStatusColor(p.status).bg, 
                    color: getStatusColor(p.status).text, 
                    padding: "6px 12px", 
                    borderRadius: 8, 
                    fontSize: 12, 
                    fontWeight: 700, 
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <span>{getStatusColor(p.status).emoji}</span>
                    <span>{p.status || "Rascunho"}</span>
                  </div>
                  
                  <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 4px" }} />
                  
                  <button onClick={() => handleLoad(p.id)}
                    style={{ background: corPrimaria, color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
                    Abrir
                  </button>
                  
                  <button onClick={() => handleDuplicate(p.id)}
                    style={{ background: "white", color: "#64748b", border: "1px solid #e2e8f0", padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    title="Duplicar proposta">
                    📋
                  </button>
                  
                  <button onClick={() => setConfirmDelete(p.id)}
                    style={{ background: "white", color: "#ef4444", border: "1px solid #fee2e2", padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    title="Excluir">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "white", borderRadius: 24, padding: "32px", maxWidth: 400, width: "100%", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontWeight: 800, fontSize: 20, color: "#0f172a", marginBottom: 8 }}>Excluir Proposta?</h2>
            <p style={{ fontSize: 15, color: "#64748b", marginBottom: 32, lineHeight: 1.5 }}>
              Esta ação é permanente e não poderá ser desfeita. Tem certeza que deseja remover esta proposta?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: "14px", border: "1.5px solid #e2e8f0", borderRadius: 12, background: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", color: "#475569" }}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deleting === confirmDelete}
                style={{ flex: 1, padding: "14px", border: "none", borderRadius: 12, background: "#ef4444", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)" }}>
                {deleting === confirmDelete ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
