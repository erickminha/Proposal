import { useEffect, useMemo, useRef, useState } from "react";
import { submitCandidate } from "./supabase";

const PRIMARY = "#1976D2";
const SECONDARY = "#E53935";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx"];

function normalizePhone(value) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatWhatsapp(value) {
  const digits = normalizePhone(value);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validateFile(file) {
  if (!file) {
    return "Anexe seu currículo em PDF, DOC ou DOCX.";
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Formato inválido. Use PDF, DOC ou DOCX.";
  }

  if (!ACCEPTED_TYPES.includes(file.type) && file.type !== "") {
    return "Tipo de arquivo não permitido.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Arquivo excede 5MB. Envie uma versão menor do currículo.";
  }

  return null;
}

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar Turnstile")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar Turnstile"));
    document.head.appendChild(script);
  });
}

export default function CandidatePage() {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const fallbackEmail = import.meta.env.VITE_RECRUITMENT_EMAIL || "contato@rga.com.br";
  const fallbackWhatsapp = import.meta.env.VITE_RECRUITMENT_WHATSAPP || "5592999999999";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    cityState: "",
    desiredRole: "",
    message: "",
    lgpdConsent: false,
    website: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(!siteKey);
  const [turnstileError, setTurnstileError] = useState("");

  const turnstileContainerRef = useRef(null);
  const turnstileWidgetRef = useRef(null);

  const isUnavailable = status.type === "error";

  useEffect(() => {
    if (!siteKey || !turnstileContainerRef.current) {
      return undefined;
    }

    let mounted = true;

    loadTurnstileScript()
      .then(() => {
        if (!mounted || !window.turnstile || !turnstileContainerRef.current) {
          return;
        }

        turnstileWidgetRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            setTurnstileToken(token);
            setTurnstileError("");
          },
          "expired-callback": () => setTurnstileToken(""),
          "error-callback": () => {
            setTurnstileToken("");
            setTurnstileError("Não foi possível validar o captcha. Tente novamente.");
          },
        });
        setTurnstileReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setTurnstileReady(false);
        setTurnstileError("Proteção antispam indisponível no momento. Tente novamente em instantes.");
      });

    return () => {
      mounted = false;
      if (window.turnstile && turnstileWidgetRef.current) {
        window.turnstile.remove(turnstileWidgetRef.current);
      }
    };
  }, [siteKey]);

  const whatsappHref = useMemo(() => {
    const cleaned = fallbackWhatsapp.replace(/\D/g, "");
    return `https://wa.me/${cleaned}`;
  }, [fallbackWhatsapp]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Informe seu nome completo.";
    if (!form.email.trim()) nextErrors.email = "Informe seu e-mail.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Digite um e-mail válido.";
    if (!normalizePhone(form.whatsapp)) nextErrors.whatsapp = "Informe seu WhatsApp.";
    if (!form.cityState.trim()) nextErrors.cityState = "Informe cidade/UF.";
    if (!form.desiredRole.trim()) nextErrors.desiredRole = "Informe o cargo de interesse.";
    if (!form.message.trim()) nextErrors.message = "Conte brevemente sobre seu perfil.";

    const fileError = validateFile(resumeFile);
    if (fileError) nextErrors.resumeFile = fileError;

    if (!form.lgpdConsent) nextErrors.lgpdConsent = "Você precisa aceitar o tratamento de dados (LGPD).";
    if (siteKey && !turnstileToken) nextErrors.turnstile = "Confirme a validação antispam.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "idle", message: "" });

    if (!validate()) {
      setStatus({ type: "error", message: "Revise os campos destacados e tente novamente." });
      return;
    }

    if (form.website) {
      setStatus({ type: "success", message: "Recebemos seu cadastro. Obrigado pelo interesse!" });
      return;
    }

    try {
      const arrayBuffer = await resumeFile.arrayBuffer();
      const bytes = Array.from(new Uint8Array(arrayBuffer));

      await submitCandidate({
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        whatsapp: normalizePhone(form.whatsapp),
        city_state: form.cityState.trim(),
        desired_role: form.desiredRole.trim(),
        message: form.message.trim(),
        lgpd_consent: form.lgpdConsent,
        turnstile_token: turnstileToken || null,
        resume: {
          filename: resumeFile.name,
          type: resumeFile.type || "application/octet-stream",
          size: resumeFile.size,
          bytes,
        },
      });

      setStatus({ type: "success", message: "Cadastro enviado com sucesso! Nossa equipe entrará em contato." });
      setForm({
        fullName: "",
        email: "",
        whatsapp: "",
        cityState: "",
        desiredRole: "",
        message: "",
        lgpdConsent: false,
        website: "",
      });
      setResumeFile(null);
      setTurnstileToken("");
      if (siteKey && window.turnstile && turnstileWidgetRef.current) {
        window.turnstile.reset(turnstileWidgetRef.current);
      }
    } catch (error) {
      setStatus({ type: "error", message: error?.message || "Não foi possível enviar agora. Tente novamente." });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, Arial, sans-serif", color: "#0f172a" }}>
      <header style={{ background: `linear-gradient(115deg, ${PRIMARY} 0%, #0f4ba5 60%, #0b2f63 100%)`, color: "white" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "72px 20px 56px" }}>
          <p style={{ margin: 0, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.88 }}>RGA Recursos Humanos</p>
          <h1 style={{ margin: "12px 0 16px", fontSize: "clamp(2rem, 5vw, 2.9rem)", lineHeight: 1.1 }}>Faça parte do nosso banco de talentos</h1>
          <p style={{ margin: 0, maxWidth: 620, fontSize: 17, lineHeight: 1.6, opacity: 0.95 }}>
            Compartilhe seu currículo e perfil profissional. Nossa equipe analisa cada candidatura com cuidado para conectar você às melhores oportunidades.
          </p>
          <a href="#form-candidatura" style={{ display: "inline-block", marginTop: 26, background: SECONDARY, color: "white", padding: "13px 20px", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
            Quero me candidatar
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 20px 56px", display: "grid", gap: 20 }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { title: "Triagem técnica", text: "Validação de competências para cada vaga." },
            { title: "Avaliação comportamental", text: "Análise de aderência ao perfil e cultura." },
            { title: "Retorno transparente", text: "Atualizações sobre o andamento da candidatura." },
          ].map((item) => (
            <article key={item.title} style={{ background: "white", padding: 18, borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)" }}>
              <h3 style={{ margin: "0 0 8px", color: PRIMARY, fontSize: 18 }}>{item.title}</h3>
              <p style={{ margin: 0, color: "#334155", lineHeight: 1.5 }}>{item.text}</p>
            </article>
          ))}
        </section>

        <section id="form-candidatura" style={{ background: "white", borderRadius: 16, border: "1px solid #dbeafe", padding: 22, boxShadow: "0 8px 30px rgba(15, 23, 42, 0.07)" }}>
          <h2 style={{ marginTop: 0, fontSize: 25 }}>Cadastro de candidato</h2>
          <p style={{ marginTop: 4, color: "#475569" }}>Preencha os dados abaixo. Campos com * são obrigatórios.</p>

          {status.type !== "idle" && (
            <div style={{ borderRadius: 10, padding: "12px 14px", marginBottom: 16, background: status.type === "success" ? "#ecfdf3" : "#fff1f2", color: status.type === "success" ? "#166534" : "#9f1239" }}>
              {status.message}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: 14 }}>
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={(e) => setField("website", e.target.value)}
              autoComplete="off"
              tabIndex={-1}
              style={{ position: "absolute", left: -9999, width: 1, height: 1, opacity: 0 }}
              aria-hidden="true"
            />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
              <Field label="Nome completo *" error={errors.fullName}>
                <input style={fieldInputStyle} value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="Digite seu nome" />
              </Field>

              <Field label="E-mail *" error={errors.email}>
                <input style={fieldInputStyle} type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="voce@exemplo.com" />
              </Field>

              <Field label="WhatsApp *" error={errors.whatsapp}>
                <input style={fieldInputStyle} value={form.whatsapp} onChange={(e) => setField("whatsapp", formatWhatsapp(e.target.value))} placeholder="(92) 99999-9999" />
              </Field>

              <Field label="Cidade/UF *" error={errors.cityState}>
                <input style={fieldInputStyle} value={form.cityState} onChange={(e) => setField("cityState", e.target.value)} placeholder="Manaus/AM" />
              </Field>

              <Field label="Cargo de interesse *" error={errors.desiredRole}>
                <input style={fieldInputStyle} value={form.desiredRole} onChange={(e) => setField("desiredRole", e.target.value)} placeholder="Ex: Analista de RH" />
              </Field>

              <Field label="Upload de currículo *" error={errors.resumeFile} hint="PDF, DOC ou DOCX (máximo 5MB)">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setResumeFile(file);
                    setErrors((prev) => ({ ...prev, resumeFile: file ? validateFile(file) : "Anexe seu currículo." }));
                  }}
                />
              </Field>
            </div>

            <Field label="Mensagem *" error={errors.message}>
              <textarea style={fieldTextAreaStyle} rows={5} value={form.message} onChange={(e) => setField("message", e.target.value)} placeholder="Conte sobre sua experiência, disponibilidade e objetivos." />
            </Field>

            {siteKey && (
              <div>
                <div ref={turnstileContainerRef} />
                {(errors.turnstile || turnstileError || !turnstileReady) && (
                  <p style={{ color: "#b91c1c", marginTop: 6, marginBottom: 0, fontSize: 13 }}>{errors.turnstile || turnstileError || "Carregando proteção antispam..."}</p>
                )}
              </div>
            )}

            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "#1e293b", fontSize: 14 }}>
              <input
                type="checkbox"
                checked={form.lgpdConsent}
                onChange={(e) => setField("lgpdConsent", e.target.checked)}
                style={{ marginTop: 4 }}
              />
              <span>
                Autorizo o tratamento dos meus dados pessoais para fins de recrutamento e seleção, conforme a LGPD. *
                {errors.lgpdConsent && <span style={{ display: "block", color: "#b91c1c", marginTop: 6 }}>{errors.lgpdConsent}</span>}
              </span>
            </label>

            <button type="submit" style={{ border: "none", borderRadius: 10, background: PRIMARY, color: "white", fontSize: 16, fontWeight: 700, padding: "13px 16px", cursor: "pointer" }}>
              Enviar candidatura
            </button>
          </form>
        </section>

        <section style={{ background: isUnavailable ? "#fff7ed" : "#eff6ff", border: `1px solid ${isUnavailable ? "#fed7aa" : "#bfdbfe"}`, borderRadius: 14, padding: 18 }}>
          <h3 style={{ marginTop: 0, color: isUnavailable ? "#9a3412" : "#1d4ed8" }}>Canal alternativo de contato</h3>
          <p style={{ marginTop: 0, color: "#334155" }}>
            {isUnavailable
              ? "Estamos com instabilidade no formulário. Envie seu currículo por um dos canais abaixo."
              : "Se preferir, também podemos receber seu currículo diretamente por WhatsApp ou e-mail."}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a href={whatsappHref} target="_blank" rel="noreferrer" style={fallbackButtonStyle}>WhatsApp</a>
            <a href={`mailto:${fallbackEmail}`} style={fallbackButtonStyle}>E-mail</a>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children, error, hint }) {
  return (
    <label style={{ display: "grid", gap: 6, fontSize: 14, color: "#334155" }}>
      <span style={{ fontWeight: 700 }}>{label}</span>
      {children}
      {hint && !error && <span style={{ fontSize: 12, color: "#64748b" }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: "#b91c1c" }}>{error}</span>}
    </label>
  );
}

const fallbackButtonStyle = {
  display: "inline-block",
  textDecoration: "none",
  fontWeight: 700,
  color: "#0f172a",
  background: "white",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
};


const fieldInputStyle = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "11px 12px",
  fontSize: 14,
  color: "#0f172a",
  boxSizing: "border-box",
  background: "#fff",
};

const fieldTextAreaStyle = {
  ...fieldInputStyle,
  resize: "vertical",
  minHeight: 120,
  fontFamily: "inherit",
};
