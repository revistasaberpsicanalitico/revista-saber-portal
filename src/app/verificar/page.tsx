'use client'

import React, { useState, useEffect } from 'react'
import { ShieldCheck, Search, AlertCircle } from 'lucide-react'
import PublicShell from '@/components/PublicShell'
import { supabase } from '@/lib/supabase'
import { JOURNAL_INFO } from '@/lib/siteConfig'

export default function VerificarDocumentoPage() {
  const [codeInput, setCodeInput] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)

  const runVerification = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase()
    if (!code) return
    setChecking(true)
    setResult(null)

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('verify_document', { code })
      if (!rpcError && rpcData && rpcData.valid) {
        setResult({ ...rpcData, checkedCode: code })
      } else {
        setResult({ valid: false, checkedCode: code })
      }
    } catch {
      setResult({ valid: false, checkedCode: code })
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const qCode = params.get('codigo')
      if (qCode) {
        setCodeInput(qCode.toUpperCase())
        runVerification(qCode)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runVerification(codeInput)
  }

  return (
    <PublicShell>
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-2.5">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
            Consulta Pública Oficial • ISSN {JOURNAL_INFO.issn}
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold">
            Verificar Autenticidade de Documento
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Confirme a validade eletrônica de Declarações de Aceite, Comunicações Editoriais e Certificados de Parecerista Ad-hoc emitidos pela Revista Saber Psicanalítico.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Código de Verificação do Documento *
              </label>
              <input
                type="text"
                required
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Ex: ASP-ACE-1A2B3C4D ou ASP-PAR-1A2B3C4D"
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl font-mono uppercase text-center tracking-wider font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={checking || !codeInput.trim()}
              className="w-full py-3 px-4 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 transition"
            >
              <Search className="w-4 h-4" />
              {checking ? 'Consultando Registro Oficial...' : 'Verificar Autenticidade'}
            </button>
          </form>

          {result && (
            result.valid ? (
              <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-slate-800 space-y-3 text-xs shadow-sm">
                <div className="flex items-center gap-2.5 border-b border-emerald-200 pb-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h2 className="font-bold text-emerald-900 text-sm">Documento Oficial Autêntico</h2>
                    <p className="text-[11px] text-emerald-700">
                      Verificação eletrônica confirmada nos registros da {JOURNAL_INFO.name}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p><strong>Tipo:</strong> {result.type}</p>
                  <p><strong>Titular:</strong> {result.person}</p>
                  {result.title && <p><strong>Trabalho:</strong> &ldquo;{result.title}&rdquo;</p>}
                  <p><strong>Data de Registro:</strong> {result.date}</p>
                  <p><strong>Emissor:</strong> {JOURNAL_INFO.name} (ISSN {JOURNAL_INFO.issn})</p>
                  <p><strong>Responsável:</strong> Dr. Edson Leandro de Almeida (Editor-Chefe)</p>
                </div>
                <div className="pt-2.5 border-t border-emerald-200 flex items-center justify-between text-[11px] text-emerald-800 font-mono">
                  <span>Código: <strong>{result.checkedCode}</strong></span>
                  <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded font-semibold">
                    Status: Válido
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/70 text-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>Documento Não Localizado</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  O código <strong>{result.checkedCode}</strong> não corresponde a nenhum documento oficial emitido pela {JOURNAL_INFO.name}. Confira se não houve erro de digitação nos caracteres ou hífens.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </PublicShell>
  )
}
