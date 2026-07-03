import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TIPOS_ACEITOS } from '@/lib/document-extract'

const LIMITE_BYTES = 15 * 1024 * 1024
const MAX_DOCUMENTOS = 5

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  if (!escritorioId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const tipoCaso = req.nextUrl.searchParams.get('tipoCaso')
  if (!tipoCaso) return NextResponse.json({ error: 'tipoCaso é obrigatório' }, { status: 400 })

  const [documentos, padrao] = await Promise.all([
    prisma.documentoTreinamento.findMany({
      where: { escritorioId, tipoCaso },
      select: { id: true, nomeArquivo: true, mimeType: true, tamanho: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.padraoPeticao.findUnique({ where: { escritorioId_tipoCaso: { escritorioId, tipoCaso } } }),
  ])

  return NextResponse.json({
    documentos,
    padrao: padrao
      ? {
          padraoJson: JSON.parse(padrao.padraoJson),
          qtdDocumentosAnalisados: padrao.qtdDocumentosAnalisados,
          updatedAt: padrao.updatedAt,
        }
      : null,
    maxDocumentos: MAX_DOCUMENTOS,
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  if (!escritorioId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  }

  const tipoCaso = formData.get('tipoCaso') as string | null
  const arquivo = formData.get('arquivo') as File | null

  if (!tipoCaso || !arquivo) {
    return NextResponse.json({ error: 'tipoCaso e arquivo são obrigatórios' }, { status: 400 })
  }

  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo não suportado. Envie PDF, DOCX ou TXT.' }, { status: 400 })
  }

  if (arquivo.size > LIMITE_BYTES) {
    return NextResponse.json({ error: 'Arquivo muito grande. Limite: 15MB' }, { status: 413 })
  }

  const existentes = await prisma.documentoTreinamento.count({ where: { escritorioId, tipoCaso } })
  if (existentes >= MAX_DOCUMENTOS) {
    return NextResponse.json(
      { error: `Limite de ${MAX_DOCUMENTOS} documentos por tipo de caso atingido. Exclua algum antes de enviar outro.` },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer())
  const doc = await prisma.documentoTreinamento.create({
    data: {
      escritorioId,
      tipoCaso,
      nomeArquivo: arquivo.name,
      mimeType: arquivo.type,
      tamanho: arquivo.size,
      dados: buffer.toString('base64'),
    },
    select: { id: true, nomeArquivo: true, mimeType: true, tamanho: true, createdAt: true },
  })

  return NextResponse.json(doc)
}
