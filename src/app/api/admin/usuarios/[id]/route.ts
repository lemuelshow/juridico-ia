import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  if (body.senha) {
    body.senha = await bcrypt.hash(body.senha, 12)
  }

  const updated = await prisma.usuario.update({
    where: { id },
    data: body,
    select: { id: true, email: true, nome: true, tokenLimit: true, tokensUsados: true, ativo: true, createdAt: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.usuario.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
