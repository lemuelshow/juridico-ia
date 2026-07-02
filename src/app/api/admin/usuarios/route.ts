import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const usuarios = await prisma.usuario.findMany({
    select: { id: true, email: true, nome: true, tokenLimit: true, tokensUsados: true, ativo: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(usuarios)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { email, nome, senha, tokenLimit } = await req.json()
  if (!email || !nome || !senha)
    return NextResponse.json({ error: 'Email, nome e senha são obrigatórios' }, { status: 400 })

  const senhaHash = await bcrypt.hash(senha, 12)
  const usuario = await prisma.usuario.create({
    data: { email, nome, senha: senhaHash, tokenLimit: tokenLimit || 10000 },
    select: { id: true, email: true, nome: true, tokenLimit: true, tokensUsados: true, ativo: true, createdAt: true },
  })

  return NextResponse.json(usuario)
}
