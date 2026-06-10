import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '../../../lib/prisma'

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('authorize called with', credentials)
          if (!credentials) return null
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })
          console.log('found user:', !!user)
          if (!user) return null
          // If the user is still pending approval, do not allow login
          if (user.role === 'PENDING') {
            console.log('user pending approval, denying login', user.email)
            return null
          }
          const isValid = await compare(credentials.password, user.password)
          console.log('password valid:', isValid)
          if (!isValid) return null
          return { id: user.id + '', email: user.email, name: user.name, role: user.role }
        } catch (err) {
          console.error('authorize error', err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Attach role to session
      if (token && session.user) {
        // @ts-ignore
        session.user.role = token.role ?? session.user.role
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = (user as any).role
      }
      return token
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})
