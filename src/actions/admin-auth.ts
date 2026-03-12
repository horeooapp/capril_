"use server"

import { signIn } from "@/auth"

/**
 * Server Action for Admin Login with Email/Password
 */
export async function loginAdmin(email: string, password: string) {
    if (!email || !password) return { error: "Email et mot de passe requis" }

    try {
        const result = await signIn("admin-password", {
            email,
            password,
            redirect: false,
        });

        if (result?.error) {
            return { error: "Identifiants incorrects ou accès refusé." };
        }

        return { success: true };
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
             return { success: true };
        }
        console.error("[SERVER ACTION] loginAdmin error:", error);
        return { error: "Échec de l'authentification administrative." };
    }
}
