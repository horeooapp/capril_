"use server"

import { signIn, signOut } from "@/auth"

export async function loginWithMagicLink(formData: FormData) {
    const email = formData.get("email") as string
    console.log("[SERVER ACTION] loginWithMagicLink called for email:", email);

    if (!email) return { error: "L'adresse email est requise" }

    try {
        console.log("[SERVER ACTION] Calling NextAuth signIn...");

        // Timeout de 10 secondes pour éviter le blocage de l'interface
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("TIMEOUT_SMTP")), 10000);
        });

        const signInPromise = signIn("nodemailer", {
            email,
            redirect: false,
        });

        await Promise.race([signInPromise, timeoutPromise]);

        console.log("[SERVER ACTION] NextAuth signIn returned successfully.");
        return { success: true }
    } catch (error: any) {
        console.error("[SERVER ACTION] DEBUG: Login magic link error full:", error)
        if (error.message === "TIMEOUT_SMTP") {
            return { error: "Le serveur d'e-mail met trop de temps à répondre. Vérifiez la configuration SMTP." }
        }
        if (error.type === "EmailSignin" || error.message?.includes("EmailSignin")) {
            return { error: "Erreur lors de l'envoi de l'e-mail. Vérifiez la configuration SMTP." }
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
