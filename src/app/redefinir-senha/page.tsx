'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

export default function RedefinirSenha() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    // 1. Processa código de segurança da URL (?code=...)
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data?.session) {
          setReady(true)
        } else {
          checkSession()
        }
      })
    } else {
      checkSession()
    }

    // 2. Escuta se a sessão foi recuperada pelo link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setReady(true)
    } else {
      setTimeout(async () => {
        const { data: { session: retry } } = await supabase.auth.getSession()
        if (retry) setReady(true)
      }, 1200)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas digitadas não coincidem. Verifique e tente novamente.' })
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Sessão expirada. Por favor, solicite um novo link de recuperação no portal.')
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setMessage({
        type: 'success',
        text: 'Senha redefinida com sucesso! Entrando no portal...',
      })
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao redefinir senha.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-6 space-y-3">
          <img
            src="/logo-revista.png"
            alt="Revista Saber Psicanalítico"
            className="h-28 object-contain drop-shadow-sm"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-800">
              Revista Saber Psicanalítico
            </h1>
            <p className="text-xs text-indigo-700 font-semibold tracking-wider uppercase mt-0.5">
              ISSN 3086-8416
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Redefinição de Senha de Acesso
            </p>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
            message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            {message.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nova Senha *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Confirmar Nova Senha *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Salvando nova senha...' : 'Redefinir e Entrar no Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <a href="/" className="text-xs text-indigo-600 hover:underline">
            Voltar para a página de Login
          </a>
        </div>
      </div>
    </main>
  )
}
