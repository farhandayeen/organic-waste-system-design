import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyUserCredentials, updateLastLogin } from './queries';
import { createAuditLog } from '@/lib/audit';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await verifyUserCredentials(
          credentials.email as string,
          credentials.password as string
        );

        if (!user) {
          await createAuditLog({
            action: 'LOGIN_FAILED',
            entityType: 'user',
            entityId: credentials.email as string,
            status: 'failure',
            errorMessage: 'Invalid credentials',
          });

          return null;
        }

        if (!user.isActive) {
          await createAuditLog({
            action: 'LOGIN_BLOCKED',
            entityType: 'user',
            entityId: user.id,
            status: 'failure',
            errorMessage: 'User account is inactive',
          });

          return null;
        }

        await updateLastLogin(user.id);

        await createAuditLog({
          action: 'LOGIN_SUCCESS',
          entityType: 'user',
          entityId: user.id,
          status: 'success',
        });

        return {
          id: String(user.id),
          email: user.email,
          name: `${user.firstName} ${user.lastName || ''}`.trim(),
          role: user.role as 'member' | 'admin_bumdes' | 'super_admin',
          bumdesId: user.bumdesId ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.bumdesId = user.bumdesId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'member' | 'admin_bumdes' | 'super_admin';
        session.user.bumdesId = token.bumdesId as string | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60,
  },
};

export async function auth() {
  return getServerSession(authOptions);
}
