'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyCitationButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg inline-flex items-center gap-1.5 shadow-sm transition"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-emerald-700">Citação Copiada!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-indigo-600" />
          <span>Copiar Citação (ABNT)</span>
        </>
      )}
    </button>
  )
}
