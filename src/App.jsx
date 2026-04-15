import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import Auth from "./Auth";
import ProposalList from "./ProposalList";
import JobAdBuilder from "./JobAdBuilder";
import { acceptInviteForUser, clearPendingInviteToken, getPendingInviteToken } from "./inviteAcceptance";
import { runOnboarding } from "./onboarding";

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

const exportResolutionOptions = {
  web: { label: "Web (rápido)", scale: 1 },
  high: { label: "Alta qualidade (tráfego pago)", scale: 2 },
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
              ? <img src={logoSrc} style={{ height: 40, objectFit: "contain" }} />
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
          {logoSrc ? <img src={logoSrc} style={{ maxWidth: 300, maxHeight: 240, objectFit: "contain", marginBottom: 48 }} />
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
            <div>Meio: {data.formaPix}</div>
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

function CompactPreviewContent({ data, logoSrc }) {
  return (
    <div className="preview-content compact-preview" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, padding: "32px 16px" }}>
      <ProposalPage data={data} logoSrc={logoSrc} showSignature={true}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: data.corPrimaria, letterSpacing: 1 }}>PARECER COMERCIAL</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", marginTop: 6 }}>{data.clienteNome || "Cliente"}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              Nº {data.propostaNumero || "—"} • {new Date(data.propostaData).toLocaleDateString('pt-BR')}
            </div>
          </div>
          {logoSrc && <img src={logoSrc} style={{ height: 46, maxWidth: 170, objectFit: "contain" }} />}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>Prazo de entrega</div>
            <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 800, marginTop: 3 }}>Até 7 dias úteis</div>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>Garantia</div>
            <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 800, marginTop: 3 }}>Reposição em 30 dias</div>
          </div>
        </div>

        <div style={{ fontSize: 12, fontWeight: 800, color: data.corPrimaria, marginBottom: 8 }}>Resumo da solução</div>
        <p style={{ fontSize: 12, lineHeight: 1.5, color: "#334155", marginBottom: 14 }}>
          {data.introTexto.split("\n\n")[0]}
        </p>

        <div style={{ fontSize: 12, fontWeight: 800, color: data.corPrimaria, marginBottom: 8 }}>Investimento por nível</div>
        <div style={{ display: "grid", gap: 6, marginBottom: 14 }}>
          {data.niveis.map((n, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", fontSize: 11 }}>
              <div>
                <div style={{ fontWeight: 800, color: "#0f172a" }}>{n.nivel}</div>
                <div style={{ color: "#64748b", marginTop: 2 }}>{n.exemplos}</div>
              </div>
              <div style={{ alignSelf: "center", fontWeight: 900, color: data.corPrimaria }}>{n.percentual}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.45, marginTop: "auto" }}>
          <div><strong>Condições:</strong> {data.formaPagamento}</div>
          <div><strong>Tributos:</strong> {data.tributos}</div>
          <div><strong>Validade:</strong> {data.propostaValidade}</div>
        </div>
      </ProposalPage>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [screen, setScreen] = useState("list"); // "list" | "editor" | "jobAd"
  const [data, setData] = useState({ ...defaultData });
  const [tab, setTab] = useState("empresa");
  const [mobileScreen, setMobileScreen] = useState("form");
  const [logoSrc, setLogoSrc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState("completa"); // "completa" | "compacta"
  const logoRef = useRef();
  const autoSaveTimerRef = useRef(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Check auth on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthChecked(true);
      if (session?.user) {
        acceptInviteForUser(session.user).then(accepted => {
          if (accepted) {
            clearPendingInviteToken();
          }
        });
      }
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
    if (!user) return;
    setSaving(true);
    if (!isAutoSave) setSaveMsg("");
    
    const payload = {
      user_id: user.id,
      organization_id: organization?.id || null,
      cliente_nome: data.clienteNome,
      proposta_numero: data.propostaNumero,
      data_proposta: data.propostaData || null,
      dados: data,
      status: data.status || "Rascunho"
    };
    
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
      if (!savedId && result.data) setSavedId(result.data.id);
      setLastSavedAt(new Date());
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
    setLastSavedAt(null);
    setSaveMsg("");
    setScreen("editor");
  };

  const handleLoad = (dados, id = null) => {
    setData({ ...defaultData, ...dados, generatedArtMetadata: Array.isArray(dados?.generatedArtMetadata) ? dados.generatedArtMetadata : [] });
    setSavedId(id);
    setLastSavedAt(null);
    setSaveMsg("");
    setScreen("editor");
  };

  const handleSignOut = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    await supabase.auth.signOut();
    setUser(null);
    setOrganization(null);
    setData({ ...defaultData });
    setSavedId(null);
    setLastSavedAt(null);
    setLogoSrc(null);
    setTab("empresa");
    setUserRole("recruiter");
    setScreen("hub");
    navigate("/");
  };

  const resolveUiRole = (role) => {
    if (role === "owner" || role === "admin") return role;
    return "recruiter";
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

  const loadOrganization = async () => {
    if (!user) return;
    setOrganizationLoading(true);
    const { data, error } = await supabase.from("profiles").select("organization_id, role").eq("id", user.id).single();
    if (error) {
      console.error("Erro ao carregar profile:", error);
    }

    if (!error) {
      setUserRole(resolveUiRole(data?.role));
    }

    if (!error && data?.organization_id) {
      const { data: orgData } = await supabase.from("organizations").select("*").eq("id", data.organization_id).single();
      if (orgData) {
        setOrganization(orgData);
        setData(prev => ({ ...prev, empresaNome: orgData.name || prev.empresaNome, empresaCNPJ: orgData.cnpj || prev.empresaCNPJ, empresaEndereco: orgData.endereco || prev.empresaEndereco, empresaRazaoSocial: orgData.razao_social || prev.empresaRazaoSocial, corPrimaria: orgData.cor_primaria || prev.corPrimaria, corSecundaria: orgData.cor_secundaria || prev.corSecundaria }));
      }
    }
    setOrganizationLoading(false);
  };

  const saveOrganization = async () => {
    if (!user || !organization?.id) return;
    setSaving(true);
    const payload = { name: data.empresaNome, cnpj: data.empresaCNPJ, endereco: data.empresaEndereco, razao_social: data.empresaRazaoSocial, cor_primaria: data.corPrimaria, cor_secundaria: data.corSecundaria };
    const { error } = await supabase.from("organizations").update(payload).eq("id", organization.id);
    setSaving(false);
    if (error) { setSaveMsg("Erro ao salvar: " + error.message); } else { setSaveMsg("Organização Atualizada!"); setTimeout(() => setSaveMsg(""), 3000); }
  };

  useEffect(() => { if (user && !organization) { loadOrganization(); } }, [user]);

  const tabs = [
    { id: "organizacao", label: "🏢 Minha Empresa" },
    { id: "empresa", label: "📋 Template" },
    { id: "cliente", label: "👤 Cliente" },
    { id: "diferenciais", label: "✅ Diferenciais" },
    { id: "etapas", label: "📋 Etapas" },
    { id: "investimento", label: "💰 Investimento" },
  ];

  const completionChecklist = useMemo(() => ([
    { key: "empresaNome", label: "Nome da empresa", tab: "empresa" },
    { key: "empresaCNPJ", label: "CNPJ da empresa", tab: "empresa" },
    { key: "clienteNome", label: "Nome do cliente", tab: "cliente" },
    { key: "clienteCNPJ", label: "CNPJ do cliente", tab: "cliente" },
    { key: "propostaNumero", label: "Número da proposta", tab: "cliente" },
    { key: "introTexto", label: "Texto de abertura", tab: "cliente" },
    { key: "proximosPassos", label: "Próximos passos", tab: "cliente" },
    { key: "linkCandidaturaPublica", label: "Link de candidatura", tab: "cliente" },
  ]), []);

  const missingChecklistItems = completionChecklist.filter(item => {
    const value = data[item.key];
    return !String(value || "").trim();
  });
  const completionRate = Math.round(((completionChecklist.length - missingChecklistItems.length) / completionChecklist.length) * 100);


  const getPublicApplicationUrl = () => {
    const fallbackPath = `${window.location.origin}/candidatura`;
    const base = String(data.linkCandidaturaPublica || fallbackPath).trim() || fallbackPath;

    try {
      const url = new URL(base, window.location.origin);
      if (url.pathname === "/trabalhe-conosco") {
        url.pathname = "/candidatura";
      }
      if (savedId) url.searchParams.set("proposal_id", savedId);
      if (String(data.sourceCampaign || "").trim()) {
        url.searchParams.set("source_campaign", String(data.sourceCampaign).trim());
      }
      return url.toString();
    } catch (_error) {
      return fallbackPath;
    }
  };

  const publicApplicationUrl = getPublicApplicationUrl();
  const publicApplicationQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicApplicationUrl)}`;

  // ── Render ──
  if (!authChecked) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600, display: "flex", alignItems: "center", gap: 12 }}>
        <div className="spinner" /> Carregando sistema...
      </div>
    </div>
  );

  if (!user) return <Auth onLogin={(u) => { setUser(u); setScreen("hub"); }} />;

  const handleOpenModule = (moduleId) => {
    if (moduleId === "propostas") {
      setScreen("list");
      return;
    }
    window.alert("Este módulo será disponibilizado em breve.");
  };

  if (screen === "hub") return (
    <ModuleHub
      user={user}
      role={userRole}
      onOpenModule={handleOpenModule}
      onSignOut={handleSignOut}
    />
  );

  if (screen === "list") return (
    <ProposalList
      user={user}
      onNew={handleNew}
      onLoad={handleLoad}
      onNewJobAd={() => setScreen("jobAd")}
      onSignOut={handleSignOut}
      corPrimaria={data.corPrimaria}
    />
  );

  if (screen === "jobAd") {
    return <JobAdBuilder onBack={() => setScreen("list")} />;
  }

  // ── EDITOR SCREEN ──
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
        <div style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 14,
          marginBottom: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", letterSpacing: "0.02em" }}>Checklist de qualidade da proposta</div>
            <div style={{ fontSize: 12, color: missingChecklistItems.length === 0 ? "#059669" : "#64748b", fontWeight: 700 }}>
              {completionRate}% completo
            </div>
          </div>
          <div style={{ width: "100%", height: 8, background: "#e2e8f0", borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ width: `${completionRate}%`, height: "100%", background: completionRate === 100 ? "#10b981" : data.corPrimaria, transition: "width 0.25s ease" }} />
          </div>
          {missingChecklistItems.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {missingChecklistItems.slice(0, 3).map(item => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.tab)}
                  style={{
                    border: "1px solid #fecaca",
                    background: "#fff1f2",
                    color: "#be123c",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Falta: {item.label}
                </button>
              ))}
              {missingChecklistItems.length > 3 && (
                <span style={{ fontSize: 11, color: "#64748b", alignSelf: "center" }}>
                  +{missingChecklistItems.length - 3} pendências
                </span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#047857", fontWeight: 700 }}>Tudo pronto para envio ✅</div>
          )}
        </div>

        {tab === "organizacao" && <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", marginBottom: 24 }}>Dados da Minha Empresa</div>
          <div style={{ background: "#ecfdf5", border: "1px solid #86efac", borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 13, color: "#166534" }}>
            Estes dados sao compartilhados em todas as suas propostas.
          </div>
          {[["empresaNome","Nome da Empresa"],["empresaCNPJ","CNPJ"],["empresaEndereco","Endereco"],["empresaRazaoSocial","Razao Social"]].map(([k,l]) => (
            <FieldGroup key={k} label={l}><FInput value={data[k]} onChange={e => set(k, e.target.value)} mask={k === "empresaCNPJ" ? "cnpj" : undefined} /></FieldGroup>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldGroup label="Cor Principal">
              <div style={{ display: "flex", gap: 8 }}>
                <input type="color" value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} style={{ width: 44, height: 44, border: "1px solid #e2e8f0", borderRadius: 8, padding: 4, cursor: "pointer", background: "white" }} />
                <FInput value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} />
              </div>
            </FieldGroup>
            <FieldGroup label="Cor Secundaria">
              <div style={{ display: "flex", gap: 8 }}>
                <input type="color" value={data.corSecundaria} onChange={e => set("corSecundaria", e.target.value)} style={{ width: 44, height: 44, border: "1px solid #e2e8f0", borderRadius: 8, padding: 4, cursor: "pointer", background: "white" }} />
                <FInput value={data.corSecundaria} onChange={e => set("corSecundaria", e.target.value)} />
              </div>
            </FieldGroup>
          </div>
          <button onClick={saveOrganization} disabled={saving} style={{ marginTop: 24, background: data.corPrimaria, color: "white", border: "none", padding: "12px 24px", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, width: "100%" }}>
            {saving ? "Salvando..." : "Salvar Dados da Empresa"}
          </button>
        </div>}

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
          <div style={{ marginTop: 24, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Histórico de artes geradas</div>
            {(data.generatedArtMetadata || []).length === 0 ? (
              <div style={{ fontSize: 12, color: "#64748b" }}>Nenhuma arte gerada ainda. Exporte JPG para iniciar o histórico.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.generatedArtMetadata.slice(0, 5).map((item) => (
                  <div key={item.id || item.createdAt} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 10px", display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                    <div style={{ fontSize: 12, color: "#334155", fontWeight: 600 }}>
                      {item.fileName || "arquivo.jpg"} • {item.width}x{item.height}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleString("pt-BR") : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
          <FieldGroup label="Link público de candidatura">
            <FInput value={data.linkCandidaturaPublica} onChange={e => set("linkCandidaturaPublica", e.target.value)} placeholder={`${window.location.origin}/candidatura`} />
          </FieldGroup>
          <FieldGroup label="source_campaign (origem do anúncio)">
            <FInput value={data.sourceCampaign} onChange={e => set("sourceCampaign", e.target.value)} placeholder="linkedin-abril-2026" />
          </FieldGroup>
          <FieldGroup label="Link final com tracking">
            <div style={{ fontSize: 12, color: "#475569", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", wordBreak: "break-all" }}>
              {publicApplicationUrl}
            </div>
          </FieldGroup>
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

  const editorBody = (
    <>
      {isMobile ? (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {mobileScreen === "form"
            ? <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>{formContent}</div>
            : <div style={{ flex: 1, overflowY: "auto", background: "#cbd5e1", padding: "16px 0" }}><PreviewContent data={data} logoSrc={logoSrc} /></div>
          }
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div className="no-print" style={{ width: 400, minWidth: 400, background: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {formContent}
          </div>
          <div style={{ flex: 1, overflowY: "auto", background: "#cbd5e1", padding: "48px 0" }}>
            <PreviewContent data={data} logoSrc={logoSrc} />
          </div>
        </div>
      )}
    </>
  );

  const topActions = (
    <>
      {!isMobile && (
        <button
          onClick={() => setAutoSaveEnabled(prev => !prev)}
          style={{
            background: autoSaveEnabled ? "#ecfdf5" : "#f8fafc",
            color: autoSaveEnabled ? "#047857" : "#475569",
            border: `1px solid ${autoSaveEnabled ? "#86efac" : "#e2e8f0"}`,
            padding: "8px 12px",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700
          }}
        >
          {autoSaveEnabled ? "Auto-save ON" : "Auto-save OFF"}
        </button>
      )}
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
        🖨️ {!isMobile && "Gerar PDF"}
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
    </>
  );

  return (
    <AppShell
      moduleName={data.clienteNome || "Nova Proposta"}
      breadcrumb={["Hub", "Propostas", "Editor"]}
      onBackToHub={() => setScreen("list")}
      topActions={topActions}
      userEmail={user?.email}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @media print {
          @page { size: A4 portrait; margin: 0; }
          .no-print { display: none !important; }
          body { background: white; margin: 0; }
          .preview-content {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-page {
            width: 210mm !important;
            min-height: 297mm !important;
            height: 297mm !important;
            max-width: 210mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
            overflow: hidden !important;
          }
          .print-page-cover {
            background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%) !important;
          }
          .print-footer {
            background: #eff6ff !important;
            border-top: 2px solid #dbeafe !important;
          }
          .print-signature {
            display: block !important;
          }
          .compact-preview .print-page {
            min-height: 297mm !important;
            height: 297mm !important;
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
            {!isMobile && (
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                <span>{data.propostaNumero ? `Nº ${data.propostaNumero}` : "Rascunho em edição"}</span>
                <span style={{ color: "#cbd5e1" }}>•</span>
                <span style={{ color: completionRate === 100 ? "#059669" : "#475569", fontWeight: 700 }}>
                  {completionRate}% completo
                </span>
                {lastSavedAt && (
                  <>
                    <span style={{ color: "#cbd5e1" }}>•</span>
                    <span>Último salvamento {lastSavedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!isMobile && (
            <button
              onClick={() => setAutoSaveEnabled(prev => !prev)}
              style={{
                background: autoSaveEnabled ? "#ecfdf5" : "#f8fafc",
                color: autoSaveEnabled ? "#047857" : "#475569",
                border: `1px solid ${autoSaveEnabled ? "#86efac" : "#e2e8f0"}`,
                padding: "8px 12px",
                borderRadius: 999,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700
              }}
            >
              {autoSaveEnabled ? "Auto-save ON" : "Auto-save OFF"}
            </button>
          )}
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

          <select
            value={exportResolution}
            onChange={(e) => setExportResolution(e.target.value)}
            style={{
              background: "white",
              border: "1px solid #e2e8f0",
              padding: "10px 12px",
              borderRadius: 8,
              fontSize: 12,
              color: "#1e293b",
              fontWeight: 600,
              cursor: "pointer",
              maxWidth: isMobile ? 130 : "none",
            }}
          >
            {Object.entries(exportResolutionOptions).map(([value, option]) => (
              <option key={value} value={value}>{option.label}</option>
            ))}
          </select>

          <button
            onClick={() => handleDownloadJpg("square")}
            disabled={exportingImage}
            style={{ background: "white", color: "#1e293b", border: "1px solid #e2e8f0", padding: "10px 16px", borderRadius: 8, cursor: exportingImage ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}
          >
            🖼️ {!isMobile && "JPG 1080x1080"}
          </button>

          <button
            onClick={() => handleDownloadJpg("story")}
            disabled={exportingImage}
            style={{ background: "white", color: "#1e293b", border: "1px solid #e2e8f0", padding: "10px 16px", borderRadius: 8, cursor: exportingImage ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}
          >
            📱 {!isMobile && "JPG 1080x1920"}
          </button>

          <button onClick={() => window.print()}
            style={{ background: "white", color: "#1e293b", border: "1px solid #e2e8f0", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            🖨️ {!isMobile && "Gerar PDF"}
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
            : <div style={{ flex: 1, overflowY: "auto", background: "#cbd5e1", padding: "16px 0" }}><PreviewContent data={data} logoSrc={logoSrc} publicApplicationUrl={publicApplicationUrl} publicApplicationQrUrl={publicApplicationQrUrl} /></div>
          }
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div className="no-print" style={{ width: 400, minWidth: 400, background: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {formContent}
          </div>
          <div style={{ flex: 1, overflowY: "auto", background: "#cbd5e1", padding: "48px 0" }}>
            <PreviewContent data={data} logoSrc={logoSrc} publicApplicationUrl={publicApplicationUrl} publicApplicationQrUrl={publicApplicationQrUrl} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
