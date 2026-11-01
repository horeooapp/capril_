"use server";
// src/actions/capacite.actions.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function switchCapacite(nouvelleCapacite: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecte");

  // 1. Verifier que l'utilisateur a vraiment cette capacite
  const verif = await prisma.userCapacite.findUnique({
    where: {
      userId_capacite: {
        userId: session.user.id,
        capacite: nouvelleCapacite
      }
    }
  });

  if (!verif || !verif.actif) {
    throw new Error("Capacite non autorisee");
  }

  // 2. Mettre a jour la BDD et Redis
  const roleEnum = ['LANDLORD', 'TENANT', 'AGENCY', 'NON_CERTIFIED_AGENT'].includes(nouvelleCapacite)
    ? nouvelleCapacite
    : (nouvelleCapacite === 'PROPRIETAIRE' ? 'LANDLORD' : (nouvelleCapacite === 'AGENCE_AGREE' ? 'AGENCY' : undefined));

  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      capaciteActive: nouvelleCapacite,
      ...(roleEnum ? { role: roleEnum as any } : {})
    }
  });

  try {
    const { redis } = await import("@/lib/redis");
    if (redis) {
      await redis.set(`user:active_role:${session.user.id}`, nouvelleCapacite).catch(() => {});
    }
  } catch (e) {}

  return { success: true };
}
