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
            from: process.env.EMAIL_FROM || "onboarding@resend.dev",
            async sendVerificationRequest({ identifier, url, provider }) {
                console.log(`[AUTH DEBUG] Attempting to send magic link via Resend to: ${identifier}`);
                console.log(`[AUTH DEBUG] Magic Link URL: ${url}`);
                const { host } = new URL(url);
                try {
                    const { Resend: ResendClient } = await import("resend");
                    const resend = new ResendClient(process.env.AUTH_RESEND_KEY);

                    const result = await resend.emails.send({
                        to: identifier,
                        from: provider.from as string,
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

                    if (result.error) {
                        throw new Error(result.error.message);
                    }
                    console.log(`[AUTH DEBUG] Magic link successfully sent to: ${identifier} (Resend ID: ${result.data?.id})`);
                } catch (error) {
                    console.error("[RESEND ERROR] Error in sendVerificationRequest:", error);
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
