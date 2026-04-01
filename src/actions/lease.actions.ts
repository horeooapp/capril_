'use server'
// ═══════════════════════════════════════════════════════════════
// QAPRIL — Server Actions : Baux (Lease)
// Fichier : src/actions/lease.actions.ts
//
// Next.js 15 App Router — Server Actions ("use server")
// Compatible avec le projet d'Achille (Prisma + Next.js)
//
// MODÈLE PRISMA : Lease (pas Bail)
// ENDPOINTS GÉNÉRÉS :
//   → Appelables depuis les composants via import direct
//   → Ou exposés via Route Handlers dans /api/v1/baux/
// ═══════════════════════════════════════════════════════════════

import { createHash, createHmac } from 'crypto';
import { revalidatePath } from 'next/cache';
// import { auth } from '@/lib/auth';         // adapter selon setup NextAuth d'Achille
// import { prisma } from '@/lib/prisma';     // adapter selon export prisma d'Achille
import {
  CreateLeaseDraftDTO, LOI_APPLICABLE,
  calculerDGI, calculerDateFin, tarifBail, genererQrUrl,
} from '../types/qapril-types';

// ── Sauvegarder un draft de bail ──────────────────────────────
export async function sauvegarderDraftLease(dto: CreateLeaseDraftDTO) {
  // const session = await auth();
  // if (!session?.user) throw new Error('Non authentifié');
  // const emetteurId = session.user.id;

  /* ── Logique Prisma (décommenter dans le projet d'Achille) ──

  const versionActuelle = dto.leaseId
    ? (await prisma.lease.findUnique({ where: { id: dto.leaseId } }))?.versionDraft ?? 0
    : 0;

  const dateDebut = new Date(dto.startDate);
  const dateFin   = calculerDateFin(dto.startDate, dto.durationMonths);
  const droitsDgi = calculerDGI(dto.rent, dto.durationMonths);
  const tarif     = tarifBail(
    (await prisma.property.findUnique({ where: { id: dto.propertyId } }))?.estCourEntiere ?? false
  );

  const data = {
    rent:               dto.rent,
    charges:            dto.charges,
    deposit:            dto.deposit,
    startDate:          dateDebut,
    endDate:            new Date(dateFin),
    durationMonths:     dto.durationMonths,
    dueDay:             dto.dueDay,
    alerte90j:          dto.alerte90j,
    alerte60j:          dto.alerte60j,
    alerte30j:          dto.alerte30j,
    seuilJ3:            dto.seuilJ3,
    seuilJ7:            dto.seuilJ7,
    seuilJ15:           dto.seuilJ15,
    loiApplicable:      LOI_APPLICABLE,
    droitsDgiCalcules:  droitsDgi,
    fraisQapril:        tarif,
    statutDraft:        'DRAFT',
    versionDraft:       versionActuelle + 1,
    draftData:          dto,  // snapshot complet
    updatedAt:          new Date(),
  };

  if (dto.leaseId) {
    // Mise à jour d'un draft existant
    const lease = await prisma.lease.findFirst({
      where: { id: dto.leaseId, statutDraft: 'DRAFT' },
    });
    if (!lease) throw new Error('Draft introuvable ou déjà signé');

    return await prisma.lease.update({
      where: { id: dto.leaseId },
      data,
    });
  }

  // Nouveau draft
  const property = await prisma.property.findUnique({ where: { id: dto.propertyId } });
  if (!property) throw new Error('Bien introuvable');

  return await prisma.lease.create({
    data: {
      ...data,
      reference:   `DRAFT-${Date.now()}`,
      propertyId:  dto.propertyId,
      tenantId:    dto.tenantId,
      ownerId:     property.ownerId,
      emetteurId,
      status:      'PENDING',
    },
  });
  */

  // Placeholder pour compilation
  return { success: true, leaseId: dto.leaseId || 'new-draft-id' };
}

// ── Valider un bail (SHA-256 + signature + débit wallet) ──────
export async function validerLease(leaseId: string, dto: CreateLeaseDraftDTO) {
  // const session = await auth();
  // if (!session?.user) throw new Error('Non authentifié');

  /* ── Logique Prisma ──

  return await prisma.$transaction(async (tx) => {

    // 1. Récupérer le bien
    const property = await tx.property.findFirst({
      where: { id: dto.propertyId, status: 'AVAILABLE' },
    });
    if (!property) throw new Error('Bien introuvable ou non disponible');

    // 2. Vérifier le wallet · ADD-07 v3
    const tarif = tarifBail(property.estCourEntiere ?? false);
    const wallet = await tx.paymentPgw.findFirst({
      where: { userId: property.ownerId },
    });
    // Mode crédit autorisé jusqu'à -1500 FCFA · ADD-07 v3
    if (wallet && (wallet.balance ?? 0) < -1500) {
      throw new Error('Solde wallet insuffisant — rechargez via deep link · ADD-07 v3');
    }

    // 3. Calculer les dates et la DGI
    const dateDebut = new Date(dto.startDate);
    const dateFin   = calculerDateFin(dto.startDate, dto.durationMonths);
    const droitsDgi = calculerDGI(dto.rent, dto.durationMonths);

    // 4. Générer la référence définitive
    const count   = await tx.lease.count({ where: { statutDraft: { not: 'DRAFT' } } });
    const ym      = new Date().toISOString().slice(0, 7).replace('-', '');
    const ref     = `BAIL-${ym}-${String(count + 1).padStart(3, '0')}`;

    // 5. Calculer SHA-256 · RG-BAIL-03 — côté serveur uniquement
    const contenu = JSON.stringify({
      reference: ref,
      propertyId: dto.propertyId,
      tenantId: dto.tenantId,
      ownerId: property.ownerId,
      rent: dto.rent,
      charges: dto.charges,
      deposit: dto.deposit,
      startDate: dateDebut.toISOString(),
      endDate: new Date(dateFin).toISOString(),
      durationMonths: dto.durationMonths,
      dueDay: dto.dueDay,
      loi: LOI_APPLICABLE,
    });
    const sha256Hash = createHash('sha256').update(contenu).digest('hex');
    const qrCodeUrl  = genererQrUrl(ref, sha256Hash);

    // 6. Créer ou mettre à jour le bail (statut ACTIF)
    const leaseData = {
      reference:         ref,
      rent:              dto.rent,
      charges:           dto.charges,
      deposit:           dto.deposit,
      startDate:         dateDebut,
      endDate:           new Date(dateFin),
      durationMonths:    dto.durationMonths,
      dueDay:            dto.dueDay,
      loiApplicable:     LOI_APPLICABLE,
      droitsDgiCalcules: droitsDgi,
      fraisQapril:       tarif,
      sha256Hash,
      sha256CalculeLe:   new Date(),
      qrCodeUrl,
      statutDraft:       'ACTIF',
      draftData:         null,          // nettoyé après validation
      alerte90j:         dto.alerte90j,
      alerte60j:         dto.alerte60j,
      alerte30j:         dto.alerte30j,
      seuilJ3:           dto.seuilJ3,
      seuilJ7:           dto.seuilJ7,
      seuilJ15:          dto.seuilJ15,
      status:            'ACTIVE',
    };

    const lease = leaseId
      ? await tx.lease.update({ where: { id: leaseId }, data: leaseData })
      : await tx.lease.create({
          data: {
            ...leaseData,
            propertyId:  dto.propertyId,
            tenantId:    dto.tenantId,
            ownerId:     property.ownerId,
            emetteurId:  session.user.id,
          },
        });

    // 7. Passer le bien en OCCUPIED
    await tx.property.update({
      where: { id: dto.propertyId },
      data:  { status: 'OCCUPIED' },
    });

    // 8. Débiter le wallet
    // Adapter selon la table wallet d'Achille (PaymentPgw ou autre)
    // await tx.wallet.update({ where: { userId: property.ownerId }, data: { balance: { decrement: tarif } } });

    // 9. Notifications · RG-BAIL-06
    // SMS locataire — JAMAIS révéler le bailleur réel · RG-CONF-01
    // await sendSmsLocataire({ tenantId: dto.tenantId, propertyName: property.nomComplet, ... });
    // await sendPushBailleur({ ownerId: property.ownerId, reference: ref });

    revalidatePath('/dashboard/owner');
    revalidatePath('/dashboard/agency');

    return lease;
  });
  */

  return { success: true, reference: `BAIL-202604-001`, sha256Hash: 'abc123...' };
}

// ── Lister les baux actifs (pour formulaire quittance) ────────
export async function listerLeasesActifs() {
  /* ── Logique Prisma ──
  const session = await auth();
  return await prisma.lease.findMany({
    where: {
      status: 'ACTIVE',
      ownerId: session.user.id,
    },
    include: {
      property: { select: { id: true, nomComplet: true, address: true, commune: true, estCourEntiere: true } },
      tenant:   { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  */
  return [];
}

// ── Lister les drafts ─────────────────────────────────────────
export async function listerDraftsLease() {
  /* ── Logique Prisma ──
  const session = await auth();
  return await prisma.lease.findMany({
    where: { statutDraft: 'DRAFT', ownerId: session.user.id },
    include: { property: true, tenant: true },
    orderBy: { updatedAt: 'desc' },
  });
  */
  return [];
}
