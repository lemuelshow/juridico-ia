import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const formularios = await prisma.clienteForm.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      nome: true,
      cpf: true,
      email: true,
      tipoCaso: true,
      status: true,
      createdAt: true,
      peticao: { select: { id: true, tokensUsados: true, modeloUsado: true, createdAt: true } },
    },
  })

  const peticoes = formularios.map(f => ({
    id: f.peticao?.id ?? f.id,
    processando: !f.peticao && f.status === 'processando',
    erro: f.status === 'erro',
    cancelado: f.status === 'cancelado',
    createdAt: f.peticao?.createdAt ?? f.createdAt,
    tokensUsados: f.peticao?.tokensUsados ?? 0,
    modeloUsado: f.peticao?.modeloUsado ?? '',
    formulario: { nome: f.nome, cpf: f.cpf, email: f.email, tipoCaso: f.tipoCaso, status: f.status },
  }))

  return NextResponse.json(peticoes)
}
