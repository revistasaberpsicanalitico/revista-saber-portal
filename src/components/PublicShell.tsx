'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Upload, UserCheck, ShieldCheck, Search } from 'lucide-react'
import { JOURNAL_INFO } from '@/lib/siteConfig'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Início' },
    { href: '/edicao-atual', label: 'Edição Atual' },
    { href: '/edicoes', label: 'Edições Anteriores' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/normas', label: 'Normas' },
    { href: '/politicas', label: 'Políticas' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Faixa institucional superior */}
      <div className="bg-slate-900 text-slate-200 text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-amber-300 tracking-wide">
              ISSN {JOURNAL_INFO.issn}
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline">{JOURNAL_INFO.periodicity}</span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-emerald-300 font-medium">
              Acesso Aberto (CC-BY 4.0) • APC R$ 0,00
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/busca"
              className="hover:text-white transition inline-flex items-center gap-1 text-slate-300"
            >
              <Search className="w-3 h-3" /> Buscar Artigos
            </Link>
            <Link
              href="/verificar"
              className="hover:text-emerald-300 transition inline-flex items-center gap-1 text-slate-300"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verificar Documento
            </Link>
            <Link
              href="/portal?pareceristas=true"
              className="hover:text-amber-300 transition inline-flex items-center gap-1 font-medium"
            >
              <UserCheck className="w-3 h-3 text-amber-400" />
              Chamada para Pareceristas
            </Link>
          </div>
        </div>
      </div>

      {/* Cabeçalho principal */}
      <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo-revista.png"
              alt={JOURNAL_INFO.name}
              className="h-14 sm:h-16 md:h-20 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div>
              <span className="block font-serif text-base sm:text-xl font-bold text-slate-900 leading-tight">
                {JOURNAL_INFO.name}
              </span>
              <span className="block text-[11px] font-bold tracking-wide text-indigo-800 mt-0.5">
                ISSN {JOURNAL_INFO.issn}
                <span className="hidden sm:inline font-semibold text-slate-500">
                  {' '}• {JOURNAL_INFO.maintainer}
                </span>
              </span>
            </div>
          </Link>

          {/* Navegação Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/portal"
              className="ml-2 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-sm inline-flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              Submeter / Portal
            </Link>
          </nav>

          {/* Botão Mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menu"
            className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Mobile */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1.5 shadow-md">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/busca"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Buscar Artigos
            </Link>
            <Link
              href="/verificar"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Verificar Autenticidade de Documento
            </Link>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/portal"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 px-4 bg-indigo-700 text-white text-xs font-bold rounded-lg text-center inline-flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Submeter / Acessar Portal
              </Link>
              <Link
                href="/portal?pareceristas=true"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2 px-4 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-lg text-center inline-flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" /> Chamada para Pareceristas
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Conteúdo */}
      <main className="flex-1">{children}</main>

      {/* Rodapé Institucional */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white/95 p-2.5 rounded-xl w-fit">
              <img
                src="/logo-asp.png"
                alt={JOURNAL_INFO.maintainer}
                className="h-9 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{JOURNAL_INFO.maintainer}</p>
              <p className="text-slate-400 mt-0.5">CNPJ: {JOURNAL_INFO.cnpj}</p>
              <p className="text-slate-400 mt-1 leading-relaxed">{JOURNAL_INFO.address}</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Navegação Rápida
            </h4>
            <ul className="space-y-1.5 text-slate-300">
              <li><Link href="/edicao-atual" className="hover:text-amber-300 transition">Edição Atual</Link></li>
              <li><Link href="/edicoes" className="hover:text-amber-300 transition">Edições Anteriores</Link></li>
              <li><Link href="/busca" className="hover:text-amber-300 transition">Buscar Artigos</Link></li>
              <li><Link href="/sobre" className="hover:text-amber-300 transition">Apresentação, Expediente e Conselho</Link></li>
              <li><Link href="/normas" className="hover:text-amber-300 transition">Normas para Publicação (ABNT)</Link></li>
              <li><Link href="/politicas" className="hover:text-amber-300 transition">Políticas Editoriais e Ética (COPE)</Link></li>
              <li><Link href="/verificar" className="hover:text-emerald-300 transition">Verificar Autenticidade de Documento</Link></li>
              <li><Link href="/portal" className="hover:text-amber-300 transition">Portal de Submissão e Pareceres</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Acesso Aberto & Contato
            </h4>
            <p className="text-slate-300 leading-relaxed">
              E-mail editorial:{' '}
              <a href={`mailto:${JOURNAL_INFO.email}`} className="text-amber-300 hover:underline font-semibold">
                {JOURNAL_INFO.email}
              </a>
              <br />
              Site mantenedora:{' '}
              <a
                href={JOURNAL_INFO.maintainerSite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-300 hover:underline"
              >
                www.asppsicanalise.com.br
              </a>
            </p>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
              <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Acesso Aberto Imediato
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Conteúdo licenciado sob{' '}
                <a
                  href={JOURNAL_INFO.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  {JOURNAL_INFO.license}
                </a>.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 px-4 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} {JOURNAL_INFO.name} (ISSN {JOURNAL_INFO.issn}) • {JOURNAL_INFO.maintainer}
        </div>
      </footer>
    </div>
  )
}
