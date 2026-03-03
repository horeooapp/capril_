"use server"

import { signIn, signOut } from "@/auth"

export async function loginWithMagicLink(formData: FormData) {
    const email = formData.get("email") as string

    if (!email) return { error: "L'adresse email est requise" }

    try {
        await signIn("nodemailer", {
            email,
            redirect: false,
        })
        return { success: true }
    } catch (error: any) {
        console.error("DEBUG: Login magic link error full:", error)
        if (error.type === "EmailSignin") {
            return { error: "Erreur lors de l'envoi de l'e-mail. Vérifiez la configuration SMTP." }
        }
        return { error: `Erreur d'authentification: ${error.type || "Inconnue"}. Veuillez réessayer.` }
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
