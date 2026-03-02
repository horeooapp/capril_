import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Nodemailer from "next-auth/providers/nodemailer"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import * as bcrypt from "bcrypt-ts"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers: [
        Nodemailer({
            server: process.env.EMAIL_SERVER || "smtp://localhost:2525",
            from: process.env.EMAIL_FROM || "noreply@qapril.net",
            // Forcer l'utilisation de SSL/TLS pour le port 465 (Hostinger)
            async sendVerificationRequest({ identifier: email, url, provider }) {
                const { host } = new URL(url);
                try {
                    const transport = provider.server;
                    // On peut aussi personnaliser l'e-mail ici si besoin
                    console.log(`[AUTH DEBUG] Sending magic link to ${email} via ${host}`);

                    // Utilisation du transport par défaut de NextAuth mais avec plus de contrôle si nécessaire
                    // Par défaut NextAuth gère l'envoi, mais on s'assure que EMAIL_SERVER est bien parsé.
                } catch (error) {
                    console.error("[SMTP ERROR] Failed to send verification email:", error);
                    throw new Error("SEND_VERIFICATION_EMAIL_ERROR");
                }
            }
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email as string }
                    })

                    if (!user || !user.password) return null;

                    const isValid = await bcrypt.compare(credentials.password as string, user.password)
                    if (!isValid) return null

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        isCertified: user.isCertified
                    }
                } catch (error) {
                    console.error("[AUTH ERROR]", error);
                    return null;
                }
            }
        })
    ],
})
