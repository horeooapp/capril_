"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import crypto from 'crypto'

export async function createDisputeDLC(formData: FormData) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { error: "Non autorisé" }
        }

        const leaseId = formData.get("leaseId") as string
        const type = formData.get("type") as string
        const isCryptoSealed = formData.get("isCryptoSealed") === "on"

        if (!leaseId || !type) {
            return { error: "Données manquantes" }
        }

        // Generate CACI Hash if sealed
        let hash = null
        if (isCryptoSealed) {
            hash = crypto.createHash('sha256').update(`${leaseId}-${type}-${Date.now()}`).digest('hex').substring(0, 16)
        }

        const dispute = await prisma.dispute.create({
            data: {
                leaseId,
                title: "Dossier Litige Certifié (DLC)",
                description: "Dossier instancié via l'orchestrateur CACI (V5)",
                type,
                severity: "CRITIQUE",
                hash,
                isCryptoSealed,
            }
        })

        const lease = await prisma.lease.findUnique({
             where: { id: leaseId },
             include: { tenant: true, property: true }
        });

        if (lease?.tenant?.email) {
             const { sendEmail, wrapInPremiumTemplate } = await import("@/lib/email");
             await sendEmail({
                  to: lease.tenant.email,
                  subject: "MISE EN DEMEURE - Chambre d'Arbitrage (CACI)",
                  html: wrapInPremiumTemplate(`
                       <h3 style="color: #e11d48;">AVERTISSEMENT LÉGAL</h3>
                       <p>Cher(e) locataire,</p>
                       <p>Un Dossier Litige Certifié (DLC) a été scellé à l'encontre de votre contrat de bail (Réf: ${lease.leaseReference}) concernant le bien situé à : ${lease.property?.address}.</p>
                       <p><strong>Motif de l'infraction :</strong> ${type}</p>
                       ${isCryptoSealed ? `<p>Ce dossier est scellé cryptographiquement (Certificat SHA-256 : <strong>${hash}</strong>). Cette empreinte est désormais opposable devant la juridiction de commerce (CACI).</p>` : ''}
                       <p>Nous vous intimons l'ordre de régulariser la situation sous 8 jours, faute de quoi des procédures d'expulsion (Eviction Prononcée) seront exécutoires.</p>
                       <br/>
                       <p><em>Le Tribunal d'Arbitrage</em></p>
                  `, "Dossier Litige Certifié (DLC) Ouvert")
             });
        }

        revalidatePath("/dashboard/disputes")
        return { success: true, disputeId: dispute.id, hash }
    } catch (e) {
        console.error(e)
        return { error: "Erreur lors de la création du dossier contentieux" }
    }
}

export async function getAgencyDisputes() {
    const session = await auth()
    if (!session?.user?.id) return []

    const disputes = await prisma.dispute.findMany({
        where: {
            lease: {
                OR: [
                    { landlordId: session.user.id },
                    { agentId: session.user.id }
                ]
            }
        },
        include: {
            lease: {
                include: {
                    tenant: true,
                    property: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return disputes
}
