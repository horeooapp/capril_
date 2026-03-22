"use server"

import { prisma } from "@/lib/prisma"
import { ProfilInterm } from "@prisma/client"

export async function checkGuardrails(intermediairePhone: string, profil: ProfilInterm) {
    // 1. Trouver l'intermediaire s'il existe
    const intermediaire = await (prisma as any).user.findUnique({
        where: { phone: intermediairePhone },
        include: { propertyRoles: { where: { role: "INTERMEDIAIRE", statut: { in: ["ACTIF", "EN_ATTENTE"] } } } }
    });

    if (!intermediaire) {
        // S'il n'existe pas encore, il a 0 bien, donc OK
        return { success: true };
    }

    // Calculer le nombre de biens actuels et de propriétaires différents
    const accesses = intermediaire.propertyRoles;
    const currentBiensCount = accesses.length;
    
    // Obtenir la liste unique des proprios pour ces biens
    const propertyIds = accesses.map((a: any) => a.propertyId);
    let propriosCount = 0;
    
    if (propertyIds.length > 0) {
        const biens = await prisma.property.findMany({
            where: { id: { in: propertyIds } },
            select: { ownerUserId: true }
        });
        const ownersSet = new Set(biens.map((b: any) => b.ownerUserId));
        propriosCount = ownersSet.size;
    }

    // Définir les limites selon le profil
    let maxProprios = 0;
    let maxBiens = 0;

    switch (profil) {
        case "PARENT_AMI":
            maxProprios = 2;
            maxBiens = 10;
            break;
        case "NOTAIRE":
            maxProprios = 5;
            maxBiens = 25;
            break;
        case "HUISSIER":
        case "AVOCAT":
            // "Illimité" selon mandat
            maxProprios = 999;
            maxBiens = 999;
            break;
    }

    if (currentBiensCount >= maxBiens || propriosCount >= maxProprios) {
        // Enregistrer une alerte garde-fou
        await (prisma as any).gardeFousLog.create({
            data: {
                userId: intermediaire.id,
                typeSignal: "SEUIL_DEPASSE",
                detail: `Profil ${profil}: tentative d'ajout au-delà de ${maxProprios} proprios (actuel ${propriosCount}) ou ${maxBiens} biens (actuel ${currentBiensCount}).`,
                actionPrise: "BLOCAGE"
            }
        });

        return { 
            success: false, 
            error: `L'intermédiaire a atteint les limites de son statut (${maxProprios} propriétaires, ${maxBiens} biens). Il doit s'inscrire comme AGENCE pour gérer plus de biens.` 
        };
    }

    return { success: true };
}
