import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const portalAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'portal',
      name: 'Portal',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const usuario = await prisma.usuarioEscritorio.findUnique({
          where: { email: credentials.email },
          include: { escritorio: true },
        })

        if (usuario && usuario.ativo) {
          const valid = await bcrypt.compare(credentials.password, usuario.senha)
          if (valid) {
            return {
              id: usuario.id,
              email: usuario.email,
              name: usuario.nome,
              role: usuario.role,
              escritorioId: usuario.escritorioId,
              escritorioNome: usuario.escritorio.nome,
            } as never
          }
        }

        const escritorio = await prisma.escritorio.findUnique({
          where: { email: credentials.email },
        })

        if (escritorio && escritorio.ativo) {
          const valid = await bcrypt.compare(credentials.password, escritorio.senha)
          if (valid) {
            return {
              id: escritorio.id,
              email: escritorio.email,
              name: escritorio.nome,
              role: 'admin_escritorio',
              escritorioId: escritorio.id,
              escritorioNome: escritorio.nome,
            } as never
          }
        }

        return null
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: 'portal.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: { signIn: '/portal/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.escritorioId = (user as { escritorioId?: string }).escritorioId
        token.escritorioNome = (user as { escritorioNome?: string }).escritorioNome
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).role = token.role
        ;(session.user as Record<string, unknown>).escritorioId = token.escritorioId
        ;(session.user as Record<string, unknown>).escritorioNome = token.escritorioNome
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
