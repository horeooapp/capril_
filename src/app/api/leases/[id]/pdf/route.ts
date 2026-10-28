import { prisma } from '@/lib/prisma';
import { generateLeasePDF } from '@/lib/pdf-generator';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: leaseId } = await params;
        const session = await auth();

        // 1. Tenter la recherche sur le modèle Lease (Bail écrit / standard)
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: {
                property: true,
                landlord: true,
                tenant: true
            }
        });

        // 2. Fallback : Bail Déclaratif (BDQ)
        if (!lease) {
            const bdq = await prisma.bailDeclaratif.findUnique({
                where: { id: leaseId },
                include: {
                    property: true,
                    bailleur: true,
                    locataire: true
                }
            });

            if (bdq) {
                // Vérification droits d'accès
                const userId = session?.user?.id;
                if (userId && bdq.bailleurId !== userId && bdq.locataireId !== userId) {
                    // Si l'utilisateur est connecté et n'est ni bailleur ni locataire ni admin
                    const userRole = (session?.user as any)?.role;
                    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
                        return new Response("Accès non autorisé à ce contrat", { status: 403 });
                    }
                }

                const pdfBuffer = await generateLeasePDF({
                    leaseRef: `BDQ-${bdq.id.substring(0, 8)}`,
                    landlord: bdq.bailleur || {
                        firstName: "Bailleur",
                        lastName: "",
                        phone: "",
                        email: ""
                    },
                    tenant: bdq.locataire || {
                        firstName: bdq.prenomLocataireDeclare || "",
                        lastName: bdq.nomLocataireDeclare || bdq.telephoneLocataire,
                        fullName: `${bdq.prenomLocataireDeclare ? bdq.prenomLocataireDeclare + ' ' : ''}${bdq.nomLocataireDeclare || ''}`.trim() || bdq.telephoneLocataire,
                        phone: bdq.telephoneLocataire,
                        email: ""
                    },
                    property: bdq.property || {
                        name: bdq.descriptionLogement,
                        address: bdq.adresseLibre || bdq.descriptionLogement,
                        commune: "Abidjan"
                    },
                    rentAmount: Number(bdq.loyerDeclareMensuel) || 0,
                    depositAmount: 0,
                    avanceAmount: 0,
                    startDate: bdq.dateEntreeEstimee || bdq.createdAt,
                    durationMonths: 0,
                    paymentDay: 5,
                    signedAt: bdq.confirmationAt || undefined,
                    qrToken: `BDQ-${bdq.id.substring(0, 8)}`,
                    sha256Hash: bdq.hashDeclaration || undefined
                });

                return new NextResponse(pdfBuffer as any, {
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `inline; filename="Bail_BDQ_${bdq.id.substring(0, 8)}.pdf"`
                    }
                });
            }

            return new Response("Contrat de bail introuvable", { status: 404 });
        }

        // Vérification d'accès pour Lease classique
        const userId = session?.user?.id;
        if (userId) {
            const isOwner = lease.property?.ownerUserId === userId || lease.landlordId === userId;
            const isManager = lease.property?.managedByUserId === userId;
            const isTenant = lease.tenantId === userId;
            const userRole = (session?.user as any)?.role;
            const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(userRole);

            if (!isOwner && !isManager && !isTenant && !isAdmin) {
                return new Response("Accès non autorisé à ce contrat", { status: 403 });
            }
        }

        const pdfBuffer = await generateLeasePDF({
            leaseRef: lease.leaseReference || `BAIL-${lease.id.substring(0, 8)}`,
            landlord: lease.landlord || {
                firstName: "Bailleur",
                lastName: "",
                phone: "",
                email: ""
            },
            tenant: lease.tenant || {
                firstName: "Locataire",
                lastName: "",
                phone: "",
                email: ""
            },
            property: lease.property || {
                name: "Logement QAPRIL",
                address: "Abidjan, Côte d'Ivoire"
            },
            rentAmount: Number(lease.rentAmount) || 0,
            depositAmount: Number(lease.depositAmount) || 0,
            avanceAmount: Number(lease.avanceLoyer) || 0,
            startDate: lease.startDate || new Date(),
            durationMonths: lease.durationMonths || 12,
            paymentDay: lease.paymentDay || 5,
            signedAt: lease.signedAt || undefined,
            qrToken: lease.leaseReference || lease.id,
            sha256Hash: lease.sha256Hash || undefined
        });

        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="Bail_${lease.leaseReference || lease.id.substring(0, 8)}.pdf"`
            }
        });

    } catch (error: any) {
        console.error("Error generating lease PDF:", error);
        return new Response("Erreur lors de la génération du contrat PDF", { status: 500 });
    }
}
