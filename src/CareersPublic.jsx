import { Link } from "react-router-dom";

const sectionTitleStyle = {
  fontSize: 22,
  fontWeight: 800,
  color: "#0f172a",
  margin: "0 0 10px",
};

const sectionTextStyle = {
  margin: 0,
  fontSize: 15,
  lineHeight: 1.65,
  color: "#334155",
};

const cardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
};

export default function CareersPublic() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b3f8f 0%, #1565C0 45%, #1E88E5 100%)",
        fontFamily: "'Segoe UI', Calibri, sans-serif",
      }}
    >
      <header
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "28px 20px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.2em", fontWeight: 700, opacity: 0.85 }}>
            INSTITUTO RGA
          </div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>Trabalhe Conosco</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            to="/"
            style={{
              border: "1px solid rgba(255,255,255,0.45)",
              color: "white",
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Área interna
          </Link>
          <a
            href="#cadastro"
            style={{
              background: "white",
              color: "#0b3f8f",
              textDecoration: "none",
              padding: "10px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Cadastrar Currículo
          </a>
        </div>
      </header>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "8px 20px 44px" }}>
        <section
          style={{
            ...cardStyle,
            background:
              "linear-gradient(136deg, rgba(255,255,255,0.98) 0%, rgba(246,249,255,0.98) 100%)",
            marginBottom: 18,
          }}
        >
          <h1 style={{ fontSize: 38, margin: "0 0 12px", color: "#0f172a", fontWeight: 900 }}>
            Talentos que transformam equipes.
          </h1>
          <p style={{ ...sectionTextStyle, maxWidth: 760 }}>
            A RGA Recursos Humanos conecta profissionais a oportunidades com processo
            estruturado, abordagem humana e compromisso com qualidade. Se você busca
            crescimento profissional, envie seu currículo para nosso banco de talentos.
          </p>
        </section>

        <section style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          <article style={cardStyle}>
            <h2 style={sectionTitleStyle}>Por que cadastrar seu perfil?</h2>
            <p style={sectionTextStyle}>
              Nosso time analisa competências técnicas e comportamentais para conectar
              você com vagas compatíveis ao seu momento de carreira.
            </p>
          </article>
          <article style={cardStyle}>
            <h2 style={sectionTitleStyle}>O que avaliamos</h2>
            <p style={sectionTextStyle}>
              Experiências anteriores, expectativas, aderência cultural e potencial de
              desenvolvimento dentro das empresas parceiras do Instituto RGA.
            </p>
          </article>
          <article style={cardStyle}>
            <h2 style={sectionTitleStyle}>Transparência no processo</h2>
            <p style={sectionTextStyle}>
              Você recebe retorno nas etapas e tem acompanhamento profissional durante
              o andamento das oportunidades disponíveis.
            </p>
          </article>
        </section>

        <section id="cadastro" style={{ ...cardStyle, marginTop: 18 }}>
          <h2 style={{ ...sectionTitleStyle, marginBottom: 6 }}>Cadastro de Currículo</h2>
          <p style={{ ...sectionTextStyle, marginBottom: 18 }}>
            Preencha seus dados para ingresso no banco de talentos da RGA.
          </p>
          <form style={{ display: "grid", gap: 12 }}>
            <input placeholder="Nome completo" style={inputStyle} />
            <input type="email" placeholder="E-mail" style={inputStyle} />
            <input placeholder="Telefone (com DDD)" style={inputStyle} />
            <input placeholder="Cargo de interesse" style={inputStyle} />
            <textarea
              rows={4}
              placeholder="Resumo profissional"
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <button
              type="button"
              style={{
                border: "none",
                borderRadius: 10,
                padding: "12px 18px",
                background: "#1565C0",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              Enviar Cadastro
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1.5px solid #d7deeb",
  borderRadius: 10,
  padding: "11px 14px",
  fontSize: 14,
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "#0f172a",
};
