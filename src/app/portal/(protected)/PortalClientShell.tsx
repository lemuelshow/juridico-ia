'use client'

import { SessionProvider, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/portal/dashboard', label: 'Dashboard',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/portal/peticoes', label: 'Petições',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/portal/formularios', label: 'Formulários',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    href: '/portal/escritorio', label: 'Escritório',
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as { name?: string; email?: string; escritorioNome?: string; role?: string } | undefined

  return (
    <aside className="w-64 min-h-screen flex flex-col fixed top-0 left-0 z-20" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #161b27 100%)' }}>
      <div className="px-6 py-5 border-b border-white/5">
        <img src="/logo.png" alt="Peticionaaki" className="h-8 w-auto object-contain" />
      </div>

      {user?.escritorioNome && (
        <div className="mx-4 mt-4 mb-2 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-0.5">Escritório</p>
          <p className="text-white text-sm font-semibold leading-snug truncate">{user.escritorioNome}</p>
          {user.role && (
            <span className="inline-block mt-1 text-[10px] text-indigo-400 bg-indigo-500/10 rounded-full px-2 py-0.5 font-medium">
              {user.role === 'admin_escritorio' ? 'Administrador' : user.role === 'advogado' ? 'Advogado' : user.role}
            </span>
          )}
        </div>
      )}

      <nav className="flex-1 px-4 py-2 overflow-y-auto">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/portal/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={active ? 'text-white' : 'text-white/40'}>{item.icon(active)}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-white/30 text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/portal/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair do Portal
        </button>
      </div>
    </aside>
  )
}

function MobileHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as { name?: string; escritorioNome?: string } | undefined
  const current = navItems.find(i => pathname === i.href || (i.href !== '/portal/dashboard' && pathname.startsWith(i.href)))

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 border-b border-gray-100 bg-white/95 backdrop-blur-sm md:hidden">
      <img src="/logo.png" alt="Peticionaaki" className="h-7 w-auto object-contain" />
      <p className="text-sm font-semibold text-gray-800">{current?.label || ''}</p>
      <button
        onClick={() => signOut({ callbackUrl: '/portal/login' })}
        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold"
        title="Sair"
      >
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </button>
    </header>
  )
}

function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t border-gray-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/portal/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                active ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              {item.icon(active)}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function PortalClientShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/* Desktop */}
      <div className="hidden md:flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">{children}</main>
      </div>

      {/* Mobile */}
      <div className="md:hidden min-h-screen bg-slate-50">
        <MobileHeader />
        <main className="pt-14 pb-20">{children}</main>
        <BottomNav />
      </div>
    </SessionProvider>
  )
}
