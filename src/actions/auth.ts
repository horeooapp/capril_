"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"

import { redis } from '@/lib/redis';
import { sendOTPEmail, sendPasswordResetEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import crypto from "crypto";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Part 3.3: Request Email OTP (Server Action)
 * Initiates the email verification flow.
 */
export async function requestOTP(email: string) {
    console.log("[SERVER ACTION] requestOTP called for email:", email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Format d'email invalide" };
    }

    try {
        const normalizedEmail = email.toLowerCase().trim();
        // 1. Generate OTP
        const otp = generateOTP();
        const ttl = parseInt(process.env.OTP_TTL_SECONDS || '600');

        // 2. Store in Redis
        if (!redis) {
            console.error("[SERVER ACTION] Redis not available");
            return { error: 'Service de validation temporairement indisponible' };
        }
        await redis.set(`otp:${normalizedEmail}`, otp, 'EX', ttl);

        // 3. Send Email
        const emailResult = await sendOTPEmail(normalizedEmail, otp);

        if (!emailResult.success) {
            console.error(`[SERVER ACTION] Failed to send email to ${normalizedEmail}:`, emailResult.error);
            return { error: `Échec de l'envoi de l'email de validation.` };
        }

        return { success: true };
    } catch (error) {
        console.error("[SERVER ACTION] requestOTP error:", error);
        return { error: `Erreur technique lors de l'envoi du code.` };
    }
}

/**
 * Part 3.4: Login with Email OTP (Server Action)
 * Finalizes authentication via NextAuth.
 */
export async function loginWithOTP(email: string, otp: string, role?: string) {
    console.log("[SERVER ACTION] loginWithOTP called for email:", email, "intended role:", role);

    if (!email || !otp) return { error: "Email et code OTP requis" }

    try {
        const result = await signIn("email-otp", {
            email,
            otp,
            role,
            redirect: false,
        });

        if (result?.error) {
            console.error("[SERVER ACTION] loginWithOTP Result Error:", result.error);
            return { error: "Code OTP incorrect ou expiré." };
        }

        return { success: true };
    } catch (error: any) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
             return { success: true };
        }
        
        // Log details to help debugging
        console.error("[SERVER ACTION] loginWithOTP Exception:", {
            message: error?.message,
            stack: error?.stack,
            type: error?.type,
            name: error?.name
        });

        return { error: `Échec de l'authentification: ${error?.message || "Erreur interne"}` };
    }
}

/**
 * Login with Credentials (Admin)
 */
export async function loginWithAdminCredentials(email: string, password: string) {
    if (!email || !password) return { error: "Email et mot de passe requis" };

    try {
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Domain Restriction (Fast check)
        if (!normalizedEmail.endsWith("@qapril.ci") && !normalizedEmail.endsWith("@qapril.net")) {
            return { error: "Accès restreint aux domaines autorisés (@qapril.ci, @qapril.net)" };
        }

        // 2. User & Role Check
        const user = await prisma.user.findFirst({
            where: { 
                email: normalizedEmail,
                role: { in: ['ADMIN', 'SUPER_ADMIN'] }
            }
        });

        if (!user) {
            return { error: "Compte administrateur non trouvé ou accès refusé." };
        }

        console.log("[AUTH-DEBUG] Found user:", user.email, "Role:", user.role);

        if (!user.password) {
            return { error: "Mot de passe non configuré pour ce compte." };
        }

        // 3. Perform Actual Sign In
        const result = await signIn("admin-password", {
            email: normalizedEmail,
            password,
            redirect: false,
        });

        if (result?.error) {
            // Since we already checked user existence and domain, this error is most likely wrong password
            console.warn("[SERVER ACTION] Admin login failed for:", normalizedEmail, "Error:", result.error);
            return { error: "Mot de passe incorrect." };
        }

        return { success: true };
    } catch (error: any) {
        const errorString = String(error);
        const errorStack = error?.stack || "";
        
        if (
            error?.type === 'CallbackRouteError' || 
            error?.name === 'CallbackRouteError' || 
            errorString.includes('CallbackRouteError') ||
            errorStack.includes('CallbackRouteError')
        ) {
             return { error: "Mot de passe incorrect." };
        }
        
        console.error("[SERVER ACTION] loginWithAdminCredentials detail:", {
            name: error?.name,
            message: error?.message,
            type: error?.type,
            stack: error?.stack
        });
        
        return { error: "Une erreur technique est survenue." };
    }
}

export async function logout() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "/";
    await signOut({ redirectTo: baseUrl })
}

/**
 * Request Password Reset
 * Generates a token, stores it in Redis, and sends an email.
 */
export async function requestPasswordReset(email: string) {
    console.log("[SERVER ACTION] requestPasswordReset called for email:", email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Format d'email invalide" };
    }

    try {
        // 1. Check if user exists (only admins/owners have passwords)
        const user = await (prisma as any).user.findFirst({
            where: { email }
        });

        if (!user) {
            // Security: don't reveal if user exists, but we can log it
            console.warn(`[SERVER ACTION] Reset request for non-existent email: ${email}`);
            return { success: true }; 
        }

        // 2. Generate Token
        const token = crypto.randomUUID();
        const ttl = 3600; // 1 hour

        // 3. Store in Redis
        if (!redis) return { error: "Service temporairement indisponible" };
        await redis.set(`reset:${token}`, email, 'EX', ttl);

        // 4. Send Email
        const emailResult = await sendPasswordResetEmail(email, token);
        
        if (!emailResult.success) {
            return { error: "Échec de l'envoi de l'email de réinitialisation." };
        }

        // 5. Audit Log
        await writeAuditLog({
            userId: user.id,
            action: "FORGOT_PASSWORD_REQUEST",
            module: "AUTH",
            newValues: { email }
        });

        return { success: true };
    } catch (error) {
        console.error("[SERVER ACTION] requestPasswordReset error:", error);
        return { error: "Une erreur est survenue lors de la demande." };
    }
}

/**
 * Reset Password
 * Verifies token from Redis and updates user password.
 */
export async function resetPassword(token: string, password: string) {
    if (!token || !password || password.length < 8) {
        return { error: "Données de réinitialisation invalides." };
    }

    try {
        // 1. Verify Token in Redis
        if (!redis) return { error: "Service temporairement indisponible" };
        const email = await redis.get(`reset:${token}`);

        if (!email) {
            return { error: "Lien invalide ou expiré." };
        }

        // 2. Hash New Password
        const { hash } = await import("bcrypt-ts");
        const hashedPassword = await hash(password, 10);

        // 3. Update User
        const existingUser = await (prisma as any).user.findFirst({ where: { email } });
        if (!existingUser) return { error: "Utilisateur non trouvé." };

        const user = await (prisma as any).user.update({
            where: { id: existingUser.id },
            data: { password: hashedPassword }
        });

        // 4. Clean up Redis
        await redis.del(`reset:${token}`);

        // 5. Audit Log
        await writeAuditLog({
            userId: user.id,
            action: "PASSWORD_RESET_SUCCESS",
            module: "AUTH"
        });

        return { success: true };
    } catch (error) {
        console.error("[SERVER ACTION] resetPassword error:", error);
        return { error: "Impossible de réinitialiser le mot de passe." };
    }
}
