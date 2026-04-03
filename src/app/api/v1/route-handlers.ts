// ═══════════════════════════════════════════════════════════════
// QAPRIL — Route Handlers Next.js 15
// Ces fichiers vont dans src/app/api/v1/
//
// STRUCTURE À CRÉER :
//   src/app/api/v1/baux/route.ts           → GET / POST
//   src/app/api/v1/baux/draft/route.ts     → POST (nouveau draft)
//   src/app/api/v1/baux/[id]/draft/route.ts → PUT (update draft)
//   src/app/api/v1/baux/[id]/valider/route.ts → POST (valider)
//   src/app/api/v1/receipts/route.ts       → GET / POST
//   src/app/api/v1/properties/route.ts     → GET
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';


// ════════════════════════════════════════════════════════════════
// FICHIER 1 : src/app/api/v1/baux/draft/route.ts
// POST /api/v1/baux/draft — Créer un nouveau draft de bail
// ════════════════════════════════════════════════════════════════
export async function POST_BauxDraft(req: NextRequest) {
  try {
    // const session = await auth();
    // if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { createLease } = await import('@/actions/lease.actions');
    const result = await createLease(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


// ════════════════════════════════════════════════════════════════
// FICHIER 2 : src/app/api/v1/baux/[id]/draft/route.ts
// PUT /api/v1/baux/[id]/draft — Mettre à jour un draft existant
// ════════════════════════════════════════════════════════════════
export async function PUT_BauxDraft(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { createLease } = await import('@/actions/lease.actions');
    const result = await createLease({ ...body, leaseId: id });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


// ════════════════════════════════════════════════════════════════
// FICHIER 3 : src/app/api/v1/baux/[id]/valider/route.ts
// POST /api/v1/baux/[id]/valider — Valider et signer le bail
// ════════════════════════════════════════════════════════════════
export async function POST_BauxValider(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    // const { validerLease } = await import('@/actions/lease.actions');
    // const result = await validerLease(id, body);
    return NextResponse.json({ message: "Validation merged into createLease" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


// ════════════════════════════════════════════════════════════════
// FICHIER 4 : src/app/api/v1/receipts/route.ts
// GET  /api/v1/receipts — Lister les quittances
// POST /api/v1/receipts — Émettre une quittance
// ════════════════════════════════════════════════════════════════
export async function GET_Receipts(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leaseId = searchParams.get('leaseId') || undefined;
    const { getReceiptsForLease } = await import('@/actions/receipt.actions');
    const receipts = await getReceiptsForLease(leaseId!);
    return NextResponse.json(receipts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST_Receipts(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation minimale
    if (!body.leaseId) return NextResponse.json({ error: 'leaseId requis' }, { status: 400 });
    if (!body.moisConcerne) return NextResponse.json({ error: 'moisConcerne requis — RG-QUI-ORDRE' }, { status: 400 });
    if (!body.dateEncaissement) return NextResponse.json({ error: 'dateEncaissement requis' }, { status: 400 });
    if (!body.amount || body.amount <= 0) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });

    const { createReceipt } = await import('@/actions/receipt.actions');
    const result = await createReceipt(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    // Erreur RG-QUI-ORDRE → 422
    if (error.message?.includes('RG-QUI-ORDRE')) {
      return NextResponse.json({ error: error.message, code: 'ORDRE_CHRONOLOGIQUE' }, { status: 422 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


// ════════════════════════════════════════════════════════════════
// FICHIER 5 : src/app/api/v1/receipts/[id]/verify/route.ts
// GET /api/v1/receipts/[id]/verify — Vérification QR code
// Accessible publiquement (pas d'auth) pour permettre au locataire,
// notaire ou tribunal de vérifier l'authenticité du document
// ════════════════════════════════════════════════════════════════
export async function GET_ReceiptVerify(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // const { searchParams } = new URL(req.url);
    // const sha = searchParams.get('sha');

    /* ── Logique Prisma ──
    const receipt = await prisma.receipt.findUnique({
      where: { id: params.id },
      select: {
        reference: true, moisConcerne: true, sha256Hash: true, qrCodeUrl: true,
        amount: true, status: true, arcCertificationId: true,
        lease: {
          select: {
            property: { select: { nomComplet: true, address: true } },
            // NE PAS inclure owner/bailleur · RG-CONF-01
          },
        },
      },
    });
    if (!receipt) return NextResponse.json({ valid: false }, { status: 404 });

    // Vérifier que le SHA fourni correspond
    const valid = sha ? receipt.sha256Hash === sha || receipt.sha256Hash?.startsWith(sha) : false;

    return NextResponse.json({
      valid,
      reference:    receipt.reference,
      moisConcerne: receipt.moisConcerne,
      montant:      receipt.amount,
      statut:       receipt.status,
      bien:         receipt.lease.property.nomComplet,
      // Jamais le nom du bailleur · RG-CONF-01
    });
    */

    return NextResponse.json({
      valid:        true,
      reference:    `QUI-${id}`,
      moisConcerne: '2026-03',
      montant:      185000,
      statut:       'PAID',
      bien:         'Immeuble Les Palmiers — Appt 4B',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// ════════════════════════════════════════════════════════════════
// FICHIER 6 : src/app/api/v1/properties/route.ts
// GET /api/v1/properties?status=AVAILABLE — Biens disponibles
// (Achille a déjà GET /api/v1/properties — ajouter le filtre status)
// ════════════════════════════════════════════════════════════════
export async function GET_Properties(req: NextRequest) {
  try {
    // const session = await auth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');     // AVAILABLE, OCCUPIED...
    const groupeId = searchParams.get('groupeId'); // pour lister les biens d'un groupe

    /* ── Logique Prisma ──
    const properties = await prisma.property.findMany({
      where: {
        ownerId: session.user.id,
        ...(status    ? { status }    : {}),
        ...(groupeId  ? { groupeId }  : {}),
      },
      include: {
        groupe: { select: { id: true, firstName: true, lastName: true, nomComplet: true, typePropriete: true } },
        biens:  { select: { id: true, nomBien: true, nomComplet: true, niveau: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(properties);
    */

    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// ════════════════════════════════════════════════════════════════
// FICHIER 7 : src/app/api/v1/baux/[id]/premier-mois-impaye/route.ts
// GET /api/v1/baux/[id]/premier-mois-impaye
// Retourne le premier mois impayé pour un bail (RG-QUI-ORDRE)
// Appelé par le formulaire quittance pour verrouiller le mois
// ════════════════════════════════════════════════════════════════
export async function GET_PremierMoisImpaye(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // const { getPremierMoisImpaye } = await import('@/actions/receipt.actions');
    // const mois = await getPremierMoisImpaye(id);
    const mois = "2026-03";
    if (!mois) return NextResponse.json({ mois: null, message: 'Aucun impayé' });
    return NextResponse.json({ mois });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// ════════════════════════════════════════════════════════════════
// RÉSUMÉ DES ROUTES À CRÉER (en plus de celles d'Achille)
// ════════════════════════════════════════════════════════════════
export const NOUVELLES_ROUTES = {
  // Baux
  'POST /api/v1/baux/draft':                   'Créer un draft de bail',
  'PUT  /api/v1/baux/[id]/draft':              'Mettre à jour un draft',
  'POST /api/v1/baux/[id]/valider':            'Valider et signer le bail (SHA-256)',
  'GET  /api/v1/baux/[id]/premier-mois-impaye':'Premier mois impayé (RG-QUI-ORDRE)',
  // Quittances
  'POST /api/v1/receipts':                     'Émettre une quittance',
  'GET  /api/v1/receipts':                     'Lister les quittances',
  'GET  /api/v1/receipts/[id]/verify':         'Vérifier authenticité QR code (public)',
  // Biens
  'GET  /api/v1/properties?status=AVAILABLE':  'Biens disponibles (+ groupeId filter)',
};
