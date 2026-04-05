"use server";

import { prisma } from "@/lib/prisma";

// ── Phase 4: Gouvernance Agences (Art. 459-465 CCH) ──

export async function validerConformiteAgence(agenceId: string, payload: { numeroAgrement: string, agrementDate: Date, garantieFinanciere: string, rcPro: string }) {
  const profile = await prisma.agenceProfile.findUnique({ where: { userId: agenceId } });
  
  if (!profile) throw new Error("Profil agence introuvable");

  return prisma.agenceProfile.update({
    where: { userId: agenceId },
    data: {
      numeroAgrement: payload.numeroAgrement,
      agrementDate: payload.agrementDate,
      garantieFinanciere: payload.garantieFinanciere,
      rcPro: payload.rcPro,
      statutLegal: "AGREE"
    }
  });
}

export async function suspendreAgenceNonConforme(agenceId: string) {
  return prisma.agenceProfile.update({
    where: { userId: agenceId },
    data: {
      statutLegal: "NON_AGREE"
    }
  });
}

// Interceptor hook to use in payment routes or payouts
export async function checkAgencyAccreditation(agenceId: string) {
  const profile = await prisma.agenceProfile.findUnique({ where: { userId: agenceId } });
  if (!profile) return false;
  
  if (profile.statutLegal !== "AGREE") {
    throw new Error("Loi 2019-576 : Votre agence ne possède pas d'Agrément Ministériel valide. Les transactions directes sont temporairement bloquées.");
  }
  return true;
}
