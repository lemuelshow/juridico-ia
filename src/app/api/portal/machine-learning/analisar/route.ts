import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { extrairTextoDocumento } from '@/lib/document-extract'
import { analisarPadraoPeticoes } from '@/lib/claude'

const MAX_CHARS_POR_DOC = 30000
const MAX_CHARS_TOTAL = 100000

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  if (!escritorioId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const tipoCaso = body?.tipoCaso as string | undefined
  if (!tipoCaso) return NextResponse.json({ error: 'tipoCaso é obrigatório' }, { status: 400 })

  const documentos = await prisma.documentoTreinamento.findMany({ where: { escritorioId, tipoCaso } })
  if (documentos.length === 0) {
    return NextResponse.json({ error: 'Nenhum documento enviado para este tipo de caso' }, { status: 400 })
  }

  try {
    const paginasDetectadas: number[] = []
    const textos: string[] = []
    let totalChars = 0

    for (const doc of documentos) {
      const buffer = Buffer.from(doc.dados, 'base64')
      const { texto, paginas } = await extrairTextoDocumento(buffer, doc.mimeType)
      if (paginas) paginasDetectadas.push(paginas)

      const restante = MAX_CHARS_TOTAL - totalChars
      if (restante <= 0) break
      const textoCortado = texto.slice(0, Math.min(MAX_CHARS_POR_DOC, restante))
      totalChars += textoCortado.length
      textos.push(textoCortado)
    }

    const analise = await analisarPadraoPeticoes(tipoCaso, textos)
    analise.paginasMedia = paginasDetectadas.length > 0
      ? Math.round(paginasDetectadas.reduce((a, b) => a + b, 0) / paginasDetectadas.length)
      : null

    const padrao = await prisma.padraoPeticao.upsert({
      where: { escritorioId_tipoCaso: { escritorioId, tipoCaso } },
      create: {
        escritorioId,
        tipoCaso,
        padraoJson: JSON.stringify(analise),
        qtdDocumentosAnalisados: documentos.length,
      },
      update: {
        padraoJson: JSON.stringify(analise),
        qtdDocumentosAnalisados: documentos.length,
      },
    })

    return NextResponse.json({
      padraoJson: analise,
      qtdDocumentosAnalisados: padrao.qtdDocumentosAnalisados,
      updatedAt: padrao.updatedAt,
    })
  } catch (error) {
    console.error('Erro ao analisar padrão de petições:', error)
    const msg = error instanceof Error ? error.message : 'Erro ao analisar documentos'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
