'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  BookOpen, User, Lock, Mail, Building, Phone, ArrowRight, 
  Upload, FileText, LogOut, ShieldCheck, Users, UserCheck, 
  Download, MessageSquare, Send, CheckCircle2, HelpCircle, 
  FileCheck, AlertTriangle, RefreshCw, Plus, Trash2, ShieldAlert,
  Award, Printer, Copy, Check, Edit3, Link as LinkIcon, Search, X, AlertCircle, KeyRound
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

  // Esqueci minha senha
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Data States
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [allProfiles, setAllProfiles] = useState<any[]>([])
  const [allReviews, setAllReviews] = useState<any[]>([])

  // Modal Verificador Público
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyCodeInput, setVerifyCodeInput] = useState('')
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [checkingCode, setCheckingCode] = useState(false)

  // Modal Meu Perfil
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileInst, setProfileInst] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileLattes, setProfileLattes] = useState('')
  const [profileOrcid, setProfileOrcid] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

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
  const [authorLattes, setAuthorLattes] = useState('')
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

  // Modal Atribuir Parecerista
  const [assignModalArticle, setAssignModalArticle] = useState<any>(null)
  const [selectedReviewerId, setSelectedReviewerId] = useState('')

  // Modal Parecerista
  const [reviewModalData, setReviewModalData] = useState<any>(null)
  const [critTitle, setCritTitle] = useState('satisfatorio')
  const [critTheory, setCritTheory] = useState('consistente')
  const [critClinical, setCritClinical] = useState('alta')
  const [recommendation, setRecommendation] = useState('aceitar')
  const [commentsAuthor, setCommentsAuthor] = useState('')
  const [commentsEditor, setCommentsEditor] = useState('')
  const [reviewFile, setReviewFile] = useState<File | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)

  // Modais de Documentos Timbrados
  const [selectedAcceptanceArticle, setSelectedAcceptanceArticle] = useState<any>(null)
  const [selectedReviewCert, setSelectedReviewCert] = useState<any>(null)
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

  // isFirstLoad garante que alternar de aba não reseta a visão do usuário
  const initUser = async (currentSession: any, isFirstLoad = false) => {
    const user = currentSession.user
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        if (isFirstLoad) {
          setViewMode(data.role === 'editor' ? 'editor' : data.role === 'reviewer' ? 'reviewer' : 'author')
        }
        setAuthorInstitution(data.institution || '')
        setAuthorLattes(data.lattes_url || '')
        setAuthorOrcid(data.orcid || '')
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
        if (isFirstLoad) setViewMode('editor')
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

  const handleOpenProfileModal = () => {
    setProfileName(profile?.full_name || '')
    setProfileInst(profile?.institution || '')
    setProfilePhone(profile?.phone || '')
    setProfileLattes(profile?.lattes_url || '')
    setProfileOrcid(profile?.orcid || '')
    setShowProfileModal(true)
  }

  const sendEmailNotification = async (payload: {
    to: string
    subject: string
    title: string
    message: string
    actionText?: string
    actionUrl?: string
  }) => {
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

  const getExpectedIssue = () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    if (month <= 5) return `Fascículo de Junho de ${year}`
    if (month <= 11) return `Fascículo de Dezembro de ${year}`
    return `Fascículo de Junho de ${year + 1}`
  }

  const handleAddCoauthor = () => {
    setCoauthors([...coauthors, { name: '', email: '', institution: '', lattes: '', orcid: '' }])
  }

  const handleUpdateCoauthor = (index: number, field: string, value: string) => {
    const updated = [...coauthors]
    updated[index][field] = value
    setCoauthors(updated)
  }

  const handleRemoveCoauthor = (index: number) => {
    setCoauthors(coauthors.filter((_, i) => i !== index))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    setSavingProfile(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileName,
          institution: profileInst,
          phone: profilePhone,
          lattes_url: profileLattes,
          orcid: profileOrcid,
        })
        .eq('id', session.user.id)

      if (error) throw error
      alert('Seu perfil foi atualizado com sucesso!')
      setShowProfileModal(false)
      initUser(session, false)
    } catch (err: any) {
      alert(`Erro ao atualizar: ${err.message}`)
    } finally {
      setSavingProfile(false)
    }
  }

  // Excluir Cadastro de Usuário (Item h)
  const handleDeleteUser = async (userToDelete: any) => {
    if (userToDelete.id === session.user.id) {
      alert('Você não pode excluir o seu próprio perfil de editor!')
      return
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o cadastro de "${userToDelete.full_name}" (${userToDelete.email})? Esta ação não pode ser desfeita.`
    )
    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id)

      if (error) throw error
      alert('Cadastro excluído com sucesso!')
      fetchAllData()
    } catch (err: any) {
      alert(`Erro ao excluir usuário: ${err.message}`)
    }
  }

  // Recuperação de Senha (Item g)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) return
    setForgotLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: 'https://revista-saber-portal.vercel.app',
      })
      if (error) throw error
      alert('Enviamos um link de redefinição de senha para o seu e-mail!')
      setShowForgotModal(false)
      setForgotEmail('')
    } catch (err: any) {
      alert(`Erro ao solicitar: ${err.message}`)
    } finally {
      setForgotLoading(false)
    }
  }

  // Verificador Público de Autenticidade
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
        const parts = code.split('-')
        const prefix = parts[2] || ''
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

      if (code.includes('ASP-PAR-')) {
        const parts = code.split('-')
        const prefix = parts[2] || ''
        const foundRev = allReviews.find((r) => r.id.toUpperCase().startsWith(prefix) && r.status === 'concluido')

        if (foundRev) {
          const revPerson = allProfiles.find((p) => p.id === foundRev.reviewer_id)
          setVerifyResult({
            valid: true,
            type: 'Declaração de Atuação como Parecerista Ad-hoc',
            title: 'Manuscrito Técnico-Científico Avaliado',
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
        author_lattes: authorLattes,
        author_orcid: authorOrcid,
        author_bio: authorBio,
        coauthors: coauthors,
        file_url: filePath,
        status: 'submetido',
      })

      if (insertError) throw insertError

      sendEmailNotification({
        to: session.user.email,
        subject: 'Confirmação de Submissão - Revista Saber Psicanalítico',
        title: 'Manuscrito Recebido com Sucesso!',
        message: `Olá, ${profile?.full_name || 'Autor(a)'}.\n\nConfirmamos com satisfação o recebimento do seu manuscrito intitulado "${newTitle}" na Revista Saber Psicanalítico (ISSN 3086-8416).\n\nSeu trabalho ingressou na etapa de Triagem Editorial. Você poderá acompanhar em tempo real todas as movimentações e pareceres diretamente pelo portal editorial.\n\nCaso este e-mail tenha chegado na sua caixa de Spam, por favor marque como "Não é spam" para receber os próximos comunicados oficiais.`,
        actionText: 'Acompanhar Minha Submissão',
        actionUrl: 'https://revista-saber-portal.vercel.app',
      })

      alert('Parabéns! Seu artigo foi submetido com sucesso à Revista Saber Psicanalítico. Um e-mail de confirmação foi enviado.')
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

  // Mudança de Status com E-mails
  const handleUpdateStatus = async (articleId: string, status: string) => {
    try {
      const targetArticle = allArticles.find((a) => a.id === articleId)
      const authorEmail = getAuthorEmail(targetArticle?.author_id)
      const authorName = getAuthorName(targetArticle?.author_id)
      const articleTitle = targetArticle?.title || 'Seu Artigo'

      const { error } = await supabase
        .from('articles')
        .update({ status })
        .eq('id', articleId)

      if (error) throw error

      if (authorEmail) {
        if (status === 'ajustes_iniciais') {
          sendEmailNotification({
            to: authorEmail,
            subject: 'Ajuste Inicial Solicitado - Revista Saber Psicanalítico',
            title: 'Ajuste de Anonimização Solicitado',
            message: `Prezado(a) ${authorName},\n\nA comissão editorial realizou a triagem inicial do seu manuscrito "${articleTitle}" e identificou a necessidade de ajustes na anonimização do arquivo (remoção de nomes, afiliações ou propriedades do documento).\n\nPor favor, acesse o portal editorial para reenviar o arquivo corrigido e viabilizar o encaminhamento aos pareceristas.`,
            actionText: 'Reenviar Arquivo no Portal',
            actionUrl: 'https://revista-saber-portal.vercel.app',
          })
        } else if (status === 'correcoes_pendentes') {
          sendEmailNotification({
            to: authorEmail,
            subject: 'Pareceres Emitidos / Correções Solicitadas - Revista Saber Psicanalítico',
            title: 'Orientações de Correção Disponíveis',
            message: `Prezado(a) ${authorName},\n\nA avaliação por pares do seu artigo "${articleTitle}" foi concluída e a comissão editorial deliberou pela solicitação de correções no texto.\n\nO parecer detalhado e o arquivo Word com eventuais anotações pontuais dos pareceristas já estão liberados em seu painel de autor.`,
            actionText: 'Ver Pareceres e Enviar Revisão',
            actionUrl: 'https://revista-saber-portal.vercel.app',
          })
        } else if (status === 'aceito') {
          sendEmailNotification({
            to: authorEmail,
            subject: 'Parabéns! Artigo Aceito para Publicação - Revista Saber Psicanalítico',
            title: 'Seu Artigo Foi Aceito para Publicação!',
            message: `Prezado(a) ${authorName},\n\nÉ com grande satisfação que comunicamos o ACEITE OFICIAL do seu trabalho "${articleTitle}" para publicação na Revista Saber Psicanalítico (ISSN 3086-8416).\n\nSua Carta Oficial de Aceite timbrada com chancela eletrônica já se encontra disponível para emissão e download em PDF no portal.`,
            actionText: 'Emitir Minha Carta de Aceite (PDF)',
            actionUrl: 'https://revista-saber-portal.vercel.app',
          })
        }
      }

      alert(`Status atualizado com sucesso! E-mail de notificação enviado ao autor.`)
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

  // Atribuição de Parecerista
  const handleAssignReviewer = async () => {
    if (!selectedReviewerId || !assignModalArticle) return
    try {
      const reviewerProfile = allProfiles.find((p) => p.id === selectedReviewerId)

      const { error } = await supabase.from('reviews').insert({
        article_id: assignModalArticle.id,
        reviewer_id: selectedReviewerId,
        status: 'pendente',
      })
      if (error) throw error

      await supabase.from('articles').update({ status: 'em_avaliacao' }).eq('id', assignModalArticle.id)

      if (reviewerProfile?.email) {
        sendEmailNotification({
          to: reviewerProfile.email,
          subject: 'Convite para Avaliação de Manuscrito - Revista Saber Psicanalítico',
          title: 'Designação de Parecer Técnico-Científico',
          message: `Prezado(a) ${reviewerProfile.full_name},\n\nTendo em vista sua destacada competência acadêmica e clínica, o corpo editorial da Revista Saber Psicanalítico (ISSN 3086-8416) tem a honra de designá-lo(a) para emitir parecer ad-hoc para o manuscrito intitulado "${assignModalArticle.title}".\n\nO artigo encontra-se anonimizado (avaliação duplo-cega). Acesse o portal para baixar o arquivo Word e preencher sua avaliação.`,
          actionText: 'Acessar Área do Parecerista',
          actionUrl: 'https://revista-saber-portal.vercel.app',
        })
      }

      alert('Parecerista atribuído com sucesso! E-mail de convite enviado.')
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

  const completedReviewerIds = Array.from(new Set(allReviews.filter((r) => r.status === 'concluido').map((r) => r.reviewer_id)))
  const completedReviewers = allProfiles.filter((p) => completedReviewerIds.includes(p.id))

  const handleCopyReviewers = () => {
    const text = completedReviewers.map((r) => {
      const parts = [`• ${r.full_name}`]
      if (r.institution) parts.push(`(${r.institution})`)
      if (r.email) parts.push(`- E-mail: ${r.email}`)
      if (r.lattes_url) parts.push(`- Lattes: ${r.lattes_url}`)
      if (r.orcid) parts.push(`- ORCID: ${r.orcid}`)
      return parts.join(' ')
    }).join('\n')

    navigator.clipboard.writeText(text)
    setCopiedThanks(true)
    setTimeout(() => setCopiedThanks(false), 2500)
  }

  // MODAL DE VERIFICAÇÃO PÚBLICA
  const renderVerificationModal = () => {
    if (!showVerifyModal) return null
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Validação Pública de Documentos</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Verificar Autenticidade</h3>
            </div>
            <button
              onClick={() => setShowVerifyModal(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Digite o código verificador constante no rodapé da Carta de Aceite ou Declaração de Parecerista (ex: <span className="font-mono text-slate-700">ASP-ACE-...</span> ou <span className="font-mono text-slate-700">ASP-PAR-...</span>).
          </p>

          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={verifyCodeInput}
                onChange={(e) => setVerifyCodeInput(e.target.value)}
                placeholder="Cole o código aqui..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              disabled={checkingCode || !verifyCodeInput.trim()}
              onClick={handleVerifyCode}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              {checkingCode ? 'Consultando banco oficial...' : 'Consultar Autenticidade'}
            </button>

            {verifyResult && (
              <div className={`p-4 rounded-xl text-xs space-y-2 border ${
                verifyResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                {verifyResult.valid ? (
                  <>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 border-b border-emerald-200 pb-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      DOCUMENTO AUTÊNTICO E HOMOLOGADO
                    </div>
                    <p><strong>Tipo:</strong> {verifyResult.type}</p>
                    <p><strong>Titular:</strong> {verifyResult.person} ({verifyResult.role})</p>
                    <p><strong>Referência:</strong> {verifyResult.title}</p>
                    <p><strong>Data de Emissão:</strong> {verifyResult.date}</p>
                    <p className="text-[10px] text-emerald-700 italic pt-1">
                      Homologado eletronicamente pela Revista Saber Psicanalítico (ISSN 3086-8416).
                    </p>
                  </>
                ) : (
                  <div className="text-center py-2 space-y-1">
                    <p className="font-bold text-rose-800">Código Verificador Não Encontrado</p>
                    <p className="text-[11px] text-rose-600">
                      Verifique se digitou o código exatamente como consta no rodapé do documento.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowVerifyModal(false)}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Carregando Revista Saber Psicanalítico...
      </div>
    )
  }

  // TELA DE LOGIN / CADASTRO COM AS LOGOS E ORIENTAÇÕES LIMPAS
  if (!session) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          
          {/* Logo da Revista em Tamanho Bem Maior e Evidente */}
          <div className="flex flex-col items-center mb-6 space-y-3">
            <div className="flex items-center justify-center w-full">
              <img
                src="/logo-revista.png"
                alt="Revista Saber Psicanalítico"
                className="h-32 md:h-36 object-contain drop-shadow-sm"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-slate-800">
                Revista Saber Psicanalítico
              </h1>
              <p className="text-xs text-indigo-700 font-semibold tracking-wider uppercase mt-0.5">
                ISSN 3086-8416
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Portal de Submissão e Avaliação Editorial por Pares
              </p>
            </div>
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
            <div className="space-y-3 mb-4">
              <div className={`p-3 rounded-lg text-sm ${
                authMessage.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {authMessage.text}
              </div>

              {authMessage.type === 'success' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Atenção à sua Caixa de Entrada / Spam:
                  </p>
                  <p className="leading-relaxed">
                    Nossas notificações automáticas são enviadas pelo e-mail <strong>revistasaberpsicanalitico@gmail.com</strong>.
                  </p>
                  <p className="leading-relaxed">
                    • Por favor, verifique a sua pasta de <strong>Spam / Lixo Eletrônico</strong>.<br />
                    • Caso nossa mensagem esteja lá, clique em <strong>"Não é spam"</strong> ou adicione nosso e-mail aos seus contatos para garantir que você receba todos os pareceres e prazos do seu trabalho.
                  </p>
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

                // Disparo de Boas-Vindas ao Novo Usuário Cadastrado (Item l)
                sendEmailNotification({
                  to: email,
                  subject: 'Bem-vindo(a) à Revista Saber Psicanalítico',
                  title: 'Cadastro Realizado com Sucesso!',
                  message: `Prezado(a) ${fullName},\n\nConfirmamos a criação da sua conta no Portal de Submissão e Avaliação da Revista Saber Psicanalítico (ISSN 3086-8416), mantida pela Associação Saber Psicanalítico (ASP).\n\nVocê já pode acessar o sistema com seu e-mail e senha para realizar submissões de artigos e acompanhar os processos editoriais em tempo real.`,
                  actionText: 'Acessar o Portal Editorial',
                  actionUrl: 'https://revista-saber-portal.vercel.app',
                })

                setAuthMessage({ type: 'success', text: 'Conta criada com sucesso! Faça login com seu e-mail e senha.' })
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nome completo sem abreviações ou títulos acadêmicos (Ex: Fulano de Tal)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Instituição / Afiliação *</label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Ex: Associação Saber Psicanalítico / Universidade / Faculdade / Instituto"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600">Senha</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-indigo-600 hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
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

          {/* Botão de Verificação Pública e Logo da ASP no Rodapé do Login */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center space-y-4">
            <button
              type="button"
              onClick={() => {
                setShowVerifyModal(true)
                setVerifyResult(null)
                setVerifyCodeInput('')
              }}
              className="text-xs text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1.5 hover:underline"
            >
              <Search className="w-3.5 h-3.5" />
              Verificar Autenticidade de Documento / Certificado
            </button>

            {/* Logo da ASP no Rodapé do Card */}
            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              <img
                src="/logo-asp.png"
                alt="Associação Saber Psicanalítico"
                className="h-10 object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="text-[10px] text-slate-400 space-y-0.5">
                <p className="font-semibold text-slate-600">Associação Saber Psicanalítico (ASP) — Entidade Mantenedora</p>
                <p>CNPJ: 44.966.907/0001-85 • Caruaru/PE • www.asppsicanalise.com.br</p>
              </div>
            </div>
          </div>
        </div>

        {renderVerificationModal()}

        {/* MODAL: RECUPERAÇÃO DE SENHA */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Recuperar Minha Senha</h3>
                <p className="text-xs text-slate-500">
                  Informe o seu e-mail cadastrado para receber o link oficial de redefinição de senha.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                  >
                    {forgotLoading ? 'Enviando...' : 'Enviar Link'}
                  </button>
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
              <img
                src="/logo-revista.png"
                alt="Revista Saber Psicanalítico"
                className="h-16 md:h-20 object-contain drop-shadow-sm"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-tight">
                  Revista Saber Psicanalítico
                </h1>
                <p className="text-xs text-indigo-700 font-semibold tracking-wider">
                  ISSN 3086-8416 • Portal Editorial
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
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

              {/* Nome do Usuário sempre visível em qualquer tela */}
              <span className="text-xs text-slate-700 font-medium">
                Olá, <strong>{profile?.full_name || 'Usuário'}</strong>
              </span>

              <button
                onClick={handleOpenProfileModal}
                className="px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg font-medium flex items-center gap-1.5"
                title="Editar meu Lattes, ORCID e Filiação"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Meu Perfil</span>
              </button>

              <button
                onClick={() => supabase.auth.signOut()}
                className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
          
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>Dica Editorial:</strong> Nossas notificações automáticas partem de <strong>revistasaberpsicanalitico@gmail.com</strong>. Se algum comunicado cair no Spam, marque como <strong>"Não é spam"</strong> para receber pareceres e cartas de aceite.
              </span>
            </div>
          </div>

          {/* VISÃO DO AUTOR */}
          {viewMode === 'author' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Meus Trabalhos Submetidos</h2>
                  <p className="text-sm text-slate-500">
                    Acompanhe em tempo real o status, baixe sua Carta de Aceite e reenvie versões ajustadas.
                  </p>
                </div>
                <button
                  type="button"
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
                    const isAccepted = art.status === 'aceito'
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
                            {isAccepted && (
                              <button
                                type="button"
                                onClick={() => setSelectedAcceptanceArticle(art)}
                                className="w-full px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Award className="w-4 h-4" />
                                Emitir Carta de Aceite (PDF)
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDownloadFile(art.file_url)}
                              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5 text-indigo-600" />
                              Baixar Manuscrito Atual
                            </button>

                            {(isPendingCorrections || isInitialDeskAdjust) && (
                              <button
                                type="button"
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
                                      type="button"
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

          {/* VISÃO DO PARECERISTA */}
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
                    const isCompleted = rev.status === 'concluido'

                    return (
                      <div key={rev.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {art?.section || 'Artigo Científico'}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {isCompleted ? 'PARECER ENVIADO' : 'AGUARDANDO SEU PARECER'}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{art?.title || 'Artigo'}</h3>
                            <p className="text-xs text-slate-500 mt-1">Palavras-chave: {art?.keywords}</p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            {isCompleted && (
                              <button
                                type="button"
                                onClick={() => setSelectedReviewCert({ review: rev, article: art, reviewer: profile })}
                                className="px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
                              >
                                <Award className="w-3.5 h-3.5" />
                                Declaracão para Lattes (PDF)
                              </button>
                            )}

                            {art && (
                              <button
                                type="button"
                                onClick={() => handleDownloadFile(art.file_url)}
                                className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-sm text-slate-700"
                              >
                                <Download className="w-3.5 h-3.5 text-indigo-600" />
                                Baixar Manuscrito Original (Word)
                              </button>
                            )}
                          </div>
                        </div>

                        {art && (
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-2">
                            <p className="font-semibold text-slate-700">Resumo do Manuscrito:</p>
                            <p className="leading-relaxed">{art.abstract}</p>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
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
                            {isCompleted ? 'Visualizar / Editar Meu Parecer' : 'Preencher Parecer Editorial'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* PAINEL DO EDITOR GERAL (COM BLOQUEIO ÉTICO DE AUTO-AVALIAÇÃO) */}
          {viewMode === 'editor' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-700 mb-1">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Sala Editorial • ISSN 3086-8416</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Gestão de Artigos, Pareceres e Expediente</h2>
                  <p className="text-sm text-slate-500">
                    Coordene o fluxo duplo-cego, emita Cartas de Aceite oficiais e certifique pareceristas.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewerThankModal(true)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 border border-slate-200"
                  >
                    <Award className="w-3.5 h-3.5 text-indigo-600" />
                    Quadro de Pareceristas (Agradecimento)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 text-xs"
                  >
                    <Upload className="w-4 h-4" />
                    + Submeter Artigo
                  </button>
                </div>
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
                    const isAccepted = art.status === 'aceito'
                    // Trava de Conflito de Interesses Ético (COPE) - Item f
                    const isOwnArticle = art.author_id === session?.user?.id

                    return (
                      <div key={art.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                                {art.status === 'ajustes_iniciais' ? 'AJUSTE DE ANONIMIZAÇÃO' : art.status.replace('_', ' ').toUpperCase()}
                              </span>

                              {isOwnArticle && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                  <ShieldAlert className="w-3 h-3" />
                                  Seu Manuscrito (COPE)
                                </span>
                              )}

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
                              {art.author_lattes && (
                                <a href={art.author_lattes} target="_blank" rel="noreferrer" className="ml-2 text-indigo-600 hover:underline inline-flex items-center gap-0.5">
                                  • Lattes
                                </a>
                              )}
                              {art.author_orcid && (
                                <span className="ml-2 text-emerald-700 font-medium">
                                  • ORCID: {art.author_orcid}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {isAccepted && (
                              <button
                                type="button"
                                onClick={() => setSelectedAcceptanceArticle(art)}
                                className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5"
                              >
                                <Award className="w-3.5 h-3.5" />
                                Carta de Aceite
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDownloadFile(art.file_url)}
                              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 text-slate-700"
                            >
                              <Download className="w-3.5 h-3.5 text-indigo-600" />
                              Baixar Manuscrito
                            </button>

                            {/* Bloqueio Ético caso o artigo seja do próprio editor logado */}
                            {!isOwnArticle ? (
                              <>
                                <button
                                  type="button"
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
                              </>
                            ) : (
                              <span className="px-3 py-1.5 text-[11px] font-medium bg-slate-100 text-slate-500 rounded-lg border border-slate-200 italic">
                                Gerenciado por outro Editor (COPE)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Aviso do Conflito de Interesses */}
                        {isOwnArticle && (
                          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-lg text-xs text-purple-900 space-y-0.5">
                            <p className="font-bold flex items-center gap-1.5">
                              <ShieldAlert className="w-4 h-4 text-purple-600" />
                              Salvaguarda Ética de Avaliação por Pares:
                            </p>
                            <p className="text-[11px] text-purple-800">
                              Por você ser autor deste trabalho, as ações de designar pareceristas e alterar o status foram restritas. Outro membro do comitê editorial conduzirá seu processo de forma cega. Acompanhe a evolução do trabalho pela sua <strong>Visão Autor</strong>.
                            </p>
                          </div>
                        )}

                        {art.coauthors && art.coauthors.length > 0 && (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <p className="font-semibold text-slate-700 mb-1">Coautores Cadastrados ({art.coauthors.length}):</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              {art.coauthors.map((c: any, idx: number) => (
                                <div key={idx} className="bg-white p-2.5 rounded border border-slate-200">
                                  <p className="font-bold text-slate-800">{c.name || 'Sem nome'}</p>
                                  <p className="text-slate-500 text-[11px]">{c.email || 'Sem e-mail'} • {c.institution || 'Sem filiação'}</p>
                                  <div className="flex gap-2 text-[11px] mt-0.5">
                                    {c.lattes && <a href={c.lattes} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Lattes</a>}
                                    {c.orcid && <span className="text-emerald-700">ORCID: {c.orcid}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <strong>Resumo:</strong> {art.abstract}
                        </p>

                        {/* Pareceres Atribuídos (Ocultados se for artigo próprio) */}
                        {!isOwnArticle && revs.length > 0 && (
                          <div className="bg-indigo-50/40 p-4 rounded-lg border border-indigo-100 space-y-2">
                            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Pareceristas Designados ({revs.length}):
                            </h5>
                            <div className="grid gap-2">
                              {revs.map((r) => (
                                <div key={r.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs flex justify-between items-center flex-wrap gap-2">
                                  <div>
                                    <span className="font-semibold text-slate-800">{getReviewerName(r.reviewer_id)}</span>
                                    <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      r.status === 'concluido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}>
                                      {r.status === 'concluido' ? `PARECER CONCLUÍDO (${r.recommendation?.toUpperCase()})` : 'AGUARDANDO PARECER'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {r.status === 'concluido' && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const revProf = allProfiles.find((p) => p.id === r.reviewer_id)
                                          setSelectedReviewCert({ review: r, article: art, reviewer: revProf })
                                        }}
                                        className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center gap-1"
                                      >
                                        <Award className="w-3 h-3" />
                                        Certificado Lattes
                                      </button>
                                    )}

                                    {r.review_file_url && (
                                      <button
                                        type="button"
                                        onClick={() => handleDownloadFile(r.review_file_url)}
                                        className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded border flex items-center gap-1"
                                      >
                                        <Download className="w-3 h-3 text-indigo-600" />
                                        Word Anotado
                                      </button>
                                    )}

                                    {r.status === 'concluido' && (
                                      <button
                                        type="button"
                                        onClick={() => alert(`PARECER DE ${getReviewerName(r.reviewer_id)}:\n\n${r.comments_for_author}\n\nNOTAS CONFIDENCIAIS AO EDITOR:\n${r.confidential_comments_editor || 'Nenhuma'}`)}
                                        className="text-xs text-indigo-600 hover:underline font-semibold"
                                      >
                                        Ler Parecer
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

              {/* QUADRO DE USUÁRIOS (COM BOTÃO DE EXCLUIR CADASTRO) */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Quadro de Usuários Cadastrados ({allProfiles.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Defina quem são os Pareceristas ou outros Editores da Revista. Exclua cadastros duplicados com o botão vermelho.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Nome</th>
                        <th className="p-3">E-mail</th>
                        <th className="p-3">Instituição</th>
                        <th className="p-3">Lattes / ORCID</th>
                        <th className="p-3">Função Atual</th>
                        <th className="p-3 text-right">Alterar Função / Excluir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allProfiles.map((p) => (
                        <tr key={p.id}>
                          <td className="p-3 font-semibold text-slate-900">{p.full_name}</td>
                          <td className="p-3">{p.email}</td>
                          <td className="p-3">{p.institution || '-'}</td>
                          <td className="p-3">
                            <div className="space-y-0.5">
                              {p.lattes_url ? (
                                <a href={p.lattes_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline block">Lattes</a>
                              ) : <span className="text-slate-300">-</span>}
                              {p.orcid && <span className="text-emerald-700 block text-[10px]">ORCID: {p.orcid}</span>}
                            </div>
                          </td>
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
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={p.role}
                                onChange={(e) => handleUpdateRole(p.id, e.target.value)}
                                className="p-1 border border-slate-200 rounded bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="author">Autor</option>
                                <option value="reviewer">Parecerista</option>
                                <option value="editor">Editor</option>
                              </select>

                              {p.id !== session?.user?.id && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(p)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                                  title="Excluir cadastro"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
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
      </div>

      {/* RODAPÉ INSTITUCIONAL */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo-asp.png"
              alt="Associação Saber Psicanalítico"
              className="h-10 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <p className="font-bold text-slate-800 text-sm">Associação Saber Psicanalítico (ASP)</p>
              <p className="text-[11px] text-slate-500">Entidade Responsável e Mantenedora</p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1 text-[11px]">
            <p>Rua Visconde de Inhaúma, 1361, sala 408 — Maurício de Nassau — Caruaru/PE — CEP 55012-010</p>
            <p>
              CNPJ: 44.966.907/0001-85 •{' '}
              <a href="https://www.asppsicanalise.com.br" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium">
                www.asppsicanalise.com.br
              </a>{' '}
              • Contato: revistasaberpsicanalitico@gmail.com
            </p>
          </div>
        </div>
      </footer>

      {renderVerificationModal()}

      {/* MODAL: MEU PERFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Meu Perfil Acadêmico</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mantenha seus dados atualizados para inclusão em certificados e expedientes da Revista.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Filiação Institucional *</label>
                <input
                  type="text"
                  required
                  value={profileInst}
                  onChange={(e) => setProfileInst(e.target.value)}
                  placeholder="Ex: Associação Saber Psicanalítico / UFPE"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Link do Currículo Lattes</label>
                <input
                  type="url"
                  value={profileLattes}
                  onChange={(e) => setProfileLattes(e.target.value)}
                  placeholder="http://lattes.cnpq.br/0000000000000000"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Identificador ORCID</label>
                <input
                  type="text"
                  value={profileOrcid}
                  onChange={(e) => setProfileOrcid(e.target.value)}
                  placeholder="0000-0000-0000-0000"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                >
                  {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE SUBMISSÃO COMPLETO (Item a) */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Submissão Editorial • ISSN 3086-8416</span>
                <h3 className="text-lg font-bold text-slate-900">Submeter Novo Manuscrito</h3>
                <p className="text-xs text-slate-500 mt-1">Preencha todos os dados com atenção conforme as orientações.</p>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitArticle} className="space-y-5">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Filiação Institucional *</label>
                    <input
                      type="text"
                      required
                      value={authorInstitution}
                      onChange={(e) => setAuthorInstitution(e.target.value)}
                      placeholder="Ex: Associação Saber Psicanalítico / Universidade"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Link do Lattes (Opcional)</label>
                    <input
                      type="url"
                      value={authorLattes}
                      onChange={(e) => setAuthorLattes(e.target.value)}
                      placeholder="http://lattes.cnpq.br/..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ORCID (Opcional)</label>
                    <input
                      type="text"
                      value={authorOrcid}
                      onChange={(e) => setAuthorOrcid(e.target.value)}
                      placeholder="0000-0000-0000-0000"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
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
                </div>
              </div>

              {/* BLOCO 2: COAUTORES */}
              <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      2. Coautores do Trabalho ({coauthors.length})
                    </h4>
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
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">Link do Lattes (Opcional)</label>
                        <input
                          type="url"
                          value={c.lattes}
                          onChange={(e) => handleUpdateCoauthor(idx, 'lattes', e.target.value)}
                          placeholder="http://lattes.cnpq.br/..."
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* BLOCO 3: METADADOS */}
              <div className="space-y-4">
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
                  <p>• O documento Word deve estar <strong>COMPLETO</strong>: contendo Título, Título em Inglês, Resumo, Abstract, Palavras-chave, Texto integral, Vinhetas Clínicas e Referências Bibliográficas completas.</p>
                  <p className="text-rose-600 font-semibold">• O arquivo NÃO PODE conter nome dos autores, nem afiliações ou agradecimentos diretos.</p>
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
                  <span><strong>Ineditismo e Autoria:</strong> Declaro que este manuscrito é original, de autoria própria (e dos coautores cadastrados) e não se encontra sob avaliação simultânea em outro periódico.</span>
                </label>

                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termEthics}
                    onChange={(e) => setTermEthics(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span><strong>Sigilo Clínico e Ética Psicanalítica:</strong> Declaro que quaisquer dados clínicos e vinhetas de pacientes foram devidamente anonimizados e descaracterizados, respeitando o sigilo ético absoluto.</span>
                </label>

                <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termAnonymous}
                    onChange={(e) => setTermAnonymous(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span><strong>Anonimização do Manuscrito:</strong> Confirmo que retirei do arquivo Word qualquer menção ao nome dos autores, notas biográficas ou dados nas propriedades do arquivo.</span>
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

      {/* MODAL DO AUTOR: ENVIAR VERSÃO CORRIGIDA (Item c) */}
      {reSubmitArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enviar Nova Versão Corrigida</h3>
                <p className="text-xs text-slate-500 mt-0.5">Artigo: <strong>{reSubmitArticle.title}</strong></p>
              </div>
              <button onClick={() => setReSubmitArticle(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

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

      {/* MODAL DO EDITOR: ATRIBUIR PARECERISTA (Item j) */}
      {assignModalArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Designar Parecerista para Artigo</h3>
                <p className="text-xs text-slate-500 mt-0.5">Artigo: <strong>{assignModalArticle.title}</strong></p>
              </div>
              <button onClick={() => setAssignModalArticle(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Selecione o Avaliador:</label>
              <select
                value={selectedReviewerId}
                onChange={(e) => setSelectedReviewerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              >
                <option value="">-- Escolha um parecerista --</option>
                {allProfiles
                  .filter((p) => (p.role === 'reviewer' || p.role === 'editor') && p.id !== assignModalArticle.author_id)
                  .map((rev) => (
                    <option key={rev.id} value={rev.id}>
                      {rev.full_name} ({rev.role === 'editor' ? 'Editor' : 'Parecerista'}) - {rev.institution || 'ASP'}
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

      {/* MODAL DO PARECERISTA (Item i) */}
      {reviewModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Formulário de Parecer Técnico-Científico</span>
                <h3 className="text-lg font-bold text-slate-900">Emissão de Parecer Editorial</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Artigo: <strong>{allArticles.find((a) => a.id === reviewModalData.article_id)?.title}</strong>
                </p>
              </div>
              <button onClick={() => setReviewModalData(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

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

            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Atenção ao Sigilo do Parecerista no Word:
              </p>
              <p className="leading-relaxed text-[11px]">
                Ao usar comentários no Word, certifique-se de que seu nome pessoal não fique gravado nas notas. 
                <strong> Dica no Word:</strong> Vá em <em>Arquivo &gt; Informações &gt; Verificar se há Problemas &gt; Inspecionar Documento</em> e remova &ldquo;Propriedades do Documento e Informações Pessoais&rdquo;, ou altere seu nome de usuário nas opções do Word para &ldquo;Parecerista&rdquo;.
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
                  <option value="aceitar">Aceitar sem restrições (Recomendado)</option>
                  <option value="correcoes_obrigatorias">Aceitar mediante correções obrigatórias</option>
                  <option value="rejeitar">Recusar manuscrito (Não recomendado)</option>
                </select>
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
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  Anexar Arquivo com Comentários / Correções (.docx - Opcional)
                </label>
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

      {/* MODAL: CARTA OFICIAL DE ACEITE (A4) */}
      {selectedAcceptanceArticle && (() => {
        const authorName = getAuthorName(selectedAcceptanceArticle.author_id)
        const authorInst = selectedAcceptanceArticle.author_institution || getAuthorInst(selectedAcceptanceArticle.author_id)
        const coauthorsList = (selectedAcceptanceArticle.coauthors || [])
          .filter((c: any) => c.name && c.name.trim() !== '')

        let autoriaTexto = authorName
        if (authorInst && authorInst !== '-') autoriaTexto += ` (${authorInst})`
        if (coauthorsList.length > 0) {
          const coauthorsFormatted = coauthorsList.map((c: any) => `${c.name}${c.institution ? ` (${c.institution})` : ''}`).join(', ')
          autoriaTexto += ` e coautoria de ${coauthorsFormatted}`
        }

        const validationCode = `ASP-ACE-${selectedAcceptanceArticle.id.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`

        return (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white max-w-[210mm] w-full shadow-2xl border border-slate-200 my-6 flex flex-col justify-between p-8 sm:p-14 text-slate-900 min-h-[297mm]">
              
              <div>
                <div className="flex justify-between items-center border-b-2 border-indigo-950 pb-6 gap-6">
                  <img
                    src="/logo-revista.png"
                    alt="Revista Saber Psicanalítico"
                    className="h-32 md:h-36 object-contain max-w-[280px]"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="text-right space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Revista Saber Psicanalítico</h2>
                    <p className="text-xs font-bold text-indigo-700 tracking-wider">ISSN 3086-8416</p>
                    <p className="text-[11px] text-slate-600">Associação Saber Psicanalítico (ASP)</p>
                    <p className="text-[10px] text-slate-400">Publicação Semestral Técnico-Científica</p>
                  </div>
                </div>

                <div className="text-center my-8">
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 inline-block pb-1">
                    DECLARAÇÃO DE ACEITE PARA PUBLICAÇÃO
                  </h3>
                </div>

                <div className="space-y-6 text-sm leading-relaxed text-justify text-slate-800">
                  <p>
                    Declaramos, para os devidos fins de comprovação acadêmica e científica, que o trabalho intitulado{' '}
                    <strong>&ldquo;{selectedAcceptanceArticle.title}&rdquo;</strong>, submetido na seção{' '}
                    <strong>{selectedAcceptanceArticle.section || 'Artigo Científico'}</strong>, de autoria de{' '}
                    <strong>{autoriaTexto}</strong>, foi submetido ao processo editorial por pares sob sistema duplo-cego{' '}
                    (<span className="italic">double-blind peer review</span>) pela{' '}
                    <strong>Revista Saber Psicanalítico (ISSN 3086-8416)</strong>.
                  </p>

                  <p>
                    Informamos que, após a emissão de pareceres favoráveis pelo corpo de avaliadores técnico-científicos *ad-hoc* e homologação pelo comitê editorial executivo, o referido manuscrito foi oficialmente{' '}
                    <strong className="text-indigo-950 font-bold">ACEITO PARA PUBLICAÇÃO</strong>, com veiculação programada para o{' '}
                    <strong>{getExpectedIssue()}</strong>.
                  </p>

                  <p className="text-xs text-slate-500 italic">
                    Esta declaração possui validade comprobatória perante programas de pós-graduação, agências de fomento (CAPES/CNPq), concursos públicos e comitês de avaliação acadêmica.
                  </p>
                </div>
              </div>

              <div className="pt-8">
                <div className="text-center space-y-4">
                  <p className="text-xs text-slate-600">
                    Caruaru/PE, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
                  </p>

                  <div className="pt-2">
                    <p className="font-bold text-slate-900 text-base">Dr. Edson Leandro de Almeida</p>
                    <p className="text-xs text-indigo-900 font-semibold uppercase tracking-wider">Editor-Chefe</p>
                    <p className="text-xs text-slate-500">Revista Saber Psicanalítico • ASP</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-lg mx-auto text-left flex items-center justify-between text-[10px] text-slate-600">
                    <div className="space-y-0.5">
                      <p className="font-bold text-indigo-950 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ASSINATURA ELETRÔNICA QUALIFICADA
                      </p>
                      <p>Assinado digitalmente por: <strong>Dr. Edson Leandro de Almeida</strong></p>
                      <p>Chancela de Autenticação: <span className="font-mono text-slate-800 font-bold">{validationCode}</span></p>
                    </div>
                    <div className="text-right text-[9px] text-slate-400 pl-3 border-l border-slate-200">
                      <p>Emissão Oficial</p>
                      <p>Sistema Editorial</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-500">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logo-asp.png"
                      alt="ASP"
                      className="h-9 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div>
                      <p className="font-bold text-slate-700">Associação Saber Psicanalítico (ASP)</p>
                      <p>CNPJ: 44.966.907/0001-85 • Entidade Mantenedora</p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right text-[9px] text-slate-400 space-y-0.5">
                    <p>Rua Visconde de Inhaúma, 1361, sala 408 — Caruaru/PE</p>
                    <p>Verifique a autenticidade deste documento em: <strong>revista-saber-portal.vercel.app</strong></p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 no-print">
                <button
                  type="button"
                  onClick={() => setSelectedAcceptanceArticle(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Salvar em PDF (A4)
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL: DECLARAÇÃO PARA O CURRÍCULO LATTES (A4) */}
      {selectedReviewCert && (() => {
        const revName = selectedReviewCert.reviewer?.full_name || 'Parecerista'
        const revInst = selectedReviewCert.reviewer?.institution ? ` (${selectedReviewCert.reviewer.institution})` : ''
        const validationCode = `ASP-PAR-${selectedReviewCert.review.id.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`

        return (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
            <div className="bg-white max-w-[210mm] w-full shadow-2xl border border-slate-200 my-6 flex flex-col justify-between p-8 sm:p-14 text-slate-900 min-h-[297mm]">
              
              <div>
                <div className="flex justify-between items-center border-b-2 border-indigo-950 pb-6 gap-6">
                  <img
                    src="/logo-revista.png"
                    alt="Revista Saber Psicanalítico"
                    className="h-32 md:h-36 object-contain max-w-[280px]"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="text-right space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Revista Saber Psicanalítico</h2>
                    <p className="text-xs font-bold text-indigo-700 tracking-wider">ISSN 3086-8416</p>
                    <p className="text-[11px] text-slate-600">Associação Saber Psicanalítico (ASP)</p>
                    <p className="text-[10px] text-slate-400">Publicação Semestral Técnico-Científica</p>
                  </div>
                </div>

                <div className="text-center my-8">
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 inline-block pb-1">
                    DECLARAÇÃO DE ATUAÇÃO COMO PARECERISTA AD-HOC
                  </h3>
                </div>

                <div className="space-y-6 text-sm leading-relaxed text-justify text-slate-800">
                  <p>
                    Declaramos, para os devidos fins de comprovação acadêmica e especialmente para fins de pontuação de produção técnica junto ao{' '}
                    <strong>Conselho Nacional de Desenvolvimento Científico e Tecnológico (CNPq / Plataforma Lattes)</strong>, que o(a) pesquisador(a){' '}
                    <strong>{revName}</strong>
                    {revInst}
                    , atuou formalmente como <strong>PARECERISTA AD-HOC</strong> para a{' '}
                    <strong>Revista Saber Psicanalítico (ISSN 3086-8416)</strong>, publicação científica semestral mantida pela{' '}
                    Associação Saber Psicanalítico (ASP).
                  </p>

                  <p>
                    O(A) avaliador(a) emitiu parecer técnico-científico crítico e detalhado em sistema duplo-cego{' '}
                    (<span className="italic">double-blind peer review</span>), concluído em{' '}
                    <strong>{new Date(selectedReviewCert.review.updated_at || selectedReviewCert.review.created_at).toLocaleDateString('pt-BR')}</strong>, 
                    contribuindo decisivamente para o rigor conceitual, metodológico e clínico das publicações deste periódico.
                  </p>

                  <p className="text-xs text-slate-500 italic">
                    Documento comprobatório emitido pelo sistema de editoração eletrônica da Revista Saber Psicanalítico, preservando o sigilo do título avaliado conforme as diretrizes internacionais de avaliação por pares.
                  </p>
                </div>
              </div>

              <div className="pt-8">
                <div className="text-center space-y-4">
                  <p className="text-xs text-slate-600">
                    Caruaru/PE, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
                  </p>

                  <div className="pt-2">
                    <p className="font-bold text-slate-900 text-base">Dr. Edson Leandro de Almeida</p>
                    <p className="text-xs text-indigo-900 font-semibold uppercase tracking-wider">Editor-Chefe</p>
                    <p className="text-xs text-slate-500">Revista Saber Psicanalítico • ASP</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-lg mx-auto text-left flex items-center justify-between text-[10px] text-slate-600">
                    <div className="space-y-0.5">
                      <p className="font-bold text-indigo-950 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        CERTIFICAÇÃO EDITORIAL DE ATUAÇÃO TÉCNICA
                      </p>
                      <p>Homologado por: <strong>Dr. Edson Leandro de Almeida (Editor-Chefe)</strong></p>
                      <p>Código Verificador: <span className="font-mono text-slate-800 font-bold">{validationCode}</span></p>
                    </div>
                    <div className="text-right text-[9px] text-slate-400 pl-3 border-l border-slate-200">
                      <p>Válido para o Lattes</p>
                      <p>CNPq / CAPES</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-500">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logo-asp.png"
                      alt="ASP"
                      className="h-9 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div>
                      <p className="font-bold text-slate-700">Associação Saber Psicanalítico (ASP)</p>
                      <p>CNPJ: 44.966.907/0001-85 • Entidade Mantenedora</p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right text-[9px] text-slate-400 space-y-0.5">
                    <p>Rua Visconde de Inhaúma, 1361, sala 408 — Caruaru/PE</p>
                    <p>Verifique a autenticidade deste documento em: <strong>revista-saber-portal.vercel.app</strong></p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 no-print">
                <button
                  type="button"
                  onClick={() => setSelectedReviewCert(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Salvar em PDF (A4)
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL: QUADRO DE AGRADECIMENTO AOS PARECERISTAS */}
      {showReviewerThankModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Expediente Editorial • ISSN 3086-8416</span>
                <h3 className="text-lg font-bold text-slate-900">Agradecimento aos Pareceristas Ad-hoc</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Lista oficial com Nome, Filiação, E-mail, Lattes e ORCID de todos os pareceristas que concluíram avaliações. Pronta para inclusão no fascículo.
                </p>
              </div>
              <button onClick={() => setShowReviewerThankModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-72 overflow-y-auto space-y-3 text-xs text-slate-700">
              {completedReviewers.length === 0 ? (
                <p className="text-slate-400 italic text-center py-4">Nenhum parecer concluído registrado até o momento.</p>
              ) : (
                completedReviewers.map((rev) => (
                  <div key={rev.id} className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{rev.full_name}</span>
                      <span className="text-[11px] text-slate-500">{rev.institution || 'Associação Saber Psicanalítico'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{rev.email}</p>
                    <div className="flex gap-3 text-[11px] pt-1">
                      {rev.lattes_url ? (
                        <a href={rev.lattes_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-0.5">
                          <LinkIcon className="w-3 h-3" /> Lattes
                        </a>
                      ) : <span className="text-slate-400">Sem Lattes</span>}

                      {rev.orcid ? (
                        <span className="text-emerald-700 font-medium">ORCID: {rev.orcid}</span>
                      ) : <span className="text-slate-400">Sem ORCID</span>}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-500">
                Total de pareceristas credenciados: <strong>{completedReviewers.length}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewerThankModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={completedReviewers.length === 0}
                  onClick={handleCopyReviewers}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {copiedThanks ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedThanks ? 'Copiado para o Editorial!' : 'Copiar Dados para o Fascículo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
