'use client'

import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  User, Lock, Mail, Building, Phone, ArrowRight, Upload, FileText, 
  LogOut, ShieldCheck, Users, UserCheck, Download, MessageSquare, 
  Send, CheckCircle2, AlertTriangle, RefreshCw, Trash2, ShieldAlert,
  Award, Ban, Search, X, AlertCircle, KeyRound, Clock, FileSpreadsheet, 
  Edit3, Plus, Printer, Info, CheckSquare, Copy, Check, Megaphone, UserCog, Filter, ExternalLink,
  Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon, Eye, EyeOff, Code, ThumbsUp, ThumbsDown, BookOpen,
  Sparkles, Scale
} from 'lucide-react'

const formatRole = (role: string) => {
  switch (role) {
    case 'author': return 'Autor'
    case 'reviewer': return 'Parecerista'
    case 'council': return 'Conselho Editorial'
    case 'editor_adjunto': return 'Editor-Adjunto'
    case 'editor': return 'Editor-Chefe'
    default: return role
  }
}

// ============================================================================
// MODAL: CHAMADA PÚBLICA E CADASTRO DE PARECERISTAS (DIRETO NA HOME)
// ============================================================================
function PareceristasModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [step, setStep] = useState<'edital' | 'formulario'>('edital')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [institution, setInstitution] = useState('')
  const [phone, setPhone] = useState('')
  const [academicDegree, setAcademicDegree] = useState('Especialista')
  const [lattesUrl, setLattesUrl] = useState('')
  const [orcid, setOrcid] = useState('')
  const [psicanaliseProfile, setPsicanaliseProfile] = useState('Psicanalista com atuação clínica')
  const [miniBio, setMiniBio] = useState('')
  const [keywords, setKeywords] = useState('')
  const [schools, setSchools] = useState<string[]>([])
  const [axes, setAxes] = useState<string[]>([])
  const [termsAccepted, setTermsAccepted] = useState(false)

  const schoolOptions = ['Sigmund Freud', 'Jacques Lacan', 'Donald Winnicott', 'Sándor Ferenczi', 'Melanie Klein', 'Wilfred Bion', 'Françoise Dolto', 'Outros']
  const axeOptions = [
    'Fundamentos, História e Epistemologia da Psicanálise',
    'Metapsicologia e Conceitos Fundamentais',
    'Clínica Psicanalítica e Técnica',
    'Psicopatologia e Sofrimento Psíquico',
    'Infância, Adolescência e Juventudes',
    'Sexualidade, Gênero e Relações Familiares',
    'Saúde Mental e Atenção Psicossocial',
    'Psicanálise e Educação',
    'Psicanálise, Filosofia e Ciências Humanas',
    'Psicanálise, Cultura, Arte e Política'
  ]

  if (!show) return null

  const handleToggleSchool = (s: string) => {
    setSchools(schools.includes(s) ? schools.filter(x => x !== s) : [...schools, s])
  }

  const handleToggleAxe = (a: string) => {
    if (axes.includes(a)) {
      setAxes(axes.filter(x => x !== a))
    } else {
      if (axes.length >= 3) return alert('Selecione no máximo 3 eixos prioritários.')
      setAxes([...axes, a])
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrMsg(null)

    if (axes.length === 0) return setErrMsg('Selecione ao menos 1 eixo temático.')
    if (!termsAccepted) return setErrMsg('É necessário aceitar os termos éticos e regimentais.')

    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'reviewer', institution, phone } }
      })
      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('Não foi possível obter identificador de usuário.')

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: fullName,
        email,
        role: 'reviewer',
        institution,
        phone,
        lattes_url: lattesUrl || null,
        orcid: orcid || null,
        academic_degree: academicDegree,
        psicanalise_profile: psicanaliseProfile,
        theoretical_schools: schools,
        thematic_axes: axes,
        keywords,
        mini_bio: miniBio,
        reviewer_status: 'pending',
        council_votes: []
      })
      if (profileError) throw profileError

      // E-mails
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Inscrição Registrada - Banco de Pareceristas (Revista Saber Psicanalítico)',
            title: 'Candidatura Recebida',
            message: `Prezado(a) ${fullName},\n\nConfirmamos o recebimento de sua inscrição para o Banco de Pareceristas Ad-hoc da Revista Saber Psicanalítico (ISSN 3086-8416).\n\nSua ficha foi encaminhada para apreciação colegiada do Conselho Editorial.\n\nIMPORTANTE: Enquanto aguarda a deliberação, seu login já está ativo como AUTOR no portal, permitindo que você submeta trabalhos normalmente.`,
            actionText: 'Acessar o Portal da Revista',
            actionUrl: 'https://revista-saber-portal.vercel.app'
          })
        })

        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'revistasaberpsicanalitico@gmail.com',
            subject: 'Nova Inscrição de Parecerista - Revista Saber Psicanalítico',
            title: 'Nova Candidatura de Parecerista',
            message: `Novo cadastro recebido:\n\n• Nome: ${fullName}\n• Titulação: ${academicDegree}\n• Instituição: ${institution}\n• E-mail: ${email}\n• Eixos: ${axes.join(', ')}\n\nAcesse a aba "Candidaturas Pareceristas" na Sala Editorial para deliberar.`,
            actionText: 'Sala Editorial',
            actionUrl: 'https://revista-saber-portal.vercel.app'
          })
        })
      } catch (errMail) {
        console.warn('Erro e-mail:', errMail)
      }

      setSuccess(true)
    } catch (err: any) {
      let m = err.message || 'Erro ao processar inscrição.'
      if (m.includes('already registered')) {
        m = 'Este e-mail já está cadastrado no sistema. Faça login para atualizar seus dados em Meu Perfil.'
      }
      setErrMsg(m)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[99] overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto my-4">
        
        {/* Topo Modal */}
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Banco de Pareceristas Ad-Hoc
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {step === 'edital' ? 'Chamada Pública para Pareceristas' : 'Ficha de Inscrição e Cadastro'}
            </h3>
            <p className="text-xs text-slate-500">Revista Saber Psicanalítico • ISSN 3086-8416</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Inscrição Enviada com Sucesso!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Sua ficha foi registrada e enviada para deliberação colegiada do Conselho Editorial. Enviamos a confirmação para <strong>{email}</strong>.
            </p>
            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950 text-left space-y-1.5 max-w-md mx-auto">
              <p className="font-bold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-600" /> Acesso Imediato:</p>
              <p>• Seu login e senha já estão liberados como <strong>Autor</strong> para submeter manuscritos normalmente.</p>
              <p>• Assim que homologado pelo Conselho Editorial, você poderá receber convites para emitir pareceres.</p>
            </div>
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm">
              Concluir e Acessar o Portal
            </button>
          </div>
        ) : step === 'edital' ? (
          /* PASSO 1: EDITAL DA CHAMADA */
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" /> 1. Quem Pode Participar?
              </h4>
              <p>
                Profissionais, pesquisadores(as), docentes e psicanalistas com graduação concluída em qualquer área que apresentem trajetória compatível com o campo da Psicanálise e suas interfaces.
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                <li>Psicólogos(as) com formação ou atuação psicanalítica;</li>
                <li>Psicanalistas com trajetória clínica ou formação em sociedades/escolas;</li>
                <li>Pesquisadores e docentes de áreas afins (Educação, Filosofia, Ciências Humanas);</li>
                <li><em>A titulação estrita de mestre/doutor não é eliminatória.</em></li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" /> 2. Certificação Oficial no Lattes
              </h4>
              <p>
                A cada avaliação concluída, o sistema emite automaticamente uma <strong>Declaração Oficial Timbrada de Parecerista Ad-hoc</strong> com código eletrônico de autenticidade, com validade formal para pontuação e comprovação curricular.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-indigo-600" /> 3. Avaliação Duplo-Cega
              </h4>
              <p>
                Todas as avaliações são realizadas sob avaliação duplo-cega (*double-blind peer review*), garantindo rigor técnico, sigilo e anonimato entre autores e pareceristas.
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
                Fechar
              </button>
              <button type="button" onClick={() => setStep('formulario')} className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow">
                <span>Avançar para o Formulário de Inscrição</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* PASSO 2: FORMULÁRIO */
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {errMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errMsg}</span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" className="w-full px-3 py-1.5 text-xs border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail para Acesso e Contato *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" className="w-full px-3 py-1.5 text-xs border rounded-lg" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senha de Acesso *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 dígitos" className="w-full px-3 py-1.5 pr-8 text-xs border rounded-lg" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-2 text-slate-400">
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="w-full px-3 py-1.5 text-xs border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Filiação / Instituição *</label>
                <input type="text" required value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Consultório / Universidade" className="w-full px-3 py-1.5 text-xs border rounded-lg" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titulação Máxima *</label>
                <select value={academicDegree} onChange={(e) => setAcademicDegree(e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white">
                  <option value="Graduação">Graduação</option>
                  <option value="Especialização">Especialização</option>
                  <option value="Mestrado">Mestrado</option>
                  <option value="Doutorado">Doutorado</option>
                  <option value="Pós-Doutorado">Pós-Doutorado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relação com a Psicanálise *</label>
                <select value={psicanaliseProfile} onChange={(e) => setPsicanaliseProfile(e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white">
                  <option value="Psicanalista com atuação clínica">Psicanalista com atuação clínica</option>
                  <option value="Pesquisador(a) / Docente universitário(a)">Pesquisador(a) / Docente universitário(a)</option>
                  <option value="Psicólogo(a) / Profissional de saúde mental">Psicólogo(a) / Profissional de saúde mental</option>
                  <option value="Profissional de área afim com estudos em Psicanálise">Profissional de área afim com estudos em Psicanálise</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link do Currículo Lattes *</label>
                <input type="url" required value={lattesUrl} onChange={(e) => setLattesUrl(e.target.value)} placeholder="http://lattes.cnpq.br/..." className="w-full px-3 py-1.5 text-xs border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ORCID (Opcional)</label>
                <input type="text" value={orcid} onChange={(e) => setOrcid(e.target.value)} placeholder="0000-..." className="w-full px-3 py-1.5 text-xs border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mini-biografia e Formação em Psicanálise *</label>
              <textarea required rows={3} maxLength={1500} value={miniBio} onChange={(e) => setMiniBio(e.target.value)} placeholder="Síntese da formação, escolas, grupos ou clínica..." className="w-full px-3 py-1.5 text-xs border rounded-lg" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Autores / Escolas de Referência:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {schoolOptions.map((s) => (
                  <label key={s} className="flex items-center gap-1.5 p-1.5 border rounded bg-slate-50 cursor-pointer text-[11px]">
                    <input type="checkbox" checked={schools.includes(s)} onChange={() => handleToggleSchool(s)} className="rounded text-indigo-600" />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Eixos Temáticos prioritários para avaliação *</label>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{axes.length}/3 selecionados</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {axeOptions.map((ax) => (
                  <label key={ax} className={`flex items-start gap-1.5 p-2 border rounded cursor-pointer text-[11px] ${axes.includes(ax) ? 'bg-indigo-50 border-indigo-300 font-semibold' : 'bg-white'}`}>
                    <input type="checkbox" checked={axes.includes(ax)} onChange={() => handleToggleAxe(ax)} className="mt-0.5 rounded text-indigo-600" />
                    <span className="leading-tight">{ax}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Palavras-chave de Especialidade * (3 a 5 termos separados por vírgula)</label>
              <input type="text" required value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="Ex: melancolia, escuta clínica, psicose" className="w-full px-3 py-1.5 text-xs border rounded-lg" />
            </div>

            <div className="pt-2 border-t">
              <label className="flex items-start gap-2 p-2.5 bg-slate-50 border rounded-lg cursor-pointer text-[11px] text-slate-700">
                <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
                <span>Declaro a veracidade dos dados informados e comprometo-me com o sigilo rigoroso e a conduta ética na avaliação duplo-cega.</span>
              </label>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setStep('edital')} className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold">
                Voltar ao Edital
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 shadow-sm">
                {loading ? 'Processando...' : 'Concluir Inscrição de Parecerista'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'author' | 'reviewer' | 'editor' | 'council'>('author')
  const [loading, setLoading] = useState(true)
  const [editorialTab, setEditorialTab] = useState<'articles' | 'candidates' | 'users' | 'mailing'>('articles')
  const [showSpamNotice, setShowSpamNotice] = useState(true)

  // Chamada de Pareceristas Modal
  const [showPareceristasModal, setShowPareceristasModal] = useState(false)

  // Auth States
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [institution, setInstitution] = useState('')
  const [phone, setPhone] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Dados
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [allProfiles, setAllProfiles] = useState<any[]>([])
  const [allReviews, setAllReviews] = useState<any[]>([])
  const [selectedArticleDetails, setSelectedArticleDetails] = useState<any>(null)

  // Filtros
  const [editorSearch, setEditorSearch] = useState('')
  const [editorStatusFilter, setEditorStatusFilter] = useState('todos')
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('todos')

  // Edição de Usuário
  const [editingUserModal, setEditingUserModal] = useState<any>(null)
  const [editUserName, setEditUserName] = useState('')
  const [editUserInst, setEditUserInst] = useState('')
  const [editUserPhone, setEditUserPhone] = useState('')
  const [editUserLattes, setEditUserLattes] = useState('')
  const [editUserOrcid, setEditUserOrcid] = useState('')
  const [editUserRole, setEditUserRole] = useState('')
  const [savingUserEdit, setSavingUserEdit] = useState(false)

  // Central de Mailing
  const [mailingTarget, setMailingTarget] = useState<'all' | 'author' | 'reviewer' | 'council'>('all')
  const [mailingSubject, setMailingSubject] = useState('')
  const [mailingTitle, setMailingTitle] = useState('')
  const [mailingBody, setMailingBody] = useState('')
  const [mailingActionText, setMailingActionText] = useState('Acessar a Revista')
  const [mailingActionUrl, setMailingActionUrl] = useState('https://www.asppsicanalise.com.br/revista')
  const [sendingMailing, setSendingMailing] = useState(false)
  const [copiedMailingEmails, setCopiedMailingEmails] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Verificador Público
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyCodeInput, setVerifyCodeInput] = useState('')
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [checkingCode, setCheckingCode] = useState(false)

  // Meu Perfil Completo
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileInst, setProfileInst] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileLattes, setProfileLattes] = useState('')
  const [profileOrcid, setProfileOrcid] = useState('')
  const [profileDegree, setProfileDegree] = useState('Especialista')
  const [profilePsicanalise, setProfilePsicanalise] = useState('Psicanalista com atuação clínica')
  const [profileBio, setProfileBio] = useState('')
  const [profileKeywords, setProfileKeywords] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Submissão do Autor
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [newSection, setNewSection] = useState('Artigos Científicos')
  const [newTitle, setNewTitle] = useState('')
  const [newTitleEn, setNewTitleEn] = useState('')
  const [bookReference, setBookReference] = useState('')
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
  const [termClinicalPledge, setTermClinicalPledge] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Reenvio
  const [reSubmitArticle, setReSubmitArticle] = useState<any>(null)
  const [revisedFile, setRevisedFile] = useState<File | null>(null)
  const [submittingRevision, setSubmittingRevision] = useState(false)

  // Parecerista
  const [assignModalArticle, setAssignModalArticle] = useState<any>(null)
  const [selectedReviewerId, setSelectedReviewerId] = useState('')
  const [assignDeadline, setAssignDeadline] = useState('')

  // Solicitar Correções ao Autor
  const [requestChangesModalArticle, setRequestChangesModalArticle] = useState<any>(null)
  const [changesReasonText, setChangesReasonText] = useState('')
  const [savingChanges, setSavingChanges] = useState(false)

  // Solicitar Correções ao Parecerista
  const [requestReviewerChangesModal, setRequestReviewerChangesModal] = useState<any>(null)
  const [reviewerChangesText, setReviewerChangesText] = useState('')
  const [savingReviewerChanges, setSavingReviewerChanges] = useState(false)

  // Recusa
  const [rejectionModalArticle, setRejectionModalArticle] = useState<any>(null)
  const [rejectionReasonText, setRejectionReasonText] = useState('')
  const [savingRejection, setSavingRejection] = useState(false)

  // Parecer Técnico
  const [reviewModalData, setReviewModalData] = useState<any>(null)
  const [critTitle, setCritTitle] = useState('satisfatorio')
  const [critTheory, setCritTheory] = useState('consistente')
  const [critClinical, setCritClinical] = useState('alta')
  const [recommendation, setRecommendation] = useState('aceitar')
  const [commentsAuthor, setCommentsAuthor] = useState('')
  const [commentsEditor, setCommentsEditor] = useState('')
  const [reviewFile, setReviewFile] = useState<File | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)

  // Documento Timbrado
  const [activeOfficialDoc, setActiveOfficialDoc] = useState<any>(null)
  const [showReviewerThankModal, setShowReviewerThankModal] = useState(false)
  const [copiedThanks, setCopiedThanks] = useState(false)

  useEffect(() => {
    // Se abrir pelo link direto com ?pareceristas=true ou #pareceristas
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('pareceristas') === 'true' || window.location.hash === '#pareceristas') {
        setShowPareceristasModal(true)
      }
    }

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
          const isEd = data.role === 'editor' || data.role === 'editor_adjunto'
          if (data.reviewer_status === 'pending') {
            setViewMode('author')
          } else {
            setViewMode(
              isEd ? 'editor' : 
              data.role === 'council' ? 'council' : 
              data.role === 'reviewer' ? 'reviewer' : 'author'
            )
          }
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
          reviewer_status: 'approved',
          council_votes: []
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

      const { data: articles } = await supabase
        .from('articles')
        .select('*, author:author_id(id, full_name, email, institution)')
        .order('created_at', { ascending: false })
      if (articles) setAllArticles(articles)

      const { data: reviews } = await supabase.from('reviews').select('*')
      if (reviews) setAllReviews(reviews)
    } catch (e) {
      console.error(e)
    }
  }

  const getAuthorName = (authorId: string, art?: any) => {
    if (art?.author?.full_name) return art.author.full_name
    const p = allProfiles.find((x) => x.id === authorId)
    if (p?.full_name) return p.full_name
    if (authorId === session?.user?.id && profile?.full_name) return profile.full_name
    return 'Autor do Manuscrito'
  }

  const getAuthorEmail = (authorId: string, art?: any) => {
    if (art?.author?.email) return art.author.email
    const p = allProfiles.find((x) => x.id === authorId)
    if (p?.email) return p.email
    if (authorId === session?.user?.id && profile?.email) return profile.email
    return ''
  }

  const getAuthorInst = (authorId: string, art?: any) => {
    if (art?.author?.institution) return art.author.institution
    const p = allProfiles.find((x) => x.id === authorId)
    return p?.institution || '-'
  }

  const getArticleReviews = (articleId: string) => allReviews.filter((r) => r.article_id === articleId)
  const getReviewerName = (reviewerId: string) => allProfiles.find((x) => x.id === reviewerId)?.full_name || 'Parecerista Designado'

  const getArticleIssue = (art: any) => {
    if (art?.target_issue) return art.target_issue
    const d = new Date(art?.created_at || Date.now())
    return (d.getMonth() + 1) <= 5 ? `Fascículo de Junho de ${d.getFullYear()}` : `Fascículo de Dezembro de ${d.getFullYear()}`
  }

  const getDeadlineBadge = (deadlineStr: string | null) => {
    if (!deadlineStr) return null
    const diffDays = Math.ceil((new Date(deadlineStr + 'T23:59:59').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
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

  // Validador com Anonimato Blindado
  const handleVerifyCode = async () => {
    const code = verifyCodeInput.trim().toUpperCase()
    if (!code) return
    setCheckingCode(true)
    setVerifyResult(null)

    try {
      const parts = code.split('-')
      const prefix = (parts.length >= 3 ? parts[2] : code.replace(/^ASP-(ACE|REC|PAR)-/i, '')).trim().toUpperCase()
      const cleanCode = prefix.replace(/[^A-Z0-9]/g, '')

      if (code.includes('ASP-ACE')) {
        let found = allArticles.find((a) => (a.id || '').toUpperCase().replace(/[^A-Z0-9]/g, '').startsWith(cleanCode))
        if (found) {
          setVerifyResult({
            valid: true,
            type: 'Declaração Oficial de Aceite para Publicação',
            title: found.title,
            person: getAuthorName(found.author_id, found),
            date: new Date(found.updated_at || found.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
            role: 'Autor(a) do Manuscrito',
          })
          setCheckingCode(false)
          return
        }
      }

      if (code.includes('ASP-REC')) {
        let found = allArticles.find((a) => (a.id || '').toUpperCase().replace(/[^A-Z0-9]/g, '').startsWith(cleanCode))
        if (found) {
          setVerifyResult({
            valid: true,
            type: 'Comunicação Editorial de Não Aceite',
            title: found.title,
            person: getAuthorName(found.author_id, found),
            date: new Date(found.updated_at || found.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
            role: 'Autor(a) do Manuscrito',
          })
          setCheckingCode(false)
          return
        }
      }

      if (code.includes('ASP-PAR')) {
        let foundRev = allReviews.find((r) => (r.id || '').toUpperCase().replace(/[^A-Z0-9]/g, '').startsWith(cleanCode))
        if (foundRev) {
          const revPerson = allProfiles.find((p) => p.id === foundRev.reviewer_id)
          setVerifyResult({
            valid: true,
            type: 'Declaração de Atuação como Parecerista Ad-hoc',
            title: null, // Proteção total do anonimato duplo-cego!
            person: revPerson?.full_name || 'Parecerista Registrado',
            date: new Date(foundRev.updated_at || foundRev.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
            role: 'Parecerista Ad-hoc (Avaliação Duplo-Cega por Pares)',
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

  // Votação Colegiada
  const handleCastCouncilVote = async (candidate: any, voteType: 'favoravel' | 'desfavoravel') => {
    try {
      const existingVotes = candidate.council_votes || []
      const filteredVotes = existingVotes.filter((v: any) => v.user_id !== session?.user?.id)

      const newVote = {
        user_id: session?.user?.id,
        user_name: profile?.full_name || 'Membro do Conselho',
        user_role: profile?.role,
        vote: voteType,
        created_at: new Date().toISOString()
      }

      const updatedVotes = [...filteredVotes, newVote]
      const { error } = await supabase.from('profiles').update({ council_votes: updatedVotes }).eq('id', candidate.id)
      if (error) throw error

      alert('Seu voto foi registrado com sucesso!')
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    }
  }

  // Homologação Final pelo Editor
  const handleApproveReviewer = async (candidate: any) => {
    if (!window.confirm(`Homologar "${candidate.full_name}" como Parecerista Ad-hoc Oficial?`)) return

    try {
      const { error } = await supabase.from('profiles').update({
        role: 'reviewer',
        reviewer_status: 'approved'
      }).eq('id', candidate.id)

      if (error) throw error

      await sendEmailNotification({
        to: candidate.email,
        subject: 'Homologação Aprovada - Banco de Pareceristas (Revista Saber Psicanalítico)',
        title: 'Bem-vindo(a) ao Corpo de Pareceristas Ad-hoc',
        message: `Prezado(a) ${candidate.full_name},\n\nTemos a satisfação de comunicar que sua inscrição para integrar o Banco de Pareceristas Ad-hoc da Revista Saber Psicanalítico (ISSN 3086-8416) foi HOMOLOGADA com parecer favorável do Conselho Editorial.\n\nSeu cadastro encontra-se plenamente ativo em nosso sistema.\n\n--- INFORMAÇÕES GERAIS DE FUNCIONAMENTO ---\n1. Convites de Avaliação: Conforme a afinidade temática dos manuscritos recebidos, você receberá um e-mail com o resumo da obra e o prazo sugerido (geralmente 21 dias).\n2. Aceite e Recusa: Ao acessar o portal, você poderá aceitar ou recusar formalmente o convite. O arquivo completo do texto só fica disponível para download após você clicar em Aceitar.\n3. Avaliação Duplo-Cega: Os textos são anonimizados. Seu parecer circunstanciado e eventuais arquivos com comentários deverão manter rigoroso anonimato.\n4. Certificação Oficial: A cada parecer finalizado, o sistema emite automaticamente a Declaração Oficial Timbrada com código digital de verificação para comprovação no Lattes e em bancas acadêmicas.\n\nAgradecemos sua valorosa contribuição para o fortalecimento da transmissão e do rigor científico na Psicanálise.`,
        actionText: 'Acessar Área do Parecerista',
        actionUrl: 'https://revista-saber-portal.vercel.app'
      })

      alert(`Parecerista "${candidate.full_name}" homologado com sucesso!`)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    }
  }

  // Abrir Modal Meu Perfil Completo
  const handleOpenProfileModal = () => {
    setProfileName(profile?.full_name || '')
    setProfileInst(profile?.institution || '')
    setProfilePhone(profile?.phone || '')
    setProfileLattes(profile?.lattes_url || '')
    setProfileOrcid(profile?.orcid || '')
    setProfileDegree(profile?.academic_degree || 'Especialista')
    setProfilePsicanalise(profile?.psicanalise_profile || 'Psicanalista com atuação clínica')
    setProfileBio(profile?.mini_bio || '')
    setProfileKeywords(profile?.keywords || '')
    setShowProfileModal(true)
  }

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
        academic_degree: profileDegree,
        psicanalise_profile: profilePsicanalise,
        mini_bio: profileBio,
        keywords: profileKeywords,
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

  const sendEmailNotification = async (payload: any) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      console.warn('Falha silenciosa de e-mail:', e)
    }
  }

  const handleAddCoauthor = () => setCoauthors([...coauthors, { name: '', email: '', institution: '', lattes: '', orcid: '', bio: '' }])
  const handleUpdateCoauthor = (index: number, field: string, value: string) => {
    const updated = [...coauthors]
    updated[index][field] = value
    setCoauthors(updated)
  }
  const handleRemoveCoauthor = (index: number) => setCoauthors(coauthors.filter((_, i) => i !== index))

  const handleOpenEditUserModal = (targetUser: any) => {
    setEditingUserModal(targetUser)
    setEditUserName(targetUser.full_name || '')
    setEditUserInst(targetUser.institution || '')
    setEditUserPhone(targetUser.phone || '')
    setEditUserLattes(targetUser.lattes_url || '')
    setEditUserOrcid(targetUser.orcid || '')
    setEditUserRole(targetUser.role || 'author')
  }

  const handleSaveUserByEditor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUserModal) return
    setSavingUserEdit(true)
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: editUserName,
        institution: editUserInst,
        phone: editUserPhone,
        lattes_url: editUserLattes,
        orcid: editUserOrcid,
        role: editUserRole,
      }).eq('id', editingUserModal.id)
      if (error) throw error
      alert(`Cadastro atualizado!`)
      setEditingUserModal(null)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSavingUserEdit(false)
    }
  }

  const handleDeleteUser = async (userToDelete: any) => {
    if (userToDelete.id === session?.user?.id) return alert('Você não pode excluir seu próprio perfil!')
    if (!window.confirm(`Excluir cadastro de "${userToDelete.full_name}"?`)) return
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userToDelete.id)
      if (error) throw error
      alert('Cadastro excluído!')
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
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
      alert('Link oficial enviado para o seu e-mail!')
      setShowForgotModal(false)
      setForgotEmail('')
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setForgotLoading(false)
    }
  }

  const handleExportBackup = () => {
    if (allArticles.length === 0) return alert('Sem dados.')
    const headers = ['ID', 'Titulo', 'Secao', 'Status', 'Data', 'Autor', 'Email', 'Pareceres']
    const rows = allArticles.map((art) => [
      art.id, `"${art.title.replace(/"/g, '""')}"`, `"${art.section}"`, `"${art.status}"`,
      `"${new Date(art.created_at).toLocaleDateString('pt-BR')}"`, `"${getAuthorName(art.author_id, art)}"`,
      `"${getAuthorEmail(art.author_id, art)}"`, getArticleReviews(art.id).length
    ])
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Backup_Revista_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !session) return
    if (!termOriginal || !termEthics || !termAnonymous || !termCC || !termAI) {
      return alert('Confirme as declarações éticas obrigatórias.')
    }
    if (newSection === 'Relatos de Experiência Clínica' && !termClinicalPledge) {
      return alert('Confirme o compromisso de sigilo e descaracterização do paciente.')
    }

    setSubmitting(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const filePath = `artigos/artigo_${session.user.id}_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('manuscritos').upload(filePath, selectedFile)
      if (uploadError) throw uploadError

      const finalTitleEn = newSection === 'Resenhas' ? (newTitleEn.trim() || 'Book Review') : newTitleEn
      const finalAbstract = newSection === 'Resenhas' ? `[OBRA RESENHADA]:\n${bookReference}` : newAbstract
      const finalAbstractEn = newSection === 'Resenhas' ? 'Book Review (Abstract not applicable)' : newAbstractEn
      const finalKeywords = newSection === 'Resenhas' ? 'Resenha Crítica; Psicanálise' : newKeywords
      const finalKeywordsEn = newSection === 'Resenhas' ? 'Book Review; Psychoanalysis' : newKeywordsEn

      const { error: insertError } = await supabase.from('articles').insert({
        author_id: session.user.id,
        section: newSection,
        title: newTitle,
        title_en: finalTitleEn,
        abstract: finalAbstract,
        abstract_en: finalAbstractEn,
        keywords: finalKeywords,
        keywords_en: finalKeywordsEn,
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
        title: 'Manuscrito Recebido com Sucesso',
        message: `Prezado(a) ${profile?.full_name},\n\nConfirmamos o recebimento do trabalho "${newTitle}". Você pode acompanhar o andamento pelo portal.`,
        actionText: 'Acompanhar no Portal',
        actionUrl: 'https://revista-saber-portal.vercel.app',
      })

      alert('Artigo submetido com sucesso!')
      setShowSubmitModal(false)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
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
      const filePath = `artigos/revisao_${reSubmitArticle.id}_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('manuscritos').upload(filePath, revisedFile)
      if (uploadError) throw uploadError

      const { error: updateError } = await supabase.from('articles').update({
        file_url: filePath,
        status: 'revisao_submetida',
      }).eq('id', reSubmitArticle.id)
      if (updateError) throw updateError

      alert('Versão corrigida enviada com sucesso!')
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
        const clean = articleTitle.replace(/[^a-zA-Z0-9À-ÿ]/g, '_').slice(0, 45)
        link.download = `${fileType}_${clean}.${filePath.split('.').pop() || 'docx'}`
        link.click()
      }
    } catch (err: any) {
      alert('Erro ao baixar o arquivo.')
    }
  }

  const handleUpdateStatus = async (articleId: string, status: string) => {
    if (status === 'recusado') {
      setRejectionModalArticle(allArticles.find((a) => a.id === articleId))
      setRejectionReasonText('')
      return
    }
    if (status === 'correcoes_pendentes') {
      setRequestChangesModalArticle(allArticles.find((a) => a.id === articleId))
      setChangesReasonText('')
      return
    }

    try {
      const { error } = await supabase.from('articles').update({ status }).eq('id', articleId)
      if (error) throw error
      alert('Status atualizado!')
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    }
  }

  const handleConfirmRequestChanges = async () => {
    if (!requestChangesModalArticle || !changesReasonText.trim()) return alert('Informe as orientações.')
    setSavingChanges(true)
    try {
      const { error } = await supabase.from('articles').update({
        status: 'correcoes_pendentes',
        rejection_reason: changesReasonText
      }).eq('id', requestChangesModalArticle.id)
      if (error) throw error
      alert('Correções solicitadas ao autor!')
      setRequestChangesModalArticle(null)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSavingChanges(false)
    }
  }

  // Solicitar Ajustes no Parecer do Parecerista
  const handleConfirmReviewerChanges = async () => {
    if (!requestReviewerChangesModal || !reviewerChangesText.trim()) return alert('Informe a orientação para o parecerista.')
    setSavingReviewerChanges(true)
    try {
      const { error } = await supabase.from('reviews').update({
        status: 'ajustes_solicitados',
        comments_for_author: `${requestReviewerChangesModal.comments_for_author || ''}\n\n[SOLICITAÇÃO DE AJUSTE DA COMISSÃO EDITORIAL]:\n${reviewerChangesText}`
      }).eq('id', requestReviewerChangesModal.id)
      if (error) throw error

      const revProfile = allProfiles.find(p => p.id === requestReviewerChangesModal.reviewer_id)
      if (revProfile?.email) {
        sendEmailNotification({
          to: revProfile.email,
          subject: 'Ajuste Solicitado no Parecer - Revista Saber Psicanalítico',
          title: 'Solicitação de Ajuste no Parecer Emitido',
          message: `Prezado(a) ${revProfile.full_name},\n\nA Comissão Editorial apreciou seu parecer e solicita o seguinte ajuste:\n\n${reviewerChangesText}\n\nPor favor, acesse seu painel para atualizar o parecer e reenviar.`,
          actionText: 'Acessar Painel do Parecerista',
          actionUrl: 'https://revista-saber-portal.vercel.app'
        })
      }

      alert('Ajustes solicitados ao parecerista com sucesso!')
      setRequestReviewerChangesModal(null)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSavingReviewerChanges(false)
    }
  }

  const handleConfirmRejection = async () => {
    if (!rejectionModalArticle || !rejectionReasonText.trim()) return alert('Informe a justificativa.')
    setSavingRejection(true)
    try {
      const { error } = await supabase.from('articles').update({ status: 'recusado', rejection_reason: rejectionReasonText }).eq('id', rejectionModalArticle.id)
      if (error) throw error
      alert('Manuscrito Recusado!')
      setRejectionModalArticle(null)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSavingRejection(false)
    }
  }

  const handleAssignReviewer = async () => {
    if (!selectedReviewerId || !assignModalArticle || !assignDeadline) return alert('Selecione o parecerista e o prazo.')
    try {
      const revProfile = allProfiles.find((p) => p.id === selectedReviewerId)
      const { error } = await supabase.from('reviews').insert({
        article_id: assignModalArticle.id,
        reviewer_id: selectedReviewerId,
        deadline: assignDeadline,
        status: 'convite_pendente',
      })
      if (error) throw error
      await supabase.from('articles').update({ status: 'em_avaliacao' }).eq('id', assignModalArticle.id)

      if (revProfile?.email) {
        sendEmailNotification({
          to: revProfile.email,
          subject: 'Convite para Avaliação por Pares - Revista Saber Psicanalítico',
          title: 'Novo Convite de Avaliação',
          message: `Prezado(a) ${revProfile.full_name},\n\nConvidamos você a avaliar o manuscrito "${assignModalArticle.title}". Acesse o portal para consultar o resumo e aceitar ou recusar o convite.`,
          actionText: 'Responder Convite no Portal',
          actionUrl: 'https://revista-saber-portal.vercel.app'
        })
      }
      alert('Convite enviado com sucesso!')
      setAssignModalArticle(null)
      fetchAllData()
    } catch (err: any) {
      alert(`Erro ao atribuir parecerista: ${err.message}`)
    }
  }

  const handleRemoveReviewerAssignment = async (reviewId: string, articleId: string) => {
    if (!window.confirm('Desatribuir este parecerista?')) return
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
      if (error) throw error
      alert('Parecerista desatribuído!')
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    }
  }

  const handleAcceptReviewInvitation = async (reviewId: string, articleTitle: string) => {
    try {
      const { error } = await supabase.from('reviews').update({ status: 'em_andamento' }).eq('id', reviewId)
      if (error) throw error
      alert('Convite aceito! O manuscrito foi liberado para download e avaliação.')
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    }
  }

  const handleDeclineReviewInvitation = async (reviewId: string, articleTitle: string) => {
    if (!window.confirm('Confirma a recusa deste convite? O trabalho deixará de aparecer em seu painel.')) return
    try {
      const { error } = await supabase.from('reviews').update({ status: 'recusado' }).eq('id', reviewId)
      if (error) throw error
      alert('Recusa registrada.')
      fetchAllData()
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewModalData) return
    setSubmittingReview(true)
    try {
      const targetArt = allArticles.find((a) => a.id === reviewModalData.article_id)
      const sec = targetArt?.section || 'Artigos Científicos'

      let rPath = reviewModalData.review_file_url || null
      if (reviewFile) {
        rPath = `pareceres/parecer_${reviewModalData.id}_${Date.now()}.${reviewFile.name.split('.').pop()}`
        await supabase.storage.from('manuscritos').upload(rPath, reviewFile)
      }

      const fullComments = `--- CRITÉRIOS DE AVALIAÇÃO (${sec.toUpperCase()}) ---\n• Título/Resumo: ${critTitle}\n• Rigor Conceitual: ${critTheory}\n• Relevância: ${critClinical}\n\n--- PARECER CIRCUNSTANCIADO ---\n${commentsAuthor}`

      await supabase.from('reviews').update({
        recommendation,
        comments_for_author: fullComments,
        confidential_comments_editor: commentsEditor,
        review_file_url: rPath,
        status: 'concluido',
      }).eq('id', reviewModalData.id)

      alert('Parecer enviado à Comissão Editorial!')
      setReviewModalData(null)
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const filteredMailingUsers = allProfiles.filter((p) => {
    if (mailingTarget === 'all') return true
    return p.role === mailingTarget
  })

  const handleSendMailing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mailingSubject || !mailingBody) return alert('Preencha os campos.')
    if (!window.confirm(`Disparar para ${filteredMailingUsers.length} usuários?`)) return
    setSendingMailing(true)
    try {
      for (const u of filteredMailingUsers) {
        if (u.email) {
          await sendEmailNotification({
            to: u.email,
            subject: mailingSubject,
            title: mailingTitle || mailingSubject,
            message: `Olá, ${u.full_name || 'Colega'},\n\n${mailingBody}`,
            actionText: mailingActionText || undefined,
            actionUrl: mailingActionUrl || undefined
          })
        }
      }
      alert('Comunicado disparado com sucesso!')
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setSendingMailing(false)
    }
  }

  const completedReviewers = allProfiles.filter((p) => Array.from(new Set(allReviews.filter((r) => r.status === 'concluido').map((r) => r.reviewer_id))).includes(p.id))

  const filteredArticles = allArticles.filter((art) => {
    const q = editorSearch.toLowerCase()
    return (art.title.toLowerCase().includes(q) || getAuthorName(art.author_id, art).toLowerCase().includes(q)) && (editorStatusFilter === 'todos' || art.status === editorStatusFilter)
  })

  const filteredUsersList = allProfiles.filter((p) => {
    const q = userSearch.toLowerCase()
    return ((p.full_name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q)) && (userRoleFilter === 'todos' || p.role === userRoleFilter)
  })

  const isEditorChefe = profile?.role === 'editor'
  const isEditorAdjunto = profile?.role === 'editor_adjunto'
  const isFullEditor = isEditorChefe || isEditorAdjunto
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
            </div>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button type="button" onClick={() => { setIsLogin(true); setAuthMessage(null); }} className={`flex-1 py-2 text-sm font-medium rounded-md ${isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Entrar</button>
            <button type="button" onClick={() => { setIsLogin(false); setAuthMessage(null); }} className={`flex-1 py-2 text-sm font-medium rounded-md ${!isLogin ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Cadastrar como Autor</button>
          </div>

          {authMessage && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${authMessage.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'}`}>
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
                const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, role: 'author', institution, phone } } })
                if (error) throw error
                setAuthMessage({ type: 'success', text: 'Conta criada com sucesso! Faça login com seu e-mail e senha.' })
                setIsLogin(true)
              }
            } catch (err: any) {
              let msg = err.message || 'Erro ao processar.'
              if (msg.includes('Invalid login credentials')) {
                msg = 'E-mail ou senha incorretos. Por favor, confira os dados digitados e tente novamente.'
              } else if (msg.includes('Email not confirmed')) {
                msg = 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.'
              } else if (msg.includes('User already registered')) {
                msg = 'Este e-mail já está cadastrado no sistema. Faça login ou recupere sua senha.'
              }
              setAuthMessage({ type: 'error', text: msg })
            } finally {
              setAuthLoading(false)
            }
          }} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Fulano de Tal" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Instituição / Universidade *</label>
                  <input type="text" required value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Universidade / Associação" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail *</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Senha *</label>
              <div className="relative">
                <input 
                  type={showLoginPassword ? 'text' : 'password'} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full px-3 py-2 pr-9 text-sm border border-slate-200 rounded-lg" 
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isLogin && (
                <div className="text-right mt-1.5">
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-[11px] text-indigo-600 hover:underline">
                    Esqueci minha senha
                  </button>
                </div>
              )}
            </div>

            <button type="submit" disabled={authLoading} className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm">
              {authLoading ? 'Processando...' : isLogin ? 'Acessar o Portal' : 'Cadastrar como Autor'}
            </button>
          </form>

          {/* CARD DE DESTAQUE: ABRE A CHAMADA DIRETO NA TELA (SEM 404!) */}
          <div className="mt-6 p-4 bg-gradient-to-br from-amber-50/90 via-white to-indigo-50/70 rounded-2xl border border-amber-200 shadow-sm text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider border border-amber-300">
              <Sparkles className="w-3 h-3 text-amber-600" /> Chamada Pública Aberta
            </div>
            <h3 className="text-xs font-bold text-slate-800">
              Banco de Pareceristas Ad-Hoc
            </h3>
            <p className="text-[11px] text-slate-600 leading-relaxed max-w-xs mx-auto">
              Pesquisadores(as) e psicanalistas: integrem nosso corpo de avaliadores por pares com certificação oficial para o Lattes.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowPareceristasModal(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg text-xs font-bold shadow transition-all hover:scale-[1.02]"
              >
                <UserCheck className="w-3.5 h-3.5" /> Inscrever-se como Parecerista
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center space-y-4">
            <button type="button" onClick={() => { setShowVerifyModal(true); setVerifyResult(null); setVerifyCodeInput(''); }} className="text-xs text-indigo-700 hover:underline flex items-center gap-1.5 font-semibold">
              <Search className="w-3.5 h-3.5" /> Verificar Autenticidade de Documento
            </button>
            <div className="flex flex-col items-center text-center space-y-1">
              <img src="/logo-asp.png" alt="ASP" className="h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <p className="text-[10px] text-slate-400 whitespace-nowrap">Associação Saber Psicanalítico (ASP) • CNPJ: 44.966.907/0001-85</p>
            </div>
          </div>
        </div>

        {/* MODAL INTEGRADO DE PARECERISTAS (ZERO 404) */}
        <PareceristasModal show={showPareceristasModal} onClose={() => setShowPareceristasModal(false)} />

        {/* MODAL DE VALIDAÇÃO DIGITAL */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-start border-b pb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Validar Autenticidade de Documento</h3>
                  <p className="text-[11px] text-slate-500">Consulta oficial de autenticidade documental da Revista Saber Psicanalítico</p>
                </div>
                <button onClick={() => setShowVerifyModal(false)}><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-2">
                <input type="text" value={verifyCodeInput} onChange={(e) => setVerifyCodeInput(e.target.value)} placeholder="Ex: ASP-ACE-1A2B3C4D ou ASP-PAR-1A2B3C4D" className="w-full px-3 py-2 text-xs border rounded-lg font-mono uppercase text-center tracking-wider font-bold" />
                <button type="button" disabled={checkingCode || !verifyCodeInput.trim()} onClick={handleVerifyCode} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold">
                  {checkingCode ? 'Consultando Registro...' : 'Verificar Autenticidade'}
                </button>
              </div>

              {verifyResult && (
                verifyResult.valid ? (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-slate-800 space-y-3 text-xs shadow-sm">
                    <div className="flex items-center gap-2 border-b border-emerald-200 pb-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-emerald-900 text-sm">Documento Oficial Autêntico</h4>
                        <p className="text-[10px] text-emerald-700">Verificação eletrônica confirmada nos registros da Revista Saber Psicanalítico</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <p><strong>Tipo:</strong> {verifyResult.type}</p>
                      <p><strong>Titular:</strong> {verifyResult.person}</p>
                      {verifyResult.title && <p><strong>Trabalho:</strong> “{verifyResult.title}”</p>}
                      <p><strong>Data:</strong> {verifyResult.date}</p>
                      <p><strong>Emissor:</strong> Revista Saber Psicanalítico (ISSN 3086-8416)</p>
                      <p><strong>Responsável:</strong> Dr. Edson Leandro de Almeida (Editor-Chefe)</p>
                    </div>
                    <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-[10px] text-emerald-800 font-mono">
                      <span>Código: <strong>{verifyCodeInput.toUpperCase()}</strong></span>
                      <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-semibold">Status: Válido</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-rose-800 font-bold"><AlertCircle className="w-4 h-4 text-rose-600" /><span>Documento Não Localizado</span></div>
                    <p className="text-[11px] text-rose-700">O código informado não corresponde a nenhum documento oficial emitido pela Revista Saber Psicanalítico.</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border space-y-4">
              <h3 className="text-base font-bold text-slate-900 text-center">Recuperar Senha</h3>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seu E-mail *</label>
                  <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="seu.email@exemplo.com" className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
                <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowForgotModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancelar</button><button type="submit" disabled={forgotLoading} className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg">Enviar Link</button></div>
              </form>
            </div>
          </div>
        )}
      </main>
    )
  }

  // PONTO (F): Se o parecerista recusar, o trabalho some da tela dele!
  const myAuthorArticles = allArticles.filter((art) => art.author_id === session?.user?.id)
  const myReviewAssignments = allReviews
    .filter((r) => r.reviewer_id === session?.user?.id)
    .filter((r) => r.status !== 'recusado')

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        {/* BANNER OFICIAL ANTI-SPAM */}
        {showSpamNotice && (
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-amber-50 border-b border-indigo-100 py-2.5 px-4 no-print">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span><strong>Aviso Editorial:</strong> Para garantir o recebimento dos avisos editoriais, marque nossas mensagens como <em>"Não é spam"</em> ou adicione <strong>revistasaberpsicanalitico@gmail.com</strong> aos seus contatos.</span>
              </div>
              <button type="button" onClick={() => setShowSpamNotice(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

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
                  <button type="button" onClick={() => setViewMode('reviewer')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'reviewer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Visão Parecerista</button>
                  <button type="button" onClick={() => setViewMode('author')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'author' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Visão Autor</button>
                </div>
              )}

              {profile?.role === 'reviewer' && (
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                  <button type="button" onClick={() => setViewMode('reviewer')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'reviewer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Avaliações</button>
                  <button type="button" onClick={() => setViewMode('author')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'author' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Meus Trabalhos</button>
                </div>
              )}

              <span className="text-xs text-slate-700 font-medium">
                Olá, <strong>{profile?.full_name || 'Usuário'}</strong> <span className="text-indigo-600 font-semibold">({formatRole(profile?.role)})</span>
              </span>
              <button type="button" onClick={handleOpenProfileModal} className="px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 border rounded-lg font-medium flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5 text-indigo-600" /><span>Meu Perfil</span></button>
              <button type="button" onClick={() => supabase.auth.signOut()} className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium flex items-center gap-1"><LogOut className="w-3.5 h-3.5" />Sair</button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
          {/* VISÃO DO AUTOR */}
          {viewMode === 'author' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Meus Trabalhos Submetidos</h2>
                  <p className="text-sm text-slate-500">Acompanhe em tempo real o status, cartas e revisões.</p>
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
                    const isReleasedToAuthor = ['correcoes_pendentes', 'aceito', 'recusado'].includes(art.status)
                    const revs = isReleasedToAuthor ? getArticleReviews(art.id).filter((r) => r.status === 'concluido') : []
                    const canResubmit = ['correcoes_pendentes', 'ajustes_iniciais', 'revisao_submetida'].includes(art.status)

                    return (
                      <div key={art.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{art.section || 'Artigos Científicos'}</span>
                            <span className="ml-2 text-xs font-semibold text-indigo-700">{art.status.toUpperCase()}</span>
                            <h3 className="text-lg font-bold text-slate-800">{art.title}</h3>
                            <p className="text-sm text-slate-600 line-clamp-3">{art.abstract}</p>
                          </div>
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            {art.status === 'aceito' && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'aceite', article: art })} className="px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-1.5"><Award className="w-4 h-4" /> Carta de Aceite (PDF)</button>}
                            {art.status === 'recusado' && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'recusa', article: art })} className="px-3 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg flex items-center justify-center gap-1.5"><Ban className="w-4 h-4" /> Carta Não Aceite (PDF)</button>}
                            <button type="button" onClick={() => handleDownloadFile(art.file_url, art.title, 'Manuscrito')} className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5"><Download className="w-3.5 h-3.5" /> Baixar Manuscrito</button>
                            {canResubmit && <button type="button" onClick={() => { setReSubmitArticle(art); setRevisedFile(null); }} className="px-3 py-2 text-xs font-semibold bg-amber-600 text-white rounded-lg flex items-center justify-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Enviar Arquivo Corrigido</button>}
                          </div>
                        </div>

                        {art.status === 'correcoes_pendentes' && art.rejection_reason && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1.5">
                            <p className="font-bold text-amber-900 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" /> Orientações da Comissão Editorial para as Correções:</p>
                            <p className="whitespace-pre-line text-slate-700 leading-relaxed">{art.rejection_reason}</p>
                          </div>
                        )}

                        {art.status === 'recusado' && art.rejection_reason && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900"><strong>Considerações do Editor:</strong> {art.rejection_reason}</div>
                        )}

                        {revs.length > 0 && (
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-xs">
                            <h5 className="font-bold text-slate-700">Pareceres dos Avaliadores Liberados pela Editoria:</h5>
                            {revs.map((rev, idx) => (
                              <div key={rev.id} className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                                <span className="font-bold text-indigo-700">Parecer {idx + 1} ({rev.recommendation?.toUpperCase()}):</span>
                                <p className="whitespace-pre-line text-slate-600 leading-relaxed">{rev.comments_for_author}</p>
                                {rev.review_file_url && (
                                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                                    <span className="text-[11px] text-slate-500 font-medium">O parecerista incluiu um arquivo com apontamentos:</span>
                                    <button type="button" onClick={() => handleDownloadFile(rev.review_file_url, art.title, `Manuscrito_Anotado_Parecerista_${idx + 1}`)} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5">
                                      <Download className="w-3.5 h-3.5" /> Baixar Manuscrito Anotado
                                    </button>
                                  </div>
                                )}
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
                <p className="text-sm text-slate-500">Avaliação Duplo-Cega (*Blind Peer Review*) considerando as diretrizes de cada categoria de manuscrito.</p>
              </div>

              {myReviewAssignments.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">Nenhum manuscrito atribuído no momento.</div>
              ) : (
                <div className="grid gap-4">
                  {myReviewAssignments.map((rev) => {
                    const art = allArticles.find((a) => a.id === rev.article_id)
                    const isCompleted = rev.status === 'concluido'
                    const isPendingInvitation = rev.status === 'convite_pendente'
                    const isNeedsAdjustment = rev.status === 'ajustes_solicitados'
                    const sec = art?.section || 'Artigos Científicos'
                    const isReviewSec = sec === 'Resenhas'
                    const isClinicalSec = sec === 'Relatos de Experiência Clínica'
                    const isEssaySec = sec === 'Ensaios Teóricos'

                    return (
                      <div key={rev.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                                isReviewSec ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                isClinicalSec ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                isEssaySec ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>{sec}</span>

                              {isCompleted && <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">PARECER CONCLUÍDO</span>}
                              {isPendingInvitation && <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">CONVITE RECEBIDO</span>}
                              {isNeedsAdjustment && <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">AJUSTE SOLICITADO PELA COMISSÃO</span>}
                              {!isCompleted && !isPendingInvitation && !isNeedsAdjustment && <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">EM ELABORAÇÃO</span>}
                              {getDeadlineBadge(rev.deadline)}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mt-1">{art?.title}</h3>
                          </div>

                          <div className="flex gap-2">
                            {isCompleted && (
                              <button type="button" onClick={() => setActiveOfficialDoc({ type: 'lattes', review: rev, article: art, reviewer: profile })} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm">
                                <Award className="w-3.5 h-3.5" /> Declaração de Parecerista
                              </button>
                            )}

                            {/* PONTO (E): Só libera o arquivo se tiver aceito o convite! */}
                            {art && !isPendingInvitation && (
                              <button type="button" onClick={() => handleDownloadFile(art.file_url, art.title, 'Manuscrito_Parecer')} className="px-3 py-1.5 text-xs font-medium border rounded-lg text-slate-700 flex items-center gap-1.5 hover:bg-slate-50">
                                <Download className="w-3.5 h-3.5" /> Baixar Manuscrito
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Aviso de Ajustes Solicitados pela Editoria */}
                        {isNeedsAdjustment && (
                          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-900 text-xs space-y-1">
                            <p className="font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-rose-600" /> A Comissão Editorial solicitou ajustes no seu parecer:</p>
                            <p className="whitespace-pre-line text-[11px] leading-relaxed">{rev.comments_for_author}</p>
                          </div>
                        )}

                        <div className="p-2.5 rounded-lg border text-[11px] leading-relaxed flex items-center gap-2 bg-slate-50 text-slate-700">
                          <Info className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span>
                            {isReviewSec && 'Categoria Resenha (1.000 a 1.500 palavras): Avalie a leitura crítica da obra. Dispensado de resumo bilíngue e palavras-chave.'}
                            {isClinicalSec && 'Categoria Relato Clínico (2.000 a 5.000 palavras): Foco na articulação clínica. Verifique o rigoroso sigilo analítico e a descaracterização do paciente.'}
                            {isEssaySec && 'Categoria Ensaio Teórico (1.500 a 6.000 palavras): Foco no encadeamento conceitual e metapsicologia. Não exigir metodologia empírica.'}
                            {!isReviewSec && !isClinicalSec && !isEssaySec && 'Categoria Artigo Científico (2.000 a 8.000 palavras): Foco na pesquisa original, consistência metodológica e discussão teórica.'}
                          </span>
                        </div>

                        {art && (
                          <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg leading-relaxed space-y-1">
                            <p className="font-semibold text-slate-800">{isReviewSec ? 'Referência da Obra:' : 'Resumo do Trabalho:'}</p>
                            <p className="whitespace-pre-line">{art.abstract}</p>
                            {art.keywords && <p className="pt-1 text-slate-500 font-medium"><strong>Palavras-chave:</strong> {art.keywords}</p>}
                          </div>
                        )}

                        {isPendingInvitation && (
                          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                            <div>
                              <p className="font-bold text-amber-900 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" /> Deseja avaliar este manuscrito?</p>
                              <p className="text-[11px] text-amber-800">Prazo para envio do parecer: <strong>{new Date(rev.deadline + 'T12:00:00').toLocaleDateString('pt-BR')}</strong>. O manuscrito para download será liberado imediatamente após o aceite.</p>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button type="button" onClick={() => handleAcceptReviewInvitation(rev.id, art?.title || 'Artigo')} className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm">
                                <ThumbsUp className="w-3.5 h-3.5" /> Aceitar Avaliação
                              </button>
                              <button type="button" onClick={() => handleDeclineReviewInvitation(rev.id, art?.title || 'Artigo')} className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5">
                                <ThumbsDown className="w-3.5 h-3.5" /> Recusar Convite
                              </button>
                            </div>
                          </div>
                        )}

                        {!isPendingInvitation && (
                          <div className="flex justify-end pt-2 border-t">
                            <button type="button" onClick={() => { setReviewModalData(rev); setRecommendation(rev.recommendation || 'aceitar'); setCommentsAuthor(rev.comments_for_author || ''); setCommentsEditor(rev.confidential_comments_editor || ''); setReviewFile(null); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm">
                              {isCompleted ? 'Editar Parecer Emitido' : isNeedsAdjustment ? 'Regularizar e Reenviar Parecer' : 'Preencher Parecer Técnico'}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* SALA EDITORIAL / CONSELHO EDITORIAL */}
          {canAccessEditorialRoom && (viewMode === 'editor' || viewMode === 'council') && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">{isFullEditor ? `Sala Editorial (${formatRole(profile?.role)})` : 'Conselho Editorial (Deliberação Colegiada)'}</span>
                  <h2 className="text-xl font-bold text-slate-800">{isFullEditor ? 'Gestão Editorial de Artigos' : 'Acompanhamento e Votações do Conselho'}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isFullEditor && <button type="button" onClick={handleExportBackup} className="px-3 py-2 bg-emerald-50 text-emerald-800 font-semibold rounded-lg text-xs flex items-center gap-1 border border-emerald-200"><FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Exportar Backup</button>}
                  <button type="button" onClick={() => setShowReviewerThankModal(true)} className="px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1 border border-slate-200"><Award className="w-3.5 h-3.5" /> Quadro de Pareceristas</button>
                  <button type="button" onClick={() => setShowSubmitModal(true)} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-xs flex items-center gap-1.5"><Upload className="w-4 h-4" /> + Submeter Artigo</button>
                </div>
              </div>

              {/* BARRA DE ABAS EDITORIAL */}
              <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-sm overflow-x-auto">
                <button type="button" onClick={() => setEditorialTab('articles')} className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap ${editorialTab === 'articles' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  <FileText className="w-4 h-4" /> Submissões e Artigos ({allArticles.length})
                </button>
                
                {/* ABA DE CANDIDATURAS DE PARECERISTAS */}
                <button type="button" onClick={() => setEditorialTab('candidates')} className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap ${editorialTab === 'candidates' ? 'border-amber-500 text-amber-700 bg-amber-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Candidaturas Pareceristas</span>
                  {allProfiles.filter(p => p.reviewer_status === 'pending').length > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black animate-pulse">
                      {allProfiles.filter(p => p.reviewer_status === 'pending').length}
                    </span>
                  )}
                </button>

                {isFullEditor && (
                  <>
                    <button type="button" onClick={() => setEditorialTab('users')} className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap ${editorialTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                      <Users className="w-4 h-4" /> Quadro de Usuários ({allProfiles.length})
                    </button>
                    <button type="button" onClick={() => setEditorialTab('mailing')} className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap ${editorialTab === 'mailing' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                      <Megaphone className="w-4 h-4" /> Central de Comunicados (Mailing)
                    </button>
                  </>
                )}
              </div>

              {/* ABA 1: ARTIGOS */}
              {editorialTab === 'articles' && (
                <div className="space-y-6">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <input type="text" value={editorSearch} onChange={(e) => setEditorSearch(e.target.value)} placeholder="Pesquise por título, autor ou seção..." className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    <div className="flex gap-1.5 overflow-x-auto text-xs">
                      {['todos', 'submetido', 'ajustes_iniciais', 'em_avaliacao', 'correcoes_pendentes', 'revisao_submetida', 'aceito', 'recusado'].map((status) => (
                        <button key={status} type="button" onClick={() => setEditorStatusFilter(status)} className={`px-3 py-1.5 rounded-lg font-medium capitalize text-xs ${editorStatusFilter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{status.replace('_', ' ')}</button>
                      ))}
                    </div>
                  </div>

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
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">{art.section || 'Artigos Científicos'}</span>
                              <span className="ml-2 text-xs font-semibold text-indigo-700">{art.status.toUpperCase()}</span>
                              {isOwnArticle && <span className="ml-2 text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">[Seu Manuscrito - COPE]</span>}
                              <h4 className="text-lg font-bold text-slate-900 mt-1">{art.title}</h4>
                              <p className="text-xs text-slate-500">
                                Autor: <strong>{getAuthorName(art.author_id, art)}</strong>
                                {getAuthorEmail(art.author_id, art) ? ` (${getAuthorEmail(art.author_id, art)})` : ''}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button type="button" onClick={() => setSelectedArticleDetails(art)} className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1 shadow-sm">
                                <Eye className="w-3.5 h-3.5 text-indigo-600" /> Ver Detalhes
                              </button>
                              {isAccepted && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'aceite', article: art })} className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">Carta de Aceite</button>}
                              {isRejected && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'recusa', article: art })} className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">Carta Não Aceite</button>}
                              <button type="button" onClick={() => handleDownloadFile(art.file_url, art.title, hasRevision ? 'Manuscrito_Revisado' : 'Manuscrito')} className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-700">Baixar</button>
                              {hasRevision && <button type="button" onClick={() => handleDownloadFile(art.original_file_url, art.title, 'Versao_Original')} className="px-2.5 py-1.5 text-xs border border-slate-200 bg-slate-50 rounded-lg text-slate-600">Original</button>}

                              {isFullEditor && !isOwnArticle && (
                                <>
                                  <button type="button" onClick={() => { setAssignModalArticle(art); setSelectedReviewerId(''); setAssignDeadline(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); }} className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 flex items-center gap-1">
                                    <UserCheck className="w-3.5 h-3.5" /> Atribuir Parecerista
                                  </button>

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
                              <span className="font-semibold text-emerald-950">Fascículo:</span>
                              <input type="text" defaultValue={art.target_issue || getArticleIssue(art)} onBlur={(e) => supabase.from('articles').update({ target_issue: e.target.value }).eq('id', art.id).then(() => fetchAllData())} className="px-2.5 py-1 text-xs border border-emerald-200 rounded bg-white flex-1" />
                            </div>
                          )}

                          {!isOwnArticle && revs.length > 0 && (
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                              <p className="font-bold text-slate-700">Pareceristas Designados:</p>
                              {revs.map((r) => {
                                const isCompleted = r.status === 'concluido'
                                const isPending = r.status === 'convite_pendente'
                                const isDeclined = r.status === 'recusado'
                                const isAcceptedAndWorking = r.status === 'em_andamento' || r.status === 'pendente'
                                const isNeedsAdj = r.status === 'ajustes_solicitados'

                                return (
                                  <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2.5 rounded border border-slate-200 gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-slate-800">{getReviewerName(r.reviewer_id)}</span>
                                      {isPending && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> CONVITE PENDENTE</span>}
                                      {isAcceptedAndWorking && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> CONVITE ACEITO</span>}
                                      {isDeclined && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> CONVITE RECUSADO</span>}
                                      {isNeedsAdj && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">AJUSTES SOLICITADOS</span>}
                                      {isCompleted && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><Check className="w-3 h-3" /> PARECER CONCLUÍDO</span>}
                                      {!isCompleted && !isDeclined && getDeadlineBadge(r.deadline)}
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                      {isCompleted && isFullEditor && (
                                        <>
                                          <button type="button" onClick={() => setActiveOfficialDoc({ type: 'lattes', review: r, article: art, reviewer: allProfiles.find(p => p.id === r.reviewer_id) })} className="text-emerald-700 hover:underline font-semibold text-[11px]">
                                            Declaração
                                          </button>
                                          {/* PONTO (B): Solicitar Ajustes ao Parecerista */}
                                          <button type="button" onClick={() => { setRequestReviewerChangesModal(r); setReviewerChangesText(''); }} className="text-amber-700 hover:underline font-semibold text-[11px]">
                                            Solicitar Ajustes
                                          </button>
                                        </>
                                      )}
                                      {isCompleted && r.review_file_url && <button type="button" onClick={() => handleDownloadFile(r.review_file_url, art.title, 'Manuscrito_Anotado_Parecerista')} className="text-amber-700 hover:underline text-[11px]">Baixar Anexo</button>}
                                      {isCompleted && <button type="button" onClick={() => alert(`PARECER CIRCUNSTANCIADO:\n\n${r.comments_for_author}`)} className="text-indigo-600 hover:underline text-[11px]">Ler Parecer</button>}
                                      {isFullEditor && (
                                        <button type="button" onClick={() => handleRemoveReviewerAssignment(r.id, art.id)} className="px-2 py-0.5 text-[11px] text-rose-600 hover:bg-rose-50 border border-rose-200 rounded font-medium inline-flex items-center gap-1">
                                          <Trash2 className="w-3 h-3 text-rose-500" /> Remover
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ABA 2: CANDIDATURAS DE PARECERISTAS (DELIBERAÇÃO COLEGIADA) */}
              {editorialTab === 'candidates' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                          Deliberação Colegiada
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          Candidaturas ao Banco de Pareceristas
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        O Conselho Editorial e a Editoria analisam as fichas e registram seus votos; a homologação final é realizada pela Editoria.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border">
                      Aguardando deliberação: {allProfiles.filter(p => p.reviewer_status === 'pending').length}
                    </span>
                  </div>

                  {allProfiles.filter(p => p.reviewer_status === 'pending').length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                      Não há nenhuma candidatura de parecerista aguardando deliberação no momento.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {allProfiles.filter(p => p.reviewer_status === 'pending').map((cand) => {
                        const votes: any[] = cand.council_votes || []
                        const userVote = votes.find((v: any) => v.user_id === session?.user?.id)
                        const favorCount = votes.filter((v: any) => v.vote === 'favoravel').length
                        const againstCount = votes.filter((v: any) => v.vote === 'desfavoravel').length

                        return (
                          <div key={cand.id} className="p-5 rounded-xl border border-amber-200 bg-amber-50/20 space-y-4 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-amber-200/60 pb-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    {cand.academic_degree || 'Titulação'}
                                  </span>
                                  <span className="text-xs font-bold text-slate-900">{cand.full_name}</span>
                                  <span className="text-xs text-slate-500">({cand.institution || 'ASP'})</span>
                                </div>
                                <p className="text-xs text-indigo-700 font-medium mt-0.5">
                                  Perfil: {cand.psicanalise_profile || 'Psicanalista'} • {cand.email} • Tel: {cand.phone || '-'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                {cand.lattes_url && (
                                  <a
                                    href={cand.lattes_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-indigo-700 rounded-lg flex items-center gap-1 shadow-sm"
                                  >
                                    Lattes <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                                {cand.orcid && (
                                  <span className="text-[11px] text-slate-600 bg-white px-2 py-1 border rounded-lg">
                                    ORCID: {cand.orcid}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Ficha Completa */}
                            <div className="grid sm:grid-cols-2 gap-3 text-xs">
                              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-1">
                                <span className="font-bold text-slate-800">Mini-biografia e Formação:</span>
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[11px]">
                                  {cand.mini_bio || 'Não informado.'}
                                </p>
                              </div>

                              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                                <div>
                                  <span className="font-bold text-slate-800">Eixos Temáticos de Atuação:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(cand.thematic_axes || []).map((ax: string) => (
                                      <span key={ax} className="px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded text-[10px] font-medium">
                                        {ax}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-800">Autores e Palavras-chave:</span>
                                  <p className="text-[11px] text-slate-600">
                                    <strong>Escolas:</strong> {(cand.theoretical_schools || []).join(', ') || '-'}<br />
                                    <strong>Palavras:</strong> {cand.keywords || '-'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Placar de Votação do Conselho */}
                            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800">Votos Colegiados:</span>
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                                    {favorCount} Aprovados
                                  </span>
                                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold">
                                    {againstCount} Recusas
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-2">
                                  {votes.length === 0 ? (
                                    <span>Nenhum membro do conselho votou ainda.</span>
                                  ) : (
                                    votes.map((v: any, i: number) => (
                                      <span key={i} className="inline-flex items-center gap-1 font-medium">
                                        • {v.user_name} ({v.vote === 'favoravel' ? '👍 A favor' : '👎 Contra'})
                                      </span>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Ações de Voto e Homologação */}
                              <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                                {!userVote ? (
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleCastCouncilVote(cand, 'favoravel')}
                                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm"
                                    >
                                      👍 Meu Voto: Aprovado
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCastCouncilVote(cand, 'desfavoravel')}
                                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-lg flex items-center gap-1"
                                    >
                                      👎 Recusar
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                                    Você votou: {userVote.vote === 'favoravel' ? 'Favorável' : 'Desfavorável'}
                                  </span>
                                )}

                                {isFullEditor && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveReviewer(cand)}
                                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Homologar e Ativar Parecerista
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ABA 3: QUADRO DE USUÁRIOS */}
              {isFullEditor && editorialTab === 'users' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Quadro Geral de Usuários ({allProfiles.length})</h3>
                      <p className="text-xs text-slate-500">Gerencie permissões e cadastros dos membros registrados.</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">{allProfiles.filter(p => p.role === 'author').length} Autores</span>
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">{allProfiles.filter(p => p.role === 'reviewer').length} Pareceristas</span>
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">{allProfiles.filter(p => p.role === 'council').length} Conselho</span>
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{allProfiles.filter(p => p.role === 'editor_adjunto').length} Ed.-Adjunto</span>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800">{allProfiles.filter(p => p.role === 'editor').length} Ed.-Chefe</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="flex-1 relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou filiação..." className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex gap-1 overflow-x-auto text-xs">
                      {['todos', 'author', 'reviewer', 'council', 'editor_adjunto', 'editor'].map((r) => (
                        <button key={r} type="button" onClick={() => setUserRoleFilter(r)} className={`px-3 py-1.5 rounded-lg font-medium capitalize text-xs ${userRoleFilter === r ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          {r === 'todos' ? 'Todos' : formatRole(r)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[550px] overflow-y-auto border border-slate-100 rounded-lg">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 uppercase font-semibold sticky top-0 z-10 border-b">
                        <tr>
                          <th className="p-3">Nome Completo</th>
                          <th className="p-3">E-mail</th>
                          <th className="p-3">Filiação</th>
                          <th className="p-3">Função no Sistema</th>
                          <th className="p-3 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsersList.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition">
                            <td className="p-3 font-semibold text-slate-900">{p.full_name}</td>
                            <td className="p-3">{p.email}</td>
                            <td className="p-3 text-slate-500">{p.institution || '-'}</td>
                            <td className="p-3 font-bold text-indigo-700">{formatRole(p.role)}</td>
                            <td className="p-3 text-right flex items-center justify-end gap-1.5">
                              <button type="button" onClick={() => handleOpenEditUserModal(p)} className="px-2.5 py-1 text-xs border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg font-medium inline-flex items-center gap-1">
                                <Edit3 className="w-3 h-3 text-indigo-600" /> Editar
                              </button>
                              {p.id !== session?.user?.id && (
                                <button type="button" onClick={() => handleDeleteUser(p)} className="p-1 text-rose-500 hover:bg-rose-50 rounded" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ABA 4: MAILING */}
              {isFullEditor && editorialTab === 'mailing' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-base font-bold text-slate-800">Central de Disparos Editoriais (Mailing)</h3>
                    <p className="text-xs text-slate-500">Envie chamadas de publicação, comunicados da ASP e avisos de lançamento com texto formatado, imagens e links personalizáveis.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Selecionar Destinatários:</label>
                      <select value={mailingTarget} onChange={(e: any) => setMailingTarget(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-medium">
                        <option value="all">Todos os Cadastrados ({allProfiles.length})</option>
                        <option value="author">Apenas Autores ({allProfiles.filter(p => p.role === 'author').length})</option>
                        <option value="reviewer">Apenas Pareceristas ({allProfiles.filter(p => p.role === 'reviewer').length})</option>
                        <option value="council">Apenas Conselho Editorial ({allProfiles.filter(p => p.role === 'council').length})</option>
                      </select>
                    </div>

                    <div className="flex flex-col justify-end">
                      <span className="text-[11px] text-slate-500 mb-1">Deseja enviar direto pelo Gmail institucional?</span>
                      <button type="button" onClick={() => {
                        const emails = filteredMailingUsers.map((u) => u.email).filter(Boolean).join(', ')
                        navigator.clipboard.writeText(emails)
                        setCopiedMailingEmails(true)
                        setTimeout(() => setCopiedMailingEmails(false), 3000)
                      }} className="px-3 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg flex items-center justify-center gap-1.5 shadow-sm text-slate-700">
                        {copiedMailingEmails ? <><Check className="w-3.5 h-3.5 text-emerald-600" /> Lista Copiada!</> : <><Copy className="w-3.5 h-3.5 text-indigo-600" /> Copiar E-mails Selecionados (Cco)</>}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSendMailing} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Assunto do E-mail *</label>
                        <input type="text" required value={mailingSubject} onChange={(e) => setMailingSubject(e.target.value)} placeholder="Assunto do comunicado" className="w-full px-3 py-2 text-xs border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Título de Destaque no Topo</label>
                        <input type="text" value={mailingTitle} onChange={(e) => setMailingTitle(e.target.value)} placeholder="Título principal interno" className="w-full px-3 py-2 text-xs border rounded-lg" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mensagem Oficial *</label>
                      <textarea ref={textareaRef} required rows={7} value={mailingBody} onChange={(e) => setMailingBody(e.target.value)} placeholder="Escreva a mensagem oficial..." className="w-full px-3 py-2 text-xs border rounded-lg font-sans leading-relaxed" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Texto do Botão no E-mail (Opcional):</label>
                        <input type="text" value={mailingActionText} onChange={(e) => setMailingActionText(e.target.value)} placeholder="Ex: Acessar a Revista" className="w-full px-3 py-2 text-xs border rounded-lg bg-white" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Link de Destino do Botão (URL):</label>
                        <input type="url" value={mailingActionUrl} onChange={(e) => setMailingActionUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 text-xs border rounded-lg bg-white" />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t">
                      <button type="submit" disabled={sendingMailing || filteredMailingUsers.length === 0} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2 shadow-sm transition">
                        {sendingMailing ? 'Disparando E-mails...' : <><Send className="w-3.5 h-3.5" /> Disparar para {filteredMailingUsers.length} Destinatários</>}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* RODAPÉ OFICIAL */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img src="/logo-asp.png" alt="ASP" className="h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <p className="font-bold text-slate-800">Associação Saber Psicanalítico (ASP)</p>
              <p className="text-[11px] whitespace-nowrap">Entidade Mantenedora • CNPJ: 44.966.907/0001-85</p>
            </div>
          </div>
          <div className="text-center md:text-right text-[11px]">
            <p>
              <a href="https://maps.google.com/?q=Rua+Visconde+Inhauma+1361" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600 font-medium text-slate-700">
                Rua Visconde Inhaúma, 1361
              </a>, sala 408 — Caruaru/PE
            </p>
            <p><span>www.asppsicanalise.com.br</span> • <span>revistasaberpsicanalitico@gmail.com</span></p>
          </div>
        </div>
      </footer>

      {/* MODAL: MEU PERFIL COMPLETO (PONTO C) */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[95] overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border space-y-4 max-h-[92vh] overflow-y-auto my-6">
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Meu Perfil Cadastral</h3>
                <p className="text-xs text-slate-500">Mantenha sua titulação, áreas temáticas e percurso atualizados.</p>
              </div>
              <button type="button" onClick={() => setShowProfileModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nome Completo *</label>
                  <input type="text" required value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Instituição / Filiação *</label>
                  <input type="text" required value={profileInst} onChange={(e) => setProfileInst(e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded-lg" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Titulação Máxima *</label>
                  <select value={profileDegree} onChange={(e) => setProfileDegree(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white">
                    <option value="Graduação">Graduação</option>
                    <option value="Especialização">Especialização</option>
                    <option value="Mestrado">Mestrado</option>
                    <option value="Doutorado">Doutorado</option>
                    <option value="Pós-Doutorado">Pós-Doutorado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Telefone / WhatsApp</label>
                  <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="w-full px-3 py-1.5 text-xs border rounded-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">ORCID</label>
                  <input type="text" value={profileOrcid} onChange={(e) => setProfileOrcid(e.target.value)} placeholder="0000-..." className="w-full px-3 py-1.5 text-xs border rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Link do Currículo Lattes</label>
                <input type="url" value={profileLattes} onChange={(e) => setProfileLattes(e.target.value)} placeholder="http://lattes.cnpq.br/..." className="w-full px-3 py-1.5 text-xs border rounded-lg" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Mini-biografia e Formação em Psicanálise</label>
                <textarea rows={3} value={profileBio} onChange={(e) => setProfileBio(e.target.value)} placeholder="Apresente sua trajetória de estudos, escolas ou clínica..." className="w-full px-3 py-1.5 text-xs border rounded-lg" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Palavras-chave de Especialidade</label>
                <input type="text" value={profileKeywords} onChange={(e) => setProfileKeywords(e.target.value)} placeholder="Ex: clínica psicanalítica, psicose, melancolia" className="w-full px-3 py-1.5 text-xs border rounded-lg" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowProfileModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancelar</button>
                <button type="submit" disabled={savingProfile} className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg">
                  {savingProfile ? 'Salvando...' : 'Salvar Perfil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SOLICITAR AJUSTES AO PARECERISTA (PONTO B) */}
      {requestReviewerChangesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[85]">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4">
            <div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">Comissão Editorial</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Solicitar Ajustes ao Parecerista</h3>
              <p className="text-xs text-slate-500">
                Parecerista: <strong>{getReviewerName(requestReviewerChangesModal.reviewer_id)}</strong>
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Descreva o que o parecerista deve corrigir ou anonimizar *:</label>
              <textarea 
                required 
                rows={5} 
                value={reviewerChangesText} 
                onChange={(e) => setReviewerChangesText(e.target.value)} 
                placeholder="Ex: Identificamos que o arquivo anexado contém seu nome nos comentários do Word. Por favor, remova os dados de autoria e anexe novamente..." 
                className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-amber-500" 
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setRequestReviewerChangesModal(null)} className="px-3 py-1.5 text-xs text-slate-600">Cancelar</button>
              <button 
                type="button" 
                disabled={savingReviewerChanges || !reviewerChangesText.trim()} 
                onClick={handleConfirmReviewerChanges} 
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50"
              >
                {savingReviewerChanges ? 'Enviando...' : 'Enviar Solicitação de Ajuste'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SOLICITAR CORREÇÕES AO AUTOR */}
      {requestChangesModalArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[75]">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4">
            <div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">Decisão Editorial</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Solicitar Correções ao Autor</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{requestChangesModalArticle.title}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Orientações da Comissão Editorial *:</label>
              <textarea required rows={6} value={changesReasonText} onChange={(e) => setChangesReasonText(e.target.value)} placeholder="Descreva as correções que o autor deve realizar no texto..." className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setRequestChangesModalArticle(null)} className="px-3 py-1.5 text-xs text-slate-600">Cancelar</button>
              <button type="button" disabled={savingChanges || !changesReasonText.trim()} onClick={handleConfirmRequestChanges} className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50">
                {savingChanges ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ATRIBUIR PARECERISTA */}
      {assignModalArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4">
            <h3 className="text-base font-bold text-slate-900">Designar Parecerista</h3>
            <p className="text-xs text-slate-500">Selecione o parecerista cadastrado e determine o prazo para devolução do parecer.</p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parecerista Homologado *</label>
              <select value={selectedReviewerId} onChange={(e) => setSelectedReviewerId(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg bg-white">
                <option value="">-- Escolha um parecerista --</option>
                {allProfiles.filter((p) => (p.role === 'reviewer' || p.role === 'editor' || p.role === 'editor_adjunto' || p.role === 'council') && p.id !== assignModalArticle.author_id).map((rev) => (
                  <option key={rev.id} value={rev.id}>{rev.full_name} ({formatRole(rev.role)}) - {rev.institution || 'ASP'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prazo Limite para Parecer *</label>
              <input type="date" required value={assignDeadline} onChange={(e) => setAssignDeadline(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg bg-white" />
            </div>
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setAssignModalArticle(null)} className="px-3 py-1.5 text-xs text-slate-600">Cancelar</button><button type="button" disabled={!selectedReviewerId || !assignDeadline} onClick={handleAssignReviewer} className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg">Confirmar Atribuição</button></div>
          </div>
        </div>
      )}

      {/* MODAL RECUSA COM JUSTIFICATIVA */}
      {rejectionModalArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4">
            <h3 className="text-base font-bold text-slate-900">Justificativa da Não Aceitação</h3>
            <p className="text-xs text-slate-500">Insira a fundamentação editorial que constará na comunicação ao autor.</p>
            <textarea required rows={5} value={rejectionReasonText} onChange={(e) => setRejectionReasonText(e.target.value)} placeholder="Fundamentos para a recusa..." className="w-full px-3 py-2 text-xs border rounded-lg" />
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setRejectionModalArticle(null)} className="px-3 py-1.5 text-xs text-slate-600">Cancelar</button><button type="button" disabled={savingRejection || !rejectionReasonText.trim()} onClick={handleConfirmRejection} className="px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg">{savingRejection ? 'Gravando...' : 'Confirmar Recusa'}</button></div>
          </div>
        </div>
      )}

      {/* MODAL COMPLETO DE PARECER (DINÂMICO) */}
      {reviewModalData && (() => {
        const currentArt = allArticles.find((a) => a.id === reviewModalData.article_id)
        const currentSec = currentArt?.section || 'Artigos Científicos'
        const isCurrentReview = currentSec === 'Resenhas'
        const isCurrentClinical = currentSec === 'Relatos de Experiência Clínica'

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border space-y-5 max-h-[92vh] overflow-y-auto">
              <div className="border-b pb-3 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Formulário de Avaliação</span>
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border">{currentSec}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Parecer Editorial por Pares</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{currentArt?.title}</p>
                </div>
                <button type="button" onClick={() => setReviewModalData(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-800">Critérios de Avaliação Específicos:</h4>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">{isCurrentReview ? 'Título e Referência:' : 'Título e Resumo:'}</label>
                    <select value={critTitle} onChange={(e) => setCritTitle(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-medium">
                      <option value="satisfatorio">Satisfatório</option>
                      <option value="necessita_ajustes">Necessita Ajustes</option>
                      <option value="insatisfatorio">Insatisfatório</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">{isCurrentReview ? 'Profundidade Crítica:' : 'Rigor Conceitual:'}</label>
                    <select value={critTheory} onChange={(e) => setCritTheory(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-medium">
                      <option value="consistente">Consistente</option>
                      <option value="regular">Regular</option>
                      <option value="fragil">Frágil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">{isCurrentClinical ? 'Técnica e Clínica:' : 'Relevância Psicanalítica:'}</label>
                    <select value={critClinical} onChange={(e) => setCritClinical(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-medium">
                      <option value="alta">Alta</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recomendação Editorial Conclusiva *</label>
                <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-semibold">
                  <option value="aceitar">Aceitar sem restrições</option>
                  <option value="correcoes_obrigatorias">Aceitar com correções (obrigatórias)</option>
                  <option value="rejeitar">Recusar manuscrito</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parecer Circunstanciado (Enviado ao autor) *</label>
                <textarea required rows={5} value={commentsAuthor} onChange={(e) => setCommentsAuthor(e.target.value)} placeholder="Apresente suas análises e fundamentos..." className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Comentários Confidenciais à Editoria (Opcional)</label>
                <textarea rows={2} value={commentsEditor} onChange={(e) => setCommentsEditor(e.target.value)} placeholder="Observações sigilosas à editoria..." className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50" />
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <label className="block text-xs font-bold text-slate-800">Anexar Manuscrito com Apontamentos (.docx ou .doc - opcional):</label>
                <input type="file" accept=".docx,.doc" onChange={(e) => setReviewFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 border border-slate-200 rounded-lg p-1 bg-white" />
                <p className="text-[11px] text-amber-800 font-medium">Lembrete: Certifique-se de que o autor do comentário no Word esteja anônimo ("Parecerista").</p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setReviewModalData(null)} className="px-4 py-2 text-xs text-slate-600">Voltar</button>
                <button type="submit" disabled={submittingReview || !commentsAuthor} onClick={handleSubmitReview} className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 shadow-sm">
                  {submittingReview ? 'Enviando...' : 'Concluir e Enviar Parecer'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL: EDIÇÃO DE USUÁRIO */}
      {editingUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[85]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4">
            <div className="flex justify-between items-start border-b pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">Editar Cadastro de Usuário</h3>
                <p className="text-xs text-slate-500">{editingUserModal.email}</p>
              </div>
              <button type="button" onClick={() => setEditingUserModal(null)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveUserByEditor} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Nome Completo *</label>
                <input type="text" required value={editUserName} onChange={(e) => setEditUserName(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Função no Sistema *</label>
                <select value={editUserRole} onChange={(e) => setEditUserRole(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-medium">
                  <option value="author">Autor</option>
                  <option value="reviewer">Parecerista</option>
                  <option value="council">Conselho Editorial</option>
                  <option value="editor_adjunto">Editor-Adjunto</option>
                  <option value="editor">Editor-Chefe</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Filiação Institucional</label>
                <input type="text" value={editUserInst} onChange={(e) => setEditUserInst(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Link Lattes</label>
                  <input type="url" value={editUserLattes} onChange={(e) => setEditUserLattes(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border rounded-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">ORCID</label>
                  <input type="text" value={editUserOrcid} onChange={(e) => setEditUserOrcid(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Telefone / WhatsApp</label>
                <input type="tel" value={editUserPhone} onChange={(e) => setEditUserPhone(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setEditingUserModal(null)} className="px-3 py-1.5 text-xs text-slate-600">Cancelar</button>
                <button type="submit" disabled={savingUserEdit} className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                  {savingUserEdit ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AGRADECIMENTO PARECERISTAS */}
      {showReviewerThankModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Quadro de Pareceristas que Concluíram Avaliações</h3>
            <p className="text-xs text-slate-500">Relação de pareceristas atuantes para compor a folha de expediente do fascículo.</p>
            <div className="bg-slate-50 p-4 rounded-xl border max-h-72 overflow-y-auto space-y-2.5 text-xs">
              {completedReviewers.map((rev) => (
                <div key={rev.id} className="bg-white p-3 rounded-lg border space-y-1">
                  <p className="font-bold text-slate-900">{rev.full_name} ({rev.institution || 'ASP'})</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    {rev.orcid && <span>ORCID: <strong>{rev.orcid}</strong></span>}
                    {rev.lattes_url && <a href={rev.lattes_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Lattes</a>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setShowReviewerThankModal(false)} className="px-4 py-2 text-xs text-slate-600">Fechar</button>
              <button type="button" onClick={() => {
                const text = completedReviewers.map((r) => `• ${r.full_name} (${r.institution || 'ASP'})`).join('\n')
                navigator.clipboard.writeText(text)
                setCopiedThanks(true)
                setTimeout(() => setCopiedThanks(false), 2500)
              }} className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5">
                {copiedThanks ? <><Check className="w-3.5 h-3.5" /> Relação Copiada!</> : <><Copy className="w-3.5 h-3.5" /> Copiar Dados para Expediente</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1, 2 e 3 */}
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
        bookReference={bookReference}
        setBookReference={setBookReference}
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
        termClinicalPledge={termClinicalPledge}
        setTermClinicalPledge={setTermClinicalPledge}
        submitting={submitting}
      />

      <ResubmitModal
        article={reSubmitArticle}
        onClose={() => setReSubmitArticle(null)}
        onSubmit={handleResubmitArticle}
        onFileChange={(e: any) => setRevisedFile(e.target.files?.[0] || null)}
        submitting={submittingRevision}
      />

      <ArticleDetailsModal
        article={selectedArticleDetails}
        onClose={() => setSelectedArticleDetails(null)}
        getAuthorName={getAuthorName}
        getAuthorEmail={getAuthorEmail}
        getAuthorInst={getAuthorInst}
        onDownloadFile={handleDownloadFile}
      />

      <OfficialDocModal
        data={activeOfficialDoc}
        onClose={() => setActiveOfficialDoc(null)}
        getAuthorName={getAuthorName}
        getArticleIssue={getArticleIssue}
      />
    </div>
  )
}
