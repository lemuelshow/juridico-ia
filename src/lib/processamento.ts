import { prisma } from './prisma'
import { gerarPeticao } from './claude'

// Gera a petição em segundo plano e grava o resultado. Antes de finalizar,
// confere se o processamento não foi cancelado nesse meio-tempo — se foi,
// descarta o resultado e preserva o status "cancelado".
export async function processarPeticao(
  formularioId: string,
  tipoCaso: string,
  dadosCliente: Record<string, string>,
  escritorioId?: string
) {
  try {
    const { conteudo, tokensUsados, modelo } = await gerarPeticao(tipoCaso, dadosCliente, escritorioId)

    const atual = await prisma.clienteForm.findUnique({ where: { id: formularioId }, select: { status: true } })
    if (atual?.status === 'cancelado') return

    await prisma.peticao.create({
      data: { conteudo, tokensUsados, modeloUsado: modelo, formularioId },
    })

    await prisma.clienteForm.update({ where: { id: formularioId }, data: { status: 'concluido' } })
  } catch (error) {
    console.error('Erro ao gerar petição em segundo plano:', error)
    const atual = await prisma.clienteForm.findUnique({ where: { id: formularioId }, select: { status: true } })
    if (atual?.status === 'cancelado') return
    await prisma.clienteForm.update({
      where: { id: formularioId },
      data: { status: 'erro' },
    }).catch(() => {})
  }
}
