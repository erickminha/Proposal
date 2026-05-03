import React, { useState, useMemo } from "react";
import { useApp } from "./contexts/AppContext";
import { useDataManagement } from "./hooks/useDataManagement";
import { formatters } from "./utils/formatters";
import { LoadingSpinner, ErrorMessage, StatusBadge, EmptyState } from "./components/UIComponents";

export default function ProposalList({ onNew, onLoad, onSignOut, corPrimaria, onBack, onOpenCandidates, onNewJobAd }) {
  const { user, organization } = useApp();
  const { useProposalList, useCandidateReportList } = useDataManagement();
  
  const [activeView, setActiveView] = useState("propostas");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filters for Candidate Reports
  const [candidateFilter, setCandidateFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { 
    data: propostas, 
    loading: loadingProposals, 
    error: errorProposals, 
    remove: deleteProposal 
  } = useProposalList(organization?.id);

  const { 
    data: candidateReports, 
    loading: loadingReports, 
    error: errorReports 
  } = useCandidateReportList(organization?.id);

  const filteredPropostas = useMemo(() => {
    if (!propostas) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return propostas;
    
    return propostas.filter((p) => {
      const clienteNome = p.dados?.clienteNome?.toLowerCase() || "";
      const propostaNumero = p.proposta_numero?.toLowerCase() || "";
      const cnpj = p.dados?.clienteCNPJ?.toLowerCase() || "";
      return clienteNome.includes(term) || propostaNumero.includes(term) || cnpj.includes(term);
    });
  }, [propostas, searchTerm]);

  const filteredCandidateReports = useMemo(() => {
    if (!candidateReports) return [];
    const candidateTerm = candidateFilter.trim().toLowerCase();
    const positionTerm = positionFilter.trim().toLowerCase();

    return candidateReports.filter((report) => {
      const candidateName = (report.candidate_name || "").toLowerCase();
      const positionName = (report.position_name || "").toLowerCase();
      const status = (report.status || "").toLowerCase();

      const matchCandidate = !candidateTerm || candidateName.includes(candidateTerm);
      const matchPosition = !positionTerm || positionName.includes(positionTerm);
      const matchStatus = !statusFilter || status === statusFilter;

      return matchCandidate && matchPosition && matchStatus;
    });
  }, [candidateReports, candidateFilter, positionFilter, statusFilter]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir esta proposta?")) return;
    await deleteProposal(id);
  };

  if (loadingProposals || loadingReports) return <LoadingSpinner fullPage label="Carregando dados..." />;
  if (errorProposals || errorReports) return <ErrorMessage message={errorProposals || errorReports} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', sans-serif", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Gestão Interna</h1>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>{user?.email} {organization ? `• ${organization.name}` : ""}</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onBack} style={{ background: "white", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>← Módulos</button>
          <button onClick={onNew} style={{ background: corPrimaria || "#1976D2", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>➕ Nova Proposta</button>
          <button onClick={onSignOut} style={{ background: "white", color: "#475569", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🚪 Sair</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={() => setActiveView("propostas")} style={{ background: activeView === "propostas" ? (corPrimaria || "#1976D2") : "white", color: activeView === "propostas" ? "white" : "#475569", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Propostas</button>
        <button onClick={() => setActiveView("pareceres")} style={{ background: activeView === "pareceres" ? (corPrimaria || "#1976D2") : "white", color: activeView === "pareceres" ? "white" : "#475569", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Pareceres Importados</button>
      </div>

      {activeView === "propostas" ? (
        <>
          <div style={{ marginBottom: 20 }}>
            <input type="text" placeholder="Buscar propostas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #e2e8f0" }} />
          </div>
          {filteredPropostas.length === 0 ? (
            <EmptyState title="Nenhuma proposta encontrada" description="Comece criando sua primeira proposta comercial." actionLabel="Nova Proposta" onAction={onNew} />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {filteredPropostas.map((p) => (
                <div key={p.id} onClick={() => onLoad(p.dados, p.id)} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{p.dados?.clienteNome || "Cliente sem nome"}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{p.proposta_numero} • {formatters.date(p.created_at)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <StatusBadge status={p.status} />
                    <button onClick={(e) => handleDelete(p.id, e)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <input type="text" placeholder="Candidato..." value={candidateFilter} onChange={(e) => setCandidateFilter(e.target.value)} style={{ padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <input type="text" placeholder="Cargo..." value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} style={{ padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <option value="">Todos os status</option>
              <option value="finalizado">Finalizado</option>
              <option value="rascunho">Rascunho</option>
            </select>
          </div>
          {filteredCandidateReports.length === 0 ? (
            <EmptyState title="Nenhum parecer encontrado" description="Os pareceres importados da sua planilha aparecerão aqui." />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {filteredCandidateReports.map((report) => (
                <div key={report.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{report.candidate_name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{report.position_name} • {report.company_name}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <StatusBadge status={report.status} />
                    {report.report_data?.doc_url && (
                      <a href={report.report_data.doc_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", fontSize: 18 }}>📄</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
