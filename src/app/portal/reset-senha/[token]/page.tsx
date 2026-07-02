'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ResetSenhaPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [validating, setValidating] = useState(true)
  const [valid, setValid] = useState(false)
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/portal/reset-senha/confirmar?token=${token}`)
      .then(r => r.json())
      .then(d => setValid(d.valid))
      .finally(() => setValidating(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha !== confirma) { setError('As senhas não conferem.'); return }
    if (senha.length < 6) { setError('A senha deve ter ao menos 6 caracteres.'); return }
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/portal/reset-senha/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha: senha }),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error)
      setSuccess(true)
      setTimeout(() => router.push('/portal/login'), 3000)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <img src="/logo.png" alt="Peticionaaki" className="h-9 w-auto object-contain" />
        </div>

        {validating ? (
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            Verificando link...
          </div>
        ) : !valid ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Link inválido ou expirado</h2>
            <p className="text-gray-500 text-sm mb-6">Este link de redefinição não é mais válido. Solicite um novo na página de login.</p>
            <a href="/portal/login" className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-indigo-700 transition-colors">
              Voltar ao Login
            </a>
          </div>
        ) : success ? (
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Senha redefinida!</h2>
            <p className="text-gray-500 text-sm">Você será redirecionado para o login em instantes...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Nova senha</h2>
            <p className="text-gray-500 text-sm mb-6">Escolha uma senha segura para a sua conta.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nova senha</label>
                <input
                  type="password" required minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={senha} onChange={e => setSenha(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Confirmar senha</label>
                <input
                  type="password" required minLength={6}
                  placeholder="Repita a senha"
                  value={confirma} onChange={e => setConfirma(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit" disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 text-sm mt-2"
              >
                {loading ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
