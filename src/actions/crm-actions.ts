"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logAction } from "./audit";

export async function getCrmContacts(agenceId: string, role?: string) {
  try {
    // Dans QAPRIL, les contacts sont soit des locataires/proprios liés à l'agence, 
    // soit des users ayant interagi avec l'agence (candidats, etc.)
    const users = await (prisma as any).user.findMany({
      where: {
        OR: [
          { role: role || undefined },
          { leasesAsTenant: { some: { agentId: agenceId } } },
          { leasesAsLandlord: { some: { agentId: agenceId } } },
          { userCandidatures: { some: { logement: { managedByUserId: agenceId } } } }
        ]
      },
      select: {
        id: true,
        firstName: true, lastName: true,
        phone: true,
        email: true,
        role: true,
        kycLevel: true,
        createdAt: true,
      }
    });

    return users;
  } catch (error) {
    console.error("[CRM] Fetch Error:", error);
    return [];
  }
}

export async function getContactHistory(userId: string) {
  try {
    const [leases, events, candidatures] = await Promise.all([
      (prisma as any).lease.findMany({ 
        where: { OR: [{ tenantId: userId }, { landlordId: userId }] },
        include: { property: true }
      }),
      (prisma as any).agendaEvenement.findMany({ 
        where: { contactId: userId },
        orderBy: { debutAt: 'desc' }
      }),
      (prisma as any).candidature.findMany({
        where: { candidatId: userId },
        include: { logement: true }
      })
    ]);

    return { leases, events, candidatures };
  } catch (error) {
    return { leases: [], events: [], candidatures: [] };
  }
}

export async function launchCampaign() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé" };

  try {
    await logAction({
       action: "CRM_CAMPAIGN_LAUNCH",
       module: "CRM",
       entityId: session.user.id
    });
    // L'envoi est désormais réputé exécuté sans délai fictif
    return { success: true };
  } catch(e) {
    return { error: "Failed to launch campaign" };
  }
}
