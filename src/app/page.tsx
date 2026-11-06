'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  BookOpen, User, Lock, Mail, Building, Phone, ArrowRight, 
  Upload, FileText, LogOut, ShieldCheck, Users, UserCheck, 
  Download, MessageSquare, Send, CheckCircle2, HelpCircle, 
  FileCheck, AlertTriangle, RefreshCw, Plus, Trash2, ShieldAlert
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

  // Modal Submissão do Autor
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [newSection, setNewSection] = useState('Artigo Científico')
  const [newTitle, setNewTitle] = useState('')
  const [newTitleEn, setNewTitleEn] = useState('')
  const [newAbstract, setNewAbstract] = useState('')
  const [newAbstractEn, setNewAbstractEn] = useState('')
  const [newKeywords, setNewKeywords] = useState('')
  const [newKeywordsEn, setNewKeywordsEn] = useState('')
  const [authorInstitution, setAuthorInstitution] = useState('')
  const [authorOrcid, setAuthorOrcid] = useState('')
  const [authorBio, setAuthorBio] = useState('')
  const [coauthors, setCoauthors] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [termOriginal, setTermOriginal] = useState(false)
  const [termEthics, setTermEthics] = useState(false)
  const [termAnonymous, setTermAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Modal Reenvio Versão Corrigida
  const [reSubmitArticle, setReSubmitArticle] = useState<any>(null)
  const [revisedFile, setRevisedFile] = useState<File | null>(null)
  const [submittingRevision, setSubmittingRevision] = useState(false)

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
  const [reviewFile, setReviewFile] = useState<File | null>(null)
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
        setAuthorInstitution(data.institution || '')
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
        setAuthorInstitution('Associação Saber Psicanalítico')
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

  const handleAddCoauthor = () => {
    setCoauthors([
      ...coauthors,
      { name: '', email: '', institution: '', orcid: '' }
    ])
  }

  const handleUpdateCoauthor = (index: number, field: string, value: string) => {
    const updated = [...coauthors]
    updated[index][field] = value
    setCoauthors(updated)
  }

  const handleRemoveCoauthor = (index: number) => {
    setCoauthors(coauthors.filter((_, i) => i !== index))
  }

  // Submissão do Artigo
  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !session) return
    if (!termOriginal || !termEthics || !termAnonymous) {
      alert('Por favor, confirme as 3 declarações obrigatórias no final do formulário.')
      return
    }

    setSubmitting(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `artigo_${session.user.id}_${Date.now()}.${fileExt}`
      const filePath = `artigos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('manuscritos')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('articles').insert({
        author_id: session.user.id,
        section: newSection,
        title: newTitle,
        title_en: newTitleEn,
        abstract: newAbstract,
        abstract_en: newAbstractEn,
        keywords: newKeywords,
        keywords_en: newKeywordsEn,
        author_institution: authorInstitution,
        author_orcid: authorOrcid,
        author_bio: authorBio,
        coauthors: coauthors,
        file_url: filePath,
        status: 'submetido',
      })

      if (insertError) throw insertError

      alert('Parabéns! Seu artigo foi submetido com sucesso à Revista Saber Psicanalítico.')
      setShowSubmitModal(false)
      setNewTitle('')
      setNewTitleEn('')
      setNewAbstract('')
      setNewAbstractEn('')
      setNewKeywords('')
      setNewKeywordsEn('')
      setAuthorOrcid('')
      setAuthorBio('')
      setCoauthors([])
      setSelectedFile(null)
      setTermOriginal(false)
      setTermEthics(false)
      setTermAnonymous(false)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro na submissão: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  // Reenvio de Versão Corrigida
  const handleResubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!revisedFile || !reSubmitArticle) return
    setSubmittingRevision(true)

    try {
      const fileExt = revisedFile.name.split('.').pop()
      const fileName = `revisao_${reSubmitArticle.id}_${Date.now()}.${fileExt}`
      const filePath = `artigos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('manuscritos')
        .upload(filePath, revisedFile)

      if (uploadError) throw uploadError

      const { error: updateError } = await supabase
        .from('articles')
        .update({
          file_url: filePath,
          status: 'em_avaliacao',
        })
        .eq('id', reSubmitArticle.id)

      if (updateError) throw updateError

      alert('Versão corrigida enviada com sucesso!')
      setReSubmitArticle(null)
      setRevisedFile(null)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro no envio: ${err.message}`)
    } finally {
      setSubmittingRevision(false)
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
      alert(`Status atualizado com sucesso!`)
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
      let reviewFilePath = reviewModalData.review_file_url || null

      if (reviewFile) {
        const fileExt = reviewFile.name.split('.').pop()
        const fileName = `parecer_${reviewModalData.id}_${Date.now()}.${fileExt}`
        reviewFilePath = `pareceres/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('manuscritos')
          .upload(reviewFilePath, reviewFile)

        if (uploadError) throw uploadError
      }

      const fullComments = `--- AVALIAÇÃO DOS CRITÉRIOS EDITORIAIS ---\n• Título e Resumo: ${critTitle.toUpperCase()}\n• Consistência Teórico-Psicanalítica: ${critTheory.toUpperCase()}\n• Relevância para a Clínica: ${critClinical.toUpperCase()}\n\n--- PARECER DESCRITIVO E ORIENTAÇÕES AO AUTOR ---\n${commentsAuthor}`

      const { error } = await supabase
        .from('reviews')
        .update({
          recommendation,
          comments_for_author: fullComments,
          confidential_comments_editor: commentsEditor,
          review_file_url: reviewFilePath,
          status: 'concluido',
        })
        .eq('id', reviewModalData.id)

      if (error) throw error
      alert('Parecer emitido com sucesso! Agradecemos muito a sua colaboração com a Revista Saber Psicanalítico.')
      setReviewModalData(null)
      setReviewFile(null)
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Instituição / Afiliação</label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Ex: Associação Saber Psicanalítico / USP / Consultório"
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
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm disabled:opacity-50 shadow-sm"
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
                  Acompanhe em tempo real o status, as devolutivas da comissão editorial e reenvie versões ajustadas.
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
                  Clique no botão azul acima para submeter seu artigo à Revista Saber Psicanalítico.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myAuthorArticles.map((art) => {
                  const revs = getArticleReviews(art.id).filter((r) => r.status === 'concluido')
                  const isPendingCorrections = art.status === 'correcoes_pendentes'
                  const isInitialDeskAdjust = art.status === 'ajustes_iniciais'
                  const canShowReviews = art.status === 'correcoes_pendentes' || art.status === 'aceito' || art.status === 'recusado'

                  return (
                    <div key={art.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {art.section || 'Artigo Científico'}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              art.status === 'aceito' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              art.status === 'recusado' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              art.status === 'correcoes_pendentes' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              art.status === 'ajustes_iniciais' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                              'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {art.status === 'ajustes_iniciais' ? 'AJUSTES INICIAIS / ANONIMIZAÇÃO' : art.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400">
                              Enviado em {new Date(art.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-800">{art.title}</h3>
                          {art.title_en && <p className="text-xs text-slate-400 italic">{art.title_en}</p>}
                          <p className="text-sm text-slate-600 line-clamp-3">{art.abstract}</p>

                          {art.coauthors && art.coauthors.length > 0 && (
                            <p className="text-xs text-slate-500">
                              <strong>Coautores:</strong> {art.coauthors.map((c: any) => c.name).filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 min-w-[220px]">
                          <button
                            onClick={() => handleDownloadFile(art.file_url)}
                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            Baixar Manuscrito Atual
                          </button>

                          {/* Se houver correções ou ajuste inicial de anonimização */}
                          {(isPendingCorrections || isInitialDeskAdjust) && (
                            <button
                              onClick={() => {
                                setReSubmitArticle(art)
                                setRevisedFile(null)
                              }}
                              className="w-full px-3 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Enviar Arquivo Corrigido
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Aviso de Triagem Inicial / Anonimização Solicitada pelo Editor */}
                      {isInitialDeskAdjust && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-900 space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            Ajuste Solicitado pelo Editor Geral (Triagem Inicial):
                          </p>
                          <p>
                            Por favor, verifique se o arquivo do seu manuscrito contém seu nome, afiliação ou identificação pessoal. 
                            Remova qualquer dado de autoria do texto e clique no botão <strong>"Enviar Arquivo Corrigido"</strong> acima para darmos início à avaliação pelos pareceristas.
                          </p>
                        </div>
                      )}

                      {/* Devolutivas só aparecem se o Editor liberou (Correções, Aceito ou Recusado) */}
                      {canShowReviews && revs.length > 0 && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-600" />
                            Pareceres e Orientações Liberados pela Equipe Editorial:
                          </h5>
                          {revs.map((rev, idx) => (
                            <div key={rev.id} className="text-xs text-slate-700 bg-white p-4 rounded-lg border border-slate-200 space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="font-bold text-indigo-700">
                                  Avaliação {idx + 1}: {rev.recommendation?.replace('_', ' ').toUpperCase()}
                                </span>

                                {rev.review_file_url && (
                                  <button
                                    onClick={() => handleDownloadFile(rev.review_file_url)}
                                    className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 flex items-center gap-1"
                                  >
                                    <Download className="w-3 h-3" />
                                    Baixar Word com Anotações do Parecerista
                                  </button>
                                )}
                              </div>
                              <p className="whitespace-pre-line text-slate-600 leading-relaxed">{rev.comments_for_author}</p>
                            </div>
                          ))}
                        </div>
                      )}
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
                Avaliação Duplo-Cega (*Double-Blind Review*): a autoria e os dados de filiação permanecem em absoluto sigilo.
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
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {art?.section || 'Artigo Científico'}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              rev.status === 'concluido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {rev.status === 'concluido' ? 'PARECER ENVIADO' : 'AGUARDANDO SEU PARECER'}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">{art?.title || 'Artigo'}</h3>
                          <p className="text-xs text-slate-500 mt-1">Palavras-chave: {art?.keywords}</p>
                        </div>

                        {art && (
                          <button
                            onClick={() => handleDownloadFile(art.file_url)}
                            className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-sm text-slate-700"
                          >
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            Baixar Manuscrito Original (Word)
                          </button>
                        )}
                      </div>

                      {art && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-2">
                          <p className="font-semibold text-slate-700">Resumo do Manuscrito:</p>
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
                            setReviewFile(null)
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
        {/* PAINEL DO EDITOR GERAL (SALA EDITORIAL) */}
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
                  Coordene a triagem inicial, fluxo duplo-cego, acesse os dados completos de autoria/ORCID e defina as decisões finais.
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
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {art.section || 'Artigo Científico'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {art.status === 'ajustes_iniciais' ? 'AJUSTE DE ANONIMIZAÇÃO' : art.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-400">
                              Enviado em {new Date(art.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-900">{art.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Autor Principal: <strong>{getAuthorName(art.author_id)}</strong> ({getAuthorEmail(art.author_id)})
                          </p>
                          <p className="text-xs text-slate-500">
                            Filiação: <strong>{art.author_institution || getAuthorInst(art.author_id)}</strong>
                            {art.author_orcid && (
                              <span className="ml-2 inline-flex items-center gap-1 text-emerald-700 font-medium">
                                • ORCID: {art.author_orcid}
                              </span>
                            )}
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
                              <option value="submetido">Submetido (Aguardando Triagem)</option>
                              <option value="ajustes_iniciais">Solicitar Anonimização / Ajuste Inicial</option>
                              <option value="em_avaliacao">Em Avaliação (Pareceristas)</option>
                              <option value="correcoes_pendentes">Solicitar Correções (Liberar Parecer)</option>
                              <option value="aceito">Aceito para Publicação</option>
                              <option value="recusado">Recusado</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Quadro de Coautores Completo para o Editor */}
                      {art.coauthors && art.coauthors.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                          <p className="font-semibold text-slate-700 mb-1">Coautores Cadastrados ({art.coauthors.length}):</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {art.coauthors.map((c: any, idx: number) => (
                              <div key={idx} className="bg-white p-2.5 rounded border border-slate-200">
                                <p className="font-bold text-slate-800">{c.name || 'Sem nome'}</p>
                                <p className="text-slate-500 text-[11px]">{c.email || 'Sem e-mail'} • {c.institution || 'Sem filiação'}</p>
                                {c.orcid && <p className="text-emerald-700 text-[11px] font-medium">ORCID: {c.orcid}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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

                                <div className="flex items-center gap-2">
                                  {r.review_file_url && (
                                    <button
                                      onClick={() => handleDownloadFile(r.review_file_url)}
                                      className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded border flex items-center gap-1"
                                    >
                                      <Download className="w-3 h-3 text-indigo-600" />
                                      Word Anotado
                                    </button>
                                  )}

                                  {r.status === 'concluido' && (
                                    <button
                                      onClick={() => alert(`PARECER DE ${getReviewerName(r.reviewer_id)}:\n\n${r.comments_for_author}\n\nNOTAS CONFIDENCIAIS AO EDITOR:\n${r.confidential_comments_editor || 'Nenhuma'}`)}
                                      className="text-xs text-indigo-600 hover:underline font-semibold"
                                    >
                                      Ler Parecer Completo
                                    </button>
                                  )}
                                </div>
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

      {/* ========================================================= */}
      {/* MODAL DE SUBMISSÃO COMPLETO: COM AS 4 SEÇÕES OFICIAIS */}
      {/* ========================================================= */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Submissão Editorial</span>
              <h3 className="text-lg font-bold text-slate-900">Submeter Novo Manuscrito</h3>
              <p className="text-xs text-slate-500 mt-1">
                Preencha todos os dados com atenção. Os campos contêm orientações explicativas abaixo.
              </p>
            </div>

            <form onSubmit={handleSubmitArticle} className="space-y-5">
              {/* BLOCO 1: SEÇÃO E AUTOR PRINCIPAL */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  1. Seção da Revista e Dados do Autor Principal
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seção da Revista *</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white font-medium"
                  >
                    <option value="Artigo Científico">Artigo Científico</option>
                    <option value="Ensaio Teórico">Ensaio Teórico</option>
                    <option value="Relato de Experiência Clínica">Relato de Experiência Clínica</option>
                    <option value="Resenha">Resenha</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Selecione o tipo de trabalho correspondente conforme as normas da Revista.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Filiação Institucional do Autor *</label>
                    <input
                      type="text"
                      required
                      value={authorInstitution}
                      onChange={(e) => setAuthorInstitution(e.target.value)}
                      placeholder="Ex: Associação Saber Psicanalítico / USP / Consultório Privado"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Instituição de ensino, clínica ou associação a que se vincula.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ORCID do Autor (Opcional)</label>
                    <input
                      type="text"
                      value={authorOrcid}
                      onChange={(e) => setAuthorOrcid(e.target.value)}
                      placeholder="Ex: 0000-0002-1825-0097"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Identificador internacional do pesquisador (se possuir).</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minibiografia / Titulação do Autor (Opcional)</label>
                  <input
                    type="text"
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    placeholder="Ex: Psicanalista, Mestre em Psicologia Clínica, Membro da Associação Saber Psicanalítico."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Breve descrição que constará no expediente da publicação.</p>
                </div>
              </div>

              {/* BLOCO 2: COAUTORES (DINÂMICO) */}
              <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      2. Coautores do Trabalho ({coauthors.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Caso o artigo tenha sido escrito em coautoria, adicione cada coautor abaixo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCoauthor}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Coautor
                  </button>
                </div>

                {coauthors.map((c, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-700">Coautor #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoauthor(idx)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remover
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Nome Completo *</label>
                        <input
                          type="text"
                          required
                          value={c.name}
                          onChange={(e) => handleUpdateCoauthor(idx, 'name', e.target.value)}
                          placeholder="Nome do coautor"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">E-mail *</label>
                        <input
                          type="email"
                          required
                          value={c.email}
                          onChange={(e) => handleUpdateCoauthor(idx, 'email', e.target.value)}
                          placeholder="email@exemplo.com"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Filiação Institucional *</label>
                        <input
                          type="text"
                          required
                          value={c.institution}
                          onChange={(e) => handleUpdateCoauthor(idx, 'institution', e.target.value)}
                          placeholder="Universidade / Associação"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">ORCID (Opcional)</label>
                        <input
                          type="text"
                          value={c.orcid}
                          onChange={(e) => handleUpdateCoauthor(idx, 'orcid', e.target.value)}
                          placeholder="0000-0000-0000-0000"
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* BLOCO 3: METADADOS BILÍNGUES */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  3. Título, Resumo e Palavras-chave (Português e Inglês)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Artigo (Português) *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ex: O Inconsciente e o Corpo na Contemporaneidade"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Título claro e fiel à temática central.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Title (Título em Inglês) *</label>
                    <input
                      type="text"
                      required
                      value={newTitleEn}
                      onChange={(e) => setNewTitleEn(e.target.value)}
                      placeholder="Ex: The Unconscious and the Body in Contemporaneity"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Exigência para catalogação e indexadores acadêmicos.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resumo em Português (150 a 250 palavras) *</label>
                  <textarea
                    required
                    rows={4}
                    value={newAbstract}
                    onChange={(e) => setNewAbstract(e.target.value)}
                    placeholder="Apresente os objetivos, a fundamentação teórica psicanalítica, a metodologia e as considerações finais..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Parágrafo único sintetizando a tese principal do texto.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Abstract (Resumo em Inglês) *</label>
                  <textarea
                    required
                    rows={4}
                    value={newAbstractEn}
                    onChange={(e) => setNewAbstractEn(e.target.value)}
                    placeholder="English translation of the abstract..."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Tradução acadêmica e rigorosa do resumo.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Palavras-chave (3 a 5 termos) *</label>
                    <input
                      type="text"
                      required
                      value={newKeywords}
                      onChange={(e) => setNewKeywords(e.target.value)}
                      placeholder="Ex: Psicanálise; Transferência; Clínica; Sintoma"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Separadas por ponto e vírgula (;).</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Keywords (Palavras-chave em Inglês) *</label>
                    <input
                      type="text"
                      required
                      value={newKeywordsEn}
                      onChange={(e) => setNewKeywordsEn(e.target.value)}
                      placeholder="Ex: Psychoanalysis; Transference; Clinic; Symptom"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Tradução dos termos correspondentes.</p>
                  </div>
                </div>
              </div>

              {/* BLOCO 4: ARQUIVO WORD COMPLETO */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  4. Arquivo do Manuscrito Completo (.docx - Word Obrigatório) *
                </label>
                <div className="text-[11px] text-slate-600 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                  <p className="font-semibold text-indigo-900">⚠️ Como preparar o arquivo para submissão:</p>
                  <p>
                    • O documento Word deve estar <strong>COMPLETO</strong>: contendo Título, Título em Inglês, Resumo, Abstract, Palavras-chave, Texto integral, Vinhetas Clínicas e Referências Bibliográficas completas.
                  </p>
                  <p className="text-rose-600 font-semibold">
                    • O arquivo NÃO PODE conter nome dos autores, nem afiliações, notas biográficas ou agradecimentos que permitam identificar a autoria (para garantir a avaliação duplo-cega).
                  </p>
                </div>
                <input
                  type="file"
                  required
                  accept=".docx,.doc"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {/* BLOCO 5: DECLARAÇÕES ÉTICAS */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termOriginal}
                    onChange={(e) => setTermOriginal(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    <strong>Ineditismo e Autoria:</strong> Declaro que este manuscrito é original, de autoria própria (e dos coautores cadastrados) e não se encontra sob avaliação simultânea em outro periódico.
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termEthics}
                    onChange={(e) => setTermEthics(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    <strong>Sigilo Clínico e Ética Psicanalítica:</strong> Declaro que quaisquer dados clínicos e vinhetas de pacientes foram devidamente anonimizados e descaracterizados, respeitando o sigilo ético absoluto.
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termAnonymous}
                    onChange={(e) => setTermAnonymous(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    <strong>Anonimização do Manuscrito:</strong> Confirmo que retirei do arquivo Word qualquer menção ao nome dos autores, notas biográficas ou dados nas propriedades do arquivo.
                  </span>
                </label>
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
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Enviando Manuscrito...' : 'Concluir Submissão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DO AUTOR: ENVIAR VERSÃO CORRIGIDA */}
      {reSubmitArticle && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Enviar Nova Versão Corrigida</h3>
            <p className="text-xs text-slate-500">
              Artigo: <strong>{reSubmitArticle.title}</strong>
            </p>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Orientações para o reenvio:
              </p>
              <p>
                Anexe o arquivo Word (.docx) revisado contemplando as correções solicitadas (ou sem identificação, caso tenha sido solicitado ajuste inicial). Ao enviar, o manuscrito retornará automaticamente à comissão editorial.
              </p>
            </div>

            <form onSubmit={handleResubmitArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Arquivo Word Corrigido (.docx) *
                </label>
                <input
                  type="file"
                  required
                  accept=".docx,.doc"
                  onChange={(e) => setRevisedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setReSubmitArticle(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingRevision || !revisedFile}
                  className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50 shadow-sm"
                >
                  {submittingRevision ? 'Enviando Revisão...' : 'Confirmar Envio da Versão Corrigida'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DO EDITOR: ATRIBUIR PARECERISTA */}
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

      {/* MODAL DO PARECERISTA: COM AVISO DE SIGILO DO WORD */}
      {reviewModalData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Formulário de Parecer Técnico-Científico</span>
              <h3 className="text-lg font-bold text-slate-900">Emissão de Parecer Editorial</h3>
              <p className="text-xs text-slate-500 mt-1">
                Artigo: <strong>{allArticles.find((a) => a.id === reviewModalData.article_id)?.title}</strong>
              </p>
            </div>

            {/* Aviso 1: Orientações Didáticas */}
            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                Como fazer anotações e correções no texto:
              </p>
              <p className="leading-relaxed">
                Você pode baixar o arquivo Word (.docx), abri-lo em seu computador e ativar o recurso 
                <strong> "Controlar Alterações"</strong> (na aba <em>Revisão</em> do Word) ou inserir <strong>Comentários</strong> pontuais nas frases que necessitarem de aprimoramento. Depois de salvar, anexe o arquivo com suas anotações no campo específico abaixo.
              </p>
            </div>

            {/* Aviso 2: Sigilo do Avaliador no Word */}
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Atenção ao Sigilo do Parecerista no Word:
              </p>
              <p className="leading-relaxed text-[11px]">
                Ao usar comentários no Word, certifique-se de que seu nome pessoal não fique gravado nas notas. 
                <strong> Dica no Word:</strong> Vá em <em>Arquivo &gt; Informações &gt; Verificar se há Problemas &gt; Inspecionar Documento</em> e remova "Propriedades do Documento e Informações Pessoais", ou altere seu nome de usuário nas opções do Word para "Parecerista".
              </p>
            </div>

            <div className="space-y-4">
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
                  <p className="text-[10px] text-slate-400 mt-1">Clareza e fidelidade ao tema.</p>
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
                  <p className="text-[10px] text-slate-400 mt-1">Articulação teórica conceitual.</p>
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
                  <p className="text-[10px] text-slate-400 mt-1">Contribuição clínica/social.</p>
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
                  <option value="aceitar">Aceitar sem restrições (Recomendado)</option>
                  <option value="correcoes_obrigatorias">Aceitar mediante correções obrigatórias</option>
                  <option value="rejeitar">Recusar manuscrito (Não recomendado)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Sua recomendação será analisada pelo Editor Geral, que tomará a decisão final.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parecer Detalhado e Orientações para o Autor *
                </label>
                <textarea
                  required
                  rows={5}
                  value={commentsAuthor}
                  onChange={(e) => setCommentsAuthor(e.target.value)}
                  placeholder="Apresente suas considerações conceituais e recomendações de aprimoramento de forma construtiva e fundamentada..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Este texto será liberado ao autor caso o Editor decida solicitar correções (sua identidade é mantida 100% anônima).
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  Anexar Arquivo com Comentários / Correções (.docx - Opcional)
                </label>
                <p className="text-[11px] text-slate-500">
                  Caso tenha feito anotações no arquivo Word do artigo, anexe-o aqui para que o autor possa baixá-lo e aplicar suas sugestões pontuais.
                </p>
                <input
                  type="file"
                  accept=".docx,.doc"
                  onChange={(e) => setReviewFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Confidenciais para o Editor Geral (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={commentsEditor}
                  onChange={(e) => setCommentsEditor(e.target.value)}
                  placeholder="Comentários internos, dúvidas éticas ou notas exclusivas para a equipe editorial..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Visível exclusivamente para a equipe editorial (o autor NUNCA terá acesso a este campo).
                </p>
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
