import nodemailer from 'nodemailer'
import { prisma } from './prisma'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const config = await prisma.smtpConfig.findFirst({ where: { ativo: true } })
  if (!config || !config.host) throw new Error('SMTP não configurado. Configure em Admin > SMTP.')

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
  })

  await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to,
    subject,
    html,
  })
}

export function resetPasswordHtml(link: string, nome: string) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:32px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#0f172a;padding:28px 32px">
      <p style="color:#fff;font-size:18px;font-weight:bold;margin:0">Peticionaaki</p>
    </div>
    <div style="padding:32px">
      <h2 style="color:#1e293b;margin-top:0">Redefinição de senha</h2>
      <p style="color:#475569;line-height:1.6">Olá, <strong>${nome}</strong>.</p>
      <p style="color:#475569;line-height:1.6">Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.</p>
      <a href="${link}" style="display:inline-block;margin:24px 0;background:#4f46e5;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px">
        Redefinir Senha
      </a>
      <p style="color:#94a3b8;font-size:13px">Se você não solicitou a redefinição, ignore este e-mail com segurança.</p>
      <p style="color:#cbd5e1;font-size:12px;margin-top:32px;border-top:1px solid #f1f5f9;padding-top:16px">
        Link direto: <a href="${link}" style="color:#6366f1">${link}</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

export function bemVindoHtml(nome: string, email: string) {
  return `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:32px">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="background:#0f172a;padding:28px 32px">
      <p style="color:#fff;font-size:18px;font-weight:bold;margin:0">Peticionaaki</p>
    </div>
    <div style="padding:32px">
      <h2 style="color:#1e293b;margin-top:0">Bem-vindo(a), ${nome}!</h2>
      <p style="color:#475569;line-height:1.6">Sua conta no Peticionaaki foi criada com sucesso.</p>
      <p style="color:#475569;line-height:1.6"><strong>E-mail de acesso:</strong> ${email}</p>
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal/login" style="display:inline-block;margin:24px 0;background:#4f46e5;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px">
        Acessar o Portal
      </a>
      <p style="color:#94a3b8;font-size:13px">Qualquer dúvida, entre em contato conosco.</p>
    </div>
  </div>
</body>
</html>`
}
