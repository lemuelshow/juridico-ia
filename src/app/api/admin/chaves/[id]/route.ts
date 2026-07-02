import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  if (body.ativo === true) {
    await prisma.claudeConfig.updateMany({ data: { ativo: false } })
  }

  const updated = await prisma.claudeConfig.update({ where: { id }, data: body })
  return NextResponse.json({ ...updated, chaveApi: updated.chaveApi.slice(0, 8) + '••••••••' })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.claudeConfig.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
