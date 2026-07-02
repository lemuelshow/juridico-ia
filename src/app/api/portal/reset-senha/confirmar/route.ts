import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { token, novaSenha } = await req.json()

    if (!token || !novaSenha || novaSenha.length < 6) {
      return NextResponse.json({ error: 'Dados inválidos. A senha deve ter ao menos 6 caracteres.' }, { status: 400 })
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Link inválido ou expirado. Solicite um novo.' }, { status: 400 })
    }

    const hash = await bcrypt.hash(novaSenha, 12)
    const email = resetToken.email

    // Atualiza senha em Escritorio ou UsuarioEscritorio
    const escritorio = await prisma.escritorio.findUnique({ where: { email } })
    if (escritorio) {
      await prisma.escritorio.update({ where: { email }, data: { senha: hash } })
    } else {
      const usuario = await prisma.usuarioEscritorio.findUnique({ where: { email } })
      if (usuario) {
        await prisma.usuarioEscritorio.update({ where: { email }, data: { senha: hash } })
      }
    }

    await prisma.passwordResetToken.update({ where: { token }, data: { used: true } })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ valid: false })

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
  const valid = !!(resetToken && !resetToken.used && resetToken.expiresAt > new Date())
  return NextResponse.json({ valid })
}
