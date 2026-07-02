import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const contextos = await prisma.contextoPeticao.findMany({ orderBy: { tipoCaso: 'asc' } })
  return NextResponse.json(contextos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, tipoCaso, promptSistema } = await req.json()
  if (!nome || !tipoCaso || !promptSistema)
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })

  const ctx = await prisma.contextoPeticao.create({ data: { nome, tipoCaso, promptSistema } })
  return NextResponse.json(ctx)
}
