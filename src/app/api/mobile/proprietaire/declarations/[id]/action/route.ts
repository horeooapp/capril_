import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: bdqId } = await params;
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton manquant ou invalide." }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { action, newRent, reason } = body;

        const bdq = await prisma.bailDeclaratif.findUnique({
            where: { id: bdqId },
            include: { locataire: true }
        });

        if (!bdq) {
            return NextResponse.json({ error: "Déclaration introuvable." }, { status: 404 });
        }

        // Vérifier que c'est bien le bailleur concerné
        const currentUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { id: true, phone: true }
        });

        const isOwner = bdq.bailleurId === user.userId || (currentUser?.phone && bdq.telephoneLocataire !== currentUser.phone);
        if (!isOwner && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Vous n'avez pas l'autorisation d'agir sur cette déclaration." }, { status: 403 });
        }

        if (action === 'CONFIRM') {
            // 1. Créer ou associer un bien
            let propertyId = bdq.propertyId;
            if (!propertyId) {
                const propCode = `BIEN-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
                const newProp = await prisma.property.create({
                    data: {
                        propertyCode: propCode,
                        name: bdq.descriptionLogement.slice(0, 50) || 'Logement déclaré',
                        address: bdq.adresseLibre || bdq.descriptionLogement,
                        commune: 'Abidjan',
                        ownerUserId: user.userId,
                        status: 'ACTIVE',
                        propertyType: 'Appartement'
                    }
                });
                propertyId = newProp.id;
            }

            // 2. Créer le bail formel actif
            const year = new Date().getFullYear();
            const randCode = Math.floor(100000 + Math.random() * 900000);
            const leaseRef = `BAIL-${year}-${randCode}`;

            const lease = await prisma.lease.create({
                data: {
                    leaseReference: leaseRef,
                    propertyId: propertyId,
                    landlordId: user.userId,
                    tenantId: bdq.locataireId || user.userId,
                    rentAmount: bdq.loyerDeclareMensuel,
                    chargesAmount: 0,
                    depositAmount: Math.round(bdq.loyerDeclareMensuel * 2),
                    avanceLoyer: Math.round(bdq.loyerDeclareMensuel * 2),
                    startDate: bdq.dateEntreeEstimee || new Date(),
                    durationMonths: 12,
                    leaseType: 'residential',
                    status: 'ACTIVE',
                    modeCreation: 'DECLARATIF'
                }
            });

            // 3. Mettre à jour le bail déclaratif
            await prisma.bailDeclaratif.update({
                where: { id: bdq.id },
                data: {
                    statut: 'CONFIRME',
                    propertyId: propertyId,
                    bailFormelId: lease.id,
                    confirmationAt: new Date(),
                }
            });

            return NextResponse.json({
                success: true,
                message: "Le locataire et le bail ont été confirmés avec succès !",
                leaseId: lease.id
            });

        } else if (action === 'UPDATE_RENT') {
            const rentNum = Math.round(parseFloat(String(newRent || '').replace(/\s/g, '')));
            if (isNaN(rentNum) || rentNum <= 0) {
                return NextResponse.json({ error: "Montant de loyer corrigé invalide." }, { status: 400 });
            }

            await prisma.bailDeclaratif.update({
                where: { id: bdq.id },
                data: {
                    loyerDeclareMensuel: rentNum,
                    contrePropositionLoyer: rentNum,
                }
            });

            return NextResponse.json({
                success: true,
                message: "Le loyer a été ajusté avec succès.",
                loyer: rentNum
            });

        } else if (action === 'REJECT') {
            await prisma.bailDeclaratif.update({
                where: { id: bdq.id },
                data: {
                    statut: 'CONTESTE',
                    motifRefus: reason || "Déclaration rejetée par le propriétaire (je ne connais pas cette personne).",
                }
            });

            return NextResponse.json({
                success: true,
                message: "La déclaration a été rejetée."
            });

        } else {
            return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
        }

    } catch (error: any) {
        console.error("[MOBILE API] proprietaire/declarations/action error:", error);
        return NextResponse.json({ error: "Erreur lors du traitement de la déclaration." }, { status: 500 });
    }
}
