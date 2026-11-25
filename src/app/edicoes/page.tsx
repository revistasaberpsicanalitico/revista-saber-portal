import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Download, ArrowRight } from 'lucide-react'
import PublicShell from '@/components/PublicShell'
import { supabase } from '@/lib/supabase'
import { JOURNAL_INFO } from '@/lib/siteConfig'
import { getPublicFileUrl } from '@/lib/journalPublic'

export const revalidate = 60

export const metadata: Metadata = {
  title: `Edições Anteriores | ${JOURNAL_INFO.name}`,
  description:
    'Consulte o arquivo histórico de fascículos publicados pela Revista Saber Psicanalítico (ISSN 3086-8416).',
}

export default async function EdicoesPage() {
  const { data: issuesData } = await supabase
    .from('issues')
    .select('*')
    .eq('is_published', true)
    .order('year', { ascending: false })
    .order('volume', { ascending: false })
    .order('issue_number', { ascending: false })

  const allIssues = issuesData || []
  const currentIssue = allIssues.find((i) => i.is_current) || null
  const previousIssues = allIssues.filter((i) => !i.is_current)

  const { data: pubArts } = await supabase
    .from('published_articles')
    .select('id, issue_id')
    .eq('is_published', true)

  const countByIssue: Record<string, number> = {}
  ;(pubArts || []).forEach((a) => {
    if (a.issue_id) countByIssue[a.issue_id] = (countByIssue[a.issue_id] || 0) + 1
  })

  return (
    <PublicShell>
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              Arquivo Histórico • Acesso Aberto
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold">Edições Anteriores</h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Consulte todos os fascículos anteriores publicados pela Revista Saber Psicanalítico.
            </p>
          </div>
          {currentIssue && (
            <Link
              href="/edicao-atual"
              className="text-xs font-bold text-emerald-300 hover:underline inline-flex items-center gap-1"
            >
              Ir para a Edição Atual <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {previousIssues.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
            <BookOpen className="w-10 h-10 text-indigo-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">Nenhuma edição anterior arquivada ainda</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Assim que novos fascículos forem publicados e substituírem a edição vigente, os anteriores aparecerão listados aqui automaticamente.
            </p>
            {currentIssue && (
              <Link
                href="/edicao-atual"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl mt-2"
              >
                Acessar Edição Atual <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousIssues.map((iss) => {
              const artCount = countByIssue[iss.id] || 0
              return (
                <div
                  key={iss.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <Link href={`/edicoes/${iss.slug}`} className="block bg-slate-50 aspect-[3/4] max-h-72 w-full flex items-center justify-center border-b border-slate-100 p-3 overflow-hidden">
                    {iss.cover_image_url ? (
                      <img
                        src={getPublicFileUrl(iss.cover_image_url)}
                        alt={iss.title}
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <div className="text-center p-4 space-y-1">
                        <BookOpen className="w-8 h-8 text-indigo-600 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">
                          v. {iss.volume}, n. {iss.issue_number} ({iss.year})
                        </p>
                      </div>
                    )}
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-bold text-indigo-700">
                          v. {iss.volume}, n. {iss.issue_number} • {iss.year}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {artCount} {artCount === 1 ? 'artigo' : 'artigos'}
                        </span>
                      </div>
                      <h2 className="font-serif font-bold text-slate-900 text-base leading-snug">
                        <Link href={`/edicoes/${iss.slug}`} className="hover:text-indigo-700 transition">
                          {iss.title}
                        </Link>
                      </h2>
                      {iss.subtitle && <p className="text-xs text-slate-500 line-clamp-2">{iss.subtitle}</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                      <Link
                        href={`/edicoes/${iss.slug}`}
                        className="flex-1 text-center px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg inline-flex items-center justify-center gap-1"
                      >
                        Ver Artigos <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      {iss.full_issue_pdf_url && (
                        <a
                          href={getPublicFileUrl(iss.full_issue_pdf_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1"
                          title="Baixar PDF completo da edição"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PublicShell>
  )
}
