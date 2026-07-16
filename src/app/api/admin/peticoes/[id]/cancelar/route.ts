import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const formulario = await prisma.clienteForm.findUnique({
    where: { id },
    select: { status: true, peticao: { select: { id: true } } },
  })
  if (!formulario) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  if (formulario.peticao || formulario.status !== 'processando') {
    return NextResponse.json({ error: 'Este processamento não pode ser cancelado' }, { status: 400 })
  }

  await prisma.clienteForm.update({ where: { id }, data: { status: 'cancelado' } })
  return NextResponse.json({ ok: true })
}
