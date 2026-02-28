import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Types pour l'API USSD générique (inspiré des standards de paiement/télécom africains)
interface UssdRequest {
    sessionId: string;
    serviceCode: string;
    phoneNumber: string;
    text: string;
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as UssdRequest;
        const { sessionId, phoneNumber, text } = body;

        // "text" contient les entrées de l'utilisateur séparées par des astérisques '*'
        // Ex: "" (vide au lancement), "1" (choix 1), "1*12345" (choix 1 puis saisie 12345)
        const args = text.split('*').filter(t => t.length > 0);
        const level = args.length;

        let responseText = "";
        let isFinal = false; // "CON" = Continue, "END" = Terminer (standard USSD)

        // 1. RECHERCHE DE L'UTILISATEUR PAR NUMÉRO DE TÉLÉPHONE
        // Formatage basique (ex: +225...)
        const cleanPhone = phoneNumber.replace('+', '');

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: phoneNumber },
                    { phone: `+${cleanPhone}` },
                    { phone: cleanPhone }
                ]
            }
        });

        if (!user) {
            return new NextResponse("END Compte introuvable. Veuillez vous inscrire sur qapril.ci", {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // 2. LOGIQUE DU MENU USSD
        if (level === 0) {
            // Menu Principal
            responseText = `CON Bienvenue sur QAPRIL, ${user.name || 'Cher client'}
1. Mes dernieres quittances
2. Verifier une quittance
3. Mon profil`;
        } else if (level === 1) {
            const firstChoice = args[0];

            if (firstChoice === "1") {
                // Option 1 : Récupérer les dernières quittances (si locataire)
                const leases = await prisma.lease.findMany({
                    where: { tenantId: user.id },
                    include: {
                        receipts: {
                            orderBy: { paymentDate: 'desc' },
                            take: 3
                        },
                        property: { select: { address: true } }
                    }
                });

                if (leases.length === 0) {
                    responseText = "END Vous n'avez aucun contrat de bail actif sur QAPRIL.";
                    isFinal = true;
                } else {
                    const allReceipts = leases.flatMap(l => l.receipts).sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime()).slice(0, 3);

                    if (allReceipts.length === 0) {
                        responseText = "END Aucune quittance generee pour le moment.";
                        isFinal = true;
                    } else {
                        responseText = "END Vos dernieres quittances:\n" +
                            allReceipts.map((r, i) => `${i + 1}. ${r.receiptNumber} - ${r.amountPaid}F (${new Date(r.periodStart).toLocaleDateString()})`).join('\n');
                        isFinal = true;
                    }
                }
            } else if (firstChoice === "2") {
                // Option 2 : Vérifier une quittance
                responseText = "CON Veuillez saisir les 6 derniers caracteres du numero de quittance (ex: Q-2024-001234 -> 001234) :";
            } else if (firstChoice === "3") {
                // Option 3 : Profil
                responseText = `END Profil QAPRIL
Tel: ${user.phone}
Role: ${user.role}
Inscrit le: ${user.createdAt.toLocaleDateString()}`;
                isFinal = true;
            } else {
                responseText = "END Choix invalide. Au revoir.";
                isFinal = true;
            }

        } else if (level === 2) {
            const firstChoice = args[0];
            const secondChoice = args[1];

            if (firstChoice === "2") {
                // Résultat de la vérification de quittance
                const searchStr = secondChoice.toUpperCase();
                // Recherche partielle sur le numéro de quittance
                const receipt = await prisma.receipt.findFirst({
                    where: {
                        receiptNumber: {
                            endsWith: searchStr
                        }
                    },
                    include: {
                        lease: {
                            include: { property: true }
                        }
                    }
                });

                if (receipt) {
                    responseText = `END Quittance AUTHENTIQUE
No: ${receipt.receiptNumber}
Loyer: ${receipt.amountPaid} FCFA
Date: ${new Date(receipt.paymentDate).toLocaleDateString()}`;
                } else {
                    responseText = "END Quittance INTROUVABLE ou fausse. Attention a la fraude.";
                }
                isFinal = true;
            } else {
                responseText = "END Erreur de navigation.";
                isFinal = true;
            }
        } else {
            responseText = "END Erreur session.";
            isFinal = true;
        }

        // Format de réponse spécifique USSD (préfixe)
        const finalResponse = responseText;

        return new NextResponse(finalResponse, {
            status: 200,
            headers: {
                // Certains opérateurs demandent simplement un text/plain commençant par CON ou END
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-store, max-age=0'
            }
        });

    } catch (error) {
        console.error("Erreur USSD:", error);
        return new NextResponse("END Une erreur est survenue sur la plateforme QAPRIL.", {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}
