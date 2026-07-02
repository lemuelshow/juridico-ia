'use client'

import { useEffect, useState } from 'react'

interface Contexto {
  id: string
  nome: string
  tipoCaso: string
  promptSistema: string
  ativo: boolean
}

const tipoLabels: Record<string, string> = {
  trabalhista: 'Direito Trabalhista', previdenciario: 'Previdenciário',
  consumidor: 'Consumidor', civel: 'Cível', outros: 'Outros',
}

export default function ContextosPage() {
  const [contextos, setContextos] = useState<Contexto[]>([])
  const [selected, setSelected] = useState<Contexto | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => fetch('/api/admin/contextos').then((r) => r.json()).then(setContextos)
  useEffect(() => { load() }, [])

  function handleSelect(ctx: Contexto) {
    setSelected({ ...ctx })
    setMsg('')
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    setMsg('')
    const res = await fetch(`/api/admin/contextos/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: selected.nome, promptSistema: selected.promptSistema, ativo: selected.ativo }),
    })
    if (res.ok) {
      setMsg('Contexto salvo com sucesso!')
      load()
    } else {
      setMsg('Erro ao salvar')
    }
    setSaving(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-2">Contextos das Petições</h1>
      <p className="text-gray-500 text-sm mb-6">Configure os prompts de sistema que orientam a IA na geração de cada tipo de petição</p>

      <div className="grid grid-cols-3 gap-6">
        <div className="card col-span-1">
          <h2 className="font-bold text-navy-800 mb-3 text-sm">Tipos de Caso</h2>
          <div className="space-y-2">
            {contextos.map((ctx) => (
              <button
                key={ctx.id}
                onClick={() => handleSelect(ctx)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                  selected?.id === ctx.id
                    ? 'bg-navy-700 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-navy-800'
                }`}
              >
                <p className="font-medium">{tipoLabels[ctx.tipoCaso] || ctx.tipoCaso}</p>
                <p className={`text-xs mt-0.5 ${selected?.id === ctx.id ? 'text-navy-200' : 'text-gray-400'}`}>
                  {ctx.ativo ? 'Ativo' : 'Inativo'}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="card col-span-2">
          {!selected ? (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
              Selecione um tipo de caso à esquerda
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-navy-800">{tipoLabels[selected.tipoCaso] || selected.tipoCaso}</h2>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.ativo}
                    onChange={(e) => setSelected({ ...selected, ativo: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-gray-600">Ativo</span>
                </label>
              </div>

              <div className="mb-4">
                <label className="label">Nome do Contexto</label>
                <input
                  className="input"
                  value={selected.nome}
                  onChange={(e) => setSelected({ ...selected, nome: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="label">
                  Prompt do Sistema
                  <span className="text-gray-400 font-normal ml-2 text-xs">
                    (instrui a IA sobre como gerar a petição)
                  </span>
                </label>
                <textarea
                  className="input min-h-[300px] resize-y font-mono text-xs"
                  value={selected.promptSistema}
                  onChange={(e) => setSelected({ ...selected, promptSistema: e.target.value })}
                />
              </div>

              {msg && (
                <p className={`text-sm mb-3 ${msg.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>
              )}

              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Contexto'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
