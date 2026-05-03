import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import Auth from "./Auth";
import ProposalList from "./ProposalList";
import JobAdBuilder from "./JobAdBuilder";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import CandidateList from "./CandidateList";
import ModuleHub from "./ModuleHub";
import { acceptInviteForUser, clearPendingInviteToken } from "./inviteAcceptance";
import { useApp } from "./contexts/AppContext";
import { useFormState } from "./hooks/useFormState";
import { useUtilities } from "./hooks/useUtilities";
import { supabaseService } from "./services/supabaseService";

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const defaultData = {
  empresaNome: "RGA Recursos Humanos",
  empresaSubtitulo: "RECURSOS HUMANOS",
  empresaEndereco: "Rua Das Águias, n. 960, bairro São Lázaro – CEP 69.073-140 – Manaus, Amazonas.",
  empresaCNPJ: "55.534.852/0001-50",
  empresaRazaoSocial: "INSTITUTO RGA",
  corPrimaria: "#1976D2",
  corSecundaria: "#E53935",
  propostaNumero: "",
  propostaValidade: "5 dias a contar desta data",
  propostaData: new Date().toISOString().split("T")[0],
  status: "Rascunho",
  clienteNome: "",
  clienteCNPJ: "",
  linkCandidaturaPublica: "",
  sourceCampaign: "anuncio-rga",
  introTexto: "Sabemos que suas vagas não são para qualquer um — cada posição fortalece sua equipe, aumenta a produtividade e consolida sua cultura.\n\nO desafio é encontrar esses profissionais sem desperdiçar tempo, dinheiro e recursos internos.\n\nA RGA Recursos Humanos resolve isso para você.\n\nNão apenas preenchemos vagas — garantimos contratações de qualidade que transformam sua empresa.",
  diferenciais: [
    { titulo: "Seleção de Precisão, Não de Volume", descricao: "Enquanto outros enviam dezenas de currículos genéricos, nós enviamos 3 candidatos pré-aprovados e altamente qualificados por vaga. Cada um passou por:", itens: ["Análise comportamental profunda", "Testes de perfil e competências", "Verificação de referências profissionais", "Checagem de antecedentes criminais"], resultado: "Candidatos que não apenas têm o perfil técnico, mas que se alinham à sua cultura e prosperam na sua organização." },
    { titulo: "Velocidade Sem Comprometer a Qualidade", descricao: "7 dias úteis. Esse é nosso compromisso para entregar candidatos qualificados. Enquanto você economiza semanas de processo seletivo interno, nós fazemos o trabalho pesado.", itens: [], resultado: "" },
    { titulo: "Garantia de Satisfação: 30 Dias", descricao: "Se o profissional contratado não se adaptar nos primeiros 30 dias, fazemos a reposição sem custos adicionais. Sua tranquilidade é nossa responsabilidade.", itens: [], resultado: "" },
    { titulo: "Investimento Inteligente", descricao: "Você paga apenas pelo sucesso. Sem taxas ocultas. Sem compromissos longos. Apenas resultados.", itens: [], resultado: "" },
  ],
  etapas: [
    { numero: "1", etapa: "Alinhamento Estratégico", descricao: "Analisamos o perfil ideal da vaga e os objetivos do seu negócio" },
    { numero: "2", etapa: "Prospecção Ativa", descricao: "Divulgamos a vaga nos canais mais eficazes e buscamos ativamente os melhores talentos" },
    { numero: "3", etapa: "Triagem Rigorosa", descricao: "Selecionamos apenas os currículos que realmente se encaixam" },
    { numero: "4", etapa: "Avaliação Comportamental", descricao: "Entrevistas e testes para garantir alinhamento cultural e competências" },
    { numero: "5", etapa: "Verificação Completa", descricao: "Referências profissionais e antecedentes criminais" },
    { numero: "6", etapa: "Apresentação Final", descricao: "Você recebe 3 candidatos pré-aprovados, prontos para contratar" },
  ],
  niveis: [
    { nivel: "Operacional", exemplos: "Auxiliar de limpeza, atendente, etc.", percentual: "40% do salário" },
    { nivel: "Administrativo", exemplos: "Auxiliar administrativo, etc.", percentual: "50% do salário" },
    { nivel: "Liderança", exemplos: "Gerente, supervisor, etc.", percentual: "60% do salário" },
  ],
  tributos: "15% sobre o valor total da Nota Fiscal",
  formaPagamento: "Na aprovação do candidato (fechamento da vaga)",
  formaPix: "PIX ou boleto",
  proximosPassos: "Estamos prontos para começar. Basta confirmar as vagas que você deseja preencher e nós colocamos em ação nossa metodologia comprovada.\n\nSeu próximo grande talento está a apenas 7 dias de distância.\n\nAguardamos seu retorno para iniciarmos essa parceria de sucesso.",
  generatedArtMetadata: [],
};

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function FInput({ value, onChange, placeholder, type = "text", mask }) {
  const [isFocused, setIsFocused] = useState(false);
  const handleChange = (e) => {
    let val = e.target.value;
    if (mask === "cnpj") {
      val = val.replace(/\D/g, "").slice(0, 14);
      val = val.replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
    }
    onChange({ ...e, target: { ...e.target, value: val } });
  };
  return (
    <input 
      type={type} 
      value={value} 
      onChange={handleChange} 
      placeholder={placeholder}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{ 
        width: "100%", 
        border: `1.5px solid ${isFocused ? "#3b82f6" : "#e2e8f0"}`, 
        borderRadius: 8, 
        padding: "12px 14px", 
        fontSize: 14, 
        fontFamily: "inherit", 
        outline: "none", 
        color: "#1e293b", 
        transition: "all 0.2s ease",
        boxShadow: isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
        boxSizing: "border-box" 
      }} 
    />
  );
}

function FTextarea({ value, onChange, rows = 3 }) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <textarea 
      value={value} 
      onChange={onChange} 
      rows={rows}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{ 
        width: "100%", 
        border: `1.5px solid ${isFocused ? "#3b82f6" : "#e2e8f0"}`, 
        borderRadius: 8, 
        padding: "12px 14px", 
        fontSize: 14, 
        fontFamily: "inherit", 
        outline: "none", 
        color: "#1e293b", 
        resize: "vertical", 
        transition: "all 0.2s ease",
        boxShadow: isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
        boxSizing: "border-box" 
      }} 
    />
  );
}

// ─── EDITOR SHELL ─────────────
function EditorShell({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#f8fafc" }}>
      {children}
    </div>
  );
}

// ─── PROPOSAL PAGE WRAPPER ───────────────────────────────────────────────────
function ProposalPage({ data, logoSrc, children, isCapa = false, showSignature = false }) {
  return (
    <div className={`print-page ${isCapa ? "print-page-cover" : ""}`} style={{
      background: "white", width: "100%", maxWidth: 794, minHeight: 1123,
      boxShadow: "0 10px 25px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
      fontSize: "14px"
    }}>
      {!isCapa && <div style={{ height: 10, background: data.corPrimaria }} />}
      <div style={{ padding: isCapa ? "0" : "24px 64px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: isCapa ? "none" : "1px solid #f1f5f9" }}>
        {!isCapa && (
          <>
            {logoSrc
              ? <img src={logoSrc} style={{ height: 40, objectFit: "contain" }} alt="Logo" />
              : <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: data.corPrimaria, letterSpacing: 1 }}>{data.empresaNome.split(" ")[0]}</div>
                  <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.2em", color: "#64748b" }}>{data.empresaSubtitulo}</div>
                </div>
            }
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8" }}>PROPOSTA COMERCIAL</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: data.corPrimaria }}>{data.propostaNumero || "—"}</div>
            </div>
          </>
        )}
      </div>
      <div style={{ flex: 1, padding: isCapa ? "0" : "32px 64px", display: "flex", flexDirection: "column" }}>{children}</div>
      {!isCapa && (
        <div className="print-footer" style={{ background: "#f8fafc", padding: "12px 64px", textAlign: "center", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 9, color: "#0f172a", fontWeight: 800 }}>RGA Consultoria de RH</div>
          <div style={{ fontSize: 8, color: "#475569", marginTop: 2, fontWeight: 700 }}>{data.empresaNome}</div>
          <div style={{ fontSize: 8, color: "#94a3b8", marginTop: 2 }}>{data.empresaEndereco}</div>
          {showSignature && (
            <div className="print-signature" style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed #cbd5e1" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: "#1e293b" }}>RGA Consultoria de RH</div>
              <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>Assinatura digital de proposta</div>
            </div>
          )}
        </div>
      )}
      {!isCapa && <div style={{ height: 6, background: data.corPrimaria }} />}
    </div>
  );
}

// ─── PREVIEW (3 pages) ────────────────────────────────────────────────────────
function PreviewContent({ data, logoSrc, publicApplicationUrl, publicApplicationQrUrl }) {
  return (
    <div className="preview-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "32px 16px" }}>
      {/* PAGE 1: CAPA */}
      <ProposalPage data={data} logoSrc={logoSrc} isCapa={true}>
        <div style={{ height: 12, background: data.corPrimaria, width: "100%" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 64px" }}>
          {logoSrc ? <img src={logoSrc} style={{ maxWidth: 300, maxHeight: 240, objectFit: "contain", marginBottom: 48 }} alt="Logo capa" />
            : <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div style={{ fontSize: 72, fontWeight: 900, color: data.corPrimaria, letterSpacing: 4 }}>{data.empresaNome.split(" ")[0]}</div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.4em", color: "#475569", marginTop: 8 }}>{data.empresaSubtitulo}</div>
              </div>}
          
          <div style={{ alignSelf: "stretch", marginTop: 40 }}>
            <div style={{ background: data.corPrimaria, padding: "48px 64px", borderRadius: "4px 0 0 4px", position: "relative", right: -64 }}>
              <div style={{ fontSize: 42, fontWeight: 900, color: "white", letterSpacing: 4 }}>PROPOSTA</div>
              <div style={{ fontSize: 42, fontWeight: 900, color: "white", letterSpacing: 4 }}>COMERCIAL</div>
            </div>
            <div style={{ display: "flex", marginTop: 4, gap: 4, justifyContent: "flex-end", position: "relative", right: -64 }}>
              <div style={{ background: data.corPrimaria, height: 12, width: "30%" }} />
              <div style={{ background: data.corSecundaria, height: 12, width: "15%" }} />
            </div>
          </div>
        </div>
        <div style={{ padding: "48px 64px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: data.corPrimaria, marginBottom: 8 }}>PREPARADO PARA:</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{data.clienteNome || "Sua Empresa"}</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 8, fontWeight: 600 }}>Nº {data.propostaNumero || "—"} • {new Date(data.propostaData).toLocaleDateString('pt-BR')}</div>
        </div>
      </ProposalPage>

      {/* PAGE 2: APRESENTAÇÃO E DIFERENCIAIS */}
      <ProposalPage data={data} logoSrc={logoSrc} showSignature={true}>
        <div style={{ fontSize: 12, fontWeight: 800, color: data.corPrimaria, marginBottom: 20, letterSpacing: 1 }}>01. APRESENTAÇÃO</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "#1e293b" }}>À {data.clienteNome || "—"};</div>
        <div style={{ height: 2, width: 40, background: data.corSecundaria, marginBottom: 16 }} />
        
        {data.introTexto.split("\n\n").map((p, i) => (
          <p key={i} style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12, color: "#334155", textAlign: "justify" }}>{p}</p>
        ))}

        <div style={{ fontSize: 12, fontWeight: 800, color: data.corPrimaria, marginTop: 32, marginBottom: 20, letterSpacing: 1 }}>02. POR QUE A RGA? 🚀</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {data.diferenciais.slice(0, 4).map((d, i) => (
            <div key={i} style={{ background: "#f8fafc", padding: 16, borderRadius: 8, borderLeft: `3px solid ${data.corPrimaria}` }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#0f172a", marginBottom: 6 }}>{d.titulo}</div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{d.descricao}</div>
            </div>
          ))}
        </div>
      </ProposalPage>

      {/* PAGE 3: METODOLOGIA, INVESTIMENTO E FECHAMENTO */}
      <ProposalPage data={data} logoSrc={logoSrc}>
        <div style={{ fontSize: 12, fontWeight: 800, color: data.corPrimaria, marginBottom: 20, letterSpacing: 1 }}>03. METODOLOGIA 📋</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {data.etapas.map((e, i) => (
            <div key={i} style={{ flex: "1 1 30%", background: "white", border: "1px solid #e2e8f0", padding: 10, borderRadius: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 18, height: 18, background: data.corPrimaria, color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900 }}>{i+1}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#0f172a" }}>{e.etapa}</div>
              </div>
              <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.3 }}>{e.descricao}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 800, color: data.corPrimaria, marginBottom: 16, letterSpacing: 1 }}>04. INVESTIMENTO 💰</div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, fontSize: 13 }}>
          <thead>
            <tr style={{ background: data.corPrimaria, color: "white" }}>
              <th style={{ padding: "10px 16px", textAlign: "left", borderRadius: "6px 0 0 0" }}>Nível da Vaga</th>
              <th style={{ padding: "10px 16px", textAlign: "left" }}>Exemplos</th>
              <th style={{ padding: "10px 16px", textAlign: "right", borderRadius: "0 6px 0 0" }}>Investimento</th>
            </tr>
          </thead>
          <tbody>
            {data.niveis.map((n, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: "#1e293b" }}>{n.nivel}</td>
                <td style={{ padding: "10px 16px", color: "#64748b", fontSize: 11 }}>{n.exemplos}</td>
                <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 800, color: data.corPrimaria }}>{n.percentual}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ background: "#f1f5f9", padding: 16, borderRadius: 8, marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ fontSize: 11, color: "#475569" }}>
            <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Condições:</div>
            <div>• Pagamento: {data.formaPagamento}</div>
            <div>• Tributos: {data.tributos}</div>
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>
            <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>Validade:</div>
            <div>{data.propostaValidade}</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: data.corPrimaria, marginBottom: 8 }}>PRÓXIMOS PASSOS</div>
          <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{data.proximosPassos.split("\n\n")[0]}</p>
        </div>

        <div style={{ marginTop: 20, border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12, background: "#f8fafc" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: data.corPrimaria, marginBottom: 4 }}>CANDIDATURA PÚBLICA</div>
            <div style={{ fontSize: 11, color: "#334155", marginBottom: 4, wordBreak: "break-all" }}>{publicApplicationUrl}</div>
            <div style={{ fontSize: 10, color: "#64748b" }}>
              source_campaign: {data.sourceCampaign || "direct"}
            </div>
          </div>
          <img src={publicApplicationQrUrl} alt="QR code para candidatura" style={{ width: 86, height: 86, borderRadius: 8, border: "1px solid #cbd5e1", background: "white", padding: 4 }} />
        </div>

        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ height: 1, background: "#cbd5e1", marginBottom: 8 }} />
            <div style={{ fontSize: 11, fontWeight: 800 }}>{data.empresaRazaoSocial}</div>
            <div style={{ fontSize: 9, color: "#94a3b8" }}>CONTRATADA</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ height: 1, background: "#cbd5e1", marginBottom: 8 }} />
            <div style={{ fontSize: 11, fontWeight: 800 }}>{data.clienteNome || "CONTRATANTE"}</div>
            <div style={{ fontSize: 9, color: "#94a3b8" }}>CONTRATANTE</div>
          </div>
        </div>
      </ProposalPage>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const { user, organization, userRole, addNotification, logout } = useApp();
  const [authChecked, setAuthChecked] = useState(false);
  const [screen, setScreen] = useState("hub");
  const [tab, setTab] = useState("empresa");
  const [logoSrc, setLogoSrc] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [previewMode, setPreviewMode] = useState("completa");
  const [exportResolution, setExportResolution] = useState("web");
  const logoRef = useRef();
  const { isMobile } = useUtilities();
  const navigate = useNavigate();

  // Form State with Auto-save
  const { 
    data, 
    setField, 
    setFields, 
    saving, 
    saveMsg, 
    handleSaveManual, 
    reset: resetForm 
  } = useFormState(defaultData, async (formData) => {
    if (!user) return;
    const payload = {
      user_id: user.id,
      organization_id: organization?.id || null,
      cliente_nome: formData.clienteNome,
      proposta_numero: formData.propostaNumero,
      data_proposta: formData.propostaData || null,
      dados: formData,
      status: formData.status || "Rascunho"
    };
    
    if (savedId) {
      return await supabaseService.proposals.update(savedId, payload);
    } else {
      const result = await supabaseService.proposals.create(payload);
      if (result.data) setSavedId(result.data.id);
      return result;
    }
  });

  // Check auth on load
  useEffect(() => {
    if (user) {
      setAuthChecked(true);
      acceptInviteForUser(user).then(accepted => {
        if (accepted) clearPendingInviteToken();
      });
    } else {
      // Wait for AppContext to load user
      const timer = setTimeout(() => setAuthChecked(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const generateProposalNumber = async () => {
    const currentYear = new Date().getFullYear();
    const { data: pData, error } = await supabase
      .from("propostas")
      .select("proposta_numero")
      .eq("user_id", user.id)
      .like("proposta_numero", `%/${currentYear}`)
      .order("created_at", { ascending: false })
      .limit(1);
    
    let nextNumber = 1;
    if (!error && pData && pData.length > 0) {
      const lastNumber = pData[0].proposta_numero;
      const match = lastNumber.match(/(\d+)\/(\d+)/);
      if (match) nextNumber = parseInt(match[1]) + 1;
    }
    return `${nextNumber}/${currentYear}`;
  };

  const handleNew = async () => {
    const newProposalNumber = await generateProposalNumber();
    resetForm({ ...defaultData, propostaNumero: newProposalNumber });
    setSavedId(null);
    setScreen("editor");
  };

  const handleLoad = (dados, id = null) => {
    setFields({ ...defaultData, ...dados, generatedArtMetadata: Array.isArray(dados?.generatedArtMetadata) ? dados.generatedArtMetadata : [] });
    setSavedId(id);
    setScreen("editor");
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const updateDiferencial = (i, field, val) => setField("diferenciais", data.diferenciais.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  const updateDiferencialItem = (di, ii, val) => setField("diferenciais", data.diferenciais.map((d, idx) => {
    if (idx !== di) return d;
    return { ...d, itens: d.itens.map((it, jdx) => jdx === ii ? val : it) };
  }));
  const updateEtapa = (i, field, val) => setField("etapas", data.etapas.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  const updateNivel = (i, field, val) => setField("niveis", data.niveis.map((n, idx) => idx === i ? { ...n, [field]: val } : n));
  
  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  if (!authChecked) return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Carregando...</div>;
  if (!user) return <Auth onAuthSuccess={() => setScreen("hub")} />;

  if (screen === "hub") {
    return <ModuleHub user={user} role={userRole} onOpenModule={(id) => setScreen(id === "propostas" ? "list" : id)} onSignOut={handleSignOut} />;
  }

  if (screen === "list") {
    return (
      <ProposalList 
        user={user} 
        organizationId={organization?.id} 
        onNew={handleNew} 
        onLoad={handleLoad} 
        onSignOut={handleSignOut} 
        corPrimaria={data.corPrimaria}
        onBack={() => setScreen("hub")}
        onOpenCandidates={() => setScreen("candidaturas")}
        onNewJobAd={() => setScreen("job-ad")}
      />
    );
  }

  if (screen === "candidaturas") {
    return <CandidateList user={user} corPrimaria={data.corPrimaria} onBackToProposals={() => setScreen("list")} onSignOut={handleSignOut} />;
  }

  if (screen === "job-ad") {
    return <JobAdBuilder user={user} onBack={() => setScreen("hub")} />;
  }

  // Editor Screen
  return (
    <EditorShell>
      {/* Editor UI implementation remains similar but using data/setField from useFormState */}
      <div style={{ padding: 20, background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => setScreen("list")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>←</button>
          <h2 style={{ margin: 0, fontSize: 18 }}>Editor de Proposta</h2>
          {saveMsg && <span style={{ fontSize: 12, color: "#64748b" }}>{saveMsg}</span>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSaveManual} disabled={saving} style={{ background: data.corPrimaria, color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}>
            {saving ? "Salvando..." : "Salvar Agora"}
          </button>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "400px 1fr", flex: 1, overflow: "hidden" }}>
        <aside style={{ padding: 20, borderRight: "1px solid #e2e8f0", overflowY: "auto", background: "white" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
            {["empresa", "cliente", "serviços"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "#f1f5f9" : "none", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontWeight: tab === t ? 700 : 400, textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>

          {tab === "empresa" && (
            <>
              <FieldGroup label="Logo da Empresa">
                <input type="file" ref={logoRef} onChange={handleLogo} style={{ display: "none" }} />
                <button onClick={() => logoRef.current.click()} style={{ width: "100%", padding: 12, border: "2px dashed #cbd5e1", borderRadius: 8, background: "#f8fafc", cursor: "pointer" }}>
                  {logoSrc ? "Alterar Logo" : "Upload Logo"}
                </button>
              </FieldGroup>
              <FieldGroup label="Nome da Empresa"><FInput value={data.empresaNome} onChange={e => setField("empresaNome", e.target.value)} /></FieldGroup>
              <FieldGroup label="Cores"><div style={{ display: "flex", gap: 10 }}><input type="color" value={data.corPrimaria} onChange={e => setField("corPrimaria", e.target.value)} /><input type="color" value={data.corSecundaria} onChange={e => setField("corSecundaria", e.target.value)} /></div></FieldGroup>
            </>
          )}

          {tab === "cliente" && (
            <>
              <FieldGroup label="Nome do Cliente"><FInput value={data.clienteNome} onChange={e => setField("clienteNome", e.target.value)} /></FieldGroup>
              <FieldGroup label="CNPJ do Cliente"><FInput value={data.clienteCNPJ} mask="cnpj" onChange={e => setField("clienteCNPJ", e.target.value)} /></FieldGroup>
              <FieldGroup label="Número da Proposta"><FInput value={data.propostaNumero} onChange={e => setField("propostaNumero", e.target.value)} /></FieldGroup>
            </>
          )}

          {tab === "serviços" && (
            <>
              <FieldGroup label="Texto de Introdução"><FTextarea value={data.introTexto} onChange={e => setField("introTexto", e.target.value)} rows={6} /></FieldGroup>
              {/* Add more fields as needed */}
            </>
          )}
        </aside>

        <main style={{ padding: 40, overflowY: "auto", display: "flex", justifyContent: "center", background: "#f1f5f9" }}>
          <PreviewContent data={data} logoSrc={logoSrc} publicApplicationUrl={data.linkCandidaturaPublica} publicApplicationQrUrl={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.linkCandidaturaPublica || "https://rga.rh")}`} />
        </main>
      </div>
    </EditorShell>
  );
}
