'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { TIPO_CARD_COLOR, CARD_COR_MAP } from '@/lib/tipo-ui'

interface Template { tipoCaso: string; nome: string; descricao: string }

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export default function FormulariosPage() {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loaded, setLoaded] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)

  const escritorioId = (session?.user as { escritorioId?: string })?.escritorioId
  const escritorioNome = (session?.user as { escritorioNome?: string })?.escritorioNome

  useEffect(() => {
    fetch('/api/formularios')
      .then(r => r.json())
      .then(data => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setTemplates([]))
      .finally(() => setLoaded(true))
  }, [])

  const getLink = useCallback((tipo: string) => {
    return `${getBaseUrl()}/f/${tipo}?e=${escritorioId || ''}`
  }, [escritorioId])

  function copiarLink(tipo: string) {
    navigator.clipboard.writeText(getLink(tipo)).then(() => {
      setCopiado(tipo)
      setTimeout(() => setCopiado(null), 2000)
    })
  }

  return (
    <div className="min-h-full bg-[#f4f6fa] px-4 py-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-6 hidden md:block">
          <h1 className="text-2xl font-bold text-[#1a2234]">Links de Formulários</h1>
          <p className="text-[#6b7a99] text-sm mt-1">
            Envie estes links para seus clientes. Ao preencher, as petições aparecem automaticamente no seu painel.
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-8 flex gap-4 items-start">
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-indigo-900 font-semibold text-sm">Como funciona</p>
            <p className="text-indigo-700 text-sm mt-0.5">
              Cada link é exclusivo para <strong>{escritorioNome || 'seu escritório'}</strong>. O cliente acessa, preenche as informações do caso e a petição é gerada automaticamente e vinculada ao seu painel.
            </p>
          </div>
        </div>

        {!loaded && (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando formulários...</div>
        )}

        {loaded && templates.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Nenhum formulário disponível.</div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {templates.map(tipo => {
            const cor = TIPO_CARD_COLOR[tipo.tipoCaso] || 'slate'
            const cores = CARD_COR_MAP[cor] || CARD_COR_MAP['slate']
            const link = getLink(tipo.tipoCaso)
            const isCopied = copiado === tipo.tipoCaso
            return (
              <div key={tipo.tipoCaso} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${cores.icon} rounded-2xl flex items-center justify-center shrink-0`}>
                      <svg className="w-6 h-6 text-current opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cores.pill}`}>
                          {tipo.nome}
                        </span>
                      </div>
                      <p className="text-[#4a5568] text-sm">{tipo.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Abrir formulário">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <button onClick={() => copiarLink(tipo.tipoCaso)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isCopied ? 'bg-emerald-500 text-white' : 'bg-[#1a2234] text-white hover:bg-[#2d3a55]'}`}>
                      {isCopied ? (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copiado!</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copiar link</>
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-4 bg-gray-50 rounded-xl px-4 py-2.5 flex items-center gap-3 overflow-hidden">
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-xs text-gray-500 font-mono truncate">{link}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
