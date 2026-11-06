import os

with open('src/actions/mandate-actions.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        const mandateRef = await generateMandateRef(session.user.id);
        
        const mandate = await prisma.mandate.create({
            data: {
                mandateRef,
                propertyId: input.propertyId,
                agentUserId: session.user.id,
                mandateType: input.mandateType,
                commissionPct: input.commissionPct !== undefined ? input.commissionPct : 8,
                commissionFixed: input.commissionFixed ? Number(input.commissionFixed) : null,
                scope: input.scope && input.scope.length > 0 ? input.scope : [
                    "RECHERCHE_LOCATAIRE",
                    "REDACTION_BAIL",
                    "ENCAISSEMENT_LOYERS",
                    "MAINTENANCE_TRAVAUX",
                    "GESTION_IMPAYES"
                ],
                startDate: new Date(input.startDate),
                endDate: input.endDate ? new Date(input.endDate) : null,
                status: MandateStatus.DRAFT
            }
        });"""

replacement = """        // Vérification de la propriété du bien
        const property = await prisma.property.findUnique({
            where: { id: input.propertyId },
            select: { id: true, ownerUserId: true, address: true }
        });

        if (!property) {
            return { error: "Bien immobilier introuvable." };
        }

        const isOwner = property.ownerUserId === session.user.id;
        const isAdmin = ADMIN_ROLES.includes(userRole);

        // Déterminer l'agence / agent mandataire
        let assignedAgentId: string | null = null;
        if (input.agentId) {
            assignedAgentId = input.agentId;
        } else if (!isOwner) {
            assignedAgentId = session.user.id;
        }

        const mandateRef = await generateMandateRef(assignedAgentId || session.user.id);
        
        const mandate = await prisma.mandate.create({
            data: {
                mandateRef,
                propertyId: input.propertyId,
                agentUserId: assignedAgentId,
                mandateType: input.mandateType,
                commissionPct: input.commissionPct !== undefined ? input.commissionPct : 8,
                commissionFixed: input.commissionFixed ? Number(input.commissionFixed) : null,
                scope: input.scope && input.scope.length > 0 ? input.scope : [
                    "RECHERCHE_LOCATAIRE",
                    "REDACTION_BAIL",
                    "ENCAISSEMENT_LOYERS",
                    "MAINTENANCE_TRAVAUX",
                    "GESTION_IMPAYES"
                ],
                startDate: new Date(input.startDate),
                endDate: input.endDate ? new Date(input.endDate) : null,
                status: MandateStatus.ACTIVE
            }
        });"""

if target in content:
    content = content.replace(target, replacement, 1)
    print("createMandate target replaced")
else:
    print("Warning: target not found!")

# Add revalidation for /dashboard/biens-sous-mandat
old_reval = "revalidatePath(`/dashboard/mandates`);"
new_reval = """revalidatePath(`/dashboard/mandates`);
        revalidatePath(`/dashboard/biens-sous-mandat`);"""
content = content.replace(old_reval, new_reval)

# Add getAvailableAgencies if not present
if "getAvailableAgencies" not in content:
    content += """

/**
 * Récupère les agences immobilières et intermédiaires certifiés disponibles pour mandat
 */
export async function getAvailableAgencies() {
    try {
        const agencies = await prisma.user.findMany({
            where: {
                OR: [
                    { role: Role.AGENCY },
                    { role: Role.NON_CERTIFIED_AGENT }
                ]
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                companyRegNumber: true,
                isCertified: true,
                legalEntity: {
                    select: {
                        companyName: true
                    }
                }
            },
            take: 50,
            orderBy: { createdAt: "desc" }
        });

        return { success: true, agencies };
    } catch (error) {
        console.error("Erreur getAvailableAgencies:", error);
        return { success: false, agencies: [] };
    }
}
"""
    print("getAvailableAgencies added")

with open('src/actions/mandate-actions.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch complete!")
