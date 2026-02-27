import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";
import Auth from "./Auth";
import ProposalList from "./ProposalList";

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
};

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

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

// ─── PROPOSAL PAGE WRAPPER ───────────────────────────────────────────────────
function ProposalPage({ data, logoSrc, children }) {
  return (
    <div className="print-page" style={{
      background: "white", width: "100%", maxWidth: 794, minHeight: "297mm", height: "auto",
      boxShadow: "0 10px 25px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column",
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      fontSize: 13,
      position: "relative",
      overflow: "visible"
    }}>
      <div style={{ height: 10, background: data.corPrimaria }} />
      <div style={{ padding: "32px 64px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9" }}>
        {logoSrc
          ? <img src={logoSrc} style={{ height: 45, objectFit: "contain" }} />
          : <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: data.corPrimaria, letterSpacing: 2 }}>{data.empresaNome.split(" ")[0]}</div>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: "#64748b" }}>{data.empresaSubtitulo}</div>
            </div>
        }
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8" }}>PROPOSTA COMERCIAL</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: data.corPrimaria }}>{data.propostaNumero || "—"}</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "40px 56px", display: "flex", flexDirection: "column" }}>{children}</div>
      <div style={{ background: "#f8fafc", padding: "16px 64px", textAlign: "center", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>{data.empresaNome}</div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{data.empresaEndereco}</div>
      </div>
      <div style={{ height: 6, background: data.corPrimaria }} />
    </div>
  );
}

// ─── PREVIEW (3 pages) ────────────────────────────────────────────────────────
function PreviewContent({ data, logoSrc, containerRef }) {
  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "32px 16px" }}>
      {/* PAGE 1: CAPA */}
      <ProposalPage data={data} logoSrc={logoSrc}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 0 }}>
          {logoSrc ? <img src={logoSrc} style={{ maxWidth: 280, maxHeight: 200, objectFit: "contain", marginBottom: 24 }} />
            : <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: data.corPrimaria, letterSpacing: 4 }}>{data.empresaNome.split(" ")[0]}</div>
                <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "0.4em", color: "#475569", marginTop: 8 }}>{data.empresaSubtitulo}</div>
              </div>}
        </div>
        <div style={{ alignSelf: "stretch", marginBottom: 44 }}>
          <div style={{ background: data.corPrimaria, padding: "40px 56px", borderRadius: "4px 0 0 4px", position: "relative", right: -56 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "white", letterSpacing: 4 }}>PROPOSTA</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: "white", letterSpacing: 4 }}>COMERCIAL</div>
          </div>
          <div style={{ background: data.corSecundaria, height: 16, width: "48%", marginLeft: "auto", marginTop: 0, borderRadius: "0 0 0 4px" }} />
        </div>
      </ProposalPage>

      {/* PAGE 2: INTRODUÇÃO */}
      <ProposalPage data={data} logoSrc={logoSrc}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: data.corPrimaria, marginBottom: 28, letterSpacing: 1 }}>APRESENTAÇÃO</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: "#1e293b" }}>À {data.clienteNome || "—"};</div>
          <div style={{ height: 2, width: 40, background: data.corSecundaria, marginBottom: 24 }} />
          
          {data.introTexto.split("\n\n").map((p, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.75, marginBottom: 14, color: "#334155", textAlign: "justify" }}>{p}</p>
          ))}
          
          <div style={{ fontWeight: 800, fontSize: 15, marginTop: 28, marginBottom: 16, color: data.corPrimaria, letterSpacing: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden="true">⭐</span> POR QUE A {data.empresaNome.toUpperCase().split(" ")[0]}?
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {data.diferenciais.slice(0, 4).map((d, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: data.corPrimaria }}>●</span> {d.titulo}
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.5, color: "#64748b" }}>{d.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </ProposalPage>

      {/* PAGE 3: METODOLOGIA E INVESTIMENTO */}
      <ProposalPage data={data} logoSrc={logoSrc}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: data.corPrimaria, marginBottom: 20, letterSpacing: 1, display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden="true">📊</span> METODOLOGIA E INVESTIMENTO
          </div>
          
          <div style={{ background: "#f8fafc", padding: 20, borderRadius: 8, marginBottom: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: "#1e293b" }}>Como funciona nosso processo:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {data.etapas.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <div style={{ background: data.corPrimaria, color: "white", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{e.numero}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{e.etapa}</div>
                    <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.35 }}>{e.descricao}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#1e293b" }}>Tabela de Investimento:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16, fontSize: 13 }}>
            <thead>
              <tr style={{ background: data.corPrimaria }}>
                <th style={{ color: "white", padding: "12px 16px", textAlign: "left", fontWeight: 700, borderRadius: "6px 0 0 0" }}>Nível da Vaga</th>
                <th style={{ color: "white", padding: "12px 16px", textAlign: "right", fontWeight: 700, borderRadius: "0 6px 0 0" }}>Investimento</th>
              </tr>
            </thead>
            <tbody>
              {data.niveis.map((n, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f1f5f9" }}>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", color: "#334155" }}>
                    <span style={{ fontWeight: 700 }}>{n.nivel}</span> <span style={{ fontSize: 11, color: "#64748b" }}>({n.exemplos})</span>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: 800, color: data.corPrimaria }}>{n.percentual}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 28 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#1e293b" }}>Condições Comerciais</div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
                <div>• Pagamento: {data.formaPagamento}</div>
                <div>• Forma: {data.formaPix}</div>
                <div>• Validade: {data.propostaValidade}</div>
              </div>
            </div>
            <div style={{ background: "#f1f5f9", padding: "12px 20px", borderRadius: 6, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Tributos</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{data.tributos}</div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: data.corPrimaria, marginBottom: 14, letterSpacing: 1 }}>PRÓXIMOS PASSOS</div>
          {data.proximosPassos.split("\n\n").map((p, i) => (
            <p key={i} style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10, color: "#334155" }}>{p}</p>
          ))}
          </div>
        
        <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ height: 1, background: "#cbd5e1", marginBottom: 12 }} />
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>{data.empresaRazaoSocial}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>CONTRATADA • CNPJ: {data.empresaCNPJ}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ height: 1, background: "#cbd5e1", marginBottom: 12 }} />
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>{data.clienteNome || "CONTRATANTE"}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>CONTRATANTE • CNPJ: {data.clienteCNPJ || "—"}</div>
          </div>
        </div>
        </div>
      </ProposalPage>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [screen, setScreen] = useState("list"); // "list" | "editor"
  const [data, setData] = useState({ ...defaultData });
  const [tab, setTab] = useState("empresa");
  const [mobileScreen, setMobileScreen] = useState("form");
  const [logoSrc, setLogoSrc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [savedId, setSavedId] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const logoRef = useRef();
  const autoSaveTimerRef = useRef(null);
  const previewRef = useRef(null);
  const isMobile = useIsMobile();

  // Check auth on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => {
      subscription.unsubscribe();
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  const set = (key, val) => {
    setData(d => ({ ...d, [key]: val }));
    if (autoSaveEnabled && savedId) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true);
      }, 3000);
    }
  };

  const handleSaveManual = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    await handleSave();
  };

  const handleSave = async (isAutoSave = false) => {
    setSaving(true);
    if (!isAutoSave) setSaveMsg("");
    
    const payload = {
      user_id: user.id,
      cliente_nome: data.clienteNome,
      proposta_numero: data.propostaNumero,
      data_proposta: data.propostaData || null,
      dados: data,
    };
    
    if (data.status) {
      payload.status = data.status;
    }

    let result;
    if (savedId) {
      result = await supabase.from("propostas").update(payload).eq("id", savedId).select().single();
    } else {
      result = await supabase.from("propostas").insert(payload).select().single();
    }
    
    setSaving(false);
    if (result.error) {
      setSaveMsg("❌ Erro ao salvar: " + result.error.message);
    } else {
      if (!savedId) setSavedId(result.data.id);
      setSaveMsg(isAutoSave ? "✓ Auto-salvo" : "✅ Proposta Salva!");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

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
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }
    return `${nextNumber}/${currentYear}`;
  };

  const handleNew = async () => {
    const newProposalNumber = await generateProposalNumber();
    setData({ ...defaultData, propostaNumero: newProposalNumber });
    setSavedId(null);
    setSaveMsg("");
    setScreen("editor");
  };

  const handleLoad = (dados, id = null) => {
    setData(dados);
    setSavedId(id);
    setSaveMsg("");
    setScreen("editor");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen("list");
  };

  const updateDiferencial = (i, field, val) => set("diferenciais", data.diferenciais.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  const updateDiferencialItem = (di, ii, val) => set("diferenciais", data.diferenciais.map((d, idx) => {
    if (idx !== di) return d;
    return { ...d, itens: d.itens.map((it, jdx) => jdx === ii ? val : it) };
  }));
  const updateEtapa = (i, field, val) => set("etapas", data.etapas.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  const updateNivel = (i, field, val) => set("niveis", data.niveis.map((n, idx) => idx === i ? { ...n, [field]: val } : n));
  
  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: "empresa", label: "🏢 Empresa" },
    { id: "cliente", label: "👤 Cliente" },
    { id: "diferenciais", label: "✅ Diferenciais" },
    { id: "etapas", label: "📋 Etapas" },
    { id: "investimento", label: "💰 Investimento" },
  ];

  // ── Render ──
  if (!authChecked) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
        <div className="spinner" /> Carregando sistema...
      </div>
    </div>
  );

  if (!user) return <Auth onLogin={(u) => { setUser(u); setScreen("list"); }} />;

  if (screen === "list") return (
    <ProposalList
      user={user}
      onNew={handleNew}
      onLoad={handleLoad}
      corPrimaria={data.corPrimaria}
    />
  );

  // ── EDITOR SCREEN ──

  const handleExportDoc = () => {
    if (!previewRef.current) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Proposta</title><style>body{margin:0;background:#fff;} .print-page{page-break-after:always;} .print-page:last-child{page-break-after:auto;}</style></head><body>${previewRef.current.innerHTML}</body></html>`;
    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `proposta-${(data.propostaNumero || data.clienteNome || "rga").toString().replace(/\s+/g, "-").toLowerCase()}.doc`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const formContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", overflowX: "auto", background: "white", WebkitOverflowScrolling: "touch", padding: "0 8px" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ 
              padding: "16px 16px", 
              border: "none", 
              background: "none", 
              fontSize: 12, 
              fontWeight: 700, 
              cursor: "pointer", 
              whiteSpace: "nowrap", 
              color: tab === t.id ? data.corPrimaria : "#64748b", 
              borderBottom: `3px solid ${tab === t.id ? data.corPrimaria : "transparent"}`, 
              transition: "all 0.2s ease",
              flexShrink: 0 
            }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ padding: 24, overflowY: "auto", flex: 1, background: "white" }}>

        {tab === "empresa" && <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", marginBottom: 24 }}>Dados da Empresa</div>
          <FieldGroup label="Logo da Empresa">
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px dashed #cbd5e1" }}>
              {logoSrc && <img src={logoSrc} style={{ height: 48, objectFit: "contain", borderRadius: 4 }} />}
              <button onClick={() => logoRef.current.click()}
                style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#475569", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                {logoSrc ? "🔄 Alterar Logo" : "📎 Carregar Logo"}
              </button>
              <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
            </div>
          </FieldGroup>
          {[["empresaNome","Nome da Empresa"],["empresaSubtitulo","Subtítulo"],["empresaEndereco","Endereço"],["empresaCNPJ","CNPJ"],["empresaRazaoSocial","Razão Social (assinatura)"]].map(([k,l]) => (
            <FieldGroup key={k} label={l}><FInput value={data[k]} onChange={e => set(k, e.target.value)} /></FieldGroup>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldGroup label="Cor Principal">
              <div style={{ display: "flex", gap: 8 }}>
                <input type="color" value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} style={{ width: 44, height: 44, border: "1px solid #e2e8f0", borderRadius: 8, padding: 4, cursor: "pointer", background: "white" }} />
                <FInput value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} />
              </div>
            </FieldGroup>
            <FieldGroup label="Cor Secundária">
              <div style={{ display: "flex", gap: 8 }}>
                <input type="color" value={data.corSecundaria} onChange={e => set("corSecundaria", e.target.value)} style={{ width: 44, height: 44, border: "1px solid #e2e8f0", borderRadius: 8, padding: 4, cursor: "pointer", background: "white" }} />
                <FInput value={data.corSecundaria} onChange={e => set("corSecundaria", e.target.value)} />
              </div>
            </FieldGroup>
          </div>
        </div>}

        {tab === "cliente" && <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", marginBottom: 24 }}>Dados do Cliente</div>
          <FieldGroup label="Nº da Proposta">
            <div style={{ display: "flex", gap: 8 }}>
              <FInput value={data.propostaNumero} onChange={e => set("propostaNumero", e.target.value)} />
              <button onClick={async () => {
                const newNum = await generateProposalNumber();
                set("propostaNumero", newNum);
              }} style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                🔄 Gerar
              </button>
            </div>
          </FieldGroup>
          {[["clienteNome","Nome do Cliente / Empresa"],["propostaValidade","Validade da Proposta"]].map(([k,l]) => (
            <FieldGroup key={k} label={l}><FInput value={data[k]} onChange={e => set(k, e.target.value)} /></FieldGroup>
          ))}
          <FieldGroup label="CNPJ do Cliente"><FInput value={data.clienteCNPJ} onChange={e => set("clienteCNPJ", e.target.value)} mask="cnpj" placeholder="00.000.000/0001-00" /></FieldGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldGroup label="Data da Proposta"><FInput type="date" value={data.propostaData} onChange={e => set("propostaData", e.target.value)} /></FieldGroup>
            <FieldGroup label="Status Atual">
              <select value={data.status} onChange={e => set("status", e.target.value)} style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "12px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#1e293b", background: "white", cursor: "pointer" }}>
                <option value="Rascunho">📝 Rascunho</option>
                <option value="Enviada">📤 Enviada</option>
                <option value="Aceita">✅ Aceita</option>
                <option value="Recusada">❌ Recusada</option>
              </select>
            </FieldGroup>
          </div>
          <FieldGroup label="Texto de Abertura"><FTextarea rows={6} value={data.introTexto} onChange={e => set("introTexto", e.target.value)} /></FieldGroup>
          <FieldGroup label="Próximos Passos"><FTextarea rows={4} value={data.proximosPassos} onChange={e => set("proximosPassos", e.target.value)} /></FieldGroup>
        </div>}

        {tab === "diferenciais" && <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", marginBottom: 24 }}>Diferenciais Competitivos</div>
          {data.diferenciais.map((d, i) => (
            <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid #f1f5f9", borderLeft: `4px solid ${data.corPrimaria}` }}>
              <FieldGroup label={`Diferencial ${i+1} – Título`}><FInput value={d.titulo} onChange={e => updateDiferencial(i,"titulo",e.target.value)} /></FieldGroup>
              <FieldGroup label="Descrição Curta"><FTextarea rows={2} value={d.descricao} onChange={e => updateDiferencial(i,"descricao",e.target.value)} /></FieldGroup>
              {d.itens.map((it, j) => <FieldGroup key={j} label={`• Item de Destaque ${j+1}`}><FInput value={it} onChange={e => updateDiferencialItem(i,j,e.target.value)} /></FieldGroup>)}
            </div>
          ))}
        </div>}

        {tab === "etapas" && <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", marginBottom: 24 }}>Etapas do Processo</div>
          {data.etapas.map((e, i) => (
            <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #f1f5f9", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ background: data.corPrimaria, color: "white", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 4 }}>{i+1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}><FInput value={e.etapa} onChange={ev => updateEtapa(i,"etapa",ev.target.value)} placeholder="Nome da Etapa" /></div>
                <FInput value={e.descricao} onChange={ev => updateEtapa(i,"descricao",ev.target.value)} placeholder="O que acontece nesta fase?" />
              </div>
            </div>
          ))}
        </div>}

        {tab === "investimento" && <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", marginBottom: 24 }}>Tabela de Investimento</div>
          {data.niveis.map((n, i) => (
            <div key={i} style={{ background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #f1f5f9" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <FieldGroup label="Nível da Vaga"><FInput value={n.nivel} onChange={e => updateNivel(i,"nivel",e.target.value)} /></FieldGroup>
                <FieldGroup label="Investimento (%)"><FInput value={n.percentual} onChange={e => updateNivel(i,"percentual",e.target.value)} /></FieldGroup>
              </div>
              <FieldGroup label="Exemplos de Cargos"><FInput value={n.exemplos} onChange={e => updateNivel(i,"exemplos",e.target.value)} /></FieldGroup>
            </div>
          ))}
          <div style={{ height: 1, background: "#e2e8f0", margin: "24px 0" }} />
          {[["tributos","Tributos Incidentes"],["formaPagamento","Condição de Pagamento"],["formaPix","Meios de Pagamento"],["propostaValidade","Validade da Proposta"]].map(([k,l]) => (
            <FieldGroup key={k} label={l}><FInput value={data[k]} onChange={e => set(k, e.target.value)} /></FieldGroup>
          ))}
        </div>}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @media print {
          @page { size: A4 portrait; margin: 0; }
          .no-print { display: none !important; }
          html, body { background: white; margin: 0; padding: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-page {
            width: 210mm !important;
            min-height: 297mm !important;
            height: auto !important;
            max-width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            page-break-after: always;
            break-after: page;
          }
          .print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        .spinner { width: 16px; height: 16px; border: 2px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* TOP BAR */}
      <div className="no-print" style={{ background: "white", color: "#1e293b", padding: isMobile ? "12px 16px" : "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setScreen("list")}
            style={{ background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}>
            ← <span style={{ display: isMobile ? "none" : "inline" }}>Voltar</span>
          </button>
          <div style={{ height: 24, width: 1, background: "#e2e8f0" }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: isMobile ? 14 : 16, color: "#0f172a" }}>
              {data.clienteNome || "Nova Proposta"}
            </div>
            {!isMobile && <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>{data.propostaNumero ? `Nº ${data.propostaNumero}` : "Rascunho em edição"}</div>}
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {saveMsg && (
            <div style={{ 
              fontSize: 12, 
              color: saveMsg.includes("❌") ? "#ef4444" : "#10b981", 
              fontWeight: 700, 
              background: saveMsg.includes("❌") ? "#fef2f2" : "#ecfdf5",
              padding: "6px 12px",
              borderRadius: 20,
              display: isMobile && !saveMsg.includes("✅") ? "none" : "block"
            }}>
              {saveMsg}
            </div>
          )}
          
          <button onClick={handleSaveManual} disabled={saving}
            style={{ 
              background: data.corPrimaria, 
              color: "white", 
              border: "none", 
              padding: "10px 20px", 
              borderRadius: 8, 
              cursor: saving ? "not-allowed" : "pointer", 
              fontSize: 13, 
              fontWeight: 700,
              boxShadow: `0 4px 12px ${data.corPrimaria}33`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s"
            }}>
            {saving ? <div className="spinner" style={{ borderTopColor: "white" }} /> : "💾"}
            {!isMobile && (saving ? "Salvando..." : "Salvar")}
          </button>

          <button onClick={() => window.print()}
            style={{ background: "white", color: "#1e293b", border: "1px solid #e2e8f0", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            🖨️ {!isMobile && "Imprimir / Salvar PDF"}
          </button>

          <button onClick={handleExportDoc}
            style={{ background: "#f8fafc", color: "#1e293b", border: "1px solid #e2e8f0", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            📝 {!isMobile && "Baixar DOC"}
          </button>

          {isMobile && (
            <button onClick={() => setMobileScreen(mobileScreen === "form" ? "preview" : "form")}
              style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "10px", borderRadius: 8, cursor: "pointer" }}>
              {mobileScreen === "form" ? "👁️" : "✎"}
            </button>
          )}
          
          <button onClick={handleSignOut} title="Sair"
            style={{ background: "transparent", color: "#94a3b8", border: "none", padding: "8px", cursor: "pointer", fontSize: 18 }}>
            🚪
          </button>
        </div>
      </div>

      {/* BODY */}
      {isMobile ? (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {mobileScreen === "form"
            ? <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>{formContent}</div>
            : <div style={{ flex: 1, overflowY: "auto", background: "#cbd5e1", padding: "16px 0" }}><PreviewContent data={data} logoSrc={logoSrc} containerRef={previewRef} /></div>
          }
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div className="no-print" style={{ width: 400, minWidth: 400, background: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {formContent}
          </div>
          <div style={{ flex: 1, overflowY: "auto", background: "#cbd5e1", padding: "48px 0" }}>
            <PreviewContent data={data} logoSrc={logoSrc} containerRef={previewRef} />
          </div>
        </div>
      )}
    </div>
  );
}
