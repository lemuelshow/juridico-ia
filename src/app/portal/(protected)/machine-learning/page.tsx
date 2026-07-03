'use client'

import { useEffect, useRef, useState } from 'react'
import { TIPO_COLORS } from '@/lib/tipo-ui'

interface Template { tipoCaso: string; nome: string }
interface DocMeta { id: string; nomeArquivo: string; mimeType: string; tamanho: number; createdAt: string }
interface PadraoJson {
  paginasMedia: number | null
  estruturaSecoes: string[]
  jurisprudenciaFrequente: string[]
  estiloLinguagem: string
  observacoes: string
}
interface PadraoInfo { padraoJson: PadraoJson; qtdDocumentosAnalisados: number; updatedAt: string }

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MachineLearningPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [tipoCaso, setTipoCaso] = useState('')
  const [documentos, setDocumentos] = useState<DocMeta[]>([])
  const [padrao, setPadrao] = useState<PadraoInfo | null>(null)
  const [maxDocumentos, setMaxDocumentos] = useState(5)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analisando, setAnalisando] = useState(false)
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  const [confirmo, setConfirmo] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/formularios').then(r => r.json()).then((ts: Template[]) => {
      setTemplates(Array.isArray(ts) ? ts : [])
      if (Array.isArray(ts) && ts.length > 0) setTipoCaso(ts[0].tipoCaso)
    }).catch(() => {})
  }, [])

  function loadDados(tipo: string) {
    if (!tipo) return
    setLoading(true)
    fetch(`/api/portal/machine-learning?tipoCaso=${encodeURIComponent(tipo)}`)
      .then(r => r.json())
      .then(d => {
        setDocumentos(d.documentos ?? [])
        setPadrao(d.padrao ?? null)
        setMaxDocumentos(d.maxDocumentos ?? 5)
      })
      .catch(() => { setDocumentos([]); setPadrao(null) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (tipoCaso) loadDados(tipoCaso) }, [tipoCaso])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0 || !tipoCaso) return
    setErro('')
    setUploading(true)
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('tipoCaso', tipoCaso)
      fd.append('arquivo', file)
      const r = await fetch('/api/portal/machine-learning', { method: 'POST', body: fd })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setErro(j.error || 'Erro ao enviar arquivo')
        break
      }
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
    loadDados(tipoCaso)
  }

  async function excluirDoc(id: string) {
    setExcluindo(id)
    await fetch(`/api/portal/machine-learning/${id}`, { method: 'DELETE' })
    setExcluindo(null)
    loadDados(tipoCaso)
  }

  async function analisar() {
    setAnalisando(true)
    setErro('')
    try {
      const r = await fetch('/api/portal/machine-learning/analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoCaso }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Erro ao analisar documentos')
      setPadrao({ padraoJson: j.padraoJson, qtdDocumentosAnalisados: j.qtdDocumentosAnalisados, updatedAt: j.updatedAt })
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setAnalisando(false)
    }
  }

  const atingiuLimite = documentos.length >= maxDocumentos
  const podeEnviar = confirmo && !uploading && !atingiuLimite
  const podeAnalisar = confirmo && documentos.length > 0 && !analisando

  return (
    <div className="px-4 py-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Machine Learning</h1>
        <p className="text-gray-500 text-sm mt-1">Ensine a IA a seguir o padrão de petições que o seu escritório já usa</p>
      </div>

      {/* Seletor de tipo */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-4 mb-4">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo de petição</label>
        {templates.length === 0 ? (
          <p className="text-sm text-gray-400">Carregando tipos de petição...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <button key={t.tipoCaso} onClick={() => setTipoCaso(t.tipoCaso)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  tipoCaso === t.tipoCaso ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30' : `${TIPO_COLORS[t.tipoCaso] || TIPO_COLORS.outros} hover:opacity-80`
                }`}>
                {t.nome}
              </button>
            ))}
          </div>
        )}
      </div>

      {tipoCaso && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Coluna de upload */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Documentos de exemplo</h2>
            <p className="text-xs text-gray-400 mb-4">
              Envie petições que o escritório já usa para este tipo de caso ({documentos.length}/{maxDocumentos})
            </p>

            <label className="flex items-start gap-2 mb-4 cursor-pointer select-none">
              <input type="checkbox" checked={confirmo} onChange={e => setConfirmo(e.target.checked)} className="mt-0.5" />
              <span className="text-xs text-gray-500">
                Confirmo que tenho autorização para usar estes documentos como referência de estilo para a IA.
              </span>
            </label>

            <label className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-all mb-4 ${
              !podeEnviar ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-indigo-200 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
            }`}>
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Enviando...</>
              ) : atingiuLimite ? (
                'Limite de documentos atingido'
              ) : (
                'Selecionar arquivos (PDF, DOCX ou TXT)'
              )}
              <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden" disabled={!podeEnviar} onChange={e => handleUpload(e.target.files)} />
            </label>

            {loading ? (
              <div className="py-6 text-center text-sm text-gray-400">Carregando...</div>
            ) : documentos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nenhum documento enviado ainda</p>
            ) : (
              <div className="space-y-2 mb-4">
                {documentos.map(doc => (
                  <div key={doc.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{doc.nomeArquivo}</p>
                      <p className="text-[10px] text-gray-400">{fmtSize(doc.tamanho)}</p>
                    </span>
                    <button onClick={() => excluirDoc(doc.id)} disabled={excluindo === doc.id}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                      {excluindo === doc.id ? (
                        <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {erro && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs mb-4">{erro}</div>}

            <button onClick={analisar} disabled={!podeAnalisar}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-40 text-sm flex items-center justify-center gap-2">
              {analisando ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analisando com IA...</>
              ) : (
                'Analisar documentos'
              )}
            </button>
          </div>

          {/* Coluna do padrão */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Padrão aprendido</h2>

            {!padrao ? (
              <p className="text-sm text-gray-400 py-10 text-center">
                Nenhum padrão gerado ainda para este tipo de caso.<br />Envie documentos e clique em &quot;Analisar documentos&quot;.
              </p>
            ) : (
              <div className="space-y-4 mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    Padrão ativo
                  </span>
                  <span className="text-xs text-gray-400">
                    baseado em {padrao.qtdDocumentosAnalisados} documento{padrao.qtdDocumentosAnalisados !== 1 ? 's' : ''} · {new Date(padrao.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {padrao.padraoJson.paginasMedia && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Extensão média</p>
                    <p className="text-sm text-gray-800">{padrao.padraoJson.paginasMedia} páginas</p>
                  </div>
                )}

                {padrao.padraoJson.estruturaSecoes.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estrutura usada</p>
                    <p className="text-sm text-gray-800">{padrao.padraoJson.estruturaSecoes.join(' → ')}</p>
                  </div>
                )}

                {padrao.padraoJson.jurisprudenciaFrequente.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Jurisprudência frequente</p>
                    <div className="flex flex-wrap gap-1.5">
                      {padrao.padraoJson.jurisprudenciaFrequente.map((j, i) => (
                        <span key={i} className="text-xs font-medium px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700">{j}</span>
                      ))}
                    </div>
                  </div>
                )}

                {padrao.padraoJson.estiloLinguagem && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estilo de linguagem</p>
                    <p className="text-sm text-gray-800">{padrao.padraoJson.estiloLinguagem}</p>
                  </div>
                )}

                {padrao.padraoJson.observacoes && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Observações</p>
                    <p className="text-sm text-gray-800">{padrao.padraoJson.observacoes}</p>
                  </div>
                )}

                <p className="text-xs text-gray-400 pt-3 border-t border-gray-50">
                  Este padrão passa a ser usado automaticamente nas próximas petições desse tipo geradas para o seu escritório.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
