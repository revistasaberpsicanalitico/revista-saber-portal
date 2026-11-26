import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Building2, Users, Mail, ExternalLink, Target, Compass, Sparkles, MapPin } from 'lucide-react'
import PublicShell from '@/components/PublicShell'
import { JOURNAL_INFO } from '@/lib/siteConfig'
import { EDITORIAL_BOARD, PRESENTATION_CONTENT, EXPEDIENTE_CONTENT } from '@/lib/editorialContent'

export const metadata: Metadata = {
  title: `Sobre, Expediente e Conselho Editorial | ${JOURNAL_INFO.name}`,
  description:
    'Apresentação, missão, orientação editorial, expediente oficial e Conselho Editorial da Revista Saber Psicanalítico (ISSN 3086-8416).',
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function SobrePage() {
  return (
    <PublicShell>
      {/* Cabeçalho da página */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
            Identidade Institucional • ISSN {JOURNAL_INFO.issn}
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold">
            Sobre a Revista, Expediente e Conselho Editorial
          </h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Conheça a missão, o escopo científico, os dados institucionais da mantenedora e a equipe responsável pela condução editorial do periódico.
          </p>

          {/* Navegação interna por âncoras */}
          <div className="pt-3 flex flex-wrap gap-2 text-xs">
            <a href="#apresentacao" className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition">
              1. Apresentação
            </a>
            <a href="#expediente" className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition">
              2. Expediente
            </a>
            <a href="#conselho" className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition">
              3. Conselho Editorial
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* 1. APRESENTAÇÃO */}
        <section id="apresentacao" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <BookOpen className="w-5 h-5 text-indigo-700" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">Apresentação</h2>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
            <p className="text-base text-slate-800 font-medium">{PRESENTATION_CONTENT.intro}</p>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="p-5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <h3 className="font-bold text-indigo-950 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Target className="w-4 h-4 text-indigo-700" /> Missão
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {PRESENTATION_CONTENT.mission}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                <h3 className="font-bold text-amber-950 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Compass className="w-4 h-4 text-amber-700" /> Orientação Editorial
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {PRESENTATION_CONTENT.orientation}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Público-Alvo</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {PRESENTATION_CONTENT.audience}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Objetivos
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
                  {PRESENTATION_CONTENT.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
              {PRESENTATION_CONTENT.disclaimer}
            </div>
          </div>
        </section>

        {/* 2. EXPEDIENTE */}
        <section id="expediente" className="scroll-mt-24 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <Building2 className="w-5 h-5 text-indigo-700" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">Expediente</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider">
                  Instituição Responsável
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{JOURNAL_INFO.maintainer}</h3>
                <p className="text-slate-600">CNPJ: {JOURNAL_INFO.cnpj}</p>
              </div>

              <div className="space-y-1 text-slate-600">
                <p className="font-bold text-slate-800">Endereço Institucional:</p>
                <p>Rua Visconde de Inhaúma, nº 1361, sala 408</p>
                <p>Bairro Maurício de Nassau — Caruaru – Pernambuco – Brasil</p>
                <p>CEP: 55012-010</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <p>
                  <strong>Site institucional:</strong>{' '}
                  <a
                    href={JOURNAL_INFO.maintainerSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 hover:underline inline-flex items-center gap-1"
                  >
                    www.asppsicanalise.com.br <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <p>
                  <strong>Contato da revista:</strong>{' '}
                  <a href={`mailto:${JOURNAL_INFO.email}`} className="text-indigo-700 hover:underline font-medium">
                    {JOURNAL_INFO.email}
                  </a>
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider">
                  Periodicidade & Organização dos Fascículos
                </span>
                <p className="text-slate-600 mt-1 leading-relaxed">{EXPEDIENTE_CONTENT.cycle}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">Formato e Acesso</p>
                  <p className="text-slate-600">{EXPEDIENTE_CONTENT.format}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">ISSN Eletrônico</p>
                  <p className="text-indigo-800 font-bold">{JOURNAL_INFO.issn}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-700">
                <p><strong>Editor-chefe:</strong> Dr. Edson Leandro de Almeida</p>
                <p><strong>Editor-adjunto:</strong> Me. José Aniervson Souza dos Santos</p>
                <p><strong>Projeto gráfico e diagramação:</strong> {EXPEDIENTE_CONTENT.graphicDesign}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CONSELHO EDITORIAL */}
        <section id="conselho" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-indigo-700" />
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                Conselho Editorial
              </h2>
            </div>
            <Link
              href="/portal?pareceristas=true"
              className="text-xs font-bold text-amber-800 hover:underline"
            >
              Quer colaborar como Parecerista Ad-hoc? Inscreva-se →
            </Link>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
            O Conselho Editorial da Revista Saber Psicanalítico reúne profissionais com formação em Psicanálise, contribuindo para a orientação editorial da publicação. Sua atuação está voltada ao compromisso com o rigor conceitual, a responsabilidade ética e o diálogo entre a Psicanálise, a clínica, a educação, a cultura e a sociedade.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            {EDITORIAL_BOARD.map((member) => (
              <article
                key={member.name}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-indigo-200 transition"
              >
                <div className="flex items-start gap-4">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-900 to-slate-800 text-amber-300 font-serif font-bold text-lg flex items-center justify-center flex-shrink-0 border-2 border-amber-400/40 shadow-sm">
                      {getInitials(member.name)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-100">
                      {member.role}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                    <p className="text-xs font-medium text-indigo-700">{member.institution}</p>
                    {member.location && (
                      <p className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        {member.location}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed text-justify">
                  {member.bio}
                </p>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px]">
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-700 font-medium"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      {member.email}
                    </a>
                  )}
                  {member.lattesUrl && (
                    <a
                      href={member.lattesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-700 hover:underline font-semibold"
                    >
                      Lattes <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {member.orcid && (
                    <a
                      href={`https://orcid.org/${member.orcid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                    >
                      ORCID <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
