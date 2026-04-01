"use server";
// QAPRIL - Signatures electroniques - Loi N 2013-546 CI

import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { revalidatePath } from "next/cache";

// Initier une signature (cree la demande en EN_ATTENTE)
export async function initierSignature(data: {
  documentType: string; // "BAIL" | "AVENANT" | "MANDAT" | "EDL"
  documentId:   string;
  signataireId: string;
  methode?:     string; // "OTP_SMS" | "DESSIN" | "BIOMETRIQUE"
  expiresAt?:   Date;
}) {
  return prisma.signatureElectronique.create({
    data: {
      documentType: data.documentType,
      documentId:   data.documentId,
      signataireId: data.signataireId,
      methode:      data.methode ?? "OTP_SMS",
      statut:       "EN_ATTENTE",
      expiresAt:    data.expiresAt ?? new Date(Date.now() + 48*3600*1000),
    }
  });
}

// Confirmer la signature avec OTP
export async function confirmerSignature(sigId: string, data: {
  otpUtilise:   string;
  ipAddress?:   string;
  userAgent?:   string;
  documentJson: Record<string, unknown>; // Contenu du document signe
}) {
  const hashDocument = createHash("sha256")
    .update(JSON.stringify(data.documentJson)).digest("hex");
  return prisma.signatureElectronique.update({
    where: { id: sigId },
    data: {
      statut:       "SIGNE",
      otpUtilise:   data.otpUtilise,
      ipAddress:    data.ipAddress,
      userAgent:    data.userAgent,
      hashDocument: hashDocument,
      signedAt:     new Date(),
    }
  });
}

// Verifier si un document est signe par tous les signataires
export async function isDocumentFullySigned(
  documentType: string, documentId: string
) {
  const sigs = await prisma.signatureElectronique.findMany({
    where: { documentType, documentId }
  });
  return sigs.length > 0 && sigs.every(s => s.statut === "SIGNE");
}

// Signatures d'un document
export async function getSignaturesDocument(
  documentType: string, documentId: string
) {
  return prisma.signatureElectronique.findMany({
    where:   { documentType, documentId },
    include: { signataire: { select: { fullName: true, phone: true } } },
    orderBy: { createdAt: "asc" }
  });
}
