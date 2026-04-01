"use server";
// QAPRIL - Dashboard Agence Agree - CRG + Agenda + Mandats

import { prisma } from "@/lib/prisma";

// Dashboard complet agence
export async function getDashboardAgence(agenceUserId: string) {
  const today = new Date();
  const debutMois = new Date(today.getFullYear(), today.getMonth(), 1);

  const [profil, mandats, crg, agenda, annonces] = await Promise.all([
    prisma.agenceProfile.findUnique({
      where: { userId: agenceUserId }
    }),
    // Biens sous mandat actif
    prisma.mandate.findMany({
      where: { agentUserId: agenceUserId, status: "ACTIVE" },
      include: {
        property: { select: { commune: true, address: true, propertyCode: true } },
        leases:   { where: { status: { in: ["ACTIVE","ACTIVE_DECLARATIF"] } },
                    include: { tenant: { select: { fullName: true } } } }
      }
    }),
    // CRG du mois
    prisma.crgMensuel.findMany({
      where: { agenceId: agenceUserId, mois: { gte: debutMois } },
      include: { proprietaire: { select: { fullName: true, landlordCode: true } } },
      orderBy: { mois: "desc" },
      take: 12
    }),
    // Evenements agenda du mois
    prisma.agendaEvenement.findMany({
      where: { agenceId: agenceUserId, debutAt: { gte: debutMois } },
      include: {
        logement: { select: { commune: true, address: true } },
        contact:  { select: { fullName: true, phone: true } }
      },
      orderBy: { debutAt: "asc" },
      take: 20
    }),
    // Annonces actives
    prisma.annonce.findMany({
      where: { agenceId: agenceUserId, statut: "ACTIVE" },
      include: { logement: { select: { commune: true, address: true } } },
      take: 10
    })
  ]);

  // Calculs KPI
  const totalLoyers   = crg.reduce((s,c) => s + c.loyersEncaisses, 0);
  const totalHonoraires = crg.reduce((s,c) => s + c.honorairesAgence, 0);
  const biensMandat   = mandats.length;
  const bauxActifs    = mandats.reduce((s,m) => s + m.leases.length, 0);

  return { profil, mandats, crg, agenda, annonces,
    kpi: { totalLoyers, totalHonoraires, biensMandat, bauxActifs } };
}

// Creer un CRG mensuel
export async function creerCrg(data: {
  proprietaireId:  string;
  agenceId:        string;
  mois:            Date;
  loyersEncaisses: number;
  chargesDeduites?: number;
  travauxDeduits?:  number;
  honorairesAgence: number;
}) {
  const reversement = data.loyersEncaisses
    - (data.chargesDeduites ?? 0)
    - (data.travauxDeduits ?? 0)
    - data.honorairesAgence;
  return prisma.crgMensuel.upsert({
    where: { proprietaireId_agenceId_mois: {
      proprietaireId: data.proprietaireId,
      agenceId:       data.agenceId,
      mois:           data.mois
    }},
    update: { ...data, reversementNet: reversement },
    create: { ...data, reversementNet: reversement }
  });
}

// Creer un evenement agenda
export async function creerEvenementAgenda(data: {
  agenceId:    string;
  typeEvent:   string; // VISITE|EDL_ENTREE|EDL_SORTIE|REMISE_CLES|TRAVAUX
  titre:       string;
  debutAt:     Date;
  finAt?:      Date;
  logementId?: string;
  leaseId?:    string;
  contactId?:  string;
}) {
  return prisma.agendaEvenement.create({ data });
}
