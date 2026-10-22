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

        // 2. User & Role Check (using JS validation to bypass Prisma Enum errors)
        console.log(`[DEBUG] auth.ts - process.env.DATABASE_URL starts with: '${process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 10) : "UNDEFINED"}'`);
        console.log(`[DEBUG] auth.ts admin - process.env.DATABASE_URL starts with: '${process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : "UNDEFINED"}'`);
        
        const user = await prisma.user.findFirst({
            where: { email: normalizedEmail },
            select: { id: true, email: true, role: true, password: true }
        });

        if (!user) {
            console.error(`[AUTH-ERROR] Admin login failed: User ${normalizedEmail} not found.`);
            return { error: "Compte administrateur non trouvé." };
        }

        const userRole = String(user.role || '').toUpperCase().trim();
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        console.log(`[AUTH-DEBUG] Attempting admin login for: ${user.email} | Role in DB: ${user.role} | Normalized Role: ${userRole} | Match: ${isAdmin}`);

        if (!isAdmin) {
            return { error: "Accès refusé: Votre compte n'a pas les privilèges administrateur." };
        }

        if (!user.password) {
            return { error: "Mot de passe non configuré pour ce compte." };
        }

        // 3. Pre-verify password with bcrypt-ts to provide clear error message before NextAuth session creation
        const { compare } = await import("bcrypt-ts");
        const isPasswordCorrect = await compare(password, user.password);
        if (!isPasswordCorrect) {
            return { error: "Mot de passe incorrect." };
        }

        // 4. Perform Actual Sign In
        try {
            await signIn("admin-password", {
                email: normalizedEmail,
                password,
                redirect: false,
            });
        } catch (signInErr: any) {
            if (signInErr instanceof Error && signInErr.message === "NEXT_REDIRECT") {
                return { success: true };
            }
            console.error("[SERVER ACTION] signIn error inside loginWithAdminCredentials:", signInErr);
            // If credentials was correct, check if it's NextAuth internal error or redirect
            if (signInErr?.type === 'CredentialsSignin' || signInErr?.name === 'CredentialsSignin') {
                return { error: "Identifiants administratifs rejetés par la session." };
            }
            throw signInErr;
        }

        return { success: true };
    } catch (error: any) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
             return { success: true };
        }
        
        const errorString = String(error);
        const innerError = error?.cause || error;
        const errorCode = innerError?.code || innerError?.type || error?.code || error?.type || "";
        
        console.error("[SERVER ACTION] loginWithAdminCredentials detail:", {
            name: error?.name,
            message: error?.message,
            type: error?.type,
            code: error?.code,
            cause: error?.cause,
            innerCode: errorCode,
            stack: error?.stack
        });

        const ADMIN_ERROR_MESSAGES: Record<string, string> = {
            domain_restricted: "Accès restreint aux domaines autorisés (@qapril.ci, @qapril.net)",
            account_not_found: "Compte administrateur non trouvé.",
            insufficient_role: "Rôle insuffisant pour accéder à la console.",
            password_not_configured: "Mot de passe non configuré pour ce compte.",
            invalid_password: "Mot de passe incorrect.",
            database_error: "Erreur de base de données. Veuillez réessayer.",
            admin_access_denied: "Accès refusé : Privilèges administrateur requis."
        };

        if (ADMIN_ERROR_MESSAGES[errorCode]) {
            return { error: ADMIN_ERROR_MESSAGES[errorCode] };
        }
        
        if (error?.type === 'CredentialsSignin' || errorCode === 'CredentialsSignin' || innerError?.type === 'CredentialsSignin') {
             return { error: "Identifiants incorrects ou accès non autorisé." };
        }
        
        if (
            (error?.type === 'CallbackRouteError' || error?.name === 'CallbackRouteError' || errorString.includes('CallbackRouteError')) &&
            innerError?.message
        ) {
             return { error: `Échec d'authentification: ${innerError.message}` };
        }
        
        // Debug fallback
        return { error: `[DEBUG] Erreur Auth: Code=${errorCode || error?.code} | Msg: ${innerError?.message || error?.message || errorString}` };
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
