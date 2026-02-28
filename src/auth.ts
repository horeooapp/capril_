import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Nodemailer from "next-auth/providers/nodemailer"

import { createTransport } from "nodemailer"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Nodemailer({
            server: process.env.EMAIL_SERVER || "smtp://localhost:2525",
            from: process.env.EMAIL_FROM || "no-reply@localhost.com",
            async sendVerificationRequest(params) {
                const { identifier, url, provider } = params

                // Log de secours : Permet de se connecter même si le SMTP ne marche pas encore (Visible dans les logs Hostinger)
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
                    console.error("❌ [QAPRIL ERREUR SMTP] Impossible d'envoyer l'e-mail. Vérifiez vos variables d'environnement EMAIL_SERVER et EMAIL_FROM sur Hostinger.", error)
                    throw new Error("Échec de l'envoi de l'e-mail (Vérifiez les logs du serveur)")
                }
            }
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
