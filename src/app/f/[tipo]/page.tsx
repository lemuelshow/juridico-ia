'use client'

import { useMemo, useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

interface Pergunta {
  id: string; ordem: number; texto: string; tipo: string; secao: string
  placeholder: string; obrigatoria: boolean; opcoes: string[]; campoDetalhe: boolean; detalheLabel: string
}
interface Secao { nome: string; perguntas: Pergunta[] }


function formatCPF(v: string) {
  return v.replace(/\D/g,'').slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2')
}
function formatPhone(v: string) {
  return v.replace(/\D/g,'').slice(0,11).replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d{4})$/,'$1-$2')
}

function PerguntaField({ p, value, detalhe, onChange, onDetalhe }: {
  p: Pergunta; value: string; detalhe: string; onChange: (v: string) => void; onDetalhe: (v: string) => void
}) {
  const base = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-gray-50 focus:bg-white placeholder:text-gray-400'
  switch (p.tipo) {
    case 'texto_curto': return <input className={base} type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={p.placeholder || 'Digite aqui...'} />
    case 'texto_longo': return <textarea className={`${base} min-h-[110px] resize-y`} value={value} onChange={e => onChange(e.target.value)} placeholder={p.placeholder || 'Escreva aqui...'} />
    case 'data': return <input className={base} type="date" value={value} onChange={e => onChange(e.target.value)} />
    case 'numero': return <input className={base} type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={p.placeholder} />
    case 'sim_nao': return (
      <div>
        <div className="grid grid-cols-2 gap-3">
          {['Sim','Não'].map(opt => (
            <button key={opt} type="button" onClick={() => onChange(opt)}
              className={`py-3.5 rounded-xl text-sm font-semibold border-2 transition-all ${value === opt ? 'border-slate-800 bg-slate-800 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-slate-300'}`}>
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-all text-left ${value === opt ? 'border-slate-800 bg-slate-50 text-slate-800 font-semibold' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${value === opt ? 'border-slate-800 bg-slate-800' : 'border-gray-300'}`}>
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

export default function FormularioPage() {
  const params = useParams<{ tipo: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const tipo = params.tipo
  const escritorioId = searchParams.get('e') || undefined

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingForm, setLoadingForm] = useState(false)
  const [error, setError] = useState('')
  const [tipoLabel, setTipoLabel] = useState('Formulário Jurídico')
  const [escritorioNome, setEscritorioNome] = useState('')

  const [dados, setDados] = useState({ nome: '', cpf: '', email: '', telefone: '' })
  const [perguntas, setPerguntas] = useState<Pergunta[] | null>(null)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [secaoIdx, setSecaoIdx] = useState(0)

  const setField = (f: string, v: string) => setDados(d => ({ ...d, [f]: v }))
  const setResposta = (id: string, v: string) => setRespostas(r => ({ ...r, [id]: v }))

  // Busca nome do template e do escritório
  useEffect(() => {
    fetch(`/api/formularios/${tipo}`).then(r => r.ok ? r.json() : null).then(d => {
      if (d?.nome) setTipoLabel(d.nome)
    }).catch(() => {})
  }, [tipo])

  useEffect(() => {
    if (!escritorioId) return
    fetch(`/api/escritorio-info?e=${escritorioId}`).then(r => r.ok ? r.json() : null).then(d => {
      if (d?.nome) setEscritorioNome(d.nome)
    }).catch(() => {})
  }, [escritorioId])

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
  const canNext1 = dados.nome && dados.cpf.length >= 14 && dados.email && dados.telefone

  const progressoPct = step === 1 ? 0 : step === 2 && secoes.length > 0 ? Math.round((secaoIdx / secoes.length) * 100) : 80

  async function goToStep2() {
    setStep(2)
    setLoadingForm(true)
    setPerguntas(null)
    setRespostas({})
    setSecaoIdx(0)
    try {
      const r = await fetch(`/api/formularios/${tipo}`)
      const data = await r.json()
      setPerguntas(data?.perguntas?.length > 0 ? data.perguntas : null)
    } catch { setPerguntas(null) }
    setLoadingForm(false)
  }

  async function handleSubmit() {
    if (!perguntas) return
    setLoading(true)
    setError('')
    try {
      const descricao = perguntas.filter(p => respostas[p.id]).map(p => {
        const ans = respostas[p.id]
        const det = respostas[p.id + '_detalhe']
        return `${p.texto}\n→ ${ans}${det ? `\n→ Detalhes: ${det}` : ''}`
      }).join('\n\n')

      const res = await fetch('/api/formulario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: dados.nome, cpf: dados.cpf, email: dados.email, telefone: dados.telefone, tipoCaso: tipo, descricao, dadosExtra: {}, escritorioId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Erro ao processar')
      router.push(`/peticao/${json.peticaoId}`)
    } catch (e) { setError((e as Error).message); setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/10 z-50">
        <div className="h-full bg-white transition-all duration-500" style={{ width: `${progressoPct}%` }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Peticionaaki" className="h-12 w-auto object-contain mx-auto mb-5" />
          <p className="text-white font-semibold text-base">{tipoLabel}</p>
          {escritorioNome && <p className="text-white/40 text-xs mt-1">{escritorioNome}</p>}
        </div>

        <div className="w-full max-w-md">
          {/* STEP 1 — Dados pessoais */}
          {step === 1 && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-8 pt-8 pb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Etapa 1 de 2</p>
                <h1 className="text-2xl font-bold text-slate-900">Seus dados</h1>
                <p className="text-slate-500 text-sm mt-1">Para identificarmos o seu caso</p>
              </div>
              <div className="px-8 pb-8 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Nome completo *</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-gray-400" placeholder="Seu nome completo" value={dados.nome} onChange={e => setField('nome', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">CPF *</label>
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-gray-400" placeholder="000.000.000-00" value={dados.cpf} onChange={e => setField('cpf', formatCPF(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Telefone *</label>
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-gray-400" placeholder="(00) 00000-0000" value={dados.telefone} onChange={e => setField('telefone', formatPhone(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">E-mail *</label>
                  <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-gray-400" type="email" placeholder="seu@email.com" value={dados.email} onChange={e => setField('email', e.target.value)} />
                </div>
                <button className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-40 text-sm" disabled={!canNext1} onClick={goToStep2}>
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Formulário dinâmico */}
          {step === 2 && (
            loadingForm ? (
              <div className="flex flex-col items-center gap-4 py-20">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-white/50 text-sm">Carregando formulário...</p>
              </div>
            ) : secoes.length > 0 ? (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/90 text-sm font-semibold">{secaoAtual.nome}</span>
                    <span className="text-white/40 text-xs tabular-nums">{secaoIdx + 1} / {secoes.length}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {secoes.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === secaoIdx ? 'bg-white flex-[2]' : i < secaoIdx ? 'bg-white/60 flex-1' : 'bg-white/20 flex-1'}`} />
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {secaoAtual.perguntas.map(p => (
                      <div key={p.id} className="px-8 py-7">
                        <label className="block text-sm font-semibold text-slate-800 leading-snug mb-4">
                          {p.texto}{p.obrigatoria && <span className="text-rose-400 ml-1">*</span>}
                        </label>
                        <PerguntaField p={p} value={respostas[p.id] || ''} detalhe={respostas[p.id + '_detalhe'] || ''} onChange={v => setResposta(p.id, v)} onDetalhe={v => setResposta(p.id + '_detalhe', v)} />
                      </div>
                    ))}
                  </div>

                  <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button className="text-sm text-slate-500 hover:text-slate-800 font-semibold py-2 px-3 transition-colors" onClick={() => secaoIdx === 0 ? setStep(1) : setSecaoIdx(i => i - 1)}>
                      ← Voltar
                    </button>
                    {isUltimaSecao ? (
                      <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-7 rounded-xl transition-colors disabled:opacity-40 text-sm flex items-center gap-2" disabled={!canSubmit || loading} onClick={handleSubmit}>
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</> : 'Enviar para Especialista'}
                      </button>
                    ) : (
                      <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-7 rounded-xl transition-colors disabled:opacity-40 text-sm" disabled={!canPassarSecao} onClick={() => setSecaoIdx(i => i + 1)}>
                        Próximo →
                      </button>
                    )}
                  </div>

                  {error && <div className="mx-8 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
                <p className="text-gray-600 font-medium">Formulário não disponível para este tipo de caso.</p>
                <button onClick={() => setStep(1)} className="mt-4 text-indigo-600 text-sm font-semibold">← Voltar</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
