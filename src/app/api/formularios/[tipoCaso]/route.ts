import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ tipoCaso: string }> }) {
  const { tipoCaso } = await params

  const template = await prisma.formularioTemplate.findFirst({
    where: { tipoCaso, ativo: true },
    include: { perguntas: { orderBy: { ordem: 'asc' } } },
  })

  if (!template) return NextResponse.json(null)

  return NextResponse.json({
    id: template.id,
    nome: template.nome,
    perguntas: template.perguntas.map((p) => ({
      id: p.id,
      ordem: p.ordem,
      texto: p.texto,
      tipo: p.tipo,
      placeholder: p.placeholder,
      obrigatoria: p.obrigatoria,
      secao: p.secao,
      opcoes: JSON.parse(p.opcoes || '[]') as string[],
      campoDetalhe: p.campoDetalhe,
      detalheLabel: p.detalheLabel,
    })),
  })
}
