import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "./supabase";

export default function PublicApplication() {
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get("proposal_id");
  const sourceCampaignFromUrl = searchParams.get("source_campaign") || "direct";

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    curriculoUrl: "",
    mensagem: "",
    sourceCampaign: sourceCampaignFromUrl,
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const referralSummary = useMemo(() => {
    if (!proposalId) return `Origem da campanha: ${form.sourceCampaign}`;
    return `Vaga: ${proposalId} • Origem da campanha: ${form.sourceCampaign}`;
  }, [proposalId, form.sourceCampaign]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback("");

    const payload = {
      proposal_id: proposalId,
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      curriculo_url: form.curriculoUrl,
      mensagem: form.mensagem,
      source_campaign: form.sourceCampaign || "direct",
      metadata: {
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      },
    };

    const { error } = await supabase.from("candidaturas_publicas").insert(payload);
    setSaving(false);

    if (error) {
      setFeedback(`❌ Não foi possível enviar a candidatura: ${error.message}`);
      return;
    }

    setFeedback("✅ Candidatura enviada com sucesso!");
    setForm((prev) => ({
      ...prev,
      nome: "",
      email: "",
      telefone: "",
      curriculoUrl: "",
      mensagem: "",
    }));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 540,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24, color: "#0f172a" }}>Envie seu currículo</h1>
        <p style={{ color: "#475569", fontSize: 14, marginTop: 8, marginBottom: 20 }}>
          Preencha os dados abaixo para se candidatar à vaga.
        </p>

        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>{referralSummary}</div>

        {[
          ["nome", "Nome completo", "text", true],
          ["email", "E-mail", "email", true],
          ["telefone", "Telefone", "text", false],
          ["curriculoUrl", "Link do currículo (Drive, Dropbox, etc.)", "url", true],
        ].map(([key, label, type, required]) => (
          <label key={key} style={{ display: "block", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>{label}</div>
            <input
              type={type}
              value={form[key]}
              required={required}
              onChange={(event) => set(key, event.target.value)}
              style={{
                width: "100%",
                border: "1px solid #cbd5e1",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 14,
                outline: "none",
              }}
            />
          </label>
        ))}

        <label style={{ display: "block", marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Mensagem (opcional)</div>
          <textarea
            rows={4}
            value={form.mensagem}
            onChange={(event) => set("mensagem", event.target.value)}
            style={{
              width: "100%",
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>source_campaign</div>
          <input
            type="text"
            value={form.sourceCampaign}
            onChange={(event) => set("sourceCampaign", event.target.value)}
            style={{
              width: "100%",
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 14,
              outline: "none",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: "100%",
            border: "none",
            borderRadius: 10,
            padding: "12px 14px",
            fontWeight: 700,
            fontSize: 14,
            background: "#0f766e",
            color: "white",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Enviando..." : "Enviar candidatura"}
        </button>

        {feedback && (
          <div style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: feedback.includes("❌") ? "#b91c1c" : "#047857" }}>
            {feedback}
          </div>
        )}
      </form>
    </div>
  );
}
