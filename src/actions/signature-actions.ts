"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function initiateSignature(data: {
  documentType: "BAIL" | "MANDAT" | "COMPROMIS" | "AUTRE";
  documentId: string;
  signataireId: string;
}) {
  try {
    // Génération d'un code OTP à 6 chiffres
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const signature = await (prisma as any).signatureElectronique.create({
      data: {
        documentType: data.documentType,
        documentId: data.documentId,
        signataireId: data.signataireId,
        otpCode,
        statut: "EN_ATTENTE",
      }
    });

    // Simuler l'envoi de SMS ici (appel à un service SMS existant dans le projet)
    console.log(`[SIGN] OTP ${otpCode} généré pour le document ${data.documentId}`);

    return { success: true, signatureId: signature.id };
  } catch (error) {
    console.error("[SIGN] Initiate Error:", error);
    return { success: false, error: "Erreur lors de l'initiation de la signature" };
  }
}

export async function validateSignature(id: string, otp: string, meta: {
  ip: string;
  userAgent: string;
}) {
  try {
    const signature = await (prisma as any).signatureElectronique.findUnique({
      where: { id }
    });

    if (!signature || signature.otpCode !== otp) {
      return { success: false, error: "Code OTP invalide" };
    }

    const updated = await (prisma as any).signatureElectronique.update({
      where: { id },
      data: {
        statut: "SIGNE",
        signeAt: new Date(),
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
      }
    });

    return { success: true, signature: updated };
  } catch (error) {
    return { success: false, error: "Erreur lors de la validation" };
  }
}

export async function getDocumentSignatures(documentId: string) {
  try {
    return await (prisma as any).signatureElectronique.findMany({
      where: { documentId },
      include: { signataire: true },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    return [];
  }
}
