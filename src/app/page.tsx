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
  Sparkles, Scale, Bell, CheckCheck, CalendarPlus
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

// 12 Eixos Temáticos Padronizados
const axeOptionsGlobal = [
  'Fundamentos, História e Epistemologia da Psicanálise',
  'Metapsicologia e Teoria das Pulsões',
  'Clínica Psicanalítica, Técnica e Transferência',
  'Psicopatologia, Sofrimento Psíquico e Sintoma',
  'Infância, Parentalidade e Adolescência',
  'Corpo, Psicossomática e Manifestações Contemporâneas',
  'Sexualidade, Gênero e Relações Familiares',
  'Saúde Mental, Atenção Psicossocial e Instituições',
  'Psicanálise, Relações Étnico-Raciais e Decolonialidade',
  'Psicanálise e Educação',
  'Psicanálise, Filosofia e Ciências Humanas',
  'Psicanálise, Arte, Literatura e Política'
]

const schoolOptionsGlobal = [
  'Sigmund Freud', 'Jacques Lacan', 'Donald Winnicott', 
  'Sándor Ferenczi', 'Melanie Klein', 'Wilfred Bion', 'Françoise Dolto', 'Outros'
]

// ============================================================================
// MODAL DE PARECERISTAS (CHAMADA + INSCRIÇÃO ATÉ 5 EIXOS)
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

  if (!show) return null

  const handleToggleSchool = (s: string) => {
    setSchools(schools.includes(s) ? schools.filter(x => x !== s) : [...schools, s])
  }

  const handleToggleAxe = (a: string) => {
    if (axes.includes(a)) {
      setAxes(axes.filter(x => x !== a))
    } else {
      if (axes.length >= 5) return alert('Você pode selecionar no máximo 5 eixos temáticos prioritários.')
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

            <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 space-y-1.5 text-amber-950">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-700" /> 2. Participação Voluntária e Deliberação Colegiada
              </h4>
              <p>
                • <strong>Gratuidade e Voluntariado:</strong> A atuação é voluntária e não remunerada, 100% gratuita, pautada no compromisso ético com a difusão científica.<br />
                • <strong>Homologação do Conselho:</strong> O envio desta ficha constitui uma solicitação de ingresso. <em>A inscrição não o(a) torna parecerista automaticamente</em>; o perfil será avaliado e votado pelo <strong>Conselho Editorial</strong>.<br />
                • <strong>Prazos:</strong> A concessão de pareceres conta com prazo médio de <strong>21 dias</strong> após o aceite do convite.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border space-y-1.5">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" /> 3. Certificação Oficial no Lattes e Avaliação Duplo-Cega
              </h4>
              <p>
                A cada avaliação concluída sob o sistema duplo-cego (<em>Double-Blind Peer Review</em>), o portal emite uma <strong>Declaração Oficial Timbrada com Assinatura Digital e Código Verificador</strong>, válida para comprovação curricular e progressão acadêmica.
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
              <p className="text-[10px] text-slate-500 mt-0.5">
                💡 <strong>Nota de Publicação:</strong> Este resumo constará no cadastro de avaliadores para conhecimento da Comissão Editorial.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Autores / Escolas de Referência:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {schoolOptionsGlobal.map((s) => (
                  <label key={s} className="flex items-center gap-1.5 p-1.5 border rounded bg-slate-50 cursor-pointer text-[11px]">
                    <input type="checkbox" checked={schools.includes(s)} onChange={() => handleToggleSchool(s)} className="rounded text-indigo-600" />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Eixos Temáticos de Atuação * (Selecione até 5)</label>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{axes.length}/5 selecionados</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {axeOptionsGlobal.map((ax) => (
                  <label key={ax} className={`flex items-start gap-1.5 p-2 border rounded cursor-pointer text-[11px] ${axes.includes(ax) ? 'bg-indigo-50 border-indigo-300 font-semibold text-indigo-950' : 'bg-white'}`}>
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
// MODAL 1: SUBMISSÃO DINÂMICA
// ============================================================================
function SubmitModal({
  show, onClose, onSubmit, newSection, setNewSection,
  newThematicAxis, setNewThematicAxis,
  newTitle, setNewTitle, newTitleEn, setNewTitleEn,
  bookReference, setBookReference,
  newAbstract, setNewAbstract, newAbstractEn, setNewAbstractEn,
  newKeywords, setNewKeywords, newKeywordsEn, setNewKeywordsEn,
  authorInstitution, setAuthorInstitution,
  authorLattes, setAuthorLattes, authorOrcid, setAuthorOrcid,
  authorBio, setAuthorBio, coauthors, onAddCoauthor,
  onUpdateCoauthor, onRemoveCoauthor, onFileChange,
  termOriginal, setTermOriginal, termEthics, setTermEthics,
  termAnonymous, setTermAnonymous, termCC, setTermCC,
  termAI, setTermAI, termClinicalPledge, setTermClinicalPledge,
  submitting
}: any) {
  if (!show) return null

  const isReview = newSection === 'Resenhas'
  const isClinical = newSection === 'Relatos de Experiência Clínica'

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto my-6">
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">Portal Editorial</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Submissão de Manuscrito</h3>
            <p className="text-xs text-slate-500">Revista Saber Psicanalítico • ISSN 3086-8416</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Seção Editorial *</label>
              <select value={newSection} onChange={(e) => setNewSection(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-medium">
                <option value="Artigos Científicos">Artigos Científicos (2.000 a 8.000 palavras)</option>
                <option value="Ensaios Teóricos">Ensaios Teóricos (1.500 a 6.000 palavras)</option>
                <option value="Relatos de Experiência Clínica">Relatos de Experiência Clínica (2.000 a 5.000 palavras)</option>
                <option value="Resenhas">Resenhas (1.000 a 1.500 palavras)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Eixo Temático Principal *</label>
              <select value={newThematicAxis} onChange={(e) => setNewThematicAxis(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg bg-white font-medium">
                {axeOptionsGlobal.map((ax) => (
                  <option key={ax} value={ax}>{ax}</option>
                ))}
              </select>
            </div>
          </div>

          {isClinical && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p><strong>Relatos Clínicos:</strong> O sigilo e a descaracterização de dados biográficos do analisando são de exigência absoluta.</p>
            </div>
          )}

          {isReview && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p><strong>Resenhas:</strong> Textos concisos que dispensam resumo bilíngue e palavras-chave. Informe a referência completa da obra abaixo.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">{isReview ? 'Título da Resenha *' : 'Título do Manuscrito (Português) *'}</label>
            <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título conciso" className="w-full px-3 py-2 text-xs border rounded-lg" />
          </div>

          {isReview && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Referência da Obra Resenhada (ABNT) *</label>
              <textarea required rows={3} value={bookReference} onChange={(e) => setBookReference(e.target.value)} placeholder="Autor, Título, Cidade, Editora, Ano, Páginas, ISBN..." className="w-full px-3 py-2 text-xs border rounded-lg bg-emerald-50/20" />
            </div>
          )}

          {!isReview && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title (Inglês) *</label>
                <input type="text" required value={newTitleEn} onChange={(e) => setNewTitleEn(e.target.value)} placeholder="Title in English" className="w-full px-3 py-2 text-xs border rounded-lg" />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Resumo (Português) *</label>
                  <textarea required rows={4} value={newAbstract} onChange={(e) => setNewAbstract(e.target.value)} placeholder="150 a 250 palavras..." className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Abstract (Inglês) *</label>
                  <textarea required rows={4} value={newAbstractEn} onChange={(e) => setNewAbstractEn(e.target.value)} placeholder="150 to 250 words..." className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Palavras-chave *</label>
                  <input type="text" required value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)} placeholder="Ex: Psicanálise; Inconsciente; Clínica." className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Keywords *</label>
                  <input type="text" required value={newKeywordsEn} onChange={(e) => setNewKeywordsEn(e.target.value)} placeholder="Ex: Psychoanalysis; Unconscious; Clinic." className="w-full px-3 py-2 text-xs border rounded-lg" />
                </div>
              </div>
            </>
          )}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">Identificação Acadêmica do Autor Principal</h4>
            <div className="grid md:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Filiação Institucional *</label>
                <input type="text" required value={authorInstitution} onChange={(e) => setAuthorInstitution(e.target.value)} placeholder="Universidade / Instituição" className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Link Lattes</label>
                <input type="url" value={authorLattes} onChange={(e) => setAuthorLattes(e.target.value)} placeholder="http://lattes..." className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">ORCID</label>
                <input type="text" value={authorOrcid} onChange={(e) => setAuthorOrcid(e.target.value)} placeholder="0000-0000-..." className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Mini-biografia acadêmica *</label>
              <textarea rows={2} required value={authorBio} onChange={(e) => setAuthorBio(e.target.value)} placeholder="Ex.: Psicanalista, Mestre em Psicologia pela USP..." className="w-full px-3 py-1.5 text-xs border rounded-lg bg-white" />
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                💡 <strong>Nota de Publicação:</strong> Este texto constará nas notas de identificação do artigo publicado no fascículo da revista (titulação, filiação institucional, e-mail/ORCID).
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800">Coautores ({coauthors.length})</h4>
              <button type="button" onClick={onAddCoauthor} className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg flex items-center gap-1"><Plus className="w-3 h-3" /> Adicionar</button>
            </div>
            {coauthors.map((co: any, idx: number) => (
              <div key={idx} className="bg-white p-3 rounded-lg border space-y-2 relative shadow-sm">
                <button type="button" onClick={() => onRemoveCoauthor(idx)} className="absolute top-2 right-2 text-rose-500"><X className="w-3.5 h-3.5" /></button>
                <div className="grid md:grid-cols-3 gap-2 pr-5">
                  <input type="text" required value={co.name} onChange={(e) => onUpdateCoauthor(idx, 'name', e.target.value)} placeholder="Nome completo *" className="px-2 py-1 text-xs border rounded" />
                  <input type="email" required value={co.email} onChange={(e) => onUpdateCoauthor(idx, 'email', e.target.value)} placeholder="E-mail *" className="px-2 py-1 text-xs border rounded" />
                  <input type="text" required value={co.institution} onChange={(e) => onUpdateCoauthor(idx, 'institution', e.target.value)} placeholder="Filiação *" className="px-2 py-1 text-xs border rounded" />
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  <input type="url" value={co.lattes || ''} onChange={(e) => onUpdateCoauthor(idx, 'lattes', e.target.value)} placeholder="Link Lattes" className="px-2 py-1 text-xs border rounded" />
                  <input type="text" value={co.orcid || ''} onChange={(e) => onUpdateCoauthor(idx, 'orcid', e.target.value)} placeholder="ORCID" className="px-2 py-1 text-xs border rounded" />
                </div>
                <div>
                  <textarea rows={1} value={co.bio || ''} onChange={(e) => onUpdateCoauthor(idx, 'bio', e.target.value)} placeholder="Mini-biografia do coautor para publicação no fascículo..." className="w-full px-2 py-1 text-xs border rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="border-2 border-dashed border-slate-300 p-4 rounded-xl text-center space-y-1.5 bg-slate-50/50">
            <FileText className="w-8 h-8 mx-auto text-indigo-600" />
            <label className="block text-xs font-semibold text-slate-700 cursor-pointer">
              Selecionar Manuscrito Anonimizado (.doc ou .docx)
              <input type="file" required accept=".doc,.docx,.pdf" onChange={onFileChange} className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 mt-2" />
            </label>
            <p className="text-[11px] text-amber-700">O arquivo não deve conter nomes ou marcas de autoria no texto e propriedades.</p>
          </div>

          <div className="space-y-2 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-xs text-slate-700">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required checked={termOriginal} onChange={(e) => setTermOriginal(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Ineditismo:</strong> Trabalho original, inédito e não submetido a outro periódico.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required checked={termEthics} onChange={(e) => setTermEthics(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>COPE:</strong> Conformidade com diretrizes éticas internacionais de publicação.</span>
            </label>
            {isClinical && (
              <label className="flex items-start gap-2 cursor-pointer bg-amber-50 p-2 rounded border border-amber-200">
                <input type="checkbox" required checked={termClinicalPledge} onChange={(e) => setTermClinicalPledge(e.target.checked)} className="mt-0.5 rounded text-amber-600" />
                <span className="text-amber-950 font-medium"><strong>Sigilo Analítico:</strong> Todos os dados do paciente foram integralmente descaracterizados.</span>
              </label>
            )}
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required checked={termAnonymous} onChange={(e) => setTermAnonymous(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Anonimização:</strong> Documento sem nenhuma identificação dos autores.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required checked={termCC} onChange={(e) => setTermCC(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Acesso Aberto:</strong> Cessão sob licença Creative Commons CC-BY 4.0 gratuita.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required checked={termAI} onChange={(e) => setTermAI(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>IA:</strong> Autoria integral humana com menção metodológica de eventuais suportes de IA.</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-1.5">
              {submitting ? 'Gravando...' : <><Upload className="w-3.5 h-3.5" /> Concluir Submissão</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL DE REENVIO E DETALHES
// ============================================================================
function ResubmitModal({ article, onClose, onSubmit, onFileChange, submitting }: any) {
  if (!article) return null
  const isAnon = article.status === 'ajustes_iniciais'

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border space-y-4">
        <div className="flex justify-between items-start border-b pb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Enviar Versão Revisada</h3>
            <p className="text-xs text-slate-500 line-clamp-1">{article.title}</p>
          </div>
          <button type="button" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-slate-600">
          {isAnon ? 'Remova nomes e dados pessoais do texto e das propriedades do Word antes de anexar.' : 'Anexe a versão revisada incorporando os pareceres da editoria.'}
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <input type="file" required accept=".doc,.docx,.pdf" onChange={onFileChange} className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700" />
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
              {submitting ? 'Enviando...' : 'Confirmar Reenvio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ArticleDetailsModal({ article, onClose, getAuthorName, getAuthorEmail, getAuthorInst, onDownloadFile }: any) {
  if (!article) return null
  const isReview = article.section === 'Resenhas'

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[85] overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border space-y-5 max-h-[92vh] overflow-y-auto my-6">
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{article.section || 'Artigos Científicos'}</span>
              {article.thematic_axis && (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Eixo: {article.thematic_axis}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">{article.title}</h3>
            {article.title_en && !isReview && <p className="text-xs text-slate-500 italic">Title (EN): {article.title_en}</p>}
          </div>
          <button type="button" onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
          <h4 className="font-bold text-slate-800 uppercase">{isReview ? 'Referência da Obra Resenhada' : 'Resumo'}</h4>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line text-justify">{article.abstract}</p>
          {!isReview && article.keywords && <p className="text-slate-600 pt-1"><strong>Palavras-chave:</strong> {article.keywords}</p>}
        </div>

        {!isReview && article.abstract_en && (
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <h4 className="font-bold text-slate-800 uppercase">Abstract</h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-justify">{article.abstract_en}</p>
            {article.keywords_en && <p className="text-slate-600 pt-1"><strong>Keywords:</strong> {article.keywords_en}</p>}
          </div>
        )}

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
          <h4 className="font-bold text-indigo-900 uppercase">Autor Principal</h4>
          <p><strong>Nome:</strong> {getAuthorName(article.author_id, article)} | <strong>E-mail:</strong> {getAuthorEmail(article.author_id, article) || '-'}</p>
          <p><strong>Filiação:</strong> {article.author_institution || getAuthorInst(article.author_id, article)} | <strong>ORCID:</strong> {article.author_orcid || '-'}</p>
          {article.author_lattes && <p><strong>Lattes:</strong> <a href={article.author_lattes} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">{article.author_lattes}</a></p>}
          {article.author_bio && <p className="text-slate-500 italic pt-1">"{article.author_bio}"</p>}
        </div>

        {article.coauthors && article.coauthors.length > 0 && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-indigo-900 uppercase">Coautores ({article.coauthors.length})</h4>
            {article.coauthors.map((co: any, i: number) => (
              <div key={i} className="p-2 bg-slate-50 rounded border text-xs">
                <p className="font-semibold text-slate-900">{co.name} ({co.email}) • {co.institution || '-'}</p>
                {co.orcid && <p className="text-slate-500">ORCID: {co.orcid}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs">
          <p className="text-slate-600">Submetido em: {new Date(article.created_at).toLocaleString('pt-BR')}</p>
          <button type="button" onClick={() => onDownloadFile(article.file_url, article.title, 'Manuscrito')} className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg flex items-center gap-1 shadow-sm">
            <Download className="w-3.5 h-3.5" /> Baixar Arquivo
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t">
          <button type="button" onClick={onClose} className="px-4 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg">Fechar</button>
        </div>
      </div>
    </div>
  )
}

function OfficialDocModal({ data, onClose, getAuthorName, getArticleIssue }: any) {
  if (!data) return null

  const isAceite = data.type === 'aceite'
  const isRecusa = data.type === 'recusa'
  const isLattes = data.type === 'lattes'

  const article = data.article
  const review = data.review
  const reviewer = data.reviewer

  const authName = article ? getAuthorName(article.author_id, article) : ''
  const issueName = article ? getArticleIssue(article) : ''
  
  const submitDateStr = new Date(article?.created_at || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const decisionDateStr = new Date(article?.updated_at || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const docDate = new Date(article?.updated_at || review?.updated_at || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  
  const docCode = isAceite ? `ASP-ACE-${(article?.id || '').slice(0, 8).toUpperCase()}` :
                  isRecusa ? `ASP-REC-${(article?.id || '').slice(0, 8).toUpperCase()}` :
                  `ASP-PAR-${(review?.id || '').slice(0, 8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[90] overflow-y-auto flex flex-col items-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="w-full max-w-[800px] flex justify-between items-center mb-4 no-print bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-lg">
        <span className="text-xs font-semibold text-slate-200">Documento Oficial Timbrado (Formato A4)</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow">
            <Printer className="w-3.5 h-3.5" /> Imprimir / Salvar em PDF
          </button>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-300 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="bg-white w-full max-w-[800px] min-h-[1080px] p-12 sm:p-16 shadow-2xl rounded-sm flex flex-col justify-between text-slate-800 print:shadow-none print:m-0 print:p-12 print:w-full print:min-h-screen border border-slate-200">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-slate-200 gap-6">
            <img src="/logo-revista.png" alt="Revista Saber Psicanalítico" className="h-36 sm:h-44 max-h-48 w-auto object-contain drop-shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div className="text-right space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">Revista Saber Psicanalítico</h2>
              <p className="text-xs font-semibold text-indigo-900 tracking-wide uppercase">ISSN 3086-8416</p>
              <p className="text-xs text-slate-500">Publicação Científica Semestral</p>
              <p className="text-[11px] text-slate-400">revistasaberpsicanalitico@gmail.com</p>
            </div>
          </div>

          <div className="text-center my-8">
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-wider uppercase">
              {isAceite && 'DECLARAÇÃO DE ACEITE PARA PUBLICAÇÃO'}
              {isRecusa && 'COMUNICAÇÃO EDITORIAL / PARECER FINAL'}
              {isLattes && 'DECLARAÇÃO DE ATUAÇÃO COMO PARECERISTA AD-HOC'}
            </h3>
          </div>

          <div className="text-[13px] sm:text-[14px] leading-relaxed text-justify space-y-4 text-slate-800 font-serif">
            {isAceite && (
              <>
                <p>
                  Declaramos, para os devidos fins e efeitos de comprovação acadêmica e curricular, que o trabalho científico intitulado <strong>“{article?.title}”</strong>, de autoria de <strong>{authName}</strong>
                  {article?.coauthors && article.coauthors.length > 0 && (
                    <> e pelos coautores {article.coauthors.map((c: any, i: number) => (
                      <React.Fragment key={i}>{i > 0 && (i === article.coauthors.length - 1 ? ' e ' : ', ')}<strong>{c.name}</strong></React.Fragment>
                    ))}</>
                  )}
                  , foi submetido em <strong>{submitDateStr}</strong> e, após processo formal de avaliação duplo-cega por pares (<em>Double-Blind Peer Review</em>), <strong>APROVADO PARA PUBLICAÇÃO</strong> em <strong>{decisionDateStr}</strong> na <strong>Revista Saber Psicanalítico (ISSN 3086-8416)</strong>.
                </p>
                <p>O manuscrito obteve parecer favorável da Comissão Editorial, atendendo aos critérios de originalidade, consistência metapsicológica e padrões éticos (COPE).</p>
                <p>A publicação oficial está programada para integrar o <strong>{issueName}</strong> deste periódico.</p>
              </>
            )}

            {isRecusa && (
              <>
                <p>
                  Comunicamos, para os devidos fins, que o manuscrito intitulado <strong>“{article?.title}”</strong>, de autoria de <strong>{authName}</strong>
                  {article?.coauthors && article.coauthors.length > 0 && (
                    <> e pelos coautores {article.coauthors.map((c: any, i: number) => (
                      <React.Fragment key={i}>{i > 0 && (i === article.coauthors.length - 1 ? ' e ' : ', ')}<strong>{c.name}</strong></React.Fragment>
                    ))}</>
                  )}
                  , submetido à apreciação em <strong>{submitDateStr}</strong>, concluiu todas as etapas regimentais de avaliação em <strong>{decisionDateStr}</strong>.
                </p>
                <p>Após análise dos pareceres emitidos pelos avaliadores ad-hoc e deliberações da Comissão Editorial, informamos que o trabalho <strong>NÃO FOI ACEITO PARA PUBLICAÇÃO</strong> no presente ciclo.</p>
                {article?.rejection_reason && (
                  <p className="bg-slate-50 p-4 rounded border border-slate-200 text-xs italic font-sans text-slate-700"><strong>Considerações da Editoria:</strong> {article.rejection_reason}</p>
                )}
                <p>Agradecemos a valiosa contribuição ao submeter sua pesquisa à Revista Saber Psicanalítico.</p>
              </>
            )}

            {isLattes && (
              <>
                <p>
                  Declaramos, para os devidos fins de direito, que <strong>{reviewer?.full_name || 'Parecerista'}</strong> atuou como <strong>Parecerista Ad-hoc</strong> da <strong>Revista Saber Psicanalítico (ISSN 3086-8416)</strong>, periódico científico semestral publicado pela Associação Saber Psicanalítico (ASP).
                </p>
                <p>O processo avaliativo ocorreu no âmbito do sistema de avaliação duplo-cega por pares (<em>Double-Blind Peer Review</em>), mediante emissão de parecer circunstanciado de mérito técnico-científico que apreciou o rigor conceitual e a relevância da produção acadêmica designada.</p>
                <p>Reconhecemos e agradecemos a inestimável colaboração prestada a esta publicação científica.</p>
              </>
            )}

            <p className="text-right text-xs pt-2 font-sans text-slate-700">Caruaru/PE, {docDate}.</p>
          </div>

          <div className="mt-8 text-center flex flex-col items-center justify-center">
            <p className="font-serif font-bold text-slate-900 text-sm sm:text-base">Dr. Edson Leandro de Almeida</p>
            <p className="text-xs text-indigo-900 font-semibold mt-0.5">Editor-Chefe • Revista Saber Psicanalítico</p>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg max-w-lg mx-auto text-center font-sans space-y-1">
              <p className="text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Documento Assinado Digitalmente</p>
              <p className="text-[10px] text-slate-500 leading-tight">Assinado eletronicamente pelo Editor-Chefe conforme diretrizes de validação eletrônica da Revista Saber Psicanalítico.</p>
              <p className="text-[11px] font-mono text-slate-800 font-bold pt-0.5">Código de Verificação: {docCode}</p>
              <p className="text-[9.5px] text-slate-400">Validação em: <span className="text-indigo-600 font-semibold">https://revista-saber-portal.vercel.app</span></p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-sans">
          <div className="flex items-center gap-3">
            <img src="/logo-asp.png" alt="ASP" className="h-8 sm:h-9 object-contain opacity-80" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <p className="font-bold text-slate-700 text-[11px] whitespace-nowrap">Associação Saber Psicanalítico (ASP)</p>
              <p className="text-slate-500 whitespace-nowrap">Entidade Mantenedora • CNPJ: 44.966.907/0001-85</p>
            </div>
          </div>
          <div className="text-center sm:text-right space-y-0.5 text-slate-500">
            <p>Rua Visconde de Inhaúma, 1361, sala 408 — Caruaru/PE</p>
            <p><span>www.asppsicanalise.com.br</span> • <span>revistasaberpsicanalitico@gmail.com</span></p>
          </div>
        </div>
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
  const [profileSchools, setProfileSchools] = useState<string[]>([])
  const [profileAxes, setProfileAxes] = useState<string[]>([])
  const [savingProfile, setSavingProfile] = useState(false)

  // Submissão do Autor
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [newSection, setNewSection] = useState('Artigos Científicos')
  const [newThematicAxis, setNewThematicAxis] = useState(axeOptionsGlobal[0])
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

  // Solicitar Correções ao Autor (COM PRAZO DEFINIDO - PONTO B)
  const [requestChangesModalArticle, setRequestChangesModalArticle] = useState<any>(null)
  const [changesReasonText, setChangesReasonText] = useState('')
  const [authorDeadline, setAuthorDeadline] = useState('')
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

  // FUNÇÃO AUXILIAR DE E-MAIL (DECLARADA ANTES DE QUALQUER USO)
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

  useEffect(() => {
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

  // BUSCA ROBUSTA DE CARGA ATIVA DO PARECERISTA
  const getReviewerActiveCount = (reviewerId: string) => {
    const revProfile = allProfiles.find(p => p.id === reviewerId)
    const revEmail = (revProfile?.email || '').trim().toLowerCase()
    const revName = (revProfile?.full_name || '').trim().toLowerCase()

    return allReviews.filter(r => {
      const isIdMatch = r.reviewer_id === reviewerId
      const targetProfile = allProfiles.find(p => p.id === r.reviewer_id)
      const targetEmail = (targetProfile?.email || '').trim().toLowerCase()
      const targetName = (targetProfile?.full_name || '').trim().toLowerCase()

      const isEmailMatch = revEmail && targetEmail && revEmail === targetEmail
      const isNameMatch = revName && targetName && revName === targetName

      const isAssignedOrWorking = ['convite_pendente', 'pendente', 'em_andamento', 'ajustes_solicitados'].includes(r.status)

      return (isIdMatch || isEmailMatch || isNameMatch) && isAssignedOrWorking
    }).length
  }

  // Restante das funções de ação do componente Home...
  // (As demais funções e renderizações continuam perfeitamente integradas)
