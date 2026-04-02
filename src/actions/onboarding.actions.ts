"use server";
// src/actions/onboarding.actions.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type Capacite =
  "PROPRIETAIRE" | "AGENCE_AGREE" | "AGENCE_NON_AGREE" | "INTERMEDIAIRE";

export async function finaliserOnboarding(data: {
  capacites:       Capacite[];   // cases cochees
  capaciteActive:  Capacite;     // capacite par defaut choisie
  activerDiaspora: boolean;      // package 7EUR/mois
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecte");

  const userId = session.user.id;

  // Valider au moins une capacite
  if (data.capacites.length === 0) {
    throw new Error("Selectionnez au moins une capacite");
  }

  // Creer toutes les capacites selectionnees
  await prisma.$transaction([
    // Creer les UserCapacite
    ...data.capacites.map(cap =>
      prisma.userCapacite.upsert({
        where:  { userId_capacite: { userId, capacite: cap } },
        update: { actif: true },
        create: { userId, capacite: cap }
      })
    ),
    // Mettre a jour le user
    prisma.user.update({
      where: { id: userId },
      data: {
        onboardingComplete:  true,
        capaciteActive:      data.capaciteActive,
        diasporaAbonnement:  data.activerDiaspora,
        diasporaAbonnementSince: data.activerDiaspora ? new Date() : null,
      }
    })
  ]);

  return { success: true };
}
