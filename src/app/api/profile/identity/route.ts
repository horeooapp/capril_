import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { savePhysicalFile, deletePhysicalFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * POST /api/profile/identity
 * Dépôt de la pièce d'identité (CNI, Passeport ou Carte de résident) pour validation du compte.
 * Multipart : docType, docNumber, expiryDate?, recto (File), verso? (File)
 */

const ID_DOC_TYPES: Record<string, { label: string; needsVerso: boolean }> = {
    CNI_CI: { label: "Carte Nationale d'Identité", needsVerso: true },
    PASS_CI: { label: "Passeport", needsVerso: false },
    CARTE_RESIDENT: { label: "Carte de Résident", needsVerso: true },
};

const NON_IDENTITY_TYPES = ["DFE", "RCCM", "NIF", "AGREMENT", "SELFIE"];
const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo par face
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function validateFile(file: File | null, label: string): string | null {
    if (!file || typeof file === "string" || file.size === 0) return `Le ${label} de la pièce est requis.`;
    if (file.size > MAX_SIZE) return `Le ${label} dépasse la taille maximale de 8 Mo.`;
    if (!ALLOWED_MIME.includes(file.type)) return `Format du ${label} non accepté (JPG, PNG, WEBP ou PDF uniquement).`;
    return null;
}

export async function POST(req: NextRequest) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Veuillez vous connecter." }, { status: 401 });
    }

    try {
        const form = await req.formData();
        const docType = String(form.get("docType") || "");
        const docNumber = String(form.get("docNumber") || "").trim().toUpperCase().replace(/\s+/g, "");
        const expiryRaw = String(form.get("expiryDate") || "");
        const recto = form.get("recto") as File | null;
        const verso = form.get("verso") as File | null;

        const typeConf = ID_DOC_TYPES[docType];
        if (!typeConf) {
            return NextResponse.json({ error: "Type de pièce invalide. Choisissez CNI, Passeport ou Carte de résident." }, { status: 400 });
        }
        if (!/^[A-Z0-9\-]{5,20}$/.test(docNumber)) {
            return NextResponse.json({ error: "Numéro de pièce invalide (5 à 20 caractères alphanumériques)." }, { status: 400 });
        }

        let expiryDate: Date | null = null;
        if (expiryRaw) {
            expiryDate = new Date(expiryRaw);
            if (isNaN(expiryDate.getTime())) {
                return NextResponse.json({ error: "Date d'expiration invalide." }, { status: 400 });
            }
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expiryDate < today) {
                return NextResponse.json({ error: "Cette pièce est expirée. Veuillez fournir une pièce en cours de validité." }, { status: 400 });
            }
        }

        const rectoErr = validateFile(recto, typeConf.needsVerso ? "recto" : "scan");
        if (rectoErr) return NextResponse.json({ error: rectoErr }, { status: 400 });

        const hasVerso = verso && typeof verso !== "string" && verso.size > 0;
        if (typeConf.needsVerso || hasVerso) {
            const versoErr = validateFile(verso, "verso");
            if (versoErr) return NextResponse.json({ error: versoErr }, { status: 400 });
        }

        // Pièce déjà validée : on ne remplace pas
        const existing = await prisma.identityDocument.findFirst({
            where: { userId, docType: { notIn: NON_IDENTITY_TYPES } },
            orderBy: { createdAt: "desc" },
        });
        if (existing?.status === "verified") {
            return NextResponse.json({ error: "Votre identité est déjà validée. Contactez le support pour toute modification." }, { status: 409 });
        }

        // Anti-doublon inter-comptes
        const duplicate = await prisma.identityDocument.findFirst({
            where: { docType, docNumber, userId: { not: userId }, status: { in: ["pending", "under_review", "verified"] } },
            select: { id: true },
        });
        if (duplicate) {
            return NextResponse.json({ error: "Cette pièce d'identité est déjà associée à un autre compte QAPRIL." }, { status: 409 });
        }

        // Stockage privé (dossier kyc/<userId>, protégé par la route /uploads)
        const rectoUrl = await savePhysicalFile(recto as File, `kyc/${userId}`);
        const versoUrl = hasVerso ? await savePhysicalFile(verso as File, `kyc/${userId}`) : null;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { firstName: true, lastName: true, birthDate: true },
        });
        const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;
        const docNumberHash = `${userId}_${docType}_${docNumber}`;
        const metadata = {
            versoUrl,
            source: "WEB_PROFILE",
            submittedAt: new Date().toISOString(),
        };

        // Si un autre document porte déjà ce hash pour cet utilisateur, on le réutilise
        const sameHash = await prisma.identityDocument.findUnique({ where: { docNumberHash } });
        const target = sameHash || existing;

        const oldFiles: string[] = [];
        if (target) {
            if (target.scanS3Key) oldFiles.push(target.scanS3Key);
            const oldVerso = (target.metadata as any)?.versoUrl;
            if (oldVerso) oldFiles.push(oldVerso);
        }

        const doc = target
            ? await prisma.identityDocument.update({
                  where: { id: target.id },
                  data: {
                      docType,
                      docNumber,
                      docNumberHash,
                      scanS3Key: rectoUrl,
                      expiryDate,
                      fullName,
                      birthDate: user?.birthDate ?? undefined,
                      status: "pending",
                      rejectionReason: null,
                      verifiedAt: null,
                      verifiedByUserId: null,
                      metadata,
                  },
              })
            : await prisma.identityDocument.create({
                  data: {
                      userId,
                      docType,
                      docNumber,
                      docNumberHash,
                      scanS3Key: rectoUrl,
                      expiryDate,
                      fullName,
                      birthDate: user?.birthDate ?? undefined,
                      status: "pending",
                      metadata,
                  },
              });

        await prisma.user.update({
            where: { id: userId },
            data: { kycStatus: "under_review" },
        });

        // Nettoyage des anciens scans remplacés
        for (const f of oldFiles) {
            if (f !== rectoUrl && f !== versoUrl) await deletePhysicalFile(f);
        }

        // Alerte des administrateurs
        try {
            const admins = await prisma.user.findMany({
                where: { role: { in: ["ADMIN", "SUPER_ADMIN"] as any } },
                select: { id: true },
                take: 20,
            });
            if (admins.length) {
                await prisma.notification.createMany({
                    data: admins.map((a) => ({
                        userId: a.id,
                        channel: "PUSH",
                        type: "WARNING",
                        title: "Nouvelle pièce d'identité à valider",
                        content: `${fullName || "Un utilisateur"} a déposé sa ${typeConf.label}.`,
                        link: `/admin/validation/${doc.id}`,
                    })),
                });
            }
        } catch (e) {
            console.error("[IDENTITY UPLOAD] Notification admin échouée:", e);
        }

        revalidatePath("/dashboard/profile");
        revalidatePath("/mon-espace-locataire/profile");
        revalidatePath("/admin/validation");

        return NextResponse.json({
            success: true,
            documentId: doc.id,
            message: "Pièce déposée avec succès. Elle sera vérifiée par notre équipe sous 24 à 48h.",
        });
    } catch (error: any) {
        console.error("[IDENTITY UPLOAD ERROR]", error);
        return NextResponse.json({ error: error?.message || "Erreur lors du dépôt de la pièce." }, { status: 500 });
    }
}

