'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen, ArrowUp, ArrowDown, Printer, Copy, Check, CheckCircle2,
  AlertTriangle, AlertCircle, FileText, Users, Sparkles, X
} from 'lucide-react'

interface CompositorFasciculoTabProps {
  articles: any[]
  profiles: any[]
  reviews: any[]
  getAuthorName: (authorId: string, art?: any) => string
  getAuthorEmail: (authorId: string, art?: any) => string
  getAuthorInst: (authorId: string, art?: any) => string
  getArticleIssue: (art: any) => string
}

interface OrderedItem {
  id: string
  included: boolean
  startPage: string
}

const sectionPriority: Record<string, number> = {
  'Artigos Científicos': 1,
  'Ensaios Teóricos': 2,
  'Relatos de Experiência Clínica': 3,
  'Resenhas': 4
}

const isAspInstitution = (inst?: string) => {
  const s = (inst || '').toLowerCase()
  return (
    s.includes('associação saber') ||
    s.includes('associacao saber') ||
    s.includes('saber psicanalítico') ||
    s.includes('saber psicanalitico') ||
    /\basp\b/.test(s)
  )
}

export default function CompositorFasciculoTab({
  articles,
  profiles,
  reviews,
  getAuthorName,
  getAuthorEmail,
  getAuthorInst,
  getArticleIssue
}: CompositorFasciculoTabProps) {
  const acceptedArticles = articles.filter((a) => a.status === 'aceito')

  const uniqueIssues = Array.from(
    new Set(acceptedArticles.map((a) => getArticleIssue(a)))
  )

  const [selectedIssueFilter, setSelectedIssueFilter] = useState<string>('todos')
  const [issueTitle, setIssueTitle] = useState<string>('v. 2, n. 1 — Fascículo de Junho de 2026')
  const [issueSubtitle, setIssueSubtitle] = useState<string>('Publicação Semestral • Fluxo Contínuo')
  const [includeEditorial, setIncludeEditorial] = useState<boolean>(true)
  const [editorialTitle, setEditorialTitle] = useState<string>('Editorial')
  const [editorialAuthor, setEditorialAuthor] = useState<string>('Dr. Edson Leandro de Almeida')
  const [editorialPage, setEditorialPage] = useState<string>('05')
  const [orderedItems, setOrderedItems] = useState<OrderedItem[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false)

  useEffect(() => {
    const filtered = acceptedArticles.filter((a) =>
      selectedIssueFilter === 'todos' ? true : getArticleIssue(a) === selectedIssueFilter
    )

    const sorted = [...filtered].sort((a, b) => {
      const pa = sectionPriority[a.section || 'Artigos Científicos'] || 99
      const pb = sectionPriority[b.section || 'Artigos Científicos'] || 99
      if (pa !== pb) return pa - pb
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    })

    setOrderedItems(
      sorted.map((art) => ({
        id: art.id,
        included: true,
        startPage: ''
      }))
    )

    if (selectedIssueFilter !== 'todos') {
      setIssueTitle(selectedIssueFilter)
    }
  }, [selectedIssueFilter, articles])

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= orderedItems.length) return
    const copy = [...orderedItems]
    const temp = copy[index]
    copy[index] = copy[newIndex]
    copy[newIndex] = temp
    setOrderedItems(copy)
  }

  const toggleInclude = (id: string) => {
    setOrderedItems(
      orderedItems.map((item) =>
        item.id === id ? { ...item, included: !item.included } : item
      )
    )
  }

  const updateStartPage = (id: string, value: string) => {
    setOrderedItems(
      orderedItems.map((item) =>
        item.id === id ? { ...item, startPage: value } : item
      )
    )
  }

  const sortBySection = () => {
    const copy = [...orderedItems].sort((ia, ib) => {
      const a = acceptedArticles.find((x) => x.id === ia.id)
      const b = acceptedArticles.find((x) => x.id === ib.id)
      const pa = sectionPriority[a?.section || 'Artigos Científicos'] || 99
      const pb = sectionPriority[b?.section || 'Artigos Científicos'] || 99
      return pa - pb
    })
    setOrderedItems(copy)
  }

  const includedEntries = orderedItems
    .filter((item) => item.included)
    .map((item) => ({
      item,
      article: acceptedArticles.find((a) => a.id === item.id)
    }))
    .filter((entry) => Boolean(entry.article))

  const checkEndogeny = (art: any) => {
    const mainInst = art.author_institution || getAuthorInst(art.author_id, art)
    const coInsts: string[] = Array.isArray(art.coauthors)
      ? art.coauthors.map((c: any) => c.institution || '')
      : []
    const hasAsp = isAspInstitution(mainInst) || coInsts.some((i) => isAspInstitution(i))

    const mainProfile = profiles.find((p) => p.id === art.author_id)
    const coEmails: string[] = Array.isArray(art.coauthors)
      ? art.coauthors.map((c: any) => (c.email || '').trim().toLowerCase()).filter(Boolean)
      : []
    const coProfiles = profiles.filter((p) =>
      coEmails.includes((p.email || '').trim().toLowerCase())
    )
    const editorialRoles = ['editor', 'editor_adjunto', 'council']
    const hasBoard =
      editorialRoles.includes(mainProfile?.role) ||
      coProfiles.some((cp) => editorialRoles.includes(cp.role))

    return { hasAsp, hasBoard }
  }

  const totalIncluded = includedEntries.length
  const aspCount = includedEntries.filter((e) => checkEndogeny(e.article).hasAsp).length
  const boardCount = includedEntries.filter((e) => checkEndogeny(e.article).hasBoard).length
  const aspPct = totalIncluded > 0 ? (aspCount / totalIncluded) * 100 : 0
  const boardPct = totalIncluded > 0 ? (boardCount / totalIncluded) * 100 : 0
  const maxPct = Math.max(aspPct, boardPct)

  const formatAuthorsLine = (art: any) => {
    const mainName = getAuthorName(art.author_id, art)
    const coNames = Array.isArray(art.coauthors)
      ? art.coauthors.map((c: any) => c.name).filter(Boolean)
      : []
    return [mainName, ...coNames].join('; ')
  }

  const groupedSections: { section: string; entries: typeof includedEntries }[] = []
  includedEntries.forEach((entry) => {
    const sec = entry.article.section || 'Artigos Científicos'
    const existing = groupedSections.find((g) => g.section === sec)
    if (existing) existing.entries.push(entry)
    else groupedSections.push({ section: sec, entries: [entry] })
  })

  const buildPlainSumario = () => {
    const lines: string[] = [
      'REVISTA SABER PSICANALÍTICO — ISSN 3086-8416',
      issueTitle,
      issueSubtitle,
      '====================================================',
      'SUMÁRIO',
      ''
    ]

    if (includeEditorial) {
      lines.push('EDITORIAL')
      lines.push(
        `• ${editorialTitle} — ${editorialAuthor}${editorialPage.trim() ? ` ..... p. ${editorialPage.trim()}` : ''}`
      )
      lines.push('')
    }

    groupedSections.forEach((grp) => {
      lines.push(grp.section.toUpperCase())
      grp.entries.forEach(({ item, article }) => {
        const pg = item.startPage.trim() ? ` ..... p. ${item.startPage.trim()}` : ''
        lines.push(`• ${article.title}${pg}`)
        lines.push(`  Autores: ${formatAuthorsLine(article)}`)
      })
      lines.push('')
    })

    lines.push('Entidade Mantenedora: Associação Saber Psicanalítico (ASP) • CNPJ: 44.966.907/0001-85')
    lines.push('Contato: revista@asppsicanalise.com.br • www.asppsicanalise.com.br')
    return lines.join('\n')
  }

  const buildMetadataBooklet = () => {
    const blocks: string[] = [
      `CADERNO DE METADADOS E DIAGRAMAÇÃO — ${issueTitle.toUpperCase()}`,
      `Revista Saber Psicanalítico (ISSN 3086-8416)`,
      `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      '====================================================================',
      ''
    ]

    includedEntries.forEach(({ item, article }, idx) => {
      const receivedDate = new Date(article.created_at).toLocaleDateString('pt-BR')
      const acceptedDate = new Date(article.updated_at || article.created_at).toLocaleDateString('pt-BR')
      const mainName = getAuthorName(article.author_id, article)
      const mainEmail = getAuthorEmail(article.author_id, article)
      const mainInst = article.author_institution || getAuthorInst(article.author_id, article)
      const isReview = article.section === 'Resenhas'

      blocks.push(`[${idx + 1}] SEÇÃO: ${article.section || 'Artigos Científicos'}${item.startPage ? ` | PÁGINA INICIAL: ${item.startPage}` : ''}`)
      if (article.thematic_axis) blocks.push(`EIXO TEMÁTICO: ${article.thematic_axis}`)
      blocks.push(`DATAS PARA O PDF: Recebido em: ${receivedDate} | Aprovado em: ${acceptedDate}`)
      blocks.push(`TÍTULO (PT): ${article.title}`)
      if (!isReview && article.title_en) blocks.push(`TITLE (EN): ${article.title_en}`)
      blocks.push('')
      blocks.push(`AUTOR PRINCIPAL: ${mainName}`)
      blocks.push(`Filiação: ${mainInst}${mainEmail ? ` | E-mail: ${mainEmail}` : ''}${article.author_orcid ? ` | ORCID: ${article.author_orcid}` : ''}${article.author_lattes ? ` | Lattes: ${article.author_lattes}` : ''}`)
      if (article.author_bio) blocks.push(`Nota Biográfica: ${article.author_bio}`)

      if (Array.isArray(article.coauthors) && article.coauthors.length > 0) {
        article.coauthors.forEach((co: any, cIdx: number) => {
          blocks.push(`COAUTOR ${cIdx + 1}: ${co.name} (${co.institution || '-'})${co.email ? ` | E-mail: ${co.email}` : ''}${co.orcid ? ` | ORCID: ${co.orcid}` : ''}${co.lattes ? ` | Lattes: ${co.lattes}` : ''}`)
          if (co.bio) blocks.push(`Nota Biográfica: ${co.bio}`)
        })
      }

      blocks.push('')
      blocks.push(isReview ? `REFERÊNCIA DA OBRA RESENHADA:\n${article.abstract}` : `RESUMO:\n${article.abstract}`)
      if (!isReview && article.keywords) blocks.push(`Palavras-chave: ${article.keywords}`)
      if (!isReview && article.abstract_en) blocks.push(`\nABSTRACT:\n${article.abstract_en}`)
      if (!isReview && article.keywords_en) blocks.push(`Keywords: ${article.keywords_en}`)
      blocks.push('\n--------------------------------------------------------------------\n')
    })

    return blocks.join('\n')
  }

  const completedReviewerIds = Array.from(
    new Set(reviews.filter((r) => r.status === 'concluido').map((r) => r.reviewer_id))
  )
  const completedReviewersList = profiles.filter((p) => completedReviewerIds.includes(p.id))

  const buildReviewersExpediente = () => {
    if (completedReviewersList.length === 0) {
      return 'Nenhum parecer concluído registrado até o momento.'
    }
    const lines = [
      `PARECERISTAS AD-HOC COLABORADORES — ${issueTitle.toUpperCase()}`,
      'A Revista Saber Psicanalítico (ISSN 3086-8416) agradece aos(às) pareceristas ad-hoc que contribuíram com avaliações duplo-cegas:',
      ''
    ]
    completedReviewersList.forEach((rev) => {
      const orcidTxt = rev.orcid ? ` | ORCID: ${rev.orcid}` : ''
      lines.push(`• ${rev.full_name} — ${rev.institution || 'ASP'}${orcidTxt}`)
    })
    return lines.join('\n')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200 uppercase">
            Fechamento de Edição Semestral
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Compositor de Fascículo e Sumário Oficial
          </h3>
          <p className="text-xs text-slate-500">
            Selecione os artigos aprovados, defina a ordem de leitura e gere o Sumário Oficial e os metadados de diagramação.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={totalIncluded === 0}
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" /> Visualizar / PDF do Sumário
          </button>

          <button
            type="button"
            disabled={totalIncluded === 0}
            onClick={() => handleCopy('sumario', buildPlainSumario())}
            className="px-3 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
          >
            {copiedKey === 'sumario' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'sumario' ? 'Sumário Copiado!' : 'Copiar Sumário (Word)'}
          </button>

          <button
            type="button"
            disabled={totalIncluded === 0}
            onClick={() => handleCopy('meta', buildMetadataBooklet())}
            className="px-3 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
          >
            {copiedKey === 'meta' ? <Check className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
            {copiedKey === 'meta' ? 'Metadados Copiados!' : 'Copiar Notas e Metadados'}
          </button>

          <button
            type="button"
            onClick={() => handleCopy('exp', buildReviewersExpediente())}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg flex items-center gap-1.5"
          >
            {copiedKey === 'exp' ? <Check className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            {copiedKey === 'exp' ? 'Expediente Copiado!' : 'Copiar Expediente Pareceristas'}
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Filtrar Aceitos por Fascículo:</label>
            <select
              value={selectedIssueFilter}
              onChange={(e) => setSelectedIssueFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white font-medium"
            >
              <option value="todos">Todos os Artigos Aceitos ({acceptedArticles.length})</option>
              {uniqueIssues.map((iss) => (
                <option key={iss} value={iss}>{iss}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Título da Edição (no Sumário):</label>
            <input
              type="text"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Subtítulo / Periodicidade:</label>
            <input
              type="text"
              value={issueSubtitle}
              onChange={(e) => setIssueSubtitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center gap-3 text-xs">
          <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={includeEditorial}
              onChange={(e) => setIncludeEditorial(e.target.checked)}
              className="rounded text-indigo-600"
            />
            Incluir Editorial na abertura:
          </label>
          {includeEditorial && (
            <div className="grid sm:grid-cols-3 gap-2 flex-1">
              <input
                type="text"
                value={editorialTitle}
                onChange={(e) => setEditorialTitle(e.target.value)}
                placeholder="Título do Editorial"
                className="px-2.5 py-1.5 border rounded bg-white"
              />
              <input
                type="text"
                value={editorialAuthor}
                onChange={(e) => setEditorialAuthor(e.target.value)}
                placeholder="Autor do Editorial"
                className="px-2.5 py-1.5 border rounded bg-white"
              />
              <input
                type="text"
                value={editorialPage}
                onChange={(e) => setEditorialPage(e.target.value)}
                placeholder="Pág. inicial (opcional)"
                className="px-2.5 py-1.5 border rounded bg-white"
              />
            </div>
          )}
        </div>
      </div>

      <div className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
        totalIncluded === 0
          ? 'bg-slate-50 border-slate-200 text-slate-600'
          : maxPct <= 20
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : maxPct <= 25
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
      }`}>
        <div className="flex items-center gap-2">
          {totalIncluded === 0 ? (
            <Sparkles className="w-4 h-4 text-slate-500 flex-shrink-0" />
          ) : maxPct <= 20 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : maxPct <= 25 ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span>
            <strong>Conferência de Endogenia deste Fascículo ({totalIncluded} textos selecionados):</strong>{' '}
            Vínculo ASP: <strong>{aspPct.toFixed(1)}%</strong> ({aspCount}/{totalIncluded}) •
            Corpo Editorial: <strong>{boardPct.toFixed(1)}%</strong> ({boardCount}/{totalIncluded})
          </span>
        </div>
        <span className="font-bold whitespace-nowrap">
          {totalIncluded === 0
            ? 'Selecione textos abaixo'
            : maxPct <= 20
              ? '🟢 Padrão CAPES / DOAJ OK'
              : maxPct <= 25
                ? '🟡 No limite (20%–25%)'
                : '🔴 Acima de 25%!'}
        </span>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Sequência de Leitura dos Trabalhos ({orderedItems.length})
            </h4>
            <p className="text-xs text-slate-500">
              Use as setas para definir a ordem no sumário e preencha a página inicial após diagramar o PDF (opcional).
            </p>
          </div>
          <button
            type="button"
            onClick={sortBySection}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
          >
            Agrupar por Seção Padrão
          </button>
        </div>

        {orderedItems.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            Nenhum manuscrito com status <strong>Aceito</strong> encontrado neste filtro.
          </div>
        ) : (
          <div className="space-y-2.5">
            {orderedItems.map((item, idx) => {
              const art = acceptedArticles.find((a) => a.id === item.id)
              if (!art) return null
              const end = checkEndogeny(art)

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition ${
                    item.included ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={item.included}
                      onChange={() => toggleInclude(item.id)}
                      className="mt-1 rounded text-indigo-600"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-100">
                          {art.section || 'Artigos Científicos'}
                        </span>
                        <span className="text-[10.5px] text-slate-500 font-medium">
                          {getArticleIssue(art)}
                        </span>
                        {end.hasAsp && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Vínculo ASP
                          </span>
                        )}
                        {end.hasBoard && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                            Conselho/Editoria
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900">{art.title}</p>
                      <p className="text-xs text-slate-500">{formatAuthorsLine(art)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500">Pág.:</span>
                      <input
                        type="text"
                        value={item.startPage}
                        onChange={(e) => updateStartPage(item.id, e.target.value)}
                        placeholder="ex: 12"
                        className="w-16 px-2 py-1 text-xs border rounded text-center"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                      className="p-1.5 border rounded-lg hover:bg-slate-100 disabled:opacity-30"
                      title="Subir na ordem"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === orderedItems.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      className="p-1.5 border rounded-lg hover:bg-slate-100 disabled:opacity-30"
                      title="Descer na ordem"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-[95] overflow-y-auto flex flex-col items-center p-3 sm:p-6">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #sumario-print-area, #sumario-print-area * { visibility: visible !important; }
              #sumario-print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                padding: 36px !important;
              }
            }
          `}</style>

          <div className="w-full max-w-[800px] flex justify-between items-center mb-4 bg-slate-800 text-white px-4 py-2.5 rounded-xl shadow-lg">
            <span className="text-xs font-semibold text-slate-200">Pré-visualização do Sumário Oficial (Formato A4)</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir / Salvar em PDF
              </button>
              <button type="button" onClick={() => setShowPrintModal(false)} className="p-1.5 text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            id="sumario-print-area"
            className="bg-white w-full max-w-[800px] min-h-[1060px] p-12 sm:p-16 shadow-2xl rounded-sm flex flex-col justify-between text-slate-800 border border-slate-200"
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 gap-6">
                <img
                  src="/logo-revista.png"
                  alt="Revista Saber Psicanalítico"
                  className="h-32 sm:h-36 w-auto object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <div className="text-right space-y-1">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">Revista Saber Psicanalítico</h2>
                  <p className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">ISSN 3086-8416</p>
                  <p className="text-xs font-semibold text-slate-700">{issueTitle}</p>
                  <p className="text-[11px] text-slate-500">{issueSubtitle}</p>
                  <p className="text-[11px] text-slate-400">revista@asppsicanalise.com.br</p>
                </div>
              </div>

              <div className="text-center my-7">
                <h3 className="text-lg font-serif font-bold text-slate-900 tracking-widest uppercase">
                  SUMÁRIO
                </h3>
              </div>

              <div className="space-y-6 font-serif text-slate-800">
                {includeEditorial && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-sans font-extrabold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1">
                      Editorial
                    </h4>
                    <div className="flex justify-between items-baseline gap-4 text-[13px]">
                      <div>
                        <p className="font-bold text-slate-900">{editorialTitle}</p>
                        <p className="text-xs text-slate-600 italic">{editorialAuthor}</p>
                      </div>
                      {editorialPage.trim() && (
                        <span className="text-xs font-sans font-bold text-slate-700 flex-shrink-0">
                          p. {editorialPage.trim()}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {groupedSections.map((grp) => (
                  <div key={grp.section} className="space-y-2.5">
                    <h4 className="text-xs font-sans font-extrabold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-1">
                      {grp.section}
                    </h4>
                    <div className="space-y-3">
                      {grp.entries.map(({ item, article }) => (
                        <div key={article.id} className="flex justify-between items-baseline gap-4 text-[13px]">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 leading-snug">{article.title}</p>
                            <p className="text-xs text-slate-600 italic">{formatAuthorsLine(article)}</p>
                          </div>
                          {item.startPage.trim() && (
                            <span className="text-xs font-sans font-bold text-slate-700 flex-shrink-0">
                              p. {item.startPage.trim()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-sans">
              <div className="flex items-center gap-3">
                <img src="/logo-asp.png" alt="ASP" className="h-8 object-contain opacity-80" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                <div>
                  <p className="font-bold text-slate-700 text-[11px]">Associação Saber Psicanalítico (ASP)</p>
                  <p>Entidade Mantenedora • CNPJ: 44.966.907/0001-85</p>
                </div>
              </div>
              <div className="text-center sm:text-right space-y-0.5">
                <p>Rua Visconde de Inhaúma, 1361, sala 408 — Caruaru/PE</p>
                <p>www.asppsicanalise.com.br • revista@asppsicanalise.com.br</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
