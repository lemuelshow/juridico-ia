import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  const { id } = await params
  const body = await req.json()

  const usuario = await prisma.usuarioEscritorio.findUnique({ where: { id } })
  if (!usuario || usuario.escritorioId !== escritorioId) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

  const updated = await prisma.usuarioEscritorio.update({
    where: { id },
    data: { ...(body.ativo !== undefined && { ativo: body.ativo }) },
    select: { id: true, nome: true, email: true, role: true, ativo: true, createdAt: true },
  })

  return NextResponse.json(updated)
}
