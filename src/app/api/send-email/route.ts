import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const { to, subject, title, message, actionText, actionUrl } = await req.json()

    const user = process.env.GMAIL_USER || 'revistasaberpsicanalitico@gmail.com'
    const pass = process.env.GMAIL_APP_PASSWORD || ''

    if (!pass) {
      return NextResponse.json({ status: 'warning', message: 'Senha do Gmail não configurada na Vercel' })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
            .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            /* Cabeçalho com fundo branco puro para destacar a logo oficial */
            .header { background: #ffffff; padding: 28px 24px; text-align: center; border-bottom: 2px solid #e2e8f0; }
            .logo-revista { max-height: 85px; width: auto; display: block; margin: 0 auto 10px; }
            .body { padding: 32px 28px; font-size: 14px; line-height: 1.6; color: #334155; }
            .title { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
            .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; margin: 24px 0; }
            .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 20px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5; }
            .logo-asp { max-height: 38px; width: auto; display: block; margin: 0 auto 10px; }
            .tip { background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; padding: 10px; border-radius: 8px; font-size: 11px; margin-top: 20px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <img src="https://revista-saber-portal.vercel.app/logo-revista.png" alt="Revista Saber Psicanalítico" class="logo-revista" />
              <div style="font-size: 11px; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                ISSN 3086-8416 • Sistema Editorial
              </div>
            </div>
            <div class="body">
              <div class="title">${title || 'Notificação Editorial'}</div>
              <div style="white-space: pre-line;">${message}</div>
              ${actionUrl ? `<div style="text-align: center;"><a href="${actionUrl}" class="btn">${actionText || 'Acessar o Portal'}</a></div>` : ''}
              
              <div class="tip">
                <strong>Importante:</strong> Para garantir o recebimento dos avisos editoriais e comunicados da Revista Saber Psicanalítico, certifique-se de marcar esta mensagem como <em>"Não é spam"</em> ou adicionar nosso e-mail aos seus contatos.
              </div>
            </div>
            <div class="footer">
              <img src="https://revista-saber-portal.vercel.app/logo-asp.png" alt="ASP" class="logo-asp" />
              <p style="margin: 0; font-weight: 600; color: #334155;">Associação Saber Psicanalítico (ASP) — Entidade Mantenedora</p>
              <p style="margin: 4px 0 0;">CNPJ: 44.966.907/0001-85 • Rua Visconde de Inhaúma, 1361, sala 408 — Caruaru/PE</p>
              <p style="margin: 4px 0 0;">Contato: revistasaberpsicanalitico@gmail.com • <a href="https://www.asppsicanalise.com.br" style="color: #4f46e5; text-decoration: none;">www.asppsicanalise.com.br</a></p>
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
    console.error('Erro no envio de e-mail:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
