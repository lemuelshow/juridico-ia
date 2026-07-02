import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ITENS_PROVAS = [
  'RG/CPF (frente e verso)',
  'Comprovante de Residência',
  'CTPS Digital em PDF',
  'Extrato Analítico do FGTS',
  'Contracheques',
  'Termo de Rescisão do Contrato de Trabalho',
  'Comprovante de Pagamento das Verbas Rescisórias',
  'Fotos e vídeos',
  'Gravação de tela (WhatsApp)',
  'Demais documentos',
]

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  const { id } = await params

  const peticao = await prisma.peticao.findUnique({
    where: { id },
    include: { formulario: { select: { escritorioId: true } } },
  })

  if (!peticao) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  if (peticao.formulario.escritorioId !== escritorioId)
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  try {
    const docs = await prisma.documentoProva.findMany({
      where: { peticaoId: id },
      select: { id: true, item: true, nomeItem: true, nomeArquivo: true, mimeType: true, tamanho: true, createdAt: true },
      orderBy: [{ item: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json({ documentos: docs, itens: ITENS_PROVAS })
  } catch {
    return NextResponse.json({ documentos: [], itens: ITENS_PROVAS })
  }
}
