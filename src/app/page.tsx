'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  User, Lock, Mail, Building, Phone, ArrowRight, Upload, FileText, 
  LogOut, ShieldCheck, Users, UserCheck, Download, MessageSquare, 
  Send, CheckCircle2, AlertTriangle, RefreshCw, Trash2, ShieldAlert,
  Award, Ban, Search, X, AlertCircle, KeyRound, Clock, FileSpreadsheet, Edit3, Plus
} from 'lucide-react'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'author' | 'reviewer' | 'editor' | 'council'>('author')
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

  // Recuperação de Senha
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Dados do Sistema
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [allProfiles, setAllProfiles] = useState<any[]>([])
  const [allReviews, setAllReviews] = useState<any[]>([])

  // Filtros da Sala Editorial
  const [editorSearch, setEditorSearch] = useState('')
  const [editorStatusFilter, setEditorStatusFilter] = useState('todos')

  // Modais
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyCodeInput, setVerifyCodeInput] = useState('')
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [checkingCode, setCheckingCode] = useState(false)

  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileInst, setProfileInst] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileLattes, setProfileLattes] = useState('')
  const [profileOrcid, setProfileOrcid] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Submissão
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [newSection, setNewSection] = useState('Artigo Científico')
  const [newTitle, setNewTitle] = useState('')
  const [newTitleEn, setNewTitleEn] = useState('')
  const [newAbstract, setNewAbstract] = useState('')
  const [newAbstractEn, setNewAbstractEn] = useState('')
  const [newKeywords, setNewKeywords] = useState('')
  const [newKeywordsEn, setNewKeywordsEn] = useState('')
  const [authorInstitution, setAuthorInstitution] = useState('')
  const [authorLattes, setAuthorLattes] = useState('')
  const [authorOrcid, setAuthorOrcid] = useState('')
  const [authorBio, setAuthorBio] = useState('')
  const [coauthors, setCoauthors] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [termOriginal, setTermOriginal] = useState(false)
  const [termEthics, setTermEthics] = useState(false)
  const [termAnonymous, setTermAnonymous] = useState(false)
  const [termCC, setTermCC] = useState(false)
  const [termAI, setTermAI] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Reenvio
  const [reSubmitArticle, setReSubmitArticle] = useState<any>(null)
  const [revisedFile, setRevisedFile] = useState<File | null>(null)
  const [submittingRevision, setSubmittingRevision] = useState(false)

  // Parecerista
  const [assignModalArticle, setAssignModalArticle] = useState<any>(null)
  const [selectedReviewerId, setSelectedReviewerId] = useState('')
  const [assignDeadline, setAssignDeadline] = useState('')

  // Recusa
  const [rejectionModalArticle, setRejectionModalArticle] = useState<any>(null)
  const [rejectionReasonText, setRejectionReasonText] = useState('')
  const [savingRejection, setSavingRejection] = useState(false)

  // Parecer
  const [reviewModalData, setReviewModalData] = useState<any>(null)
  const [critTitle, setCritTitle] = useState('satisfatorio')
  const [critTheory, setCritTheory] = useState('consistente')
  const [critClinical, setCritClinical] = useState('alta')
  const [recommendation, setRecommendation] = useState('aceitar')
  const [commentsAuthor, setCommentsAuthor] = useState('')
  const [commentsEditor, setCommentsEditor] = useState('')
  const [reviewFile, setReviewFile] = useState<File | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)

  // Documento Timbrado A4
  const [activeOfficialDoc, setActiveOfficialDoc] = useState<any>(null)
  const [showReviewerThankModal, setShowReviewerThankModal] = useState(false)
  const [copiedThanks, setCopiedThanks] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) initUser(session, true)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) initUser(session, false)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const initUser = async (currentSession: any, isFirstLoad = false) => {
    const user = currentSession.user
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()

      if (data) {
        setProfile(data)
        if (isFirstLoad) {
          setViewMode(
            data.role === 'editor' ? 'editor' : 
            data.role === 'council' ? 'council' : 
            data.role === 'reviewer' ? 'reviewer' : 'author'
          )
        }
        setAuthorInstitution(data.institution || '')
        setAuthorLattes(data.lattes_url || '')
        setAuthorOrcid(data.orcid || '')
      } else {
        const fallbackProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Usuário da Revista',
          email: user.email || '',
          role: 'author',
          institution: 'Associação Saber Psicanalítico',
          phone: '',
        }
        await supabase.from('profiles').upsert(fallbackProfile)
        setProfile(fallbackProfile)
        if (isFirstLoad) setViewMode('author')
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

  const handleVerifyCode = async () => {
    const code = verifyCodeInput.trim().toUpperCase()
    if (!code) return

    setCheckingCode(true)
    setVerifyResult(null)

    try {
      const { data, error } = await supabase.rpc('verify_document', { code })
      if (!error && data && data.valid) {
        setVerifyResult(data)
        setCheckingCode(false)
        return
      }

      if (code.includes('ASP-ACE-')) {
        const prefix = code.split('-')[2] || ''
        const found = allArticles.find((a) => a.id.toUpperCase().startsWith(prefix) && a.status === 'aceito')
        if (found) {
          setVerifyResult({
            valid: true,
            type: 'Carta de Aceite para Publicação',
            title: found.title,
            person: getAuthorName(found.author_id),
            date: new Date(found.updated_at || found.created_at).toLocaleDateString('pt-BR'),
            role: 'Autor(a) do Manuscrito',
          })
          setCheckingCode(false)
          return
        }
      }

      if (code.includes('ASP-REC-')) {
        const prefix = code.split('-')[2] || ''
        const found = allArticles.find((a) => a.id.toUpperCase().startsWith(prefix) && a.status === 'recusado')
        if (found) {
          setVerifyResult({
            valid: true,
            type: 'Carta de Não Aceite',
            title: found.title,
            person: getAuthorName(found.author_id),
            date: new Date(found.updated_at || found.created_at).toLocaleDateString('pt-BR'),
            role: 'Autor(a) do Manuscrito',
          })
          setCheckingCode(false)
          return
        }
      }

      if (code.includes('ASP-PAR-')) {
        const prefix = code.split('-')[2] || ''
        const foundRev = allReviews.find((r) => r.id.toUpperCase().startsWith(prefix) && r.status === 'concluido')
        if (foundRev) {
          const revPerson = allProfiles.find((p) => p.id === foundRev.reviewer_id)
          setVerifyResult({
            valid: true,
            type: 'Declaração de Atuação como Parecerista Ad-hoc',
            title: 'Manuscrito Avaliado',
            person: revPerson?.full_name || 'Parecerista Registrado',
            date: new Date(foundRev.updated_at || foundRev.created_at).toLocaleDateString('pt-BR'),
            role: 'Parecerista Ad-hoc',
          })
          setCheckingCode(false)
          return
        }
      }

      setVerifyResult({ valid: false })
    } catch (e) {
      setVerifyResult({ valid: false })
    } finally {
      setCheckingCode(false)
    }
  }

  const handleOpenProfileModal = () => {
    setProfileName(profile?.full_name || '')
    setProfileInst(profile?.institution || '')
    setProfilePhone(profile?.phone || '')
    setProfileLattes(profile?.lattes_url || '')
    setProfileOrcid(profile?.orcid || '')
    setShowProfileModal(true)
  }

  const sendEmailNotification = async (payload: { to: string; subject: string; title: string; message: string; actionText?: string; actionUrl?: string }) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      console.warn('Falha no envio de e-mail:', e)
    }
  }

  const getAuthorName = (authorId: string) => allProfiles.find((x) => x.id === authorId)?.full_name || 'Autor da Revista'
  const getAuthorEmail = (authorId: string) => allProfiles.find((x) => x.id === authorId)?.email || ''
  const getAuthorInst = (authorId: string) => allProfiles.find((x) => x.id === authorId)?.institution || '-'
  const getArticleReviews = (articleId: string) => allReviews.filter((r) => r.article_id === articleId)
  const getReviewerName = (reviewerId: string) => allProfiles.find((x) => x.id === reviewerId)?.full_name || 'Parecerista Designado'

  const getArticleIssue = (art: any) => {
    if (art?.target_issue) return art.target_issue
    const d = new Date(art?.created_at || Date.now())
    const month = d.getMonth() + 1
    return month <= 5 ? `Fascículo de Junho de ${d.getFullYear()}` : `Fascículo de Dezembro de ${d.getFullYear()}`
  }

  const getDeadlineBadge = (deadlineStr: string | null) => {
    if (!deadlineStr) return null
    const deadlineDate = new Date(deadlineStr + 'T23:59:59')
    const diffDays = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    const formatted = new Date(deadlineStr + 'T12:00:00').toLocaleDateString('pt-BR')

    if (diffDays > 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
          <Clock className="w-3 h-3" /> Restam {diffDays} {diffDays === 1 ? 'dia' : 'dias'} ({formatted})
        </span>
      )
    } else if (diffDays === 0) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Vence hoje ({formatted})!
        </span>
      )
    } else {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Expirado há {Math.abs(diffDays)} dias ({formatted})
        </span>
      )
    }
  }

  const handleAddCoauthor = () => setCoauthors([...coauthors, { name: '', email: '', institution: '', lattes: '', orcid: '' }])
  const handleUpdateCoauthor = (index: number, field: string, value: string) => {
    const updated = [...coauthors]
    updated[index][field] = value
    setCoauthors(updated)
  }
  const handleRemoveCoauthor = (index: number) => setCoauthors(coauthors.filter((_, i) => i !== index))

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    setSavingProfile(true)
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: profileName,
        institution: profileInst,
        phone: profilePhone,
        lattes_url: profileLattes,
        orcid: profileOrcid,
      }).eq('id', session.user.id)
      if (error) throw error
      alert('Perfil atualizado com sucesso!')
      setShowProfileModal(false)
      initUser(session, false)
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleDeleteUser = async (userToDelete: any) => {
    if (userToDelete.id === session.user.id) {
      alert('Você não pode excluir o seu próprio perfil!')
      return
    }
    if (!window.confirm(`Excluir cadastro de "${userToDelete.full_name}" (${userToDelete.email})?`)) return
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userToDelete.id)
      if (error) throw error
      alert('Cadastro excluído com sucesso!')
      fetchAllData()
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: 'https://revista-saber-portal.vercel.app/redefinir-senha',
      })
      if (error) throw error
      alert('Link de redefinição de senha enviado com sucesso! Verifique sua caixa de entrada e spam.')
      setShowForgotModal(false)
      setForgotEmail('')
    } catch (err: any) {
      alert(`Erro ao solicitar: ${err.message}`)
    } finally {
      setForgotLoading(false)
    }
  }

  const handleExportBackup = () => {
    if (allArticles.length === 0) {
      alert('Nenhum dado disponível para exportação.')
      return
    }
    const headers = ['ID Artigo', 'Titulo', 'Secao', 'Status', 'Data', 'Fasciculo', 'Autor', 'Email', 'Filiacao', 'ORCID', 'Lattes', 'Coautores', 'Pareceres', 'Justificativa']
    const rows = allArticles.map((art) => [
      art.id,
      `"${art.title.replace(/"/g, '""')}"`,
      `"${art.section || 'Artigo Científico'}"`,
      `"${art.status}"`,
      `"${new Date(art.created_at).toLocaleDateString('pt-BR')}"`,
      `"${art.target_issue || getArticleIssue(art)}"`,
      `"${getAuthorName(art.author_id).replace(/"/g, '""')}"`,
      `"${getAuthorEmail(art.author_id)}"`,
      `"${(art.author_institution || getAuthorInst(art.author_id)).replace(/"/g, '""')}"`,
      `"${art.author_orcid || ''}"`,
      `"${art.author_lattes || ''}"`,
      `"${(art.coauthors || []).map((c: any) => `${c.name} (${c.institution || ''})`).join('; ').replace(/"/g, '""')}"`,
      getArticleReviews(art.id).length,
      `"${(art.rejection_reason || '').replace(/"/g, '""')}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Backup_Revista_Saber_Psicanalitico_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !session) return
    if (!termOriginal || !termEthics || !termAnonymous || !termCC || !termAI) {
      alert('Por favor, confirme todas as 5 declarações éticas e internacionais.')
      return
    }

    setSubmitting(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `artigo_${session.user.id}_${Date.now()}.${fileExt}`
      const filePath = `artigos/${fileName}`

      const { error: uploadError } = await supabase.storage.from('manuscritos').upload(filePath, selectedFile)
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
        author_lattes: authorLattes,
        author_orcid: authorOrcid,
        author_bio: authorBio,
        coauthors: coauthors,
        file_url: filePath,
        original_file_url: filePath,
        term_creative_commons: termCC,
        term_ai_declaration: termAI,
        status: 'submetido',
      })
      if (insertError) throw insertError

      sendEmailNotification({
        to: session.user.email,
        subject: 'Confirmação de Submissão - Revista Saber Psicanalítico',
        title: 'Manuscrito Recebido com Sucesso!',
        message: `Olá, ${profile?.full_name || 'Autor(a)'}.\n\nConfirmamos com satisfação o recebimento do seu manuscrito "${newTitle}" na Revista Saber Psicanalítico (ISSN 3086-8416).\n\nSeu trabalho ingressou na etapa de Triagem Editorial. Você poderá acompanhar em tempo real todas as movimentações diretamente pelo portal.`,
        actionText: 'Acompanhar Submissão',
        actionUrl: 'https://revista-saber-portal.vercel.app',
      })

      sendEmailNotification({
        to: 'revistasaberpsicanalitico@gmail.com',
        subject: 'Novo Manuscrito Submetido - Revista Saber Psicanalítico',
        title: 'Novo Artigo Recebido na Revista',
        message: `Um novo manuscrito foi submetido no portal editorial:\n\n• Título: "${newTitle}"\n• Seção: ${newSection}\n• Autor: ${profile?.full_name} (${session.user.email})\n\nAcesse a Sala Editorial para triagem.`,
        actionText: 'Acessar Sala Editorial',
        actionUrl: 'https://revista-saber-portal.vercel.app',
      })

      alert('Parabéns! Seu artigo foi submetido com sucesso à Revista Saber Psicanalítico.')
      setShowSubmitModal(false)
      setNewTitle('')
      setNewTitleEn('')
      setNewAbstract('')
      setNewAbstractEn('')
      setNewKeywords('')
      setNewKeywordsEn('')
      setAuthorLattes('')
      setAuthorOrcid('')
      setAuthorBio('')
      setCoauthors([])
      setSelectedFile(null)
      setTermOriginal(false)
      setTermEthics(false)
      setTermAnonymous(false)
      setTermCC(false)
      setTermAI(false)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro na submissão: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleResubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!revisedFile || !reSubmitArticle) return
    setSubmittingRevision(true)
    try {
      const fileExt = revisedFile.name.split('.').pop()
      const fileName = `revisao_${reSubmitArticle.id}_${Date.now()}.${fileExt}`
      const filePath = `artigos/${fileName}`

      const { error: uploadError } = await supabase.storage.from('manuscritos').upload(filePath, revisedFile)
      if (uploadError) throw uploadError

      const { error: updateError } = await supabase.from('articles').update({
        file_url: filePath,
        status: 'revisao_submetida',
      }).eq('id', reSubmitArticle.id)
      if (updateError) throw updateError

      sendEmailNotification({
        to: 'revistasaberpsicanalitico@gmail.com',
        subject: 'Nova Revisão de Artigo Enviada - Revista Saber Psicanalítico',
        title: 'Manuscrito Corrigido Recebido',
        message: `O(A) autor(a) ${getAuthorName(reSubmitArticle.author_id)} enviou a versão corrigida do artigo "${reSubmitArticle.title}".\n\nO manuscrito está disponível na Sala Editorial aguardando a decisão final.`,
        actionText: 'Acessar Sala Editorial',
        actionUrl: 'https://revista-saber-portal.vercel.app',
      })

      alert('Versão corrigida enviada com sucesso! O manuscrito foi encaminhado para a avaliação e decisão final do Editor.')
      setReSubmitArticle(null)
      setRevisedFile(null)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSubmittingRevision(false)
    }
  }

  const handleDownloadFile = async (filePath: string, articleTitle: string, fileType = 'Manuscrito') => {
    try {
      const { data, error } = await supabase.storage.from('manuscritos').createSignedUrl(filePath, 60)
      if (error) throw error
      if (data?.signedUrl) {
        const response = await fetch(data.signedUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const cleanTitle = articleTitle.replace(/[^a-zA-Z0-9À-ÿ]/g, '_').slice(0, 45)
        const ext = filePath.split('.').pop() || 'docx'
        link.download = `${fileType}_${cleanTitle}.${ext}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (err: any) {
      alert('Erro ao baixar o arquivo.')
    }
  }

  const handleUpdateStatus = async (articleId: string, status: string) => {
    if (status === 'recusado') {
      const target = allArticles.find((a) => a.id === articleId)
      setRejectionModalArticle(target)
      setRejectionReasonText('')
      return
    }

    try {
      const targetArticle = allArticles.find((a) => a.id === articleId)
      const authorEmail = getAuthorEmail(targetArticle?.author_id)
      const authorName = getAuthorName(targetArticle?.author_id)
      const articleTitle = targetArticle?.title || 'Seu Artigo'

      const { error } = await supabase.from('articles').update({ status }).eq('id', articleId)
      if (error) throw error

      if (authorEmail) {
        if (status === 'ajustes_iniciais') {
          sendEmailNotification({
            to: authorEmail,
            subject: 'Ajuste Inicial Solicitado - Revista Saber Psicanalítico',
            title: 'Ajuste de Anonimização Solicitado',
            message: `Prezado(a) ${authorName},\n\nA comissão editorial identificou a necessidade de ajustes na anonimização do arquivo "${articleTitle}". Por favor, acesse o portal para reenviar o arquivo corrigido.`,
            actionText: 'Reenviar Arquivo',
            actionUrl: 'https://revista-saber-portal.vercel.app',
          })
        } else if (status === 'correcoes_pendentes') {
          sendEmailNotification({
            to: authorEmail,
            subject: 'Pareceres Emitidos / Correções Solicitadas - Revista Saber Psicanalítico',
            title: 'Orientações de Correção Disponíveis',
            message: `Prezado(a) ${authorName},\n\nA avaliação por pares do artigo "${articleTitle}" foi concluída e foram solicitadas correções. As orientações já estão liberadas em seu painel de autor.`,
            actionText: 'Ver Pareceres e Enviar Revisão',
            actionUrl: 'https://revista-saber-portal.vercel.app',
          })
        } else if (status === 'aceito') {
          sendEmailNotification({
            to: authorEmail,
            subject: 'Parabéns! Artigo Aceito para Publicação - Revista Saber Psicanalítico',
            title: 'Seu Artigo Foi Aceito para Publicação!',
            message: `Prezado(a) ${authorName},\n\nÉ com grande satisfação que comunicamos o ACEITE OFICIAL do trabalho "${articleTitle}" na Revista Saber Psicanalítico (ISSN 3086-8416).\n\nSua Carta Oficial de Aceite timbrada já está disponível para emissão no portal.`,
            actionText: 'Emitir Carta de Aceite (PDF)',
            actionUrl: 'https://revista-saber-portal.vercel.app',
          })
        }
      }

      alert('Status atualizado com sucesso!')
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleConfirmRejection = async () => {
    if (!rejectionModalArticle || !rejectionReasonText.trim()) {
      alert('Informe a justificativa editorial.')
      return
    }
    setSavingRejection(true)
    try {
      const authorEmail = getAuthorEmail(rejectionModalArticle.author_id)
      const authorName = getAuthorName(rejectionModalArticle.author_id)
      const articleTitle = rejectionModalArticle.title

      const { error } = await supabase.from('articles').update({
        status: 'recusado',
        rejection_reason: rejectionReasonText,
      }).eq('id', rejectionModalArticle.id)
      if (error) throw error

      if (authorEmail) {
        sendEmailNotification({
          to: authorEmail,
          subject: 'Parecer Editorial sobre seu Manuscrito - Revista Saber Psicanalítico',
          title: 'Decisão Editorial do Manuscrito',
          message: `Prezado(a) ${authorName},\n\nO processo de avaliação do manuscrito "${articleTitle}" foi concluído pela Revista Saber Psicanalítico (ISSN 3086-8416).\n\nAs considerações da comissão e a respectiva Carta de Não Aceite encontram-se disponíveis no portal editorial.`,
          actionText: 'Visualizar Considerações',
          actionUrl: 'https://revista-saber-portal.vercel.app',
        })
      }

      alert('Manuscrito marcado como Recusado. E-mail com parecer enviado ao autor.')
      setRejectionModalArticle(null)
      setRejectionReasonText('')
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSavingRejection(false)
    }
  }

  const handleUpdateTargetIssue = async (articleId: string, target_issue: string) => {
    try {
      await supabase.from('articles').update({ target_issue }).eq('id', articleId)
      fetchAllData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
      if (error) throw error
      alert('Função atualizada com sucesso!')
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleAssignReviewer = async () => {
    if (!selectedReviewerId || !assignModalArticle || !assignDeadline) {
      alert('Selecione o parecerista e a data limite.')
      return
    }
    try {
      const reviewerProfile = allProfiles.find((p) => p.id === selectedReviewerId)
      const { error } = await supabase.from('reviews').insert({
        article_id: assignModalArticle.id,
        reviewer_id: selectedReviewerId,
        deadline: assignDeadline,
        status: 'pendente',
      })
      if (error) throw error
      await supabase.from('articles').update({ status: 'em_avaliacao' }).eq('id', assignModalArticle.id)

      if (reviewerProfile?.email) {
        const formattedDeadline = new Date(assignDeadline + 'T12:00:00').toLocaleDateString('pt-BR')
        sendEmailNotification({
          to: reviewerProfile.email,
          subject: 'Convite para Avaliação de Manuscrito - Revista Saber Psicanalítico',
          title: 'Designação de Parecer Técnico-Científico',
          message: `Prezado(a) ${reviewerProfile.full_name},\n\nVocê foi designado(a) para emitir parecer ad-hoc para o manuscrito "${assignModalArticle.title}".\n\n• Prazo limite: ${formattedDeadline}\n\nO artigo encontra-se anonimizado. Acesse o portal para download e avaliação.`,
          actionText: 'Acessar Área do Parecerista',
          actionUrl: 'https://revista-saber-portal.vercel.app',
        })
      }

      alert('Parecerista atribuído com sucesso! E-mail de convite enviado.')
      setAssignModalArticle(null)
      setSelectedReviewerId('')
      setAssignDeadline('')
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
        const { error: uploadError } = await supabase.storage.from('manuscritos').upload(reviewFilePath, reviewFile)
        if (uploadError) throw uploadError
      }

      const fullComments = `--- CRITÉRIOS EDITORIAIS ---\n• Título e Resumo: ${critTitle.toUpperCase()}\n• Consistência Teórico-Psicanalítica: ${critTheory.toUpperCase()}\n• Relevância Clínica: ${critClinical.toUpperCase()}\n\n--- PARECER AO AUTOR ---\n${commentsAuthor}`

      const { error } = await supabase.from('reviews').update({
        recommendation,
        comments_for_author: fullComments,
        confidential_comments_editor: commentsEditor,
        review_file_url: reviewFilePath,
        status: 'concluido',
      }).eq('id', reviewModalData.id)
      if (error) throw error

      const targetArt = allArticles.find((a) => a.id === reviewModalData.article_id)
      sendEmailNotification({
        to: 'revistasaberpsicanalitico@gmail.com',
        subject: 'Novo Parecer Concluído - Revista Saber Psicanalítico',
        title: 'Parecer Técnico-Científico Emitido',
        message: `O(A) parecerista ${profile?.full_name} concluiu a avaliação do artigo "${targetArt?.title}".\n\n• Recomendação: ${recommendation.toUpperCase()}\n\nAcesse a Sala Editorial para conferir.`,
        actionText: 'Acessar Sala Editorial',
        actionUrl: 'https://revista-saber-portal.vercel.app',
      })

      alert('Parecer emitido com sucesso! Agradecemos sua colaboração.')
      setReviewModalData(null)
      setReviewFile(null)
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const completedReviewers = allProfiles.filter((p) => Array.from(new Set(allReviews.filter((r) => r.status === 'concluido').map((r) => r.reviewer_id))).includes(p.id))

  const handleCopyReviewers = () => {
    const text = completedReviewers.map((r) => `• ${r.full_name} (${r.institution || 'ASP'}) ${r.email ? `- ${r.email}` : ''} ${r.lattes_url ? `- Lattes: ${r.lattes_url}` : ''} ${r.orcid ? `- ORCID: ${r.orcid}` : ''}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedThanks(true)
    setTimeout(() => setCopiedThanks(false), 2500)
  }

  const filteredArticles = allArticles.filter((art) => {
    const query = editorSearch.toLowerCase()
    const matchesSearch = art.title.toLowerCase().includes(query) || getAuthorName(art.author_id).toLowerCase().includes(query) || (art.section || '').toLowerCase().includes(query)
    const matchesStatus = editorStatusFilter === 'todos' || art.status === editorStatusFilter
    return matchesSearch && matchesStatus
  })

  const isFullEditor = profile?.role === 'editor'
  const isCouncil = profile?.role === 'council'
  const canAccessEditorialRoom = isFullEditor || isCouncil

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Carregando Revista Saber Psicanalítico...</div>
  }

  // TELA DE LOGIN / CADASTRO
  if (!session) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="flex flex-col items-center mb-6 space-y-3">
            <img src="/logo-revista.png" alt="Revista Saber Psicanalítico" className="h-32 md:h-36 object-contain drop-shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800">Revista Saber Psicanalítico</h1>
              <p className="text-xs text-indigo-700 font-semibold tracking-wider uppercase mt-0.5">ISSN 3086-8416</p>
              <p className="text-[11px] text-slate-500 mt-1">Portal de Submissão e Avaliação Editorial</p>
            </div>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button type="button" onClick={() => { setIsLogin(true); setAuthMessage(null); }} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Entrar</button>
            <button type="button" onClick={() => { setIsLogin(false); setAuthMessage(null); }} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Cadastrar como Autor</button>
          </div>

          {authMessage && (
            <div className="space-y-3 mb-4">
              <div className={`p-3 rounded-lg text-sm ${authMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                {authMessage.text}
              </div>
              {authMessage.type === 'success' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800"><AlertTriangle className="w-4 h-4 text-amber-600" /> Atenção à sua Caixa de Entrada / Spam:</p>
                  <p>Notificações partem de <strong>revistasaberpsicanalitico@gmail.com</strong>. Se cair no Spam, marque como <strong>"Não é spam"</strong>.</p>
                </div>
              )}
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

                sendEmailNotification({
                  to: email,
                  subject: 'Bem-vindo(a) à Revista Saber Psicanalítico',
                  title: 'Cadastro Realizado com Sucesso!',
                  message: `Prezado(a) ${fullName},\n\nConfirmamos a criação da sua conta no Portal da Revista Saber Psicanalítico (ISSN 3086-8416).\n\nVocê já pode acessar o sistema com seu e-mail e senha.`,
                  actionText: 'Acessar o Portal',
                  actionUrl: 'https://revista-saber-portal.vercel.app',
                })
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
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome completo sem títulos (Ex: Fulano de Tal)" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <input type="text" required value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Ex: Associação Saber Psicanalítico / Universidade" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </>
            )}

            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600">Senha</label>
                {isLogin && <button type="button" onClick={() => setShowForgotModal(true)} className="text-[11px] text-indigo-600 hover:underline">Esqueci minha senha</button>}
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>

            <button type="submit" disabled={authLoading} className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm disabled:opacity-50 shadow-sm">
              {authLoading ? 'Processando...' : isLogin ? 'Acessar o Portal' : 'Cadastrar como Autor'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center space-y-4">
            <button type="button" onClick={() => { setShowVerifyModal(true); setVerifyResult(null); setVerifyCodeInput(''); }} className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1.5 hover:underline">
              <Search className="w-3.5 h-3.5" /> Verificar Autenticidade de Documento
            </button>

            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              <img src="/logo-asp.png" alt="ASP" className="h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div className="text-[10px] text-slate-400">
                <p className="font-semibold text-slate-600">Associação Saber Psicanalítico (ASP) — Entidade Mantenedora</p>
                <p>CNPJ: 44.966.907/0001-85 • Caruaru/PE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Verificação na tela de Login */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Validar Documento</h3>
                <button type="button" onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
              </div>
              <input type="text" value={verifyCodeInput} onChange={(e) => setVerifyCodeInput(e.target.value)} placeholder="ASP-ACE-... ou ASP-PAR-..." className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-indigo-500" />
              <button type="button" disabled={checkingCode || !verifyCodeInput.trim()} onClick={handleVerifyCode} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold">Consultar Autenticidade</button>

              {verifyResult && (
                <div className={`p-4 rounded-xl text-xs space-y-1.5 border ${verifyResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  {verifyResult.valid ? (
                    <>
                      <p className="font-bold text-emerald-800">✔ DOCUMENTO AUTÊNTICO</p>
                      <p><strong>Tipo:</strong> {verifyResult.type}</p>
                      <p><strong>Titular:</strong> {verifyResult.person} ({verifyResult.role})</p>
                      <p><strong>Referência:</strong> {verifyResult.title}</p>
                      <p><strong>Data:</strong> {verifyResult.date}</p>
                    </>
                  ) : <p className="font-bold text-center">Código não encontrado.</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <h3 className="text-base font-bold text-slate-900 text-center">Recuperar Senha</h3>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="seu.email@exemplo.com" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowForgotModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button type="submit" disabled={forgotLoading} className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg">{forgotLoading ? 'Enviando...' : 'Enviar Link'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    )
  }

  const myAuthorArticles = allArticles.filter((art) => art.author_id === session?.user?.id)
  const myReviewAssignments = allReviews.filter((r) => r.reviewer_id === session?.user?.id)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        {/* CABEÇALHO */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img src="/logo-revista.png" alt="Revista Saber Psicanalítico" className="h-16 md:h-20 object-contain drop-shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">Revista Saber Psicanalítico</h1>
                <p className="text-xs text-indigo-700 font-semibold tracking-wider">ISSN 3086-8416 • Portal Editorial</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {isFullEditor && (
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                  <button type="button" onClick={() => setViewMode('editor')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'editor' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Sala Editorial</button>
                  <button type="button" onClick={() => setViewMode('reviewer')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'reviewer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Visão Parecerista</button>
                  <button type="button" onClick={() => setViewMode('author')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'author' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Visão Autor</button>
                </div>
              )}

              {isCouncil && (
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                  <button type="button" onClick={() => setViewMode('council')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'council' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Conselho Editorial</button>
                  <button type="button" onClick={() => setViewMode('author')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'author' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Visão Autor</button>
                </div>
              )}

              {profile?.role === 'reviewer' && (
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                  <button type="button" onClick={() => setViewMode('reviewer')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'reviewer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Avaliações (Parecerista)</button>
                  <button type="button" onClick={() => setViewMode('author')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'author' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Meus Trabalhos (Autor)</button>
                </div>
              )}

              <span className="text-xs text-slate-700 font-medium">Olá, <strong>{profile?.full_name || 'Usuário'}</strong></span>
              <button type="button" onClick={handleOpenProfileModal} className="px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg font-medium flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5 text-indigo-600" /><span>Meu Perfil</span></button>
              <button type="button" onClick={() => supabase.auth.signOut()} className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium flex items-center gap-1"><LogOut className="w-3.5 h-3.5" />Sair</button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span><strong>Dica Editorial:</strong> E-mails oficiais partem de <strong>revistasaberpsicanalitico@gmail.com</strong>. Se cair no Spam, marque como <strong>"Não é spam"</strong>.</span>
          </div>

          {/* VISÃO DO AUTOR */}
          {viewMode === 'author' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Meus Trabalhos Submetidos</h2>
                  <p className="text-sm text-slate-500">Acompanhe em tempo real o status, baixe cartas e envie revisões.</p>
                </div>
                <button type="button" onClick={() => setShowSubmitModal(true)} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Submeter Novo Trabalho
                </button>
              </div>

              {myAuthorArticles.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-sm">Nenhum trabalho submetido ainda.</div>
              ) : (
                <div className="grid gap-4">
                  {myAuthorArticles.map((art) => {
                    const revs = getArticleReviews(art.id).filter((r) => r.status === 'concluido')
                    const canResubmit = ['correcoes_pendentes', 'ajustes_iniciais', 'revisao_submetida'].includes(art.status)

                    return (
                      <div key={art.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{art.status.toUpperCase()}</span>
                            <h3 className="text-lg font-bold text-slate-800">{art.title}</h3>
                            <p className="text-sm text-slate-600 line-clamp-3">{art.abstract}</p>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            {art.status === 'aceito' && (
                              <button type="button" onClick={() => setActiveOfficialDoc({ type: 'aceite', article: art })} className="px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-1.5"><Award className="w-4 h-4" /> Carta de Aceite (PDF)</button>
                            )}
                            {art.status === 'recusado' && (
                              <button type="button" onClick={() => setActiveOfficialDoc({ type: 'recusa', article: art })} className="px-3 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg flex items-center justify-center gap-1.5"><Ban className="w-4 h-4" /> Carta de Não Aceite (PDF)</button>
                            )}
                            <button type="button" onClick={() => handleDownloadFile(art.file_url, art.title, 'Manuscrito')} className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5"><Download className="w-3.5 h-3.5" /> Baixar Manuscrito</button>
                            {canResubmit && (
                              <button type="button" onClick={() => { setReSubmitArticle(art); setRevisedFile(null); }} className="px-3 py-2 text-xs font-semibold bg-amber-600 text-white rounded-lg flex items-center justify-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Enviar Arquivo Corrigido</button>
                            )}
                          </div>
                        </div>

                        {art.status === 'recusado' && art.rejection_reason && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900">
                            <strong>Considerações do Editor:</strong> {art.rejection_reason}
                          </div>
                        )}

                        {revs.length > 0 && (
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                            <h5 className="font-bold text-slate-700">Pareceres Liberados:</h5>
                            {revs.map((rev, idx) => (
                              <div key={rev.id} className="bg-white p-3 rounded border border-slate-200 space-y-1">
                                <span className="font-bold text-indigo-700">Parecer {idx + 1} ({rev.recommendation?.toUpperCase()}):</span>
                                <p className="whitespace-pre-line text-slate-600">{rev.comments_for_author}</p>
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

          {/* VISÃO DO PARECERISTA */}
          {viewMode === 'reviewer' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800">Trabalhos Atribuídos</h2>
                <p className="text-sm text-slate-500">Avaliação Duplo-Cega (*Blind Peer Review*): autoria sob sigilo.</p>
              </div>

              {myReviewAssignments.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">Nenhum manuscrito atribuído a você no momento.</div>
              ) : (
                <div className="grid gap-4">
                  {myReviewAssignments.map((rev) => {
                    const art = allArticles.find((a) => a.id === rev.article_id)
                    const isCompleted = rev.status === 'concluido'
                    return (
                      <div key={rev.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{isCompleted ? 'CONCLUÍDO' : 'PENDENTE'}</span>
                            {!isCompleted && getDeadlineBadge(rev.deadline)}
                            <h3 className="text-lg font-bold text-slate-900 mt-2">{art?.title}</h3>
                          </div>
                          <div className="flex gap-2">
                            {isCompleted && (
                              <button type="button" onClick={() => setActiveOfficialDoc({ type: 'lattes', review: rev, article: art, reviewer: profile })} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Certificado Lattes (PDF)</button>
                            )}
                            {art && <button type="button" onClick={() => handleDownloadFile(art.file_url, art.title, 'Manuscrito_Para_Parecer')} className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-700 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Baixar Word</button>}
                          </div>
                        </div>
                        {art && <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{art.abstract}</p>}
                        <div className="flex justify-end">
                          <button type="button" onClick={() => { setReviewModalData(rev); setRecommendation(rev.recommendation || 'aceitar'); setCommentsAuthor(rev.comments_for_author || ''); setCommentsEditor(rev.confidential_comments_editor || ''); setReviewFile(null); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">{isCompleted ? 'Editar Parecer' : 'Preencher Parecer'}</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* SALA EDITORIAL */}
          {canAccessEditorialRoom && (viewMode === 'editor' || viewMode === 'council') && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">{isFullEditor ? 'Sala Editorial' : 'Conselho Editorial'}</span>
                  <h2 className="text-xl font-bold text-slate-800">{isFullEditor ? 'Gestão Editorial de Artigos' : 'Acompanhamento do Fluxo'}</h2>
                </div>
                <div className="flex gap-2">
                  {isFullEditor && <button type="button" onClick={handleExportBackup} className="px-3 py-2 bg-emerald-50 text-emerald-800 font-semibold rounded-lg text-xs flex items-center gap-1 border border-emerald-200"><FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Exportar Backup (Excel)</button>}
                  <button type="button" onClick={() => setShowReviewerThankModal(true)} className="px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 border border-slate-200"><Award className="w-3.5 h-3.5" /> Quadro de Pareceristas</button>
                  <button type="button" onClick={() => setShowSubmitModal(true)} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-xs flex items-center gap-1.5"><Upload className="w-4 h-4" /> + Submeter Artigo</button>
                </div>
              </div>

              {/* Filtros e Busca */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <input type="text" value={editorSearch} onChange={(e) => setEditorSearch(e.target.value)} placeholder="Pesquise por título, autor ou seção..." className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <div className="flex gap-1.5 overflow-x-auto text-xs">
                  {['todos', 'submetido', 'ajustes_iniciais', 'em_avaliacao', 'correcoes_pendentes', 'revisao_submetida', 'aceito', 'recusado'].map((status) => (
                    <button key={status} type="button" onClick={() => setEditorStatusFilter(status)} className={`px-3 py-1.5 rounded-lg font-medium capitalize ${editorStatusFilter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{status.replace('_', ' ')}</button>
                  ))}
                </div>
              </div>

              {/* Lista dos Artigos */}
              <div className="grid gap-4">
                {filteredArticles.map((art) => {
                  const revs = getArticleReviews(art.id)
                  const isAccepted = art.status === 'aceito'
                  const isRejected = art.status === 'recusado'
                  const isOwnArticle = art.author_id === session?.user?.id
                  const hasRevision = art.original_file_url && art.original_file_url !== art.file_url

                  return (
                    <div key={art.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">{art.section || 'Artigo Científico'}</span>
                          <span className="ml-2 text-xs font-semibold text-indigo-700">{art.status.toUpperCase()}</span>
                          {isOwnArticle && <span className="ml-2 text-xs font-bold text-purple-700">[Seu Manuscrito - COPE]</span>}
                          <h4 className="text-lg font-bold text-slate-900 mt-1">{art.title}</h4>
                          <p className="text-xs text-slate-500">Autor: <strong>{getAuthorName(art.author_id)}</strong> ({getAuthorEmail(art.author_id)}) • {art.author_institution || getAuthorInst(art.author_id)}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {isAccepted && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'aceite', article: art })} className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">Carta de Aceite</button>}
                          {isRejected && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'recusa', article: art })} className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">Carta Não Aceite</button>}
                          <button type="button" onClick={() => handleDownloadFile(art.file_url, art.title, hasRevision ? 'Manuscrito_Revisado' : 'Manuscrito')} className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-700">Baixar</button>
                          {hasRevision && <button type="button" onClick={() => handleDownloadFile(art.original_file_url, art.title, 'Versao_Original')} className="px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg text-slate-600">Original</button>}

                          {isFullEditor && !isOwnArticle && (
                            <>
                              <button type="button" onClick={() => { setAssignModalArticle(art); setSelectedReviewerId(''); setAssignDeadline(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); }} className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">+ Parecerista</button>
                              <select value={art.status} onChange={(e) => handleUpdateStatus(art.id, e.target.value)} className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg bg-white">
                                <option value="submetido">Triagem</option>
                                <option value="ajustes_iniciais">Ajuste Anonimização</option>
                                <option value="em_avaliacao">Em Avaliação</option>
                                <option value="correcoes_pendentes">Solicitar Correções</option>
                                <option value="revisao_submetida">Revisão Enviada</option>
                                <option value="aceito">Aceito</option>
                                <option value="recusado">Recusado</option>
                              </select>
                            </>
                          )}
                        </div>
                      </div>

                      {isAccepted && isFullEditor && !isOwnArticle && (
                        <div className="flex items-center gap-2 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs">
                          <span className="font-semibold text-emerald-950">Fascículo Programado:</span>
                          <input type="text" defaultValue={art.target_issue || getArticleIssue(art)} onBlur={(e) => handleUpdateTargetIssue(art.id, e.target.value)} className="px-2.5 py-1 text-xs border border-emerald-200 rounded bg-white flex-1" />
                        </div>
                      )}

                      {!isOwnArticle && revs.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                          <p className="font-bold text-slate-700">Pareceristas Atribuídos:</p>
                          {revs.map((r) => (
                            <div key={r.id} className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200">
                              <div>
                                <span className="font-bold text-slate-800">{getReviewerName(r.reviewer_id)}</span>
                                <span className="ml-2 text-indigo-600 font-semibold">[{r.status.toUpperCase()}]</span>
                                {r.status !== 'concluido' && <span className="ml-2">{getDeadlineBadge(r.deadline)}</span>}
                              </div>
                              <div className="flex gap-2">
                                {r.status === 'concluido' && isFullEditor && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'lattes', review: r, article: art, reviewer: allProfiles.find(p => p.id === r.reviewer_id) })} className="text-emerald-700 hover:underline">Certificado Lattes</button>}
                                {r.status === 'concluido' && <button type="button" onClick={() => alert(`PARECER:\n\n${r.comments_for_author}`)} className="text-indigo-600 hover:underline">Ler Parecer</button>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Quadro de Usuários */}
              {isFullEditor && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-800">Quadro de Usuários Cadastrados ({allProfiles.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
                        <tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Instituição</th><th className="p-3">Função</th><th className="p-3 text-right">Ação</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allProfiles.map((p) => (
                          <tr key={p.id}>
                            <td className="p-3 font-semibold text-slate-900">{p.full_name}</td>
                            <td className="p-3">{p.email}</td>
                            <td className="p-3">{p.institution || '-'}</td>
                            <td className="p-3 capitalize font-bold text-indigo-700">{p.role}</td>
                            <td className="p-3 text-right">
                              <select value={p.role} onChange={(e) => handleUpdateRole(p.id, e.target.value)} className="p-1 border border-slate-200 rounded bg-white text-xs">
                                <option value="author">Autor</option>
                                <option value="reviewer">Parecerista</option>
                                <option value="council">Conselho Editorial</option>
                                <option value="editor">Editor</option>
                              </select>
                              {p.id !== session?.user?.id && <button type="button" onClick={() => handleDeleteUser(p)} className="ml-2 text-rose-500 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5 inline" /></button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* RODAPÉ */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img src="/logo-asp.png" alt="ASP" className="h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div><p className="font-bold text-slate-800">Associação Saber Psicanalítico (ASP)</p><p className="text-[11px]">Entidade Mantenedora • CNPJ: 44.966.907/0001-85</p></div>
          </div>
          <div className="text-center md:text-right text-[11px]"><p>Rua Visconde de Inhaúma, 1361, sala 408 — Caruaru/PE</p><p>revistasaberpsicanalitico@gmail.com</p></div>
        </div>
      </footer>

      {/* MODAL EXTERNO DE SUBMISSÃO (Do Modals.tsx) */}
      <SubmitModal
        show={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onSubmit={handleSubmitArticle}
        newSection={newSection}
        setNewSection={setNewSection}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newTitleEn={newTitleEn}
        setNewTitleEn={setNewTitleEn}
        newAbstract={newAbstract}
        setNewAbstract={setNewAbstract}
        newAbstractEn={newAbstractEn}
        setNewAbstractEn={setNewAbstractEn}
        newKeywords={newKeywords}
        setNewKeywords={setNewKeywords}
        newKeywordsEn={newKeywordsEn}
        setNewKeywordsEn={setNewKeywordsEn}
        authorInstitution={authorInstitution}
        setAuthorInstitution={setAuthorInstitution}
        authorLattes={authorLattes}
        setAuthorLattes={setAuthorLattes}
        authorOrcid={authorOrcid}
        setAuthorOrcid={setAuthorOrcid}
        authorBio={authorBio}
        setAuthorBio={setAuthorBio}
        coauthors={coauthors}
        onAddCoauthor={handleAddCoauthor}
        onUpdateCoauthor={handleUpdateCoauthor}
        onRemoveCoauthor={handleRemoveCoauthor}
        onFileChange={(e: any) => setSelectedFile(e.target.files?.[0] || null)}
        termOriginal={termOriginal}
        setTermOriginal={setTermOriginal}
        termEthics={termEthics}
        setTermEthics={setTermEthics}
        termAnonymous={termAnonymous}
        setTermAnonymous={setTermAnonymous}
        termCC={termCC}
        setTermCC={setTermCC}
        termAI={termAI}
        setTermAI={setTermAI}
        submitting={submitting}
      />

      {/* MODAL EXTERNO DE REENVIO (Do Modals.tsx) */}
      <ResubmitModal
        article={reSubmitArticle}
        onClose={() => setReSubmitArticle(null)}
        onSubmit={handleResubmitArticle}
        onFileChange={(e: any) => setRevisedFile(e.target.files?.[0] || null)}
        submitting={submittingRevision}
      />

      {/* MODAL UNIFICADO TIMBRADO A4 (Do Modals.tsx) */}
      <OfficialDocModal
        data={activeOfficialDoc}
        onClose={() => setActiveOfficialDoc(null)}
        getAuthorName={getAuthorName}
        getAuthorInst={getAuthorInst}
        getArticleIssue={getArticleIssue}
      />

      {/* MODAL: MEU PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
              <h3 className="text-base font-bold text-slate-900">Meu Perfil Acadêmico</h3>
              <button type="button" onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <input type="text" required value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nome Completo *" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              <input type="text" required value={profileInst} onChange={(e) => setProfileInst(e.target.value)} placeholder="Filiação Institucional *" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              <input type="url" value={profileLattes} onChange={(e) => setProfileLattes(e.target.value)} placeholder="Link do Currículo Lattes" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              <input type="text" value={profileOrcid} onChange={(e) => setProfileOrcid(e.target.value)} placeholder="Identificador ORCID" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="Telefone / WhatsApp" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" disabled={savingProfile} className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg disabled:opacity-50">{savingProfile ? 'Salvando...' : 'Salvar Alterações'} </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ATRIBUIR PARECERISTA */}
      {assignModalArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Designar Parecerista</h3>
            <select value={selectedReviewerId} onChange={(e) => setSelectedReviewerId(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white">
              <option value="">-- Escolha um parecerista --</option>
              {allProfiles.filter((p) => (p.role === 'reviewer' || p.role === 'editor') && p.id !== assignModalArticle.author_id).map((rev) => (
                <option key={rev.id} value={rev.id}>{rev.full_name} ({rev.role}) - {rev.institution || 'ASP'}</option>
              ))}
            </select>
            <input type="date" required value={assignDeadline} onChange={(e) => setAssignDeadline(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setAssignModalArticle(null)} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="button" disabled={!selectedReviewerId || !assignDeadline} onClick={handleAssignReviewer} className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg disabled:opacity-50">Confirmar e Enviar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RECUSA COM JUSTIFICATIVA */}
      {rejectionModalArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Justificativa da Não Aceitação</h3>
            <textarea required rows={5} value={rejectionReasonText} onChange={(e) => setRejectionReasonText(e.target.value)} placeholder="Descreva os fundamentos para a recusa..." className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setRejectionModalArticle(null)} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button type="button" disabled={savingRejection || !rejectionReasonText.trim()} onClick={handleConfirmRejection} className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg disabled:opacity-50">{savingRejection ? 'Gravando...' : 'Confirmar Recusa'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARECERISTA */}
      {reviewModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Parecer Editorial</h3>
            <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white">
              <option value="aceitar">Aceitar sem restrições</option>
              <option value="correcoes_obrigatorias">Aceitar com correções</option>
              <option value="rejeitar">Recusar manuscrito</option>
            </select>
            <textarea required rows={5} value={commentsAuthor} onChange={(e) => setCommentsAuthor(e.target.value)} placeholder="Parecer para o autor..." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            <input type="file" accept=".docx,.doc" onChange={(e) => setReviewFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500" />
            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={() => setReviewModalData(null)} className="px-4 py-2 text-xs text-slate-600">Voltar</button>
              <button type="button" disabled={submittingReview || !commentsAuthor} onClick={handleSubmitReview} className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg">{submittingReview ? 'Enviando...' : 'Concluir Parecer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGRADECIMENTO PARECERISTAS */}
      {showReviewerThankModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Agradecimento aos Pareceristas</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-60 overflow-y-auto space-y-2 text-xs">
              {completedReviewers.map((rev) => (
                <div key={rev.id} className="bg-white p-2.5 rounded border border-slate-200">
                  <p className="font-bold text-slate-900">{rev.full_name} ({rev.institution || 'ASP'})</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowReviewerThankModal(false)} className="px-4 py-2 text-xs text-slate-600">Fechar</button>
              <button type="button" onClick={handleCopyReviewers} className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg">{copiedThanks ? 'Copiado!' : 'Copiar Dados'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
