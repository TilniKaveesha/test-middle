// lib/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { Role } from "@/types/auth";

// Extended User types to match your database schema
declare module "next-auth" {
  interface User {
    id: string; // NIC will be used as ID
    nic: string;
    role: Role;
    email?: string;
    firstName: string;
    lastName: string;
    school?: string;
    phoneNumber: string;
  }
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    nic: string;
    role: Role;
    email?: string;
    firstName: string;
    lastName: string;
    school?: string;
    phoneNumber: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        nic: { 
          label: "NIC", 
          type: "text", 
          placeholder: "Enter your NIC number" 
        },
        password: { 
          label: "Password", 
          type: "password", 
          placeholder: "Enter your password" 
        },
      },
      async authorize(credentials): Promise<any> {
        try {
          if (!credentials?.nic || !credentials?.password) {
            throw new Error("NIC and password are required");
          }

          // Normalize NIC to uppercase
          const nic = credentials.nic.toUpperCase();

          // Check both tables simultaneously
          const [suser, user] = await prisma.$transaction([
            prisma.suser.findUnique({
              where: { NIC: nic },
              select: {
                NIC: true,
                Password: true,
                Email: true,
                FirstName: true,
                LastName: true,
                school: true,
                PhoneNumber: true,
                role: true
              }
            }),
            prisma.user.findUnique({
              where: { NIC: nic },
              select: {
                NIC: true,
                Password: true,
                Email: true,
                FirstName: true,
                LastName: true,
                PhoneNumber: true,
                role: true
              }
            })
          ]);

          const dbUser = suser || user;
          if (!dbUser) {
            throw new Error("No user found with this NIC");
          }

          // Verify password
          const passwordValid = await bcrypt.compare(
            credentials.password,
            dbUser.Password
          );

          if (!passwordValid) {
            throw new Error("Invalid password");
          }

          // Return user data in consistent format
          return {
            id: dbUser.NIC,
            nic: dbUser.NIC,
            email: dbUser.Email ?? undefined,
            firstName: dbUser.FirstName,
            lastName: dbUser.LastName,
            phoneNumber: dbUser.PhoneNumber,
            school: (dbUser as any).school, // Safe because we know suser has school
            role: dbUser.role || (suser ? "suser" : "user")
          };

        } catch (error: any) {
          console.error("Authentication error:", error.message);
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.nic = user.nic;
        token.role = user.role;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.school = user.school;
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub!,
        nic: token.nic,
        role: token.role,
        email: token.email,
        firstName: token.firstName,
        lastName: token.lastName,
        school: token.school,
        phoneNumber: token.phoneNumber
      };
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
};