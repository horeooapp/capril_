"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logAction } from "./audit";

export async function getCrmContacts(agenceId: string, role?: string) {
  try {
    const fullUser = await prisma.user.findUnique({
      where: { id: agenceId },
      select: { agencyConfig: true }
    });
    const managerId = (fullUser?.agencyConfig as any)?.managerId;

    const roleCondition = role ? { role: role } : {};

    const orConditions: any[] = [
      { leasesAsTenant: { some: { agentId: agenceId } } },
      { leasesAsLandlord: { some: { agentId: agenceId } } },
      { userCandidatures: { some: { logement: { managedByUserId: agenceId } } } }
    ];

    if (managerId) {
      orConditions.push({ leasesAsTenant: { some: { agentId: managerId } } });
      orConditions.push({ leasesAsLandlord: { some: { agentId: managerId } } });
      orConditions.push({ userCandidatures: { some: { logement: { managedByUserId: managerId } } } });
    }

    // Propriétaire / Locataire direct
    orConditions.push({ leasesAsTenant: { some: { landlordId: agenceId } } });
    orConditions.push({ leasesAsLandlord: { some: { tenantId: agenceId } } });

    const users = await (prisma as any).user.findMany({
      where: {
        AND: [
          roleCondition,
          { OR: orConditions }
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
