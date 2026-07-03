'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalForms: number
  totalPeticoes: number
  totalTokens: number
  porTipo: { tipoCaso: string; _count: { id: number } }[]
}

interface Peticao {
  id: string
  processando: boolean
  erro: boolean
  createdAt: string
  tokensUsados: number
  modeloUsado: string
  formulario: { nome: string; tipoCaso: string; email: string }
}

const tipoLabels: Record<string, string> = {
  trabalhista: 'Trabalhista',
  previdenciario: 'Previdenciário',
  consumidor: 'Consumidor',
  civel: 'Cível',
  outros: 'Outros',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [peticoes, setPeticoes] = useState<Peticao[]>([])

  useEffect(() => {
    fetch('/api/admin/stats').then((r) => r.json()).then(setStats)
    fetch('/api/admin/peticoes').then((r) => r.json()).then((data) => setPeticoes(data.slice(0, 10)))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Formulários Enviados</p>
          <p className="text-3xl font-bold text-navy-700">{stats?.totalForms ?? '...'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Petições Geradas</p>
          <p className="text-3xl font-bold text-green-600">{stats?.totalPeticoes ?? '...'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Tokens Consumidos</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.totalTokens?.toLocaleString() ?? '...'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-navy-800 mb-4">Por Tipo de Caso</h2>
          {stats?.porTipo.map((t) => (
            <div key={t.tipoCaso} className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
              <span className="text-gray-600">{tipoLabels[t.tipoCaso] || t.tipoCaso}</span>
              <span className="font-semibold text-navy-700">{t._count.id}</span>
            </div>
          )) ?? <p className="text-gray-400 text-sm">Carregando...</p>}
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-navy-800">Últimas Petições</h2>
            <Link href="/admin/peticoes" className="text-sm text-navy-600 hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {peticoes.length === 0 && <p className="text-gray-400 text-sm">Nenhuma petição ainda</p>}
            {peticoes.map((p) => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-navy-800">{p.formulario.nome}</p>
                  <p className="text-xs text-gray-400">{tipoLabels[p.formulario.tipoCaso]} · {p.tokensUsados} tokens</p>
                </div>
                {p.processando ? (
                  <span className="text-xs text-indigo-600 font-medium">Processando...</span>
                ) : p.erro ? (
                  <span className="text-xs text-red-600 font-medium">Erro</span>
                ) : (
                  <Link href={`/peticao/${p.id}`} className="text-xs text-blue-600 hover:underline" target="_blank">
                    Ver
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
