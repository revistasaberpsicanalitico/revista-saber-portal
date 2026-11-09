'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Lock, Mail, User, Building, ArrowRight, CheckCircle2, 
  AlertCircle, KeyRound, ExternalLink
} from 'lucide-react'

export default function EmbedLogin() {
  const [session, setSession] = useState<any>(null)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [institution, setInstitution] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Redireciona a janela inteira do navegador para o portal oficial
  const redirectToPortal = () => {
    try {
      if (window.top && window.top !== window.self) {
        window.top.location.href = 'https://revista-saber-portal.vercel.app'
      } else {
        window.location.href = 'https://revista-saber-portal.vercel.app'
      }
    } catch (e) {
      window.open('https://revista-saber-portal.vercel.app', '_blank')
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage({ type: 'success', text: 'Login realizado! Abrindo o portal...' })
        setTimeout(redirectToPortal, 800)
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role: 'author', institution, phone } },
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Conta criada com sucesso! Redirecionando...' })
        setTimeout(redirectToPortal, 1200)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao processar.' })
      setLoading(false)
    }
  }

  // Se a pessoa já estiver conectada
  if (session) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-transparent font-sans">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Você já está conectado!</h3>
            <p className="text-xs text-slate-500 mt-1">Clique abaixo para acessar a sua área editorial em tela cheia.</p>
          </div>
          <button
            type="button"
            onClick={redirectToPortal}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Acessar o Portal da Revista</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-2 bg-transparent font-sans">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4">
        
        {/* Alternador Login / Cadastro */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setMessage(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              !isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {message && (
          <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
            message.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}>
            {message.type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-3">
          {!isLogin && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Instituição / Afiliação *</label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Associação / Universidade"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">E-mail *</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-slate-700">Senha *</label>
              {isLogin && (
                <a
                  href="https://revista-saber-portal.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-600 hover:underline"
                >
                  Esqueci minha senha
                </a>
              )}
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Acessando...' : isLogin ? 'Acessar o Portal Editorial' : 'Criar Conta e Acessar'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100">
          <p>Portal Oficial • Revista Saber Psicanalítico (ISSN 3086-8416)</p>
        </div>
      </div>
    </main>
  )
}
