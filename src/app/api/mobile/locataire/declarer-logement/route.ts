import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';
import { normalizePhone } from '@/lib/phone';

export async function POST(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Non autorisé. Jeton manquant ou invalide." }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { landlordName, landlordPhone, housingDesc, rent, commune } = body;

        if (!landlordName?.trim()) {
            return NextResponse.json({ error: "Veuillez renseigner le nom de votre bailleur." }, { status: 400 });
        }
        if (!landlordPhone?.trim()) {
            return NextResponse.json({ error: "Veuillez renseigner le numéro de téléphone de votre bailleur." }, { status: 400 });
        }
        if (!housingDesc?.trim()) {
            return NextResponse.json({ error: "Veuillez préciser la description ou l'adresse du logement." }, { status: 400 });
        }
        const rentNum = Math.round(parseFloat(String(rent || '').replace(/\s/g, '')));
        if (isNaN(rentNum) || rentNum <= 0) {
            return NextResponse.json({ error: "Montant du loyer mensuel invalide." }, { status: 400 });
        }

        const normalizedLandlordPhone = normalizePhone(landlordPhone);

        // Récupérer le profil du locataire déclarant
        const tenantUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { id: true, firstName: true, lastName: true, phone: true }
        });

        if (!tenantUser) {
            return NextResponse.json({ error: "Profil locataire introuvable." }, { status: 404 });
        }

        // Trouver ou créer le compte bailleur
        let landlord = await prisma.user.findFirst({
            where: { phone: normalizedLandlordPhone }
        });

        if (!landlord) {
            const nameParts = landlordName.trim().split(' ');
            landlord = await prisma.user.create({
                data: {
                    phone: normalizedLandlordPhone,
                    firstName: nameParts[0] || 'Bailleur',
                    lastName: nameParts.slice(1).join(' ') || '',
                    role: 'LANDLORD',
                    status: 'PENDING_INVITE',
                    onboardingComplete: false,
                }
            });
        }

        // Créer la déclaration de bail (BailDéclaratif)
        const tenantFullName = `${tenantUser.firstName || ''} ${tenantUser.lastName || ''}`.trim() || 'Locataire';
        const tenantPhoneStr = tenantUser.phone || '';

        const bdq = await prisma.bailDeclaratif.create({
            data: {
                bailleurId: landlord.id,
                locataireId: tenantUser.id,
                nomLocataireDeclare: tenantFullName,
                telephoneLocataire: tenantPhoneStr,
                descriptionLogement: housingDesc.trim(),
                adresseLibre: housingDesc.trim(),
                loyerDeclareMensuel: rentNum,
                dateEntreeEstimee: new Date(),
                sourceCreation: 'TENANT_DECLARATION',
                statut: 'PENDING_LOCATAIRE',
                confirmationLocataire: true,
                confirmationAt: new Date(),
                hashDeclaration: `DECL_TENANT_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            }
        });

        return NextResponse.json({
            success: true,
            message: "Votre déclaration de logement a été enregistrée. Elle est en attente de confirmation par votre bailleur.",
            declarationId: bdq.id,
            statut: bdq.statut
        });

    } catch (error: any) {
        console.error("[MOBILE API] locataire/declarer-logement error:", error);
        return NextResponse.json({ error: "Erreur lors de l'enregistrement de la déclaration." }, { status: 500 });
    }
}

