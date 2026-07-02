import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId

  try {
    const peticoes = await prisma.peticao.findMany({
      where: { formulario: { escritorioId } },
      orderBy: { createdAt: 'desc' },
      include: {
        formulario: { select: { nome: true, cpf: true, email: true, tipoCaso: true, status: true } },
        _count: { select: { documentos: true } },
      },
    })
    return NextResponse.json(peticoes)
  } catch {
    // fallback para quando o cliente Prisma ainda não tem documentos/finalizada (antes de restart)
    const peticoes = await prisma.peticao.findMany({
      where: { formulario: { escritorioId } },
      orderBy: { createdAt: 'desc' },
      include: {
        formulario: { select: { nome: true, cpf: true, email: true, tipoCaso: true, status: true } },
      },
    })
    return NextResponse.json(peticoes.map(p => ({ ...p, finalizada: false, _count: { documentos: 0 } })))
  }
}
