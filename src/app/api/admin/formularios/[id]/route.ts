import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const template = await prisma.formularioTemplate.findUnique({
    where: { id },
    include: { perguntas: { orderBy: { ordem: 'asc' } } },
  })
  if (!template) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(template)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const { nome, ativo } = await req.json()
  const template = await prisma.formularioTemplate.update({
    where: { id },
    data: { ...(nome !== undefined && { nome }), ...(ativo !== undefined && { ativo }) },
  })
  return NextResponse.json(template)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.formularioTemplate.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
