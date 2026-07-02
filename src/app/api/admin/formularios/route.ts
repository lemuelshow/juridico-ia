import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const templates = await prisma.formularioTemplate.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { perguntas: true } } },
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { nome, tipoCaso } = await req.json()
  if (!nome || !tipoCaso)
    return NextResponse.json({ error: 'nome e tipoCaso são obrigatórios' }, { status: 400 })

  try {
    const template = await prisma.formularioTemplate.create({
      data: { nome, tipoCaso, ativo: true },
    })
    return NextResponse.json(template, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'tipoCaso já possui um formulário' }, { status: 400 })
  }
}
