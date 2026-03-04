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
            server: process.env.EMAIL_SERVER || {
                host: "localhost",
                port: 1025,
                auth: {
                    user: "test",
                    pass: "test",
                },
            },
            from: process.env.EMAIL_FROM || "noreply@qapril.net",
            async sendVerificationRequest({ identifier, url, provider }) {
                console.log(`[AUTH DEBUG] Attempting to send magic link to: ${identifier}`);
                console.log(`[AUTH DEBUG] Magic Link URL: ${url}`);
                const { host } = new URL(url);
                try {
                    const { createTransport } = await import("nodemailer");

                    // Parcours de l'URL pour garantir une configuration stricte (comme test-smtp.js)
                    let smtpOptions: any = provider.server;
                    if (typeof smtpOptions === 'string') {
                        const urlObj = new URL(smtpOptions);
                        smtpOptions = {
                            host: urlObj.hostname,
                            port: urlObj.port ? parseInt(urlObj.port) : 587,
                            secure: urlObj.port === '465', // false pour 587 (STARTTLS)
                            auth: {
                                user: decodeURIComponent(urlObj.username),
                                pass: decodeURIComponent(urlObj.password)
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        };
                    }

                    const transport = createTransport(smtpOptions);
                    const result = await transport.sendMail({
                        to: identifier,
                        from: provider.from,
                        subject: `Connexion à ${host}`,
                        text: `Connectez-vous à ${host}\n${url}\n\nSi vous n'avez pas demandé cet e-mail, vous pouvez l'ignorer.`,
                        html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connexion à ${host}</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
    <h2 style="color: #333333; text-align: center;">Connexion à ${host}</h2>
    <p style="color: #555555; text-align: center; font-size: 16px;">
      Cliquez sur le bouton ci-dessous pour vous connecter à votre compte.
    </p>
    <div style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
      <a href="${url}" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Se connecter</a>
    </div>
    <p style="color: #888888; text-align: center; font-size: 14px;">
      Ou copiez et collez ce lien dans votre navigateur :<br/>
      <a href="${url}" style="color: #007bff; word-break: break-all;">${url}</a>
    </p>
    <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;">
    <p style="color: #aaaaaa; text-align: center; font-size: 12px;">
      Si vous n'avez pas demandé cet e-mail, vous pouvez l'ignorer. Ce lien expirera dans 24 heures.
    </p>
  </div>
</body>
</html>`,
                    });
                    const pending = (result as any).pending || [];
                    const failed = result.rejected.concat(pending).filter(Boolean);
                    if (failed.length) {
                        throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
                    }
                    console.log(`[AUTH DEBUG] Magic link successfully sent to: ${identifier}`);
                } catch (error) {
                    console.error("[SMTP ERROR] Error in sendVerificationRequest:", error);
                    throw error;
                }
            },
            normalizeIdentifier(identifier: string): string {
                const [local, domain] = identifier.toLowerCase().trim().split("@")
                if (domain === "gmail.com") return `${local.replace(/\./g, "")}@${domain}`
                return identifier
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
