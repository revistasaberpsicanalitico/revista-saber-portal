'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  BookOpen, User, Lock, Mail, Building, Phone, ArrowRight, 
  Upload, FileText, CheckCircle, Clock, AlertCircle, LogOut, 
  ShieldCheck, Users
} from 'lucide-react'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Estados de Auth
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [institution, setInstitution] = useState('')
  const [phone, setPhone] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Estados do Autor
  const [authorArticles, setAuthorArticles] = useState<any[]>([])
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newAbstract, setNewAbstract] = useState('')
  const [newKeywords, setNewKeywords] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Estados do Editor
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [allProfiles, setAllProfiles] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) initUser(session)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) initUser(session)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Inicializa ou recupera o perfil do usuário
  const initUser = async (currentSession: any) => {
    const user = currentSession.user
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        if (data.role === 'editor') fetchEditorData()
        else fetchAuthorArticles(user.id)
      } else {
        // Cria perfil básico caso ainda não exista
        const fallbackProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Autor',
          email: user.email || '',
          role: 'author',
          institution: user.user_metadata?.institution || 'Associação Saber Psicanalítico',
          phone: user.user_metadata?.phone || '',
        }
        await supabase.from('profiles').upsert(fallbackProfile)
        setProfile(fallbackProfile)
        fetchAuthorArticles(user.id)
      }
    } catch (err) {
      console.error(err)
      // Mesmo com erro, garante que a tela abra
      setProfile({ full_name: user.email?.split('@')[0], role: 'author' })
    } finally {
      setLoading(false)
    }
  }

  const fetchAuthorArticles = async (authorId: string) => {
    try {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false })
      if (data) setAuthorArticles(data)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchEditorData = async () => {
    try {
      const { data: articles } = await supabase
        .from('articles')
        .select('*, profiles(full_name, email, institution)')
        .order('created_at', { ascending: false })
      if (articles) setAllArticles(articles)

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')
      if (profiles) setAllProfiles(profiles)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'author',
              institution,
              phone,
            },
          },
        })
        if (error) throw error
        setAuthMessage({
          type: 'success',
          text: 'Conta criada! Faça login com seu e-mail e senha.',
        })
        setIsLogin(true)
      }
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err.message || 'Erro ao processar.' })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !session) return
    setSubmitting(true)

    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${session.user.id}_${Date.now()}.${fileExt}`
      const filePath = `artigos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('manuscritos')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('articles').insert({
        author_id: session.user.id,
        title: newTitle,
        abstract: newAbstract,
        keywords: newKeywords,
        file_url: filePath,
        status: 'submetido',
      })

      if (insertError) throw insertError

      alert('Trabalho submetido com sucesso à Revista!')
      setShowSubmitModal(false)
      setNewTitle('')
      setNewAbstract('')
      setNewKeywords('')
      setSelectedFile(null)
      fetchAuthorArticles(session.user.id)
    } catch (err: any) {
      alert(`Erro na submissão: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadFile = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('manuscritos')
        .createSignedUrl(filePath, 60)

      if (error) throw error
      if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    } catch (err: any) {
      alert('Erro ao baixar arquivo.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Carregando Revista Saber Psicanalítico...
      </div>
    )
  }

  // TELA DE LOGIN / CADASTRO
  if (!session) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-full mb-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 text-center">
              Revista Saber Psicanalítico
            </h1>
            <p className="text-sm text-slate-500 text-center mt-1">
              Sistema de Submissão e Avaliação Editorial
            </p>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setAuthMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setAuthMessage(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Cadastrar como Autor
            </button>
          </div>

          {authMessage && (
            <div
              className={`p-3 rounded-lg text-sm mb-4 ${
                authMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {authMessage.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nome Completo do Autor
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Dr. Fulano de Tal"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Instituição / Vínculo
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Ex: Associação Saber Psicanalítico / USP"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 90000-0000"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {authLoading ? 'Processando...' : isLogin ? 'Acessar o Portal' : 'Cadastrar como Autor'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    )
  }

  // TELA LOGADA
  const isEditor = profile?.role === 'editor'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                Revista Saber Psicanalítico
              </h1>
              <p className="text-xs text-slate-500">
                Portal Editorial • Conectado como{' '}
                <span className="font-semibold text-indigo-600 uppercase">
                  {isEditor ? 'Editor Geral' : 'Autor'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:inline">
              Olá, <strong>{profile?.full_name || 'Colega'}</strong>
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* SE NÃO FOR EDITOR -> SEMPRE MOSTRA O PAINEL DO AUTOR */}
        {!isEditor ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Meus Trabalhos Submetidos</h2>
                <p className="text-sm text-slate-500">
                  Acompanhe em tempo real o status de avaliação e as devolutivas dos seus artigos.
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 text-sm"
              >
                <Upload className="w-4 h-4" />
                Submeter Novo Trabalho
              </button>
            </div>

            {authorArticles.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">Nenhum trabalho submetido ainda</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Clique no botão azul acima para enviar seu texto (.doc, .docx ou .pdf) para avaliação editorial.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {authorArticles.map((art) => (
                  <div key={art.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {art.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          Enviado em {new Date(art.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">{art.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{art.abstract}</p>
                    </div>

                    <div className="flex flex-col justify-center gap-2 min-w-[200px]">
                      <button
                        onClick={() => handleDownloadFile(art.file_url)}
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        Baixar Manuscrito Enviado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* PAINEL DO EDITOR */
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-700 mb-1">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Painel do Editor Geral</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Gestão de Artigos e Pareceristas</h2>
              <p className="text-sm text-slate-500">
                Visualize todos os manuscritos enviados e gerencie os avaliadores.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Todos os Artigos Recebidos ({allArticles.length})
              </h3>

              <div className="grid gap-4">
                {allArticles.length === 0 ? (
                  <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-400 text-sm">
                    Nenhum artigo submetido até o momento.
                  </div>
                ) : (
                  allArticles.map((art) => (
                    <div key={art.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm p-4">
                      <h4 className="text-base font-bold">{art.title}</h4>
                      <p className="text-xs text-slate-500">Autor: {art.profiles?.full_name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE SUBMISSÃO */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Submeter Trabalho para Avaliação</h3>

            <form onSubmit={handleSubmitArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Artigo</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Digite o título do trabalho"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resumo (Abstract)</label>
                <textarea
                  required
                  rows={4}
                  value={newAbstract}
                  onChange={(e) => setNewAbstract(e.target.value)}
                  placeholder="Insira o resumo do artigo..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Palavras-chave</label>
                <input
                  type="text"
                  required
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  placeholder="Ex: Psicanálise, Clínica, Transferência"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Arquivo do Manuscrito (.doc, .docx ou .pdf)</label>
                <input
                  type="file"
                  required
                  accept=".doc,.docx,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Concluir Submissão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
