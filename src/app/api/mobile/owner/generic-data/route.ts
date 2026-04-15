import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, moduleName } = body;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Token manquant' }, { status: 400 });
        }

        let results: Array<{ id: string, title: string, subtitle: string, status: string, date: string, amount?: number, type: string }> = [];

        switch (moduleName) {
            case 'Mes Baux':
                const leases: any = await prisma.lease.findMany({
                    where: { property: { ownerUserId: token } },
                    include: { property: true, tenant: true },
                    orderBy: { createdAt: 'desc' }
                });
                results = leases.map((l: any) => ({
                    id: l.id,
                    title: `Bail ${l.leaseReference}`,
                    subtitle: `Bien: ${l.property?.name || l.property?.propertyCode} | Locataire: ${l.tenant?.firstName} ${l.tenant?.lastName}`,
                    status: l.status,
                    date: new Date(l.createdAt).toLocaleDateString('fr-FR'),
                    amount: l.rentAmount,
                    type: 'Bail'
                }));
                break;

            case 'Loyers':
                const receipts: any = await prisma.receipt.findMany({
                    where: { lease: { property: { ownerUserId: token } } },
                    include: { lease: { include: { property: true, tenant: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 50
                });
                results = receipts.map((r: any) => ({
                    id: r.id,
                    title: `Quittance ${r.receiptRef}`,
                    subtitle: `Période: ${r.periodMonth} | Locataire: ${r.lease?.tenant?.lastName}`,
                    status: r.status,
                    date: new Date(r.createdAt).toLocaleDateString('fr-FR'),
                    amount: r.totalAmount,
                    type: 'Quittance'
                }));
                break;

            case 'Impayés':
                const arrears: any = await prisma.leaseArrear.findMany({
                    where: { status: 'unpaid', lease: { property: { ownerUserId: token } } },
                    include: { lease: { include: { property: true, tenant: true } } },
                    orderBy: { dueDate: 'asc' }
                });
                results = arrears.map((a: any) => ({
                    id: a.id,
                    title: `Impayé ${a.lease?.property?.name || 'Locatif'}`,
                    subtitle: `Locataire: ${a.lease?.tenant?.firstName} ${a.lease?.tenant?.lastName}`,
                    status: 'À RÉCUPÉRER',
                    date: new Date(a.dueDate).toLocaleDateString('fr-FR'),
                    amount: a.amount,
                    type: 'Alerte'
                }));
                break;

            case 'Mes Mandats':
                const mandats: any = await prisma.mandatGestion.findMany({
                    where: { intermediaireId: token },
                    orderBy: { createdAt: 'desc' }
                });
                results = mandats.map((m: any) => ({
                    id: m.id,
                    title: `Mandat ${m.profil}`,
                    subtitle: `Cession en cours`,
                    status: m.statut,
                    date: new Date(m.dateDebut).toLocaleDateString('fr-FR'),
                    type: 'Mandat'
                }));
                break;

            case 'Documents':
                // Les documents viendront de PropertyDocument plus tard - Mock pour valider TS
                results = [];
                break;

            default:
                // Pour tous les autres modules ("Assistant IA", "Successions", "Matching Locataire", etc.)
                // Plutôt que de renvoyer une erreur, on simule une réponse vide permettant à l'UI
                // de dire chaleureusement "Aucune donnée trouvée pour ce module".
                results = [];
                break;
        }

        return NextResponse.json({ success: true, data: results });

    } catch (e: any) {
        console.error('Erreur API Module Générique:', e);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
