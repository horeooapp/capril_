import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Nodemailer from "next-auth/providers/nodemailer"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Nodemailer({
            server: process.env.EMAIL_SERVER || "smtp://localhost:2525",
            from: process.env.EMAIL_FROM || "no-reply@localhost.com",
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                // @ts-ignore
                session.user.id = user.id
            }
            return session
        },
    },
})
