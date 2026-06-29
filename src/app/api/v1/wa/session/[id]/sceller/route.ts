import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// WAP-07: Scellement, génération et paiement
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const session = await prisma.waSession.findUnique({ where: { id: params.id } });
        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
        
        const champs = JSON.parse((session.champs as string) || "{}");
        const mandatoryFields = ["loyer_mensuel", "duree_bail", "nom_locataire", "date_debut"];
        
        // RG-ADD25-05: Confirmation explicite obligatoire
        for (const field of mandatoryFields) {
            const fData = champs[field];
            if (!fData || (fData.statut !== "CONFIRME" && fData.statut !== "CORRIGE")) {
                return NextResponse.json({ error: `Champ obligatoire non validé: ${field}` }, { status: 400 });
            }
        }
        
        // Création du bail
        // 1. Chercher ou créer un locataire par le numéro WhatsApp
        let tenant = await prisma.user.findFirst({ where: { phone: session.numeroWa } });
        if (!tenant) {
            tenant = await prisma.user.create({
                data: {
                    phone: session.numeroWa,
                    firstName: champs.nom_locataire?.valeur?.split(' ')[0] || "Inconnu",
                    lastName: champs.nom_locataire?.valeur?.split(' ').slice(1).join(' ') || "Inconnu",
                    role: "TENANT"
                }
            });
        }
        
        // 2. Chercher une propriété ou en créer une "fictive" pour accueillir le bail
        let property = await prisma.property.findFirst({
            where: {
                address: { contains: champs.adresse_bien?.valeur || "Inconnu", mode: "insensitive" }
            }
        });
        
        if (!property) {
            // Créer un bailleur par défaut (l'admin ou système) si on ne sait pas à qui appartient ce bien
            const systemUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
            property = await prisma.property.create({
                data: {
                    name: `Propriété - ${champs.adresse_bien?.valeur || "Non identifiée"}`,
                    address: champs.adresse_bien?.valeur || "Adresse non fournie",
                    propertyCode: `WA-PROP-${Math.floor(Math.random() * 9999)}`,
                    ownerUserId: systemUser?.id || tenant.id, // Fallback safe
                    managedByUserId: systemUser?.id || tenant.id
                }
            });
        }
        
        const leaseType = property.type === "COMMERCIAL" ? "commercial" : "residential";

        // 3. Créer le Bail certifié
        const lease = await prisma.lease.create({
            data: {
                leaseReference: `BAIL-WA-${Math.floor(Math.random() * 99999)}`,
                propertyId: property.id,
                landlordId: property.ownerUserId,
                tenantId: tenant.id,
                leaseType: leaseType,
                startDate: new Date(champs.date_debut.valeur),
                durationMonths: Number(champs.duree_bail.valeur) || 12,
                rentAmount: Number(champs.loyer_mensuel.valeur) || 0,
                origineBail: "SCANNE",
                niveauCertification: "NUMERISE_HORODATE",
                statutDgi: "NON_SOUMIS",
                status: "PENDING_SIGNATURE"
            }
        });
        
        // On met à jour l'état de la session
        const updated = await prisma.waSession.update({
            where: { id: params.id },
            data: {
                etat: "PAIEMENT",
                dernierMsgAt: new Date()
            }
        });
        
        // RG-ADD25-11 & RG-ADD25-12
        // Lien CinetPay généré (Ici nous connectons la route réelle pour le locataire s'il se connectait, ou on envoie un lien direct)
        const paymentLink = `https://qapril.net/dashboard/leases/${lease.id}/payment`;
        
        console.log(`[WA OUT] To ${session.numeroWa}: Voici votre lien de paiement pour sceller le bail : ${paymentLink}`);
        
        return NextResponse.json({ status: "OK", paymentLink, leaseId: lease.id, session: updated });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
