import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Nodemailer from "next-auth/providers/nodemailer"
import Credentials from "next-auth/providers/credentials"
import { createTransport } from "nodemailer"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    trustHost: true,
    secret: process.env.AUTH_SECRET,
    debug: true, // Désactiver après résolution en production
    providers: [
        Nodemailer({
            server: process.env.EMAIL_SERVER || "smtp://localhost:2525",
            from: process.env.EMAIL_FROM || "no-reply@localhost.com",
            async sendVerificationRequest(params) {
                const { identifier, url, provider } = params

                console.log("==========================================")
                console.log(`[QAPRIL AUTH] LIEN DE CONNEXION POUR : ${identifier}`)
                console.log(url)
                console.log("==========================================")

                try {
                    const transport = createTransport(provider.server)
                    await transport.sendMail({
                        to: identifier,
                        from: provider.from,
                        subject: `QAPRIL - Lien de connexion sécurisé`,
                        text: `Connectez-vous à QAPRIL en cliquant sur ce lien : ${url}`,
                        html: `<body>
                                <h2>QAPRIL - Registre Locatif</h2>
                                <p>Cliquez sur le lien ci-dessous pour accéder à votre espace :</p>
                                <p><a href="${url}" style="background-color: #FF8200; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Se connecter</a></p>
                                <p><small>Si le bouton ne fonctionne pas, copiez ce lien : ${url}</small></p>
                               </body>`,
                    })
                } catch (error) {
                    console.error("❌ [QAPRIL ERREUR SMTP] Impossible d'envoyer l'e-mail.", error)
                    throw new Error("Échec de l'envoi de l'e-mail")
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
                console.log("[AUTH DEBUG] Authorize called for:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log("[AUTH DEBUG] Missing credentials");
                    return null;
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email as string }
                    })

                    console.log("[AUTH DEBUG] User found in DB:", !!user);
                    if (!user || !user.password) {
                        console.log("[AUTH DEBUG] User not found or no password set");
                        return null;
                    }

                    const isValid = await bcrypt.compare(credentials.password as string, user.password)
                    console.log("[AUTH DEBUG] Password valid:", isValid);

                    if (!isValid) return null

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        isCertified: user.isCertified
                    }
                } catch (error) {
                    console.error("[AUTH DEBUG] Error in authorize:", error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
        verifyRequest: '/verify-request',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.isCertified = user.isCertified
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as Role
                session.user.isCertified = token.isCertified as boolean
            }
            return session
        },
    },
})
