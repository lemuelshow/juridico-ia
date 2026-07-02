'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'

function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('admin-credentials', { email, password: senha, redirect: false })

    if (result?.error) {
      setError('Email ou senha incorretos')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Peticionaaki" className="h-12 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold">Painel Administrativo</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-navy-800 mb-6">Entrar</h2>

          <div className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input className="input" type="email" placeholder="admin@juridico.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" placeholder="••••••••"
                value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
          )}

          <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <SessionProvider>
      <LoginForm />
    </SessionProvider>
  )
}
