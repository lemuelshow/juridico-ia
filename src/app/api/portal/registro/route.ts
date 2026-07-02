import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmail, bemVindoHtml } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, cnpj } = await req.json()

    if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
      return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 })
    }
    if (senha.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter ao menos 6 caracteres.' }, { status: 400 })
    }

    const exists = await prisma.escritorio.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 })
    }

    const hash = await bcrypt.hash(senha, 12)
    const escritorio = await prisma.escritorio.create({
      data: {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: hash,
        cnpj: cnpj?.trim() || null,
        plano: 'basico',
        ativo: true,
      },
    })

    // Envia e-mail de boas-vindas (falha silenciosa se SMTP não configurado)
    try {
      await sendEmail({
        to: email,
        subject: 'Bem-vindo(a) ao Peticionaaki!',
        html: bemVindoHtml(nome, email),
      })
    } catch { /* SMTP pode não estar configurado */ }

    return NextResponse.json({ ok: true, escritorioId: escritorio.id }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro interno ao criar conta.' }, { status: 500 })
  }
}
