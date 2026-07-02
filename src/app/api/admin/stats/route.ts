import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const [totalForms, totalPeticoes, totalTokens, porTipo] = await Promise.all([
    prisma.clienteForm.count(),
    prisma.peticao.count(),
    prisma.peticao.aggregate({ _sum: { tokensUsados: true } }),
    prisma.clienteForm.groupBy({ by: ['tipoCaso'], _count: { id: true } }),
  ])

  return NextResponse.json({
    totalForms,
    totalPeticoes,
    totalTokens: totalTokens._sum.tokensUsados || 0,
    porTipo,
  })
}
