import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, FileText, Download } from 'lucide-react'
import PublicShell from '@/components/PublicShell'
import { supabase } from '@/lib/supabase'
import { JOURNAL_INFO } from '@/lib/siteConfig'
import { getPublicFileUrl, PublicAuthor } from '@/lib/journalPublic'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: `Buscar Artigos | ${JOURNAL_INFO.name}`,
  description: 'Pesquise artigos, ensaios teóricos, relatos clínicos e resenhas publicados na Revista Saber Psicanalítico.',
}

function normalize(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = (searchParams?.q || '').trim()
  const normQuery = normalize(query)
  const queryTerms = normQuery ? normQuery.split(' ').filter(Boolean) : []

  const { data } = await supabase
    .from('published_articles')
    .select('*, issue:issue_id(title, volume, issue_number, year, slug)')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  const allPublished = data || []

  const results =
    queryTerms.length > 0
      ? allPublished.filter((art) => {
          const authors: PublicAuthor[] = Array.isArray(art.authors_json) ? art.authors_json : []
          const authorText = authors.map((a) => `${a.name} ${a.institution || ''}`).join(' ')
          const issue = art.issue as any
          const haystack = normalize(
            `${art.title || ''} ${art.title_en || ''} ${art.abstract || ''} ${art.abstract_en || ''} ${art.keywords || ''} ${art.keywords_en || ''} ${art.section || ''} ${art.thematic_axis || ''} ${authorText} ${issue?.title || ''}`
          )
          return queryTerms.every((term) => haystack.includes(term))
        })
      : allPublished

  return (
    <PublicShell>
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">Buscar no Acervo</h1>
          <form action="/busca" method="GET" className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Pesquisar por título, resumo, abstract (inglês), autor ou palavra-chave..."
                className="w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition"
            >
              Pesquisar
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <p className="text-xs font-semibold text-slate-600">
          {query
            ? `${results.length} resultado(s) encontrado(s) para "${query}"`
            : `Exibindo todos os ${results.length} trabalhos publicados no acervo`}
        </p>

        {results.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            Nenhum trabalho encontrado com os termos pesquisados. Tente palavras mais amplas ou consulte todas as{' '}
            <Link href="/edicoes" className="text-indigo-700 font-bold underline">
              edições publicadas
            </Link>.
          </div>
        ) : (
          <div className="grid gap-4">
            {results.map((art) => {
              const issue = art.issue as any
              const authors: PublicAuthor[] = Array.isArray(art.authors_json) ? art.authors_json : []
              const pdfUrl = getPublicFileUrl(art.pdf_url)

              return (
                <article
                  key={art.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2.5"
                >
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-100 font-bold">
                      {art.section}
                    </span>
                    {issue && (
                      <Link href={`/edicoes/${issue.slug}`} className="text-slate-500 hover:underline">
                        {issue.title}
                      </Link>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900">
                    <Link href={`/artigos/${art.slug}`} className="hover:text-indigo-700 transition">
                      {art.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    {authors.map((a) => a.name).join(' • ')}
                  </p>
                  {art.abstract && (
                    <p className="text-xs text-slate-500 line-clamp-2">{art.abstract}</p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/artigos/${art.slug}`}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg inline-flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" /> Ler Resumo
                    </Link>
                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </PublicShell>
  )
}
