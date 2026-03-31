import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Normalize email (trim + lowercase) to prevent case/whitespace issues
        const normalizedEmail = credentials.email.trim().toLowerCase()

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Audit failed login
          await prisma.auditLog.create({
            data: {
              action: 'LOGIN_FAILED',
              userId: user.id,
              entityId: user.id,
              entityType: 'User',
              details: { reason: 'invalid_password' },
            },
          }).catch(() => {})

          return null
        }

        // Audit successful login
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN_SUCCESS',
            userId: user.id,
            entityId: user.id,
            entityType: 'User',
          },
        }).catch(() => {})

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          image: user.image,
          sessionVersion: user.sessionVersion,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days (reduced from 30)
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.sessionVersion = (user as any).sessionVersion ?? 0
      }

      // Refresh role and sessionVersion from DB on every request
      // This ensures role changes and session revocations take effect immediately
      if (token.sub) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, sessionVersion: true, firstName: true, lastName: true },
          })

          if (!freshUser) {
            // User deleted — invalidate token
            return { ...token, expired: true }
          }

          // Session revocation: if sessionVersion changed, invalidate
          if (freshUser.sessionVersion !== (token.sessionVersion ?? 0)) {
            return { ...token, expired: true }
          }

          // Always use fresh role from DB
          token.role = freshUser.role
          token.firstName = freshUser.firstName
          token.lastName = freshUser.lastName
        } catch {
          // DB error — keep existing token (fail open for availability)
        }
      }

      return token
    },
    async session({ session, token }) {
      // If token was marked expired, signal to client
      if ((token as any).expired) {
        return { ...session, expired: true } as any
      }

      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  }
}
