import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Nodemailer from "next-auth/providers/nodemailer"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import * as bcrypt from "bcrypt-ts"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    debug: true, // Enable debug logs to catch the AdapterError source
    adapter: PrismaAdapter(prisma),
    providers: [
        ...(process.env.EMAIL_SERVER ? [
            Nodemailer({
                server: process.env.EMAIL_SERVER,
                from: process.env.EMAIL_FROM || "noreply@qapril.net",
                async sendVerificationRequest({ identifier, url, provider }) {
                    // ... existing logic ...
                    const { createTransport } = await import("nodemailer");
                    let smtpOptions: any = provider.server;
                    if (typeof smtpOptions === 'string' && smtpOptions) {
                        try {
                            const urlObj = new URL(smtpOptions);
                            smtpOptions = {
                                host: urlObj.hostname,
                                port: urlObj.port ? parseInt(urlObj.port) : 587,
                                secure: urlObj.port === '465',
                                auth: {
                                    user: decodeURIComponent(urlObj.username),
                                    pass: decodeURIComponent(urlObj.password)
                                },
                                tls: { rejectUnauthorized: false }
                            };
                        } catch (e) {
                            console.error("[SMTP CONFIG ERROR]", e);
                        }
                    }

                    if (!smtpOptions) return;

                    const transport = createTransport(smtpOptions);
                    await transport.sendMail({
                        to: identifier,
                        from: provider.from as string,
                        subject: `Connexion à QAPRIL`,
                        html: `<p>Lien de connexion : <a href="${url}">${url}</a></p>` // Simplified for robustness during debug
                    });
                }
            })
        ] : []),
        Credentials({
            // ... credentials logic ...
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
