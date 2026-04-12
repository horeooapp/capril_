"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getMediationStats() {
    const session = await auth()
    if (!session?.user?.id) return { ongoing: 0, resolved: 0 }

    try {
        const dossiers = await prisma.dossierLitigeCertifie.findMany({
            where: {
                lease: {
                    OR: [
                        { landlordId: session.user.id },
                        { tenantId: session.user.id },
                        { agentId: session.user.id }
                    ]
                }
            }
        });

        const ongoing = dossiers.filter(d => ['GENERE', 'TRANSMIS_CACI', 'MEDIATION_EN_COURS'].includes(d.statut)).length;
        const resolved = dossiers.filter(d => ['CLOTURE', 'ACCORD_AMIABLE', 'SENTENCE_ARBITRALE'].includes(d.statut) || d.issue === 'ACCORD_AMIABLE').length;

        return { ongoing, resolved }
    } catch {
        return { ongoing: 0, resolved: 0 }
    }
}
