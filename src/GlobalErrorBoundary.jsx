import React from "react";

const panelStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f8fafc",
  color: "#0f172a",
  fontFamily: "Inter, Segoe UI, sans-serif",
  padding: 24,
  boxSizing: "border-box",
};

const cardStyle = {
  width: "100%",
  maxWidth: 560,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  boxShadow: "0 16px 30px rgba(15, 23, 42, 0.08)",
  padding: 24,
};

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro de renderização capturado:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const message = this.state.error?.message || "Erro inesperado ao renderizar a aplicação.";

    return (
      <div style={panelStyle}>
        <div style={cardStyle}>
          <p style={{ margin: 0, color: "#b91c1c", fontWeight: 800, letterSpacing: "0.03em", textTransform: "uppercase", fontSize: 12 }}>
            Falha detectada
          </p>
          <h1 style={{ margin: "10px 0 12px", fontSize: 26, lineHeight: 1.2 }}>A tela branca foi interrompida.</h1>
          <p style={{ marginTop: 0, color: "#334155", lineHeight: 1.6 }}>
            O sistema capturou um erro de interface e exibiu esta tela para evitar ficar em branco.
          </p>
          <pre
            style={{
              margin: "14px 0 0",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#0f172a",
              color: "#e2e8f0",
              borderRadius: 10,
              padding: 12,
              fontSize: 12,
            }}
          >
            {message}
          </pre>

          <button
            type="button"
            onClick={this.handleReload}
            style={{
              marginTop: 16,
              border: "none",
              borderRadius: 10,
              padding: "12px 16px",
              fontWeight: 700,
              background: "#1d4ed8",
              color: "white",
              cursor: "pointer",
            }}
          >
            Recarregar aplicação
          </button>
        </div>
      </div>
    );
  }
}
