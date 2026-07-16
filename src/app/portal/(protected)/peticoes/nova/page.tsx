'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TIPO_CARD_COLOR, CARD_COR_MAP } from '@/lib/tipo-ui'

interface Template { tipoCaso: string; nome: string; descricao: string }
interface Pergunta {
  id: string; ordem: number; texto: string; tipo: string; secao: string
  placeholder: string; obrigatoria: boolean; opcoes: string[]; campoDetalhe: boolean; detalheLabel: string
}
interface Secao { nome: string; perguntas: Pergunta[] }

function formatCPF(v: string) {
  return v.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}
function formatPhone(v: string) {
  return v.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{4})$/, '$1-$2')
}

function PerguntaField({ p, value, detalhe, onChange, onDetalhe }: {
  p: Pergunta; value: string; detalhe: string; onChange: (v: string) => void; onDetalhe: (v: string) => void
}) {
  const base = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white placeholder:text-gray-400'
  switch (p.tipo) {
    case 'texto_curto': return <input className={base} type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={p.placeholder || 'Digite aqui...'} />
    case 'texto_longo': return <textarea className={`${base} min-h-[110px] resize-y`} value={value} onChange={e => onChange(e.target.value)} placeholder={p.placeholder || 'Escreva aqui...'} />
    case 'data': return <input className={base} type="date" value={value} onChange={e => onChange(e.target.value)} />
    case 'numero': return <input className={base} type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={p.placeholder} />
    case 'sim_nao': return (
      <div>
        <div className="grid grid-cols-2 gap-3">
          {['Sim', 'Não'].map(opt => (
            <button key={opt} type="button" onClick={() => onChange(opt)}
              className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${value === opt ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'}`}>
              {opt}
            </button>
          ))}
        </div>
        {value === 'Sim' && p.campoDetalhe && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{p.detalheLabel || 'Especifique:'}</label>
            <textarea className={`${base} min-h-[80px] resize-y`} value={detalhe} onChange={e => onDetalhe(e.target.value)} placeholder="Descreva com detalhes..." />
          </div>
        )}
      </div>
    )
    case 'opcoes': return (
      <div className="space-y-2">
        {p.opcoes.map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-all text-left ${value === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold' : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'}`}>
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${value === opt ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
              {value === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            {opt}
          </button>
        ))}
      </div>
    )
    default: return <input className={base} value={value} onChange={e => onChange(e.target.value)} placeholder={p.placeholder} />
  }
}

export default function NovaPeticaoPage() {
  const router = useRouter()

  const [step, setStep] = useState<'tipo' | 'dados' | 'perguntas'>('tipo')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [tipoCaso, setTipoCaso] = useState<string | null>(null)

  const [dados, setDados] = useState({ nome: '', cpf: '', email: '', telefone: '' })
  const [perguntas, setPerguntas] = useState<Pergunta[] | null>(null)
  const [loadingForm, setLoadingForm] = useState(false)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [secaoIdx, setSecaoIdx] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setField = (f: string, v: string) => setDados(d => ({ ...d, [f]: v }))
  const setResposta = (id: string, v: string) => setRespostas(r => ({ ...r, [id]: v }))

  useEffect(() => {
    fetch('/api/formularios')
      .then(r => r.json())
      .then(data => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTemplates(false))
  }, [])

  const secoes: Secao[] = useMemo(() => {
    if (!perguntas || perguntas.length === 0) return []
    const map = new Map<string, Pergunta[]>()
    for (const p of perguntas) {
      const s = p.secao || 'Geral'
      if (!map.has(s)) map.set(s, [])
      map.get(s)!.push(p)
    }
    return Array.from(map.entries()).map(([nome, ps]) => ({ nome, perguntas: ps }))
  }, [perguntas])

  const secaoAtual = secoes[secaoIdx]
  const isUltimaSecao = secaoIdx === secoes.length - 1
  const canPassarSecao = secaoAtual ? secaoAtual.perguntas.filter(p => p.obrigatoria).every(p => (respostas[p.id] || '').trim() !== '') : false
  const canSubmit = perguntas ? perguntas.filter(p => p.obrigatoria).every(p => (respostas[p.id] || '').trim() !== '') : false
  const canAvancarDados = dados.nome && dados.cpf.length >= 14 && dados.email && dados.telefone

  function escolherTipo(tipo: string) {
    setTipoCaso(tipo)
    setStep('dados')
  }

  async function avancarParaPerguntas() {
    if (!tipoCaso) return
    setStep('perguntas')
    setLoadingForm(true)
    setPerguntas(null)
    setRespostas({})
    setSecaoIdx(0)
    try {
      const r = await fetch(`/api/formularios/${tipoCaso}`)
      const data = await r.json()
      setPerguntas(data?.perguntas?.length > 0 ? data.perguntas : null)
    } catch { setPerguntas(null) }
    setLoadingForm(false)
  }

  async function handleSubmit() {
    if (!perguntas || !tipoCaso) return
    setLoading(true)
    setError('')
    try {
      const descricao = perguntas.filter(p => respostas[p.id]).map(p => {
        const ans = respostas[p.id]
        const det = respostas[p.id + '_detalhe']
        return `${p.texto}\n→ ${ans}${det ? `\n→ Detalhes: ${det}` : ''}`
      }).join('\n\n')

      const res = await fetch('/api/portal/formulario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: dados.nome, cpf: dados.cpf, email: dados.email, telefone: dados.telefone, tipoCaso, descricao, dadosExtra: {} }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao processar')
      router.push('/portal/peticoes')
    } catch (e) {
      setError((e as Error).message)
      setLoading(false)
    }
  }

  const tipoSelecionado = templates.find(t => t.tipoCaso === tipoCaso)

  return (
    <div className="min-h-full bg-[#f4f6fa] px-4 py-6 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/portal/peticoes" className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Petições
          </Link>
          <div className="w-px h-4 bg-gray-300" />
          <h1 className="text-lg font-bold text-[#1a2234]">Nova Petição</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {(['tipo', 'dados', 'perguntas'] as const).map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full flex-1 transition-all ${
              step === s ? 'bg-indigo-600' : (['tipo', 'dados', 'perguntas'].indexOf(step) > i ? 'bg-indigo-300' : 'bg-gray-200')
            }`} />
          ))}
        </div>

        {/* STEP: tipo de caso */}
        {step === 'tipo' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">Escolha o tipo de caso para começar</p>
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">Nenhum tipo de formulário disponível.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {templates.map(t => {
                  const cor = TIPO_CARD_COLOR[t.tipoCaso] || 'slate'
                  const cores = CARD_COR_MAP[cor] || CARD_COR_MAP['slate']
                  return (
                    <button key={t.tipoCaso} onClick={() => escolherTipo(t.tipoCaso)}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all text-left flex items-center gap-4">
                      <div className={`w-11 h-11 ${cores.icon} rounded-2xl flex items-center justify-center shrink-0`}>
                        <svg className="w-5 h-5 text-current opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900">{t.nome}</p>
                        {t.descricao && <p className="text-xs text-gray-400 mt-0.5">{t.descricao}</p>}
                      </div>
                      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP: dados do cliente */}
        {step === 'dados' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-6 pt-6 pb-4 border-b border-gray-50">
              {tipoSelecionado && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 mb-2">
                  {tipoSelecionado.nome}
                </span>
              )}
              <h2 className="text-base font-bold text-gray-900">Dados do cliente</h2>
              <p className="text-gray-400 text-xs mt-0.5">Informações de identificação</p>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nome completo *</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-gray-400" placeholder="Nome completo do cliente" value={dados.nome} onChange={e => setField('nome', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">CPF *</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-gray-400" placeholder="000.000.000-00" value={dados.cpf} onChange={e => setField('cpf', formatCPF(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Telefone *</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-gray-400" placeholder="(00) 00000-0000" value={dados.telefone} onChange={e => setField('telefone', formatPhone(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">E-mail *</label>
                <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-gray-400" type="email" placeholder="cliente@email.com" value={dados.email} onChange={e => setField('email', e.target.value)} />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex justify-between items-center">
              <button className="text-sm text-gray-500 hover:text-gray-800 font-semibold py-2 px-3 transition-colors" onClick={() => setStep('tipo')}>
                ← Voltar
              </button>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-40 text-sm" disabled={!canAvancarDados} onClick={avancarParaPerguntas}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* STEP: perguntas dinâmicas */}
        {step === 'perguntas' && (
          loadingForm ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Carregando formulário...</p>
            </div>
          ) : secoes.length > 0 ? (
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 text-sm font-semibold">{secaoAtual.nome}</span>
                  <span className="text-gray-400 text-xs tabular-nums">{secaoIdx + 1} / {secoes.length}</span>
                </div>
                <div className="flex gap-1.5">
                  {secoes.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === secaoIdx ? 'bg-indigo-600 flex-[2]' : i < secaoIdx ? 'bg-indigo-300 flex-1' : 'bg-gray-200 flex-1'}`} />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="divide-y divide-gray-50">
                  {secaoAtual.perguntas.map(p => (
                    <div key={p.id} className="px-6 py-6">
                      <label className="block text-sm font-semibold text-gray-800 leading-snug mb-3">
                        {p.texto}{p.obrigatoria && <span className="text-rose-500 ml-1">*</span>}
                      </label>
                      <PerguntaField p={p} value={respostas[p.id] || ''} detalhe={respostas[p.id + '_detalhe'] || ''} onChange={v => setResposta(p.id, v)} onDetalhe={v => setResposta(p.id + '_detalhe', v)} />
                    </div>
                  ))}
                </div>

                <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex justify-between items-center">
                  <button className="text-sm text-gray-500 hover:text-gray-800 font-semibold py-2 px-3 transition-colors" onClick={() => secaoIdx === 0 ? setStep('dados') : setSecaoIdx(i => i - 1)}>
                    ← Voltar
                  </button>
                  {isUltimaSecao ? (
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-40 text-sm flex items-center gap-2" disabled={!canSubmit || loading} onClick={handleSubmit}>
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Gerando...</> : 'Gerar Petição'}
                    </button>
                  ) : (
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-40 text-sm" disabled={!canPassarSecao} onClick={() => setSecaoIdx(i => i + 1)}>
                      Próximo →
                    </button>
                  )}
                </div>

                {error && <div className="mx-6 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <p className="text-gray-600 font-medium">Formulário não disponível para este tipo de caso.</p>
              <button onClick={() => setStep('dados')} className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-semibold">← Voltar</button>
            </div>
          )
        )}
      </div>
    </div>
  )
}
