import { useState, useRef } from "react";

const defaultData = {
  empresaNome: "RGA Recursos Humanos",
  empresaSubtitulo: "RECURSOS HUMANOS",
  empresaEndereco: "Rua Das Águias, n. 960, bairro São Lázaro – CEP 69.073-140 – Manaus, Amazonas.",
  empresaCNPJ: "55.534.852/0001-50",
  empresaRazaoSocial: "INSTITUTO RGA",
  corPrimaria: "#1976D2",
  corSecundaria: "#E53935",
  propostaNumero: "234/2026",
  propostaValidade: "5 dias a contar desta data",
  propostaData: new Date().toISOString().split("T")[0],
  clienteNome: "GRUPO GENNIUS BRASIL",
  clienteCNPJ: "27.665.906/0001-81",
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

function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width: "100%", border: "1px solid #ddd", borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#333" }} />
  );
}

function Textarea({ value, onChange, rows = 3 }) {
  return (
    <textarea value={value} onChange={onChange} rows={rows}
      style={{ width: "100%", border: "1px solid #ddd", borderRadius: 6, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#333", resize: "vertical" }} />
  );
}

function ProposalPage({ data, logoSrc, children, preview }) {
  return (
    <div className="print-page" style={{
      background: "white", width: "100%", maxWidth: 794, minHeight: 1123,
      boxShadow: preview ? "none" : "0 2px 20px rgba(0,0,0,0.12)",
      display: "flex", flexDirection: "column", fontFamily: "'Calibri','Segoe UI',sans-serif",
    }}>
      <div style={{ height: 8, background: data.corPrimaria }} />
      <div style={{ padding: "12px 48px 6px", display: "flex", justifyContent: "center", borderBottom: "1px solid #eee" }}>
        {logoSrc
          ? <img src={logoSrc} style={{ height: 50, objectFit: "contain" }} />
          : <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: data.corPrimaria, letterSpacing: 3 }}>{data.empresaNome.split(" ")[0]}</div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", color: "#444" }}>{data.empresaSubtitulo}</div>
            </div>
        }
      </div>
      <div style={{ flex: 1, padding: "24px 48px", display: "flex", flexDirection: "column" }}>{children}</div>
      <div style={{ background: "#f5f5f5", padding: "8px 48px", textAlign: "center", borderTop: "1px solid #e0e0e0" }}>
        <div style={{ fontSize: 10, color: "#555", fontWeight: 600 }}>{data.empresaNome}</div>
        <div style={{ fontSize: 9, color: "#888", marginTop: 1 }}>{data.empresaEndereco}</div>
      </div>
      <div style={{ height: 6, background: data.corPrimaria }} />
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(defaultData);
  const [tab, setTab] = useState("empresa");
  const [preview, setPreview] = useState(false);
  const [logoSrc, setLogoSrc] = useState(null);
  const logoRef = useRef();

  const set = (key, val) => setData(d => ({ ...d, [key]: val }));

  const tabs = [
    { id: "empresa", label: "🏢 Empresa" },
    { id: "cliente", label: "👤 Cliente" },
    { id: "diferenciais", label: "✅ Diferenciais" },
    { id: "etapas", label: "📋 Etapas" },
    { id: "investimento", label: "💰 Investimento" },
  ];

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  const updateDiferencial = (i, field, val) => {
    set("diferenciais", data.diferenciais.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };

  const updateDiferencialItem = (di, ii, val) => {
    set("diferenciais", data.diferenciais.map((d, idx) => {
      if (idx !== di) return d;
      return { ...d, itens: d.itens.map((it, jdx) => jdx === ii ? val : it) };
    }));
  };

  const updateEtapa = (i, field, val) => {
    set("etapas", data.etapas.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  };

  const updateNivel = (i, field, val) => {
    set("niveis", data.niveis.map((n, idx) => idx === i ? { ...n, [field]: val } : n));
  };

  return (
    <div style={{ fontFamily: "'Calibri','Segoe UI',sans-serif", minHeight: "100vh", background: "#f0f2f5", display: "flex", flexDirection: "column" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; margin: 0; }
          .print-page { page-break-after: always; box-shadow: none !important; max-width: 100% !important; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* TOP BAR */}
      <div className="no-print" style={{ background: data.corPrimaria, color: "white", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>📄 Gerador de Proposta Comercial – RGA</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>Edite os campos à esquerda • A proposta aparece ao vivo →</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setPreview(!preview)}
            style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.4)", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {preview ? "✎ Editar" : "👁 Prévia"}
          </button>
          <button onClick={() => window.print()}
            style={{ background: "white", color: data.corPrimaria, border: "none", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
            🖨️ Gerar PDF
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>

        {/* LEFT FORM */}
        {!preview && (
          <div className="no-print" style={{ width: 350, minWidth: 350, background: "white", borderRight: "1px solid #e4e4e4", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", borderBottom: "2px solid #f0f2f5", overflowX: "auto" }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ padding: "10px 13px", border: "none", background: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", color: tab === t.id ? data.corPrimaria : "#888", borderBottom: `2px solid ${tab === t.id ? data.corPrimaria : "transparent"}`, marginBottom: -2 }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>

              {tab === "empresa" && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: data.corPrimaria, marginBottom: 16 }}>Dados da Empresa</div>
                  <FieldGroup label="Logo">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {logoSrc && <img src={logoSrc} style={{ height: 44, objectFit: "contain", border: "1px solid #eee", borderRadius: 4, padding: 2 }} />}
                      <button onClick={() => logoRef.current.click()}
                        style={{ background: "#f5f5f5", border: "1px dashed #ccc", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 12, color: "#555" }}>
                        📎 {logoSrc ? "Trocar logo" : "Carregar logo"}
                      </button>
                      <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
                    </div>
                  </FieldGroup>
                  {[["empresaNome","Nome da Empresa"],["empresaSubtitulo","Subtítulo"],["empresaEndereco","Endereço"],["empresaCNPJ","CNPJ"],["empresaRazaoSocial","Razão Social (assinatura)"]].map(([k,l]) => (
                    <FieldGroup key={k} label={l}><Input value={data[k]} onChange={e => set(k, e.target.value)} /></FieldGroup>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <FieldGroup label="Cor Principal">
                      <div style={{ display: "flex", gap: 6 }}>
                        <input type="color" value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} style={{ width: 38, height: 34, border: "1px solid #ddd", borderRadius: 4, padding: 2, cursor: "pointer" }} />
                        <Input value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} />
                      </div>
                    </FieldGroup>
                    <FieldGroup label="Cor Secundária">
                      <div style={{ display: "flex", gap: 6 }}>
                        <input type="color" value={data.corSecundaria} onChange={e => set("corSecundaria", e.target.value)} style={{ width: 38, height: 34, border: "1px solid #ddd", borderRadius: 4, padding: 2, cursor: "pointer" }} />
                        <Input value={data.corSecundaria} onChange={e => set("corSecundaria", e.target.value)} />
                      </div>
                    </FieldGroup>
                  </div>
                </div>
              )}

              {tab === "cliente" && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: data.corPrimaria, marginBottom: 16 }}>Dados do Cliente</div>
                  {[["propostaNumero","Nº da Proposta"],["clienteNome","Nome do Cliente / Empresa"],["clienteCNPJ","CNPJ do Cliente"],["propostaValidade","Validade da Proposta"]].map(([k,l]) => (
                    <FieldGroup key={k} label={l}><Input value={data[k]} onChange={e => set(k, e.target.value)} /></FieldGroup>
                  ))}
                  <FieldGroup label="Data">
                    <Input type="date" value={data.propostaData} onChange={e => set("propostaData", e.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="Texto de Abertura (separe parágrafos com linha em branco)">
                    <Textarea rows={7} value={data.introTexto} onChange={e => set("introTexto", e.target.value)} />
                  </FieldGroup>
                  <FieldGroup label="Próximos Passos / Fechamento">
                    <Textarea rows={5} value={data.proximosPassos} onChange={e => set("proximosPassos", e.target.value)} />
                  </FieldGroup>
                </div>
              )}

              {tab === "diferenciais" && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: data.corPrimaria, marginBottom: 16 }}>Por que a empresa?</div>
                  {data.diferenciais.map((d, i) => (
                    <div key={i} style={{ background: "#f8f9fb", borderRadius: 8, padding: 12, marginBottom: 12, borderLeft: `3px solid ${data.corPrimaria}` }}>
                      <FieldGroup label={`Diferencial ${i+1} – Título`}><Input value={d.titulo} onChange={e => updateDiferencial(i,"titulo",e.target.value)} /></FieldGroup>
                      <FieldGroup label="Descrição"><Textarea rows={3} value={d.descricao} onChange={e => updateDiferencial(i,"descricao",e.target.value)} /></FieldGroup>
                      {d.itens.map((it, j) => (
                        <FieldGroup key={j} label={`• Item ${j+1}`}><Input value={it} onChange={e => updateDiferencialItem(i,j,e.target.value)} /></FieldGroup>
                      ))}
                      {d.resultado && <FieldGroup label="Resultado"><Textarea rows={2} value={d.resultado} onChange={e => updateDiferencial(i,"resultado",e.target.value)} /></FieldGroup>}
                    </div>
                  ))}
                </div>
              )}

              {tab === "etapas" && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: data.corPrimaria, marginBottom: 16 }}>Como Funciona</div>
                  {data.etapas.map((e, i) => (
                    <div key={i} style={{ background: "#f8f9fb", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8 }}>
                        <FieldGroup label={`Etapa ${i+1}`}><Input value={e.etapa} onChange={ev => updateEtapa(i,"etapa",ev.target.value)} /></FieldGroup>
                        <FieldGroup label="O que fazemos"><Input value={e.descricao} onChange={ev => updateEtapa(i,"descricao",ev.target.value)} /></FieldGroup>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "investimento" && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: data.corPrimaria, marginBottom: 16 }}>Tabela de Investimento</div>
                  {data.niveis.map((n, i) => (
                    <div key={i} style={{ background: "#f8f9fb", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <FieldGroup label="Nível"><Input value={n.nivel} onChange={e => updateNivel(i,"nivel",e.target.value)} /></FieldGroup>
                        <FieldGroup label="% / Valor"><Input value={n.percentual} onChange={e => updateNivel(i,"percentual",e.target.value)} /></FieldGroup>
                      </div>
                      <FieldGroup label="Exemplos de cargos"><Input value={n.exemplos} onChange={e => updateNivel(i,"exemplos",e.target.value)} /></FieldGroup>
                    </div>
                  ))}
                  {[["tributos","Tributos"],["formaPagamento","Condição de Pagamento"],["formaPix","Formas aceitas"],["propostaValidade","Validade"]].map(([k,l]) => (
                    <FieldGroup key={k} label={l}><Input value={data[k]} onChange={e => set(k, e.target.value)} /></FieldGroup>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RIGHT PREVIEW */}
        <div style={{ flex: 1, overflowY: "auto", background: "#e8eaed", padding: preview ? 0 : 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>

          {/* PAGE 1 – CAPA */}
          <ProposalPage data={data} logoSrc={logoSrc} preview={preview}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {logoSrc
                ? <img src={logoSrc} style={{ maxWidth: 240, maxHeight: 200, objectFit: "contain" }} />
                : <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 60, fontWeight: 900, color: data.corPrimaria, letterSpacing: 6 }}>{data.empresaNome.split(" ")[0]}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.35em", color: "#333", marginTop: 6 }}>{data.empresaSubtitulo}</div>
                  </div>
              }
            </div>
            <div style={{ alignSelf: "flex-end", marginBottom: 48 }}>
              <div style={{ background: data.corPrimaria, padding: "30px 60px" }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: "white", letterSpacing: 3 }}>PROPOSTA</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: "white", letterSpacing: 3 }}>COMERCIAL</div>
              </div>
              <div style={{ background: data.corSecundaria, height: 18, width: "55%", marginLeft: "auto" }} />
            </div>
          </ProposalPage>

          {/* PAGE 2 – INTRO + DIFERENCIAIS */}
          <ProposalPage data={data} logoSrc={logoSrc} preview={preview}>
            <div style={{ flex: 1, paddingTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>PROPOSTA COMERCIAL DE PRESTAÇÃO DE SERVIÇOS</div>
              <div style={{ fontSize: 12, textAlign: "right", marginBottom: 20, color: "#555" }}>Proposta Nº {data.propostaNumero}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>À {data.clienteNome};</div>
              {data.introTexto.split("\n\n").map((p, i) => (
                <p key={i} style={{ fontSize: 12, lineHeight: 1.7, marginBottom: 8, color: "#222", textAlign: "justify" }}>{p}</p>
              ))}
              <div style={{ fontWeight: 700, fontSize: 13, marginTop: 22, marginBottom: 14 }}>POR QUE A {data.empresaNome.toUpperCase().split(" ")[0]}?</div>
              {data.diferenciais.map((d, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>✓ {d.titulo}</div>
                  <p style={{ fontSize: 12, lineHeight: 1.65, color: "#333", marginBottom: d.itens.length ? 5 : 0 }}>{d.descricao}</p>
                  {d.itens.length > 0 && (
                    <ul style={{ paddingLeft: 22, marginBottom: d.resultado ? 5 : 0 }}>
                      {d.itens.map((it, j) => <li key={j} style={{ fontSize: 12, lineHeight: 1.7, color: "#333" }}>{it}</li>)}
                    </ul>
                  )}
                  {d.resultado && <p style={{ fontSize: 12, lineHeight: 1.65, color: "#333" }}>{d.resultado}</p>}
                </div>
              ))}
            </div>
          </ProposalPage>

          {/* PAGE 3 – COMO FUNCIONA + INVESTIMENTO */}
          <ProposalPage data={data} logoSrc={logoSrc} preview={preview}>
            <div style={{ flex: 1, paddingTop: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Como funciona:</div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 26, fontSize: 12 }}>
                <thead>
                  <tr style={{ background: data.corPrimaria }}>
                    <th style={{ color: "white", padding: "8px 14px", textAlign: "left", fontWeight: 700, width: "35%" }}>Etapa</th>
                    <th style={{ color: "white", padding: "8px 14px", textAlign: "left", fontWeight: 700 }}>O Que Fazemos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.etapas.map((e, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#eef3fb" }}>
                      <td style={{ padding: "8px 14px", borderBottom: "1px solid #dce6f5", verticalAlign: "top", fontWeight: 500 }}>{e.numero}. {e.etapa}</td>
                      <td style={{ padding: "8px 14px", borderBottom: "1px solid #dce6f5" }}>{e.descricao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>INVESTIMENTO E CONDIÇÕES</div>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>Tabela de Valores</div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10, fontSize: 12 }}>
                <thead>
                  <tr style={{ background: data.corPrimaria }}>
                    <th style={{ color: "white", padding: "8px 14px", textAlign: "left", fontWeight: 700 }}>Nível da Vaga</th>
                    <th style={{ color: "white", padding: "8px 14px", textAlign: "left", fontWeight: 700 }}>Investimento</th>
                  </tr>
                </thead>
                <tbody>
                  {data.niveis.map((n, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#eef3fb" }}>
                      <td style={{ padding: "8px 14px", borderBottom: "1px solid #dce6f5" }}>{n.nivel} ({n.exemplos})</td>
                      <td style={{ padding: "8px 14px", borderBottom: "1px solid #dce6f5" }}>{n.percentual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: "center", fontSize: 11, color: "#555", marginBottom: 20 }}>Tributos: {data.tributos}</div>

              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>Condições Comerciais</div>
              <ul style={{ paddingLeft: 22, fontSize: 12, lineHeight: 2, color: "#333" }}>
                <li>Pagamento: {data.formaPagamento}</li>
                <li>Forma: {data.formaPix}</li>
                <li>Validade: {data.propostaValidade}</li>
              </ul>
            </div>
          </ProposalPage>

          {/* PAGE 4 – PRÓXIMOS PASSOS + ASSINATURAS */}
          <ProposalPage data={data} logoSrc={logoSrc} preview={preview}>
            <div style={{ flex: 1, paddingTop: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Próximos Passos</div>
              {data.proximosPassos.split("\n\n").map((p, i) => (
                <p key={i} style={{ fontSize: 12, lineHeight: 1.8, marginBottom: 14, color: "#333" }}>{p}</p>
              ))}
            </div>
            <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>
              <div>
                <div style={{ borderTop: "1.5px solid #333", paddingTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{data.empresaRazaoSocial} – CONTRATADO</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>CNPJ: {data.empresaCNPJ}</div>
                </div>
              </div>
              <div>
                <div style={{ borderTop: "1.5px solid #333", paddingTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{data.clienteNome} – CONTRATANTE</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>CNPJ: {data.clienteCNPJ}</div>
                </div>
              </div>
            </div>
          </ProposalPage>

        </div>
      </div>
    </div>
  );
}
