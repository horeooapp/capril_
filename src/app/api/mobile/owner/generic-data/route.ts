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

            case 'Matching Locataire':
                const candidatures: any = await prisma.candidature.findMany({
                    orderBy: { createdAt: 'desc' }
                });
                results = candidatures.map((c: any) => ({
                    id: c.id,
                    title: `Candidature ${c.nom} ${c.prenom}`,
                    subtitle: `Score Qapril: ${c.scoreQapril || 'En attente'}`,
                    status: c.statut,
                    date: new Date(c.createdAt).toLocaleDateString('fr-FR'),
                    type: 'Matching'
                }));
                break;

            case 'Agenda & Visites':
                const visites: any = await prisma.agendaEvenement.findMany();
                results = visites.map((v: any) => ({
                    id: v.id,
                    title: v.titre,
                    subtitle: `Type: ${v.typeEvent}`,
                    status: 'PLANIFIÉ',
                    date: 'N/A',
                    type: 'Visite'
                }));
                break;

            case 'Syndic':
                const syndicates: any = await prisma.syndicate.findMany();
                results = syndicates.map((s: any) => ({
                    id: s.id,
                    title: s.residenceName,
                    subtitle: `${s.totalLots} Lots gérés`,
                    status: s.agState,
                    date: new Date(s.createdAt).toLocaleDateString('fr-FR'),
                    amount: s.treasuryBalance,
                    type: 'Syndic'
                }));
                break;

            case 'Successions':
                const successions: any = await prisma.succession.findMany();
                results = successions.map((s: any) => ({
                    id: s.id,
                    title: `Succession ${s.deceasedName}`,
                    subtitle: `Revendiquant: ${s.claimantName}`,
                    status: s.status,
                    date: new Date(s.createdAt).toLocaleDateString('fr-FR'),
                    type: 'Succession'
                }));
                break;

            case 'Rapports':
                const rapports: any = await prisma.financialReport.findMany();
                results = rapports.map((r: any) => ({
                    id: r.id,
                    title: `CRG ${r.ownerName}`,
                    subtitle: `Période: ${r.period}`,
                    status: r.status,
                    date: new Date(r.createdAt).toLocaleDateString('fr-FR'),
                    amount: r.netPayout,
                    type: 'Rapport'
                }));
                break;

            case 'Régulation des Charges':
                const regules: any = await prisma.regularisationCharges.findMany();
                results = regules.map((r: any) => ({
                    id: r.id,
                    title: `Régularisation ${r.annee}`,
                    subtitle: `Bail lié: ${r.leaseId}`,
                    status: r.statut,
                    date: r.notifieAt ? new Date(r.notifieAt).toLocaleDateString('fr-FR') : 'Non notifié',
                    amount: r.solde,
                    type: 'Régul'
                }));
                break;

            case 'Automatisations':
                const automations: any = await prisma.automationSettings.findMany({
                    where: { userId: token }
                });
                results = automations.map((a: any) => ({
                    id: a.id,
                    title: `Profil Automatisé`,
                    subtitle: `Relance: ${a.autoRelance ? 'Oui' : 'Non'} | Quittances: ${a.autoQuittance ? 'Oui' : 'Non'}`,
                    status: 'ACTIF',
                    date: new Date(a.updatedAt).toLocaleDateString('fr-FR'),
                    type: 'Script'
                }));
                break;

            default:
                // Pour les 3 ou 4 modules finaux n'ayant PAS encore de table Prisma (Assistant IA, Indice ICL, Manuel Officiel, Assurances).
                results = [];
                break;
        }

        return NextResponse.json({ success: true, data: results });

    } catch (e: any) {
        console.error('Erreur API Module Générique:', e);
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
