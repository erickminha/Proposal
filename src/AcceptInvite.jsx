import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabase'
import {
  acceptInviteForUser,
  clearPendingInviteToken,
  getInviteTokenFromUrl,
  savePendingInviteToken,
  validateInviteToken,
} from './inviteAcceptance'

export default function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('Validando convite...')
  const [error, setError] = useState('')
  const [sessionUser, setSessionUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token') || getInviteTokenFromUrl()

    const checkAuthAndAccept = async () => {
      const { data } = await supabase.auth.getSession()
      const currentUser = data?.session?.user || null
      setSessionUser(currentUser)

      if (!token) {
        setError('Token inválido ou ausente.')
        setStatus('Não foi possível validar o convite.')
        return
      }

      if (!currentUser) {
        const validation = await validateInviteToken(token)
        if (!validation.ok) {
          setError(validation.reason)
          setStatus('Não foi possível validar o convite.')
          return
        }

        savePendingInviteToken(token)
        setStatus('Convite válido e salvo. Faça login/cadastro para concluir o aceite.')
        return
      }

      setStatus('Aceitando convite...')
      const result = await acceptInviteForUser({ token, user: currentUser })

      if (!result.ok) {
        setError(result.reason)
        setStatus('Não foi possível aceitar o convite.')
        return
      }

      clearPendingInviteToken()
      setStatus('Convite aceito com sucesso!')
      setTimeout(() => navigate('/', { replace: true }), 1200)
    }

    checkAuthAndAccept()
  }, [navigate, searchParams])

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f8fafc', fontFamily: "'Segoe UI', Calibri, sans-serif" }}>
      <div style={{ background: 'white', width: '100%', maxWidth: 540, borderRadius: 14, padding: 28, boxShadow: '0 12px 36px rgba(15,23,42,0.12)' }}>
        <h1 style={{ marginTop: 0, fontSize: 22, color: '#0f172a' }}>Aceitar convite</h1>
        <p style={{ color: '#334155', marginBottom: 12 }}>{status}</p>
        {error && <p style={{ color: '#b91c1c', fontWeight: 600, marginBottom: 12 }}>⚠️ {error}</p>}

        {!sessionUser && (
          <p style={{ margin: 0 }}>
            <Link to="/" style={{ color: '#1565C0', fontWeight: 700 }}>Ir para login/cadastro</Link>
          </p>
        )}
      </div>
    </div>
  )
}
