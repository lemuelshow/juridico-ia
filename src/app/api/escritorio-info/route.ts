import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('e')
  if (!id) return NextResponse.json({ error: 'ID ausente' }, { status: 400 })

  const escritorio = await prisma.escritorio.findUnique({
    where: { id },
    select: { nome: true, ativo: true },
  })

  if (!escritorio || !escritorio.ativo) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  return NextResponse.json({ nome: escritorio.nome })
}
