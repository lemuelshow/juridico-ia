import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const chaves = await prisma.claudeConfig.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(chaves.map((c) => ({ ...c, chaveApi: c.chaveApi.slice(0, 8) + '••••••••' })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, chaveApi, modelo, maxTokens } = await req.json()
  if (!nome || !chaveApi) return NextResponse.json({ error: 'Nome e chave são obrigatórios' }, { status: 400 })

  const config = await prisma.claudeConfig.create({
    data: { nome, chaveApi, modelo: modelo || 'claude-sonnet-4-6', maxTokens: maxTokens || 4000, ativo: false },
  })

  return NextResponse.json({ ...config, chaveApi: config.chaveApi.slice(0, 8) + '••••••••' })
}
