'use client'

import { useEffect, useRef, useState } from 'react'

interface Mensagem {
  role: 'user' | 'assistant'
  content: string
}

const URL_REGEX = /(https?:\/\/[^\s)]+)/g

function renderConteudo(texto: string) {
  const partes = texto.split(URL_REGEX)
  return partes.map((parte, i) =>
    URL_REGEX.test(parte) ? (
      <a
        key={i}
        href={parte}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700 break-all"
      >
        {parte}
      </a>
    ) : (
      <span key={i}>{parte}</span>
    )
  )
}

const SUGESTOES = [
  'Súmulas recentes do STJ sobre dano moral por negativação indevida',
  'Jurisprudência do TST sobre rescisão indireta em 2024/2025',
  'Teses do STF em repercussão geral sobre direito tributário',
]

export default function JurisprudenciaChatPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const fimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens, enviando])

  async function enviar(texto: string) {
    const conteudo = texto.trim()
    if (!conteudo || enviando) return

    const novasMensagens: Mensagem[] = [...mensagens, { role: 'user', content: conteudo }]
    setMensagens(novasMensagens)
    setInput('')
    setErro('')
    setEnviando(true)

    try {
      const r = await fetch('/api/portal/jurisprudencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: novasMensagens }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Erro ao consultar a IA')
      setMensagens([...novasMensagens, { role: 'assistant', content: j.resposta }])
    } catch (e) {
      setErro((e as Error).message)
      setMensagens(novasMensagens)
    } finally {
      setEnviando(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar(input)
    }
  }

  return (
    <div className="px-4 py-6 md:p-8 h-screen md:h-auto flex flex-col">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Chat de Jurisprudência</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pesquisa de jurisprudência atualizada e verificável — este chat responde apenas a buscas de jurisprudência.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 flex-1 flex flex-col overflow-hidden min-h-0" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {mensagens.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Descreva o que você precisa pesquisar</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                Informe o tema, a área do direito, o tribunal e o período de interesse para uma busca mais precisa.
              </p>
              <div className="flex flex-col items-center gap-2">
                {SUGESTOES.map(s => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="text-xs text-left px-3 py-2 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-500 transition-colors max-w-md"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mensagens.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-50 text-gray-800 ring-1 ring-gray-900/5'
                }`}
              >
                {renderConteudo(m.content)}
              </div>
            </div>
          ))}

          {enviando && (
            <div className="flex justify-start">
              <div className="bg-gray-50 ring-1 ring-gray-900/5 rounded-2xl px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                Pesquisando jurisprudência...
              </div>
            </div>
          )}

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs">{erro}</div>
          )}

          <div ref={fimRef} />
        </div>

        <div className="border-t border-gray-100 p-3 md:p-4 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ex: jurisprudência do STJ sobre dano moral por negativação indevida nos últimos 12 meses"
              rows={2}
              disabled={enviando}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 disabled:bg-gray-50"
            />
            <button
              onClick={() => enviar(input)}
              disabled={enviando || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 text-sm shrink-0"
            >
              Enviar
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Sempre confira os resultados na fonte oficial do tribunal antes de usá-los em uma petição.
          </p>
        </div>
      </div>
    </div>
  )
}
