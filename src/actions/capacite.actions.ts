"use server";
// src/actions/capacite.actions.ts

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function switchCapacite(nouvelleCapacite: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non connecte");

  // 1. Verifier que l'utilisateur a vraiment cette capacite
  // On ne peut pas skipper ca sinon n'importe qui force son acces.
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

  // 2. Mettre a jour la BDD
  await prisma.user.update({
    where: { id: session.user.id },
    data:  { capaciteActive: nouvelleCapacite }
  });

  // NextAuth v5 resync la session au prochain reload
  // puisque token() interroge le JWT (mais via PrismaAdapter, la base d'abord ou getSession cote client)
  return { success: true };
}
