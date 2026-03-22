"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NotificationService } from "@/lib/notification-service";
import { revalidatePath } from "next/cache";
import { generateMonthlyReportPDF } from "@/lib/pdf-reports";
import { Role } from "@prisma/client";

/**
 * M-RAPPORT-01 : Générer le rapport mensuel pour un propriétaire (ou agence)
 */
export async function generateOwnerMonthlyReport(ownerId: string, month: number, year: number) {
  try {
    const periodStr = `${year}-${month.toString().padStart(2, '0')}`;
    
    // 1. Récupérer les baux actifs de l'utilisateur
    const leases = await prisma.lease.findMany({
      where: {
        status: "ACTIVE",
        property: { owner: { id: ownerId } }
      },
      include: {
        property: {
          include: {
            owner: true
          }
        },
        receipts: {
          where: { periodMonth: periodStr }
        }
      }
    }) as any[];

    if (leases.length === 0) return { success: false, error: "Aucun bail actif trouvé" };

    // 2. Calcul des métriques
    let totalPotentiel = 0;
    let totalEncaisse = 0;
    let nbImpayes = 0;
    let detailsProperties: any[] = [];

    leases.forEach(lease => {
      const montantMensuel = (lease.rentAmount || 0) + (lease.charges || 0);
      totalPotentiel += montantMensuel;

      const receipt = lease.receipts?.[0];
      if (receipt && receipt.status === "paid") {
        totalEncaisse += (receipt.totalAmount || 0);
      } else {
        nbImpayes++;
      }

      detailsProperties.push({
        address: lease.property?.address || "Adresse inconnue",
        tenant: lease.tenantId,
        status: receipt?.status || "pending",
        amount: montantMensuel
      });
    });

    const tauxRecouvrement = totalPotentiel > 0 ? Math.round((totalEncaisse / totalPotentiel) * 100) : 0;

    // 3. Préparation des données JSON du rapport
    const reportData = {
      period: periodStr,
      metrics: {
        totalPotentiel,
        totalEncaisse,
        tauxRecouvrement,
        nbLeases: leases.length,
        nbImpayes
      },
      details: detailsProperties,
      generatedAt: new Date().toISOString()
    };

    // 4. Enregistrement en base (Modèle RapportMensuel corrigé)
    const report = await (prisma as any).rapportMensuel.create({
      data: {
        userId: ownerId,
        periodeMois: month,
        periodeAnnee: year,
        dataRapport: reportData,
        typeRapport: "MENSUEL",
      }
    });

    // 5. Générer PDF
    const ownerName = leases[0]?.property?.owner?.name || "Propriétaire QAPRIL";
    const pdfBuffer = await generateMonthlyReportPDF({
       ownerName,
       period: periodStr,
       metrics: reportData.metrics,
       details: detailsProperties
    });

    // Note: Simulation d'URL
    const pdfUrl = `/api/reports/download/${report.id}`;

    await (prisma as any).rapportMensuel.update({
      where: { id: report.id },
      data: { pdfUrl }
    });

    // 6. Notification
    await NotificationService.envoyerNotification(ownerId, "RAPPORT_MENSUEL", {
       referenceId: report.id,
       payload: {
         parameters: [periodStr, `${totalEncaisse} FCFA`, `${tauxRecouvrement}%`],
         smsText: `[QAPRIL] Votre rapport de ${periodStr} est prêt. Encaissement: ${totalEncaisse.toLocaleString()} FCFA (${tauxRecouvrement}%).`
       }
    });

    revalidatePath(`/dashboard/reports`);
    return { success: true, reportId: report.id, metrics: reportData.metrics };
  } catch (error) {
    console.error("[M-RAPPORT] Generation Error:", error);
    return { success: false, error: "Erreur lors de la génération du rapport" };
  }
}

/**
 * M-RAPPORT-02 : Récupérer les rapports d'un utilisateur
 */
export async function getMonthlyReports(userId: string) {
  try {
    return await (prisma as any).rapportMensuel.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    console.error("[M-RAPPORT] Fetch Error:", error);
    return [];
  }
}

/**
 * M-RAPPORT-CRON : Lancer pour tous les bailleurs (Simulé)
 */
export async function triggerAllMonthlyReports() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return { success: false, error: "Non autorisé" };

  try {
    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const m = prevMonth.getMonth() + 1;
    const y = prevMonth.getFullYear();

    const owners = await prisma.user.findMany({
      where: { 
        role: { in: [Role.LANDLORD, Role.LANDLORD_PRO, Role.ADMIN] }
      },
      select: { id: true }
    });

    let count = 0;
    for (const owner of owners) {
        const res = await generateOwnerMonthlyReport(owner.id, m, y);
        if (res.success) count++;
    }

    return { success: true, processed: owners.length, generated: count };
  } catch (error) {
    console.error("[M-RAPPORT] Batch Error:", error);
    return { success: false, error: "Erreur lors du batch" };
  }
}
