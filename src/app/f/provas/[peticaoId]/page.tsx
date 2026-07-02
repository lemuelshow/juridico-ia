'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'

interface DocInfo { id: string; item: number; nomeItem: string; nomeArquivo: string; mimeType: string; tamanho: number; createdAt: string }
interface ProvasData {
  clienteNome: string
  tipoCaso: string
  escritorioNome: string
  logoBase64: string | null
  itens: string[]
  documentos: DocInfo[]
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProvasPage() {
  const { peticaoId } = useParams<{ peticaoId: string }>()
  const [data, setData] = useState<ProvasData | null>(null)
  const [uploading, setUploading] = useState<number | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [erro, setErro] = useState<Record<number, string>>({})
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  function loadData() {
    fetch(`/api/f/provas/${peticaoId}`)
      .then(r => {
        if (r.status === 404) { setNaoEncontrado(true); return null }
        return r.ok ? r.json() : null
      })
      .then(d => { if (d) setData(d) })
      .catch(() => setNaoEncontrado(true))
  }

  useEffect(() => { loadData() }, [peticaoId])

  async function upload(item: number, file: File) {
    setErro(e => ({ ...e, [item]: '' }))
    if (file.size > 15 * 1024 * 1024) {
      setErro(e => ({ ...e, [item]: 'Arquivo muito grande. Limite: 15MB' }))
      return
    }
    setUploading(item)
    const fd = new FormData()
    fd.append('item', String(item))
    fd.append('arquivo', file)
    const r = await fetch(`/api/f/provas/${peticaoId}`, { method: 'POST', body: fd })
    setUploading(null)
    if (!r.ok) {
      const msg = await r.json().then(d => d.error).catch(() => 'Erro ao enviar')
      setErro(e => ({ ...e, [item]: msg }))
    } else {
      loadData()
    }
    if (inputRefs.current[item]) inputRefs.current[item]!.value = ''
  }

  async function remover(docId: string) {
    setRemovendo(docId)
    await fetch(`/api/f/provas/${peticaoId}?docId=${docId}`, { method: 'DELETE' })
    setRemovendo(null)
    loadData()
  }

  const docsPorItem = (item: number) => data?.documentos.filter(d => d.item === item) ?? []

  if (naoEncontrado) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 font-semibold">Link inválido ou expirado.</p>
        <p className="text-gray-400 text-sm mt-1">Solicite um novo link ao seu advogado.</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          {data.logoBase64 ? (
            <img src={data.logoBase64} alt="Logo" className="h-10 w-auto object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400">{data.escritorioNome}</p>
            <p className="text-base font-bold text-gray-900">Formulário de Provas</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Intro */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-8">
          <p className="text-indigo-900 font-semibold text-sm mb-1">Olá, {data.clienteNome.split(' ')[0]}!</p>
          <p className="text-indigo-700 text-sm leading-relaxed">
            Envie aqui os documentos do seu caso. Para cada item da lista, clique em <strong>Escolher arquivo</strong> e selecione o documento do seu dispositivo. Você pode enviar quantos arquivos quiser por item.
          </p>
          <p className="text-indigo-500 text-xs mt-2">Limite: 15MB por arquivo. Para vídeos grandes, prefira o formato MP4 ou envie pelo WhatsApp do escritório.</p>
        </div>

        {/* Itens */}
        <div className="space-y-4">
          {data.itens.map((nomeItem, idx) => {
            const item = idx + 1
            const docs = docsPorItem(item)
            const enviando = uploading === item
            return (
              <div key={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-start gap-4 p-5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${docs.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {docs.length > 0 ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : String(item).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{nomeItem}</p>
                    {docs.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {docs.map(doc => (
                          <div key={doc.id} className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2">
                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="text-xs text-emerald-800 font-medium truncate flex-1">{doc.nomeArquivo}</span>
                            <span className="text-xs text-emerald-500 shrink-0">{fmtSize(doc.tamanho)}</span>
                            <button
                              onClick={() => remover(doc.id)}
                              disabled={removendo === doc.id}
                              className="text-emerald-400 hover:text-red-500 transition-colors shrink-0 ml-1"
                            >
                              {removendo === doc.id ? (
                                <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {erro[item] && <p className="text-xs text-red-500 mt-1">{erro[item]}</p>}
                  </div>
                  <label className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${enviando ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                    {enviando ? (
                      <><div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />Enviando...</>
                    ) : (
                      <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Enviar</>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      disabled={enviando}
                      ref={el => { inputRefs.current[item] = el }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) upload(item, f) }}
                    />
                  </label>
                </div>
              </div>
            )
          })}
        </div>

        {/* Resumo */}
        <div className="mt-8 bg-gray-50 rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-600">
            <span className="font-bold text-emerald-600">{data.documentos.length}</span> documento{data.documentos.length !== 1 ? 's' : ''} enviado{data.documentos.length !== 1 ? 's' : ''} de {data.itens.length} itens
          </p>
          <p className="text-xs text-gray-400 mt-1">Os documentos são enviados automaticamente. Não é necessário salvar.</p>
        </div>
      </div>
    </div>
  )
}
