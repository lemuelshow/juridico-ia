import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const data = await req.json()

  const pergunta = await prisma.perguntaFormulario.update({
    where: { id },
    data: {
      ...(data.texto !== undefined && { texto: data.texto }),
      ...(data.tipo !== undefined && { tipo: data.tipo }),
      ...(data.placeholder !== undefined && { placeholder: data.placeholder }),
      ...(data.obrigatoria !== undefined && { obrigatoria: data.obrigatoria }),
      ...(data.opcoes !== undefined && { opcoes: data.opcoes }),
      ...(data.campoDetalhe !== undefined && { campoDetalhe: data.campoDetalhe }),
      ...(data.detalheLabel !== undefined && { detalheLabel: data.detalheLabel }),
      ...(data.ordem !== undefined && { ordem: data.ordem }),
    },
  })
  return NextResponse.json(pergunta)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  await prisma.perguntaFormulario.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
