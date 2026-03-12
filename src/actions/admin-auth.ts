"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

/**
 * Server Action for Admin Login with Email/Password
 */
export async function loginAdmin(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) return { error: "Email et mot de passe requis" }

    try {
        await signIn("admin-password", {
            email,
            password,
            redirectTo: "/admin",
        });
        
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Identifiants administratifs incorrects." };
                default:
                    return { error: "Une erreur d'authentification est survenue." };
            }
        }

        // Re-throw redirect errors so Next.js handles them
        if (error instanceof Error && (error.message === 'NEXT_REDIRECT' || error.name === 'RedirectError')) {
            throw error;
        }

        console.error("[SERVER ACTION] loginAdmin error:", error);
        return { error: "Accès refusé ou serveur indisponible." };
    }
}
