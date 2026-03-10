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
    if ((session.user.role as any) !== 'TENANT' && (session.user.role as any) !== 'ADMIN') {
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
    } catch (error: any) {
        console.error("Erreur demande CNL:", error);
        return { error: error.message || "Impossible de générer le certificat." };
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
