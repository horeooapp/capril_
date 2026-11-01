"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

/**
 * Définit le rôle actif choisi pour l'utilisateur.
 * Met à jour Redis, la session et la base de données (capaciteActive & role).
 */
export async function setChosenRole(role: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Non authentifié" };

    const requestedRole = (role || "").toUpperCase().trim();
    const isLandlordReq = ['LANDLORD', 'PROPRIETAIRE', 'BAILLEUR', 'LANDLORD_PRO'].includes(requestedRole);
    const isTenantReq = ['TENANT', 'LOCATAIRE'].includes(requestedRole);
    const isAgencyReq = ['AGENCY', 'AGENCE_AGREE', 'AGENCE', 'NON_CERTIFIED_AGENT', 'AGENCE_NON_AGREE'].includes(requestedRole);

    let targetRole = requestedRole;
    if (isLandlordReq) targetRole = 'LANDLORD';
    else if (isTenantReq) targetRole = 'TENANT';
    else if (isAgencyReq) {
        targetRole = (requestedRole === 'NON_CERTIFIED_AGENT' || requestedRole === 'AGENCE_NON_AGREE') 
            ? 'NON_CERTIFIED_AGENT' 
            : 'AGENCY';
    }

    const { prisma } = await import("@/lib/prisma");

    // Vérifier les capacités réelles en base de données
    const dbUser = await (prisma as any).user.findUnique({
        where: { id: session.user.id },
        include: {
            capacites: true,
            _count: {
                select: {
                    propertiesOwned: true,
                    leasesAsTenant: true,
                    mandates: true
                }
            }
        }
    });

    if (!dbUser) return { error: "Utilisateur introuvable" };

    const sessionEligible = ((session.user as any).eligibleRoles || []).map((r: string) => r.toUpperCase());
    const currentRole = String(session.user.role || '').toUpperCase();
    const dbCapacities = (dbUser.capacites || []).map((c: any) => c.capacite.toUpperCase());
    
    const allEligible = new Set<string>([...sessionEligible, currentRole, ...dbCapacities]);
    if (dbUser._count.propertiesOwned > 0) {
        allEligible.add('LANDLORD');
        allEligible.add('PROPRIETAIRE');
    }
    if (dbUser._count.leasesAsTenant > 0) {
        allEligible.add('TENANT');
        allEligible.add('LOCATAIRE');
    }
    if (dbUser._count.mandates > 0) {
        allEligible.add('AGENCY');
    }

    const isAuthorized = allEligible.has(targetRole)
        || (isLandlordReq && (allEligible.has('LANDLORD') || allEligible.has('PROPRIETAIRE') || allEligible.has('BAILLEUR')))
        || (isTenantReq && (allEligible.has('TENANT') || allEligible.has('LOCATAIRE')))
        || (isAgencyReq && (allEligible.has('AGENCY') || allEligible.has('AGENCE_AGREE') || allEligible.has('NON_CERTIFIED_AGENT')));

    if (!isAuthorized) {
        return { error: `Rôle ${targetRole} non autorisé pour cet utilisateur` };
    }

    try {
        if (redis) {
            await redis.set(`user:active_role:${session.user.id}`, targetRole).catch((e: any) => console.error("Redis error:", e));
        }

        // Mettre à jour en base de données : capaciteActive et role
        await (prisma as any).user.update({
            where: { id: session.user.id },
            data: {
                capaciteActive: targetRole,
                ...(targetRole === 'LANDLORD' || targetRole === 'TENANT' || targetRole === 'AGENCY' || targetRole === 'NON_CERTIFIED_AGENT'
                    ? { role: targetRole }
                    : {})
            }
        });

        // S'assurer que la capacité existe dans UserCapacite
        await (prisma as any).userCapacite.upsert({
            where: {
                userId_capacite: {
                    userId: session.user.id,
                    capacite: targetRole
                }
            },
            update: { actif: true },
            create: {
                userId: session.user.id,
                capacite: targetRole,
                actif: true
            }
        }).catch(() => {});

        console.log(`[AUTH] User ${session.user.email} successfully chose role: ${targetRole}`);

        let redirectUrl = "/dashboard";
        if (targetRole === "TENANT") redirectUrl = "/mon-espace-locataire";
        if (targetRole === "ADMIN" || targetRole === "SUPER_ADMIN") redirectUrl = "/admin";

        return { success: true, chosenRole: targetRole, redirectUrl };
    } catch (error: any) {
        console.error("[AUTH] setChosenRole Critical Error:", error);
        return { error: "Erreur lors du changement de rôle", details: error.message };
    }
}
