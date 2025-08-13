
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

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

        // Temporary hardcoded user for development when DB is not available
        if (credentials.email === "deltaarg1@gmail.com" && credentials.password === "Maico2005") {
          return {
            id: "temp-admin-id",
            email: "deltaarg1@gmail.com",
            name: "Owner Principal",
            role: "OWNER" as Role,
            image: null,
          };
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            return null;
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            return null;
          }

          // Update last active time
          await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
            image: user.image,
          };
        } catch (error) {
          console.log("Database connection failed, using hardcoded user");
          // If DB connection fails, allow the hardcoded user
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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string;
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
