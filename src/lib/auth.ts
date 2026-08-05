import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid username or password");
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        if (!user) {
          throw new Error("No user found with this username");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        // Student Approval Status Gate
        if (user.role === "STUDENT") {
          const status = user.approvalStatus;
          if (status === "Pending" || status === "PENDING") {
            throw new Error("Your registration has been submitted successfully and is awaiting approval from the school administrator.");
          }
          if (status === "Rejected" || status === "REJECTED") {
            throw new Error(`Your registration request was rejected by the administrator. Remarks: ${user.remarks || "No remarks provided."}`);
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          mobile: user.mobile,
          role: user.role,
          verified: user.verified
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.mobile = (user as any).mobile;
        token.verified = (user as any).verified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
        (session.user as any).mobile = token.mobile;
        (session.user as any).verified = token.verified;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "kaluha-school-secret-key-12345"
};
