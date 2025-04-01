import NextAuth, { DefaultSession } from "next-auth";
import { Role } from "@/types/auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      nic: string;
      role: Role;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    nic: string;
    role: Role;
  }
}