import { useMemo, useRef, useState } from "react";

const LAYOUT_PRESETS = {
  instagram: {
    id: "instagram",
    label: "Instagram Post (1080x1080)",
    width: 1080,
    height: 1080,
    ratio: "1 / 1",
    exportHint: "Ideal para feed do Instagram",
  },
  story: {
    id: "story",
    label: "Story (1080x1920)",
    width: 1080,
    height: 1920,
    ratio: "9 / 16",
    exportHint: "Ideal para Stories e Reels cover",
  },
  a4: {
    id: "a4",
    label: "A4 PDF",
    width: 794,
    height: 1123,
    ratio: "210 / 297",
    exportHint: "Ideal para impressão ou envio em PDF",
  },
};

const defaultData = {
  cargo: "Analista de RH",
  empresa: "Empresa Exemplo LTDA",
  local: "Manaus/AM",
  regime: "CLT • Presencial",
  salario: "A combinar",
  beneficios: "Vale transporte, Vale refeição, Plano de saúde, Day off no aniversário",
  requisitos: "Experiência com recrutamento e seleção\nBoa comunicação\nDomínio de Excel",
  atividades: "Conduzir processos seletivos\nApoiar onboarding de novos colaboradores\nAcompanhar indicadores de RH",
  cta: "Envie seu currículo para vagas@empresa.com com o assunto: Analista de RH",
  corPrimaria: "#0f172a",
  corSecundaria: "#0ea5e9",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 14,
        color: "#0f172a",
      }}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        padding: "10px 12px",
        fontSize: 14,
        color: "#0f172a",
        resize: "vertical",
      }}
    />
  );
}

export default function JobAdBuilder({ onBack }) {
  const [layout, setLayout] = useState("instagram");
  const [data, setData] = useState(defaultData);
  const [logoSrc, setLogoSrc] = useState(null);
  const fileRef = useRef(null);

  const activePreset = useMemo(() => LAYOUT_PRESETS[layout], [layout]);

  const set = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setLogoSrc(ev.target?.result || null);
    reader.readAsDataURL(file);
  };

  const listFromText = (value) =>
    String(value || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ border: "1px solid #e2e8f0", background: "#fff", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
            ← Voltar
          </button>
          <div>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>Criador de Anúncio de Vagas</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Preview em tempo real</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.values(LAYOUT_PRESETS).map((preset) => (
            <button
              key={preset.id}
              onClick={() => setLayout(preset.id)}
              style={{
                border: `1px solid ${layout === preset.id ? data.corSecundaria : "#cbd5e1"}`,
                background: layout === preset.id ? `${data.corSecundaria}15` : "white",
                color: "#0f172a",
                padding: "8px 10px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div style={{ width: 380, background: "white", borderRight: "1px solid #e2e8f0", padding: 18, overflowY: "auto" }}>
          <Field label="Cargo">
            <TextInput value={data.cargo} onChange={(e) => set("cargo", e.target.value)} />
          </Field>
          <Field label="Cliente/Empresa">
            <TextInput value={data.empresa} onChange={(e) => set("empresa", e.target.value)} />
          </Field>
          <Field label="Local">
            <TextInput value={data.local} onChange={(e) => set("local", e.target.value)} />
          </Field>
          <Field label="Regime">
            <TextInput value={data.regime} onChange={(e) => set("regime", e.target.value)} />
          </Field>
          <Field label="Salário (ou “a combinar”)">
            <TextInput value={data.salario} onChange={(e) => set("salario", e.target.value)} />
          </Field>
          <Field label="Benefícios (1 por linha)">
            <TextArea rows={3} value={data.beneficios} onChange={(e) => set("beneficios", e.target.value)} />
          </Field>
          <Field label="Requisitos (1 por linha)">
            <TextArea rows={4} value={data.requisitos} onChange={(e) => set("requisitos", e.target.value)} />
          </Field>
          <Field label="Atividades (1 por linha)">
            <TextArea rows={4} value={data.atividades} onChange={(e) => set("atividades", e.target.value)} />
          </Field>
          <Field label="CTA de candidatura">
            <TextArea rows={3} value={data.cta} onChange={(e) => set("cta", e.target.value)} />
          </Field>

          <Field label="Logo do cliente">
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => fileRef.current?.click()} style={{ border: "1px solid #cbd5e1", background: "white", padding: "8px 12px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                {logoSrc ? "Trocar logo" : "Upload logo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
              {logoSrc && <img src={logoSrc} alt="logo" style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 8, border: "1px solid #e2e8f0" }} />}
            </div>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Cor primária">
              <div style={{ display: "flex", gap: 6 }}>
                <input type="color" value={data.corPrimaria} onChange={(e) => set("corPrimaria", e.target.value)} />
                <TextInput value={data.corPrimaria} onChange={(e) => set("corPrimaria", e.target.value)} />
              </div>
            </Field>
            <Field label="Cor de destaque">
              <div style={{ display: "flex", gap: 6 }}>
                <input type="color" value={data.corSecundaria} onChange={(e) => set("corSecundaria", e.target.value)} />
                <TextInput value={data.corSecundaria} onChange={(e) => set("corSecundaria", e.target.value)} />
              </div>
            </Field>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 28, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
              {activePreset.label} • {activePreset.width}x{activePreset.height} • {activePreset.exportHint}
            </div>
            <div
              style={{
                width: "min(100%, 540px)",
                aspectRatio: activePreset.ratio,
                background: "white",
                borderRadius: 20,
                border: "1px solid #cbd5e1",
                boxShadow: "0 20px 45px rgba(15,23,42,.15)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ background: data.corPrimaria, color: "white", padding: "7% 7% 6%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: "clamp(12px,1.8vw,18px)", fontWeight: 600, opacity: 0.95 }}>{data.empresa || "Empresa"}</div>
                  {logoSrc && <img src={logoSrc} alt="logo" style={{ maxHeight: 54, maxWidth: 120, objectFit: "contain", background: "#fff", borderRadius: 8, padding: 6 }} />}
                </div>
                <div style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 900, lineHeight: 1.05, marginTop: 16 }}>{data.cargo || "Cargo"}</div>
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[data.local, data.regime, data.salario].filter(Boolean).map((tag) => (
                    <span key={tag} style={{ background: "rgba(255,255,255,.17)", border: "1px solid rgba(255,255,255,.4)", borderRadius: 999, padding: "6px 10px", fontSize: "clamp(10px,1.4vw,14px)", fontWeight: 700 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ padding: "6.5% 7%", flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <h4 style={{ color: data.corSecundaria, margin: "0 0 8px", fontSize: "clamp(12px,1.8vw,18px)" }}>Benefícios</h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "clamp(10px,1.5vw,14px)", lineHeight: 1.45, color: "#1e293b" }}>
                    {listFromText(data.beneficios).map((item) => <li key={item}>{item}</li>)}
                  </ul>

                  <h4 style={{ color: data.corSecundaria, margin: "16px 0 8px", fontSize: "clamp(12px,1.8vw,18px)" }}>Requisitos</h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "clamp(10px,1.5vw,14px)", lineHeight: 1.45, color: "#1e293b" }}>
                    {listFromText(data.requisitos).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: data.corSecundaria, margin: "0 0 8px", fontSize: "clamp(12px,1.8vw,18px)" }}>Atividades</h4>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: "clamp(10px,1.5vw,14px)", lineHeight: 1.45, color: "#1e293b" }}>
                    {listFromText(data.atividades).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <div style={{ padding: "0 7% 7%" }}>
                <div style={{ background: data.corSecundaria, color: "white", borderRadius: 12, padding: "10px 14px", fontSize: "clamp(11px,1.6vw,16px)", fontWeight: 700, lineHeight: 1.4 }}>
                  {data.cta || "CTA de candidatura"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
