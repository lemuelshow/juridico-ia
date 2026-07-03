import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getPeticaoAutorizada(id: string, escritorioId: string | undefined) {
  const peticao = await prisma.peticao.findUnique({
    where: { id },
    include: { formulario: { select: { escritorioId: true } } },
  })
  if (!peticao) return null
  if (peticao.formulario.escritorioId !== escritorioId) return null
  return peticao
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  const { id } = await params

  const peticao = await prisma.peticao.findUnique({
    where: { id },
    include: {
      formulario: {
        include: {
          escritorio: { select: { nome: true, papelTimbrado: true, logoBase64: true } },
        },
      },
    },
  })

  if (!peticao) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  if (peticao.formulario.escritorioId !== escritorioId) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  return NextResponse.json({
    id: peticao.id,
    conteudo: peticao.conteudo,
    conteudoEditado: peticao.conteudoEditado,
    tokensUsados: peticao.tokensUsados,
    modeloUsado: peticao.modeloUsado,
    finalizada: peticao.finalizada,
    createdAt: peticao.createdAt,
    formulario: {
      nome: peticao.formulario.nome,
      cpf: peticao.formulario.cpf,
      email: peticao.formulario.email,
      telefone: peticao.formulario.telefone,
      tipoCaso: peticao.formulario.tipoCaso,
      descricao: peticao.formulario.descricao,
      dadosExtra: peticao.formulario.dadosExtra,
    },
    escritorio: peticao.formulario.escritorio,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  const { id } = await params
  const body = await req.json()

  const peticao = await getPeticaoAutorizada(id, escritorioId)
  if (!peticao) return NextResponse.json({ error: 'Não encontrado ou acesso negado' }, { status: 404 })

  const data: Record<string, unknown> = {}
  if (body.conteudoEditado !== undefined) data.conteudoEditado = body.conteudoEditado
  if (body.finalizada !== undefined) data.finalizada = body.finalizada

  const updated = await prisma.peticao.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  const { id } = await params

  const peticao = await getPeticaoAutorizada(id, escritorioId)
  if (peticao) {
    // exclui petição e formulário em cascata
    await prisma.peticao.delete({ where: { id } })
    await prisma.clienteForm.delete({ where: { id: peticao.formularioId } })
    return NextResponse.json({ ok: true })
  }

  // Ainda processando/com erro: nesse caso o id recebido é o do próprio ClienteForm
  const formulario = await prisma.clienteForm.findUnique({ where: { id }, select: { id: true, escritorioId: true } })
  if (!formulario || formulario.escritorioId !== escritorioId) {
    return NextResponse.json({ error: 'Não encontrado ou acesso negado' }, { status: 404 })
  }
  await prisma.clienteForm.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
