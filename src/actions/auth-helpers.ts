"use server"

import { auth } from "@/auth"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Returns the current session or throws Unauthorized if not authenticated.
 */
export async function ensureAuthenticated() {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.")
    }
    return session
}

/**
 * Verifies if the current user has one of the required roles.
 */
export async function ensureRole(allowedRoles: Role[]) {
    const session = await ensureAuthenticated()
    const userRole = session.user.role as Role
    
    if (!allowedRoles.includes(userRole)) {
        throw new Error(`Accès refusé : Rôle [${userRole}] non autorisé.`)
    }
    return session
}

/**
 * Verifies if the current user is an Admin or Super Admin.
 */
export async function ensureAdmin() {
    return await ensureRole([Role.ADMIN, Role.SUPER_ADMIN])
}

/**
 * Verifies if the user is the owner or manager of a property.
 */
export async function ensurePropertyAccess(propertyId: string) {
    const session = await ensureAuthenticated()
    const userId = session.user.id
    const userRole = session.user.role as Role

    const property = await prisma.property.findUnique({
        where: { id: propertyId }
    })

    if (!property) throw new Error("Propriété non trouvée.")

    // Admins always have access
    if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) return property

    const fullUser = await prisma.user.findUnique({ where: { id: userId }, select: { agencyConfig: true } })
    const managerId = (fullUser?.agencyConfig as any)?.managerId

    const hasAccess = property.ownerUserId === userId || 
                      property.managedByUserId === userId || 
                      (managerId && property.managedByUserId === managerId);
    
    if (!hasAccess) {
        const pAccess = await prisma.propertyAccess.findFirst({
            where: { 
                propertyId, 
                OR: [
                    { userId, statut: "ACTIF" },
                    managerId ? { userId: managerId, statut: "ACTIF" } : {}
                ].filter(c => Object.keys(c).length > 0)
            }
        })
        if (!pAccess) {
            throw new Error("Accès refusé : Vous n'êtes ni le propriétaire ni le gestionnaire de cette propriété.")
        }
    }
    return property
}

/**
 * Verifies if the user is a participant in a lease (Landlord, Tenant, or Agent).
 */
export async function ensureLeaseAccess(leaseId: string, allowedRoles?: Role[]) {
    const session = await ensureAuthenticated()
    const userId = session.user.id
    const userRole = session.user.role as Role

    if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        })
        if (!lease) throw new Error("Bail non trouvé.")
        return lease
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        throw new Error(`Accès refusé pour le rôle ${userRole}.`)
    }

    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        include: { property: true }
    })

    if (!lease) throw new Error("Bail non trouvé.")

    const fullUser = await prisma.user.findUnique({ where: { id: userId }, select: { agencyConfig: true } })
    const managerId = (fullUser?.agencyConfig as any)?.managerId

    const isParticipant = 
        lease.landlordId === userId || 
        lease.tenantId === userId || 
        lease.agentId === userId ||
        (managerId && lease.agentId === managerId)

    if (!isParticipant) {
        const pAccess = await prisma.propertyAccess.findFirst({
            where: { 
                propertyId: lease.propertyId, 
                OR: [
                    { userId, statut: "ACTIF" },
                    managerId ? { userId: managerId, statut: "ACTIF" } : {}
                ].filter(c => Object.keys(c).length > 0)
            }
        })
        if (!pAccess) {
            throw new Error("Accès refusé : Vous n'êtes pas partie prenante de ce bail.")
        }
    }
    
    return lease
}

/**
 * Verifies if the user (as an Agency Agent) has an active mandate for a property.
 */
export async function ensureMandateAccess(propertyId: string) {
    const session = await ensureAuthenticated();
    const userId = session.user.id;
    const userRole = session.user.role as Role;

    if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) return true;

    const mandate = await prisma.mandate.findFirst({
        where: {
            propertyId,
            agentUserId: userId,
            status: "ACTIVE"
        }
    });

    if (!mandate) {
        throw new Error("Accès refusé : Aucun mandat actif trouvé pour cette propriété.");
    }

    return mandate;
}

/**
 * [P5.3] Strict check for Agency-wide access.
 */
export async function ensureAgencyPortfolioAccess(agencyId: string) {
    const session = await ensureAuthenticated();
    const userId = session.user.id;
    const userRole = session.user.role as Role;

    if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) return true;

    // Verify if the user is the agency owner or an authorized agent
    if (userId !== agencyId) {
        const isAgent = await prisma.user.findFirst({
            where: {
                id: userId,
                role: Role.NON_CERTIFIED_AGENT,
                agencyConfig: { path: ["managerId"], equals: agencyId }
            }
        });
        if (!isAgent) throw new Error("Accès refusé au portefeuille de cette agence.");
    }
    return true;
}
