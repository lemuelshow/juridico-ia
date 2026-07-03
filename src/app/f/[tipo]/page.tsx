'use client'

import { useMemo, useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

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
  const base = 'w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all bg-white shadow-sm placeholder:text-slate-400'
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
              className={`py-3.5 rounded-xl text-sm font-semibold border-2 transition-all shadow-sm ${value === opt ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>
              {opt}
            </button>
          ))}
        </div>
        {value === 'Sim' && p.campoDetalhe && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{p.detalheLabel || 'Especifique:'}</label>
            <textarea className={`${base} min-h-[80px] resize-y`} value={detalhe} onChange={e => onDetalhe(e.target.value)} placeholder="Descreva com detalhes..." />
          </div>
        )}
      </div>
    )
    case 'opcoes': return (
      <div className="space-y-2">
        {p.opcoes.map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-all text-left shadow-sm ${value === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}>
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${value === opt ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
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

  const tipo = params.tipo
  const escritorioId = searchParams.get('e') || undefined

  const [step, setStep] = useState(1)
  const [enviado, setEnviado] = useState(false)
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
      setEnviado(true)
      setLoading(false)
    } catch (e) { setError((e as Error).message); setLoading(false) }
  }

  const glassCard = 'rounded-2xl overflow-hidden shadow-2xl'
  const glassStyle = {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.22)',
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#0f172a' }}>
      {/* ── Full-screen video background ── */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.55 }}
        src="/peticioneaki.mp4"
      />

      {/* ── Dark overlay for legibility ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 20%, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.82) 65%, #0f172a 100%)' }}
      />

      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/10 z-50">
        <div className="h-full bg-white transition-all duration-500" style={{ width: `${progressoPct}%` }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative z-10">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="Peticionaaki" className="h-12 w-auto object-contain mx-auto mb-5" />
          <p className="text-white font-semibold text-base">{tipoLabel}</p>
          {escritorioNome && <p className="text-white/40 text-xs mt-1">{escritorioNome}</p>}
        </div>

        <div className="w-full max-w-md">
          {/* Confirmação de envio */}
          {enviado ? (
            <div className={glassCard} style={glassStyle}>
              <div className="px-8 py-10 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white mb-2">Recebemos sua resposta!</h1>
                <p className="text-white/70 text-sm leading-relaxed">
                  Sua resposta foi recebida e encaminhada para um dos nossos especialistas.
                </p>
              </div>
            </div>
          ) : (
          <>
          {/* STEP 1 — Dados pessoais */}
          {step === 1 && (
            <div className={glassCard} style={glassStyle}>
              <div className="px-8 pt-8 pb-6">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Etapa 1 de 2</p>
                <h1 className="text-2xl font-bold text-white">Seus dados</h1>
                <p className="text-white/60 text-sm mt-1">Para identificarmos o seu caso</p>
              </div>
              <div className="px-8 pb-8 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-1.5">Nome completo *</label>
                  <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all placeholder:text-slate-400" placeholder="Seu nome completo" value={dados.nome} onChange={e => setField('nome', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-1.5">CPF *</label>
                    <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all placeholder:text-slate-400" placeholder="000.000.000-00" value={dados.cpf} onChange={e => setField('cpf', formatCPF(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-1.5">Telefone *</label>
                    <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all placeholder:text-slate-400" placeholder="(00) 00000-0000" value={dados.telefone} onChange={e => setField('telefone', formatPhone(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wide mb-1.5">E-mail *</label>
                  <input className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all placeholder:text-slate-400" type="email" placeholder="seu@email.com" value={dados.email} onChange={e => setField('email', e.target.value)} />
                </div>
                <button className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-40 text-sm" disabled={!canNext1} onClick={goToStep2}>
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

                <div className={glassCard} style={glassStyle}>
                  <div className="divide-y divide-white/15">
                    {secaoAtual.perguntas.map(p => (
                      <div key={p.id} className="px-8 py-7">
                        <label className="block text-sm font-semibold text-white leading-snug mb-4">
                          {p.texto}{p.obrigatoria && <span className="text-rose-300 ml-1">*</span>}
                        </label>
                        <PerguntaField p={p} value={respostas[p.id] || ''} detalhe={respostas[p.id + '_detalhe'] || ''} onChange={v => setResposta(p.id, v)} onDetalhe={v => setResposta(p.id + '_detalhe', v)} />
                      </div>
                    ))}
                  </div>

                  <div className="px-8 py-6 bg-black/15 border-t border-white/15 flex justify-between items-center">
                    <button className="text-sm text-white/60 hover:text-white font-semibold py-2 px-3 transition-colors" onClick={() => secaoIdx === 0 ? setStep(1) : setSecaoIdx(i => i - 1)}>
                      ← Voltar
                    </button>
                    {isUltimaSecao ? (
                      <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-7 rounded-xl transition-colors disabled:opacity-40 text-sm flex items-center gap-2" disabled={!canSubmit || loading} onClick={handleSubmit}>
                        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</> : 'Enviar para Especialista'}
                      </button>
                    ) : (
                      <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-7 rounded-xl transition-colors disabled:opacity-40 text-sm" disabled={!canPassarSecao} onClick={() => setSecaoIdx(i => i + 1)}>
                        Próximo →
                      </button>
                    )}
                  </div>

                  {error && <div className="mx-8 mb-6 bg-red-500/10 border border-red-400/30 text-red-200 rounded-xl p-3 text-sm">{error}</div>}
                </div>
              </div>
            ) : (
              <div className={glassCard} style={glassStyle}>
                <div className="p-8 text-center">
                  <p className="text-white/80 font-medium">Formulário não disponível para este tipo de caso.</p>
                  <button onClick={() => setStep(1)} className="mt-4 text-indigo-300 hover:text-indigo-200 text-sm font-semibold">← Voltar</button>
                </div>
              </div>
            )
          )}
          </>
          )}
        </div>
      </div>
    </div>
  )
}
