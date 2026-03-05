"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function loginWithMagicLink(formData: FormData) {
    const email = formData.get("email") as string
    console.log("[SERVER ACTION] loginWithMagicLink called for email:", email);

    if (!email) return { error: "L'adresse email est requise" }

    try {
        // Preflight check: Verify database connection inside Next.js before hitting NextAuth
        try {
            console.log("[SERVER ACTION] Validating local database connection...");
            const testUser = await prisma.user.findFirst();
            console.log("[SERVER ACTION] DB Connection OK. User count test passed.");
        } catch (dbError) {
            console.error("[SERVER ACTION] CRITICAL DB ERROR before NextAuth:", dbError);
            return { error: `La base de données est inaccessible ou désynchronisée: ${dbError instanceof Error ? dbError.message : "Erreur inconnue"}` };
        }

        // Timeout de 30 secondes pour éviter le blocage de l'interface en cas de lenteur SMTP
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("TIMEOUT_SMTP")), 30000);
        });

        const signInPromise = signIn("resend", {
            email,
            redirect: false,
        });

        const signInResult = await Promise.race([signInPromise, timeoutPromise]) as any;

        console.log("[SERVER ACTION] NextAuth signIn returned:", signInResult);

        // If redirect: false is passed, Auth.js might return an object instead of throwing
        if (signInResult && signInResult.error) {
            console.error("[SERVER ACTION] NextAuth returned internal error:", signInResult.error);
            return { error: "Erreur lors de l'envoi de l'e-mail. Vérifiez la configuration SMTP (Mot de passe incorrect)." }
        }

        return { success: true }
    } catch (error: any) {
        console.error("[SERVER ACTION] DEBUG: Login magic link error full:", error)

        // Auth.js throw a RedirectError on success when using server-side signIn. 
        // If it's a known Next.js redirect error, we check its digest to see if it redirects to an error page.
        if (error.message && error.message.includes("NEXT_REDIRECT")) {
            const digest = error.digest || "";
            console.log("[SERVER ACTION] Caught NEXT_REDIRECT. Digest:", digest);
            if (digest.includes("error=")) {
                console.error("[SERVER ACTION] Redirect points to an error page.");
                return { error: "Erreur lors de l'envoi de l'e-mail. Vérifiez la configuration SMTP ou vos identifiants." };
            }
            return { success: true };
        }

        if (error.message === "TIMEOUT_SMTP") {
            return { error: "Le serveur d'e-mail met trop de temps à répondre. Vérifiez la configuration SMTP." }
        }
        if (error.type === "EmailSignin" || error.message?.includes("EmailSignin") || error.message?.includes("Invalid login")) {
            return { error: "Erreur d'authentification SMTP (Login/Mot de passe Hostinger refusé)." }
        }
        return { error: `Erreur d'authentification: ${error.type || error.message || "Inconnue"}. Veuillez réessayer.` }
    }
}

export async function loginWithPassword(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) return { error: "Email et mot de passe requis" }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard"
        })
    } catch (error: any) {
        if (error.type === "CredentialsSignin") {
            return { error: "Email ou mot de passe incorrect." }
        }
        throw error
    }
}

export async function logout() {
    await signOut({ redirectTo: "/" })
}
