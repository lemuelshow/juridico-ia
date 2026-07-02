import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId

  const usuarios = await prisma.usuarioEscritorio.findMany({
    where: { escritorioId },
    select: { id: true, nome: true, email: true, role: true, ativo: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(usuarios)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  const { nome, email, senha, role } = await req.json()

  if (!nome || !email || !senha) return NextResponse.json({ error: 'Campos obrigatorios' }, { status: 400 })

  const hash = await bcrypt.hash(senha, 12)
  const usuario = await prisma.usuarioEscritorio.create({
    data: { escritorioId: escritorioId!, nome, email, senha: hash, role: role || 'advogado' },
    select: { id: true, nome: true, email: true, role: true, ativo: true, createdAt: true },
  })

  return NextResponse.json(usuario, { status: 201 })
}
