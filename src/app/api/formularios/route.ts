import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const templates = await prisma.formularioTemplate.findMany({
      where: { ativo: true },
      select: { tipoCaso: true, nome: true, descricao: true },
      orderBy: { nome: 'asc' },
    })
    return NextResponse.json(templates)
  } catch {
    // fallback caso o cliente Prisma ainda não tenha o campo descricao (antes de restart)
    const templates = await prisma.formularioTemplate.findMany({
      where: { ativo: true },
      select: { tipoCaso: true, nome: true },
      orderBy: { nome: 'asc' },
    })
    return NextResponse.json(templates.map(t => ({ ...t, descricao: '' })))
  }
}
