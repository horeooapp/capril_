"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { issueCNL } from "@/lib/certificates"
import { Role } from "@prisma/client"

/**
 * Part 14.3: Request Digital Tenant Certificate (CNL)
 */
export async function requestCNL() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.");
    }

    // Role check
    if (session.user.role !== 'TENANT' && session.user.role !== 'ADMIN') {
        throw new Error("Seuls les locataires peuvent demander un CNL.");
    }

    try {
        const certificate = await issueCNL(session.user.id);
        revalidatePath("/dashboard/certificates");
        return { 
            success: true, 
            certificateId: certificate.id, 
            expiresAt: certificate.expiresAt 
        };
    } catch (error: unknown) {
        console.error("Erreur demande CNL:", error);
        const errorMessage = error instanceof Error ? error.message : "Impossible de générer le certificat.";
        return { error: errorMessage };
    }
}

/**
 * Part 14.4: List User Certificates
 */
export async function getMyCertificates() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) return [];

    return await prisma.certificate.findMany({
        where: { userId: session.user.id },
        orderBy: { issuedAt: 'desc' }
    });
}
