import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import pptxgen from "pptxgenjs";
import { supabase } from "./supabase"; // ajuste o caminho conforme seu projeto

// ---------------------------------------------------------------------------
// LAYOUT PRESETS
// ---------------------------------------------------------------------------
const LAYOUT_PRESETS = {
  instagram: {
    id: "instagram",
    label: "Instagram Post (1080x1080)",
    width: 1080,
    height: 1080,
    ratio: "1 / 1",
    pptxW: 10,
    pptxH: 10,
    exportHint: "Ideal para feed do Instagram",
  },
  story: {
    id: "story",
    label: "Story (1080x1920)",
    width: 1080,
    height: 1920,
    ratio: "9 / 16",
    pptxW: 10,
    pptxH: 17.77,
    exportHint: "Ideal para Stories e Reels cover",
  },
  a4: {
    id: "a4",
    label: "A4 PDF",
    width: 794,
    height: 1123,
    ratio: "210 / 297",
    pptxW: 10,
    pptxH: 14.14,
    exportHint: "Ideal para impressão ou envio",
  },
};

const defaultData = {
  cargo: "Analista de RH",
  empresa: "Empresa Exemplo LTDA",
  local: "Manaus/AM",
  regime: "CLT • Presencial",
  salario: "A combinar",
  beneficios:
    "Vale transporte\nVale refeição\nPlano de saúde\nDay off no aniversário",
  requisitos:
    "Experiência com recrutamento e seleção\nBoa comunicação\nDomínio de Excel",
  atividades:
    "Conduzir processos seletivos\nApoiar onboarding de novos colaboradores\nAcompanhar indicadores de RH",
  cta: "Envie seu currículo para vagas@empresa.com com o assunto: Analista de RH",
  corPrimaria: "#0f172a",
  corSecundaria: "#0ea5e9",
};

// ---------------------------------------------------------------------------
// HELPERS DE FORMULÁRIO
// ---------------------------------------------------------------------------
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: "#475569",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  color: "#0f172a",
  boxSizing: "border-box",
};

function TextInput(props) {
  return <input {...props} style={inputStyle} />;
}

function TextArea(props) {
  return (
    <textarea {...props} style={{ ...inputStyle, resize: "vertical" }} />
  );
}

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------------------
export default function JobAdBuilder({ onBack }) {
  const [layout, setLayout] = useState("instagram");
  const [data, setData] = useState(defaultData);
  const [logoSrc, setLogoSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState({ msg: "", ok: true });

  const fileRef = useRef(null);
  const adPreviewRef = useRef(null);

  const activePreset = useMemo(() => LAYOUT_PRESETS[layout], [layout]);

  const set = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  const listFromText = (value) =>
    String(value || "")
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

  const showStatus = (msg, ok = true, ms = 4000) => {
    setStatus({ msg, ok });
    setTimeout(() => setStatus({ msg: "", ok: true }), ms);
  };

  // -------------------------------------------------------------------------
  // LOGO UPLOAD
  // -------------------------------------------------------------------------
  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoSrc(ev.target?.result || null);
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------------------
  // 1. CAPTURA HTML → CANVAS → base64 (reutilizado pelos dois exporters)
  //    Faz um clone do elemento em tamanho REAL (preset width/height),
  //    renderiza fora do ecrã e devolve o canvas.
  // -------------------------------------------------------------------------
  const captureCanvas = async () => {
    const el = adPreviewRef.current;
    if (!el) throw new Error("Preview não encontrado");

    const { width, height } = activePreset;

    // Clona o nó e força o tamanho real do preset
    const clone = el.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.top = "-99999px";
    clone.style.left = "-99999px";
    clone.style.width = width + "px";
    clone.style.height = height + "px";
    clone.style.overflow = "hidden";
    // Remove sombra e borda decorativas para exportação limpa
    clone.style.boxShadow = "none";
    clone.style.border = "none";
    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,           // 2× = alta resolução (ex: 2160×2160 para Instagram)
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        logging: false,
      });
      return canvas;
    } finally {
      document.body.removeChild(clone);
    }
  };

  // -------------------------------------------------------------------------
  // 2. EXPORTAR JPG
  // -------------------------------------------------------------------------
  const handleExportJpg = async () => {
    setIsProcessing(true);
    showStatus("⏳ A gerar imagem...", true, 60000);
    try {
      const canvas = await captureCanvas();
      const link = document.createElement("a");
      link.download = `Anuncio-${data.cargo.replace(/\s+/g, "-")}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.92);
      link.click();
      showStatus("✅ JPG descarregado!");
    } catch (err) {
      console.error(err);
      showStatus("❌ Erro ao gerar JPG.", false);
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------------------
  // 3. GUARDAR NO SUPABASE (inclui thumbnail base64 para histórico visual)
  // -------------------------------------------------------------------------
  const handleSaveToDatabase = async () => {
    setIsProcessing(true);
    showStatus("⏳ A guardar...", true, 60000);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilizador não autenticado");

      // Gera thumbnail de baixa resolução (scale 0.5) para não sobrecarregar a BD
      let thumbnailBase64 = null;
      try {
        const el = adPreviewRef.current;
        if (el) {
          const thumbCanvas = await html2canvas(el, {
            scale: 0.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
          });
          thumbnailBase64 = thumbCanvas.toDataURL("image/jpeg", 0.7);
        }
      } catch (_) {
        // thumbnail é opcional — não bloqueia o save
      }

      const { error } = await supabase.from("job_ads").insert({
        user_id: user.id,
        cargo: data.cargo,
        empresa: data.empresa,
        layout,
        dados: data,                     // todos os campos do anúncio
        thumbnail: thumbnailBase64,      // preview visual para o histórico
        logo: logoSrc,                   // logo em base64 (pode ser null)
        criado_em: new Date().toISOString(),
      });

      if (error) throw error;
      showStatus("✅ Guardado no histórico!");
    } catch (err) {
      console.error(err);
      showStatus("❌ Erro ao guardar: " + err.message, false);
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------------------
  // 4. EXPORTAR POWERPOINT EDITÁVEL
  //    Todos os valores de posição são números (inches) — sem strings "%".
  //    O conteúdo é inserido como texto nativo do PowerPoint, 100% editável.
  // -------------------------------------------------------------------------
  const handleExportPptx = async () => {
    setIsProcessing(true);
    showStatus("⏳ A gerar PowerPoint...", true, 60000);
    try {
      const pres = new pptxgen();
      const W = activePreset.pptxW;   // largura total em polegadas
      const H = activePreset.pptxH;   // altura total em polegadas

      pres.defineLayout({ name: "CUSTOM", width: W, height: H });
      pres.layout = "CUSTOM";

      const slide = pres.addSlide();
      const pri = data.corPrimaria.replace("#", "");
      const sec = data.corSecundaria.replace("#", "");
      const MARGIN = W * 0.07;          // 7% de margem lateral
      const CONTENT_W = W - MARGIN * 2;
      const HEADER_H = H * 0.34;        // Cabeçalho ocupa 34% da altura

      // --- CABEÇALHO (bloco de fundo primário) ---
      slide.addShape(pres.ShapeType.rect, {
        x: 0, y: 0, w: W, h: HEADER_H,
        fill: { color: pri },
      });

      // Logo (se existir) — canto superior direito
      if (logoSrc && logoSrc.startsWith("data:image")) {
        const ext = logoSrc.startsWith("data:image/png") ? "png" : "jpg";
        slide.addImage({
          data: logoSrc,
          x: W - MARGIN - 1.4,
          y: H * 0.025,
          w: 1.4,
          h: 0.55,
        });
      }

      // Empresa
      slide.addText(data.empresa || "Empresa", {
        x: MARGIN, y: H * 0.03, w: W - MARGIN * 2 - 1.6, h: 0.4,
        fontSize: Math.round(W * 1.8),
        color: "FFFFFF", bold: true,
      });

      // Cargo
      slide.addText(data.cargo || "Cargo", {
        x: MARGIN, y: H * 0.1, w: CONTENT_W, h: H * 0.14,
        fontSize: Math.round(W * 4.4),
        color: "FFFFFF", bold: true,
      });

      // Tags (local | regime | salário)
      const tags = [data.local, data.regime, data.salario]
        .filter(Boolean)
        .join("   |   ");
      slide.addText(tags, {
        x: MARGIN, y: H * 0.27, w: CONTENT_W, h: H * 0.05,
        fontSize: Math.round(W * 1.4),
        color: "DDDDDD",
      });

      // --- CORPO: grid 2 colunas ---
      const COL_W = CONTENT_W / 2 - 0.1;
      const COL1_X = MARGIN;
      const COL2_X = MARGIN + COL_W + 0.2;
      const BODY_TOP = HEADER_H + H * 0.03;

      // Coluna 1 — Benefícios
      slide.addText("Benefícios", {
        x: COL1_X, y: BODY_TOP, w: COL_W, h: 0.4,
        fontSize: Math.round(W * 2.0),
        color: sec, bold: true,
      });
      slide.addText(
        listFromText(data.beneficios).map((t) => ({ text: "• " + t + "\n" })),
        {
          x: COL1_X, y: BODY_TOP + 0.42, w: COL_W, h: H * 0.20,
          fontSize: Math.round(W * 1.4),
          color: "333333", valign: "top",
        }
      );

      // Coluna 1 — Requisitos
      const REQ_TOP = BODY_TOP + H * 0.24;
      slide.addText("Requisitos", {
        x: COL1_X, y: REQ_TOP, w: COL_W, h: 0.4,
        fontSize: Math.round(W * 2.0),
        color: sec, bold: true,
      });
      slide.addText(
        listFromText(data.requisitos).map((t) => ({ text: "• " + t + "\n" })),
        {
          x: COL1_X, y: REQ_TOP + 0.42, w: COL_W, h: H * 0.20,
          fontSize: Math.round(W * 1.4),
          color: "333333", valign: "top",
        }
      );

      // Coluna 2 — Atividades
      slide.addText("Atividades", {
        x: COL2_X, y: BODY_TOP, w: COL_W, h: 0.4,
        fontSize: Math.round(W * 2.0),
        color: sec, bold: true,
      });
      slide.addText(
        listFromText(data.atividades).map((t) => ({ text: "• " + t + "\n" })),
        {
          x: COL2_X, y: BODY_TOP + 0.42, w: COL_W, h: H * 0.44,
          fontSize: Math.round(W * 1.4),
          color: "333333", valign: "top",
        }
      );

      // --- RODAPÉ CTA ---
      const CTA_H = H * 0.08;
      const CTA_Y = H - CTA_H - H * 0.04;
      slide.addShape(pres.ShapeType.roundRect, {
        x: MARGIN, y: CTA_Y, w: CONTENT_W, h: CTA_H,
        fill: { color: sec },
        rectRadius: 0.12,
      });
      slide.addText(data.cta, {
        x: MARGIN, y: CTA_Y, w: CONTENT_W, h: CTA_H,
        align: "center", valign: "middle",
        fontSize: Math.round(W * 1.6),
        color: "FFFFFF", bold: true,
      });

      await pres.writeFile({
        fileName: `Anuncio-${data.cargo.replace(/\s+/g, "-")}.pptx`,
      });
      showStatus("✅ PowerPoint descarregado!");
    } catch (err) {
      console.error(err);
      showStatus("❌ Erro ao gerar PPTX: " + err.message, false);
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              border: "1px solid #e2e8f0",
              background: "#fff",
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ← Voltar
          </button>
          <div>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>
              Criador de Anúncio de Vagas
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Preview em tempo real
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Status feedback */}
          {status.msg && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: status.ok ? "#059669" : "#dc2626",
                background: status.ok ? "#f0fdf4" : "#fef2f2",
                padding: "6px 12px",
                borderRadius: 8,
                border: `1px solid ${status.ok ? "#bbf7d0" : "#fecaca"}`,
              }}
            >
              {status.msg}
            </span>
          )}

          <button
            onClick={handleSaveToDatabase}
            disabled={isProcessing}
            style={{
              border: "none",
              background: "#e2e8f0",
              color: "#0f172a",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: isProcessing ? "wait" : "pointer",
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            💾 Gravar Histórico
          </button>

          <button
            onClick={handleExportPptx}
            disabled={isProcessing}
            style={{
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#0f172a",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: isProcessing ? "wait" : "pointer",
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            📊 Exportar PPTX Editável
          </button>

          <button
            onClick={handleExportJpg}
            disabled={isProcessing}
            style={{
              border: "none",
              background: data.corPrimaria,
              color: "white",
              padding: "8px 14px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: isProcessing ? "wait" : "pointer",
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            {isProcessing ? "⏳ Processando..." : "🖼️ Descarregar JPG"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* ── SIDEBAR FORMULÁRIO ── */}
        <div
          style={{
            width: 380,
            minWidth: 280,
            background: "white",
            borderRight: "1px solid #e2e8f0",
            padding: 18,
            overflowY: "auto",
          }}
        >
          <Field label="Formato da Arte">
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                fontSize: 14,
              }}
            >
              {Object.values(LAYOUT_PRESETS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cargo">
            <TextInput
              value={data.cargo}
              onChange={(e) => set("cargo", e.target.value)}
            />
          </Field>
          <Field label="Cliente / Empresa">
            <TextInput
              value={data.empresa}
              onChange={(e) => set("empresa", e.target.value)}
            />
          </Field>
          <Field label="Local">
            <TextInput
              value={data.local}
              onChange={(e) => set("local", e.target.value)}
            />
          </Field>
          <Field label="Regime">
            <TextInput
              value={data.regime}
              onChange={(e) => set("regime", e.target.value)}
            />
          </Field>
          <Field label='Salário (ou "a combinar")'>
            <TextInput
              value={data.salario}
              onChange={(e) => set("salario", e.target.value)}
            />
          </Field>
          <Field label="Benefícios (1 por linha)">
            <TextArea
              rows={3}
              value={data.beneficios}
              onChange={(e) => set("beneficios", e.target.value)}
            />
          </Field>
          <Field label="Requisitos (1 por linha)">
            <TextArea
              rows={4}
              value={data.requisitos}
              onChange={(e) => set("requisitos", e.target.value)}
            />
          </Field>
          <Field label="Atividades (1 por linha)">
            <TextArea
              rows={4}
              value={data.atividades}
              onChange={(e) => set("atividades", e.target.value)}
            />
          </Field>
          <Field label="CTA de candidatura">
            <TextArea
              rows={3}
              value={data.cta}
              onChange={(e) => set("cta", e.target.value)}
            />
          </Field>

          <Field label="Logo do cliente">
            <div
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  border: "1px solid #cbd5e1",
                  background: "white",
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {logoSrc ? "Trocar logo" : "Upload logo"}
              </button>
              <input
                ref={fileRef}
                type="file"
             accept="image/*"
                style={{ display: "none" }}
                onChange={handleLogo}
              />
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt="logo"
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
              )}
            </div>
          </Field>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <Field label="Cor primária">
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="color"
                  value={data.corPrimaria}
                  onChange={(e) => set("corPrimaria", e.target.value)}
                  style={{ width: 36, height: 36, borderRadius: 6, border: "none", cursor: "pointer" }}
                />
                <TextInput
                  value={data.corPrimaria}
                  onChange={(e) => set("corPrimaria", e.target.value)}
                />
              </div>
            </Field>
            <Field label="Cor de destaque">
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="color"
                  value={data.corSecundaria}
                  onChange={(e) => set("corSecundaria", e.target.value)}
                  style={{ width: 36, height: 36, borderRadius: 6, border: "none", cursor: "pointer" }}
                />
                <TextInput
                  value={data.corSecundaria}
                  onChange={(e) => set("corSecundaria", e.target.value)}
                />
              </div>
            </Field>
          </div>
        </div>

        {/* ── ÁREA DE PREVIEW ── */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 28,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              {activePreset.label} • {activePreset.width}×{activePreset.height}{" "}
              • {activePreset.exportHint}
            </div>

            {/*
              O preview é renderizado com max-width 540px para caber no ecrã.
              Na exportação, captureCanvas() clona este elemento e força
              o tamanho real do preset (ex: 1080×1080) antes de chamar
              html2canvas — garantindo alta resolução no ficheiro final.
            */}
            <div
              ref={adPreviewRef}
              style={{
                width: "min(100%, 540px)",
                aspectRatio: activePreset.ratio,
                background: "white",
                border: "1px solid #cbd5e1",
                boxShadow: "0 20px 45px rgba(15,23,42,.15)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* — Cabeçalho — */}
              <div
                style={{
                  background: data.corPrimaria,
                  color: "white",
                  padding: "7% 7% 6%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: "clamp(12px,1.8vw,18px)",
                      fontWeight: 600,
                      opacity: 0.95,
                    }}
                  >
                    {data.empresa || "Empresa"}
                  </div>
                  {logoSrc && (
                    <img
                      src={logoSrc}
                      alt="logo"
                      crossOrigin="anonymous"
                      style={{
                        maxHeight: 54,
                        maxWidth: 120,
                        objectFit: "contain",
                        background: "#fff",
                        borderRadius: 8,
                        padding: 6,
                      }}
                    />
                  )}
                </div>
                <div
                  style={{
                    fontSize: "clamp(24px,4vw,42px)",
                    fontWeight: 900,
                    lineHeight: 1.05,
                    marginTop: 16,
                  }}
                >
                  {data.cargo || "Cargo"}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {[data.local, data.regime, data.salario]
                    .filter(Boolean)
                    .map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "rgba(255,255,255,.17)",
                          border: "1px solid rgba(255,255,255,.4)",
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontSize: "clamp(10px,1.4vw,14px)",
                          fontWeight: 700,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>

              {/* — Corpo — */}
              <div
                style={{
                  padding: "6.5% 7%",
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                }}
              >
                <div>
                  <h4
                    style={{
                      color: data.corSecundaria,
                      margin: "0 0 8px",
                      fontSize: "clamp(12px,1.8vw,18px)",
                    }}
                  >
                    Benefícios
                  </h4>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: "clamp(10px,1.5vw,14px)",
                      lineHeight: 1.45,
                      color: "#1e293b",
                    }}
                  >
                    {listFromText(data.beneficios).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <h4
                    style={{
                      color: data.corSecundaria,
                      margin: "16px 0 8px",
                      fontSize: "clamp(12px,1.8vw,18px)",
                    }}
                  >
                    Requisitos
                  </h4>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: "clamp(10px,1.5vw,14px)",
                      lineHeight: 1.45,
                      color: "#1e293b",
                    }}
                  >
                    {listFromText(data.requisitos).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4
                    style={{
                      color: data.corSecundaria,
                      margin: "0 0 8px",
                      fontSize: "clamp(12px,1.8vw,18px)",
                    }}
                  >
                    Atividades
                  </h4>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: "clamp(10px,1.5vw,14px)",
                      lineHeight: 1.45,
                      color: "#1e293b",
                    }}
                  >
                    {listFromText(data.atividades).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* — Rodapé CTA — */}
              <div style={{ padding: "0 7% 7%" }}>
                <div
                  style={{
                    background: data.corSecundaria,
                    color: "white",
                    borderRadius: 12,
                    padding: "10px 14px",
                    fontSize: "clamp(11px,1.6vw,16px)",
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
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