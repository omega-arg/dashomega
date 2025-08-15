
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

enum Role {
  OWNER = "OWNER",
  ADMIN_GENERAL = "ADMIN_GENERAL", 
  ENCARGADO_ENTREGAS = "ENCARGADO_ENTREGAS",
  AT_CLIENTE = "AT_CLIENTE"
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            console.log("User not found or no password");
            return null;
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.log("Invalid password");
            return null;
          }

          // Update last active time
          await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
          });

          console.log("User authenticated successfully:", user.email, user.id);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
            image: user.image,
          };
        } catch (error) {
          console.error("Database connection failed:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
