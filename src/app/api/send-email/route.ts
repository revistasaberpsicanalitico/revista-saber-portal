import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { to, subject, title, message, actionText, actionUrl } = await req.json()

    const user = process.env.GMAIL_USER || 'revistasaberpsicanalitico@gmail.com'
    const pass = process.env.GMAIL_APP_PASSWORD || ''

    if (!pass) {
      console.warn('GMAIL_APP_PASSWORD não configurada na Vercel.')
      return NextResponse.json({ status: 'warning', message: 'Senha não configurada' })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
            .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            .header { background: #1e1b4b; padding: 28px 24px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
            .header p { margin: 4px 0 0; font-size: 11px; color: #a5b4fc; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
            .body { padding: 32px 28px; line-height: 1.6; font-size: 14px; }
            .title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
            .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; margin-top: 20px; }
            .footer { background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>Revista Saber Psicanalítico</h1>
              <p>ISSN 3086-8416 • Notificação Editorial</p>
            </div>
            <div class="body">
              <div class="title">${title || 'Notificação Editorial'}</div>
              <div style="white-space: pre-line; color: #334155;">${message}</div>
              ${actionUrl ? `<div style="text-align: center; margin-top: 24px;"><a href="${actionUrl}" class="btn">${actionText || 'Acessar o Portal Editorial'}</a></div>` : ''}
            </div>
            <div class="footer">
              <p><strong>Associação Saber Psicanalítico (ASP)</strong> • CNPJ: 44.966.907/0001-85</p>
              <p>Rua Visconde de Inhaúma, 1361, sala 408 — Caruaru/PE</p>
              <p>Contato: revistasaberpsicanalitico@gmail.com • <a href="https://www.asppsicanalise.com.br" style="color: #6366f1;">www.asppsicanalise.com.br</a></p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: `"Revista Saber Psicanalítico" <${user}>`,
      to,
      subject,
      html: htmlContent,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao enviar e-mail:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
