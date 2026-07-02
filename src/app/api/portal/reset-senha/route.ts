import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendEmail, resetPasswordHtml } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email?.trim()) return NextResponse.json({ ok: true }) // resposta genérica sempre

    const normalizedEmail = email.trim().toLowerCase()

    // Procura em Escritorio e UsuarioEscritorio
    const escritorio = await prisma.escritorio.findUnique({ where: { email: normalizedEmail } })
    const usuario = !escritorio
      ? await prisma.usuarioEscritorio.findUnique({ where: { email: normalizedEmail } })
      : null

    const found = escritorio || usuario
    if (!found) return NextResponse.json({ ok: true }) // não revelar se email existe

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Invalida tokens anteriores para este email
    await prisma.passwordResetToken.updateMany({
      where: { email: normalizedEmail, used: false },
      data: { used: true },
    })

    await prisma.passwordResetToken.create({
      data: { email: normalizedEmail, token, expiresAt },
    })

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const link = `${baseUrl}/portal/reset-senha/${token}`
    const nome = 'nome' in found ? found.nome : normalizedEmail

    await sendEmail({
      to: normalizedEmail,
      subject: 'Redefinição de senha — Peticionaaki',
      html: resetPasswordHtml(link, nome),
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    // Sempre retorna ok para não revelar erros de infraestrutura
    return NextResponse.json({ ok: true })
  }
}
