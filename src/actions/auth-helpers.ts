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

    // Admins always have access
    if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) return

    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { ownerUserId: true, managedByUserId: true }
    })

    if (!property) throw new Error("Propriété non trouvée.")

    if (property.ownerUserId !== userId && property.managedByUserId !== userId) {
        throw new Error("Accès refusé : Vous n'êtes ni le propriétaire ni le gestionnaire de cette propriété.")
    }
}

/**
 * Verifies if the user is a participant in a lease (Landlord, Tenant, or Agent).
 */
export async function ensureLeaseAccess(leaseId: string, allowedRoles?: Role[]) {
    const session = await ensureAuthenticated()
    const userId = session.user.id
    const userRole = session.user.role as Role

    if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) return

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        throw new Error(`Accès refusé pour le rôle ${userRole}.`)
    }

    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        select: { landlordId: true, tenantId: true, agentId: true }
    })

    if (!lease) throw new Error("Bail non trouvé.")

    const isParticipant = 
        lease.landlordId === userId || 
        lease.tenantId === userId || 
        lease.agentId === userId

    if (!isParticipant) {
        throw new Error("Accès refusé : Vous n'êtes pas partie prenante de ce bail.")
    }
    
    return lease
}
