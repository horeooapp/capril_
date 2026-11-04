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

        // Pièce déjà validée : on ne remplace pas si déjà vérifiée
        const existing = await prisma.identityDocument.findFirst({
            where: { userId, docType: { notIn: NON_IDENTITY_TYPES } },
            orderBy: { createdAt: "desc" },
        });
        if (existing?.status === "verified") {
            return NextResponse.json({ error: "Votre identité est déjà validée. Contactez le support pour toute modification." }, { status: 409 });
        }

        const hasExistingRecto = Boolean(existing?.scanS3Key);
        const hasNewRecto = recto && typeof recto !== "string" && recto.size > 0;

        if (!hasExistingRecto && !hasNewRecto) {
            const rectoErr = validateFile(recto, typeConf.needsVerso ? "recto" : "scan");
            if (rectoErr) return NextResponse.json({ error: rectoErr }, { status: 400 });
        } else if (hasNewRecto) {
            const rectoErr = validateFile(recto, typeConf.needsVerso ? "recto" : "scan");
            if (rectoErr) return NextResponse.json({ error: rectoErr }, { status: 400 });
        }

        const existingMeta = (existing?.metadata as any) || {};
        const hasNewVerso = verso && typeof verso !== "string" && verso.size > 0;
        if (hasNewVerso) {
            const versoErr = validateFile(verso, "verso");
            if (versoErr) return NextResponse.json({ error: versoErr }, { status: 400 });
        } else if (typeConf.needsVerso && !existingMeta.versoUrl && !hasExistingRecto) {
            return NextResponse.json({ error: "Le verso de votre pièce est requis." }, { status: 400 });
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
        const rectoUrl = hasNewRecto ? await savePhysicalFile(recto as File, `kyc/${userId}`) : (existing?.scanS3Key || "");
        const versoUrl = hasNewVerso ? await savePhysicalFile(verso as File, `kyc/${userId}`) : (existingMeta.versoUrl || null);

        // Traitement des 3 bulletins de salaire
        let bulletinsSalaireUrls: string[] = Array.isArray(existingMeta.bulletinsSalaireUrls) ? [...existingMeta.bulletinsSalaireUrls] : [];
        const bulletinFiles: (File | null)[] = [
            form.get("bulletin1") as File | null,
            form.get("bulletin2") as File | null,
            form.get("bulletin3") as File | null,
        ];
        const extraBulletins = form.getAll("bulletins") as (File | string)[];
        for (const eb of extraBulletins) {
            if (eb && typeof eb !== "string" && eb.size > 0) {
                bulletinFiles.push(eb);
            }
        }

        for (let i = 0; i < bulletinFiles.length; i++) {
            const bFile = bulletinFiles[i];
            if (bFile && typeof bFile !== "string" && bFile.size > 0) {
                const bErr = validateFile(bFile, `bulletin de salaire ${i + 1}`);
                if (bErr) return NextResponse.json({ error: bErr }, { status: 400 });
                const bUrl = await savePhysicalFile(bFile, `kyc/${userId}/bulletins`);
                if (i < 3) {
                    bulletinsSalaireUrls[i] = bUrl;
                } else {
                    bulletinsSalaireUrls.push(bUrl);
                }
            }
        }
        bulletinsSalaireUrls = bulletinsSalaireUrls.filter(Boolean).slice(0, 3);

        // Traitement de la quittance de loyer / attestation d'hébergement
        const quittanceFile = (form.get("quittance") as File | null) || (form.get("quittanceLoyer") as File | null);
        let quittanceLoyerUrl: string | null = (existingMeta.quittanceLoyerUrl as string) || null;
        if (quittanceFile && typeof quittanceFile !== "string" && quittanceFile.size > 0) {
            const qErr = validateFile(quittanceFile, "quittance de loyer / attestation");
            if (qErr) return NextResponse.json({ error: qErr }, { status: 400 });
            quittanceLoyerUrl = await savePhysicalFile(quittanceFile, `kyc/${userId}/quittances`);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { firstName: true, lastName: true, birthDate: true },
        });
        const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null;
        const docNumberHash = `${userId}_${docType}_${docNumber}`;
        const metadata = {
            ...existingMeta,
            versoUrl,
            bulletinsSalaireUrls,
            quittanceLoyerUrl,
            source: "WEB_PROFILE",
            submittedAt: new Date().toISOString(),
        };

        // Si un autre document porte déjà ce hash pour cet utilisateur, on le réutilise
        const sameHash = await prisma.identityDocument.findUnique({ where: { docNumberHash } });
        const target = sameHash || existing;

        const oldFiles: string[] = [];
        if (target) {
            if (hasNewRecto && target.scanS3Key && target.scanS3Key !== rectoUrl) oldFiles.push(target.scanS3Key);
            if (hasNewVerso && existingMeta.versoUrl && existingMeta.versoUrl !== versoUrl) oldFiles.push(existingMeta.versoUrl);
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
                const hasBulletins = bulletinsSalaireUrls.length > 0;
                const hasQuittance = Boolean(quittanceLoyerUrl);
                const detailsParts = [typeConf.label];
                if (hasBulletins) detailsParts.push(`${bulletinsSalaireUrls.length} bulletin(s)`);
                if (hasQuittance) detailsParts.push("quittance de loyer");
                const docSummary = detailsParts.join(" + ");

                await prisma.notification.createMany({
                    data: admins.map((a) => ({
                        userId: a.id,
                        channel: "PUSH",
                        type: "WARNING",
                        title: "Nouveau dossier KYC à valider",
                        content: `${fullName || "Un utilisateur"} a déposé son dossier (${docSummary}).`,
                        link: `/admin/validation`,
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

