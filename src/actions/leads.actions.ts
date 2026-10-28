"use server";
// QAPRIL - leads.actions.ts - Acquisition page verification

import { prisma } from "@/lib/prisma";

// Enregistrer un lead depuis la page verifier
export async function capturerLead(data: {
  telephone:      string;
  profilDeclare:  "BAILLEUR" | "AGENT" | "LOCATAIRE" | "AUTRE";
  sourceDocument?: string; // ref du doc scanne
  sourceToken?:   string;  // token QR code
}) {
  // Eviter les doublons sur le meme telephone
  const existant = await prisma.lead.findFirst({
    where: { telephone: data.telephone }
  });
  if (existant) return { success: true, lead: existant, duplicate: true };

  const lead = await prisma.lead.create({
    data: { ...data, statut: "NOUVEAU" }
  });

  // Notification de l'équipe commerciale QAPRIL
  try {
    const commercialPhone = process.env.COMMERCIAL_PHONE || "0700000000";
    if (commercialPhone && commercialPhone !== "0700000000") {
      const { sendSMS } = await import("@/lib/sms");
      await sendSMS(
        commercialPhone,
        `[QAPRIL LEAD] Nouveau prospect : ${data.telephone} - Profil: ${data.profilDeclare || "AUTRE"}`
      );
    }
  } catch (err) {
    console.error("[Leads] Commercial alert error:", err);
  }

  return { success: true, lead, duplicate: false };
}

// Liste des leads pour CRM admin
export async function getLeads(statut?: string) {
  return prisma.lead.findMany({
    where: statut ? { statut } : {},
    orderBy: { createdAt: "desc" }
  });
}

// Marquer lead comme contacte
export async function marquerLeadContacte(
  leadId: string, note?: string
) {
  return prisma.lead.update({
    where: { id: leadId },
    data: { statut: "CONTACTE", noteCommerciale: note }
  });
}

// Convertir lead en utilisateur inscrit
export async function convertirLead(leadId: string, userId: string) {
  return prisma.lead.update({
    where: { id: leadId },
    data: { statut: "INSCRIT", convertedUserId: userId }
  });
}
