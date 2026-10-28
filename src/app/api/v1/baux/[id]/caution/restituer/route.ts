import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * POST /api/v1/baux/[id]/caution/restituer
 * Consigner / Restituer la caution (CDC).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    if (!user || !['LANDLORD', 'LANDLORD_PRO', 'AGENCY', 'DIASPORA', 'TENANT'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 401 });
    }

    const resolvedParams = await params;
    const leaseId = resolvedParams.id;
    const { motifRetenue, montantRetenue } = await req.json().catch(() => ({}));

    // Find the lease and the Caution
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { 
         caution: true
      }
    });

    if (!lease || lease.landlordId !== user.id) {
      return NextResponse.json({ error: 'Bail introuvable ou vous n\'en êtes pas le propriétaire.' }, { status: 404 });
    }

    if (!lease.caution) {
       // Créons la caution si elle n'existe pas encore en base, bien qu'elle devrait être créée à la signature
       return NextResponse.json({ error: 'Aucun enregistrement de CautionBail lié à ce bail.' }, { status: 404 });
    }

    if (lease.caution.restituee) {
       return NextResponse.json({ error: 'Cette caution a déjà été restituée !' }, { status: 400 });
    }
    
    // Calcul de la somme
    const finalMontantRestitue = Math.max(0, lease.caution.montantFcfa - (montantRetenue || 0));

    // Update
    await prisma.cautionBail.update({
      where: { id: lease.caution.id },
      data: {
        restituee: true,
        restitueAt: new Date(),
        statutRestitution: finalMontantRestitue === lease.caution.montantFcfa ? "RESTITUE" : "RETENU_PARTIEL",
        montantRetenu: montantRetenue || 0,
        motifRetenue,
        montantRestitue: finalMontantRestitue
      }
    });

    // Cautionbails updated directly

    return NextResponse.json({ 
      success: true, 
      message: `La caution a été restituée avec succès (Montant final re-crédité : ${finalMontantRestitue} XOF).` 
    });

  } catch (error: any) {
    console.error('[API CAUTION]', error);
    return NextResponse.json({ error: 'Une erreur technique est survenue.' }, { status: 500 });
  }
}
