import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, FileText, ShieldCheck, Scale } from 'lucide-react'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2 text-xs print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o Site da Revista
          </Link>

          <div className="flex items-center gap-4 flex-wrap text-[11px] text-slate-300">
            <Link href="/edicao-atual" className="hover:text-white inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Edição Atual
            </Link>
            <Link href="/normas" className="hover:text-white inline-flex items-center gap-1">
              <FileText className="w-3 h-3" /> Normas
            </Link>
            <Link href="/politicas" className="hover:text-white inline-flex items-center gap-1">
              <Scale className="w-3 h-3" /> Políticas
            </Link>
            <Link href="/verificar" className="hover:text-emerald-300 inline-flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verificar Documento
            </Link>
          </div>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
