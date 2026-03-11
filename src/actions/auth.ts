"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"

import { redis } from '@/lib/redis';
import { getSMSService } from '@/lib/sms';

function generateOTP(): string {
  if (process.env.NODE_ENV === 'development') return '123456';
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Part 3.3: Request OTP (Server Action)
 * Initiates the phone verification flow.
 */
export async function requestOTP(phone: string) {
    console.log("[SERVER ACTION] requestOTP called for phone:", phone);

    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        return { error: 'Format de numéro de téléphone invalide' };
    }

    try {
        // 1. Generate OTP
        const otp = generateOTP();
        const ttl = parseInt(process.env.OTP_TTL_SECONDS || '600');

        // 2. Store in Redis
        if (!redis) {
            console.error("[SERVER ACTION] Redis not available");
            return { error: 'Service de validation temporairement indisponible' };
        }
        await redis.set(`otp:${phone}`, otp, 'EX', ttl);

        // 3. Send SMS
        const sms = getSMSService();
        const sendResult = await sms.sendOTP(phone, otp);

        if (!sendResult.success) {
            console.error(`[SERVER ACTION] Failed to send SMS to ${phone}:`, sendResult.error);
            return { error: 'Échec de l\'envoi du SMS de validation' };
        }

        return { success: true };
    } catch (error) {
        console.error("[SERVER ACTION] requestOTP error:", error);
        const errMessage = error instanceof Error ? error.message : String(error);
        return { error: `Erreur technique: ${errMessage}` };
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
