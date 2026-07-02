import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let config = await prisma.smtpConfig.findFirst({ where: { ativo: true } })
  if (!config) {
    config = await prisma.smtpConfig.create({
      data: { host: '', port: 587, user: '', password: '', fromName: 'Peticionaaki', fromEmail: '', secure: false },
    })
  }
  // Never expose password in GET
  return NextResponse.json({ ...config, password: config.password ? '••••••••' : '' })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  let config = await prisma.smtpConfig.findFirst({ where: { ativo: true } })

  const data: Record<string, unknown> = {
    host: body.host ?? '',
    port: Number(body.port) || 587,
    user: body.user ?? '',
    fromName: body.fromName ?? 'Peticionaaki',
    fromEmail: body.fromEmail ?? '',
    secure: Boolean(body.secure),
  }
  // Only update password if explicitly changed (not the masked value)
  if (body.password && body.password !== '••••••••') {
    data.password = body.password
  }

  if (config) {
    config = await prisma.smtpConfig.update({ where: { id: config.id }, data })
  } else {
    config = await prisma.smtpConfig.create({ data: { ...data, password: body.password || '' } as never })
  }

  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  // Test connection
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { to } = await req.json()
  if (!to) return NextResponse.json({ error: 'E-mail de destino obrigatório' }, { status: 400 })

  try {
    const { sendEmail } = await import('@/lib/email')
    await sendEmail({
      to,
      subject: 'Teste de SMTP — Peticionaaki',
      html: '<p>E-mail de teste enviado com sucesso pelo Peticionaaki. ✅</p>',
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
