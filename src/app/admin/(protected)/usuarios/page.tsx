'use client'

import { useEffect, useState } from 'react'

interface Usuario {
  id: string
  email: string
  nome: string
  tokenLimit: number
  tokensUsados: number
  ativo: boolean
  createdAt: string
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [form, setForm] = useState({ nome: '', email: '', senha: '', tokenLimit: 10000 })
  const [editId, setEditId] = useState<string | null>(null)
  const [editLimit, setEditLimit] = useState(0)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => fetch('/api/admin/usuarios').then((r) => r.json()).then(setUsuarios)
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg('Usuário criado com sucesso!')
      setForm({ nome: '', email: '', senha: '', tokenLimit: 10000 })
      load()
    } else {
      setMsg(data.error || 'Erro ao criar usuário')
    }
    setLoading(false)
  }

  async function handleUpdateLimit(id: string) {
    await fetch(`/api/admin/usuarios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenLimit: editLimit }),
    })
    setEditId(null)
    load()
  }

  async function toggleAtivo(u: Usuario) {
    await fetch(`/api/admin/usuarios/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !u.ativo }),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este usuário?')) return
    await fetch(`/api/admin/usuarios/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-6">Usuários do Sistema</h1>

      <div className="grid grid-cols-5 gap-6">
        <div className="card col-span-2">
          <h2 className="font-bold text-navy-800 mb-4">Novo Usuário</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input className="input" placeholder="Nome completo" value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" placeholder="email@exemplo.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" placeholder="Senha segura" value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })} required />
            </div>
            <div>
              <label className="label">Limite de Tokens</label>
              <input className="input" type="number" min={0} value={form.tokenLimit}
                onChange={(e) => setForm({ ...form, tokenLimit: Number(e.target.value) })} />
              <p className="text-xs text-gray-400 mt-1">0 = sem limite</p>
            </div>
            {msg && <p className={`text-sm ${msg.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Usuário'}
            </button>
          </form>
        </div>

        <div className="card col-span-3">
          <h2 className="font-bold text-navy-800 mb-4">Usuários Cadastrados</h2>
          {usuarios.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum usuário cadastrado</p>
          ) : (
            <div className="space-y-3">
              {usuarios.map((u) => (
                <div key={u.id} className={`border rounded-xl p-4 ${u.ativo ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-navy-800 text-sm">{u.nome}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <span className={`badge ${u.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Token progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Tokens usados</span>
                      <span>{u.tokensUsados.toLocaleString()} / {u.tokenLimit === 0 ? '∞' : u.tokenLimit.toLocaleString()}</span>
                    </div>
                    {u.tokenLimit > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-navy-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min((u.tokensUsados / u.tokenLimit) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {editId === u.id ? (
                    <div className="flex gap-2 items-center mb-2">
                      <input type="number" className="input text-sm py-1" value={editLimit}
                        onChange={(e) => setEditLimit(Number(e.target.value))} />
                      <button onClick={() => handleUpdateLimit(u.id)}
                        className="text-xs px-3 py-1.5 bg-navy-700 text-white rounded-lg hover:bg-navy-800">
                        Salvar
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg">
                        Cancelar
                      </button>
                    </div>
                  ) : null}

                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { setEditId(u.id); setEditLimit(u.tokenLimit) }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium">
                      Alterar Limite
                    </button>
                    <button onClick={() => toggleAtivo(u)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium">
                      {u.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={() => handleDelete(u.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium">
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
