"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeAuditLog } from "@/lib/audit"

/**
 * Updates the user's personal profile information.
 * If all required fields are provided and the user is below KYC Level 2,
 * it will automatically elevate the user's KYC Level to 2 to unlock platform features.
 */
export async function updateUserProfile(data: {
    firstName: string;
    lastName: string;
    birthDate: Date | null;
    birthPlace: string;
    neighborhood: string;
    phone: string;
    avatarUrl?: string;
}) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.")
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { kycLevel: true }
        })

        if (!user) throw new Error("Utilisateur introuvable.")

        let newKycLevel = user.kycLevel;

        // Automatically upgrade to Level 2 if basic info is provided
        const hasAllRequired = data.firstName && data.lastName && data.birthDate && data.birthPlace && data.neighborhood && data.phone;
        if (hasAllRequired && newKycLevel < 2) {
            newKycLevel = 2;
        }

        const fullName = `${data.firstName?.trim() || ''} ${data.lastName?.trim() || ''}`.trim() || undefined;

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                fullName: fullName,
                birthDate: data.birthDate,
                birthPlace: data.birthPlace,
                neighborhood: data.neighborhood,
                phone: data.phone,
                ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
                kycLevel: newKycLevel
            }
        });

        revalidatePath('/dashboard/profile')

        // Audit Log
        try {
            await writeAuditLog({
                userId: session.user.id,
                action: "PROFILE_UPDATED",
                module: "USER_KYC",
                entityId: session.user.id,
                newValues: { kycLevel: newKycLevel }
            });
        } catch (auditErr) {
            console.error("Audit log error:", auditErr);
        }

        return { success: true, newKycLevel }

    } catch (error: any) {
        console.error("Error updating profile:", error)
        return { error: error.message || "Impossible de mettre à jour le profil." }
    }
}
