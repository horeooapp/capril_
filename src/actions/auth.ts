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
export async function loginWithOTP(email: string, otp: string) {
    console.log("[SERVER ACTION] loginWithOTP called for email:", email);

    if (!email || !otp) return { error: "Email et code OTP requis" }

    try {
        const result = await signIn("email-otp", {
            email,
            otp,
            redirect: false,
        });

        if (result?.error) {
            return { error: "Code OTP incorrect ou expiré." };
        }

        return { success: true };
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
             return { success: true };
        }
        console.error("[SERVER ACTION] loginWithOTP error:", error);
        return { error: "Échec de l'authentification." };
    }
}

export async function logout() {
    await signOut({ redirectTo: "/" })
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
