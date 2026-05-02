import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "reconozco@gmail.com";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = (credentials.email as string).toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name || email.split("@")[0] };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.id = account.providerAccountId;
      }
      if (user) {
        // On initial sign-in, copy profile info to the token
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = session.user.name || (token.name as string) || null;
        session.user.email = session.user.email || (token.email as string) || null;
        session.user.image = session.user.image || (token.picture as string) || null;
      }
      return session;
    },
  },
});

// Helper: get effective credit balance for a user
export async function getUserCredits(email: string | null | undefined): Promise<number> {
  if (!email) return 0;
  if (email.toLowerCase() === ADMIN_EMAIL) return 999999;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  return user?.credits ?? 0;
}

// Helper: deduct credits (no-op for admin)
export async function deductCredits(email: string | null | undefined, amount: number): Promise<void> {
  if (!email) return;
  if (email.toLowerCase() === ADMIN_EMAIL) return;
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { credits: { decrement: amount } },
  });
}
