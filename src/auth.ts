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
        Nodemailer({
            server: process.env.EMAIL_SERVER || "smtp://localhost:25",
            from: process.env.EMAIL_FROM || "noreply@qapril.net",
            async sendVerificationRequest({ identifier, url, provider }) {
                const isProduction = process.env.NODE_ENV === "production";
                const { host, searchParams } = new URL(url);
                const baseUrl = process.env.NEXTAUTH_URL || (isProduction ? `https://${host}` : `http://${host}`);
                
                console.log(`[AUTH] Attempting verification for: ${identifier}`);
                console.log(`[AUTH] NextAuth provided URL: ${url}`);
                console.log(`[AUTH] Determined Base URL: ${baseUrl}`);

                try {
                    const token = searchParams.get("token");
                    const email = searchParams.get("email");

                    // Reconstruct a robust URL
                    const robustNextAuthUrl = `${baseUrl}/api/auth/callback/nodemailer?callbackUrl=${encodeURIComponent(`${baseUrl}/dashboard`)}&token=${token}&email=${encodeURIComponent(email || identifier)}`;
                    const intermediaryUrl = `${baseUrl}/auth/verify-email?callback_url=${encodeURIComponent(robustNextAuthUrl)}`;

                    console.log(`[AUTH] Robust URL constructed: ${robustNextAuthUrl}`);
                    console.log(`[AUTH] Intermediary Link: ${intermediaryUrl}`);

                    const { createTransport } = await import("nodemailer");
                    
                    let smtpOptions: any = provider.server;
                    // Hostinger specific parsing if string
                    if (typeof smtpOptions === 'string' && smtpOptions.startsWith("smtp")) {
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
                            console.log(`[AUTH] SMTP Configured for ${smtpOptions.host}:${smtpOptions.port} (SSL: ${smtpOptions.secure})`);
                        } catch (e) {
                            console.error("[AUTH] Error parsing SMTP URL:", e);
                        }
                    }

                    if (!smtpOptions || (typeof smtpOptions === 'string' && !smtpOptions)) {
                         console.warn("[AUTH] No valid SMTP options, skipping email.");
                         return;
                    }

                    const transport = createTransport(smtpOptions);
                    const result = await transport.sendMail({
                        to: identifier,
                        from: provider.from as string,
                        subject: `Connexion à QAPRIL`,
                        text: `Votre lien de connexion QAPRIL : ${intermediaryUrl}`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                                <h1 style="color: #FF8200; text-align: center;">QAPRIL</h1>
                                <p>Cliquez sur le bouton ci-dessous pour vous connecter à votre espace.</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${intermediaryUrl}" style="background-color: #FF8200; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Me connecter</a>
                                </div>
                                <p style="font-size: 12px; color: #888; text-align: center;">Si le bouton ne fonctionne pas, copiez ce lien : <br> ${intermediaryUrl}</p>
                            </div>
                        `
                    });
                    console.log(`[AUTH] SUCCESS: Email sent to ${identifier}. MessageID: ${result.messageId}`);
                } catch (error) {
                    console.error("[AUTH] CRITICAL ERROR in sendVerificationRequest:", error);
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
