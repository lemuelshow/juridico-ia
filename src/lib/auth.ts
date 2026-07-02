import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.adminUser.findUnique({ where: { email: credentials.email } })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.senha)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.nome, role: user.role, userType: 'admin' } as never
      },
    }),
    CredentialsProvider({
      id: 'portal-credentials',
      name: 'Portal',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Tenta UsuarioEscritorio primeiro
        const usuario = await prisma.usuarioEscritorio.findUnique({
          where: { email: credentials.email },
          include: { escritorio: { select: { id: true, nome: true, ativo: true } } },
        })
        if (usuario && usuario.ativo && usuario.escritorio.ativo) {
          const valid = await bcrypt.compare(credentials.password, usuario.senha)
          if (valid) {
            return {
              id: usuario.id, email: usuario.email, name: usuario.nome,
              role: usuario.role, userType: 'portal',
              escritorioId: usuario.escritorioId,
              escritorioNome: usuario.escritorio.nome,
            } as never
          }
        }

        // Tenta login direto com Escritorio
        const escritorio = await prisma.escritorio.findUnique({ where: { email: credentials.email } })
        if (escritorio && escritorio.ativo) {
          const valid = await bcrypt.compare(credentials.password, escritorio.senha)
          if (valid) {
            return {
              id: escritorio.id, email: escritorio.email, name: escritorio.nome,
              role: 'admin_escritorio', userType: 'portal',
              escritorioId: escritorio.id,
              escritorioNome: escritorio.nome,
            } as never
          }
        }

        return null
      },
    }),
  ],
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.userType = (user as { userType?: string }).userType
        token.escritorioId = (user as { escritorioId?: string }).escritorioId
        token.escritorioNome = (user as { escritorioNome?: string }).escritorioNome
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as Record<string, unknown>
        u.role = token.role
        u.userType = token.userType
        u.escritorioId = token.escritorioId
        u.escritorioNome = token.escritorioNome
      }
      return session
    },
  },
}
