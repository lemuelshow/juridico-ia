import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId

  const escritorio = await prisma.escritorio.findUnique({
    where: { id: escritorioId },
    select: { id: true, nome: true, cnpj: true, email: true, plano: true, tokenLimit: true, tokensUsados: true, papelTimbrado: true, logoBase64: true },
  })

  return NextResponse.json(escritorio)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  const body = await req.json()

  const updated = await prisma.escritorio.update({
    where: { id: escritorioId },
    data: {
      ...(body.papelTimbrado !== undefined && { papelTimbrado: body.papelTimbrado }),
      ...(body.logoBase64 !== undefined && { logoBase64: body.logoBase64 }),
      ...(body.nome && { nome: body.nome }),
    },
  })

  return NextResponse.json(updated)
}
