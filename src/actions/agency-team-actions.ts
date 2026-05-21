"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"



function generateRandomPassword() {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase() + "!"
}

export async function authorizeAgencyManager() {
    const session = await auth()
    const u = session?.user as any;
    
    if (!u?.id) {
        throw new Error("Accès refusé. Non connecté.")
    }

    const isAgency = 
        ["AGENCY", "AGENCE_AGREE", "NON_CERTIFIED_AGENT"].includes(u.role) ||
        ["AGENCY", "AGENCE_AGREE", "NON_CERTIFIED_AGENT"].includes(u.chosenRole) ||
        u.eligibleRoles?.some((r: string) => ["AGENCY", "AGENCE_AGREE", "NON_CERTIFIED_AGENT"].includes(r));

    if (!isAgency) {
        throw new Error("Accès refusé. Seules les Agences autorisées peuvent utiliser ce module.")
    }

    const manager = await prisma.user.findUnique({
        where: { id: u.id as string }
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
                fullName: (c.firstName ? c.firstName + " " : "") + (c.lastName || "") || c.lastName || "Collaborateur",
                joinedAt: c.createdAt,
                poste: conf?.poste || "COLLABORATEUR",
                status: conf?.status || "INVITED",
                permissions: conf?.permissions || [],
                inviteToken: conf?.inviteToken || null
            }
        }) };
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function inviteCollaborator(formData: { email: string, permissions: string[], poste?: string }) {
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
            poste: formData.poste || "COLLABORATEUR",
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

        // Send Email
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.qapril.ci"}/invite/${token}`
        const { sendEmail, wrapInPremiumTemplate } = await import("@/lib/email")
        
        await sendEmail({
            to: formData.email,
            subject: "Mise en réseau Professionnelle - QAPRIL",
            html: wrapInPremiumTemplate(`
                <p>Vous avez été invité(e) en tant que <strong>${formData.poste || "COLLABORATEUR"}</strong> au sein du réseau de confiance QAPRIL.</p>
                <p>Pour activer votre poste de gestion sur l'infrastructure sécurisée, veuillez accepter cette affectation :</p>
                <div style="margin: 32px 0; text-align: center;">
                    <a href="${inviteLink}" style="background-color: #1B3A6B; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; text-transform: uppercase; font-size: 13px;">Accepter l'Affectation</a>
                </div>
            `, "Invitation Agence")
        });
        
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

export async function reactivateCollaborator(collaboratorId: string) {
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

        await (prisma.user as any).update({
            where: { id: collaboratorId },
            data: { 
                status: "ACTIVE",
                agencyConfig: {
                    ...conf,
                    status: "ACTIVE"
                }
            }
        })

        return { success: true, message: "L'accès du collaborateur a été réactivé." }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

export async function deleteCollaborator(collaboratorId: string) {
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

        // Si le collaborateur n'a jamais été actif (invité seulement), on peut le supprimer totalement.
        // Sinon, on retire juste son lien avec l'agence.
        if (conf.status === "INVITED") {
             await prisma.user.delete({
                where: { id: collaboratorId }
            })
        } else {
            await (prisma.user as any).update({
                where: { id: collaboratorId },
                data: { 
                    agencyConfig: null,
                    role: "USER" // Reset role or handle accordingly
                }
            })
        }

        return { success: true, message: "Le collaborateur a été retiré de l'équipe." }
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

export async function acceptInvite(token: string, fullName: string) {
    try {
        const matchedUser = await validateInvitationToken(token)

        const conf = (matchedUser as any).agencyConfig
        
        if (conf.status === "ACTIVE") throw new Error("Cette invitation a déjà été acceptée.")

        const newConfig = {
            ...conf,
            status: "ACTIVE",
            inviteToken: null // Invalidates token
        }

        await (prisma.user as any).update({
            where: { id: matchedUser.id },
            data: {
                fullName: fullName,
                lastName: fullName,
                agencyConfig: newConfig,
                status: "ACTIVE"
            }
        })

        // On génère un OTP pour l'auto-connexion immédiate
        const autoLoginOtp = Math.random().toString().slice(2, 8)
        const { redis } = await import("@/lib/redis")
        if (redis) {
            if (typeof redis.setex === 'function') {
                await redis.setex(`otp:${matchedUser.email}`, 300, autoLoginOtp)
            } else {
                await redis.set(`otp:${matchedUser.email}`, autoLoginOtp, 'EX', 300)
            }
        }

        return { success: true, message: "Bienvenue sur QAPRIL. Connexion en cours...", autoLoginOtp }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
