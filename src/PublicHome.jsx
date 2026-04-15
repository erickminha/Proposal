import { Link } from "react-router-dom";

const sectionCardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 24,
  boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)",
};

export default function PublicHome() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#0f172a" }}>
      <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#1d4ed8", letterSpacing: 0.5 }}>RGA</div>
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Recursos Humanos</div>
        </div>
        <Link
          to="/portal"
          style={{
            textDecoration: "none",
            background: "#0f172a",
            color: "white",
            padding: "10px 16px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Acesso ao Portal
        </Link>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 72px", display: "flex", flexDirection: "column", gap: 36 }}>
        <section style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)", borderRadius: 16, color: "white", padding: "48px 36px", boxShadow: "0 16px 38px rgba(37, 99, 235, 0.28)" }}>
          <p style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.95, fontWeight: 700 }}>Instituto RGA</p>
          <h1 style={{ marginTop: 8, fontSize: 36, lineHeight: 1.2 }}>Conectando talentos e empresas com eficiência, segurança e resultado.</h1>
          <p style={{ marginTop: 14, maxWidth: 760, lineHeight: 1.6, opacity: 0.95 }}>
            Soluções completas em recrutamento e seleção para candidatos e empresas que buscam crescimento com as pessoas certas.
          </p>

          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link
              to="/candidatura"
              style={{ textDecoration: "none", background: "white", color: "#1d4ed8", padding: "12px 18px", borderRadius: 10, fontWeight: 800 }}
            >
              Cadastrar Currículo
            </Link>
            <Link
              to="/portal"
              style={{ textDecoration: "none", background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.45)", padding: "12px 18px", borderRadius: 10, fontWeight: 700 }}
            >
              Sou empresa / Solicitar diagnóstico
            </Link>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          <article style={sectionCardStyle}>
            <h2 style={{ fontSize: 20, marginBottom: 10 }}>Serviços</h2>
            <p style={{ color: "#475569", lineHeight: 1.55 }}>
              Recrutamento e seleção, mapeamento comportamental, triagem técnica e suporte especializado para contratação.
            </p>
          </article>

          <article style={sectionCardStyle}>
            <h2 style={{ fontSize: 20, marginBottom: 10 }}>Vagas</h2>
            <p style={{ color: "#475569", lineHeight: 1.55 }}>
              Encontre oportunidades alinhadas ao seu perfil e aumente sua chance de contratação com suporte da equipe RGA.
            </p>
          </article>

          <article style={sectionCardStyle}>
            <h2 style={{ fontSize: 20, marginBottom: 10 }}>Contato</h2>
            <p style={{ color: "#475569", lineHeight: 1.55 }}>
              Fale com nosso time para tirar dúvidas e entender como podemos apoiar sua carreira ou sua empresa.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
