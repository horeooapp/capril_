import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { BdqStatut, TypeBail, LeaseStatus, Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { generateProofHash } from "@/lib/proof"
import { sendSMS } from "@/lib/sms"
import { Decimal } from "@prisma/client/runtime/library"

export type CreateBdqInput = {
    propertyId?: string
    nomLocataire: string
    prenomLocataire?: string
    telephoneLocataire: string
    descriptionLogement: string
    adresseLibre?: string
    loyerMensuel: number
    dateEntree?: Date
}

/**
 * BDQ-01: Créer un Bail Déclaratif (BDQ)
 * Situation A/B/C/D Start
 */
export async function createBDQ(data: CreateBdqInput) {
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
        throw new Error("Authentification requise.")
    }
    const bailleurId = session.user.id

    try {
        // 1. Check for existing active lease on property
        if (data.propertyId) {
            const activeLease = await prisma.lease.findFirst({
                where: {
                    propertyId: data.propertyId,
                    status: { notIn: [LeaseStatus.TERMINATED, LeaseStatus.CANCELLED, LeaseStatus.ARCHIVED] }
                }
            })
            if (activeLease) throw new Error("Ce logement a déjà un bail actif.")
        }

        // 2. Generate initial hash for proof
        const declarationData = {
            bailleurId: bailleurId,
            nom: data.nomLocataire,
            tel: data.telephoneLocataire,
            loyer: data.loyerMensuel,
            date: new Date().toISOString()
        }
        const hash = generateProofHash(declarationData)

        // 3. Create BDQ record
        const bdq = await prisma.bailDeclaratif.create({
            data: {
                bailleurId: bailleurId,
                propertyId: data.propertyId,
                nomLocataireDeclare: data.nomLocataire,
                prenomLocataireDeclare: data.prenomLocataire,
                telephoneLocataire: data.telephoneLocataire,
                descriptionLogement: data.descriptionLogement,
                adresseLibre: data.adresseLibre,
                loyerDeclareMensuel: new Decimal(data.loyerMensuel),
                dateEntreeEstimee: data.dateEntree,
                statut: BdqStatut.PENDING_LOCATAIRE,
                hashDeclaration: hash,
            }
        })

        // 4. Send Initial SMS (Situation A)
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const message = `QAPRIL : Votre bailleur déclare que vous occupez ${data.descriptionLogement} au loyer de ${data.loyerMensuel} FCFA/mois. Confirmez-vous ? Répondez OUI ou NON avec le code ${otp}.`
        
        await sendSMS(data.telephoneLocataire, message)

        // 5. Log SMS
        await prisma.bdqSmsLog.create({
            data: {
                bdqId: bdq.id,
                typeSms: "CONFIRMATION_INITIALE",
                destinataire: data.telephoneLocataire,
                roleDest: "LOCATAIRE",
                contenu: message,
                statutEnvoi: "ENVOYE"
            }
        })

        revalidatePath("/dashboard/leases")
        return { success: true, bdqId: bdq.id }

    } catch (error: any) {
        console.error("[BDQ_CREATE_ERROR]", error)
        return { error: error.message || "Une erreur est survenue lors de la création du BDQ." }
    }
}

/**
 * BDQ-03: Confirmer un BDQ (Locataire)
 */
export async function confirmBDQ(bdqId: string, otp: string, reponse: "OUI" | "NON", motif?: string) {
    try {
        const bdq = await prisma.bailDeclaratif.findUnique({
            where: { id: bdqId },
            include: { bailleur: true }
        })

        if (!bdq) throw new Error("BDQ introuvable.")
        if (bdq.statut !== BdqStatut.PENDING_LOCATAIRE) throw new Error("Ce BDQ n'est plus en attente de confirmation.")

        // Mock OTP verification (In real case, check against DB or Redis)
        if (otp === "000000") throw new Error("OTP Invalide.") // Test case

        if (reponse === "NON") {
            await prisma.bailDeclaratif.update({
                where: { id: bdqId },
                data: {
                    statut: BdqStatut.CONTESTE,
                    confirmationLocataire: false,
                    motifRefus: motif,
                    confirmationAt: new Date()
                }
            })
            // TODO: Trigger M11 Mediation
            return { success: true, status: "CONTESTE" }
        }

        // Success: CONFIRME
        const finalHash = generateProofHash({ ...bdq, confirmedAt: new Date().toISOString() })
        const qrToken = `QAPRIL-BDQ-${bdq.id.substring(0, 8).toUpperCase()}`

        // Identify Tenant
        let tenant = await prisma.user.findUnique({ where: { phone: bdq.telephoneLocataire } })
        if (!tenant) {
            tenant = await prisma.user.create({
                data: { phone: bdq.telephoneLocataire, fullName: bdq.nomLocataireDeclare, role: Role.TENANT, status: 'pending' }
            })
        }

        // Create formal Lease link if possible
        let leaseEntryId = null
        if (bdq.propertyId) {
            const newLease = await prisma.lease.create({
                data: {
                    leaseReference: `BDQ-${bdq.id.substring(0, 8).toUpperCase()}`,
                    propertyId: bdq.propertyId,
                    landlordId: bdq.bailleurId,
                    tenantId: tenant.id,
                    startDate: bdq.dateEntreeEstimee || new Date(),
                    rentAmount: Number(bdq.loyerDeclareMensuel),
                    durationMonths: 12,
                    status: LeaseStatus.ACTIVE_DECLARATIF,
                    typeBail: TypeBail.DECLARATIF_BDQ,
                    confirmationLocataireSms: true,
                    confirmationLocataireAt: new Date(),
                }
            })
            leaseEntryId = newLease.id
        }

        await prisma.bailDeclaratif.update({
            where: { id: bdqId },
            data: {
                statut: BdqStatut.CONFIRME,
                confirmationLocataire: true,
                confirmationAt: new Date(),
                hashBdqFinal: finalHash,
                qrToken: qrToken,
                bailFormelId: leaseEntryId
            }
        })

        // Notify Landlord
        await sendSMS(bdq.bailleur.phone, `QAPRIL ✓ Votre locataire ${bdq.nomLocataireDeclare} a confirmé la situation locative. Bail BDQ actif.`)

        revalidatePath("/dashboard/leases")
        return { success: true, status: "CONFIRME" }

    } catch (error: any) {
        console.error("[BDQ_CONFIRM_ERROR]", error)
        return { error: error.message || "Erreur lors de la confirmation." }
    }
}

/**
 * BDQ-04: Confirmation par Agent (Situation C)
 */
export async function confirmBDQByAgent(bdqId: string, agentId: string, gps?: string) {
    try {
        const bdq = await prisma.bailDeclaratif.findUnique({ where: { id: bdqId } })
        if (!bdq) throw new Error("BDQ introuvable.")

        await prisma.bailDeclaratif.update({
            where: { id: bdqId },
            data: {
                statut: BdqStatut.CONFIRME_AGENT,
                agentConfirmantId: agentId,
                confirmationAgentAt: new Date(),
                agentConfirmationMode: "PRESENCE_PHYSIQUE",
                // GPS can be stored in metadata or property
            }
        })

        revalidatePath("/dashboard/leases")
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

/**
 * BDQ-07: Relancer le SMS de confirmation
 */
export async function relancerBDQ(bdqId: string) {
    try {
        const bdq = await prisma.bailDeclaratif.findUnique({
            where: { id: bdqId },
            include: { smsLogs: true }
        })

        if (!bdq) throw new Error("BDQ introuvable.")
        const relanceCount = bdq.smsLogs.filter((l: any) => l.typeSms === "RAPPEL").length
        
        if (relanceCount >= 3) {
            await prisma.bailDeclaratif.update({
                where: { id: bdqId },
                data: { statut: BdqStatut.DECLARATIF_SANS_REPONSE }
            })
            throw new Error("Maximum de relances atteint. Statut passé en DECLARATIF_SANS_REPONSE.")
        }

        const otp = "000000" // Should regenerate or retrieve
        const message = `QAPRIL : Rappel — votre logement ${bdq.descriptionLogement} attend confirmation. Répondez OUI ou NON avec le code ${otp}.`
        
        await sendSMS(bdq.telephoneLocataire, message)
        
        await prisma.bdqSmsLog.create({
            data: {
                bdqId: bdq.id,
                typeSms: "RAPPEL",
                destinataire: bdq.telephoneLocataire,
                roleDest: "LOCATAIRE",
                contenu: message
            }
        })

        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

/**
 * BDQ-08: Modifier le loyer déclaré
 */
export async function updateBDQRent(bdqId: string, nouveauLoyer: number, motif: string, effectiveLe: Date) {
    try {
        const bdq = await prisma.bailDeclaratif.findUnique({ where: { id: bdqId } })
        if (!bdq) throw new Error("BDQ introuvable.")

        const hashMod = generateProofHash({ bdqId, nouveauLoyer, date: new Date().toISOString() })

        await prisma.$transaction([
            prisma.bdqHistoriqueLoyer.create({
                data: {
                    bdqId: bdq.id,
                    ancienLoyer: bdq.loyerDeclareMensuel,
                    nouveauLoyer: new Decimal(nouveauLoyer),
                    motif: motif,
                    effectiveLe: effectiveLe,
                    hashModification: hashMod
                }
            }),
            prisma.bailDeclaratif.update({
                where: { id: bdqId },
                data: {
                    loyerDeclareMensuel: new Decimal(nouveauLoyer),
                    statut: BdqStatut.PENDING_LOCATAIRE // Reset to pending for confirmation of new rent
                }
            })
        ])

        // Send SMS for new rent confirmation
        const message = `QAPRIL : Votre loyer pour ${bdq.descriptionLogement} passe à ${nouveauLoyer} FCFA le ${effectiveLe.toLocaleDateString()}. Confirmez-vous ? Répondez OUI/NON.`
        await sendSMS(bdq.telephoneLocataire, message)

        revalidatePath("/dashboard/leases")
        return { success: true }
    } catch (error: any) {
        return { error: error.message }
    }
}

/**
 * BDQ-09: Formaliser en bail M-SIGN
 */
export async function formalizeBDQ(bdqId: string) {
    try {
        const bdq = await prisma.bailDeclaratif.findUnique({ 
            where: { id: bdqId },
            include: { property: true }
        })
        if (!bdq || !bdq.confirmationLocataire) throw new Error("Seul un BDQ confirmé peut être formalisé.")

        // Logic handled in a separate 'createLease' call normally, 
        // but here we mark it as FORMALISE.
        await prisma.bailDeclaratif.update({
            where: { id: bdqId },
            data: { statut: BdqStatut.FORMALISE }
        })

        return { success: true, redirect: "/dashboard/leases/new" } // Pre-fill flow
    } catch (error: any) {
        return { error: error.message }
    }
}

/**
 * BDQ-06: Vérification publique
 */
export async function getBDQByToken(token: string) {
    return prisma.bailDeclaratif.findUnique({
        where: { qrToken: token },
        select: {
            nomLocataireDeclare: true,
            descriptionLogement: true,
            loyerDeclareMensuel: true,
            dateEntreeEstimee: true,
            statut: true,
            confirmationAt: true,
            hashBdqFinal: true,
            bailleur: { select: { fullName: true } }
        }
    })
}
