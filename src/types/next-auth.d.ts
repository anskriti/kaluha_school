import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      mobile: string;
      role: string;
      verified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    mobile: string;
    role: string;
    verified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    mobile: string;
    role: string;
    verified: boolean;
  }
}
