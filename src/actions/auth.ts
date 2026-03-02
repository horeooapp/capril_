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
        console.error("Login magic link error:", error)
        return { error: "Erreur d'authentification. Veuillez réessayer." }
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
