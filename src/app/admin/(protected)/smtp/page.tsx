'use client'

import { useEffect, useState } from 'react'

interface SmtpForm {
  host: string
  port: string
  user: string
  password: string
  fromName: string
  fromEmail: string
  secure: boolean
}

export default function SmtpPage() {
  const [form, setForm] = useState<SmtpForm>({
    host: '', port: '587', user: '', password: '', fromName: 'Peticionaaki', fromEmail: '', secure: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/smtp')
      .then(r => r.json())
      .then(d => {
        setForm({
          host: d.host || '',
          port: String(d.port || 587),
          user: d.user || '',
          password: d.password || '',
          fromName: d.fromName || 'Peticionaaki',
          fromEmail: d.fromEmail || '',
          secure: d.secure || false,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  function set(k: keyof SmtpForm, v: string | boolean) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    try {
      const r = await fetch('/api/admin/smtp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, port: Number(form.port) }),
      })
      if (!r.ok) throw new Error((await r.json()).error)
      setMsg({ type: 'success', text: 'Configurações salvas com sucesso!' })
    } catch (e) {
      setMsg({ type: 'error', text: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    if (!testEmail.trim()) return
    setTesting(true)
    setMsg(null)
    try {
      const r = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error)
      setMsg({ type: 'success', text: `E-mail de teste enviado para ${testEmail}!` })
    } catch (e) {
      setMsg({ type: 'error', text: (e as Error).message })
    } finally {
      setTesting(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white'
  const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'

  if (loading) return <div className="p-8 text-gray-400 text-sm">Carregando...</div>

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-900">Configuração SMTP</h1>
        <p className="text-gray-500 text-sm mt-1">Configure o servidor de e-mail para envio de notificações e recuperação de senha.</p>
      </div>

      {msg && (
        <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${msg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="font-semibold text-gray-900 text-sm">Servidor de Saída</p>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Host SMTP</label>
              <input className={inputCls} placeholder="smtp.gmail.com" value={form.host} onChange={e => set('host', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Porta</label>
              <input className={inputCls} type="number" placeholder="587" value={form.port} onChange={e => set('port', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Usuário (e-mail)</label>
              <input className={inputCls} type="email" placeholder="envio@seudominio.com" value={form.user} onChange={e => set('user', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Senha</label>
              <input className={inputCls} type="password" placeholder="Senha ou App Password" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nome do Remetente</label>
              <input className={inputCls} placeholder="Peticionaaki" value={form.fromName} onChange={e => set('fromName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>E-mail do Remetente</label>
              <input className={inputCls} type="email" placeholder="noreply@seudominio.com" value={form.fromEmail} onChange={e => set('fromEmail', e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set('secure', !form.secure)}
              className={`relative w-10 h-6 rounded-full transition-colors ${form.secure ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.secure ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-gray-700 font-medium">SSL/TLS (porta 465)</span>
          </label>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">Exemplos de configuração:</p>
            <p>• Gmail: host <code>smtp.gmail.com</code>, porta <code>587</code>, use "Senha de App"</p>
            <p>• Outlook/Office365: host <code>smtp.office365.com</code>, porta <code>587</code></p>
            <p>• Brevo/SendGrid: verifique a documentação do serviço</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>

      {/* Test section */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="font-semibold text-gray-900 text-sm">Testar Envio</p>
          <p className="text-gray-400 text-xs mt-0.5">Envia um e-mail de teste para verificar se a configuração está correta</p>
        </div>
        <div className="p-6 flex gap-3">
          <input
            className={`${inputCls} flex-1`}
            type="email"
            placeholder="destinatario@email.com"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
          />
          <button
            onClick={handleTest}
            disabled={testing || !testEmail.trim()}
            className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            {testing ? 'Enviando...' : 'Enviar Teste'}
          </button>
        </div>
      </div>
    </div>
  )
}
