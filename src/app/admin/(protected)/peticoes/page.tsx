'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Peticao {
  id: string
  createdAt: string
  tokensUsados: number
  modeloUsado: string
  formulario: { nome: string; cpf: string; email: string; tipoCaso: string; status: string }
}

const tipoLabels: Record<string, string> = {
  trabalhista: 'Trabalhista', previdenciario: 'Previdenciário',
  consumidor: 'Consumidor', civel: 'Cível', outros: 'Outros',
}

export default function PeticoesPage() {
  const [peticoes, setPeticoes] = useState<Peticao[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/peticoes').then((r) => r.json()).then((d) => { setPeticoes(d); setLoading(false) })
  }, [])

  const filtered = peticoes.filter(
    (p) =>
      p.formulario.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.formulario.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800 mb-6">Petições Geradas</h1>

      <div className="card">
        <div className="mb-4">
          <input
            className="input max-w-sm"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-gray-400 py-8 text-center">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 py-8 text-center">Nenhuma petição encontrada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 pr-4 font-semibold text-gray-600">Cliente</th>
                  <th className="py-3 pr-4 font-semibold text-gray-600">Tipo</th>
                  <th className="py-3 pr-4 font-semibold text-gray-600">Tokens</th>
                  <th className="py-3 pr-4 font-semibold text-gray-600">Data</th>
                  <th className="py-3 font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-navy-800">{p.formulario.nome}</p>
                      <p className="text-gray-400 text-xs">{p.formulario.email}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="badge bg-navy-100 text-navy-700">{tipoLabels[p.formulario.tipoCaso]}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{p.tokensUsados.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-gray-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3">
                      <Link href={`/peticao/${p.id}`} target="_blank" className="text-blue-600 hover:underline text-xs">
                        Visualizar →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
