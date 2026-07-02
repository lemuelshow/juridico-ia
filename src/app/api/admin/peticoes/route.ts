import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const peticoes = await prisma.peticao.findMany({
    include: { formulario: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(peticoes)
}
