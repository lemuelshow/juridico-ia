import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { responderJurisprudencia, MensagemChat } from '@/lib/claude'

const MAX_MENSAGENS = 30
const MAX_CARACTERES = 4000

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const escritorioId = (session.user as { escritorioId?: string }).escritorioId
  if (!escritorioId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let body: { messages?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'messages é obrigatório' }, { status: 400 })
  }

  const mensagens = body.messages as unknown[]
  if (mensagens.length > MAX_MENSAGENS) {
    return NextResponse.json({ error: 'Conversa muito longa. Inicie um novo chat.' }, { status: 400 })
  }

  const validas: MensagemChat[] = []
  for (const m of mensagens) {
    if (
      typeof m !== 'object' || m === null ||
      !('role' in m) || !('content' in m) ||
      (m as { role: unknown }).role !== 'user' && (m as { role: unknown }).role !== 'assistant' ||
      typeof (m as { content: unknown }).content !== 'string' ||
      (m as { content: string }).content.length === 0 ||
      (m as { content: string }).content.length > MAX_CARACTERES
    ) {
      return NextResponse.json({ error: 'Mensagem inválida na conversa' }, { status: 400 })
    }
    validas.push({ role: (m as { role: 'user' | 'assistant' }).role, content: (m as { content: string }).content })
  }

  try {
    const { resposta, tokensUsados, modelo } = await responderJurisprudencia(validas)
    return NextResponse.json({ resposta, tokensUsados, modelo })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || 'Erro ao consultar a IA' }, { status: 500 })
  }
}
