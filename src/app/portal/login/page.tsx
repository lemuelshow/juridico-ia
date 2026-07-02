'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type View = 'login' | 'cadastro' | 'esqueci'

const TITLES: Record<View, { h1: string; sub: string }> = {
  login:    { h1: 'Acesso ao Portal',  sub: 'Entre com as credenciais do seu escritório' },
  cadastro: { h1: 'Criar conta',       sub: 'Preencha os dados do seu escritório' },
  esqueci:  { h1: 'Recuperar senha',   sub: 'Informe o e-mail cadastrado para receber o link' },
}

const FEATURES = [
  {
    tag: 'Inteligência Artificial',
    title: 'Petições geradas em minutos',
    desc: 'O sistema analisa o caso, aplica jurisprudência atualizada e estrutura a peça com linguagem técnica jurídica de alta qualidade.',
  },
  {
    tag: 'Cobertura jurídica',
    title: 'Múltiplas áreas do direito',
    desc: 'Trabalhista, Previdenciário, Direito do Consumidor, Civil e mais — cada área com súmulas, OJs e TRTs regionais incorporados.',
  },
  {
    tag: 'Padrão profissional',
    title: 'Estrutura de peça completa',
    desc: 'Doutrina, jurisprudência do TST e TRTs, cálculos detalhados e formatação em Courier New A4 pronta para protocolo.',
  },
  {
    tag: 'Controle total',
    title: 'Editor com marcações inteligentes',
    desc: 'Dados do cliente são destacados na peça para revisão rápida. Navegue entre as alterações e exporte em PDF com um clique.',
  },
]

/* ─── Cycling feature cards ──────────────────────────────── */

function FeatureCards() {
  const [active, setActive] = useState(0)
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setShow(false)
      setTimeout(() => {
        setActive(i => (i + 1) % FEATURES.length)
        setShow(true)
      }, 380)
    }, 4000)
    return () => clearInterval(t)
  }, [])

  const f = FEATURES[active]

  return (
    <div className="w-full">
      {/* Card */}
      <div
        style={{
          transition: 'opacity 0.38s ease, transform 0.38s ease',
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(12px)',
          background: 'rgba(255,255,255,0.09)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
        className="rounded-2xl px-8 py-7"
      >
        <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">{f.tag}</p>
        <p className="text-white font-bold text-xl leading-snug mb-3">{f.title}</p>
        <p className="text-white/80 text-sm leading-relaxed">{f.desc}</p>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center gap-2 mt-5">
        {FEATURES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setShow(false); setTimeout(() => { setActive(i); setShow(true) }, 200) }}
            className="rounded-full transition-all duration-300"
            style={{
              height: 3,
              width: i === active ? 24 : 8,
              background: i === active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────── */

export default function PortalLoginPage() {
  const router = useRouter()
  const [view, setView] = useState<View>('login')
  const [animKey, setAnimKey] = useState(0)

  function goTo(v: View) { setView(v); setAnimKey(k => k + 1) }

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#0f172a' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-view { animation: fadeUp 0.28s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* ── Full-screen video background ── */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.55 }}
        src="/peticioneaki.mp4"
      />

      {/* ── Gradient overlay: video visible on left, melts into dark on right ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.55) 42%, rgba(15,23,42,0.92) 62%, #0f172a 78%)',
        }}
      />

      {/* ── LEFT: logo + cycling cards ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 relative z-10">
        {/* Logo — canto superior esquerdo */}
        <img src="/logo.png" alt="Peticionaaki" className="h-9 w-auto object-contain self-start" />

        {/* Cards — centralizados vertical e horizontalmente */}
        <div className="flex justify-center">
          <div className="w-full max-w-[400px]">
            <FeatureCards />
          </div>
        </div>

        {/* Copyright */}
        <div className="text-white/25 text-xs">© 2025 Peticionaaki · Todos os direitos reservados</div>
      </div>

      {/* ── RIGHT: login form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm">

          <div className="mb-10 lg:hidden">
            <img src="/logo.png" alt="Peticionaaki" className="h-8 w-auto object-contain" />
          </div>

          <div key={animKey} className="anim-view">
            <h1 className="text-2xl font-bold text-white mb-1">{TITLES[view].h1}</h1>
            <p className="text-white/50 text-sm mb-8">{TITLES[view].sub}</p>

            {view === 'login'    && <LoginForm    onEsqueci={() => goTo('esqueci')} onCadastro={() => goTo('cadastro')} router={router} />}
            {view === 'esqueci'  && <EsqueciForm  onBack={() => goTo('login')} />}
            {view === 'cadastro' && <CadastroForm onBack={() => goTo('login')} />}
          </div>

        </div>
      </div>
    </div>
  )
}

/* ─── Login ───────────────────────────────────────────────── */

function LoginForm({
  onEsqueci, onCadastro, router,
}: {
  onEsqueci: () => void
  onCadastro: () => void
  router: ReturnType<typeof useRouter>
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('portal-credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError('E-mail ou senha incorretos. Tente novamente.')
    else router.push('/portal/dashboard')
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">E-mail</label>
        <input type="email" required placeholder="escritorio@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest">Senha</label>
          <button type="button" onClick={onEsqueci} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Esqueceu a senha?
          </button>
        </div>
        <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} />
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-2">
        {loading
          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Entrando...</>
          : 'Entrar no Portal'}
      </button>

      <button type="button" onClick={onCadastro} className="w-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-medium py-3 rounded-xl transition-colors text-sm">
        Cadastrar novo escritório
      </button>
    </form>
  )
}

/* ─── Esqueci ─────────────────────────────────────────────── */

function EsqueciForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await fetch('/api/portal/reset-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setDone(true)
    } catch {
      setError('Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all'

  if (done) return (
    <div className="text-center py-2">
      <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-bold text-white/70">@</div>
      <p className="text-white font-semibold mb-2">Link enviado!</p>
      <p className="text-white/50 text-sm mb-6">Se o e-mail estiver cadastrado, você receberá as instruções. Verifique também o spam.</p>
      <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">← Voltar ao login</button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">E-mail cadastrado</label>
        <input type="email" required placeholder="escritorio@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2">
        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</> : 'Enviar link de redefinição'}
      </button>

      <button type="button" onClick={onBack} className="w-full text-white/50 hover:text-white/80 text-sm font-medium py-2 transition-colors">← Voltar ao login</button>
    </form>
  )
}

/* ─── Cadastro ────────────────────────────────────────────── */

function CadastroForm({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({ nome: '', cnpj: '', email: '', senha: '', confirma: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function setF(k: keyof typeof form, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.senha !== form.confirma) { setError('As senhas não conferem.'); return }
    if (form.senha.length < 6) { setError('A senha deve ter ao menos 6 caracteres.'); return }
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/portal/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: form.nome, email: form.email, senha: form.senha, cnpj: form.cnpj }),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error)
      setSuccess(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all'
  const labelCls = 'block text-xs font-semibold text-white/60 uppercase tracking-widest mb-1.5'

  if (success) return (
    <div className="text-center py-2">
      <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-5">
        <div className="w-6 h-6 rounded-full border-2 border-white/70 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-white/70" />
        </div>
      </div>
      <p className="text-white font-semibold mb-2">Conta criada!</p>
      <p className="text-white/50 text-sm mb-6">Seu escritório foi cadastrado. Você já pode fazer login.</p>
      <button onClick={onBack} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm">
        Fazer login
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className={labelCls}>Nome do escritório *</label>
        <input className={inputCls} required placeholder="Oliveira & Associados" value={form.nome} onChange={e => setF('nome', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>CNPJ <span className="normal-case font-normal text-white/30">(opcional)</span></label>
        <input className={inputCls} placeholder="00.000.000/0001-00" value={form.cnpj} onChange={e => setF('cnpj', e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>E-mail de acesso *</label>
        <input className={inputCls} type="email" required placeholder="contato@escritorio.com" value={form.email} onChange={e => setF('email', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Senha *</label>
          <input className={inputCls} type="password" required minLength={6} placeholder="Mín. 6 dígitos" value={form.senha} onChange={e => setF('senha', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Confirmar *</label>
          <input className={inputCls} type="password" required minLength={6} placeholder="Repita" value={form.confirma} onChange={e => setF('confirma', e.target.value)} />
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2 !mt-5">
        {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Cadastrando...</> : 'Criar conta'}
      </button>

      <button type="button" onClick={onBack} className="w-full text-white/50 hover:text-white/80 text-sm font-medium py-2 transition-colors">← Voltar ao login</button>
    </form>
  )
}
