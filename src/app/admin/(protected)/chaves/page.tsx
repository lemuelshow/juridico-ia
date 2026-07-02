'use client'

import { useEffect, useState } from 'react'

interface Chave {
  id: string
  nome: string
  chaveApi: string
  modelo: string
  ativo: boolean
  maxTokens: number
  createdAt: string
}

const MODELOS = [
  'claude-sonnet-4-6',
  'claude-opus-4-8',
  'claude-haiku-4-5-20251001',
]

export default function ChavesPage() {
  const [chaves, setChaves] = useState<Chave[]>([])
  const [form, setForm] = useState({ nome: '', chaveApi: '', modelo: 'claude-sonnet-4-6', maxTokens: 4000 })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => fetch('/api/admin/chaves').then((r) => r.json()).then(setChaves)
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const res = await fetch('/api/admin/chaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setMsg('Chave adicionada com sucesso!')
      setForm({ nome: '', chaveApi: '', modelo: 'claude-sonnet-4-6', maxTokens: 4000 })
      load()
    } else {
      const d = await res.json()
      setMsg(d.error || 'Erro ao salvar')
    }
    setLoading(false)
  }

  async function toggleAtivo(chave: Chave) {
    await fetch(`/api/admin/chaves/${chave.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !chave.ativo }),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta chave?')) return
    await fetch(`/api/admin/chaves/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-6">Chaves da API Claude</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-navy-800 mb-4">Adicionar Nova Chave</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="label">Nome da Configuração</label>
              <input className="input" placeholder="Ex: Produção Principal" value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div>
              <label className="label">Chave API (sk-ant-...)</label>
              <input className="input" type="password" placeholder="sk-ant-api03-..." value={form.chaveApi}
                onChange={(e) => setForm({ ...form, chaveApi: e.target.value })} required />
            </div>
            <div>
              <label className="label">Modelo</label>
              <select className="input" value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}>
                {MODELOS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Máximo de Tokens por Resposta</label>
              <input className="input" type="number" min={100} max={16000} value={form.maxTokens}
                onChange={(e) => setForm({ ...form, maxTokens: Number(e.target.value) })} />
            </div>
            {msg && <p className={`text-sm ${msg.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Salvando...' : 'Adicionar Chave'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="font-bold text-navy-800 mb-4">Chaves Cadastradas</h2>
          {chaves.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">Nenhuma chave cadastrada</p>
          ) : (
            <div className="space-y-3">
              {chaves.map((c) => (
                <div key={c.id} className={`border rounded-xl p-4 ${c.ativo ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-navy-800 text-sm">{c.nome}</p>
                      <p className="text-xs text-gray-500 font-mono">{c.chaveApi}</p>
                    </div>
                    <span className={`badge ${c.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {c.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{c.modelo} · {c.maxTokens.toLocaleString()} tokens</p>
                  <div className="flex gap-2">
                    <button onClick={() => toggleAtivo(c)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        c.ativo ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-600 text-white hover:bg-green-700'
                      }`}>
                      {c.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={() => handleDelete(c.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-colors">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
