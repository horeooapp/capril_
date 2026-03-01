"use server"

import { signIn, signOut } from "@/auth"

export async function loginWithMagicLink(formData: FormData) {
    const email = formData.get("email") as string

    if (!email) return { error: "L'adresse email est requise" }

    try {
        await signIn("nodemailer", {
            email,
            redirectTo: "/dashboard"
        })
    } catch (error: any) {
        if (error.type === "AuthError") {
            return { error: "Erreur d'authentification. Veuillez réessayer." }
        }
        throw error // Propage pour que Next.js gère la redirection automatique vers /verify-request
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
