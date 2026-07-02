'use client'

import { useEffect, useState } from 'react'

interface Gateway {
  id: string
  nome: string
  chavePublica: string
  chavePrivada: string
  ambiente: string
  ativo: boolean
  dadosExtra: string
}

const GATEWAYS_SUGERIDOS = ['Stripe', 'MercadoPago', 'Pagar.me', 'PagSeguro', 'Asaas']

export default function GatewayPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [form, setForm] = useState({
    nome: '', chavePublica: '', chavePrivada: '', ambiente: 'sandbox', webhookUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => fetch('/api/admin/gateway').then((r) => r.json()).then(setGateways)
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const res = await fetch('/api/admin/gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        chavePublica: form.chavePublica,
        chavePrivada: form.chavePrivada,
        ambiente: form.ambiente,
        dadosExtra: { webhookUrl: form.webhookUrl },
      }),
    })
    if (res.ok) {
      setMsg('Gateway cadastrado com sucesso!')
      setForm({ nome: '', chavePublica: '', chavePrivada: '', ambiente: 'sandbox', webhookUrl: '' })
      load()
    } else {
      const d = await res.json()
      setMsg(d.error || 'Erro ao salvar')
    }
    setLoading(false)
  }

  async function toggleAtivo(gw: Gateway) {
    await fetch(`/api/admin/gateway/${gw.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !gw.ativo }),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este gateway?')) return
    await fetch(`/api/admin/gateway/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-2">Gateway de Pagamento</h1>
      <p className="text-gray-500 text-sm mb-6">Cadastre e gerencie os gateways de pagamento (integração será ativada em versão futura)</p>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-navy-800 mb-4">Cadastrar Gateway</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {GATEWAYS_SUGERIDOS.map((g) => (
              <button key={g} onClick={() => setForm({ ...form, nome: g })}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  form.nome === g ? 'bg-navy-700 text-white border-navy-700' : 'border-gray-300 text-gray-600 hover:border-navy-500'
                }`}>
                {g}
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="label">Nome do Gateway</label>
              <input className="input" placeholder="Ex: Stripe" value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div>
              <label className="label">Ambiente</label>
              <select className="input" value={form.ambiente}
                onChange={(e) => setForm({ ...form, ambiente: e.target.value })}>
                <option value="sandbox">Sandbox / Testes</option>
                <option value="producao">Produção</option>
              </select>
            </div>
            <div>
              <label className="label">Chave Pública</label>
              <input className="input" placeholder="pk_test_... ou equivalente" value={form.chavePublica}
                onChange={(e) => setForm({ ...form, chavePublica: e.target.value })} />
            </div>
            <div>
              <label className="label">Chave Privada / Secreta</label>
              <input className="input" type="password" placeholder="sk_test_... ou equivalente" value={form.chavePrivada}
                onChange={(e) => setForm({ ...form, chavePrivada: e.target.value })} />
            </div>
            <div>
              <label className="label">URL Webhook (opcional)</label>
              <input className="input" placeholder="https://seusite.com/webhook/pagamento" value={form.webhookUrl}
                onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })} />
            </div>

            {msg && <p className={`text-sm ${msg.includes('sucesso') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Salvando...' : 'Cadastrar Gateway'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="font-bold text-navy-800 mb-4">Gateways Cadastrados</h2>
          {gateways.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">Nenhum gateway cadastrado</p>
              <p className="text-gray-300 text-xs mt-2">Adicione um gateway de pagamento ao lado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gateways.map((gw) => {
                let extra: { webhookUrl?: string } = {}
                try { extra = JSON.parse(gw.dadosExtra) } catch {}
                return (
                  <div key={gw.id} className={`border rounded-xl p-4 ${gw.ativo ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-navy-800">{gw.nome}</p>
                      <span className={`badge ${gw.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {gw.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      Ambiente: <span className="font-medium">{gw.ambiente === 'producao' ? 'Produção' : 'Sandbox'}</span>
                    </p>
                    {gw.chavePublica && (
                      <p className="text-xs text-gray-500 mb-1 font-mono">Pub: {gw.chavePublica.slice(0, 20)}...</p>
                    )}
                    {extra.webhookUrl && (
                      <p className="text-xs text-gray-500 mb-2">Webhook: {extra.webhookUrl}</p>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => toggleAtivo(gw)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          gw.ativo ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-600 text-white hover:bg-green-700'
                        }`}>
                        {gw.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button onClick={() => handleDelete(gw.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium">
                        Excluir
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
