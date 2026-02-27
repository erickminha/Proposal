import { FieldGroup, FInput, FTextarea } from "./FormComponents";

export function CompanyTab({ data, set, logoSrc, logoRef, handleLogo }) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", marginBottom: 24, letterSpacing: "-0.02em" }}>Dados da Empresa</div>
      
      <FieldGroup label="Identidade Visual">
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 20, 
          flexWrap: "wrap", 
          background: "#f8fafc", 
          padding: "20px", 
          borderRadius: 16, 
          border: "1.5px dashed #e2e8f0" 
        }}>
          {logoSrc ? (
            <div style={{ position: "relative" }}>
              <img src={logoSrc} style={{ height: 56, objectFit: "contain", borderRadius: 8 }} />
            </div>
          ) : (
            <div style={{ width: 56, height: 56, background: "#f1f5f9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏢</div>
          )}
          <div style={{ flex: 1 }}>
            <button onClick={() => logoRef.current.click()}
              style={{ 
                background: "white", 
                border: "1.5px solid #e2e8f0", 
                borderRadius: 10, 
                padding: "10px 16px", 
                cursor: "pointer", 
                fontSize: 13, 
                fontWeight: 700, 
                color: "#475569", 
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                transition: "all 0.2s"
              }}>
              {logoSrc ? "🔄 Alterar Logo" : "📎 Carregar Logo"}
            </button>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, fontWeight: 500 }}>Formatos aceitos: PNG, JPG ou SVG.</p>
          </div>
          <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
        </div>
      </FieldGroup>

      <div style={{ display: "grid", gap: 4 }}>
        {[["empresaNome","Nome da Empresa"],["empresaSubtitulo","Slogan ou Subtítulo"],["empresaEndereco","Endereço Completo"],["empresaCNPJ","CNPJ"],["empresaRazaoSocial","Razão Social para Assinatura"]].map(([k,l]) => (
          <FieldGroup key={k} label={l}><FInput value={data[k]} onChange={e => set(k, e.target.value)} /></FieldGroup>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 8 }}>
        <FieldGroup label="Cor Principal">
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ position: "relative", width: 48, height: 48 }}>
              <input type="color" value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", opacity: 0 }} />
              <div style={{ width: "100%", height: "100%", background: data.corPrimaria, borderRadius: 10, border: "2px solid white", boxShadow: "0 0 0 1.5px #e2e8f0" }} />
            </div>
            <div style={{ flex: 1 }}><FInput value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} /></div>
          </div>
        </FieldGroup>
        <FieldGroup label="Cor Secundária">
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ position: "relative", width: 48, height: 48 }}>
              <input type="color" value={data.corSecundaria} onChange={e => set("corSecundaria", e.target.value)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", padding: 0, cursor: "pointer", opacity: 0 }} />
              <div style={{ width: "100%", height: "100%", background: data.corSecundaria, borderRadius: 10, border: "2px solid white", boxShadow: "0 0 0 1.5px #e2e8f0" }} />
            </div>
            <div style={{ flex: 1 }}><FInput value={data.corSecundaria} onChange={e => set("corSecundaria", e.target.value)} /></div>
          </div>
        </FieldGroup>
      </div>
    </div>
  );
}

export function ClientTab({ data, set }) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", marginBottom: 24, letterSpacing: "-0.02em" }}>Dados do Cliente</div>
      
      <FieldGroup label="Identificação da Proposta">
        <FInput value={data.propostaNumero} onChange={e => set("propostaNumero", e.target.value)} placeholder="Gerado automaticamente ao salvar" />
      </FieldGroup>

      <div style={{ display: "grid", gap: 4 }}>
        {[["clienteNome","Nome do Cliente ou Empresa"],["propostaValidade","Validade da Proposta"]].map(([k,l]) => (
          <FieldGroup key={k} label={l}><FInput value={data[k]} onChange={e => set(k, e.target.value)} /></FieldGroup>
        ))}
        <FieldGroup label="CNPJ do Cliente">
          <FInput value={data.clienteCNPJ} onChange={e => set("clienteCNPJ", e.target.value)} mask="cnpj" placeholder="00.000.000/0001-00" />
        </FieldGroup>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <FieldGroup label="Data de Emissão">
          <FInput type="date" value={data.propostaData} onChange={e => set("propostaData", e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Status da Proposta">
          <select value={data.status} onChange={e => set("status", e.target.value)} style={{ 
            width: "100%", 
            border: "1.5px solid #e2e8f0", 
            borderRadius: 10, 
            padding: "12px 16px", 
            fontSize: 14, 
            fontFamily: "'Inter', sans-serif", 
            outline: "none", 
            color: "#1e293b", 
            background: "#f8fafc", 
            cursor: "pointer",
            transition: "all 0.2s"
          }}>
            <option value="Rascunho">📝 Rascunho</option>
            <option value="Enviada">📤 Enviada</option>
            <option value="Aceita">✅ Aceita</option>
            <option value="Recusada">❌ Recusada</option>
          </select>
        </FieldGroup>
      </div>

      <div style={{ marginTop: 8 }}>
        <FieldGroup label="Texto de Introdução">
          <FTextarea rows={8} value={data.introTexto} onChange={e => set("introTexto", e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Próximos Passos e Fechamento">
          <FTextarea rows={5} value={data.proximosPassos} onChange={e => set("proximosPassos", e.target.value)} />
        </FieldGroup>
      </div>
    </div>
  );
}
