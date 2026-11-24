export interface BoardMember {
  name: string
  role: string
  bio: string
  institution: string
  email: string
  lattesUrl?: string
  orcid?: string
  photoUrl?: string
}

export const EDITORIAL_BOARD: BoardMember[] = [
  {
    name: 'Edson Leandro de Almeida',
    role: 'Editor-chefe',
    bio: 'Doutor em Educação pela Universidade Federal da Paraíba (UFPB), mestre em Educação, Culturas e Identidades pela Universidade Federal Rural de Pernambuco e Fundação Joaquim Nabuco (UFRPE/FUNDAJ), historiador e psicanalista com formação pela Associação Saber Psicanalítico (ASP).',
    institution: 'Faculdade Anhanguera e Associação Saber Psicanalítico (ASP)',
    email: 'edsonfilo@gmail.com',
    lattesUrl: '',
    orcid: '',
    photoUrl: '',
  },
  {
    name: 'José Aniervson Souza dos Santos',
    role: 'Editor-adjunto',
    bio: 'Mestre em Educação, Culturas e Identidades pela Universidade Federal Rural de Pernambuco e Fundação Joaquim Nabuco (UFRPE/FUNDAJ), especialista em Juventude e em Sexualidade Humana, pedagogo, licenciado em Ciências Biológicas e psicanalista.',
    institution: 'Associação Saber Psicanalítico (ASP)',
    email: 'aniervson@gmail.com',
    lattesUrl: '',
    orcid: '',
    photoUrl: '',
  },
  {
    name: 'Andrea de Lima Ribeiro',
    role: 'Conselho Editorial',
    bio: 'Especialista em Psicanálise Clínica Freudiana e em Ciências Sociais Aplicadas, psicóloga e psicanalista com formação pela Associação Saber Psicanalítico (ASP).',
    institution: 'Faculdade de Ciências Aplicadas de Limoeiro - PE (FACAL) e Associação Saber Psicanalítico (ASP)',
    email: 'ribeiroandreaalr@gmail.com',
    lattesUrl: '',
    orcid: '',
    photoUrl: '',
  },
  {
    name: 'Gilvânia Lima Magalhães',
    role: 'Conselho Editorial',
    bio: 'Especialista em Psicanálise Clínica, com MBA em Gestão de Pessoas e Recursos Humanos, pedagoga e psicanalista com formação pela Associação Saber Psicanalítico (ASP).',
    institution: 'Associação Saber Psicanalítico (ASP)',
    email: 'gillima039@gmail.com',
    lattesUrl: '',
    orcid: '',
    photoUrl: '',
  },
  {
    name: 'Samuel Barbosa da Silva',
    role: 'Conselho Editorial',
    bio: 'Especialista em Psicanálise pela FAVEN e psicanalista com formação pela Associação Saber Psicanalítico (ASP), com atuação em Administração e Logística.',
    institution: 'Associação Saber Psicanalítico (ASP)',
    email: 'samuelbarbosapsi@gmail.com',
    lattesUrl: '',
    orcid: '',
    photoUrl: '',
  },
]

export const PRESENTATION_CONTENT = {
  intro:
    'A Revista Saber Psicanalítico é uma publicação técnico-científica da Associação Saber Psicanalítico (ASP), de periodicidade semestral, publicada nos meses de junho e dezembro, em formato eletrônico e de acesso aberto.',
  mission:
    'Nossa missão é contribuir para a produção e a circulação do conhecimento psicanalítico, promovendo o diálogo entre a elaboração teórica, a experiência clínica e as questões sociais e culturais do nosso tempo.',
  orientation:
    'A revista compreende a Psicanálise como um campo de investigação e de escuta da singularidade, aberto ao debate crítico e à interlocução com outras áreas do conhecimento. Sua orientação editorial valoriza o rigor conceitual, a diversidade de perspectivas e a responsabilidade ética na produção e na divulgação dos trabalhos.',
  audience:
    'A publicação destina-se a pesquisadores, psicanalistas, profissionais de áreas afins, docentes e estudantes interessados nas contribuições da Psicanálise para a compreensão do sujeito e de suas relações com a cultura e a sociedade.',
  objectives: [
    'Divulgar pesquisas e reflexões teóricas no campo da Psicanálise.',
    'Favorecer o diálogo entre a teoria psicanalítica e a prática clínica.',
    'Estimular interlocuções com a educação, as ciências humanas, a saúde e as artes.',
    'Ampliar o acesso ao conhecimento e fortalecer o intercâmbio entre autores e leitores.',
  ],
  disclaimer:
    'Os trabalhos publicados são de responsabilidade de seus autores e não representam, necessariamente, o posicionamento da equipe editorial ou da instituição responsável.',
}

export const EXPEDIENTE_CONTENT = {
  cycle:
    'A revista tem periodicidade semestral, com fascículos publicados em junho e dezembro. Cada volume reúne dois números e corresponde ao ciclo editorial de dezembro a novembro. O número 1 abrange dezembro a maio, e o número 2, junho a novembro. O primeiro volume iniciou-se em dezembro de 2025.',
  format: 'Publicação eletrônica de acesso aberto.',
  graphicDesign: 'José Aniervson Souza dos Santos',
}
