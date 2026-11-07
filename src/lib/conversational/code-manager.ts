/**
 * QAPRIL — Plateforme de gestion immobilière numérique — Côte d'Ivoire
 * ADDENDUM ADD-26 — Règle RG-CNV-07 : Gestion des codes courts de baux (2 à 3 caractères)
 * Permet de lever toute ambiguïté quand un bailleur gère plusieurs locataires par message
 */

import { prisma } from '@/lib/prisma';

const LETTRES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Attribue ou récupère un code court unique pour un bail vis-à-vis d'un bailleur donné (ex: A1, B2)
 */
export async function getOrCreateShortCodeForLease(params: {
  bailId: string;
  bailleurPhone: string;
}): Promise<string> {
  const { bailId, bailleurPhone } = params;

  // 1. Vérifier si un code existe déjà pour ce bail
  const existing = await prisma.codeBailCourt.findUnique({
    where: { bailId }
  });

  if (existing) {
    return existing.codeCourt;
  }

  // 2. Récupérer tous les codes déjà utilisés pour ce numéro bailleur
  const usedCodes = await prisma.codeBailCourt.findMany({
    where: { bailleurPhone },
    select: { codeCourt: true }
  });
  const usedSet = new Set(usedCodes.map(c => c.codeCourt.toUpperCase()));

  // 3. Générer le prochain code séquentiel simple (A1, A2, ..., Z9)
  let nextCode = 'A1';
  let found = false;

  for (let l = 0; l < LETTRES.length; l++) {
    for (let num = 1; num <= 9; num++) {
      const candidate = `${LETTRES[l]}${num}`;
      if (!usedSet.has(candidate)) {
        nextCode = candidate;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  // Si dépassement exceptionnel, préfixer par 3 caractères (ex: AA1)
  if (!found) {
    nextCode = `X${Math.floor(10 + Math.random() * 89)}`;
  }

  // 4. Enregistrer le code court
  await prisma.codeBailCourt.create({
    data: {
      bailId,
      bailleurPhone,
      codeCourt: nextCode
    }
  });

  return nextCode;
}

/**
 * Résout un bail à partir du numéro de téléphone du bailleur et du code court saisi
 */
export async function resolveLeaseByShortCode(params: {
  bailleurPhone: string;
  codeCourt?: string;
}) {
  const { bailleurPhone, codeCourt } = params;

  if (codeCourt) {
    const cleanCode = codeCourt.trim().toUpperCase();
    const entry = await prisma.codeBailCourt.findFirst({
      where: {
        bailleurPhone,
        codeCourt: cleanCode
      },
      include: {
        bail: {
          include: {
            property: true,
            tenant: true,
            landlord: true
          }
        }
      }
    });

    if (entry?.bail) {
      return entry.bail;
    }
  }

  // Si pas de code précisé ou code non trouvé :
  // Vérifier si le bailleur n'a qu'un seul bail actif
  const leases = await prisma.lease.findMany({
    where: {
      OR: [
        { landlord: { phone: bailleurPhone } },
        { landlord: { phone: bailleurPhone.replace('+', '') } },
        { codeBailCourt: { bailleurPhone } }
      ],
      status: { in: ['ACTIVE', 'ACTIVE_DECLARATIF', 'DRAFT', 'PENDING_SIGNATURE'] }
    },
    include: {
      property: true,
      tenant: true,
      landlord: true,
      codeBailCourt: true
    }
  });

  if (leases.length === 1) {
    return leases[0];
  }

  return null;
}

