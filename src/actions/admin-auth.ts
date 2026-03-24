"use server"

import { signIn, auth } from "@/auth"
import { AuthError } from "next-auth"
import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"

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

/**
 * Part 3.5: Change Admin Password (Server Action)
 * Security restriction: Authenticated Admins only.
 */
export async function changeAdminPassword(data: {
    currentPassword: string,
    newPassword: string
}) {
    const session = await auth();
    if (!session || !session.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string)) {
        return { error: "Non autorisé" };
    }

    const userId = session.user.id;

    try {
        // 1. Fetch user to get current hashed password
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.password) {
            return { error: "Utilisateur introuvable ou sans mot de passe" };
        }

        // 2. Verify current password
        const { compare, hash } = await import("bcrypt-ts");
        const isValid = await compare(data.currentPassword, user.password);

        if (!isValid) {
            return { error: "Le mot de passe actuel est incorrect." };
        }

        // 3. Hash and Save new password (min 8 chars)
        if (data.newPassword.length < 8) {
            return { error: "Le nouveau mot de passe doit faire au moins 8 caractères." };
        }

        const hashedPassword = await hash(data.newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        // 4. Audit Log
        await writeAuditLog({
            userId,
            action: "ADMIN_PASSWORD_CHANGE",
            module: "AUTH",
            newValues: { changedAt: new Date() }
        });

        return { success: true };
    } catch (error) {
        console.error("[SERVER ACTION] changeAdminPassword error:", error);
        return { error: error instanceof Error ? error.message : "Une erreur est survenue lors du changement de mot de passe." };
    }
}

