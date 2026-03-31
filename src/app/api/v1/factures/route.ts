import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * POST /api/v1/factures
 * Ajouter une facture CIE/SODECI adressée au locataire.
 * Faute de table "UtilityBill" spécifique, nous traquons cela via les Tickets (V2).
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    // Peut être créé par le Bailleur (LANDLORD) ou l'Agence.
    if (!user || !['LANDLORD', 'CERTIFIED_AGENCY', 'NON_CERTIFIED_AGENCY', 'INTERMEDIARY'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
    }

    const body = await req.json();
    const { leaseId, fournisseur, montant, periode, deadline } = body;

    if (!leaseId || !fournisseur || !montant) {
       return NextResponse.json({ error: 'LeaseId, Fournisseur, et Montant sont obligatoires.' }, { status: 400 });
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { 
          locataire: true
      }
    });

    if (!lease) {
      return NextResponse.json({ error: 'Bail INTROUVABLE.' }, { status: 404 });
    }

    // Création d'un ticket pour la facture CIE/SODECI (Suivi rigoureux)
    const ticketRef = `FAC-${fournisseur.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`;
    const description = `Facture ${fournisseur} de ${montant} FCFA pour la période ${periode || 'en cours'}. Date limite: ${deadline || 'N/A'}`;

    const factureTicket = await prisma.ticketMaintenance.create({
      data: {
        ticketRef,
        leaseId: lease.id,
        locataireId: lease.locataireId || lease.landlordId, // Le locataire est le débiteur
        categorie: "FACTURE_UTILITY",
        description,
        statut: "EN_ATTENTE", // Devient "Cloturé" quand le locataire paie
        urgence: "URGENTE", // URGENT pour éviter les coupures
        coutFinal: parseFloat(montant)
      }
    });

    // Envoyer Notif
    if (lease.locataireId) {
        await prisma.notification.create({
            data: {
                userId: lease.locataireId,
                type: 'BILL',
                title: `Nouvelle Facture ${fournisseur}`,
                message: description,
                data: JSON.stringify({ ticketId: factureTicket.id, amount: montant }),
                isRead: false
            }
        });
    }

    return NextResponse.json({ 
      success: true, 
      message: `La facture ${fournisseur} (${montant} FCFA) a été soumise au locataire avec succès.` 
    });

  } catch (error: any) {
    console.error('[API FACTURES]', error);
    return NextResponse.json({ error: 'Erreur interne lors de la création de la facture' }, { status: 500 });
  }
}
