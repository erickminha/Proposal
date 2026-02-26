import { useState } from "react";

const defaultData = {
  empresaNome: "Studio Floral Belle",
  empresaSlogan: "Flores que contam histórias",
  empresaTelefone: "(11) 99999-8888",
  empresaEmail: "contato@belleforal.com.br",
  empresaInstagram: "@bellefloralstudio",
  clienteNome: "Maria Fernanda",
  clienteEvento: "Casamento",
  clienteData: "2025-06-14",
  clienteLocal: "Espaço Villa Jardim, SP",
  servicos: [
    { nome: "Buquê da Noiva", descricao: "Buquê cascata em rosas brancas e eucalipto", valor: 480 },
    { nome: "Decoração do Altar", descricao: "Arranjos florais para o altar com arco floral", valor: 1800 },
    { nome: "Centros de Mesa (10 un)", descricao: "Arranjos baixos com hortênsias e rosas", valor: 2200 },
    { nome: "Laços para Cadeiras (50 un)", descricao: "Fitilho de organza com florzinhas", valor: 750 },
  ],
  validade: "2025-04-30",
  observacoes: "Entrega e montação incluída. Retirada no dia seguinte ao evento.",
  pagamento: "50% na assinatura + 50% na entrega",
  corPrimaria: "#1a3a2a",
  corAcento: "#c8a96e",
};

const formatCurrency = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const formatDate = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

export default function App() {
  const [data, setData] = useState(defaultData);
  const [tab, setTab] = useState("empresa");
  const [editingSvc, setEditingSvc] = useState(null);
  const [newSvc, setNewSvc] = useState({ nome: "", descricao: "", valor: "" });
  const [preview, setPreview] = useState(false);

  const set = (key, val) => setData((d) => ({ ...d, [key]: val }));
  const total = data.servicos.reduce((a, s) => a + Number(s.valor), 0);

  const tabs = [
    { id: "empresa", label: "🏢 Empresa" },
    { id: "cliente", label: "👤 Cliente" },
    { id: "servicos", label: "📋 Serviços" },
    { id: "detalhes", label: "⚙️ Detalhes" },
  ];

  const addServico = () => {
    if (!newSvc.nome) return;
    set("servicos", [...data.servicos, { ...newSvc, valor: Number(newSvc.valor) || 0 }]);
    setNewSvc({ nome: "", descricao: "", valor: "" });
  };

  const removeServico = (i) => set("servicos", data.servicos.filter((_, idx) => idx !== i));

  const updateServico = (i, field, val) => {
    const updated = data.servicos.map((s, idx) =>
      idx === i ? { ...s, [field]: field === "valor" ? Number(val) : val } : s
    );
    set("servicos", updated);
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#f5f0eb", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f0eb; }
        .tab-btn { cursor: pointer; padding: 10px 18px; border: none; background: none; font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; color: #888; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: var(--p); border-bottom-color: var(--p); }
        .tab-btn:hover { color: var(--p); }
        input, textarea, select { font-family: 'Lato', sans-serif; font-size: 13px; border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; width: 100%; background: white; color: #333; outline: none; transition: border 0.2s; }
        input:focus, textarea:focus { border-color: var(--p); }
        label { font-family: 'Lato', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #888; display: block; margin-bottom: 4px; }
        .field { margin-bottom: 14px; }
        .btn-primary { background: var(--p); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-family: 'Lato', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; cursor: pointer; transition: opacity 0.2s; }
        .btn-primary:hover { opacity: 0.85; }
        .btn-secondary { background: white; color: var(--p); border: 1.5px solid var(--p); padding: 8px 16px; border-radius: 6px; font-family: 'Lato', sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { background: var(--p); color: white; }
        .btn-danger { background: #fee; color: #c00; border: 1px solid #fcc; padding: 5px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; font-family: 'Lato', sans-serif; }
        .svc-row { background: white; border-radius: 8px; padding: 12px; margin-bottom: 8px; border: 1px solid #eee; }
        @media print {
          .no-print { display: none !important; }
          .print-area { margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
        }
      `}</style>

      <div style={{ "--p": data.corPrimaria, "--a": data.corAcento }}>

        {/* HEADER */}
        <div className="no-print" style={{ background: data.corPrimaria, color: "white", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700 }}>✿ Gerador de Propostas</div>
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: "12px", opacity: 0.7, marginTop: 2 }}>Preencha os dados e sua proposta aparece ao vivo →</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-secondary" style={{ background: "transparent", borderColor: "rgba(255,255,255,0.4)", color: "white" }}
              onClick={() => setPreview(!preview)}>
              {preview ? "✎ Editar" : "👁 Ver Prévia"}
            </button>
            <button className="btn-primary" style={{ background: data.corAcento, color: "#1a1a1a" }}
              onClick={() => window.print()}>
              🖨️ Imprimir / PDF
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 0, minHeight: "calc(100vh - 60px)" }}>

          {/* LEFT PANEL - FORM */}
          {!preview && (
            <div className="no-print" style={{ width: "360px", minWidth: "360px", background: "white", borderRight: "1px solid #e8e0d8", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", borderBottom: "1px solid #eee", padding: "0 8px" }}>
                {tabs.map((t) => (
                  <button key={t.id} className={`tab-btn${tab === t.id ? " active" : ""}`}
                    style={{ "--p": data.corPrimaria }}
                    onClick={() => setTab(t.id)}>{t.label}</button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

                {tab === "empresa" && (
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", marginBottom: 16, color: data.corPrimaria }}>Dados da Empresa</div>
                    {[["empresaNome", "Nome da Empresa"], ["empresaSlogan", "Slogan / Tagline"], ["empresaTelefone", "Telefone / WhatsApp"], ["empresaEmail", "E-mail"], ["empresaInstagram", "Instagram"]].map(([k, l]) => (
                      <div key={k} className="field">
                        <label>{l}</label>
                        <input value={data[k]} onChange={e => set(k, e.target.value)} />
                      </div>
                    ))}
                    <div className="field">
                      <label>Cor Principal</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="color" value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} style={{ width: 50, height: 36, padding: 2 }} />
                        <input value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} style={{ flex: 1 }} />
                      </div>
                    </div>
                    <div className="field">
                      <label>Cor de Destaque</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="color" value={data.corAcento} onChange={e => set("corAcento", e.target.value)} style={{ width: 50, height: 36, padding: 2 }} />
                        <input value={data.corAcento} onChange={e => set("corAcento", e.target.value)} style={{ flex: 1 }} />
                      </div>
                    </div>
                  </div>
                )}

                {tab === "cliente" && (
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", marginBottom: 16, color: data.corPrimaria }}>Dados do Cliente</div>
                    {[["clienteNome", "Nome do Cliente"], ["clienteEvento", "Tipo de Evento"], ["clienteLocal", "Local do Evento"]].map(([k, l]) => (
                      <div key={k} className="field">
                        <label>{l}</label>
                        <input value={data[k]} onChange={e => set(k, e.target.value)} />
                      </div>
                    ))}
                    <div className="field">
                      <label>Data do Evento</label>
                      <input type="date" value={data.clienteData} onChange={e => set("clienteData", e.target.value)} />
                    </div>
                  </div>
                )}

                {tab === "servicos" && (
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", marginBottom: 16, color: data.corPrimaria }}>Serviços / Itens</div>
                    {data.servicos.map((s, i) => (
                      <div key={i} className="svc-row">
                        {editingSvc === i ? (
                          <div>
                            <div className="field"><label>Nome</label><input value={s.nome} onChange={e => updateServico(i, "nome", e.target.value)} /></div>
                            <div className="field"><label>Descrição</label><input value={s.descricao} onChange={e => updateServico(i, "descricao", e.target.value)} /></div>
                            <div className="field"><label>Valor (R$)</label><input type="number" value={s.valor} onChange={e => updateServico(i, "valor", e.target.value)} /></div>
                            <button className="btn-primary" style={{ background: data.corPrimaria, fontSize: 12, padding: "6px 14px" }} onClick={() => setEditingSvc(null)}>✓ Salvar</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13, color: "#333" }}>{s.nome}</div>
                              <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{formatCurrency(s.valor)}</div>
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: 11, "--p": data.corPrimaria }} onClick={() => setEditingSvc(i)}>✎</button>
                              <button className="btn-danger" onClick={() => removeServico(i)}>✕</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div style={{ background: "#f9f6f2", borderRadius: 8, padding: 14, border: `1px dashed ${data.corAcento}`, marginTop: 8 }}>
                      <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, color: data.corPrimaria, marginBottom: 8 }}>+ Adicionar Item</div>
                      <div className="field"><label>Nome</label><input placeholder="Ex: Buquê da noiva" value={newSvc.nome} onChange={e => setNewSvc({ ...newSvc, nome: e.target.value })} /></div>
                      <div className="field"><label>Descrição</label><input placeholder="Detalhes do item" value={newSvc.descricao} onChange={e => setNewSvc({ ...newSvc, descricao: e.target.value })} /></div>
                      <div className="field"><label>Valor (R$)</label><input type="number" placeholder="0" value={newSvc.valor} onChange={e => setNewSvc({ ...newSvc, valor: e.target.value })} /></div>
                      <button className="btn-primary" style={{ background: data.corPrimaria, width: "100%" }} onClick={addServico}>Adicionar</button>
                    </div>
                  </div>
                )}

                {tab === "detalhes" && (
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", marginBottom: 16, color: data.corPrimaria }}>Condições & Detalhes</div>
                    <div className="field">
                      <label>Validade da Proposta</label>
                      <input type="date" value={data.validade} onChange={e => set("validade", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Forma de Pagamento</label>
                      <input value={data.pagamento} onChange={e => set("pagamento", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Observações</label>
                      <textarea rows={4} value={data.observacoes} onChange={e => set("observacoes", e.target.value)} style={{ resize: "vertical" }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid #eee", padding: "14px 20px", background: "#fafaf8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: "#888" }}>Total da Proposta</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: data.corPrimaria }}>{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {/* RIGHT PANEL - PREVIEW */}
          <div style={{ flex: 1, overflowY: "auto", padding: preview ? 0 : "32px", background: preview ? "white" : "#f0ebe3", display: "flex", justifyContent: "center" }}>
            <div className="print-area" style={{
              background: "white",
              width: "100%",
              maxWidth: 720,
              minHeight: 900,
              boxShadow: preview ? "none" : "0 4px 40px rgba(0,0,0,0.12)",
              borderRadius: preview ? 0 : 4,
              overflow: "hidden",
              fontFamily: "'Lato', sans-serif",
            }}>

              {/* Proposal Header */}
              <div style={{ background: data.corPrimaria, padding: "48px 52px 36px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -30, top: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                <div style={{ position: "absolute", right: 40, bottom: -60, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}>
                      {data.empresaNome || "Sua Empresa"}
                    </div>
                    {data.empresaSlogan && (
                      <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 14, color: data.corAcento, marginTop: 6, opacity: 0.9 }}>
                        {data.empresaSlogan}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ background: data.corAcento, color: "#1a1a1a", fontFamily: "'Lato', sans-serif", fontWeight: 900, fontSize: 11, letterSpacing: "0.15em", padding: "6px 14px", borderRadius: 20, display: "inline-block", textTransform: "uppercase" }}>
                      Proposta Comercial
                    </div>
                  </div>
                </div>
                <div style={{ width: 60, height: 2, background: data.corAcento, marginTop: 24, marginBottom: 20 }} />
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {data.empresaTelefone && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>📱 {data.empresaTelefone}</div>}
                  {data.empresaEmail && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>✉️ {data.empresaEmail}</div>}
                  {data.empresaInstagram && <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>📸 {data.empresaInstagram}</div>}
                </div>
              </div>

              {/* Client info bar */}
              <div style={{ background: "#f9f6f0", borderBottom: `3px solid ${data.corAcento}`, padding: "20px 52px", display: "flex", gap: 40, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Preparado para</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: data.corPrimaria, fontWeight: 700 }}>{data.clienteNome || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Evento</div>
                  <div style={{ fontSize: 14, color: "#444", fontWeight: 600 }}>{data.clienteEvento || "—"}</div>
                </div>
                {data.clienteData && <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Data</div>
                  <div style={{ fontSize: 14, color: "#444", fontWeight: 600 }}>{formatDate(data.clienteData)}</div>
                </div>}
                {data.clienteLocal && <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 4 }}>Local</div>
                  <div style={{ fontSize: 14, color: "#444", fontWeight: 600 }}>{data.clienteLocal}</div>
                </div>}
              </div>

              {/* Services */}
              <div style={{ padding: "36px 52px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 4, height: 24, background: data.corAcento, borderRadius: 2 }} />
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: data.corPrimaria, fontWeight: 700 }}>Itens da Proposta</div>
                </div>

                <div style={{ border: `1px solid #ede8e0`, borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ background: data.corPrimaria, display: "grid", gridTemplateColumns: "1fr auto", padding: "10px 20px" }}>
                    <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Serviço / Produto</div>
                    <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", textAlign: "right" }}>Valor</div>
                  </div>
                  {data.servicos.map((s, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "16px 20px", borderBottom: i < data.servicos.length - 1 ? "1px solid #f0ebe3" : "none", background: i % 2 === 0 ? "white" : "#faf8f5" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#2a2a2a", marginBottom: 3 }}>{s.nome}</div>
                        {s.descricao && <div style={{ fontSize: 12, color: "#999", lineHeight: 1.4 }}>{s.descricao}</div>}
                      </div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: data.corPrimaria, whiteSpace: "nowrap", paddingLeft: 24 }}>{formatCurrency(s.valor)}</div>
                    </div>
                  ))}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "16px 20px", background: data.corPrimaria }}>
                    <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em", color: "rgba(255,255,255,0.8)", textTransform: "uppercase" }}>Total</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: data.corAcento }}>{formatCurrency(total)}</div>
                  </div>
                </div>

                <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {data.pagamento && (
                    <div style={{ background: "#f9f6f0", borderRadius: 8, padding: "16px 18px", borderLeft: `3px solid ${data.corAcento}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 6 }}>Pagamento</div>
                      <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{data.pagamento}</div>
                    </div>
                  )}
                  {data.validade && (
                    <div style={{ background: "#f9f6f0", borderRadius: 8, padding: "16px 18px", borderLeft: `3px solid ${data.corAcento}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 6 }}>Validade</div>
                      <div style={{ fontSize: 13, color: "#555" }}>Esta proposta é válida até <strong>{formatDate(data.validade)}</strong></div>
                    </div>
                  )}
                </div>

                {data.observacoes && (
                  <div style={{ marginTop: 16, background: "#fffdf7", border: "1px solid #ede8e0", borderRadius: 8, padding: "16px 18px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 6 }}>Observações</div>
                    <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{data.observacoes}</div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ background: data.corPrimaria, padding: "24px 52px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Obrigada pela preferência! 🌸</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "white", fontWeight: 700, marginTop: 4 }}>{data.empresaNome}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Para confirmar sua proposta:</div>
                  <div style={{ color: data.corAcento, fontWeight: 700, fontSize: 13 }}>{data.empresaTelefone}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
