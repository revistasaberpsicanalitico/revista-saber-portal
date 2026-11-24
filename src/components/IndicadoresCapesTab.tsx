'use client'

import React, { useState } from 'react'
import {
  BarChart3, Clock, CheckCircle2, AlertTriangle, AlertCircle,
  ShieldCheck, Copy, Check, ExternalLink, FileSearch, Users, BookOpen, Award
} from 'lucide-react'

interface IndicadoresCapesTabProps {
  articles: any[]
  reviews: any[]
  profiles: any[]
  getAuthorName: (authorId: string, art?: any) => string
  getAuthorInst: (authorId: string, art?: any) => string
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

const daysBetween = (start?: string, end?: string) => {
  if (!start || !end) return null
  const t1 = new Date(start).getTime()
  const t2 = new Date(end).getTime()
  if (isNaN(t1) || isNaN(t2)) return null
  return Math.max(0, Math.round((t2 - t1) / (1000 * 60 * 60 * 24)))
}

export default function IndicadoresCapesTab({
  articles,
  reviews,
  profiles,
  getAuthorName,
  getAuthorInst
}: IndicadoresCapesTabProps) {
  const [selectedYear, setSelectedYear] = useState<string>('todos')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  // Anos disponíveis nas submissões
  const availableYears = Array.from(
    new Set(
      articles
        .map((a) => new Date(a.created_at).getFullYear())
        .filter((y) => !isNaN(y))
        .map((y) => String(y))
    )
  ).sort((a, b) => Number(b) - Number(a))

  const filteredArticles = articles.filter((a) => {
    if (selectedYear === 'todos') return true
    return String(new Date(a.created_at).getFullYear()) === selectedYear
  })

  const filteredArticleIds = new Set(filteredArticles.map((a) => a.id))
  const filteredReviews = reviews.filter((r) => filteredArticleIds.has(r.article_id))

  // Totais de fluxo
  const totalSubmissions = filteredArticles.length
  const acceptedArticles = filteredArticles.filter((a) => a.status === 'aceito')
  const rejectedArticles = filteredArticles.filter((a) => a.status === 'recusado')
  const decidedArticles = [...acceptedArticles, ...rejectedArticles]
  const inProgressCount = totalSubmissions - decidedArticles.length

  const acceptanceRate = decidedArticles.length > 0
    ? ((acceptedArticles.length / decidedArticles.length) * 100).toFixed(1)
    : '0.0'

  const rejectionRate = decidedArticles.length > 0
    ? ((rejectedArticles.length / decidedArticles.length) * 100).toFixed(1)
    : '0.0'

  // Tempo médio até decisão (aceitos + recusados)
  const decisionDurations = decidedArticles
    .map((a) => daysBetween(a.created_at, a.updated_at))
    .filter((d): d is number => d !== null)

  const avgDecisionDays = decisionDurations.length > 0
    ? Math.round(decisionDurations.reduce((acc, v) => acc + v, 0) / decisionDurations.length)
    : null

  // Tempo médio de primeira resposta (inclui correcoes_pendentes e ajustes_iniciais já movimentados)
  const firstResponseArticles = filteredArticles.filter((a) =>
    ['correcoes_pendentes', 'aceito', 'recusado'].includes(a.status)
  )
  const firstResponseDurations = firstResponseArticles
    .map((a) => daysBetween(a.created_at, a.updated_at))
    .filter((d): d is number => d !== null)

  const avgFirstResponseDays = firstResponseDurations.length > 0
    ? Math.round(firstResponseDurations.reduce((acc, v) => acc + v, 0) / firstResponseDurations.length)
    : null

  // Tempo médio dos pareceristas (pareceres concluídos)
  const completedReviews = filteredReviews.filter((r) => r.status === 'concluido')
  const reviewDurations = completedReviews
    .map((r) => daysBetween(r.created_at, r.updated_at))
    .filter((d): d is number => d !== null)

  const avgReviewDays = reviewDurations.length > 0
    ? Math.round(reviewDurations.reduce((acc, v) => acc + v, 0) / reviewDurations.length)
    : null

  // Endogenia Institucional (ASP) e Editorial (Editores / Conselho) nos ARTIGOS ACEITOS
  const checkArticleEndogeny = (art: any) => {
    const mainInst = art.author_institution || getAuthorInst(art.author_id, art)
    const coInsts: string[] = Array.isArray(art.coauthors)
      ? art.coauthors.map((c: any) => c.institution || '')
      : []

    const hasAspLink = isAspInstitution(mainInst) || coInsts.some((inst) => isAspInstitution(inst))

    const mainProfile = profiles.find((p) => p.id === art.author_id)
    const coEmails: string[] = Array.isArray(art.coauthors)
      ? art.coauthors.map((c: any) => (c.email || '').trim().toLowerCase()).filter(Boolean)
      : []
    const coProfiles = profiles.filter((p) =>
      coEmails.includes((p.email || '').trim().toLowerCase())
    )

    const editorialRoles = ['editor', 'editor_adjunto', 'council']
    const hasEditorialBoardAuthor =
      editorialRoles.includes(mainProfile?.role) ||
      coProfiles.some((cp) => editorialRoles.includes(cp.role))

    return { hasAspLink, hasEditorialBoardAuthor, mainInst }
  }

  const aspEndogenousAccepted = acceptedArticles.filter((a) => checkArticleEndogeny(a).hasAspLink)
  const editorialEndogenousAccepted = acceptedArticles.filter((a) => checkArticleEndogeny(a).hasEditorialBoardAuthor)

  const aspEndogenyPct = acceptedArticles.length > 0
    ? (aspEndogenousAccepted.length / acceptedArticles.length) * 100
    : 0

  const editorialEndogenyPct = acceptedArticles.length > 0
    ? (editorialEndogenousAccepted.length / acceptedArticles.length) * 100
    : 0

  const getEndogenyBadge = (pct: number, totalBase: number) => {
    if (totalBase === 0) {
      return {
        color: 'bg-slate-100 text-slate-600 border-slate-200',
        label: 'Sem artigos aceitos no período',
        icon: <Clock className="w-4 h-4 text-slate-500" />
      }
    }
    if (pct <= 20) {
      return {
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'Dentro da meta CAPES (≤ 20%)',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      }
    }
    if (pct <= 25) {
      return {
        color: 'bg-amber-50 text-amber-800 border-amber-300',
        label: 'Atenção: limite CAPES/DOAJ (20%–25%)',
        icon: <AlertTriangle className="w-4 h-4 text-amber-600" />
      }
    }
    return {
      color: 'bg-rose-50 text-rose-800 border-rose-300',
      label: 'Acima do limite recomendado (> 25%)',
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />
    }
  }

  const aspBadge = getEndogenyBadge(aspEndogenyPct, acceptedArticles.length)
  const edBadge = getEndogenyBadge(editorialEndogenyPct, acceptedArticles.length)

  // Distribuição por Seção
  const sectionsList = [
    'Artigos Científicos',
    'Ensaios Teóricos',
    'Relatos de Experiência Clínica',
    'Resenhas'
  ]
  const sectionCounts = sectionsList.map((sec) => ({
    name: sec,
    total: filteredArticles.filter((a) => (a.section || 'Artigos Científicos') === sec).length,
    accepted: acceptedArticles.filter((a) => (a.section || 'Artigos Científicos') === sec).length
  }))

  // Distribuição por Eixo Temático
  const axisCountsMap: Record<string, number> = {}
  filteredArticles.forEach((a) => {
    const ax = a.thematic_axis || 'Não informado'
    axisCountsMap[ax] = (axisCountsMap[ax] || 0) + 1
  })
  const axisEntries = Object.entries(axisCountsMap).sort((a, b) => b[1] - a[1])

  // Textos prontos para copiar
  const periodLabel = selectedYear === 'todos' ? 'Todo o Histórico' : `Ano ${selectedYear}`

  const reportSummaryText = `RELATÓRIO DE INDICADORES EDITORIAIS — REVISTA SABER PSICANALÍTICO (ISSN 3086-8416)
Período analisado: ${periodLabel}
Data da emissão: ${new Date().toLocaleDateString('pt-BR')}

1. FLUXO DE SUBMISSÕES E DECISÕES
• Total de manuscritos submetidos: ${totalSubmissions}
• Processos em tramitação: ${inProgressCount}
• Processos finalizados (aceitos + recusados): ${decidedArticles.length}
• Aceitos para publicação: ${acceptedArticles.length} (${acceptanceRate}% dos finalizados)
• Não aceitos / recusados: ${rejectedArticles.length} (${rejectionRate}% dos finalizados)

2. TEMPOS MÉDIOS DE TRAMITAÇÃO
• Tempo médio até decisão final: ${avgDecisionDays !== null ? `${avgDecisionDays} dias` : 'Sem dados suficientes'}
• Tempo médio até primeira decisão editorial: ${avgFirstResponseDays !== null ? `${avgFirstResponseDays} dias` : 'Sem dados suficientes'}
• Tempo médio de resposta dos pareceristas: ${avgReviewDays !== null ? `${avgReviewDays} dias` : 'Sem dados suficientes'} (${completedReviews.length} pareceres concluídos)

3. CONTROLE DE ENDOGENIA (PARÂMETRO CAPES / DOAJ / LATINDEX)
• Endogenia institucional (autores vinculados à ASP): ${aspEndogenyPct.toFixed(1)}% (${aspEndogenousAccepted.length} de ${acceptedArticles.length} aceitos)
• Endogenia do corpo editorial (editores/conselho): ${editorialEndogenyPct.toFixed(1)}% (${editorialEndogenousAccepted.length} de ${acceptedArticles.length} aceitos)

4. TRIAGEM ANTI-PLÁGIO
• Protocolo adotado: Verificação sistemática de similaridade na etapa de Desk Review via CopySpider antes do encaminhamento aos pareceristas ad-hoc.`

  const publicWixTransparencyText = `TRANSPARÊNCIA EDITORIAL E MÉTRICAS DA REVISTA (${periodLabel})
A Revista Saber Psicanalítico (ISSN 3086-8416), mantida pela Associação Saber Psicanalítico (ASP), adota avaliação duplo-cega por pares (Double-Blind Peer Review) realizada por no mínimo dois pareceristas externos ad-hoc, verificação prévia de similaridade textual via CopySpider na triagem editorial e rigoroso monitoramento de conflitos de interesse e endogenia institucional (mantendo proporção de autoria externa superior a 75%).
• Submissões analisadas no período: ${totalSubmissions}
• Taxa de aceite (sobre decisões concluídas): ${acceptanceRate}% | Taxa de rejeição: ${rejectionRate}%
• Tempo médio entre submissão e decisão final: ${avgDecisionDays !== null ? `${avgDecisionDays} dias` : 'em consolidação'}`

  const msgDevolucaoSimilaridade = `Prezado(a) autor(a),

Na etapa de triagem editorial inicial (Desk Review), o manuscrito submetido apresentou índice de similaridade textual acima do parâmetro adotado pela Revista Saber Psicanalítico, com trechos coincidentes sem a devida indicação bibliográfica ou formatação de citação direta conforme as normas da ABNT.

Solicitamos a revisão cuidadosa das referências, citações diretas e eventuais paráfrases antes de realizar nova submissão pelo portal.`

  const msgDevolucaoAnonimizacao = `Prezado(a) autor(a),

Para assegurar o rigor da avaliação duplo-cega por pares (Double-Blind Peer Review), identificamos elementos no documento enviado (no corpo do texto, rodapé ou propriedades do arquivo Word) que permitem identificar a autoria.

Solicitamos que remova todas as informações de identificação e envie o arquivo devidamente anonimizado utilizando o botão "Enviar Arquivo Corrigido" no portal.`

  return (
    <div className="space-y-6">
      {/* Cabeçalho + Filtro por Ano + Botões de Exportação */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
              Qualis / CAPES • PePSIC • DOAJ • Latindex
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            Painel de Indicadores Editoriais e Anti-Plágio
          </h3>
          <p className="text-xs text-slate-500">
            Monitoramento em tempo real de prazos, taxas de aceite e controle preventivo de endogenia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="todos">Todo o Histórico ({articles.length})</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>Ano {yr}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleCopy('report', reportSummaryText)}
            className="px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            {copiedKey === 'report' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'report' ? 'Relatório Copiado!' : 'Copiar Relatório (CAPES/Atas)'}
          </button>

          <button
            type="button"
            onClick={() => handleCopy('wix', publicWixTransparencyText)}
            className="px-3 py-2 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg flex items-center gap-1.5"
          >
            {copiedKey === 'wix' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedKey === 'wix' ? 'Texto Copiado!' : 'Copiar Nota para Site Wix'}
          </button>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-500">Total de Submissões</span>
          <p className="text-3xl font-black text-slate-900">{totalSubmissions}</p>
          <p className="text-xs text-slate-500">
            <strong>{decidedArticles.length}</strong> finalizados • <strong>{inProgressCount}</strong> em tramitação
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-emerald-700">Taxa de Aceite / Recusa</span>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-emerald-700">{acceptanceRate}%</p>
            <span className="text-xs font-semibold text-rose-600">/ {rejectionRate}% recusa</span>
          </div>
          <p className="text-xs text-slate-500">
            <strong>{acceptedArticles.length}</strong> aceitos • <strong>{rejectedArticles.length}</strong> recusados
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-indigo-700">Tempo Médio até Decisão</span>
          <p className="text-3xl font-black text-indigo-700">
            {avgDecisionDays !== null ? `${avgDecisionDays}d` : '--'}
          </p>
          <p className="text-xs text-slate-500">
            1ª resposta: <strong>{avgFirstResponseDays !== null ? `${avgFirstResponseDays} dias` : '--'}</strong> (meta ≤ 90d)
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase text-amber-700">Agilidade dos Pareceristas</span>
          <p className="text-3xl font-black text-amber-700">
            {avgReviewDays !== null ? `${avgReviewDays}d` : '--'}
          </p>
          <p className="text-xs text-slate-500">
            Baseado em <strong>{completedReviews.length}</strong> pareceres concluídos
          </p>
        </div>
      </div>

      {/* Painel de Endogenia */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="border-b pb-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Controle Automático de Endogenia (Meta CAPES ≤ 20–25% | Limite DOAJ ≤ 25%)
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculado automaticamente sobre os <strong>{acceptedArticles.length}</strong> manuscritos aceitos no período (considerando autor principal e coautores).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Endogenia Institucional (ASP) */}
          <div className={`p-4 rounded-xl border space-y-2 ${aspBadge.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">1. Endogenia Institucional (ASP)</span>
              {aspBadge.icon}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{aspEndogenyPct.toFixed(1)}%</span>
              <span className="text-xs font-medium">
                ({aspEndogenousAccepted.length} de {acceptedArticles.length} artigos aceitos)
              </span>
            </div>
            <p className="text-[11px] font-semibold">{aspBadge.label}</p>
            {aspEndogenousAccepted.length > 0 && (
              <div className="pt-2 border-t border-black/10 text-[11px] space-y-0.5">
                <p className="font-bold">Artigos aceitos com vínculo à ASP:</p>
                {aspEndogenousAccepted.map((a) => (
                  <p key={a.id} className="truncate">• {a.title} — <em>{getAuthorName(a.author_id, a)}</em></p>
                ))}
              </div>
            )}
          </div>

          {/* Endogenia Corpo Editorial */}
          <div className={`p-4 rounded-xl border space-y-2 ${edBadge.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">2. Endogenia do Corpo Editorial</span>
              {edBadge.icon}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black">{editorialEndogenyPct.toFixed(1)}%</span>
              <span className="text-xs font-medium">
                ({editorialEndogenousAccepted.length} de {acceptedArticles.length} artigos aceitos)
              </span>
            </div>
            <p className="text-[11px] font-semibold">{edBadge.label}</p>
            {editorialEndogenousAccepted.length > 0 && (
              <div className="pt-2 border-t border-black/10 text-[11px] space-y-0.5">
                <p className="font-bold">Artigos aceitos de Editores / Conselho:</p>
                {editorialEndogenousAccepted.map((a) => (
                  <p key={a.id} className="truncate">• {a.title} — <em>{getAuthorName(a.author_id, a)}</em></p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Distribuição por Seção e Eixo Temático */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" /> Submissões por Seção Editorial
          </h4>
          <div className="space-y-2.5 text-xs">
            {sectionCounts.map((sec) => {
              const pct = totalSubmissions > 0 ? Math.round((sec.total / totalSubmissions) * 100) : 0
              return (
                <div key={sec.name} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">{sec.name}</span>
                    <span className="text-slate-500">
                      <strong>{sec.total}</strong> ({sec.accepted} aceitos)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" /> Submissões por Eixo Temático
          </h4>
          {axisEntries.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum dado no período.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {axisEntries.map(([axis, count]) => (
                <div key={axis} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-700 font-medium pr-2">{axis}</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 font-bold rounded text-[11px] flex-shrink-0">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Protocolo Anti-Plágio CopySpider (Custo Zero) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-indigo-600" />
              Protocolo Oficial Anti-Plágio (Triagem Gratuita via CopySpider)
            </h4>
            <p className="text-xs text-slate-500">
              Procedimento padrão de <em>Desk Review</em> antes de encaminhar qualquer manuscrito aos pareceristas.
            </p>
          </div>
          <a
            href="https://copyspider.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
          >
            Site Oficial CopySpider <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <p className="font-bold text-emerald-900">🟢 Até 15% de similaridade</p>
            <p className="text-emerald-800 leading-relaxed">
              Similaridade natural (referências bibliográficas e citações normatizadas). Manuscrito <strong>apto</strong> para seguir à avaliação duplo-cega.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
            <p className="font-bold text-amber-900">🟡 Entre 15% e 25%</p>
            <p className="text-amber-800 leading-relaxed">
              Abrir o relatório em PDF do CopySpider e conferir os trechos grifados para descartar paráfrases sem citação ou autoplágio (tese/dissertação).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
            <p className="font-bold text-rose-900">🔴 Acima de 25%</p>
            <p className="text-rose-800 leading-relaxed">
              Sem justificativa de citações diretas regulares, devolver ao autor na triagem ou recusar conforme diretrizes éticas da COPE.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600" /> Mensagens-padrão de Triagem (Desk Review):
            </p>
            <p className="text-slate-500">Copie e cole ao solicitar ajustes ou registrar recusa na triagem.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCopy('sim', msgDevolucaoSimilaridade)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 inline-flex items-center gap-1.5"
            >
              {copiedKey === 'sim' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
              {copiedKey === 'sim' ? 'Copiado!' : 'Modelo: Similaridade (CopySpider)'}
            </button>
            <button
              type="button"
              onClick={() => handleCopy('anon', msgDevolucaoAnonimizacao)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 inline-flex items-center gap-1.5"
            >
              {copiedKey === 'anon' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
              {copiedKey === 'anon' ? 'Copiado!' : 'Modelo: Anonimização'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
