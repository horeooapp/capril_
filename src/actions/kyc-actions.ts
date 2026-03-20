"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import { analyzeIdentityDocument, calculateNextKYCLevel } from "@/lib/kyc-engine"
import { logAction } from "./audit"
import { ensureAuthenticated, ensureRole } from "./auth-helpers"

/**
 * Part 5.3: Manual Verification by ANAH/CDC Agent
 * Upgrades user to KYC Level 3 upon successful verification.
 */
export async function verifyUserIdentity(
    userId: string, 
    documentId: string, 
    action: 'verify' | 'reject', 
    rejectionReason?: string
) {
    const session = await ensureRole([Role.SUPER_ADMIN, Role.ADMIN, Role.ANAH_AGENT, Role.CDC_AGENT]);

    try {
        const isVerified = action === 'verify'

        await prisma.$transaction([
            // 1. Update the Identity Document
            prisma.identityDocument.update({
                where: { id: documentId },
                data: {
                    status: isVerified ? 'verified' : 'rejected',
                    rejectionReason: isVerified ? null : rejectionReason,
                    verifiedAt: isVerified ? new Date() : null,
                    verifiedByUserId: session.user.id
                }
            }),

            // 2. Update the User Status & Level
            prisma.user.update({
                where: { id: userId },
                data: {
                    // Level 3 is "Verified Identity" in v3.0
                    kycLevel: isVerified ? 3 : 2, 
                    kycStatus: isVerified ? 'verified' : 'rejected'
                }
            })
        ])

        revalidatePath("/admin/validation")
        revalidatePath(`/admin/users/${userId}`)
        
        return { 
            success: true, 
            message: isVerified ? "Identité validée avec succès (KYC Level 3)." : "Document rejeté." 
        }

    } catch (error) {
        console.error("Erreur action KYC:", error)
        return { error: "Une erreur est survenue lors de la validation." }
    }
}

/**
 * Part 21.1: Automated KYC Screening (Hybrid)
 */
export async function triggerAssistedKYC(documentId: string) {
    const session = await ensureAuthenticated()

    try {
        const doc = await prisma.identityDocument.findUnique({
            where: { id: documentId },
            include: { user: true }
        })

        if (!doc) throw new Error("Document introuvable")

        // 1. Run Analysis Engine
        const analysis = await analyzeIdentityDocument(doc.scanS3Key || "")

        // 2. Determine automation outcome
        const isAutoVerifiable = analysis.confidence > 0.95 && analysis.flags.length === 0
        const newStatus = isAutoVerifiable ? "verified" : "under_review"
        const nextLevel = calculateNextKYCLevel(doc.user.kycLevel, doc.docType)

        // 3. Update DB
        const updatedDoc = await prisma.identityDocument.update({
            where: { id: documentId },
            data: {
                status: newStatus,
                verifiedAt: isAutoVerifiable ? new Date() : null,
                verifiedByUserId: isAutoVerifiable ? "SYSTEM_AI" : null,
                fullName: doc.fullName || analysis.extractedData.fullName,
                metadata: {
                    aiAnalysis: analysis as any
                }
            }
        })

        if (isAutoVerifiable) {
            await prisma.user.update({
                where: { id: doc.userId },
                data: { kycLevel: nextLevel, kycStatus: "verified" }
            })
        } else {
            // Notify Admin for manual review
            await prisma.notification.create({
                data: {
                    userId: "ADMIN_ID_PLACEHOLDER", // Should be fetched or broadcast
                    channel: "PUSH",
                    title: "Vérification Manuelle Requise",
                    content: `Anomalie détectée sur le document de ${doc.user.fullName || doc.userId}. Motifs: ${analysis.flags.join(", ")}`,
                    type: "WARNING"
                }
            })
        }

        await logAction({
            action: "KYC_ASSISTED_SCAN",
            module: "KYC",
            entityId: documentId,
            newValues: { status: newStatus, confidence: analysis.confidence, flags: analysis.flags }
        })

        revalidatePath("/admin/validation")
        return { success: true, autoVerified: isAutoVerifiable, analysis }

    } catch (error) {
        console.error("Erreur KYC assisté:", error)
        return { error: "Échec de l'analyse automatique." }
    }
}
