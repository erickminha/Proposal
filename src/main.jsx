import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import AcceptInvite from './AcceptInvite.jsx'
import PublicHome from './PublicHome.jsx'
import CandidatePage from './CandidatePage.jsx'
import GlobalErrorBoundary from './GlobalErrorBoundary.jsx'

function RuntimeFallback({ message }) {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', padding: 24 }}>
      <div style={{ maxWidth: 560, width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
        <p style={{ margin: 0, color: '#b91c1c', fontWeight: 800, fontSize: 12, textTransform: 'uppercase' }}>Erro de execução</p>
        <h1 style={{ margin: '10px 0 8px', fontSize: 24 }}>Evitamos a tela branca automaticamente.</h1>
        <p style={{ marginTop: 0, color: '#334155' }}>Um erro fora da renderização foi interceptado.</p>
        <pre style={{ background: '#0f172a', color: '#e2e8f0', borderRadius: 10, padding: 12, whiteSpace: 'pre-wrap' }}>{message}</pre>
      </div>
    </div>
  )
}

function RuntimeGuard({ children }) {
  const [runtimeError, setRuntimeError] = useState('')

  useEffect(() => {
    const handleError = (event) => {
      const nextMessage = event?.error?.message || event?.message || 'Erro inesperado em tempo de execução.'
      console.error('Erro global capturado:', event?.error || event)
      setRuntimeError(nextMessage)
    }

    const handleRejection = (event) => {
      const reason = event?.reason
      const nextMessage = reason?.message || String(reason || 'Promise rejeitada sem motivo explícito.')
      console.error('Rejeição não tratada capturada:', reason)
      setRuntimeError(nextMessage)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  if (runtimeError) {
    return <RuntimeFallback message={runtimeError} />
  }

  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <RuntimeGuard>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicHome />} />
            <Route path="/portal" element={<App />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/candidatura" element={<CandidatePage />} />
            <Route path="/trabalhe-conosco" element={<Navigate to="/candidatura" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </RuntimeGuard>
    </GlobalErrorBoundary>
  </React.StrictMode>,
)
