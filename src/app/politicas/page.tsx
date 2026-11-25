import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck, Scale, FileSearch, Lock, Globe, Users,
  UserCheck, Upload, HardDrive, BookOpen, Database
} from 'lucide-react'
import PublicShell from '@/components/PublicShell'
import { JOURNAL_INFO } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: `Políticas Editoriais e Ética | ${JOURNAL_INFO.name}`,
  description:
    'Política de acesso aberto (CC-BY 4.0), gratuidade total (APC R$ 0), avaliação duplo-cega, protocolo antiplágio CopySpider, preservação digital, preprints e diretrizes COPE.',
}

export default function PoliticasPage() {
  return (
    <PublicShell>
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-2.5">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
            Transparência Editorial • COPE • CC-BY 4.0
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold">Políticas Editoriais e Ética</h1>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Diretrizes éticas, política de gratuidade, avaliação por pares, controle antiplágio, preservação digital, ciência aberta e combate à endogenia da Revista Saber Psicanalítico.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="grid md:grid-cols-2 gap-6">
          <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              1. Foco, Escopo e Gratuidade Total (APC = R$ 0,00)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              A Revista Saber Psicanalítico (ISSN {JOURNAL_INFO.issn}) é um periódico científico semestral de fluxo contínuo mantido pela Associação Saber Psicanalítico (ASP). Publica artigos originais, ensaios teóricos, relatos de experiência clínica e resenhas críticas no campo da Psicanálise e suas interfaces com a cultura, filosofia e ciências humanas.
            </p>
            <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              Política de Taxas: A revista é 100% gratuita para autores e leitores. Não são cobradas taxas de submissão, avaliação, editoração ou publicação (Article Processing Charges — APC = R$ 0,00).
            </p>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              2. Avaliação Duplo-Cega por Pares
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Todos os trabalhos submetidos passam inicialmente por triagem de escopo e conformidade (<em>Desk Review</em>) e, em seguida, são avaliados pelo sistema Duplo-Cego por Pares (<em>Double-Blind Peer Review</em>). Cada manuscrito é apreciado por no mínimo dois pareceristas ad-hoc externos à instituição de origem dos autores. Em caso de divergência inconclusiva, um terceiro parecerista é designado.
            </p>
            <p className="text-xs text-indigo-800 font-semibold">
              Prazo médio estimado para a primeira resposta editorial: até 90 dias.
            </p>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              3. Acesso Aberto, Direitos Autorais e Licença
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              A Revista adota a política de Acesso Aberto imediato (<em>Open Access</em>) sob a licença{' '}
              <a href={JOURNAL_INFO.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-700 font-semibold underline">
                Creative Commons Atribuição 4.0 Internacional (CC-BY 4.0)
              </a>
              , permitindo o compartilhamento e adaptação do material em qualquer meio, desde que atribuídos os créditos de autoria e publicação original.
            </p>
            <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              Retenção de Copyright: Os autores retêm integralmente os direitos autorais e de publicação de seus trabalhos sem restrições, concedendo à revista o direito de primeira publicação.
            </p>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              4. Integridade Ética (COPE) e Inteligência Artificial
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              O periódico pauta-se nos princípios de integridade acadêmica estabelecidos pelo <strong>COPE (Committee on Publication Ethics)</strong>.
            </p>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <strong>Uso de Inteligência Artificial:</strong> Softwares ou ferramentas de IA generativa não cumprem os requisitos de autoria científica e não podem ser listados como autores ou coautores. Qualquer utilização de suporte linguístico ou metodológico deve ser explicitamente declarada pelos autores na metodologia do manuscrito.
            </p>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-600" />
              5. Sigilo em Relatos de Experiência Clínica
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Nos manuscritos da seção &ldquo;Relatos de Experiência Clínica&rdquo;, é de responsabilidade indelegável dos autores assegurar a rigorosa descaracterização de nomes, datas, locais e dados biográficos que possam direta ou indiretamente identificar o paciente/analisando, em estrita observância à ética psicanalítica e aos preceitos da Resolução CNS nº 510/2016.
            </p>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-indigo-600" />
              6. Protocolo Oficial Anti-Plágio (CopySpider)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Antes do encaminhamento aos pareceristas, todos os manuscritos são submetidos à verificação de similaridade textual e originalidade por meio do software especializado <strong>CopySpider</strong>. Textos com índices de similaridade injustificados ou com reprodução de passagens sem a devida citação e referenciação conforme a ABNT são devolvidos para adequação ou rejeitados na triagem preliminar.
            </p>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="font-bold text-slate-900 text-base">
              7. Política de Endogenia e Conflitos de Interesse
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Com o objetivo de zelar pela pluralidade e prevenir a endogenia editorial (conforme parâmetros da CAPES e do DOAJ), a revista limita a publicação de artigos de autores vinculados à entidade mantenedora (Associação Saber Psicanalítico — ASP) e aos membros do corpo editorial a um teto máximo de <strong>20% a 25%</strong> dos trabalhos publicados em cada volume/edição, mantendo proporção de autoria externa superior a 75%.
            </p>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-600" />
              8. Preservação Digital e Interoperabilidade
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              A revista mantém cópias de segurança redundantes em nuvem institucional de todo o acervo em PDF e metadados, URLs permanentes individuais por artigo, protocolo de coleta <strong>OAI-PMH (Dublin Core)</strong> e autoriza expressamente o autoarquivamento da versão publicada pelos autores em repositórios institucionais.
            </p>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              9. Política sobre Preprints
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Para assegurar o rigor do <strong>ineditismo</strong> e preservar o anonimato estrito da <strong>avaliação duplo-cega por pares</strong>, a Revista Saber Psicanalítico <strong>não aceita</strong> a submissão de manuscritos previamente depositados em servidores de preprints.
            </p>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <strong>Pós-print liberado:</strong> Após a aprovação e publicação oficial no fascículo, os autores têm plena liberdade para depositar a versão final publicada (PDF editorial) em repositórios institucionais de acesso aberto (como Lume, RI-USP, etc.), citando a publicação original.
            </p>
          </article>

          <article className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              10. Disponibilidade de Dados de Pesquisa
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Em estudos teóricos e bibliográficos no campo da Psicanálise, os dados analisados correspondem integralmente às fontes documentais e obras referenciadas ao longo do artigo. Em eventuais pesquisas empíricas sem restrições éticas, os autores devem informar se o conjunto de dados pode ser consultado mediante solicitação fundamentada.
            </p>
            <p className="text-xs font-semibold text-rose-900 bg-rose-50/70 p-3 rounded-xl border border-rose-200">
              Proteção ao Sigilo Clínico: Em relatos de experiência clínica e pesquisas envolvendo analisandos ou participantes humanos, a abertura pública de dados primários é expressamente vedada em respeito ao sigilo analítico, à LGPD e à Resolução CNS nº 510/2016.
            </p>
          </article>
        </div>

        {/* Chamada para Pareceristas & Acesso ao Portal */}
        <section className="bg-gradient-to-r from-amber-50 via-white to-indigo-50 p-6 sm:p-8 rounded-2xl border border-amber-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              Chamada Pública Permanente
            </span>
            <h2 className="text-lg font-serif font-bold text-slate-900">
              Banco de Pareceristas Ad-Hoc (Com Certificação para o Lattes)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pesquisadores(as), docentes e psicanalistas: atuação voluntária e 100% gratuita, sob avaliação duplo-cega (prazo médio de 21 dias) e emissão automática de Declaração Oficial Timbrada com Código Verificador Digital a cada parecer concluído.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <Link
              href="/portal?pareceristas=true"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" /> Inscrever-se como Parecerista
            </Link>
            <Link
              href="/portal"
              className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Upload className="w-4 h-4" /> Portal de Submissões
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
