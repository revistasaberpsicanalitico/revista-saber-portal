import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, CheckCircle2, Upload, ShieldCheck, BookMarked, AlertTriangle } from 'lucide-react'
import PublicShell from '@/components/PublicShell'
import { JOURNAL_INFO } from '@/lib/siteConfig'

export const metadata: Metadata = {
  title: `Normas para Publicação | ${JOURNAL_INFO.name}`,
  description:
    'Diretrizes para autores, seções aceitas, processo de avaliação duplo-cega, formatação ABNT e preparação de manuscritos para submissão.',
}

export default function NormasPage() {
  const categories = [
    {
      name: 'Artigos Científicos',
      limit: '2.000 a 8.000 palavras',
      desc: 'Resultados de pesquisa original, teórica ou empírica, com rigor metodológico e contribuição significativa para o campo.',
    },
    {
      name: 'Ensaios Teóricos',
      limit: '1.500 a 6.000 palavras',
      desc: 'Reflexões aprofundadas sobre conceitos psicanalíticos, releituras de obras clássicas ou propostas de novos desenvolvimentos conceituais.',
    },
    {
      name: 'Relatos de Experiência Clínica',
      limit: '2.000 a 5.000 palavras',
      desc: 'Descrição e análise de casos clínicos, com foco na técnica e na discussão teórica subjacente. O anonimato e a confidencialidade do paciente são obrigatórios.',
    },
    {
      name: 'Resenhas',
      limit: '1.000 a 1.500 palavras',
      desc: 'Análise crítica de livros recentes e relevantes para a Psicanálise.',
    },
  ]

  const checklist = [
    'O trabalho é original e inédito.',
    'O manuscrito está formatado conforme as normas ABNT (margens, fonte, espaçamento).',
    'O arquivo principal está anonimizado (sem nomes no texto nem nas propriedades do Word).',
    'O Resumo e o Abstract estão presentes (dispensado para Resenhas).',
    'As referências e citações seguem a NBR 6023:2025 e NBR 10520:2023.',
    'Foi incluído o ORCID de todos os autores, quando existir.',
    'Concordância com a publicação em Acesso Aberto sob licença Creative Commons CC-BY 4.0.',
    'Declaração sobre o uso ético e transparente de Inteligência Artificial.',
  ]

  return (
    <PublicShell>
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-bold uppercase tracking-wider">
              Diretrizes para Autores • ABNT
            </span>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold">Normas para Publicação</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Consulte o escopo, as categorias de manuscritos, as regras de anonimização e a padronização ABNT antes de realizar seu envio no Portal Editorial.
            </p>
          </div>
          <Link
            href="/portal"
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg inline-flex items-center justify-center gap-2 whitespace-nowrap transition"
          >
            <Upload className="w-4 h-4" /> Submeter Manuscrito Agora
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-sm text-slate-700 leading-relaxed">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <p>
            Antes de realizar o envio, os autores devem consultar o escopo da revista, verificar a categoria do trabalho e conferir todas as exigências de apresentação e documentação. <strong>A submissão não implica aceite para publicação.</strong> Os trabalhos serão apreciados conforme os critérios e as etapas de avaliação adotados pela revista.
          </p>
        </div>

        {/* 1. Escopo e Categorias */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-serif font-bold text-slate-900 border-b pb-3">
            1. Escopo, Categorias e Avaliação
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A Revista Saber Psicanalítico é uma publicação técnico-científica semestral da Associação Saber Psicanalítico (ASP), dedicada à difusão de pesquisas e reflexões rigorosas no campo da Psicanálise e áreas afins. Nosso objetivo é promover o diálogo entre teoria e prática, clínica e cultura, mantendo o mais alto padrão de qualidade e ética editorial.
          </p>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">1.1. Tipos de Contribuição Aceitas</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="font-bold text-indigo-900 text-sm">{cat.name}</h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {cat.limit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-sm">1.2. Processo de Avaliação (Double-Blind Peer Review)</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Todos os manuscritos submetidos são avaliados pelo sistema de <strong>Avaliação por Pares Cega Dupla</strong>, conduzido em três etapas:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="font-bold text-indigo-700">Etapa 1 • Preliminar</span>
                <p className="text-slate-600">O Editor-Chefe verifica a adequação do manuscrito ao escopo, anonimização, originalidade (CopySpider) e às normas da Revista.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="font-bold text-indigo-700">Etapa 2 • Avaliação por Pares</span>
                <p className="text-slate-600">Enviado a dois ou mais pareceristas ad hoc (prazo padrão de 21 dias). Havendo divergência, um terceiro parecerista ad hoc é designado para desempate.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="font-bold text-indigo-700">Etapa 3 • Decisão Editorial</span>
                <p className="text-slate-600">Com base nos pareceres, o Editor-Chefe emite a decisão final: Aceite sem restrições, Correções Obrigatórias ou Não Aceite.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Ética */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-serif font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            2. Ética e Conflito de Interesses
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-xs leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Conformidade Ética (COPE) e Antiplágio</p>
              <p className="text-slate-600">A Revista segue integralmente os códigos de conduta do Committee on Publication Ethics (COPE). Todos os trabalhos passam por verificação de similaridade textual antes de seguirem para os pareceristas.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Uso Ético de Inteligência Artificial (IA)</p>
              <p className="text-slate-600">Ferramentas de IA generativa não podem ser listadas como autoras ou coautoras. Caso utilizadas como apoio técnico ou linguístico, seu uso deve ser explicitamente declarado e justificado na metodologia.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Sigilo Clínico</p>
              <p className="text-slate-600">Em relatos de experiência clínica ou estudos de caso, os autores devem garantir a completa descaracterização dos sujeitos atendidos, preservando o sigilo analítico.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900">Acesso Aberto e Direitos Autorais</p>
              <p className="text-slate-600">Todo o conteúdo é publicado sob licença Creative Commons Atribuição 4.0 Internacional (CC-BY 4.0), mantendo os autores os direitos autorais e concedendo à revista o direito de primeira publicação.</p>
            </div>
          </div>
        </section>

        {/* 3. Formatação ABNT */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm">
          <h2 className="text-xl font-serif font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-700" />
            3. Formatação e Apresentação (Normas ABNT)
          </h2>
          <p className="text-slate-600">
            Os manuscritos devem seguir as diretrizes da ABNT: <strong>NBR 6022:2018</strong> (Artigo em publicação periódica), <strong>NBR 6023:2025</strong> (Referências), <strong>NBR 10520:2023</strong> (Citações) e <strong>NBR 14724:2024</strong> (Trabalhos Acadêmicos).
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">3.1. Aspectos Gerais</h3>
              <ul className="space-y-1 text-slate-600">
                <li>• <strong>Papel:</strong> Formato A4.</li>
                <li>• <strong>Margens:</strong> Superior e Esquerda: 3 cm; Inferior e Direita: 2 cm.</li>
                <li>• <strong>Fonte:</strong> Times New Roman ou Arial, tamanho 12.</li>
                <li>• <strong>Espaçamento:</strong> 1,5 entre linhas (exceto citações longas, notas e referências).</li>
                <li>• <strong>Parágrafo:</strong> Recuo de 1,25 cm na primeira linha.</li>
                <li>• <strong>Alinhamento:</strong> Justificado.</li>
                <li>• <strong>Numeração de páginas:</strong> Canto superior direito, a partir da Introdução, contada a partir da folha de rosto.</li>
              </ul>
            </div>

            <div className="space-y-2 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">3.2. Estrutura do Manuscrito</h3>
              <ul className="space-y-1.5 text-slate-600">
                <li>1. <strong>Título e Subtítulo:</strong> Em português e em inglês (obrigatório).</li>
                <li>2. <strong>Autoria:</strong> <span className="text-rose-700 font-bold">NÃO inserir no arquivo do manuscrito.</span> Preencher exclusivamente nos metadados do Portal de Submissão.</li>
                <li>3. <strong>Resumo e Palavras-chave:</strong> Em português (150 a 250 palavras; 3 a 5 palavras-chave separadas por ponto e vírgula) e equivalente em inglês (Abstract / Keywords).</li>
                <li>4. <strong>Corpo do Texto:</strong> Introdução, Desenvolvimento (seções e subseções) e Conclusão.</li>
                <li>5. <strong>Referências:</strong> Lista completa das obras citadas.</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">3.3. Títulos e Subtítulos (NBR 6022:2018)</h3>
              <ul className="space-y-1 text-slate-600">
                <li>• <strong>Seção Primária</strong> (Ex.: <strong>1 INTRODUÇÃO</strong>): Caixa alta, negrito, tamanho 12.</li>
                <li>• <strong>Seção Secundária</strong> (Ex.: <strong>2.1 O Inconsciente Freudiano</strong>): Apenas a primeira letra em caixa alta, negrito, tamanho 12.</li>
                <li>• <strong>Seção Terciária</strong> (Ex.: 2.1.1 A primeira tópica): Apenas a primeira letra em caixa alta, sem negrito, tamanho 12.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">3.4. Citações (NBR 10520:2023)</h3>
              <ul className="space-y-1 text-slate-600">
                <li>• <strong>Sistema Autor-Data:</strong> &ldquo;O inconsciente é a outra cena&rdquo; (FREUD, 1915, p. 12).</li>
                <li>• <strong>Citação Curta (até 3 linhas):</strong> No corpo do texto, entre aspas duplas.</li>
                <li>• <strong>Citação Longa (+ de 3 linhas):</strong> Recuo de 4 cm à esquerda, fonte 10, espaçamento simples, sem aspas.</li>
                <li>• <strong>Citação Indireta:</strong> Ideia reescrita com indicação de autor e ano (FREUD, 1915).</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">3.5. Exemplos de Referências (NBR 6023:2025)</h3>
            <p className="text-slate-600">Ordem alfabética, alinhadas à esquerda, espaçamento simples entre linhas e separadas por um espaço simples:</p>
            <ul className="space-y-1.5 text-slate-700 pt-1 font-mono text-[11px]">
              <li><strong>Livro:</strong> FREUD, Sigmund. <strong>A interpretação dos sonhos</strong>. Rio de Janeiro: Imago, 2017.</li>
              <li><strong>Capítulo:</strong> LACAN, Jacques. O estádio do espelho como formador da função do eu. In: ______. <strong>Escritos</strong>. Rio de Janeiro: Jorge Zahar, 1998, p. 96-103.</li>
              <li><strong>Periódico:</strong> NASIO, Juan-David. O conceito de pulsão em Lacan. <strong>Revista Brasileira de Psicanálise</strong>, São Paulo, v. 50, n. 3, p. 120-135, set. 2016.</li>
              <li><strong>Online:</strong> ASSOCIAÇÃO SABER PSICANALÍTICO. <strong>Política editorial</strong>. [S.l.], 2024. Disponível em: https://www.asppsicanalise.com.br/revista. Acesso em: 17 nov. 2024.</li>
            </ul>
          </div>
        </section>

        {/* 4. Submissão e Checklist */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs sm:text-sm">
          <h2 className="text-xl font-serif font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-700" />
            4. Preparação, Anonimização e Checklist
          </h2>
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
            <p><strong>Arquivo aceito:</strong> <code>.doc</code> ou <code>.docx</code>, completamente anonimizado (retire nomes, filiações, e-mails e agradecimentos do corpo do texto e do nome do arquivo).</p>
            <p><strong>Propriedades ocultas do Word:</strong> Acesse <em>Arquivo &gt; Informações &gt; Inspecionar Documento &gt; Remover Propriedades do Documento e Informações Pessoais</em>.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-slate-500">
              Normas baseadas nas ABNT NBR 6022:2018, NBR 6023:2025, NBR 10520:2023 e NBR 14724:2024.
            </p>
            <Link
              href="/portal"
              className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl shadow-sm inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" /> Ir para o Portal de Submissão
            </Link>
          </div>
        </section>
      </div>
    </PublicShell>
  )
}
