'use client'

import { useEffect, useState, useRef } from 'react'

interface Escritorio {
  id: string
  nome: string
  cnpj: string | null
  email: string
  plano: string
  tokenLimit: number
  tokensUsados: number
  papelTimbrado: string | null
  logoBase64: string | null
}

interface UsuarioEsc {
  id: string
  nome: string
  email: string
  role: string
  ativo: boolean
  createdAt: string
}

type Tab = 'informacoes' | 'timbrado' | 'usuarios'

export default function EscritorioPage() {
  const [tab, setTab] = useState<Tab>('informacoes')
  const [escritorio, setEscritorio] = useState<Escritorio | null>(null)
  const [usuarios, setUsuarios] = useState<UsuarioEsc[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [timbradoPreview, setTimbradoPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // New user form
  const [showNewUser, setShowNewUser] = useState(false)
  const [newUser, setNewUser] = useState({ nome: '', email: '', senha: '', role: 'advogado' })
  const [addingUser, setAddingUser] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/escritorio').then(r => r.json()),
      fetch('/api/portal/usuarios').then(r => r.json()),
    ]).then(([esc, users]) => {
      setEscritorio(esc)
      setTimbradoPreview(esc?.papelTimbrado || null)
      setUsuarios(Array.isArray(users) ? users : [])
      setLoading(false)
    })
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setTimbradoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function saveTimbrado() {
    setSaving(true)
    await fetch('/api/portal/escritorio', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ papelTimbrado: timbradoPreview }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if (escritorio) setEscritorio({ ...escritorio, papelTimbrado: timbradoPreview })
  }

  async function handleAddUser() {
    if (!newUser.nome || !newUser.email || !newUser.senha) return
    setAddingUser(true)
    const res = await fetch('/api/portal/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
    if (res.ok) {
      const created = await res.json()
      setUsuarios(u => [...u, created])
      setNewUser({ nome: '', email: '', senha: '', role: 'advogado' })
      setShowNewUser(false)
    }
    setAddingUser(false)
  }

  async function toggleUser(userId: string, ativo: boolean) {
    await fetch(`/api/portal/usuarios/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo }),
    })
    setUsuarios(u => u.map(x => x.id === userId ? { ...x, ativo } : x))
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'informacoes', label: 'Informações' },
    { id: 'timbrado', label: 'Papel Timbrado' },
    { id: 'usuarios', label: 'Usuários' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Escritório</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie as informações e preferências do seu escritório</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-8">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Informações */}
      {tab === 'informacoes' && escritorio && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Dados Cadastrais</h2>
            <div className="space-y-4">
              {[
                { label: 'Nome do Escritório', value: escritorio.nome },
                { label: 'E-mail', value: escritorio.email },
                { label: 'CNPJ', value: escritorio.cnpj || 'Não informado' },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Plano e Consumo</h2>
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Plano Atual</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 capitalize">
                  {escritorio.plano}
                </span>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tokens Usados</p>
                  <p className="text-xs font-semibold text-gray-500">
                    {escritorio.tokensUsados.toLocaleString('pt-BR')} / {escritorio.tokenLimit.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min((escritorio.tokensUsados / escritorio.tokenLimit) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {Math.round((escritorio.tokensUsados / escritorio.tokenLimit) * 100)}% do limite utilizado
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Papel Timbrado */}
      {tab === 'timbrado' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-2">Upload do Papel Timbrado</h2>
            <p className="text-xs text-gray-500 mb-6">A imagem será inserida no topo das petições geradas em PDF. Use PNG ou JPG, preferencialmente em formato paisagem (ex: 1200×200 px).</p>

            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} className="hidden" />

            {timbradoPreview ? (
              <div className="mb-5">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <img src={timbradoPreview} alt="Papel timbrado" className="max-h-28 w-full object-contain object-left" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => fileRef.current?.click()} className="text-sm text-gray-500 hover:text-gray-700 font-medium underline underline-offset-2">
                    Trocar imagem
                  </button>
                  <button onClick={() => setTimbradoPreview(null)} className="text-sm text-red-500 hover:text-red-700 font-medium underline underline-offset-2">
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-xl p-10 text-center transition-colors group mb-5"
              >
                <div className="w-10 h-10 bg-gray-100 group-hover:bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-600 group-hover:text-indigo-600 transition-colors">Clique para enviar imagem</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG — até 2MB</p>
              </button>
            )}

            <button
              onClick={saveTimbrado}
              disabled={saving}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            >
              {saving ? 'Salvando...' : saved ? '✓ Salvo com sucesso' : 'Salvar Papel Timbrado'}
            </button>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Preview no Documento</h2>
            <div className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
              {timbradoPreview && (
                <div className="px-8 pt-6 pb-3 bg-white border-b border-gray-200">
                  <img src={timbradoPreview} alt="Preview" className="max-h-20 w-full object-contain object-left" />
                  <hr className="mt-3 border-gray-200" />
                </div>
              )}
              <div className="px-8 py-5 font-serif text-sm text-gray-700 leading-relaxed">
                <p className="text-center font-bold text-xs uppercase tracking-wider mb-3">EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DO TRABALHO</p>
                <p className="text-justify text-xs text-gray-500 leading-relaxed">
                  [Nome do Cliente], por intermédio de seus patronos, vem propor
                  RECLAMAÇÃO TRABALHISTA em face de [Reclamada], pelas razões de fato e direito a seguir expostas...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usuários */}
      {tab === 'usuarios' && (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Usuários do Escritório</h2>
              <p className="text-xs text-gray-400 mt-0.5">{usuarios.filter(u => u.ativo).length} usuários ativos</p>
            </div>
            <button
              onClick={() => setShowNewUser(s => !s)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Novo Usuário
            </button>
          </div>

          {/* New user form */}
          {showNewUser && (
            <div className="px-6 py-5 bg-indigo-50/40 border-b border-indigo-100">
              <p className="text-sm font-semibold text-gray-700 mb-4">Adicionar Usuário</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  placeholder="Nome completo"
                  value={newUser.nome}
                  onChange={e => setNewUser(u => ({ ...u, nome: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={newUser.email}
                  onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={newUser.senha}
                  onChange={e => setNewUser(u => ({ ...u, senha: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                />
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
                  className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                >
                  <option value="advogado">Advogado</option>
                  <option value="admin_escritorio">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddUser} disabled={addingUser} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                  {addingUser ? 'Adicionando...' : 'Adicionar'}
                </button>
                <button onClick={() => setShowNewUser(false)} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2.5">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Perfil</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Desde</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">Nenhum usuário cadastrado ainda</td></tr>
              ) : usuarios.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {u.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{u.nome}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${u.role === 'admin_escritorio' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'}`}>
                      {u.role === 'admin_escritorio' ? 'Administrador' : 'Advogado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${u.ativo ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleUser(u.id, !u.ativo)}
                      className={`text-xs font-semibold ${u.ativo ? 'text-red-500 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'} transition-colors`}
                    >
                      {u.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
