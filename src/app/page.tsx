import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen, Upload, UserCheck, Search, ShieldCheck, CheckCircle2,
  Download, FileText, ArrowRight, Sparkles, Scale
} from 'lucide-react'
import PublicShell from '@/components/PublicShell'
import { supabase } from '@/lib/supabase'
import { JOURNAL_INFO, SITE_URL } from '@/lib/siteConfig'
import { getPublicFileUrl, PublicAuthor } from '@/lib/journalPublic'

export const revalidate = 60

export const metadata: Metadata = {
  title: `${JOURNAL_INFO.name} | ISSN ${JOURNAL_INFO.issn}`,
  description:
    'Publicação técnico-científica semestral em acesso aberto da Associação Saber Psicanalítico (ASP), dedicada à teoria, clínica e interlocuções da Psicanálise.',
  alternates: { canonical: SITE_URL },
}

export default async function HomePage() {
  const { data: currentIssue } = await supabase
    .from('issues')
    .select('*')
    .eq('is_published', true)
    .order('is_current', { ascending: false })
    .order('year', { ascending: false })
    .order('volume', { ascending: false })
    .order('issue_number', { ascending: false })
    .limit(1)
    .maybeSingle()

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

  const featuredArticles = currentArticles.slice(0, 4)
  const isMarkedCurrent = Boolean(currentIssue?.is_current)

  return (
    <PublicShell>
      {/* HERO EDITORIAL */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-14 sm:py-16 px-4 border-b border-indigo-900/50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              ISSN {JOURNAL_INFO.issn} • Acesso Aberto • Semestral
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-bold leading-tight">
              {JOURNAL_INFO.name}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Periódico técnico-científico da <strong>Associação Saber Psicanalítico (ASP)</strong> dedicado ao diálogo entre a elaboração teórica, a experiência clínica e as questões culturais e sociais contemporâneas.
            </p>

            {/* Buscador rápido */}
            <form action="/busca" method="GET" className="flex flex-col sm:flex-row gap-2 max-w-xl pt-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="q"
                  placeholder="Buscar artigos, autores ou palavras-chave..."
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 shadow"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Buscar
              </button>
            </form>

            {/* Ações principais */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={isMarkedCurrent ? '/edicao-atual' : '/edicoes'}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg inline-flex items-center gap-2 transition"
              >
                <BookOpen className="w-4 h-4" />
                {isMarkedCurrent ? 'Ler Edição Atual' : 'Explorar Edições'}
              </Link>
              <Link
                href="/portal"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs rounded-xl inline-flex items-center gap-2 transition"
              >
                <Upload className="w-4 h-4" /> Submeter Artigo / Entrar
              </Link>
              <Link
                href="/portal?pareceristas=true"
                className="px-4 py-3 bg-transparent hover:bg-white/10 text-amber-300 border border-amber-400/40 font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 transition"
              >
                <UserCheck className="w-4 h-4" /> Seja Parecerista
              </Link>
            </div>
          </div>

          {/* Card lateral institucional */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="bg-white px-3 py-1 rounded-xl shadow overflow-hidden">
                <img
                  src="/logo-revista.png"
                  alt={JOURNAL_INFO.name}
                  className="h-24 sm:h-28 w-auto object-contain -my-2"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                  Padrão Editorial
                </p>
                <p className="text-sm font-bold text-white">
                  Fluxo Contínuo • Semestral
                </p>
                <p className="text-[11px] text-slate-300">
                  Publicações em junho e dezembro
                </p>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>100% Gratuita (APC = R$ 0,00):</strong> sem taxas de submissão ou publicação.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Avaliação Duplo-Cega (Double-Blind):</strong> no mínimo dois pareceristas externos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Acesso Aberto CC-BY 4.0:</strong> os autores mantêm os direitos autorais.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Rigor Ético (COPE):</strong> verificação prévia via CopySpider e sigilo clínico.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* DESTAQUE DE PUBLICAÇÃO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              {isMarkedCurrent ? 'Publicação Vigente' : 'Acervo Publicado'}
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900">
              {isMarkedCurrent ? 'Edição Atual' : 'Último Fascículo Publicado'}
            </h2>
          </div>
          <Link href="/edicoes" className="text-xs font-bold text-indigo-700 hover:underline inline-flex items-center gap-1">
            Ver edições anteriores <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!currentIssue ? (
          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Acervo em atualização neste portal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Os fascículos e artigos da Revista Saber Psicanalítico estão sendo integrados à nova vitrine acadêmica. Enquanto isso, autores e avaliadores já podem acessar normalmente o portal editorial e consultar as normas completas de publicação.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/normas" className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl">
                Ler Normas ABNT
              </Link>
              <Link href="/portal" className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl">
                Acessar Portal Editorial
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
            {/* Cartão da Edição (com capa inteira sem cortes) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-stretch">
              <div className="w-44 sm:w-48 aspect-[3/4] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 p-1.5">
                {currentIssue.cover_image_url ? (
                  <img
                    src={getPublicFileUrl(currentIssue.cover_image_url)}
                    alt={currentIssue.title}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center p-4 space-y-1">
                    <BookOpen className="w-9 h-9 text-indigo-700 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      v. {currentIssue.volume}, n. {currentIssue.issue_number} ({currentIssue.year})
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between space-y-4 flex-1 text-center sm:text-left">
                <div className="space-y-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                      isMarkedCurrent
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    {isMarkedCurrent ? 'Edição Atual' : 'Edição Publicada'} • v. {currentIssue.volume}, n. {currentIssue.issue_number} ({currentIssue.year})
                  </span>
                  <h3 className="text-xl font-serif font-bold text-slate-900 leading-snug">
                    {currentIssue.title}
                  </h3>
                  {currentIssue.subtitle && (
                    <p className="text-xs text-slate-600">{currentIssue.subtitle}</p>
                  )}
                  <p className="text-xs font-semibold text-indigo-700">
                    {currentArticles.length}{' '}
                    {currentArticles.length === 1 ? 'trabalho publicado' : 'trabalhos publicados'}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 pt-1">
                  <Link
                    href={`/edicoes/${currentIssue.slug}`}
                    className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                  >
                    Ver Sumário Completo <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {currentIssue.full_issue_pdf_url && (
                    <a
                      href={getPublicFileUrl(currentIssue.full_issue_pdf_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Fascículo Completo
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Lista enxuta de até 4 destaques */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Destaques do Sumário
                </h3>
                <Link
                  href={`/edicoes/${currentIssue.slug}`}
                  className="text-[11px] font-bold text-indigo-700 hover:underline"
                >
                  Ver todos ({currentArticles.length}) →
                </Link>
              </div>

              {featuredArticles.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Os artigos individuais desta edição serão listados aqui em breve.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {featuredArticles.map((art) => {
                    const authors: PublicAuthor[] = Array.isArray(art.authors_json) ? art.authors_json : []
                    const pdfUrl = getPublicFileUrl(art.pdf_url)

                    return (
                      <article key={art.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase text-indigo-700">
                            {art.section}
                          </span>
                          <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">
                            <Link href={`/artigos/${art.slug}`} className="hover:text-indigo-700 transition">
                              {art.title}
                            </Link>
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            {authors.map((a) => a.name).join(' • ')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0 pt-1">
                          <Link
                            href={`/artigos/${art.slug}`}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg inline-flex items-center gap-1"
                            title="Ler resumo e citação"
                          >
                            <FileText className="w-3 h-3 text-indigo-600" /> Ler
                          </Link>
                          {pdfUrl && (
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg inline-flex items-center gap-1"
                              title="Baixar PDF do artigo"
                            >
                              <Download className="w-3 h-3" /> PDF
                            </a>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* SEÇÕES & PILARES DA REVISTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <Link href="/normas" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition space-y-2">
            <BookOpen className="w-6 h-6 text-indigo-700" />
            <h3 className="font-bold text-slate-900 text-sm">Normas ABNT</h3>
            <p className="text-slate-600 leading-relaxed">
              Artigos científicos, ensaios teóricos, relatos de experiência clínica e resenhas.
            </p>
          </Link>

          <Link href="/politicas" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition space-y-2">
            <Scale className="w-6 h-6 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">Ética e Políticas</h3>
            <p className="text-slate-600 leading-relaxed">
              Diretrizes COPE, sigilo clínico, CopySpider e controle preventivo de endogenia.
            </p>
          </Link>

          <Link href="/sobre" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition space-y-2">
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm">Conselho Editorial</h3>
            <p className="text-slate-600 leading-relaxed">
              Conheça a equipe editorial, o expediente completo e a mantenedora ASP.
            </p>
          </Link>

          <Link href="/portal?pareceristas=true" className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-200 shadow-sm hover:border-amber-400 transition space-y-2">
            <UserCheck className="w-6 h-6 text-amber-700" />
            <h3 className="font-bold text-amber-950 text-sm">Banco de Pareceristas</h3>
            <p className="text-amber-900/80 leading-relaxed">
              Chamada aberta com emissão automática de declaração timbrada para o Lattes.
            </p>
          </Link>
        </div>
      </section>
    </PublicShell>
  )
}
