export default function AppShell({
  moduleName,
  breadcrumb = [],
  onBackToHub,
  topActions,
  userEmail,
  children,
}) {
  const sidebarItems = [
    { label: "Hub", icon: "🏠" },
    { label: "Propostas", icon: "📄", active: true },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#f1f5f9", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <aside
        className="no-print"
        style={{
          width: 250,
          borderRight: "1px solid #e2e8f0",
          background: "#0f172a",
          color: "#e2e8f0",
          padding: "24px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 4 }}>
            Workspace
          </div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>Proposal Hub</div>
          {userEmail && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>{userEmail}</div>}
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderRadius: 10,
                padding: "10px 12px",
                background: item.active ? "#1e293b" : "transparent",
                color: item.active ? "#fff" : "#cbd5e1",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <header
          className="no-print"
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "14px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
              {breadcrumb.join(" / ")}
            </div>
            <div style={{ fontSize: 20, color: "#0f172a", fontWeight: 800 }}>{moduleName}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {topActions}
            <button
              onClick={onBackToHub}
              style={{
                background: "#f8fafc",
                color: "#334155",
                border: "1px solid #cbd5e1",
                padding: "9px 14px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              ← Voltar ao Hub
            </button>
          </div>
        </header>

        <main style={{ flex: 1, minHeight: 0 }}>{children}</main>
      </div>
    </div>
  );
}
