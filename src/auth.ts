import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Resend from "next-auth/providers/resend"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import * as bcrypt from "bcrypt-ts"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    debug: true, // Enable debug logs to catch the AdapterError source
    adapter: PrismaAdapter(prisma),
    providers: [
        Resend({
            apiKey: process.env.AUTH_RESEND_KEY,
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            async sendVerificationRequest({ identifier, url, provider }) {
                const urlObj = new URL(url);
                const host = urlObj.host;
                
                // Détecter si on est en localhost ou non pour le protocole
                const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
                const protocol = isLocal ? 'http' : 'https';
                const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;
                
                // On utilise l'URL fournie par NextAuth mais on s'assure que le domaine est correct
                const finalNextAuthUrl = new URL(url);
                finalNextAuthUrl.protocol = protocol;
                finalNextAuthUrl.host = host;

                const robustNextAuthUrl = finalNextAuthUrl.toString();
                const intermediaryUrl = `${baseUrl}/auth/verify-email?callback_url=${encodeURIComponent(robustNextAuthUrl)}`;

                try {
                    const { Resend: ResendSDK } = await import("resend");
                    const resend = new ResendSDK(process.env.AUTH_RESEND_KEY);

                    await resend.emails.send({
                        from: provider.from as string,
                        to: identifier,
                        subject: `Connexion à QAPRIL`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                                <h1 style="color: #FF8200; text-align: center;">QAPRIL</h1>
                                <p>Cliquez sur le bouton ci-dessous pour vous connecter à votre espace.</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${intermediaryUrl}" style="background-color: #FF8200; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Me connecter</a>
                                </div>
                                <p style="font-size: 12px; color: #888; text-align: center;">Lien direct : ${intermediaryUrl}</p>
                            </div>
                        `
                    });
                } catch (error) {
                    console.error("[AUTH] Resend verification failed:", error);
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
                    console.error("[AUTH ERROR CREDENTIALS]", error);
                    return null;
                }
            }
        })
    ],
})
