import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ peticaoId: string; docId: string }> }) {
  const { peticaoId, docId } = await params

  const doc = await prisma.documentoProva.findUnique({ where: { id: docId } })
  if (!doc || doc.peticaoId !== peticaoId) return new NextResponse('Não encontrado', { status: 404 })

  const buffer = Buffer.from(doc.dados, 'base64')
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Disposition': `inline; filename="${doc.nomeArquivo}"`,
      'Content-Length': String(buffer.length),
    },
  })
}
