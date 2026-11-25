import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Download, FileText, ArrowRight, Calendar } from 'lucide-react'
import PublicShell from '@/components/PublicShell'
import { supabase } from '@/lib/supabase'
import { JOURNAL_INFO } from '@/lib/siteConfig'
import { getPublicFileUrl, PublicAuthor, SECTION_ORDER } from '@/lib/journalPublic'

export const revalidate = 60

export const metadata: Metadata = {
  title: `Edições Publicadas | ${JOURNAL_INFO.name}`,
  description:
    'Consulte a edição atual e o acervo de edições anteriores da Revista Saber Psicanalítico (ISSN 3086-8416).',
}

export default async function EdicoesPage() {
  const { data: issuesData } = await supabase
    .from('issues')
    .select('*')
    .eq('is_published', true)
    .order('year', { ascending: false })
    .order('volume', { ascending: false })
    .order('issue_number', { ascending: false })

  const issues = issuesData || []
  const currentIssue = issues.find((i) => i.is_current) || issues[0] || null
  const previousIssues = currentIssue ? issues.filter((i) => i.id !== currentIssue.id) : []

  let currentArticles: any[] = []
  if (currentIssue) {
    const { data: artData } = await supabase
      .from('published_articles')
      .select('*')
      .eq('issue_id', currentIssue.id)
      .eq('is_published', true)
      .order('display_order', { ascending: true })
    currentArticles = artData || []
  }

  const groupedSections = SECTION_ORDER.map((sec) => ({
    section: sec,
    items: currentArticles.filter((a) => (a.section || 'Artigos Científicos') === sec),
  })).filter((g) => g.items.length > 0)

  const extraArticles = currentArticles.filter(
    (a) => !SECTION_ORDER.includes(a.section || 'Artigos Científicos')
  )
  if (extraArticles.length > 0) {
    groupedSections.push({ section: 'Outras Contribuições', items: extraArticles })
  }

  return (
    <PublicShell>
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-2.5">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
            Acervo Digital • Acesso Aberto
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold">Edições Publicadas</h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Acesse os artigos individualmente (com resumo e citação ABNT) ou faça o download do fascículo completo diagramado.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {!currentIssue ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
            <BookOpen className="w-10 h-10 text-indigo-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">Acervo em preparação</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              As edições publicadas aparecerão aqui automaticamente assim que forem cadastradas pela Editoria na aba Compositor de Fascículo do Portal.
            </p>
          </div>
        ) : (
          <>
            {/* EDIÇÃO ATUAL */}
            <section className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid md:grid-cols-[240px_1fr] gap-6 p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center bg-slate-100 rounded-xl border border-slate-200 overflow-hidden min-h-[260px]">
                  {currentIssue.cover_image_url ? (
                    <img
                      src={getPublicFileUrl(currentIssue.cover_image_url)}
                      alt={currentIssue.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-6 text-center space-y-2">
                      <BookOpen className="w-10 h-10 text-indigo-700 mx-auto" />
                      <p className="font-serif font-bold text-slate-800 text-sm">
                        v. {currentIssue.volume}, n. {currentIssue.issue_number}
                      </p>
                      <p className="text-xs text-slate-500">{currentIssue.year}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 uppercase">
                        Edição Atual
                      </span>
                      <span className="text-xs font-semibold text-indigo-700 inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        v. {currentIssue.volume}, n. {currentIssue.issue_number} ({currentIssue.year})
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                      {currentIssue.title}
                    </h2>
                    {currentIssue.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-600">{currentIssue.subtitle}</p>
                    )}

                    {currentIssue.editorial_title && (
                      <div className="pt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <strong className="text-slate-800">Editorial:</strong> {currentIssue.editorial_title}
                        {currentIssue.editorial_author && ` — ${currentIssue.editorial_author}`}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {currentIssue.full_issue_pdf_url && (
                      <a
                        href={getPublicFileUrl(currentIssue.full_issue_pdf_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition"
                      >
                        <Download className="w-4 h-4" /> Baixar Fascículo Completo (PDF)
                      </a>
                    )}
                    {currentIssue.editorial_pdf_url && (
                      <a
                        href={getPublicFileUrl(currentIssue.editorial_pdf_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" /> Ler Editorial (PDF)
                      </a>
                    )}
                    <Link
                      href={`/edicoes/${currentIssue.slug}`}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
                    >
                      Ver Sumário Completo <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Artigos da Edição Atual */}
              {groupedSections.length > 0 && (
                <div className="space-y-6">
                  {groupedSections.map((grp) => (
                    <div key={grp.section} className="space-y-3">
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-2">
                        {grp.section}
                      </h3>
                      <div className="grid gap-3">
                        {grp.items.map((art) => {
                          const authors: PublicAuthor[] = Array.isArray(art.authors_json)
                            ? art.authors_json
                            : []
                          const pdfPublicUrl = getPublicFileUrl(art.pdf_url)

                          return (
                            <article
                              key={art.id}
                              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition flex flex-col md:flex-row justify-between gap-4"
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                                  {art.thematic_axis && (
                                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                                      {art.thematic_axis}
                                    </span>
                                  )}
                                  {art.page_start && (
                                    <span className="text-slate-500 font-medium">
                                      p. {art.page_start}
                                      {art.page_end ? `-${art.page_end}` : ''}
                                    </span>
                                  )}
                                  {art.doi && (
                                    <span className="text-indigo-700 font-mono font-semibold">
                                      DOI: {art.doi}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-base font-serif font-bold text-slate-900">
                                  <Link href={`/artigos/${art.slug}`} className="hover:text-indigo-700 transition">
                                    {art.title}
                                  </Link>
                                </h4>
                                <p className="text-xs text-slate-600">
                                  {authors.map((a) => a.name).join(' • ') || 'Autoria não informada'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
                                <Link
                                  href={`/artigos/${art.slug}`}
                                  className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg inline-flex items-center gap-1.5"
                                >
                                  <FileText className="w-3.5 h-3.5 text-indigo-600" /> Resumo e Citação
                                </Link>
                                {pdfPublicUrl && (
                                  <a
                                    href={pdfPublicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-2 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg inline-flex items-center gap-1.5"
                                  >
                                    <Download className="w-3.5 h-3.5" /> PDF
                                  </a>
                                )}
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* EDIÇÕES ANTERIORES */}
            {previousIssues.length > 0 && (
              <section className="space-y-5 pt-4 border-t border-slate-200">
                <h2 className="text-xl font-serif font-bold text-slate-900">Edições Anteriores</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {previousIssues.map((iss) => (
                    <Link
                      key={iss.id}
                      href={`/edicoes/${iss.slug}`}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                    >
                      <div className="h-44 bg-slate-100 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                        {iss.cover_image_url ? (
                          <img
                            src={getPublicFileUrl(iss.cover_image_url)}
                            alt={iss.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <BookOpen className="w-8 h-8 text-indigo-600 mx-auto mb-1" />
                            <p className="text-xs font-bold text-slate-700">
                              v. {iss.volume}, n. {iss.issue_number} ({iss.year})
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-2">
                        <span className="text-[11px] font-bold text-indigo-700">
                          v. {iss.volume}, n. {iss.issue_number} • {iss.year}
                        </span>
                        <h3 className="font-serif font-bold text-slate-900 text-base">{iss.title}</h3>
                        {iss.subtitle && <p className="text-xs text-slate-500 line-clamp-2">{iss.subtitle}</p>}
                        <p className="text-xs font-bold text-indigo-700 pt-1 inline-flex items-center gap-1">
                          Acessar Edição <ArrowRight className="w-3.5 h-3.5" />
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PublicShell>
  )
}
