"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Part 3.3: Request OTP (Server Action)
 * Initiates the phone verification flow.
 */
export async function requestOTP(phone: string) {
    console.log("[SERVER ACTION] requestOTP called for phone:", phone);

    if (!phone) return { error: "Le numéro de téléphone est requis" }

    try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });

        const result = await response.json();
        
        if (!response.ok) {
            return { error: result.error || "Erreur lors de l'envoi de l'OTP" };
        }

        return { success: true };
    } catch (error) {
        console.error("[SERVER ACTION] requestOTP error:", error);
        const urlFetched = `${process.env.NEXTAUTH_URL || ''}/api/v1/auth/register`;
        const errMessage = error instanceof Error ? error.message : String(error);
        return { error: `Erreur technique lors de l'envoi du code. [Détails: ${errMessage} | URL: ${urlFetched}]` };
    }
}

/**
 * Part 3.4: Login with OTP (Server Action)
 * Finalizes authentication via NextAuth.
 */
export async function loginWithOTP(phone: string, otp: string) {
    console.log("[SERVER ACTION] loginWithOTP called for phone:", phone);

    if (!phone || !otp) return { error: "Téléphone et code OTP requis" }

    try {
        const result = await signIn("phone-otp", {
            phone,
            otp,
            redirect: false,
        });

        if (result?.error) {
            return { error: "Code OTP incorrect ou expiré." };
        }

        return { success: true };
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
             // In NextAuth v5 server actions, signin might throw a redirect
             return { success: true };
        }
        console.error("[SERVER ACTION] loginWithOTP error:", error);
        return { error: "Échec de l'authentification." };
    }
}

export async function logout() {
    await signOut({ redirectTo: "/" })
}
