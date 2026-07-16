import { NextRequest, NextResponse, after } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processarPeticao } from '@/lib/processamento'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nome, cpf, email, telefone, tipoCaso, descricao, dadosExtra, escritorioId } = body

    if (!nome || !cpf || !email || !telefone || !tipoCaso || !descricao) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    // Valida escritório se fornecido
    if (escritorioId) {
      const esc = await prisma.escritorio.findUnique({ where: { id: escritorioId }, select: { id: true, ativo: true } })
      if (!esc || !esc.ativo) return NextResponse.json({ error: 'Escritório inválido' }, { status: 400 })
    }

    const formulario = await prisma.clienteForm.create({
      data: {
        nome, cpf, email, telefone, tipoCaso, descricao,
        dadosExtra: JSON.stringify(dadosExtra || {}),
        status: 'processando',
        ...(escritorioId && { escritorioId }),
      },
    })

    // Gera a petição em segundo plano: o cliente já recebe a confirmação
    // de envio sem precisar esperar a IA terminar de redigir o documento.
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
    console.error('Erro ao processar formulário:', error)
    const msg = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
