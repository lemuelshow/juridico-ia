import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const gateways = await prisma.gatewayConfig.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(gateways.map((g) => ({ ...g, chavePrivada: g.chavePrivada ? '••••••••' : '' })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, chavePublica, chavePrivada, ambiente, dadosExtra } = await req.json()
  if (!nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

  const gw = await prisma.gatewayConfig.create({
    data: {
      nome,
      chavePublica: chavePublica || '',
      chavePrivada: chavePrivada || '',
      ambiente: ambiente || 'sandbox',
      dadosExtra: JSON.stringify(dadosExtra || {}),
    },
  })

  return NextResponse.json({ ...gw, chavePrivada: '••••••••' })
}
