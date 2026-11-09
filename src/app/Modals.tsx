'use client'

import React from 'react'
import { 
  X, Plus, Trash2, Calendar, Clock, AlertTriangle, 
  AlertCircle, CheckCircle2, HelpCircle, ShieldAlert, Award, 
  Printer, Ban, Search, Download
} from 'lucide-react'

// Modal de Submissão do Manuscrito
export function SubmitModal({
  show, onClose, onSubmit, newSection, setNewSection,
  newTitle, setNewTitle, newTitleEn, setNewTitleEn,
  newAbstract, setNewAbstract, newAbstractEn, setNewAbstractEn,
  newKeywords, setNewKeywords, newKeywordsEn, setNewKeywordsEn,
  authorInstitution, setAuthorInstitution, authorLattes, setAuthorLattes,
  authorOrcid, setAuthorOrcid, authorBio, setAuthorBio,
  coauthors, onAddCoauthor, onUpdateCoauthor, onRemoveCoauthor,
  onFileChange, termOriginal, setTermOriginal, termEthics, setTermEthics,
  termAnonymous, setTermAnonymous, termCC, setTermCC, termAI, setTermAI, submitting
}: any) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Submissão Editorial • ISSN 3086-8416</span>
            <h3 className="text-lg font-bold text-slate-900">Submeter Novo Manuscrito</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Seção e Autor Principal</h4>
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
              <input type="text" required value={authorInstitution} onChange={(e) => setAuthorInstitution(e.target.value)} placeholder="Filiação Institucional *" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white" />
              <input type="url" value={authorLattes} onChange={(e) => setAuthorLattes(e.target.value)} placeholder="Link do Lattes" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white" />
              <input type="text" value={authorOrcid} onChange={(e) => setAuthorOrcid(e.target.value)} placeholder="ORCID (Opcional)" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white" />
            </div>

            <input type="text" value={authorBio} onChange={(e) => setAuthorBio(e.target.value)} placeholder="Minibiografia / Titulação acadêmica (Opcional)" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white" />
          </div>

          <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Coautores ({coauthors.length})</h4>
              <button type="button" onClick={onAddCoauthor} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
                <Plus className="w-3.5 h-3.5" /> Adicionar Coautor
              </button>
            </div>

            {coauthors.map((c: any, idx: number) => (
              <div key={idx} className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-700">Coautor #{idx + 1}</span>
                  <button type="button" onClick={() => onRemoveCoauthor(idx)} className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remover</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" required value={c.name} onChange={(e) => onUpdateCoauthor(idx, 'name', e.target.value)} placeholder="Nome completo *" className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md" />
                  <input type="email" required value={c.email} onChange={(e) => onUpdateCoauthor(idx, 'email', e.target.value)} placeholder="E-mail *" className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md" />
                  <input type="text" required value={c.institution} onChange={(e) => onUpdateCoauthor(idx, 'institution', e.target.value)} placeholder="Filiação Institucional *" className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md" />
                  <input type="url" value={c.lattes} onChange={(e) => onUpdateCoauthor(idx, 'lattes', e.target.value)} placeholder="Link do Lattes (Opcional)" className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md" />
                  <div className="sm:col-span-2">
                    <input type="text" value={c.orcid} onChange={(e) => onUpdateCoauthor(idx, 'orcid', e.target.value)} placeholder="ORCID (Opcional)" className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título do Artigo (Português) *" className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              <input type="text" required value={newTitleEn} onChange={(e) => setNewTitleEn(e.target.value)} placeholder="Title (Título em Inglês) *" className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <textarea required rows={4} value={newAbstract} onChange={(e) => setNewAbstract(e.target.value)} placeholder="Resumo em Português (150 a 250 palavras) *" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <textarea required rows={4} value={newAbstractEn} onChange={(e) => setNewAbstractEn(e.target.value)} placeholder="Abstract (Resumo em Inglês) *" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" required value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)} placeholder="Palavras-chave (separadas por ponto e vírgula) *" className="px-3 py-2 text-xs border border-slate-200 rounded-lg" />
              <input type="text" required value={newKeywordsEn} onChange={(e) => setNewKeywordsEn(e.target.value)} placeholder="Keywords in English *" className="px-3 py-2 text-xs border border-slate-200 rounded-lg" />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-800">Arquivo do Manuscrito Completo (.docx - Word Obrigatório) *</label>
            <p className="text-[11px] text-slate-500">O arquivo deve estar COMPLETO, porém SEM IDENTIFICAÇÃO DOS AUTORES.</p>
            <input type="file" required accept=".docx,.doc" onChange={onFileChange} className="w-full text-xs text-slate-500" />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
            <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={termOriginal} onChange={(e) => setTermOriginal(e.target.checked)} className="mt-0.5 rounded text-indigo-600" /><span><strong>Ineditismo e Autoria:</strong> Manuscrito original e não submetido a outro periódico.</span></label>
            <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={termEthics} onChange={(e) => setTermEthics(e.target.checked)} className="mt-0.5 rounded text-indigo-600" /><span><strong>Sigilo Clínico:</strong> Dados clínicos devidamente descaracterizados.</span></label>
            <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={termAnonymous} onChange={(e) => setTermAnonymous(e.target.checked)} className="mt-0.5 rounded text-indigo-600" /><span><strong>Anonimização:</strong> Sem menção a nomes de autores nas propriedades do Word.</span></label>
            <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={termCC} onChange={(e) => setTermCC(e.target.checked)} className="mt-0.5 rounded text-indigo-600" /><span><strong>Acesso Aberto (CC-BY 4.0):</strong> Licenciamento Creative Commons de acesso aberto.</span></label>
            <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={termAI} onChange={(e) => setTermAI(e.target.checked)} className="mt-0.5 rounded text-indigo-600" /><span><strong>Uso de IA:</strong> Não utilizada para conteúdo teórico-clínico substancial.</span></label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">{submitting ? 'Enviando...' : 'Concluir Submissão'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal de Reenvio de Versão Corrigida
export function ResubmitModal({ article, onClose, onSubmit, onFileChange, submitting }: any) {
  if (!article) return null

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex justify-between items-start border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Enviar Nova Versão Corrigida</h3>
            <p className="text-xs text-slate-500 mt-0.5">Artigo: <strong>{article.title}</strong></p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <p className="font-semibold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-600" /> Orientações para o reenvio:</p>
          <p>Anexe o arquivo Word (.docx) revisado. Ele será encaminhado diretamente ao Editor Geral para avaliação e decisão final.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Arquivo Word Corrigido (.docx) *</label>
            <input type="file" required accept=".docx,.doc" onChange={onFileChange} className="w-full text-xs text-slate-500" />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50">{submitting ? 'Enviando...' : 'Confirmar Envio'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal Timbrado A4 Unificado (Aceite, Não Aceite e Lattes)
export function OfficialDocModal({ data, onClose, getAuthorName, getAuthorInst, getArticleIssue }: any) {
  if (!data) return null
  const { type, article: art, review: rev, reviewer: rPerson } = data
  const isAceite = type === 'aceite'
  const isRecusa = type === 'recusa'
  const isLattes = type === 'lattes'

  const authorName = art ? getAuthorName(art.author_id) : ''
  const authorInst = art ? (art.author_institution || getAuthorInst(art.author_id)) : ''
  const coauthorsList = (art?.coauthors || []).filter((c: any) => c.name && c.name.trim() !== '')
  const validationCode = isAceite ? `ASP-ACE-${art.id.slice(0, 8).toUpperCase()}` : isRecusa ? `ASP-REC-${art.id.slice(0, 8).toUpperCase()}` : `ASP-PAR-${rev.id.slice(0, 8).toUpperCase()}`

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[80] overflow-y-auto">
      <div className="bg-white max-w-[210mm] w-full shadow-2xl border border-slate-200 my-6 flex flex-col justify-between p-8 sm:p-14 text-slate-900 min-h-[297mm]">
        <div>
          <div className="flex justify-between items-center border-b-2 border-indigo-950 pb-6 gap-6">
            <img src="/logo-revista.png" alt="Revista Saber Psicanalítico" className="h-32 md:h-36 object-contain max-w-[280px]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div className="text-right space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Revista Saber Psicanalítico</h2>
              <p className="text-xs font-bold text-indigo-700 tracking-wider">ISSN 3086-8416</p>
              <p className="text-[11px] text-slate-600">Associação Saber Psicanalítico (ASP)</p>
            </div>
          </div>

          <div className="text-center my-8">
            <h3 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 inline-block pb-1">
              {isAceite ? 'DECLARAÇÃO DE ACEITE PARA PUBLICAÇÃO' : isRecusa ? 'COMUNICADO EDITORIAL DE NÃO ACEITAÇÃO' : 'DECLARAÇÃO DE ATUAÇÃO COMO PARECERISTA AD-HOC'}
            </h3>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-justify text-slate-800">
            {isAceite && (
              <>
                <p>Declaramos que o trabalho <strong>&ldquo;{art.title}&rdquo;</strong>, seção <strong>{art.section || 'Artigo Científico'}</strong>, de autoria de <strong>{authorName}</strong>{authorInst !== '-' ? ` (${authorInst})` : ''}{coauthorsList.length > 0 && <span> e coautoria de {coauthorsList.map((c: any, i: number) => <span key={i}><strong>{c.name}</strong>{c.institution ? ` (${c.institution})` : ''}{i < coauthorsList.length - 1 ? ', ' : ''}</span>)}</span>}, foi avaliado sob sistema duplo-cego (*double-blind peer review*) pela <strong>Revista Saber Psicanalítico (ISSN 3086-8416)</strong> e oficialmente <strong>ACEITO PARA PUBLICAÇÃO</strong> no <strong>{getArticleIssue(art)}</strong>.</p>
                <p className="text-xs text-slate-500 italic">Válido perante programas de pós-graduação, CAPES/CNPq e concursos.</p>
              </>
            )}

            {isRecusa && (
              <>
                <p>Declaramos que o manuscrito <strong>&ldquo;{art.title}&rdquo;</strong>, submetido por <strong>{authorName}</strong>, foi avaliado pela Revista Saber Psicanalítico (ISSN 3086-8416) e deliberou-se pela <strong>NÃO ACEITAÇÃO</strong> para publicação.</p>
                {art.rejection_reason && <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs"><p className="font-bold">Síntese Editorial:</p><p className="whitespace-pre-line">{art.rejection_reason}</p></div>}
              </>
            )}

            {isLattes && (
              <>
                <p>Declaramos, para comprovação junto ao <strong>CNPq / Plataforma Lattes</strong>, que <strong>{rPerson?.full_name || 'Parecerista'}</strong>{rPerson?.institution ? ` (${rPerson.institution})` : ''} atuou formalmente como <strong>PARECERISTA AD-HOC</strong> para a <strong>Revista Saber Psicanalítico (ISSN 3086-8416)</strong>, emitindo parecer duplo-cego concluído em <strong>{new Date(rev.updated_at || rev.created_at).toLocaleDateString('pt-BR')}</strong>.</p>
                <p className="text-xs text-slate-500 italic">Documento comprobatório emitido pelo sistema de editoração eletrônica.</p>
              </>
            )}
          </div>
        </div>

        <div className="pt-8 text-center space-y-4">
          <p className="text-xs text-slate-600">Caruaru/PE, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
          <div>
            <p className="font-bold text-slate-900 text-base">Dr. Edson Leandro de Almeida</p>
            <p className="text-xs text-indigo-900 font-semibold uppercase tracking-wider">Editor-Chefe</p>
            <p className="text-xs text-slate-500">Revista Saber Psicanalítico • ASP</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 max-w-
