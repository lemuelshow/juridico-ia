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
    conteudoHtml: peticao.conteudoHtml,
    tokensUsados: peticao.tokensUsados,
    modeloUsado: peticao.modeloUsado,
    finalizada: peticao.finalizada,
    fonteFamilia: peticao.fonteFamilia,
    fonteTamanho: peticao.fonteTamanho,
    espacamentoLinha: peticao.espacamentoLinha,
    alinhamentoTexto: peticao.alinhamentoTexto,
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
  if (typeof body.conteudoHtml === 'string') data.conteudoHtml = body.conteudoHtml
  if (body.finalizada !== undefined) data.finalizada = body.finalizada
  if (typeof body.fonteFamilia === 'string' && ['courier', 'arial', 'times', 'georgia'].includes(body.fonteFamilia)) {
    data.fonteFamilia = body.fonteFamilia
  }
  if (typeof body.fonteTamanho === 'number' && body.fonteTamanho >= 10 && body.fonteTamanho <= 20) {
    data.fonteTamanho = Math.round(body.fonteTamanho)
  }
  if (typeof body.espacamentoLinha === 'number' && body.espacamentoLinha >= 1 && body.espacamentoLinha <= 2.5) {
    data.espacamentoLinha = body.espacamentoLinha
  }
  if (typeof body.alinhamentoTexto === 'string' && ['justify', 'left'].includes(body.alinhamentoTexto)) {
    data.alinhamentoTexto = body.alinhamentoTexto
  }

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
