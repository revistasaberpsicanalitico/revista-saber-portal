import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const event = await req.json()
    const eventType = event?.type || ''

    if (eventType !== 'email.received' && eventType !== 'inbox.email.received') {
      return NextResponse.json({ ignored: true })
    }

    const resendApiKey = process.env.RESEND_API_KEY || ''
    const forwardTo = process.env.GMAIL_USER || 'revistasaberpsicanalitico@gmail.com'

    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY não configurada' }, { status: 500 })
    }

    const data = event?.data || {}
    const emailId = data.email_id || data.email?.id
    const inboxId = data.inbox_id
    const threadId = data.thread_id
    const metaEmail = data.email || data

    if (!emailId) {
      return NextResponse.json({ ignored: true, reason: 'Sem email_id' })
    }

    // Evita encaminhar e-mails enviados pela própria caixa (loop)
    const rawFrom = String(metaEmail.from || '')
    if (metaEmail.direction === 'outbound' || rawFrom.toLowerCase().includes('revista@asppsicanalise.com.br')) {
      return NextResponse.json({ skipped: true, reason: 'Mensagem de saída' })
    }

    // 1. Busca o conteúdo completo do e-mail recebido
    let fullEmail: any = null

    if (inboxId && threadId) {
      const inboxRes = await fetch(
        `https://api.resend.com/inboxes/${inboxId}/threads/${threadId}/emails/${emailId}`,
        { headers: { Authorization: `Bearer ${resendApiKey}` } }
      )
      if (inboxRes.ok) {
        fullEmail = await inboxRes.json()
      }
    }

    if (!fullEmail) {
      const recRes = await fetch(
        `https://api.resend.com/emails/receiving/${emailId}`,
        { headers: { Authorization: `Bearer ${resendApiKey}` } }
      )
      if (recRes.ok) {
        fullEmail = await recRes.json()
      }
    }

    const originalFrom = fullEmail?.from || rawFrom || 'Remetente desconhecido'
    const originalTo = Array.isArray(fullEmail?.to)
      ? fullEmail.to.join(', ')
      : Array.isArray(metaEmail.to)
        ? metaEmail.to.join(', ')
        : 'revista@asppsicanalise.com.br'
    const originalSubject = fullEmail?.subject || metaEmail.subject || '(Sem assunto)'
    const originalHtml = fullEmail?.html || ''
    const originalText = fullEmail?.text || ''

    // 2. Busca anexos (se houver)
    const forwardedAttachments: { filename: string; content: string }[] = []
    try {
      const attListRes = await fetch(
        `https://api.resend.com/emails/receiving/${emailId}/attachments`,
        { headers: { Authorization: `Bearer ${resendApiKey}` } }
      )
      if (attListRes.ok) {
        const attJson = await attListRes.json()
        const attList = Array.isArray(attJson?.data) ? attJson.data : []
        for (const att of attList) {
          if (att.download_url) {
            const fileRes = await fetch(att.download_url)
            if (fileRes.ok) {
              const arrBuf = await fileRes.arrayBuffer()
              if (arrBuf.byteLength <= 10 * 1024 * 1024) {
                forwardedAttachments.push({
                  filename: att.filename || 'anexo',
                  content: Buffer.from(arrBuf).toString('base64'),
                })
              }
            }
          }
        }
      }
    } catch (attErr) {
      console.warn('Aviso ao buscar anexos recebidos:', attErr)
    }

    // Extrai apenas o e-mail puro para o Reply-To
    const emailMatch = originalFrom.match(/<([^>]+)>/)
    const replyToAddress = emailMatch ? emailMatch[1] : originalFrom

    const safeBodyHtml = originalHtml
      ? originalHtml
      : `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap; line-height: 1.5;">${originalText || '(Mensagem sem conteúdo de texto)'}</pre>`

    const wrappedHtml = `
      <div style="font-family: Arial, sans-serif; color: #1e293b;">
        <div style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; font-size: 12px;">
          <div><strong>📬 Mensagem recebida em:</strong> ${originalTo}</div>
          <div><strong>De:</strong> ${originalFrom}</div>
          <div><strong>Assunto:</strong> ${originalSubject}</div>
          <div style="margin-top: 6px; color: #475569;"><em>Obs.: Para responder mostrando o endereço oficial <strong>revista@asppsicanalise.com.br</strong>, responda pela aba <strong>Inboxes</strong> no Resend.</em></div>
        </div>
        <div>${safeBodyHtml}</div>
      </div>
    `

    // 3. Encaminha para o Gmail da revista
    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Caixa Revista (Encaminhado) <revista@asppsicanalise.com.br>',
        to: [forwardTo],
        reply_to: replyToAddress,
        subject: `[revista@asppsicanalise] ${originalSubject}`,
        html: wrappedHtml,
        attachments: forwardedAttachments.length > 0 ? forwardedAttachments : undefined,
      }),
    })

    if (!sendRes.ok) {
      const errTxt = await sendRes.text()
      console.error('Erro ao encaminhar para o Gmail:', errTxt)
      return NextResponse.json({ error: errTxt }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro no webhook inbound Resend:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
