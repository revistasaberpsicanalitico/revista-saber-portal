import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Download, FileText } from 'lucide-react'
import PublicShell from '@/components/PublicShell'
import { supabase } from '@/lib/supabase'
import { JOURNAL_INFO } from '@/lib/siteConfig'
import { getPublicFileUrl, PublicAuthor, SECTION_ORDER } from '@/lib/journalPublic'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: issue } = await supabase
    .from('issues')
    .select('title, subtitle, volume, issue_number, year')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!issue) {
    return { title: `Edição não encontrada | ${JOURNAL_INFO.name}` }
  }

  return {
    title: `${issue.title} (v. ${issue.volume}, n. ${issue.issue_number}, ${issue.year}) | ${JOURNAL_INFO.name}`,
    description: issue.subtitle || `Sumário oficial e artigos publicados em ${issue.title} na Revista Saber Psicanalítico.`,
  }
}

export default async function IssueDetailPage({ params }: { params: { slug: string } }) {
  const { data: issue } = await supabase
    .from('issues')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!issue) notFound()

  const { data: artData } = await supabase
    .from('published_articles')
    .select('*')
    .eq('issue_id', issue.id)
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  const articles = artData || []

  const groupedSections = SECTION_ORDER.map((sec) => ({
    section: sec,
    items: articles.filter((a) => (a.section || 'Artigos Científicos') === sec),
  })).filter((g) => g.items.length > 0)

  const extraArticles = articles.filter(
    (a) => !SECTION_ORDER.includes(a.section || 'Artigos Científicos')
  )
  if (extraArticles.length > 0) {
    groupedSections.push({ section: 'Outras Contribuições', items: extraArticles })
  }

  return (
    <PublicShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Link
          href="/edicoes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar para todas as edições
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 grid md:grid-cols-[220px_1fr] gap-6">
          <div className="bg-slate-100 rounded-xl border border-slate-200 overflow-hidden min-h-[240px] flex items-center justify-center">
            {issue.cover_image_url ? (
              <img
                src={getPublicFileUrl(issue.cover_image_url)}
                alt={issue.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 space-y-1">
                <BookOpen className="w-10 h-10 text-indigo-700 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  v. {issue.volume}, n. {issue.issue_number} ({issue.year})
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-100">
                v. {issue.volume}, n. {issue.issue_number} • {issue.year}
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">{issue.title}</h1>
              {issue.subtitle && <p className="text-sm text-slate-600">{issue.subtitle}</p>}
            </div>

            {issue.editorial_title && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                <strong>Editorial:</strong> {issue.editorial_title}
                {issue.editorial_author && ` — ${issue.editorial_author}`}
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              {issue.full_issue_pdf_url && (
                <a
                  href={getPublicFileUrl(issue.full_issue_pdf_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Baixar Fascículo Completo (PDF)
                </a>
              )}
              {issue.editorial_pdf_url && (
                <a
                  href={getPublicFileUrl(issue.editorial_pdf_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-600" /> Ler Editorial (PDF)
                </a>
              )}
            </div>
          </div>
        </div>

        {groupedSections.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border text-center text-xs text-slate-500">
            Nenhum artigo individual publicado nesta edição ainda.
          </div>
        ) : (
          <div className="space-y-8">
            {groupedSections.map((grp) => (
              <section key={grp.section} className="space-y-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-indigo-900 border-b border-slate-200 pb-2">
                  {grp.section}
                </h2>
                <div className="grid gap-3">
                  {grp.items.map((art) => {
                    const authors: PublicAuthor[] = Array.isArray(art.authors_json)
                      ? art.authors_json
                      : []
                    const pdfUrl = getPublicFileUrl(art.pdf_url)

                    return (
                      <article
                        key={art.id}
                        className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            {art.thematic_axis && (
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                                {art.thematic_axis}
                              </span>
                            )}
                            {art.page_start && (
                              <span className="text-slate-500">
                                p. {art.page_start}
                                {art.page_end ? `-${art.page_end}` : ''}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-serif font-bold text-slate-900">
                            <Link href={`/artigos/${art.slug}`} className="hover:text-indigo-700 transition">
                              {art.title}
                            </Link>
                          </h3>
                          <p className="text-xs text-slate-600">
                            {authors.map((a) => a.name).join(' • ')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-center">
                          <Link
                            href={`/artigos/${art.slug}`}
                            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg inline-flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-600" /> Página do Artigo
                          </Link>
                          {pdfUrl && (
                            <a
                              href={pdfUrl}
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
              </section>
            ))}
          </div>
        )}
      </div>
    </PublicShell>
  )
}
