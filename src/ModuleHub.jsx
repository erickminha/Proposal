const ROLE_LABELS = {
  owner: "Owner",
  admin: "Admin",
  recruiter: "Recruiter",
};

const MODULES = [
  {
    id: "propostas",
    title: "Propostas",
    description: "Crie, edite e acompanhe propostas comerciais enviadas aos clientes.",
    allowedRoles: ["owner", "admin", "recruiter"],
  },
  {
    id: "parecer-candidato",
    title: "Parecer de Candidato",
    description: "Centralize avaliações técnicas e comportamentais dos candidatos.",
    allowedRoles: ["owner", "admin", "recruiter"],
  },
  {
    id: "gerador-anuncios",
    title: "Gerador de Anúncios (PDF/JPG)",
    description: "Monte anúncios de vagas prontos para exportar em PDF ou JPG.",
    allowedRoles: ["owner", "admin"],
  },
  {
    id: "banco-curriculos",
    title: "Banco de Currículos",
    description: "Consulte e organize currículos para acelerar o fechamento das vagas.",
    allowedRoles: ["owner", "admin", "recruiter"],
  },
];

export default function ModuleHub({ user, role, onOpenModule, onSignOut }) {
  const normalizedRole = role || "recruiter";
  const roleLabel = ROLE_LABELS[normalizedRole] || ROLE_LABELS.recruiter;

  const handleOpenModule = (moduleId, hasAccess) => {
    if (!hasAccess) return;
    onOpenModule?.(moduleId);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#0f172a" }}>RGA RH - Painel de Controle</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
              {user?.email} • Perfil: <strong style={{ color: "#334155" }}>{roleLabel}</strong>
            </p>
          </div>
          <button
            onClick={onSignOut}
            style={{ border: "1px solid #e2e8f0", background: "white", color: "#475569", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer" }}
          >
            🚪 Sair
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {MODULES.map((module) => {
            const hasAccess = module.allowedRoles.includes(normalizedRole);
            return (
              <article key={module.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{module.title}</div>
                <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.5, minHeight: 64 }}>{module.description}</p>
                {!hasAccess && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 999, width: "fit-content", padding: "2px 10px" }}>
                    Sem acesso para o seu perfil
                  </div>
                )}
                <button
                  onClick={() => handleOpenModule(module.id, hasAccess)}
                  disabled={!hasAccess}
                  style={{
                    marginTop: "auto",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontWeight: 700,
                    cursor: hasAccess ? "pointer" : "not-allowed",
                    background: hasAccess ? "#1d4ed8" : "#cbd5e1",
                    color: "white",
                  }}
                >
                  Entrar no módulo
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
