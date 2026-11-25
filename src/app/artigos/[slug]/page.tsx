import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Download, ExternalLink, Calendar, ShieldCheck, BookOpen } from 'lucide-react'
import PublicShell from '@/components/PublicShell'
import CopyCitationButton from '@/components/CopyCitationButton'
import { supabase } from '@/lib/supabase'
import { SITE_URL, JOURNAL_INFO } from '@/lib/siteConfig'
import { getPublicFileUrl, formatAbntCitation, PublicAuthor } from '@/lib/journalPublic'

export const revalidate = 60

function formatScholarDate(dateStr?: string | null): string {
  const d = dateStr ? new Date(dateStr) : new Date()
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}/${m}/${day}`
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: article } = await supabase
    .from('published_articles')
    .select('*, issue:issue_id(*)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!article) {
    return { title: `Artigo não encontrado | ${JOURNAL_INFO.name}` }
  }

  const issue = article.issue as any
  const authors: PublicAuthor[] = Array.isArray(article.authors_json) ? article.authors_json : []
  const authorNames = authors.map((a) => a.name).filter(Boolean)
  const authorInstitutions = authors.map((a) => a.institution).filter(Boolean) as string[]
  const authorOrcids = authors.map((a) => a.orcid).filter(Boolean) as string[]
  const pdfUrl = getPublicFileUrl(article.pdf_url)
  const pageUrl = `${SITE_URL}/artigos/${article.slug}`
  const pubDate = formatScholarDate(article.published_at || issue?.published_at)

  const otherMeta: Record<string, string | number | (string | number)[]> = {
    citation_title: article.title,
    citation_journal_title: JOURNAL_INFO.name,
    citation_issn: JOURNAL_INFO.issn,
    citation_publisher: JOURNAL_INFO.maintainer,
    citation_language: 'pt',
    citation_abstract_html_url: pageUrl,
    'DC.Title': article.title,
    'DC.Publisher': JOURNAL_INFO.maintainer,
    'DC.Type': 'Text',
    'DC.Format': 'application/pdf',
    'DC.Identifier': pageUrl,
    'DC.Source': `${JOURNAL_INFO.name} (ISSN ${JOURNAL_INFO.issn})`,
    'DC.Language': 'por',
    'DC.Rights': JOURNAL_INFO.license,
  }

  if (authorNames.length > 0) {
    otherMeta.citation_author = authorNames
    otherMeta['DC.Creator'] = authorNames
  }
  if (authorInstitutions.length > 0) {
    otherMeta.citation_author_institution = authorInstitutions
  }
  if (authorOrcids.length > 0) {
    otherMeta.citation_author_orcid = authorOrcids
  }
  if (pubDate) {
    otherMeta.citation_publication_date = pubDate
    otherMeta.citation_online_date = pubDate
    otherMeta['DC.Date'] = pubDate.replace(/\//g, '-')
  }
  if (issue?.volume) otherMeta.citation_volume = String(issue.volume)
  if (issue?.issue_number) otherMeta.citation_issue = String(issue.issue_number)
  if (article.page_start) otherMeta.citation_firstpage = String(article.page_start)
  if (article.page_end) otherMeta.citation_lastpage = String(article.page_end)
  if (pdfUrl) otherMeta.citation_pdf_url = pdfUrl
  if (article.doi) {
    otherMeta.citation_doi = article.doi
    otherMeta['DC.Identifier.DOI'] = article.doi
  }
  if (article.keywords) {
    otherMeta.citation_keywords = article.keywords
    otherMeta['DC.Subject'] = article.keywords
  }
  if (article.abstract) {
    otherMeta['DC.Description'] = article.abstract.slice(0, 500)
  }

  return {
    title: `${article.title} | ${JOURNAL_INFO.name}`,
    description: (article.abstract || '').slice(0, 160),
    alternates: { canonical: pageUrl },
    other: otherMeta,
  }
}

export default async function ArtigoDetailPage({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase
    .from('published_articles')
    .select('*, issue:issue_id(*)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!article) notFound()

  const issue = article.issue as any
  const authors: PublicAuthor[] = Array.isArray(article.authors_json) ? article.authors_json : []
  const pdfUrl = getPublicFileUrl(article.pdf_url)
  const fullIssuePdfUrl = getPublicFileUrl(issue?.full_issue_pdf_url)
  const abntCitation = formatAbntCitation(article, issue)
  const isReview = article.section === 'Resenhas'

  return (
    <PublicShell>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navegação / Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/edicoes" className="text-indigo-700 font-semibold hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Edições
            </Link>
            {issue && (
              <>
                <span>/</span>
                <Link href={`/edicoes/${issue.slug}`} className="hover:underline text-slate-700 font-medium">
                  {issue.title}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-slate-800 font-semibold">{article.section}</span>
          </div>
        </div>

        {/* Cabeçalho Bibliográfico */}
        <header className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-800 border border-indigo-100 uppercase">
              {article.section || 'Artigos Científicos'}
            </span>
            {article.thematic_axis && (
              <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {article.thematic_axis}
              </span>
            )}
            {issue && (
              <span className="text-slate-500 font-medium">
                {JOURNAL_INFO.name} • ISSN {JOURNAL_INFO.issn} • v. {issue.volume}, n. {issue.issue_number} ({issue.year})
                {article.page_start ? `, p. ${article.page_start}${article.page_end ? `-${article.page_end}` : ''}` : ''}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-snug">
              {article.title}
            </h1>
            {article.title_en && !isReview && (
              <p className="text-sm sm:text-base font-serif italic text-slate-500">
                {article.title_en}
              </p>
            )}
          </div>

          {/* Autores */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            {authors.map((auth, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{auth.name}</span>
                  {auth.institution && (
                    <span className="text-slate-600">— {auth.institution}</span>
                  )}
                  {auth.orcid && (
                    <a
                      href={`https://orcid.org/${auth.orcid.replace(/^https?:\/\/orcid\.org\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-emerald-700 hover:underline inline-flex items-center gap-0.5"
                    >
                      ORCID <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {auth.lattes && (
                    <a
                      href={auth.lattes}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-indigo-700 hover:underline inline-flex items-center gap-0.5"
                    >
                      Lattes <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {auth.bio && (
                  <p className="text-[11px] text-slate-500 italic">{auth.bio}</p>
                )}
              </div>
            ))}
          </div>

          {/* Datas Editoriais e DOI */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {article.received_at && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Recebido em: <strong>{new Date(article.received_at).toLocaleDateString('pt-BR')}</strong>
              </span>
            )}
            {article.accepted_at && (
              <span>
                Aceito em: <strong>{new Date(article.accepted_at).toLocaleDateString('pt-BR')}</strong>
              </span>
            )}
            {article.published_at && (
              <span>
                Publicado em: <strong>{new Date(article.published_at).toLocaleDateString('pt-BR')}</strong>
              </span>
            )}
            {article.doi && (
              <a
                href={article.doi.startsWith('http') ? article.doi : `https://doi.org/${article.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-700 font-mono font-bold hover:underline inline-flex items-center gap-1"
              >
                DOI: {article.doi} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Botões de Download */}
          <div className="flex flex-wrap gap-3 pt-2">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4" /> Ler / Baixar Artigo (PDF)
              </a>
            )}
            {fullIssuePdfUrl && (
              <a
                href={fullIssuePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl inline-flex items-center gap-2 transition"
              >
                <BookOpen className="w-4 h-4 text-indigo-700" /> Baixar Fascículo Completo
              </a>
            )}
          </div>
        </header>

        {/* Resumo / Abstract */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          {article.abstract && (
            <div className="space-y-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
                {isReview ? 'Referência da Obra Resenhada' : 'Resumo'}
              </h2>
              <p className="text-justify whitespace-pre-line">{article.abstract}</p>
              {!isReview && article.keywords && (
                <p className="text-xs text-slate-600 pt-1">
                  <strong>Palavras-chave:</strong> {article.keywords}
                </p>
              )}
            </div>
          )}

          {!isReview && article.abstract_en && (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">
                Abstract
              </h2>
              <p className="text-justify whitespace-pre-line">{article.abstract_en}</p>
              {article.keywords_en && (
                <p className="text-xs text-slate-600 pt-1">
                  <strong>Keywords:</strong> {article.keywords_en}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Como Citar + Licença */}
        <section className="bg-slate-100 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Como Citar este Trabalho (ABNT)
            </h2>
            <CopyCitationButton text={abntCitation} />
          </div>
          <p className="text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed font-serif">
            {abntCitation}
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Este artigo está licenciado sob{' '}
              <a
                href={JOURNAL_INFO.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-700 font-semibold underline"
              >
                {JOURNAL_INFO.license}
              </a>
              . Os autores mantêm os direitos autorais sem restrições.
            </span>
          </div>
        </section>
      </article>
    </PublicShell>
  )
}
