import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * POST /api/v1/baux/[id]/mrl
 * Proposer une modification de loyer (MRL-01) avec consentement obligatoire.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    // Vérification stricte: Act-01 obligatoire
    if (!user || user.role !== 'LANDLORD') {
      return NextResponse.json({ error: 'Accès refusé. Réservé aux Propriétaires.' }, { status: 401 });
    }

    const { newRentAmount, reason } = await req.json();
    const resolvedParams = await params;
    const leaseId = resolvedParams.id;

    if (!newRentAmount || !reason) {
       return NextResponse.json({ error: 'Nouveau montant et motif obligatoires.' }, { status: 400 });
    }

    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { landlord: true }
    });

    if (!lease || lease.landlordId !== user.id) {
      return NextResponse.json({ error: 'Bail INTROUVABLE ou non autorisé.' }, { status: 404 });
    }

    // Création du ticket MRL-01 en base
    const ticketRef = `MRL-${Date.now().toString().slice(-6)}`;
    await prisma.ticketMaintenance.create({
      data: {
        ticketRef,
        leaseId: lease.id,
        locataireId: lease.tenantId || lease.landlordId, // Locataire cible
        categorie: "MRL-01",
        description: `Modification Loyer. Ancien: ${lease.rentAmount} FCFA -> Nouveau: ${newRentAmount} FCFA. Motif: ${reason}`,
        statut: "EN_ATTENTE",
        urgence: "NORMALE"
      }
    });

    // Optionnel: On pourrait débiter le compte du bailleur ou envoyer le SMS ici.

    return NextResponse.json({ 
      success: true, 
      message: `Votre proposition de modification (MRL-01) a été soumise au locataire. En attente de son consentement explicite.` 
    });

  } catch (error: any) {
    console.error('[API BAUX MRL]', error);
    return NextResponse.json({ error: 'Erreur interne lors de la création de la proposition.' }, { status: 500 });
  }
}
