"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"



function generateRandomPassword() {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + "!"
}

export async function authorizeAgencyManager() {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "AGENCY") {
        throw new Error("Accès refusé. Seules les Agences autorisées peuvent utiliser ce module.")
    }

    const manager = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    if (!manager) throw new Error("Gérant introuvable.")
    
    // Un collaborateur invité (qui n'est pas "chef") ne peut pas inviter d'autres gens.
    const config = (manager as any).agencyConfig
    if (config?.isManager === false) {
        throw new Error("Vous n'avez pas les droits de gérance pour inviter des collaborateurs.")
    }

    return manager
}

export async function listAgencyCollaborators() {
    try {
        const manager = await authorizeAgencyManager()

        // Tous les collaborateurs qui ont managerId dans leur agencyConfig
        // Alternative plus sûre : on recherche ceux dont l'agencyConfig contient le mm "agencyId"
        const allAgencyUsers = await prisma.user.findMany({
            where: { role: "AGENCY" }
        })

        const collaborators = allAgencyUsers.filter(u => {
            const conf = (u as any).agencyConfig
            return conf && conf.managerId === manager.id
        })

        return { success: true, data: collaborators.map((c: any) => {
            const conf = c.agencyConfig;
            return {
                id: c.id,
                email: c.email,
                fullName: c.fullName || c.lastName || "Collaborateur",
                joinedAt: c.createdAt,
                status: conf?.status || "INVITED",
                permissions: conf?.permissions || []
            }
        }) };
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function inviteCollaborator(formData: { email: string, permissions: string[] }) {
    try {
        const manager = await authorizeAgencyManager()

        if (!formData.email) throw new Error("Fournissez une adresse email valide.")

        const existingUser = await prisma.user.findUnique({
            where: { email: formData.email }
        })

        if (existingUser && existingUser.role !== "AGENCY") {
            throw new Error("Cet email est déjà utilisé par un locataire ou propriétaire existant.")
        }

        const token = uuidv4()
        const configToSave = {
            isManager: false,
            managerId: manager.id,
            permissions: formData.permissions,
            status: "INVITED",
            inviteToken: token,
            invitedAt: new Date().toISOString()
        }

        let createdOrUpdatedUserId = ""

        if (existingUser) {
            const mergedConfig = { ...((existingUser as any).agencyConfig || {}), ...configToSave }
            await (prisma.user as any).update({
                where: { id: existingUser.id },
                data: { agencyConfig: mergedConfig }
            })
            createdOrUpdatedUserId = existingUser.id
        } else {
            const newUser = await (prisma.user as any).create({
                data: {
                    email: formData.email,
                    role: "AGENCY",
                    password: generateRandomPassword(), // Fake password, will use magic or normal reset
                    agencyConfig: configToSave,
                }
            })
            createdOrUpdatedUserId = newUser.id
        }

        // Dans un monde de production, on enverrait l'email ici
        // Ex: sendEmail(formData.email, `qapril.ci/invite/${token}`)
        
        return { 
            success: true, 
            message: "L'invitation a été sécurisée et générée avec succès.",
            inviteLink: `/invite/${token}` 
        }

    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function removeCollaborator(collaboratorId: string) {
    try {
        const manager = await authorizeAgencyManager()

        const collab = await prisma.user.findUnique({
            where: { id: collaboratorId }
        })

        if (!collab) throw new Error("Collaborateur introuvable.")

        const conf = (collab as any).agencyConfig
        if (conf?.managerId !== manager.id) {
            throw new Error("Action non autorisée sur cet utilisateur.")
        }

        // Suspend the collaborator
        await (prisma.user as any).update({
            where: { id: collaboratorId },
            data: { 
                status: "suspended",
                agencyConfig: {
                    ...conf,
                    status: "SUSPENDED"
                }
            }
        })

        return { success: true, message: "L'accès du collaborateur a été révoqué." }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function validateInvitationToken(token: string) {
    if (!token) throw new Error("Lien introuvable.")

    // We do a full scan since inviteToken is buried in JSON (not ideal for perf, but okay here)
    const users = await prisma.user.findMany({ where: { role: "AGENCY" } })
    const matchedUser = users.find((u: any) => {
        const conf = u.agencyConfig
        return conf?.inviteToken === token
    })

    if (!matchedUser) throw new Error("Lien d'invitation invalide ou expiré.")

    return matchedUser
}

export async function acceptInvite(token: string, password: string, fullName: string) {
    try {
        const matchedUser = await validateInvitationToken(token)

        const conf = (matchedUser as any).agencyConfig
        
        if (conf.status === "ACTIVE") throw new Error("Cette invitation a déjà été acceptée.")

        const newConfig = {
            ...conf,
            status: "ACTIVE",
            inviteToken: null // Invalidates token
        }

        const { hash } = await import("bcrypt-ts")
        const hashedPassword = await hash(password, 10)

        await (prisma.user as any).update({
            where: { id: matchedUser.id },
            data: {
                password: hashedPassword,
                fullName: fullName,
                lastName: fullName,
                agencyConfig: newConfig,
                status: "active"
            }
        })

        return { success: true, message: "Bienvenue sur QAPRIL. Vous pouvez à présent vous connecter." }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
