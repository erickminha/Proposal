import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import App from './App.jsx'
import AcceptInvite from './AcceptInvite.jsx'
import Auth from './Auth.jsx'
import { supabase } from './supabase.js'

function PublicHome() {
  return (
    <main style={layoutStyle}>
      <h1 style={titleStyle}>RGA Recursos Humanos</h1>
      <p style={subtitleStyle}>Bem-vindo ao portal. Escolha como deseja continuar:</p>
      <nav style={cardStyle}>
        <Link style={linkStyle} to="/trabalhe-conosco">Trabalhe Conosco</Link>
        <Link style={linkStyle} to="/portal">Portal (Login/Acesso)</Link>
        <Link style={linkStyle} to="/app">Ir para o App</Link>
      </nav>
    </main>
  )
}

function CareersPage() {
  return (
    <main style={layoutStyle}>
      <h1 style={titleStyle}>Trabalhe Conosco</h1>
      <p style={subtitleStyle}>Envie seu currículo para futuras oportunidades.</p>
      <form style={{ ...cardStyle, display: 'grid', gap: 12, minWidth: 320, maxWidth: 420 }}>
        <input placeholder="Nome completo" style={inputStyle} />
        <input type="email" placeholder="E-mail" style={inputStyle} />
        <input placeholder="Telefone" style={inputStyle} />
        <textarea placeholder="Resumo profissional" rows={4} style={inputStyle} />
        <button type="button" style={buttonStyle}>Enviar currículo</button>
      </form>
    </main>
  )
}

function PortalPage() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Auth
      onLogin={() => {
        const target = location.state?.from || '/app'
        navigate(target, { replace: true })
      }}
    />
  )
}

function AppHub() {
  return (
    <main style={layoutStyle}>
      <h1 style={titleStyle}>Hub de Módulos</h1>
      <p style={subtitleStyle}>Selecione um módulo autenticado:</p>
      <nav style={cardStyle}>
        <Link style={linkStyle} to="/app/propostas">Módulo de Propostas</Link>
      </nav>
    </main>
  )
}

function ProtectedRoute() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      setIsAuthenticated(Boolean(session?.user))
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setIsAuthenticated(Boolean(session?.user))
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <main style={layoutStyle}>
        <p style={subtitleStyle}>Validando acesso...</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

const layoutStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: '#f8fafc',
  padding: 24,
  textAlign: 'center',
}

const titleStyle = {
  margin: 0,
  color: '#0f172a',
}

const subtitleStyle = {
  margin: '12px 0 20px',
  color: '#334155',
}

const cardStyle = {
  display: 'grid',
  gap: 10,
  padding: 16,
  borderRadius: 12,
  background: 'white',
  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
}

const linkStyle = {
  color: '#1565C0',
  fontWeight: 700,
  textDecoration: 'none',
}

const inputStyle = {
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  padding: 10,
  fontFamily: 'inherit',
}

const buttonStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '10px 14px',
  background: '#1565C0',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicHome />} />
        <Route path="/trabalhe-conosco" element={<CareersPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppHub />} />
          <Route path="/app/propostas/*" element={<App />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
