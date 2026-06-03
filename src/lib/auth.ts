import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          // Auto-create user for hackathon testing
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          let roleStr = "BUYER";
          if (credentials.email === "admin@example.com") roleStr = "ADMIN";
          if (credentials.email === "seller@example.com") roleStr = "SELLER";
          
          let name = "Test Buyer";
          if (roleStr === "ADMIN") name = "System Admin";
          if (roleStr === "SELLER") name = "Test Seller";

          const role = roleStr as Role;

          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name,
              password: hashedPassword,
              role
            }
          });
          return { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session as any).id = token.id;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin"
  },
  secret: process.env.NEXTAUTH_SECRET
};
