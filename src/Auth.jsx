import { useState } from "react";
import { supabase } from "./supabase";
import { runOnboarding } from "./onboarding";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!email || !password) { setError("Preencha e-mail e senha."); return; }
    if (mode === "register" && !nome) { setError("Informe seu nome."); return; }
    if (mode === "register" && !companyName) { setError("Informe o nome da empresa."); return; }
    if (password.length < 6) { setError("Senha deve ter ao menos 6 caracteres."); return; }

    setLoading(true);
    try {
      if (mode === "register") {
        const { data, error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { nome, company_name: companyName } }
        });
        if (err) throw err;
        if (data.user && !data.session) {
          setSuccess("Conta criada! Verifique seu e-mail para confirmar o cadastro. O vínculo com empresa será concluído automaticamente no primeiro login confirmado.");
        } else if (data.session) {
          await runOnboarding(companyName);
          onLogin(data.session.user);
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        onLogin(data.user);
      }
    } catch (err) {
      const msgs = {
        "Invalid login credentials": "E-mail ou senha incorretos.",
        "User already registered": "Este e-mail já está cadastrado.",
        "Email not confirmed": "Confirme seu e-mail antes de entrar.",
      };
      setError(msgs[err.message] || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #1E88E5 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      fontFamily: "'Segoe UI', Calibri, sans-serif"
    }}>
      {/* Background decoration */}
      <div style={{ position: "fixed", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

      <div style={{
        background: "white", borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
      }}>
        {/* Logo/Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1565C0", letterSpacing: 1 }}>RGA</div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", color: "#888", textTransform: "uppercase" }}>Gerador de Propostas</div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "#f0f4f8", borderRadius: 10, padding: 4, marginBottom: 28 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
              style={{
                flex: 1, padding: "9px 0", border: "none", borderRadius: 8, cursor: "pointer",
                fontWeight: 700, fontSize: 13, transition: "all 0.2s",
                background: mode === m ? "white" : "transparent",
                color: mode === m ? "#1565C0" : "#888",
                boxShadow: mode === m ? "0 1px 6px rgba(0,0,0,0.12)" : "none",
              }}>
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <>
              <div>
                <label style={labelStyle}>Nome completo</label>
                <input value={nome} onChange={e => setNome(e.target.value)} onKeyDown={handleKey}
                  placeholder="Seu nome" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Empresa</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} onKeyDown={handleKey}
                  placeholder="Nome da empresa" style={inputStyle} />
              </div>
            </>
          )}
          <div>
            <label style={labelStyle}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
              placeholder="seu@email.com" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
              placeholder={mode === "register" ? "Mínimo 6 caracteres" : "••••••••"} style={inputStyle} />
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px", marginTop: 16, fontSize: 13, color: "#c00" }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: "#f0fff4", border: "1px solid #9ee", borderRadius: 8, padding: "10px 14px", marginTop: 16, fontSize: 13, color: "#086" }}>
            ✅ {success}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: "100%", marginTop: 22, padding: "13px 0", border: "none", borderRadius: 10,
            background: loading ? "#90b8e0" : "#1976D2", color: "white",
            fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: 0.5, transition: "background 0.2s"
          }}>
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>

        {mode === "login" && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={async () => {
              if (!email) { setError("Digite seu e-mail para recuperar a senha."); return; }
              setLoading(true);
              await supabase.auth.resetPasswordForEmail(email);
              setLoading(false);
              setSuccess("E-mail de recuperação enviado!");
            }} style={{ background: "none", border: "none", color: "#1976D2", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              Esqueci minha senha
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
  textTransform: "uppercase", color: "#888", marginBottom: 5
};

const inputStyle = {
  width: "100%", border: "1.5px solid #e0e6ef", borderRadius: 8, padding: "11px 14px",
  fontSize: 14, fontFamily: "inherit", outline: "none", color: "#333",
  transition: "border 0.2s", WebkitAppearance: "none", boxSizing: "border-box"
};
