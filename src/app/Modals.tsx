'use client'

import React from 'react'
import { 
  X, Upload, Plus, Trash2, Calendar, Clock, AlertTriangle, 
  AlertCircle, CheckCircle2, HelpCircle, ShieldAlert, Award, 
  Printer, Ban, KeyRound, Search, Send
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
            <p className="text-xs text-slate-500 mt-1">Preencha os campos com atenção conforme as orientações.</p>
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
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Filiação Institucional *</label>
                <input
                  type="text"
                  required
                  value={authorInstitution}
                  onChange={(e) => setAuthorInstitution(e.target.value)}
                  placeholder="Ex: Associação Saber Psicanalítico / Universidade"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Link do Lattes (Opcional)</label>
                <input
                  type="url"
                  value={authorLattes}
                  onChange={(e) => setAuthorLattes(e.target.value)}
                  placeholder="http://lattes.cnpq.br/..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ORCID (Opcional)</label>
                <input
                  type="text"
                  value={authorOrcid}
                  onChange={(e) => setAuthorOrcid(e.target.value)}
                  placeholder="0000-0000-0000-0000"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minibiografia / Titulação (Opcional)</label>
              <input
                type="text"
                value={authorBio}
                onChange={(e) => setAuthorBio(e.target.value)}
                placeholder="Ex: Psicanalista, Membro da Associação Saber Psicanalítico."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Coautores ({coauthors.length})</h4>
              <button
                type="button"
                onClick={onAddCoauthor}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Coautor
              </button>
            </div>

            {coauthors.map((c: any, idx: number) => (
              <div key={idx} className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3 relative">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-700">Coautor #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveCoauthor(idx)}
                    className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remover
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={c.name}
                    onChange={(e) => onUpdateCoauthor(idx, 'name', e.target.value)}
                    placeholder="Nome completo *"
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                  />
                  <input
                    type="email"
                    required
                    value={c.email}
                    onChange={(e) => onUpdateCoauthor(idx, 'email', e.target.value)}
                    placeholder="E-mail *"
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                  />
                  <input
                    type="text"
                    required
                    value={c.institution}
                    onChange={(e) => onUpdateCoauthor(idx, 'institution', e.target.value)}
                    placeholder="Filiação Institucional *"
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                  />
                  <input
                    type="url"
                    value={c.lattes}
                    onChange={(e) => onUpdateCoauthor(idx, 'lattes', e.target.value)}
                    placeholder="Link do Lattes (Opcional)"
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                  />
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={c.orcid}
                      onChange={(e) => onUpdateCoauthor(idx, 'orcid', e.target.value)}
                      placeholder="ORCID (Opcional)"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título do Artigo (Português) *"
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                required
                value={newTitleEn}
                onChange={(e) => setNewTitleEn(e.target.value)}
                placeholder="Title (Título em Inglês) *"
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <textarea
              required
              rows={4}
              value={newAbstract}
              onChange={(e) => setNewAbstract(e.target.value)}
              placeholder="Resumo em Português (150 a 250 palavras) *"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              required
              rows={4}
              value={newAbstractEn}
              onChange={(e) => setNewAbstractEn(e.target.value)}
              placeholder="Abstract (Resumo em Inglês) *"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                value={newKeywords}
                onChange={(e) => setNewKeywords(e.target.value)}
                placeholder="Palavras-chave (separadas por ponto e vírgula) *"
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                required
                value={newKeywordsEn}
                onChange={(e) => setNewKeywordsEn(e.target.value)}
                placeholder="Keywords in English *"
                className="px-3 py-2 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Arquivo do Manuscrito Completo (.docx - Word Obrigatório) *
            </label>
            <p className="text-[11px] text-slate-500">
              O arquivo deve estar <strong>COMPLETO</strong> (Título, Resumo, Abstract, Texto, Referências), porém <strong>sem identificação dos autores</strong> no corpo do texto ou nas propriedades do arquivo.
            </p>
            <input
              type="file"
              required
              accept=".docx,.doc"
              onChange={onFileChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-700">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={termOriginal} onChange={(e) => setTermOriginal(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Ineditismo e Autoria:</strong> Declaro que este manuscrito é original e não está sob avaliação em outro periódico.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={termEthics} onChange={(e) => setTermEthics(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Sigilo Clínico:</strong> Declaro que quaisquer dados clínicos foram devidamente descaracterizados, respeitando o sigilo ético absoluto.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={termAnonymous} onChange={(e) => setTermAnonymous(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Anonimização:</strong> Confirmo que retirei do arquivo Word qualquer menção ao nome dos autores ou dados biográficos.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={termCC} onChange={(e) => setTermCC(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Acesso Aberto (CC-BY 4.0):</strong> Concordo com a publicação sob a licença Creative Commons CC-BY 4.0, mantendo os direitos autorais morais.</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={termAI} onChange={(e) => setTermAI(e.target.checked)} className="mt-0.5 rounded text-indigo-600" />
              <span><strong>Uso de IA (COPE/SciELO):</strong> Declaro que IA generativa não foi utilizada para produção de conteúdo teórico-clínico substancial.</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
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
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Orientações para o reenvio:
          </p>
          <p>
            Anexe o arquivo Word (.docx) revisado contemplando as correções solicitadas. Ao enviar, o manuscrito será encaminhado diretamente ao Editor Geral para avaliação e decisão final.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Arquivo Word Corrigido (.docx) *</label>
            <input
              type="file"
              required
              accept=".docx,.doc"
              onChange={onFileChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Enviando Revisão...' : 'Confirmar Envio da Versão Corrigida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
