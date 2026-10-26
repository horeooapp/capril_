"use server"

import { signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"

import { redis } from '@/lib/redis';
import { sendOTPEmail, sendPasswordResetEmail } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import crypto from "crypto";

// [SEC-FIX F-03] OTP cryptographiquement sécurisé
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

import { sendOpenWAOTP } from "@/lib/openwa";

/**
 * Part 3.3: Request Email / WhatsApp OTP (Server Action)
 * Initiates the verification flow via OpenWA (WhatsApp) and Email fallback.
 */
export async function requestOTP(identifier: string) {
    console.log("[SERVER ACTION] requestOTP called for:", identifier);

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const cleanPhone = identifier.replace(/[\s-]/g, '');
    const isPhone = /^\+?[0-9]{8,15}$/.test(cleanPhone);

    if (!isEmail && !isPhone) {
        return { error: "Veuillez saisir une adresse e-mail ou un numéro de téléphone valide." };
    }

    try {
        const otp = generateOTP();
        const ttl = parseInt(process.env.OTP_TTL_SECONDS || '600');

        if (!redis) {
            console.error("[SERVER ACTION] Redis not available");
            return { error: 'Service de validation temporairement indisponible' };
        }

        if (isPhone) {
            // Stocker pour le numéro de téléphone
            await redis.set(`otp:${cleanPhone}`, otp, 'EX', ttl);
            const waResult = await sendOpenWAOTP(cleanPhone, otp, "Connexion");
            console.log(`[AUTH] OTP ${otp} sent via OpenWA to ${cleanPhone} (Success: ${waResult.success})`);
            return { success: true, channel: "WHATSAPP" };
        }

        // Si c'est un email
        const normalizedEmail = identifier.toLowerCase().trim();
        await redis.set(`otp:${normalizedEmail}`, otp, 'EX', ttl);

        // Envoyer par OpenWA si l'utilisateur a un numéro de téléphone associé
        try {
            const user = await prisma.user.findFirst({
                where: { email: normalizedEmail },
                select: { phone: true }
            });
            if (user?.phone) {
                await sendOpenWAOTP(user.phone, otp, "Connexion");
            }
        } catch (dbErr) {
            console.warn("[AUTH] Could not lookup user phone for OpenWA notification:", dbErr);
        }

        // Envoyer également l'email en parallèle
        const emailResult = await sendOTPEmail(normalizedEmail, otp);
        if (!emailResult.success) {
            console.error(`[SERVER ACTION] Failed to send email to ${normalizedEmail}:`, emailResult.error);
        }

        console.log(`[AUTH] OTP ${otp} generated for ${normalizedEmail} (TTL: ${ttl}s)`);
        return { success: true };
    } catch (error: any) {
        console.error("[SERVER ACTION] requestOTP error:", error?.message || error);
        return { error: `Erreur technique lors de l'envoi du code (${error?.message?.substring(0, 50)}).` };
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
        let normalizedEmail = email.toLowerCase().trim();
        if (normalizedEmail === 'admin') {
            normalizedEmail = 'admin@qapril.ci';
        }

        const result = await signIn("email-otp", {
            email: normalizedEmail,
            otp,
            role,
            redirect: false,
        });

        if (result?.error) {
            console.error("[SERVER ACTION] loginWithOTP Result Error:", result.error);
            return { error: "Code OTP incorrect ou expiré." };
        }

        // Get user status to determine redirection
        const user = await prisma.user.findFirst({
            where: { email: email.toLowerCase().trim() },
            select: { onboardingComplete: true }
        });

        return { 
            success: true, 
            onboardingComplete: user?.onboardingComplete || false 
        };
    } catch (error: any) {
        // Explicitly handle failures with detailed logging
        const errorCode = (error as any)?.code || (error as any)?.type || "UNKNOWN_ERROR";
        console.error("[SERVER ACTION] loginWithOTP Exception:", {
            message: error?.message,
            code: errorCode,
            type: error?.type,
            email: email,
            role: role
        });
        
        const lowerMsg = (error?.message || "").toLowerCase();
        // Use errorCode from line 94

        const OTP_ERROR_MESSAGES: Record<string, string> = {
            invalid_otp: "Code OTP incorrect ou expiré.",
            no_valid_role: "Compte sans rôle valide. Veuillez contacter le support.",
        };

        if (OTP_ERROR_MESSAGES[errorCode]) {
            return { error: OTP_ERROR_MESSAGES[errorCode] };
        }

        // Expose the raw Prisma/DB error for debugging
        if (error?.message?.includes("database_error:")) {
            return { error: `[DB ERROR]: ${error.message}` };
        }

        if (lowerMsg.includes('credentialssignin') || error?.type === 'CredentialsSignin' || errorCode === 'CredentialsSignin') {
            return { error: "Code OTP incorrect, expiré ou compte non autorisé." };
        }

        return { error: `Échec de l'authentification: ${error?.message || "Erreur interne"}` };
    }
}

/**
 * Étape 1 du 2FA Admin : Vérification email + mot de passe, génération et envoi de l'OTP WhatsApp
 */
export async function requestAdmin2FA(email: string, password: string) {
    if (!email || !password) return { error: "Email et mot de passe requis." };

    try {
        const normalizedEmail = email.toLowerCase().trim();

        if (!normalizedEmail.endsWith("@qapril.ci") && !normalizedEmail.endsWith("@qapril.net")) {
            return { error: "Accès restreint aux domaines autorisés (@qapril.ci, @qapril.net)" };
        }

        const user = await prisma.user.findFirst({
            where: { email: normalizedEmail },
            select: { id: true, email: true, role: true, password: true, phone: true }
        });

        if (!user) {
            return { error: "Compte administrateur non trouvé." };
        }

        const userRole = String(user.role || '').toUpperCase().trim();
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        if (!isAdmin) {
            return { error: "Accès refusé: Votre compte n'a pas les privilèges administrateur." };
        }

        if (!user.password) {
            return { error: "Mot de passe non configuré pour ce compte." };
        }

        const { compare } = await import("bcrypt-ts");
        const isPasswordCorrect = await compare(password, user.password);
        if (!isPasswordCorrect) {
            return { error: "Mot de passe incorrect." };
        }

        // Numéro WhatsApp cible
        const targetPhone = user.phone || "+2250707334770";

        // Génération du code OTP 6 chiffres
        const otp = crypto.randomInt(100000, 999999).toString();
        const ttl = 600; // 10 minutes

        // Stockage sécurisé de l'OTP dans Redis
        await redis.set(`admin_otp:${normalizedEmail}`, otp, 'EX', ttl);

        // Envoi multi-canal : WhatsApp (OpenWA) + Email certifié (Resend)
        try {
            await sendOpenWAOTP(targetPhone, otp, "Connexion Console Centrale Administrateur");
            console.log(`[AUTH-2FA] WhatsApp OTP ${otp} envoyé vers ${targetPhone}`);
        } catch (waErr) {
            console.error("[AUTH-2FA] Échec envoi WhatsApp OpenWA:", waErr);
        }

        // Envoi garanti par Email (Resend qapril.net) en simultané
        try {
            await sendOTPEmail(normalizedEmail, otp);
            console.log(`[AUTH-2FA] Email OTP ${otp} envoyé avec succès à ${normalizedEmail}`);
        } catch (mailErr) {
            console.error("[AUTH-2FA] Échec envoi Email OTP:", mailErr);
        }

        // Masquer le numéro pour l'affichage utilisateur (ex: +225 •• •• 47 70)
        const maskedPhone = targetPhone.replace(/(\+\d{3})(\d{2})\d{4}(\d{4})/, '$1 $2 •• •• $3');

        return { 
            success: true, 
            requireOTP: true, 
            phoneMasked: maskedPhone 
        };
    } catch (error: any) {
        console.error("[SERVER ACTION] requestAdmin2FA error:", error);
        return { error: `Erreur lors de l'initiation 2FA (${error?.message || "Erreur interne"}).` };
    }
}

/**
 * Étape 2 du 2FA Admin : Vérification de l'OTP WhatsApp et finalisation de la session
 */
export async function verifyAdmin2FA(email: string, password: string, otp: string) {
    if (!email || !password || !otp) return { error: "Paramètres manquants pour la double validation." };

    try {
        const normalizedEmail = email.toLowerCase().trim();

        // 1. Vérification de l'OTP dans Redis
        const storedOtp = await redis.get(`admin_otp:${normalizedEmail}`);
        if (!storedOtp || storedOtp !== otp.trim()) {
            return { error: "Code de sécurité WhatsApp incorrect ou expiré." };
        }

        // 2. Suppression de l'OTP à usage unique
        await redis.del(`admin_otp:${normalizedEmail}`);

        // 3. Authentification NextAuth
        const signInResult = await signIn("admin-password", {
            email: normalizedEmail,
            password,
            redirect: false,
        });

        if (signInResult?.error) {
            return { error: "Échec de finalisation de session administrative." };
        }

        return { success: true };
    } catch (error: any) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            return { success: true };
        }
        console.error("[SERVER ACTION] verifyAdmin2FA error:", error);
        return { error: `Erreur de validation 2FA: ${error?.message || "Erreur interne"}` };
    }
}

/**
 * Login with Credentials (Admin) - Redirige vers la demande 2FA
 */
export async function loginWithAdminCredentials(email: string, password: string) {
    return requestAdmin2FA(email, password);
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
