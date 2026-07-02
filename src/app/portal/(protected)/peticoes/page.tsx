'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { TIPO_COLORS } from '@/lib/tipo-ui'

interface Peticao {
  id: string
  createdAt: string
  tokensUsados: number
  modeloUsado: string
  finalizada: boolean
  _count: { documentos: number }
  formulario: {
    nome: string
    cpf: string
    email: string
    tipoCaso: string
    status: string
  }
}

interface Template { tipoCaso: string; nome: string }

export default function PortalPeticoesPage() {
  const [peticoes, setPeticoes] = useState<Peticao[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('')
  const [confirmandoExcluir, setConfirmandoExcluir] = useState<string | null>(null)
  const [copiandoProvas, setCopiandoProvas] = useState<string | null>(null)
  const [atualizando, setAtualizando] = useState<string | null>(null)

  const tipoNome = useMemo(() => Object.fromEntries(templates.map(t => [t.tipoCaso, t.nome])), [templates])

  function loadPeticoes() {
    fetch('/api/portal/peticoes')
      .then(r => r.json())
      .then(data => setPeticoes(Array.isArray(data) ? data : []))
      .catch(() => setPeticoes([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPeticoes()
    fetch('/api/formularios').then(r => r.json()).then(setTemplates)
  }, [])

  async function toggleFinalizada(p: Peticao) {
    setAtualizando(p.id)
    await fetch(`/api/portal/peticoes/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finalizada: !p.finalizada }),
    })
    setPeticoes(prev => prev.map(x => x.id === p.id ? { ...x, finalizada: !x.finalizada } : x))
    setAtualizando(null)
  }

  async function excluir(id: string) {
    await fetch(`/api/portal/peticoes/${id}`, { method: 'DELETE' })
    setPeticoes(prev => prev.filter(p => p.id !== id))
    setConfirmandoExcluir(null)
  }

  function copiarLinkProvas(id: string) {
    const link = `${window.location.origin}/f/provas/${id}`
    navigator.clipboard.writeText(link).then(() => {
      setCopiandoProvas(id)
      setTimeout(() => setCopiandoProvas(null), 2000)
    })
  }

  const filtered = useMemo(() => {
    let list = peticoes
    if (busca) {
      const q = busca.toLowerCase()
      list = list.filter(p => p.formulario.nome.toLowerCase().includes(q) || p.formulario.cpf.includes(q) || p.formulario.email.toLowerCase().includes(q))
    }
    if (filtroTipo) list = list.filter(p => p.formulario.tipoCaso === filtroTipo)
    if (filtroPeriodo) {
      const dias = parseInt(filtroPeriodo)
      const desde = new Date(Date.now() - dias * 86400000)
      list = list.filter(p => new Date(p.createdAt) >= desde)
    }
    return list
  }, [peticoes, busca, filtroTipo, filtroPeriodo])

  function ActionButtons({ p }: { p: Peticao }) {
    return (
      <div className="flex items-center gap-1.5">
        <Link href={`/portal/peticoes/${p.id}`} title="Abrir petição"
          className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors active:scale-95">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
        <button onClick={() => copiarLinkProvas(p.id)} title="Copiar link de Provas"
          className={`p-2 rounded-xl transition-colors active:scale-95 ${copiandoProvas === p.id ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'}`}>
          {copiandoProvas === p.id
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>}
        </button>
        <button onClick={() => toggleFinalizada(p)} disabled={atualizando === p.id}
          title={p.finalizada ? 'Reabrir' : 'Finalizar'}
          className={`p-2 rounded-xl transition-colors active:scale-95 ${p.finalizada ? 'text-emerald-600 bg-emerald-50 hover:bg-red-50 hover:text-red-500' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
          {atualizando === p.id
            ? <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        </button>
        {confirmandoExcluir === p.id ? (
          <div className="flex items-center gap-1">
            <button onClick={() => excluir(p.id)} className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500 text-white">Confirmar</button>
            <button onClick={() => setConfirmandoExcluir(null)} className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600">Cancelar</button>
          </div>
        ) : (
          <button onClick={() => setConfirmandoExcluir(p.id)} title="Excluir"
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="px-4 py-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900">Petições</h1>
          <p className="text-gray-500 text-sm mt-1">{peticoes.length} documentos gerados no total</p>
        </div>
        <p className="text-gray-500 text-sm md:hidden">{peticoes.length} petições</p>
        <Link href="/" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm shadow-indigo-600/30">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nova Petição</span>
          <span className="sm:hidden">Nova</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-4 mb-4">
        <div className="relative mb-3">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Buscar cliente, CPF ou e-mail..." value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all placeholder:text-gray-400" />
        </div>
        <div className="flex gap-2">
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white">
            <option value="">Todos os tipos</option>
            {templates.map(t => <option key={t.tipoCaso} value={t.tipoCaso}>{t.nome}</option>)}
          </select>
          <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white">
            <option value="">Qualquer período</option>
            <option value="7">7 dias</option>
            <option value="30">30 dias</option>
            <option value="90">90 dias</option>
          </select>
        </div>
        {(busca || filtroTipo || filtroPeriodo) && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setBusca(''); setFiltroTipo(''); setFiltroPeriodo('') }} className="text-xs text-indigo-600 font-medium">Limpar</button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold text-sm">Nenhuma petição encontrada</p>
            <p className="text-gray-400 text-xs mt-1">Tente ajustar os filtros ou gere uma nova petição</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className={`group hover:bg-gray-50/60 transition-colors ${p.finalizada ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{p.formulario.nome}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.formulario.cpf} · {p.formulario.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${TIPO_COLORS[p.formulario.tipoCaso] || TIPO_COLORS.outros}`}>
                        {tipoNome[p.formulario.tipoCaso] || p.formulario.tipoCaso}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {p.finalizada
                          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Finalizada</span>
                          : <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">Em andamento</span>}
                        {p._count.documentos > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            {p._count.documentos}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right"><ActionButtons p={p} /></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {filtered.map(p => (
                <div key={p.id} className={`p-4 ${p.finalizada ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{p.formulario.nome}</p>
                      <p className="text-xs text-gray-400 truncate">{p.formulario.cpf} · {p.formulario.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${TIPO_COLORS[p.formulario.tipoCaso] || TIPO_COLORS.outros}`}>
                      {tipoNome[p.formulario.tipoCaso] || p.formulario.tipoCaso}
                    </span>
                    {p.finalizada
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Finalizada</span>
                      : <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700">Em andamento</span>}
                    {p._count.documentos > 0 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600">{p._count.documentos} doc{p._count.documentos !== 1 ? 's' : ''}</span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{new Date(p.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-1 border-t border-gray-50 pt-3">
                    <ActionButtons p={p} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
