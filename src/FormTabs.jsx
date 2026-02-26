import { FieldGroup, FInput, FTextarea } from "./FormComponents";

export function CompanyTab({ data, set, logoSrc, logoRef, handleLogo }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, color: data.corPrimaria, marginBottom: 16 }}>Dados da Empresa</div>
      <FieldGroup label="Logo">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {logoSrc && <img src={logoSrc} style={{ height: 44, objectFit: "contain", border: "1px solid #eee", borderRadius: 4, padding: 2 }} />}
          <button onClick={() => logoRef.current.click()}
            style={{ background: "#f5f5f5", border: "1px dashed #ccc", borderRadius: 6, padding: "10px 16px", cursor: "pointer", fontSize: 13, color: "#555" }}>
            📎 {logoSrc ? "Trocar logo" : "Carregar logo"}
          </button>
          <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
        </div>
      </FieldGroup>
      {[["empresaNome","Nome da Empresa"],["empresaSubtitulo","Subtítulo"],["empresaEndereco","Endereço"],["empresaCNPJ","CNPJ"],["empresaRazaoSocial","Razão Social (assinatura)"]].map(([k,l]) => (
        <FieldGroup key={k} label={l}><FInput value={data[k]} onChange={e => set(k, e.target.value)} /></FieldGroup>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FieldGroup label="Cor Principal">
          <div style={{ display: "flex", gap: 6 }}>
            <input type="color" value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} style={{ width: 40, height: 40, border: "1px solid #ddd", borderRadius: 4, padding: 2, cursor: "pointer" }} />
            <FInput value={data.corPrimaria} onChange={e => set("corPrimaria", e.target.value)} />
          </div>
        </FieldGroup>
        <FieldGroup label="Cor Secundária">
          <div style={{ display: "flex", gap: 6 }}>
            <input type="color" value={data.corSecundaria} onChange={e => set("corSecundaria", e.target.value)} style={{ width: 40, height: 40, border: "1px solid #ddd", borderRadius: 4, padding: 2, cursor: "pointer" }} />
            <FInput value={data.corSecundaria} onChange={e => set("corSecundaria", e.target.value)} />
          </div>
        </FieldGroup>
      </div>
    </div>
  );
}

export function ClientTab({ data, set, generateProposalNumber }) {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 14, color: data.corPrimaria, marginBottom: 16 }}>Dados do Cliente</div>
      <FieldGroup label="Nº da Proposta" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, flex: 1 }}>
          <FInput value={data.propostaNumero} onChange={e => set("propostaNumero", e.target.value)} />
          <button onClick={async () => {
            const newNum = await generateProposalNumber();
            set("propostaNumero", newNum);
          }} style={{ background: data.corPrimaria, color: "white", border: "none", borderRadius: 6, padding: "10px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            🔄 Gerar
          </button>
        </div>
      </FieldGroup>
      {[["clienteNome","Nome do Cliente / Empresa"],["propostaValidade","Validade da Proposta"]].map(([k,l]) => (
        <FieldGroup key={k} label={l}><FInput value={data[k]} onChange={e => set(k, e.target.value)} /></FieldGroup>
      ))}
      <FieldGroup label="CNPJ do Cliente"><FInput value={data.clienteCNPJ} onChange={e => set("clienteCNPJ", e.target.value)} mask="cnpj" placeholder="00.000.000/0001-00" /></FieldGroup>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FieldGroup label="Data"><FInput type="date" value={data.propostaData} onChange={e => set("propostaData", e.target.value)} /></FieldGroup>
        <FieldGroup label="Status">
          <select value={data.status} onChange={e => set("status", e.target.value)} style={{ width: "100%", border: "1px solid #ddd", borderRadius: 6, padding: "10px 12px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#333", boxSizing: "border-box" }}>
            <option value="Rascunho">Rascunho</option>
            <option value="Enviada">Enviada</option>
            <option value="Aceita">Aceita</option>
            <option value="Recusada">Recusada</option>
          </select>
        </FieldGroup>
      </div>
      <FieldGroup label="Texto de Abertura"><FTextarea rows={7} value={data.introTexto} onChange={e => set("introTexto", e.target.value)} /></FieldGroup>
      <FieldGroup label="Próximos Passos"><FTextarea rows={5} value={data.proximosPassos} onChange={e => set("proximosPassos", e.target.value)} /></FieldGroup>
    </div>
  );
}
