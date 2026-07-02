import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ITENS_PROVAS = [
  'Foto de RG/CPF (frente e verso)',
  'Comprovante de Residência',
  'CTPS Digital em PDF',
  'Extrato Analítico do FGTS',
  'Contracheques (os que tiver)',
  'Termo de Rescisão do Contrato de Trabalho',
  'Comprovante de Pagamento das Verbas Rescisórias',
  'Fotos e vídeos Trabalhando (se houver)',
  'Gravação de tela da conversa de WhatsApp',
  'Demais documentos a respeito do caso',
]

export async function GET(_: NextRequest, { params }: { params: Promise<{ peticaoId: string }> }) {
  const { peticaoId } = await params

  try {
    const peticao = await prisma.peticao.findUnique({
      where: { id: peticaoId },
      include: {
        formulario: { select: { nome: true, tipoCaso: true, escritorio: { select: { nome: true, logoBase64: true } } } },
        documentos: { select: { id: true, item: true, nomeItem: true, nomeArquivo: true, mimeType: true, tamanho: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
      },
    })
    if (!peticao) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json({
      clienteNome: peticao.formulario.nome,
      tipoCaso: peticao.formulario.tipoCaso,
      escritorioNome: peticao.formulario.escritorio?.nome,
      logoBase64: peticao.formulario.escritorio?.logoBase64,
      itens: ITENS_PROVAS,
      documentos: peticao.documentos,
    })
  } catch {
    // fallback: busca sem a relação documentos (cliente Prisma desatualizado antes do restart)
    const peticao = await prisma.peticao.findUnique({
      where: { id: peticaoId },
      include: {
        formulario: { select: { nome: true, tipoCaso: true, escritorio: { select: { nome: true, logoBase64: true } } } },
      },
    })
    if (!peticao) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json({
      clienteNome: peticao.formulario.nome,
      tipoCaso: peticao.formulario.tipoCaso,
      escritorioNome: peticao.formulario.escritorio?.nome,
      logoBase64: peticao.formulario.escritorio?.logoBase64,
      itens: ITENS_PROVAS,
      documentos: [],
    })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ peticaoId: string }> }) {
  const { peticaoId } = await params

  const peticao = await prisma.peticao.findUnique({ where: { id: peticaoId }, select: { id: true } })
  if (!peticao) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  }

  const item = parseInt(formData.get('item') as string)
  const arquivo = formData.get('arquivo') as File | null

  if (!arquivo || isNaN(item)) return NextResponse.json({ error: 'item e arquivo são obrigatórios' }, { status: 400 })

  const LIMITE_BYTES = 15 * 1024 * 1024 // 15MB
  if (arquivo.size > LIMITE_BYTES) return NextResponse.json({ error: 'Arquivo muito grande. Limite: 15MB' }, { status: 413 })

  const buffer = Buffer.from(await arquivo.arrayBuffer())
  const base64 = buffer.toString('base64')
  const nomeItem = ITENS_PROVAS[item - 1] || `Item ${item}`

  const doc = await prisma.documentoProva.create({
    data: {
      peticaoId,
      item,
      nomeItem,
      nomeArquivo: arquivo.name,
      mimeType: arquivo.type || 'application/octet-stream',
      tamanho: arquivo.size,
      dados: base64,
    },
  })

  return NextResponse.json({ id: doc.id, nomeArquivo: doc.nomeArquivo, tamanho: doc.tamanho })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ peticaoId: string }> }) {
  const { peticaoId } = await params
  const { searchParams } = new URL(req.url)
  const docId = searchParams.get('docId')

  if (!docId) return NextResponse.json({ error: 'docId obrigatório' }, { status: 400 })

  const doc = await prisma.documentoProva.findUnique({ where: { id: docId } })
  if (!doc || doc.peticaoId !== peticaoId) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await prisma.documentoProva.delete({ where: { id: docId } })
  return NextResponse.json({ ok: true })
}
