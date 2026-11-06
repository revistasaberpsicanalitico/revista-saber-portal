'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  BookOpen, User, Lock, Mail, Building, Phone, ArrowRight, 
  Upload, FileText, LogOut, ShieldCheck, Users, UserCheck, 
  Download, MessageSquare, Send, CheckCircle2
} from 'lucide-react'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'author' | 'reviewer' | 'editor'>('author')
  const [loading, setLoading] = useState(true)

  // Auth States
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [institution, setInstitution] = useState('')
  const [phone, setPhone] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  // Data States
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [allProfiles, setAllProfiles] = useState<any[]>([])
  const [allReviews, setAllReviews] = useState<any[]>([])

  // Modal Submissão
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newAbstract, setNewAbstract] = useState('')
  const [newKeywords, setNewKeywords] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Modal Atribuir Parecerista (Editor)
  const [assignModalArticle, setAssignModalArticle] = useState<any>(null)
  const [selectedReviewerId, setSelectedReviewerId] = useState('')

  // Modal Parecer Psicanalítico (Parecerista)
  const [reviewModalData, setReviewModalData] = useState<any>(null)
  const [critTitle, setCritTitle] = useState('satisfatorio')
  const [critTheory, setCritTheory] = useState('consistente')
  const [critClinical, setCritClinical] = useState('alta')
  const [recommendation, setRecommendation] = useState('aceitar')
  const [commentsAuthor, setCommentsAuthor] = useState('')
  const [commentsEditor, setCommentsEditor] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

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
        setViewMode(data.role === 'editor' ? 'editor' : data.role === 'reviewer' ? 'reviewer' : 'author')
      } else {
        const fallbackProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'José Aniervson Souza dos Santos',
          email: user.email || '',
          role: 'editor',
          institution: 'Associação Saber Psicanalítico',
          phone: '',
        }
        await supabase.from('profiles').upsert(fallbackProfile)
        setProfile(fallbackProfile)
        setViewMode('editor')
      }
      fetchAllData()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllData = async () => {
    try {
      const { data: profiles } = await supabase.from('profiles').select('*').order('full_name')
      if (profiles) setAllProfiles(profiles)

      const { data: articles } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
      if (articles) setAllArticles(articles)

      const { data: reviews } = await supabase.from('reviews').select('*')
      if (reviews) setAllReviews(reviews)
    } catch (e) {
      console.error(e)
    }
  }

  const getAuthorName = (authorId: string) => {
    const p = allProfiles.find((x) => x.id === authorId)
    return p ? p.full_name : 'Autor da Revista'
  }

  const getAuthorEmail = (authorId: string) => {
    const p = allProfiles.find((x) => x.id === authorId)
    return p ? p.email : ''
  }

  const getAuthorInst = (authorId: string) => {
    const p = allProfiles.find((x) => x.id === authorId)
    return p ? p.institution || '-' : '-'
  }

  const getArticleReviews = (articleId: string) => {
    return allReviews.filter((r) => r.article_id === articleId)
  }

  const getReviewerName = (reviewerId: string) => {
    const p = allProfiles.find((x) => x.id === reviewerId)
    return p ? p.full_name : 'Parecerista Designado'
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

      alert('Trabalho submetido com sucesso!')
      setShowSubmitModal(false)
      setNewTitle('')
      setNewAbstract('')
      setNewKeywords('')
      setSelectedFile(null)
      fetchAllData()
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

  const handleUpdateStatus = async (articleId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ status })
        .eq('id', articleId)
      if (error) throw error
      alert(`Status atualizado para: ${status.replace('_', ' ').toUpperCase()}`)
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      if (error) throw error
      alert('Função do usuário atualizada com sucesso!')
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleAssignReviewer = async () => {
    if (!selectedReviewerId || !assignModalArticle) return
    try {
      const { error } = await supabase.from('reviews').insert({
        article_id: assignModalArticle.id,
        reviewer_id: selectedReviewerId,
        status: 'pendente',
      })
      if (error) throw error

      await supabase.from('articles').update({ status: 'em_avaliacao' }).eq('id', assignModalArticle.id)

      alert('Parecerista atribuído com sucesso!')
      setAssignModalArticle(null)
      setSelectedReviewerId('')
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewModalData) return
    setSubmittingReview(true)
    try {
      const fullComments = `--- AVALIAÇÃO DOS CRITÉRIOS EDITORIAIS ---\n• Título e Resumo: ${critTitle.toUpperCase()}\n• Consistência Teórico-Psicanalítica: ${critTheory.toUpperCase()}\n• Relevância para a Clínica: ${critClinical.toUpperCase()}\n\n--- PARECER DESCRITIVO E ORIENTAÇÕES AO AUTOR ---\n${commentsAuthor}`

      const { error } = await supabase
        .from('reviews')
        .update({
          recommendation,
          comments_for_author: fullComments,
          confidential_comments_editor: commentsEditor,
          status: 'concluido',
        })
        .eq('id', reviewModalData.id)

      if (error) throw error
      alert('Parecer emitido com sucesso! Muito obrigado pela sua contribuição com a Revista Saber Psicanalítico.')
      setReviewModalData(null)
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Carregando Revista Saber Psicanalítico...
      </div>
    )
  }

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
            <div className="p-3 rounded-lg text-sm mb-4 bg-rose-50 text-rose-700 border border-rose-200">
              {authMessage.text}
            </div>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault()
            setAuthLoading(true)
            try {
              if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
              } else {
                const { error } = await supabase.auth.signUp({
                  email,
                  password,
                  options: { data: { full_name: fullName, role: 'author', institution, phone } },
                })
                if (error) throw error
                setAuthMessage({ type: 'success', text: 'Conta criada! Faça login com seu e-mail e senha.' })
                setIsLogin(true)
              }
            } catch (err: any) {
              setAuthMessage({ type: 'error', text: err.message || 'Erro ao processar.' })
            } finally {
              setAuthLoading(false)
            }
          }} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Dr. Fulano de Tal"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Instituição</label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Ex: Associação Saber Psicanalítico"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm disabled:opacity-50"
            >
              {authLoading ? 'Processando...' : isLogin ? 'Acessar o Portal' : 'Cadastrar como Autor'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  const myAuthorArticles = allArticles.filter((art) => art.author_id === session?.user?.id)
  const myReviewAssignments = allReviews.filter((r) => r.reviewer_id === session?.user?.id)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                Revista Saber Psicanalítico
              </h1>
              <p className="text-xs text-slate-500">
                Portal Editorial • Visualizando como{' '}
                <span className="font-semibold text-indigo-600 uppercase">
                  {viewMode === 'editor' ? 'Editor Geral' : viewMode === 'reviewer' ? 'Parecerista' : 'Autor'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* SE FOR EDITOR -> Tem as 3 visões */}
            {profile?.role === 'editor' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'editor' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Painel Editor
                </button>
                <button
                  onClick={() => setViewMode('reviewer')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'reviewer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Visão Parecerista
                </button>
                <button
                  onClick={() => setViewMode('author')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'author' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Visão Autor
                </button>
              </div>
            )}

            {/* SE FOR PARECERISTA (Ex: Maria José) -> Tem abas duplas: Parecerista e Autor */}
            {profile?.role === 'reviewer' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setViewMode('reviewer')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'reviewer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Avaliações (Parecerista)
                </button>
                <button
                  onClick={() => setViewMode('author')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === 'author' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Meus Trabalhos (Autor)
                </button>
              </div>
            )}

            <span className="text-sm text-slate-600 hidden md:inline">
              Olá, <strong>{profile?.full_name}</strong>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* ========================================================= */}
        {/* VISÃO DO AUTOR */}
        {/* ========================================================= */}
        {viewMode === 'author' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Meus Trabalhos Submetidos</h2>
                <p className="text-sm text-slate-500">
                  Acompanhe em tempo real as decisões e orientações de correção do conselho editorial.
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

            {myAuthorArticles.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">Nenhum trabalho submetido ainda</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Clique no botão azul acima para submeter seu artigo à Revista.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myAuthorArticles.map((art) => {
                  const revs = getArticleReviews(art.id).filter((r) => r.status === 'concluido')
                  return (
                    <div key={art.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            art.status === 'aceito' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            art.status === 'recusado' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            art.status === 'correcoes_pendentes' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}>
                            {art.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400">
                            Enviado em {new Date(art.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">{art.title}</h3>
                        <p className="text-sm text-slate-600">{art.abstract}</p>

                        {/* Devolutivas anônimas */}
                        {revs.length > 0 && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Pareceres e Devolutivas da Revista:
                            </h5>
                            {revs.map((rev, idx) => (
                              <div key={rev.id} className="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200">
                                <span className="font-semibold text-indigo-700">
                                  Parecer {idx + 1} ({rev.recommendation?.replace('_', ' ').toUpperCase()}):
                                </span>
                                <p className="mt-1 whitespace-pre-line text-slate-600">{rev.comments_for_author}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-center min-w-[200px]">
                        <button
                          onClick={() => handleDownloadFile(art.file_url)}
                          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-600" />
                          Baixar Manuscrito Enviado
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VISÃO DO PARECERISTA (DUPLO-CEGO) */}
        {/* ========================================================= */}
        {viewMode === 'reviewer' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800">Trabalhos Atribuídos para Avaliação</h2>
              <p className="text-sm text-slate-500">
                Avaliação Duplo-Cega (*Double-Blind Review*): a autoria permanece em sigilo.
              </p>
            </div>

            {myReviewAssignments.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">Nenhum manuscrito aguardando seu parecer</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Quando a comissão editorial atribuir um artigo a você, ele aparecerá nesta tela para avaliação.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myReviewAssignments.map((rev) => {
                  const art = allArticles.find((a) => a.id === rev.article_id)
                  return (
                    <div key={rev.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            rev.status === 'concluido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {rev.status === 'concluido' ? 'PARECER ENVIADO' : 'AGUARDANDO SEU PARECER'}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 mt-2">{art?.title || 'Artigo'}</h3>
                          <p className="text-xs text-slate-500 mt-1">Palavras-chave: {art?.keywords}</p>
                        </div>

                        {art && (
                          <button
                            onClick={() => handleDownloadFile(art.file_url)}
                            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            Baixar Artigo (Sem Identificação)
                          </button>
                        )}
                      </div>

                      {art && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-600">
                          <p className="font-semibold text-slate-700 mb-1">Resumo do Manuscrito:</p>
                          <p className="leading-relaxed">{art.abstract}</p>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            setReviewModalData(rev)
                            setRecommendation(rev.recommendation || 'aceitar')
                            setCommentsAuthor(rev.comments_for_author || '')
                            setCommentsEditor(rev.confidential_comments_editor || '')
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {rev.status === 'concluido' ? 'Visualizar / Editar Meu Parecer' : 'Preencher Parecer Editorial'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PAINEL DO EDITOR GERAL */}
        {/* ========================================================= */}
        {viewMode === 'editor' && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-700 mb-1">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Sala Editorial</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Gestão de Artigos e Pareceristas</h2>
                <p className="text-sm text-slate-500">
                  Coordene o fluxo duplo-cego, atribua pareceristas e tome as decisões editoriais finais.
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 text-xs"
              >
                <Upload className="w-4 h-4" />
                + Submeter Artigo
              </button>
            </div>

            {/* LISTA DE ARTIGOS */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Todos os Artigos Recebidos ({allArticles.length})
              </h3>

              <div className="grid gap-4">
                {allArticles.map((art) => {
                  const revs = getArticleReviews(art.id)
                  return (
                    <div key={art.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {art.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400">
                              Enviado em {new Date(art.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-900">{art.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Autor: <strong>{getAuthorName(art.author_id)}</strong> ({getAuthorEmail(art.author_id)}) • Instituição: {getAuthorInst(art.author_id)}
                          </p>
                        </div>

                        {/* Botões do Editor */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleDownloadFile(art.file_url)}
                            className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            Baixar Manuscrito
                          </button>

                          <button
                            onClick={() => {
                              setAssignModalArticle(art)
                              setSelectedReviewerId('')
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 flex items-center gap-1.5"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            + Atribuir Parecerista
                          </button>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-500 font-medium">Decisão:</span>
                            <select
                              value={art.status}
                              onChange={(e) => handleUpdateStatus(art.id, e.target.value)}
                              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="submetido">Submetido</option>
                              <option value="em_avaliacao">Em Avaliação</option>
                              <option value="correcoes_pendentes">Solicitar Correções</option>
                              <option value="aceito">Aceito para Publicação</option>
                              <option value="recusado">Recusado</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <strong>Resumo:</strong> {art.abstract}
                      </p>

                      {/* Pareceres Atribuídos */}
                      {revs.length > 0 && (
                        <div className="bg-indigo-50/40 p-4 rounded-lg border border-indigo-100 space-y-2">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Pareceristas Designados ({revs.length}):
                          </h5>
                          <div className="grid gap-2">
                            {revs.map((r) => (
                              <div key={r.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                                <div>
                                  <span className="font-semibold text-slate-800">{getReviewerName(r.reviewer_id)}</span>
                                  <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    r.status === 'concluido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {r.status === 'concluido' ? `PARECER CONCLUÍDO (${r.recommendation?.toUpperCase()})` : 'AGUARDANDO PARECER'}
                                  </span>
                                </div>

                                {r.status === 'concluido' && (
                                  <button
                                    onClick={() => alert(`PARECER DE ${getReviewerName(r.reviewer_id)}:\n\n${r.comments_for_author}\n\nNotas Confidenciais ao Editor:\n${r.confidential_comments_editor || 'Nenhuma'}`)}
                                    className="text-xs text-indigo-600 hover:underline font-semibold"
                                  >
                                    Ler Parecer Completo
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* QUADRO DE USUÁRIOS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Quadro de Usuários Cadastrados ({allProfiles.length})
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Defina aqui quem são os Pareceristas da Revista alterando a função na coluna da direita.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">E-mail</th>
                      <th className="p-3">Instituição</th>
                      <th className="p-3">Telefone</th>
                      <th className="p-3">Função Atual</th>
                      <th className="p-3 text-right">Alterar Função</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allProfiles.map((p) => (
                      <tr key={p.id}>
                        <td className="p-3 font-semibold text-slate-900">{p.full_name}</td>
                        <td className="p-3">{p.email}</td>
                        <td className="p-3">{p.institution || '-'}</td>
                        <td className="p-3">{p.phone || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            p.role === 'editor' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            p.role === 'reviewer' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {p.role === 'editor' ? 'EDITOR' : p.role === 'reviewer' ? 'PARECERISTA' : 'AUTOR'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <select
                            value={p.role}
                            onChange={(e) => handleUpdateRole(p.id, e.target.value)}
                            className="p-1 border border-slate-200 rounded bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="author">Autor</option>
                            <option value="reviewer">Parecerista</option>
                            <option value="editor">Editor</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

      {/* MODAL DE ATRIBUIÇÃO DE PARECERISTA */}
      {assignModalArticle && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Designar Parecerista para Artigo</h3>
            <p className="text-xs text-slate-500">
              Artigo: <strong>{assignModalArticle.title}</strong>
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Selecione o Avaliador:</label>
              <select
                value={selectedReviewerId}
                onChange={(e) => setSelectedReviewerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Escolha um parecerista --</option>
                {allProfiles
                  .filter((p) => p.role === 'reviewer' || p.role === 'editor')
                  .map((rev) => (
                    <option key={rev.id} value={rev.id}>
                      {rev.full_name} ({rev.role === 'editor' ? 'Editor Geral' : 'Parecerista'})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setAssignModalArticle(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedReviewerId}
                onClick={handleAssignReviewer}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
              >
                Confirmar Atribuição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AVALIAÇÃO PSICANALÍTICA DO PARECERISTA */}
      {reviewModalData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Formulário de Parecer Técnico-Científico</span>
              <h3 className="text-lg font-bold text-slate-900">Avaliação do Manuscrito</h3>
              <p className="text-xs text-slate-500 mt-1">
                Artigo: <strong>{allArticles.find((a) => a.id === reviewModalData.article_id)?.title}</strong>
              </p>
            </div>

            <div className="space-y-4">
              {/* Critérios do Formulário */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Título e Resumo</label>
                  <select
                    value={critTitle}
                    onChange={(e) => setCritTitle(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="excelente">Excelente / Claro</option>
                    <option value="satisfatorio">Satisfatório</option>
                    <option value="reformular">Requer Reformulação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Rigor Conceitual (Psicanálise)</label>
                  <select
                    value={critTheory}
                    onChange={(e) => setCritTheory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="consistente">Consistente e Fundamentado</option>
                    <option value="parcial">Parcialmente Consistente</option>
                    <option value="insuficiente">Insuficiente / Frágil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Relevância para a Clínica</label>
                  <select
                    value={critClinical}
                    onChange={(e) => setCritClinical(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="alta">Alta Relevância</option>
                    <option value="media">Média Relevância</option>
                    <option value="baixa">Baixa Relevância</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recomendação Editorial Final *
                </label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white font-medium"
                >
                  <option value="aceitar">Aceitar sem restrições (Aprovado)</option>
                  <option value="correcoes_obrigatorias">Aceitar mediante correções obrigatórias</option>
                  <option value="rejeitar">Recusar manuscrito (Não aprovado)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parecer Detalhado e Orientações para o Autor *
                </label>
                <p className="text-[11px] text-slate-400 mb-1">
                  Este texto será encaminhado ao autor para orientar suas correções (sua identidade é mantida 100% anônima).
                </p>
                <textarea
                  required
                  rows={6}
                  value={commentsAuthor}
                  onChange={(e) => setCommentsAuthor(e.target.value)}
                  placeholder="Escreva suas considerações teóricas, articulação dos conceitos de Freud/Lacan/outros, relevância clínica e pontos específicos de correção..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Confidenciais para a Equipe Editorial (Opcional)
                </label>
                <p className="text-[11px] text-slate-400 mb-1">
                  Texto visível apenas para o Editor Geral (o autor NÃO tem acesso).
                </p>
                <textarea
                  rows={3}
                  value={commentsEditor}
                  onChange={(e) => setCommentsEditor(e.target.value)}
                  placeholder="Observações internas, dúvidas éticas ou notas exclusivas para a comissão..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewModalData(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={submittingReview || !commentsAuthor}
                onClick={handleSubmitReview}
                className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingReview ? 'Enviando...' : 'Concluir e Enviar Parecer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
