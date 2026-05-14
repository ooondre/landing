import Mailgun from 'mailgun.js'
import formData from 'form-data'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const { name, email, message, token } = body || {}

  const verified = await verifyTurnstileToken(token)

  if (!name || !email || !message) {
    return createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  if (!verified) {
    return createError({ statusCode: 401, statusMessage: 'CloudFlare Turnstile Bot Verification Unsucessful' })
  }

  if (!config.mailgun.apiKey || !config.mailgun.domain) {
    return createError({ statusCode: 500, statusMessage: 'Mailgun not configured' })
  }

  const mg = new Mailgun(formData).client({ username: 'api', key: config.mailgun.apiKey })

  const escapeHtml = (str: string) =>
    String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const submittedAt = new Date().toLocaleString()
  const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111;">
        <div style="max-width:680px;margin:0 auto;padding:24px;background:#fff;border-radius:8px;border:1px solid #e6e6e6;">
          <h2 style="margin:0 0 12px;font-size:20px">New contact form submission</h2>
          <p style="margin:0 0 18px;color:#6b6b6b">Received on ${escapeHtml(submittedAt)}</p>

          <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:18px">
            <tbody>
              <tr>
                <td style="width:160px;padding:8px 12px;background:#fafafa;border:1px solid #f0f0f0;font-weight:600">Name</td>
                <td style="padding:8px 12px;border:1px solid #f0f0f0">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="width:160px;padding:8px 12px;background:#fafafa;border:1px solid #f0f0f0;font-weight:600">Email</td>
                <td style="padding:8px 12px;border:1px solid #f0f0f0"><a href="mailto:${escapeHtml(email)}" style="color:#0366d6;text-decoration:none">${escapeHtml(email)}</a></td>
              </tr>
              <tr>
                <td style="width:160px;padding:8px 12px;background:#fafafa;border:1px solid #f0f0f0;font-weight:600;vertical-align:top">Message</td>
                <td style="padding:8px 12px;border:1px solid #f0f0f0;white-space:pre-wrap">${escapeHtml(message).replace(/\n/g, '<br/>')}</td>
              </tr>
            </tbody>
          </table>

          <p style="margin:0;color:#9b9b9b;font-size:12px">This message was sent from your website contact form.</p>
        </div>
      </div>
    `

  const text = `New contact form submission\n\nSubmitted: ${submittedAt}\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`

  try {
    const mailgunApiUrl = `https://api.mailgun.net/v3/${config.mailgun.domain}/messages`
    const response = await fetch(mailgunApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${config.mailgun.apiKey}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        from: config.mailgun.sender,
        to: config.mailgun.recipient,
        subject: `${name} Submitted a Contact Form`,
        html: html
      })
    })

    console.log(response)
    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData || 'Unknown error' }
    }

    const result = await response.json()
    return { success: true, message: 'Email sent successfully', result }
  } catch (err: Error | any) {
    return { success: false, error: 'Failed to send email', details: err.message || err }
  }
})
