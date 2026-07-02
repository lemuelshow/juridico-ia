'use client'

import { SessionProvider, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '▦' },
  { href: '/admin/peticoes', label: 'Petições', icon: '📄' },
  { href: '/admin/formularios', label: 'Formulários', icon: '📋' },
  { href: '/admin/chaves', label: 'Chaves Claude', icon: '🔑' },
  { href: '/admin/contextos', label: 'Contextos', icon: '📝' },
  { href: '/admin/usuarios', label: 'Usuários', icon: '👤' },
  { href: '/admin/gateway', label: 'Gateway Pgto.', icon: '💳' },
  { href: '/admin/smtp', label: 'SMTP / E-mail', icon: '✉️' },
]

function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="w-64 min-h-screen bg-navy-800 text-white flex flex-col fixed top-0 left-0 z-10">
      <div className="p-6 border-b border-navy-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-navy-800 font-bold">J</div>
          <div>
            <p className="font-bold text-sm">Sistema Jurídico</p>
            <p className="text-navy-400 text-xs">Painel Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-navy-600 text-white' : 'text-navy-300 hover:bg-navy-700 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-navy-700">
        <div className="text-xs text-navy-400 mb-3">{session?.user?.email}</div>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full text-left text-sm text-navy-300 hover:text-white transition-colors px-2 py-1"
        >
          Sair →
        </button>
      </div>
    </aside>
  )
}

export default function AdminClientShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </div>
    </SessionProvider>
  )
}
