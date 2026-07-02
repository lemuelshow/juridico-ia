import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const perguntas = await prisma.perguntaFormulario.findMany({
    where: { templateId: id },
    orderBy: { ordem: 'asc' },
  })
  return NextResponse.json(perguntas)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  if (!body.texto || !body.tipo)
    return NextResponse.json({ error: 'texto e tipo são obrigatórios' }, { status: 400 })

  const last = await prisma.perguntaFormulario.findFirst({
    where: { templateId: id },
    orderBy: { ordem: 'desc' },
  })

  const pergunta = await prisma.perguntaFormulario.create({
    data: {
      templateId: id,
      ordem: (last?.ordem ?? 0) + 1,
      texto: body.texto,
      tipo: body.tipo,
      placeholder: body.placeholder || '',
      obrigatoria: body.obrigatoria ?? true,
      opcoes: body.opcoes || '[]',
      campoDetalhe: body.campoDetalhe ?? false,
      detalheLabel: body.detalheLabel || '',
    },
  })
  return NextResponse.json(pergunta, { status: 201 })
}
