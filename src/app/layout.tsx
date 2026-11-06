import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Revista Saber Psicanalítico - Sistema Editorial',
  description: 'Portal de submissões e avaliação de artigos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  )
}
