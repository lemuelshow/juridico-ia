import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  if (!escritorioId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const doc = await prisma.documentoTreinamento.findUnique({ where: { id }, select: { id: true, escritorioId: true } })
  if (!doc || doc.escritorioId !== escritorioId) {
    return NextResponse.json({ error: 'Não encontrado ou acesso negado' }, { status: 404 })
  }

  await prisma.documentoTreinamento.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
