"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Service de simulation SMS robuste
 */
async function sendSmsOtp(phone: string, code: string) {
    // Dans le futur, intégrer Twilio ici
    console.log(`[SMS_GATEWAY] Envoi de l'OTP ${code} au numéro ${phone}`);
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
}

export async function initiateSignature(data: {
  documentType: "BAIL" | "MANDAT" | "COMPROMIS" | "AUTRE";
  documentId: string;
  signataireId: string;
}) {
  try {
    // Vérifier si le signataire existe et a un numéro de téléphone
    const signataire = await prisma.user.findUnique({
        where: { id: data.signataireId },
        select: { phone: true }
    });

    if (!signataire || !signataire.phone) {
        return { success: false, error: "Le signataire n'a pas de numéro de téléphone configuré pour l'OTP." };
    }

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

    // Envoi du SMS (simulé pour l'instant)
    await sendSmsOtp(signataire.phone, otpCode);

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

    if (!signature) {
      return { success: false, error: "Signature introuvable" };
    }

    // Protection contre les tentatives obsolètes (ex: > 10 min)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (signature.createdAt < tenMinutesAgo) {
      return { success: false, error: "Le code OTP a expiré. Veuillez recommencer." };
    }

    if (signature.otpCode !== otp) {
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
    console.error("[SIGN] Validation Error:", error);
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
