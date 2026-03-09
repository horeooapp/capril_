import { prisma } from "./prisma";

export type USSDSession = {
    sessionId: string;
    phone: string;
    level: number;
    lastMenu?: string;
};

/**
 * Part 18.1: USSD Menu Engine
 */
export async function processUSSDRequest(phone: string, text: string, sessionId: string) {
    const input = text.trim();

    // Check for user existence and load their active leases
    const user = await prisma.user.findFirst({
        where: { phone },
        include: {
            leasesAsTenant: {
                where: { status: 'active' as any },
                include: { receipts: { where: { status: 'pending' } } }
            }
        }
    });

    if (!user) {
        return "CON Bienvenue sur QAPRIL.\nVotre numéro n'est pas reconnu.\nVeuillez vous inscrire sur l'application.";
    }

    // Root Menu
    if (input === "" || input === "0") {
        return "CON QAPRIL Menu:\n1. Payer mon Loyer\n2. Mon Solde\n3. Mes Relances\n4. Quitter";
    }

    switch (input) {
        case "1": {
            const activeLease = user.leasesAsTenant[0];
            if (!activeLease) return "END Vous n'avez aucun bail actif.";
            const pending = activeLease.receipts.length;
            if (pending === 0) return "END Tous vos loyers sont payés. Merci !";
            return `CON Loyer: ${activeLease.rentAmount} FCFA\n${pending} mois impayés.\nConfirmer le paiement ?\n1. Oui\n2. Non`;
        }

        case "2": {
            const totalDue = user.leasesAsTenant.reduce(
                (acc: number, l: { receipts: any[]; rentAmount: number }) => acc + l.receipts.length * l.rentAmount,
                0
            );
            return `END Votre solde total dû est de ${totalDue} FCFA.`;
        }

        case "3": {
            const leaseId = user.leasesAsTenant[0]?.id;
            const procedure = leaseId ? await prisma.procedurePhase.findFirst({
                where: { leaseId },
                orderBy: { actionDate: 'desc' }
            }) : null;
            if (!procedure) return "END Aucune procédure de recouvrement en cours.";
            return `END État actuel: ${procedure.phase}\nDate: ${procedure.actionDate.toLocaleDateString()}`;
        }

        case "4":
            return "END Merci d'avoir utilisé QAPRIL.";

        default:
            return "CON Option invalide.\n1. Menu Principal\n0. Quitter";
    }
}
