import { NextRequest, NextResponse, after } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { processarPeticao } from '@/lib/processamento'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  if (!escritorioId) return NextResponse.json({ error: 'Escritório não encontrado na sessão' }, { status: 400 })

  try {
    const body = await req.json()
    const { nome, cpf, email, telefone, tipoCaso, descricao, dadosExtra } = body

    if (!nome || !cpf || !email || !telefone || !tipoCaso || !descricao) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const formulario = await prisma.clienteForm.create({
      data: {
        nome, cpf, email, telefone, tipoCaso, descricao,
        dadosExtra: JSON.stringify(dadosExtra || {}),
        status: 'processando',
        escritorioId,
      },
    })

    const dadosCompletos: Record<string, string> = {
      'Nome do Cliente': nome,
      'CPF': cpf,
      'E-mail': email,
      'Telefone': telefone,
      'Tipo de Caso': tipoCaso,
      'Descrição da Situação': descricao,
      ...(typeof dadosExtra === 'object' ? dadosExtra : {}),
    }

    after(() => processarPeticao(formulario.id, tipoCaso, dadosCompletos, escritorioId))

    return NextResponse.json({ ok: true, formularioId: formulario.id })
  } catch (error) {
    console.error('Erro ao processar formulário (portal):', error)
    const msg = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
