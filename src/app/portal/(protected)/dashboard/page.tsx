import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

import { TIPO_COLORS } from '@/lib/tipo-ui'

export default async function PortalDashboard() {
  const session = await getServerSession(authOptions)
  const escritorioId = (session?.user as { escritorioId?: string })?.escritorioId

  const now = new Date()
  const mesInicio = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalPeticoes, peticoesEsteMes, escritorio, recentes, templates] = await Promise.all([
    prisma.peticao.count({ where: { formulario: { escritorioId } } }),
    prisma.peticao.count({ where: { formulario: { escritorioId }, createdAt: { gte: mesInicio } } }),
    prisma.escritorio.findUnique({ where: { id: escritorioId }, select: { nome: true, plano: true, tokensUsados: true, tokenLimit: true } }),
    prisma.peticao.findMany({
      where: { formulario: { escritorioId } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { formulario: true },
    }),
    prisma.formularioTemplate.findMany({ where: { ativo: true }, select: { tipoCaso: true, nome: true } }),
  ])

  const tipoNome: Record<string, string> = Object.fromEntries(templates.map(t => [t.tipoCaso, t.nome]))
  const tokenPct = escritorio ? Math.round((escritorio.tokensUsados / escritorio.tokenLimit) * 100) : 0

  const stats = [
    { label: 'Total de Petições', value: totalPeticoes, desc: 'documentos gerados', color: 'bg-indigo-500', icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { label: 'Este Mês', value: peticoesEsteMes, desc: now.toLocaleString('pt-BR', { month: 'long' }), color: 'bg-emerald-500', icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { label: 'Plano Atual', value: escritorio?.plano ? escritorio.plano.charAt(0).toUpperCase() + escritorio.plano.slice(1) : '—', desc: `${tokenPct}% de tokens usados`, color: 'bg-amber-500', icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )},
    { label: 'Tokens Usados', value: (escritorio?.tokensUsados || 0).toLocaleString('pt-BR'), desc: `de ${(escritorio?.tokenLimit || 0).toLocaleString('pt-BR')} disponíveis`, color: 'bg-slate-600', icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )},
  ]

  return (
    <div className="px-4 py-6 md:p-8">
      {/* Page header — desktop only (mobile shows in top bar) */}
      <div className="mb-6 hidden md:block">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do seu escritório</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5 mb-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm ring-1 ring-gray-900/5">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${s.color} flex items-center justify-center shadow-sm mb-3`}>
              {s.icon}
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900 leading-none mb-0.5">{s.value}</p>
            <p className="text-xs md:text-sm font-medium text-gray-600">{s.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5 hidden md:block">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Token usage bar */}
      {escritorio && (
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm ring-1 ring-gray-900/5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-700">Uso de Tokens</p>
              <p className="text-xs text-gray-400">{escritorio.tokensUsados.toLocaleString('pt-BR')} de {escritorio.tokenLimit.toLocaleString('pt-BR')}</p>
            </div>
            <span className={`text-sm font-bold ${tokenPct > 80 ? 'text-red-600' : tokenPct > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>{tokenPct}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${tokenPct > 80 ? 'bg-red-500' : tokenPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(tokenPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent petitions */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-900/5">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
          <div>
            <h2 className="text-sm md:text-base font-semibold text-gray-900">Petições Recentes</h2>
            <p className="text-xs text-gray-400 mt-0.5">Últimas {recentes.length} petições</p>
          </div>
          <Link href="/portal/peticoes" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold">Ver todas →</Link>
        </div>

        {recentes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm font-medium">Nenhuma petição gerada ainda</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentes.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800">{p.formulario.nome}</p>
                      <p className="text-xs text-gray-400">{p.formulario.cpf}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${TIPO_COLORS[p.formulario.tipoCaso] || TIPO_COLORS.outros}`}>
                        {tipoNome[p.formulario.tipoCaso] || p.formulario.tipoCaso}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/portal/peticoes/${p.id}`} className="text-indigo-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Abrir →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {recentes.map(p => (
                <Link key={p.id} href={`/portal/peticoes/${p.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.formulario.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${TIPO_COLORS[p.formulario.tipoCaso] || TIPO_COLORS.outros}`}>
                        {tipoNome[p.formulario.tipoCaso] || p.formulario.tipoCaso}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
