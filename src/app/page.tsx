'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  User, Lock, Mail, Building, Phone, ArrowRight, Upload, FileText, 
  LogOut, ShieldCheck, Users, UserCheck, Download, MessageSquare, 
  Send, CheckCircle2, AlertTriangle, RefreshCw, Trash2, ShieldAlert,
  Award, Ban, Search, X, AlertCircle, KeyRound, Clock, FileSpreadsheet, Edit3, Plus, Printer, Info, CheckSquare
} from 'lucide-react'

// ============================================================================
// MODAL 1: SUBMISSÃO COMPLETA DE MANUSCRITO
// ============================================================================
function SubmitModal({
  show, onClose, onSubmit, newSection, setNewSection,
  newTitle, setNewTitle, newTitleEn, setNewTitleEn,
  newAbstract, setNewAbstract, newAbstractEn, setNewAbstractEn,
  newKeywords, setNewKeywords, newKeywordsEn, setNewKeywordsEn,
  authorInstitution, setAuthorInstitution,
  authorLattes, setAuthorLattes, authorOrcid, setAuthorOrcid,
  authorBio, setAuthorBio, coauthors, onAddCoauthor,
  onUpdateCoauthor, onRemoveCoauthor, onFileChange,
  termOriginal, setTermOriginal, termEthics, setTermEthics,
  termAnonymous, setTermAnonymous, termCC, setTermCC,
  termAI, setTermAI, submitting
}: any) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[92vh] overflow-y-auto my-6">
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">Portal Editorial</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Submissão de Novo Manuscrito</h3>
            <p className="text-xs text-slate-500">Revista Saber Psicanalítico • ISSN 3086-8416 • Avaliação Duplo-Cega</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2">
          <p className="font-bold flex items-center gap-1.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            Orientações obrigatórias para submissão inicial:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900/90 pl-1">
            <li>O manuscrito deve ser enviado em formato editável <strong>.DOC ou .DOCX</strong> (Microsoft Word).</li>
            <li><strong>Anonimização rigorosa:</strong> Não inclua nome dos autores, filiação ou referências autobiográficas no corpo do texto.</li>
            <li>Remova as propriedades do autor no Word: vá em <em>Arquivo &gt; Informações &gt; Inspecionar Documento &gt; Remover Propriedades do Documento e Informações Pessoais</em>.</li>
            <li>O resumo e as palavras-chave devem constar obrigatoriamente em Português e Inglês.</li>
          </ul>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Seção Editorial Pretendida *</label>
            <select value={newSection} onChange={(e) => setNewSection(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg bg-white">
              <option value="Artigo Científico">Artigo Científico (Investigação Teórica ou Empírica)</option>
              <option value="Ensaio Teórico">Ensaio Teórico / Metapsicologia Psicanalítica</option>
              <option value="Relato de Experiência Clínica">Relato de Experiência Clínica / Estudo de Caso</option>
              <option value="Resenha de Obra">Resenha Crítica de Livro ou Obra Relevante</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Título do Trabalho (em Português) *</label>
              <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Título conciso e representativo" className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title (em Inglês) *</label>
              <input type="text" required value={newTitleEn} onChange={(e) => setNewTitleEn(e.target.value)} placeholder="Title in English language" className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resumo em Português (150 a 250 palavras) *</label>
              <textarea required rows={4} value={newAbstract} onChange={(e) => setNewAbstract(e.target.value)} placeholder="Apresente objetivo, referencial teórico psicanalítico, metodologia e considerações..." className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Abstract (em Inglês) *</label>
              <textarea required rows={4} value={newAbstractEn} onChange={(e) => setNewAbstractEn(e.target.value)} placeholder="Present objective, psychoanalytic theoretical framework, methodology, and conclusions..." className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Palavras-chave (3 a 5, separadas por ponto e vírgula) *</label>
              <input type="text" required value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)} placeholder="Ex: Psicanálise; Inconsciente; Transferência; Clínica." className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Keywords (em Inglês, separadas por ponto e vírgula) *</label>
              <input type="text" required value={newKeywordsEn} onChange={(e) => setNewKeywordsEn(e.target.value)} placeholder="Ex: Psychoanalysis; Unconscious; Transference; Clinic." className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Identificação Acadêmica do(a) Autor(a) Principal</h4>
              <p className="text-[11px] text-slate-500">Dados sigilosos de controle editorial (não divulgados aos pareceristas durante a avaliação).</p>
            </div>
            <div className="grid md:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Filiação Institucional *</label>
                <input type="text" required value={authorInstitution} onChange={(e) => setAuthorInstitution(e.target.value)} placeholder="Ex: ASP / Universidade..." className="w-full px-3 py-2 text-xs border rounded-lg bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Link do Currículo Lattes</label>
                <input type="url" value={authorLattes} onChange={(e) => setAuthorLattes(e.target.value)} placeholder="http://lattes.cnpq.br/..." className="w-full px-3 py-2 text-xs border rounded-lg bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Identificador ORCID</label>
                <input type="text" value={authorOrcid} onChange={(e) => setAuthorOrcid(e.target.value)} placeholder="0000-0000-0000-0000" className="w-full px-3 py-2 text-xs border rounded-lg bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Mini-biografia acadêmica (titulação e área de atuação)</label>
              <textarea rows={2} value={authorBio} onChange={(e) => setAuthorBio(e.target.value)} placeholder="Ex: Psicanalista, Especialista em Teoria e Clínica Psicanalítica..." className="w-full px-3 py-2 text-xs border rounded-lg bg-white" />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Coautores ({coauthors.length})</h4>
                <p className="text-[11px] text-slate-500">Adicione os coautores que participaram da pesquisa.</p>
              </div>
              <button type="button" onClick={onAddCoauthor} className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg flex items-center gap-1 hover:bg-indigo-100">
                <Plus className="w-3.5 h-3.5" /> Adicionar Coautor
              </button>
            </div>
            {coauthors.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-1">Nenhum coautor adicionado (autoria individual).</p>
            ) : (
              coauthors.map((co: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-lg border space-y-2 relative shadow-sm">
                  <button type="button" onClick={() => onRemoveCoauthor(idx)} className="absolute top-2.5 right-2.5 text-rose-500 hover:text-rose-700 text-xs">
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-[11px] font-bold text-indigo-700">Coautor(a) #{idx + 1}</p>
                  <div className="grid md:grid-cols-3 gap-2 pr-6">
                    <input type="text" required value={co.name} onChange={(e) => onUpdateCoauthor(idx, 'name', e.target.value)} placeholder="Nome completo *" className="px-2.5 py-1.5 text-xs border rounded" />
                    <input type="email" required value={co.email} onChange={(e) => onUpdateCoauthor(idx, 'email', e.target.value)} placeholder="E-mail *" className="px-2.5 py-1.5 text-xs border rounded" />
                    <input type="text" required value={co.institution} onChange={(e) => onUpdateCoauthor(idx, 'institution', e.target.value)} placeholder="Filiação institucional *" className="px-2.5 py-1.5 text-xs border rounded" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <input type="url" value={co.lattes || ''} onChange={(e) => onUpdateCoauthor(idx, 'lattes', e.target.value)} placeholder="Link do Lattes (opcional)" className="px-2.5 py-1.5 text-xs border rounded" />
                    <input type="text" value={co.orcid || ''} onChange={(e) => onUpdateCoauthor(idx, 'orcid', e.target.value)} placeholder="ORCID (opcional)" className="px-2.5 py-1.5 text-xs border rounded" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-2 border-dashed border-slate-300 p-5 rounded-xl text-center space-y-2 bg-slate-50/50">
            <FileText className="w-9 h-9 mx-auto text-indigo-600" />
            <label className="block text-xs font-semibold text-slate-700 cursor-pointer">
              Clique para selecionar o Manuscrito Anonimizado (.doc ou .docx)
              <input type="file" required accept=".doc,.docx,.pdf" onChange={onFileChange} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mt-2" />
            </label>
            <p className="text-[11px] text-amber-700 font-medium">Atenção: Garanta que o documento não possua marcas de identificação autoral.</p>
          </div>

          <div className="space-y-2.5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs text-slate-700">
            <h5 className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Declarações Éticas e Compromissos Editoriais (COPE / CC-BY 4.0):
            </h5>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required checked={termOriginal} onChange={(e) => setTermOriginal(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Ineditismo e Exclusividade:</strong> Declaro que o manuscrito é original, inédito e não foi submetido simultaneamente a outro periódico.</span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required checked={termEthics} onChange={(e) => setTermEthics(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Conformidade Ética (COPE):</strong> Declaro conformidade com as diretrizes internacionais de ética em publicação científica e proteção do sigilo clínico em estudos de caso psicanalíticos.</span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required checked={termAnonymous} onChange={(e) => setTermAnonymous(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Garantia de Anonimização:</strong> Confirmo que o documento anexado foi totalmente desprovido de qualquer marca ou propriedade que identifique os autores, permitindo a avaliação duplo-cega (*blind peer review*).</span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required checked={termCC} onChange={(e) => setTermCC(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Acesso Aberto (CC-BY 4.0):</strong> Concordo que, se aceito, o manuscrito será distribuído sob a licença internacional Creative Commons Atribuição 4.0 (CC-BY 4.0), livre e gratuito.</span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" required checked={termAI} onChange={(e) => setTermAI(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Uso Ético de Inteligência Artificial:</strong> Declaro autoria integral e que qualquer emprego de modelos generativos de linguagem foi explicitado na seção metodológica.</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
              {submitting ? 'Gravando e Notificando Editores...' : <><Upload className="w-4 h-4" /> Concluir Submissão Oficial</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL 2: REENVIO DE ARQUIVO CORRIGIDO
// ============================================================================
function ResubmitModal({ article, onClose, onSubmit, onFileChange, submitting }: any) {
  if (!article) return null

  const isAnonAdjustment = article.status === 'ajustes_iniciais'

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-start border-b pb-3">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {isAnonAdjustment ? 'Ajuste de Anonimização' : 'Reenvio de Correções'}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">Enviar Versão Revisada do Manuscrito</h3>
            <p className="text-xs text-slate-500 line-clamp-1">{article.title}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        {isAnonAdjustment ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              Solicitação da Editoria: Remoção de Identificação
            </p>
            <p className="text-[11px] leading-relaxed">
              O trabalho não pôde seguir para os pareceristas por conter marcas de autoria. Por favor, <strong>remova nomes, filiações e informações pessoais do corpo do texto e das propriedades do arquivo Word</strong> e reenvie para dar início à avaliação duplo-cega.
            </p>
          </div>
        ) : (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-950 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5 text-indigo-900">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              Orientações para o Reenvio com Correções
            </p>
            <p className="text-[11px] leading-relaxed">
              Incorpore as alterações recomendadas nos pareceres dos avaliadores. Se o artigo for submetido a uma nova rodada de avaliação cega, mantenha o anonimato do texto.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione o arquivo corrigido (.doc, .docx ou .pdf):</label>
            <input type="file" required accept=".doc,.docx,.pdf" onChange={onFileChange} className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-lg p-1" />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-1.5">
              {submitting ? 'Enviando...' : <><RefreshCw className="w-3.5 h-3.5" /> Enviar Arquivo Corrigido</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// MODAL 3: DOCUMENTOS OFICIAIS TIMBRADOS A4 (REVISTA + ASP, SEM LINHA, CÓDIGO ABAIXO)
// ============================================================================
function OfficialDocModal({ data, onClose, getAuthorName, getAuthorInst, getArticleIssue }: any) {
  if (!data) return null

  const isAceite = data.type === 'aceite'
  const isRecusa = data.type === 'recusa'
  const isLattes = data.type === 'lattes'

  const article = data.article
  const review = data.review
  const reviewer = data.reviewer

  const authName = article ? getAuthorName(article.author_id) : ''
  const authInst = article ? getAuthorInst(article.author_id) : ''
  const issueName = article ? getArticleIssue(article) : ''
  const docDate = new Date(article?.updated_at || review?.updated_at || Date.now()).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  
  const docCode = isAceite ? `ASP-ACE-${(article?.id || '').slice(0, 8).toUpperCase()}` :
                  isRecusa ? `ASP-REC-${(article?.id || '').slice(0, 8).toUpperCase()}` :
                  `ASP-PAR-${(review?.id || '').slice(0, 8).toUpperCase()}`

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[90] overflow-y-auto flex flex-col items-center p-3 sm:p-6 print:p-0 print:bg-white">
      {/* Barra superior de ações */}
      <div className="w-full max-w-[800px] flex justify-between items-center mb-4 no-print bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-lg">
        <span className="text-xs font-semibold text-slate-200">Documento Oficial Timbrado (Formato A4)</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
          >
            <Printer className="w-3.5 h-3.5" /> Imprimir / Salvar em PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Folha A4 Timbrada Institucional */}
      <div className="bg-white w-full max-w-[800px] min-h-[1050px] p-10 sm:p-14 shadow-2xl rounded-sm flex flex-col justify-between text-slate-800 print:shadow-none print:m-0 print:p-10 print:w-full print:min-h-screen border border-slate-200">
        
        {/* CABEÇALHO COM LOGO DA REVISTA E LOGO DA ASP */}
        <div>
          <div className="flex justify-between items-center pb-6 border-b-2 border-slate-800 gap-4">
            <img 
              src="/logo-revista.png" 
              alt="Revista Saber Psicanalítico" 
              className="h-20 sm:h-24 object-contain" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
            <div className="text-center flex-1 space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
                REVISTA SABER PSICANALÍTICO
              </h2>
              <p className="text-xs font-bold text-indigo-900 tracking-wider uppercase">
                ISSN 3086-8416 • Publicação Científica Semestral
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                Associação Saber Psicanalítico (ASP) • CNPJ: 44.966.907/0001-85
              </p>
              <p className="text-[10px] text-slate-500">
                Caruaru – PE | Brasil • www.revistasaberpsicanalitico.com.br
              </p>
            </div>
            <img 
              src="/logo-asp.png" 
              alt="Associação Saber Psicanalítico" 
              className="h-16 sm:h-20 object-contain" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
          </div>

          {/* TÍTULO DO DOCUMENTO */}
          <div className="text-center my-10">
            <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 tracking-wider uppercase">
              {isAceite && 'DECLARAÇÃO DE ACEITE PARA PUBLICAÇÃO'}
              {isRecusa && 'COMUNICAÇÃO EDITORIAL / PARECER FINAL'}
              {isLattes && 'DECLARAÇÃO DE ATUAÇÃO COMO PARECERISTA AD-HOC'}
            </h3>
          </div>

          {/* TEXTO CERTIFICADO DO DOCUMENTO */}
          <div className="text-sm leading-relaxed text-justify space-y-6 text-slate-800 font-serif">
            {isAceite && (
              <>
                <p>
                  Declaramos, para os devidos fins e efeitos de comprovação acadêmica e curricular, que o artigo científico intitulado <strong>"{article?.title}"</strong>, de autoria de <strong>{authName}</strong>, com filiação institucional vinculada a <strong>{authInst}</strong>{(article?.coauthors && article.coauthors.length > 0) ? ` e coautoria de ${article.coauthors.map((c: any) => c.name).join(', ')}` : ''}, foi submetido, avaliado e <strong>ACEITO PARA PUBLICAÇÃO</strong> na <strong>Revista Saber Psicanalítico (ISSN: 3086-8416)</strong>.
                </p>
                <p>
                  O manuscrito obteve parecer favorável da Comissão Editorial após ter sido criteriosamente submetido ao sistema de avaliação duplo-cega por pares (<em>double-blind peer review</em>), atendendo plenamente aos critérios de originalidade, consistência teórico-clínica metapsicológica e padrões éticos de publicação científica (COPE).
                </p>
                <p>
                  A publicação oficial do referido trabalho está programada para integrar o <strong>{issueName}</strong> deste periódico.
                </p>
              </>
            )}

            {isRecusa && (
              <>
                <p>
                  Comunicamos, para os devidos fins, que o manuscrito intitulado <strong>"{article?.title}"</strong>, de autoria de <strong>{authName}</strong> ({authInst}), submetido à apreciação da <strong>Revista Saber Psicanalítico (ISSN: 3086-8416)</strong>, concluiu todas as etapas regimentais de triagem e avaliação por pares (<em>peer review</em>).
                </p>
                <p>
                  Após a análise dos pareceres emitidos pelo corpo de avaliadores ad-hoc e as deliberações da Comissão Editorial, informamos que o trabalho <strong>NÃO FOI ACEITO PARA PUBLICAÇÃO</strong> no presente ciclo editorial deste periódico.
                </p>
                {article?.rejection_reason && (
                  <p className="bg-slate-50 p-4 rounded border border-slate-200 text-xs italic font-sans text-slate-700">
                    <strong>Parecer / Justificativa Editorial:</strong> {article.rejection_reason}
                  </p>
                )}
                <p>
                  Agradecemos a valiosa contribuição ao submeter sua pesquisa à Revista Saber Psicanalítico e encorajamos a submissão de futuras investigações científicas.
                </p>
              </>
            )}

            {isLattes && (
              <>
                <p>
                  Declaramos, para fins de comprovação curricular e acadêmica, em especial perante a <strong>Plataforma Lattes do CNPq</strong>, que o(a) <strong>Prof.(a) {reviewer?.full_name || 'Parecerista'}</strong>, com filiação institucional vinculada a <strong>{reviewer?.institution || 'Associação Saber Psicanalítico'}</strong>, atuou formalmente como <strong>PARECERISTA AD-HOC</strong> da <strong>Revista Saber Psicanalítico (ISSN: 3086-8416)</strong>, periódico científico semestral mantido pela Associação Saber Psicanalítico (ASP).
                </p>
                <p>
                  O(A) pesquisador(a) emitiu parecer avaliativo de mérito técnico-científico circunstanciado no âmbito do sistema de avaliação duplo-cega por pares (<em>double-blind peer review</em>), analisando os critérios de rigor metodológico, pertinência conceitual psicanalítica e relevância clínica da produção acadêmica designada.
                </p>
                <p>
                  Por ser a mais pura expressão da verdade e reconhecendo a fundamental colaboração dispensada à preservação da excelência científica desta revista, firmamos a presente declaração.
                </p>
              </>
            )}

            <p className="text-right text-xs pt-4 font-sans text-slate-700">
              Caruaru – PE, {docDate}.
            </p>
          </div>
        </div>

        {/* ASSINATURA SEM LINHA E CÓDIGO VERIFICADOR EXCLUSIVAMENTE ABAIXO */}
        <div className="pt-10">
          <div className="text-center flex flex-col items-center justify-center my-6">
            <p className="font-serif italic text-lg sm:text-xl text-slate-800 tracking-wide">
              Dr. Edson Leandro de Almeida
            </p>
            <p className="font-bold text-slate-900 text-xs sm:text-sm mt-1">
              Dr. Edson Leandro de Almeida
            </p>
            <p className="text-xs text-indigo-900 font-semibold">
              Editor-Chefe • Revista Saber Psicanalítico
            </p>
            <p className="text-[11px] text-slate-600">
              Associação Saber Psicanalítico (ASP)
            </p>
          </div>

          <div className="pt-6 border-t border-slate-200 text-center space-y-1.5 text-[10px] text-slate-500 font-sans">
            <p className="font-mono text-slate-800 font-bold tracking-wider">
              Código de Autenticação Digital: {docCode}
            </p>
            <p className="text-slate-400">
              A autenticidade deste documento timbrado pode ser validada eletronicamente no portal oficial (https://revista-saber-portal.vercel.app) utilizando o código verificador acima.
            </p>
            <p className="text-slate-400">
              Associação Saber Psicanalítico (ASP) • CNPJ: 44.966.907/0001-85 • Rua Visconde de Inhaúma, 1361, sala 408 — Caruaru/PE
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL (HOME)
// ============================================================================
export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'author' | 'reviewer' | 'editor' | 'council'>('author')
  const [loading, setLoading] = useState(true)

  const [showSpamNotice, setShowSpamNotice] = useState(true)

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

  // Dados
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [allProfiles, setAllProfiles] = useState<any[]>([])
  const [allReviews, setAllReviews] = useState<any[]>([])

  // Filtros
  const [editorSearch, setEditorSearch] = useState('')
  const [editorStatusFilter, setEditorStatusFilter] = useState('todos')

  // Verificador Público
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyCodeInput, setVerifyCodeInput] = useState('')
  const [verifyResult, setVerifyResult] = useState<any>(null)
  const [checkingCode, setCheckingCode] = useState(false)

  // Meu Perfil
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileInst, setProfileInst] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileLattes, setProfileLattes] = useState('')
  const [profileOrcid, setProfileOrcid] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Submissão do Autor
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

  // Parecer Completo com Critérios
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
            type: 'Declaração de Aceite para Publicação',
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
            type: 'Comunicação de Não Aceite',
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

  const getAuthorName = (authorId: string) => allProfiles.find((x) => x.id === authorId)?.full_name || 'Autor da Revista'
  const getAuthorEmail = (authorId: string) => allProfiles.find((x) => x.id === authorId)?.email || ''
  const getAuthorInst = (authorId: string) => allProfiles.find((x) => x.id === authorId)?.institution || '-'
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
    if (userToDelete.id === session?.user?.id) {
      alert('Você não pode excluir seu próprio perfil!')
      return
    }
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
      alert('Link oficial de redefinição enviado!')
      setShowForgotModal(false)
      setForgotEmail('')
    } catch (err: any) {
      alert(`Erro: ${err.message}`)
    } finally {
      setForgotLoading(false)
    }
  }

  const handleExportBackup = () => {
    if (allArticles.length === 0) return alert('Sem dados para exportação.')
    const headers = ['ID', 'Titulo', 'Secao', 'Status', 'Data', 'Fasciculo', 'Autor', 'Email', 'Filiacao', 'ORCID', 'Lattes', 'Coautores', 'Pareceres', 'Justificativa']
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
  }

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !session) return
    if (!termOriginal || !termEthics || !termAnonymous || !termCC || !termAI) {
      alert('Por favor, confirme as 5 declarações éticas.')
      return
    }

    setSubmitting(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const filePath = `artigos/artigo_${session.user.id}_${Date.now()}.${fileExt}`

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
        title: 'Manuscrito Recebido!',
        message: `Confirmamos o recebimento do trabalho "${newTitle}" na Revista Saber Psicanalítico (ISSN 3086-8416).`,
        actionText: 'Acompanhar no Portal',
        actionUrl: 'https://revista-saber-portal.vercel.app',
      })

      sendEmailNotification({
        to: 'revistasaberpsicanalitico@gmail.com',
        subject: 'Novo Manuscrito Submetido - Revista Saber Psicanalítico',
        title: 'Novo Artigo Recebido',
        message: `Novo artigo recebido:\n\n• Título: "${newTitle}"\n• Autor: ${profile?.full_name}`,
        actionText: 'Sala Editorial',
        actionUrl: 'https://revista-saber-portal.vercel.app',
      })

      alert('Artigo submetido com sucesso!')
      setShowSubmitModal(false)
      setNewTitle('')
      setNewTitleEn('')
      setNewAbstract('')
      setNewAbstractEn('')
      setNewKeywords('')
      setNewKeywordsEn('')
      setCoauthors([])
      setSelectedFile(null)
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

      sendEmailNotification({
        to: 'revistasaberpsicanalitico@gmail.com',
        subject: 'Revisão Enviada - Revista Saber Psicanalítico',
        title: 'Revisão de Artigo Recebida',
        message: `O(A) autor(a) ${getAuthorName(reSubmitArticle.author_id)} enviou a versão corrigida de "${reSubmitArticle.title}".`,
        actionText: 'Sala Editorial',
        actionUrl: 'https://revista-saber-portal.vercel.app',
      })

      alert('Versão corrigida enviada!')
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
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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

    try {
      const target = allArticles.find((a) => a.id === articleId)
      const authorEmail = getAuthorEmail(target?.author_id)
      const authorName = getAuthorName(target?.author_id)
      const title = target?.title || 'Seu Artigo'

      const { error } = await supabase.from('articles').update({ status }).eq('id', articleId)
      if (error) throw error

      if (authorEmail) {
        if (status === 'ajustes_iniciais') {
          sendEmailNotification({ to: authorEmail, subject: 'Ajuste Solicitado - Revista Saber Psicanalítico', title: 'Ajuste de Anonimização', message: `Prezado(a) ${authorName}, reenvie o arquivo "${title}" sem marcas de identificação para avaliação por pares.`, actionText: 'Reenviar Arquivo', actionUrl: 'https://revista-saber-portal.vercel.app' })
        } else if (status === 'correcoes_pendentes') {
          sendEmailNotification({ to: authorEmail, subject: 'Correções Solicitadas - Revista Saber Psicanalítico', title: 'Parecer Disponível', message: `Prezado(a) ${authorName}, foram solicitadas correções em "${title}". Veja as orientações no portal.`, actionText: 'Ver Pareceres', actionUrl: 'https://revista-saber-portal.vercel.app' })
        } else if (status === 'aceito') {
          sendEmailNotification({ to: authorEmail, subject: 'Artigo Aceito! - Revista Saber Psicanalítico', title: 'Artigo Aceito para Publicação', message: `Parabéns, ${authorName}! O trabalho "${title}" foi aceito. Emita sua Carta de Aceite no portal.`, actionText: 'Emitir Carta de Aceite', actionUrl: 'https://revista-saber-portal.vercel.app' })
        }
      }

      alert('Status atualizado!')
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleConfirmRejection = async () => {
    if (!rejectionModalArticle || !rejectionReasonText.trim()) return alert('Informe a justificativa.')
    setSavingRejection(true)
    try {
      const emailAut = getAuthorEmail(rejectionModalArticle.author_id)
      const { error } = await supabase.from('articles').update({ status: 'recusado', rejection_reason: rejectionReasonText }).eq('id', rejectionModalArticle.id)
      if (error) throw error

      if (emailAut) {
        sendEmailNotification({ to: emailAut, subject: 'Parecer Editorial - Revista Saber Psicanalítico', title: 'Decisão do Manuscrito', message: `O processo do artigo "${rejectionModalArticle.title}" foi concluído. A Carta de Não Aceite está disponível no portal.`, actionText: 'Acessar Portal', actionUrl: 'https://revista-saber-portal.vercel.app' })
      }
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
        status: 'pendente',
      })
      if (error) throw error
      await supabase.from('articles').update({ status: 'em_avaliacao' }).eq('id', assignModalArticle.id)

      if (revProfile?.email) {
        sendEmailNotification({ to: revProfile.email, subject: 'Convite para Avaliação - Revista Saber Psicanalítico', title: 'Parecer Técnico-Científico', message: `Você foi designado(a) para avaliar "${assignModalArticle.title}". Prazo: ${new Date(assignDeadline + 'T12:00:00').toLocaleDateString('pt-BR')}.`, actionText: 'Área do Parecerista', actionUrl: 'https://revista-saber-portal.vercel.app' })
      }
      alert('Parecerista atribuído com sucesso!')
      setAssignModalArticle(null)
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewModalData) return
    setSubmittingReview(true)
    try {
      let rPath = reviewModalData.review_file_url || null
      if (reviewFile) {
        rPath = `pareceres/parecer_${reviewModalData.id}_${Date.now()}.${reviewFile.name.split('.').pop()}`
        await supabase.storage.from('manuscritos').upload(rPath, reviewFile)
      }
      const fullComments = `--- CRITÉRIOS DE AVALIAÇÃO ---\n• Título, Resumo e Palavras-chave: ${critTitle}\n• Rigor Teórico-Conceitual: ${critTheory}\n• Relevância Psicanalítica: ${critClinical}\n\n--- PARECER CIRCUNSTANCIADO ---\n${commentsAuthor}`
      await supabase.from('reviews').update({
        recommendation,
        comments_for_author: fullComments,
        confidential_comments_editor: commentsEditor,
        review_file_url: rPath,
        status: 'concluido',
      }).eq('id', reviewModalData.id)

      sendEmailNotification({ to: 'revistasaberpsicanalitico@gmail.com', subject: 'Parecer Concluído - Revista Saber Psicanalítico', title: 'Novo Parecer Emitido', message: `O(A) parecerista ${profile?.full_name} concluiu o parecer de "${allArticles.find(a => a.id === reviewModalData.article_id)?.title}".`, actionText: 'Sala Editorial', actionUrl: 'https://revista-saber-portal.vercel.app' })
      alert('Parecer enviado com sucesso!')
      setReviewModalData(null)
      fetchAllData()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const completedReviewers = allProfiles.filter((p) => Array.from(new Set(allReviews.filter((r) => r.status === 'concluido').map((r) => r.reviewer_id))).includes(p.id))

  const handleCopyReviewers = () => {
    const text = completedReviewers.map((r) => `• ${r.full_name} (${r.institution || 'ASP'})`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedThanks(true)
    setTimeout(() => setCopiedThanks(false), 2500)
  }

  const filteredArticles = allArticles.filter((art) => {
    const q = editorSearch.toLowerCase()
    const matchesSearch = art.title.toLowerCase().includes(q) || getAuthorName(art.author_id).toLowerCase().includes(q) || (art.section || '').toLowerCase().includes(q)
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
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome completo (Ex: Fulano de Tal)" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
                <input type="text" required value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Instituição / Universidade" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
              </>
            )}

            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600">Senha</label>
                {isLogin && <button type="button" onClick={() => setShowForgotModal(true)} className="text-[11px] text-indigo-600 hover:underline">Esqueci minha senha</button>}
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg" />
            </div>

            <button type="submit" disabled={authLoading} className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm">
              {authLoading ? 'Processando...' : isLogin ? 'Acessar o Portal' : 'Cadastrar como Autor'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center space-y-4">
            <button type="button" onClick={() => { setShowVerifyModal(true); setVerifyResult(null); setVerifyCodeInput(''); }} className="text-xs text-indigo-700 hover:underline flex items-center gap-1.5 font-semibold">
              <Search className="w-3.5 h-3.5" /> Verificar Autenticidade de Documento
            </button>
            <div className="flex flex-col items-center text-center space-y-1">
              <img src="/logo-asp.png" alt="ASP" className="h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <p className="text-[10px] text-slate-400">Associação Saber Psicanalítico (ASP) • CNPJ: 44.966.907/0001-85</p>
            </div>
          </div>
        </div>

        {showVerifyModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-start border-b pb-2"><h3 className="text-base font-bold text-slate-900">Validar Documento</h3><button onClick={() => setShowVerifyModal(false)}><X className="w-4 h-4" /></button></div>
              <input type="text" value={verifyCodeInput} onChange={(e) => setVerifyCodeInput(e.target.value)} placeholder="Código verificador..." className="w-full px-3 py-2 text-xs border rounded-lg font-mono uppercase" />
              <button type="button" disabled={checkingCode || !verifyCodeInput.trim()} onClick={handleVerifyCode} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">Consultar</button>
              {verifyResult && (
                <div className={`p-3 rounded-lg text-xs ${verifyResult.valid ? 'bg-emerald-50 text-emerald-950' : 'bg-rose-50 text-rose-900'}`}>
                  {verifyResult.valid ? <p className="font-bold">✔ Autêntico: {verifyResult.type} ({verifyResult.person})</p> : <p className="font-bold">Código não encontrado.</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border space-y-4">
              <h3 className="text-base font-bold text-slate-900 text-center">Recuperar Senha</h3>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="seu.email@exemplo.com" className="w-full px-3 py-2 text-xs border rounded-lg" />
                <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowForgotModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancelar</button><button type="submit" disabled={forgotLoading} className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg">Enviar Link</button></div>
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
        {/* BANNER OFICIAL DE AVISO ANTI-SPAM NO TOPO */}
        {showSpamNotice && (
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-amber-50 border-b border-indigo-100 py-2.5 px-4 no-print">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>
                  <strong>Aviso Editorial Importante:</strong> Para garantir o recebimento dos avisos editoriais, prazos e pareceres, marque nossas mensagens como <em>"Não é spam"</em> ou adicione <strong>revistasaberpsicanalitico@gmail.com</strong> aos seus contatos.
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowSpamNotice(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
                title="Dispensar aviso"
              >
                <X className="w-4 h-4" />
              </button>
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
                  <button type="button" onClick={() => setViewMode('author')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'author' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Visão Autor</button>
                </div>
              )}

              {profile?.role === 'reviewer' && (
                <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                  <button type="button" onClick={() => setViewMode('reviewer')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'reviewer' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Avaliações</button>
                  <button type="button" onClick={() => setViewMode('author')} className={`px-2.5 py-1 rounded-md font-medium ${viewMode === 'author' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Meus Trabalhos</button>
                </div>
              )}

              <span className="text-xs text-slate-700 font-medium">Olá, <strong>{profile?.full_name || 'Usuário'}</strong></span>
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
                            {art.status === 'aceito' && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'aceite', article: art })} className="px-3 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-1.5"><Award className="w-4 h-4" /> Carta de Aceite (PDF)</button>}
                            {art.status === 'recusado' && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'recusa', article: art })} className="px-3 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg flex items-center justify-center gap-1.5"><Ban className="w-4 h-4" /> Carta Não Aceite (PDF)</button>}
                            <button type="button" onClick={() => handleDownloadFile(art.file_url, art.title, 'Manuscrito')} className="px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5"><Download className="w-3.5 h-3.5" /> Baixar Manuscrito</button>
                            {canResubmit && <button type="button" onClick={() => { setReSubmitArticle(art); setRevisedFile(null); }} className="px-3 py-2 text-xs font-semibold bg-amber-600 text-white rounded-lg flex items-center justify-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Enviar Arquivo Corrigido</button>}
                          </div>
                        </div>

                        {art.status === 'recusado' && art.rejection_reason && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900"><strong>Considerações do Editor:</strong> {art.rejection_reason}</div>
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
                <p className="text-sm text-slate-500">Avaliação Duplo-Cega (*Blind Peer Review*).</p>
              </div>

              {myReviewAssignments.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400 text-xs">Nenhum manuscrito atribuído no momento.</div>
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
                            {isCompleted && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'lattes', review: rev, article: art, reviewer: profile })} className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Certificado Lattes</button>}
                            {art && <button type="button" onClick={() => handleDownloadFile(art.file_url, art.title, 'Manuscrito_Parecer')} className="px-3 py-1.5 text-xs font-medium border rounded-lg text-slate-700 flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Baixar Word</button>}
                          </div>
                        </div>
                        {art && <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">{art.abstract}</p>}
                        <div className="flex justify-end">
                          <button type="button" onClick={() => { setReviewModalData(rev); setRecommendation(rev.recommendation || 'aceitar'); setCommentsAuthor(rev.comments_for_author || ''); setCommentsEditor(rev.confidential_comments_editor || ''); setReviewFile(null); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">{isCompleted ? 'Editar Parecer' : 'Preencher Parecer'}</button>
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

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <input type="text" value={editorSearch} onChange={(e) => setEditorSearch(e.target.value)} placeholder="Pesquise por título, autor ou seção..." className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                <div className="flex gap-1.5 overflow-x-auto text-xs">
                  {['todos', 'submetido', 'ajustes_iniciais', 'em_avaliacao', 'correcoes_pendentes', 'revisao_submetida', 'aceito', 'recusado'].map((status) => (
                    <button key={status} type="button" onClick={() => setEditorStatusFilter(status)} className={`px-3 py-1.5 rounded-lg font-medium capitalize ${editorStatusFilter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{status.replace('_', ' ')}</button>
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
                              <button 
                                type="button" 
                                onClick={() => { 
                                  setAssignModalArticle(art); 
                                  setSelectedReviewerId(''); 
                                  setAssignDeadline(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); 
                                }} 
                                className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                              >
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
                          {revs.map((r) => (
                            <div key={r.id} className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200">
                              <div>
                                <span className="font-bold text-slate-800">{getReviewerName(r.reviewer_id)}</span>
                                <span className="ml-2 text-indigo-600 font-semibold">[{r.status.toUpperCase()}]</span>
                                {r.status !== 'concluido' && <span className="ml-2">{getDeadlineBadge(r.deadline)}</span>}
                              </div>
                              <div className="flex gap-2">
                                {r.status === 'concluido' && isFullEditor && <button type="button" onClick={() => setActiveOfficialDoc({ type: 'lattes', review: r, article: art, reviewer: allProfiles.find(p => p.id === r.reviewer_id) })} className="text-emerald-700 hover:underline">Certificado Lattes</button>}
                                {r.status === 'concluido' && <button type="button" onClick={() => alert(`PARECER CIRCUNSTANCIADO:\n\n${r.comments_for_author}`)} className="text-indigo-600 hover:underline">Ler Parecer</button>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {isFullEditor && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-800">Quadro de Usuários ({allProfiles.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
                        <tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Função</th><th className="p-3 text-right">Ação</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allProfiles.map((p) => (
                          <tr key={p.id}>
                            <td className="p-3 font-semibold text-slate-900">{p.full_name}</td>
                            <td className="p-3">{p.email}</td>
                            <td className="p-3 capitalize font-bold text-indigo-700">{p.role}</td>
                            <td className="p-3 text-right">
                              <select value={p.role} onChange={(e) => supabase.from('profiles').update({ role: e.target.value }).eq('id', p.id).then(() => fetchAllData())} className="p-1 border border-slate-200 rounded bg-white text-xs">
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

      {/* RODAPÉ OFICIAL AJUSTADO */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <img src="/logo-asp.png" alt="ASP" className="h-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <div>
              <p className="font-bold text-slate-800">Associação Saber Psicanalítico (ASP)</p>
              <p className="text-[11px]">Entidade Mantenedora • CNPJ: 44.966.907/0001-85</p>
            </div>
          </div>
          <div className="text-center md:text-right text-[11px]">
            <p>
              <a 
                href="https://maps.google.com/?q=Rua+Visconde+Inhauma+1361" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline hover:text-indigo-600 font-medium text-slate-700"
              >
                Rua Visconde Inhaúma, 1361
              </a>, sala 408 — Caruaru/PE
            </p>
            <p>revistasaberpsicanalitico@gmail.com</p>
          </div>
        </div>
      </footer>

      {/* MODAIS INTEGRADOS */}
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

      <ResubmitModal
        article={reSubmitArticle}
        onClose={() => setReSubmitArticle(null)}
        onSubmit={handleResubmitArticle}
        onFileChange={(e: any) => setRevisedFile(e.target.files?.[0] || null)}
        submitting={submittingRevision}
      />

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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4">
            <div className="flex justify-between items-start border-b pb-2"><h3 className="text-base font-bold text-slate-900">Meu Perfil</h3><button type="button" onClick={() => setShowProfileModal(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <input type="text" required value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nome Completo *" className="w-full px-3 py-2 text-xs border rounded-lg" />
              <input type="text" required value={profileInst} onChange={(e) => setProfileInst(e.target.value)} placeholder="Filiação Institucional *" className="w-full px-3 py-2 text-xs border rounded-lg" />
              <input type="url" value={profileLattes} onChange={(e) => setProfileLattes(e.target.value)} placeholder="Link do Currículo Lattes" className="w-full px-3 py-2 text-xs border rounded-lg" />
              <input type="text" value={profileOrcid} onChange={(e) => setProfileOrcid(e.target.value)} placeholder="Identificador ORCID" className="w-full px-3 py-2 text-xs border rounded-lg" />
              <input type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="Telefone / WhatsApp" className="w-full px-3 py-2 text-xs border rounded-lg" />
              <div className="flex justify-end gap-2 pt-2 border-t"><button type="button" onClick={() => setShowProfileModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancelar</button><button type="submit" disabled={savingProfile} className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg">{savingProfile ? 'Salvando...' : 'Salvar'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ATRIBUIR PARECERISTA */}
      {assignModalArticle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border space-y-4">
            <h3 className="text-base font-bold text-slate-900">Designar Parecerista</h3>
            <p className="text-xs text-slate-500">Selecione o parecerista cadastrado e determine o prazo para devolução do parecer.</p>
            <select value={selectedReviewerId} onChange={(e) => setSelectedReviewerId(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-lg bg-white">
              <option value="">-- Escolha um parecerista --</option>
              {allProfiles.filter((p) => (p.role === 'reviewer' || p.role === 'editor') && p.id !== assignModalArticle.author_id).map((rev) => (
                <option key={rev.id} value={rev.id}>{rev.full_name} ({rev.role}) - {rev.institution || 'ASP'}</option>
              ))}
            </select>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prazo Limite para Parecer:</label>
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

      {/* MODAL COMPLETO DE PARECER TÉCNICO-CIENTÍFICO */}
      {reviewModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="border-b pb-3 flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">Formulário Oficial de Avaliação</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Parecer Editorial por Pares</h3>
              </div>
              <button type="button" onClick={() => setReviewModalData(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-800">Avaliação por Critérios Metapsicológicos e Científicos:</h4>
              
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Título e Resumo:</label>
                  <select value={critTitle} onChange={(e) => setCritTitle(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border rounded bg-white">
                    <option value="satisfatorio">Satisfatório</option>
                    <option value="necessita_ajustes">Necessita Ajustes</option>
                    <option value="insatisfatorio">Insatisfatório</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Rigor Conceitual:</label>
                  <select value={critTheory} onChange={(e) => setCritTheory(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border rounded bg-white">
                    <option value="consistente">Consistente</option>
                    <option value="regular">Regular</option>
                    <option value="fragil">Frágil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Relevância Psicanalítica:</label>
                  <select value={critClinical} onChange={(e) => setCritClinical(e.target.value)} className="w-full px-2.5 py-1.5 text-xs border rounded bg-white">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Parecer Circunstanciado (enviado ao autor) *</label>
              <textarea required rows={5} value={commentsAuthor} onChange={(e) => setCommentsAuthor(e.target.value)} placeholder="Detalhe as fundamentações teóricas, pontos fortes e recomendações de aprimoramento..." className="w-full px-3 py-2 text-xs border rounded-lg" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Comentários Confidenciais à Editoria (opcional - não visível ao autor)</label>
              <textarea rows={2} value={commentsEditor} onChange={(e) => setCommentsEditor(e.target.value)} placeholder="Observações sigilosas aos editores..." className="w-full px-3 py-2 text-xs border rounded-lg bg-slate-50" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Anexar documento com apontamentos/marcações (.docx ou .doc - opcional):</label>
              <input type="file" accept=".docx,.doc" onChange={(e) => setReviewFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-indigo-50 file:text-indigo-700" />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button type="button" onClick={() => setReviewModalData(null)} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Voltar</button>
              <button type="button" disabled={submittingReview || !commentsAuthor} onClick={handleSubmitReview} className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50">
                {submittingReview ? 'Enviando Parecer...' : 'Concluir e Enviar Parecer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGRADECIMENTO PARECERISTAS */}
      {showReviewerThankModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Quadro de Pareceristas que Concluíram Avaliações</h3>
            <p className="text-xs text-slate-500">Relação de pareceristas que emitiram avaliações no sistema para compor o expediente e agradecimentos da revista.</p>
            <div className="bg-slate-50 p-4 rounded-xl border max-h-60 overflow-y-auto space-y-2 text-xs">
              {completedReviewers.map((rev) => (
                <div key={rev.id} className="bg-white p-2.5 rounded border"><p className="font-bold text-slate-900">{rev.full_name} ({rev.institution || 'ASP'})</p></div>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowReviewerThankModal(false)} className="px-4 py-2 text-xs text-slate-600">Fechar</button><button type="button" onClick={handleCopyReviewers} className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg">{copiedThanks ? 'Copiado!' : 'Copiar Relação'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
