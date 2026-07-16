import { NextRequest, NextResponse, after } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processarPeticao } from '@/lib/processamento'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const formulario = await prisma.clienteForm.findUnique({
    where: { id },
    select: {
      status: true, nome: true, cpf: true, email: true, telefone: true, tipoCaso: true,
      descricao: true, dadosExtra: true, escritorioId: true,
      peticao: { select: { id: true } },
    },
  })
  if (!formulario) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  if (formulario.peticao || !['erro', 'cancelado'].includes(formulario.status)) {
    return NextResponse.json({ error: 'Este processamento não pode ser reprocessado' }, { status: 400 })
  }

  await prisma.clienteForm.update({ where: { id }, data: { status: 'processando' } })

  let dadosExtra: Record<string, string> = {}
  try {
    const parsed = JSON.parse(formulario.dadosExtra)
    if (typeof parsed === 'object' && parsed) dadosExtra = parsed
  } catch {
    // dados extras corrompidos — segue sem eles
  }

  const dadosCompletos: Record<string, string> = {
    'Nome do Cliente': formulario.nome,
    'CPF': formulario.cpf,
    'E-mail': formulario.email,
    'Telefone': formulario.telefone,
    'Tipo de Caso': formulario.tipoCaso,
    'Descrição da Situação': formulario.descricao,
    ...dadosExtra,
  }

  after(() => processarPeticao(id, formulario.tipoCaso, dadosCompletos, formulario.escritorioId ?? undefined))

  return NextResponse.json({ ok: true })
}
