import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkDataExportAccess } from "@/lib/privacy-monitor";
import { logPrivacyEvent } from "@/lib/consent-manager";
import { getUserSelectForRole, sanitizeForApi } from "@/lib/data-minimization";
import { generateProofHash } from "@/lib/proof";

/**
 * Endpoint d'export des données personnelles (Droit à la portabilité - Art. 20 RGPD)
 * Exporte les données de l'utilisateur au format JSON structuré et sécurisé.
 * 
 * Accès : Limité à l'utilisateur lui-même ou à un admin.
 * Rate Limité : Maximum 5 exports par jour.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const targetUserId = (await params).id;
    const isSelf = session.user.id === targetUserId;
    const isAdmin = session.user.role === "SUPER_ADMIN";

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // Rate Limiting (Privacy by Design - Proactive Monitoring)
    const accessCheck = await checkDataExportAccess(session.user.id);
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: `Limite d'export atteinte (${accessCheck.threshold}/jour). Veuillez patienter.` },
        { status: 429 }
      );
    }

    // Récupérer les données avec minimisation (ne pas inclure les mots de passe, etc.)
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: getUserSelectForRole(isSelf ? "SELF" : "SUPER_ADMIN", { isOwnData: isSelf }),
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Récupérer les données liées pertinentes pour la portabilité
    const consents = await prisma.userConsent.findMany({
      where: { userId: targetUserId },
      select: { typeConsentement: true, granted: true, grantedAt: true, revokedAt: true, source: true },
    });

    const identityDocuments = await prisma.identityDocument.findMany({
      where: { userId: targetUserId },
      select: { docType: true, status: true, verifiedAt: true }, // Ne pas exporter les scans/MRZ
    });

    const activeLeases = await prisma.lease.findMany({
      where: { tenantId: targetUserId, status: "ACTIVE" },
      select: { id: true, startDate: true, endDate: true, rentAmount: true },
    });

    // Construire le payload
    const rawPayload = {
      user: sanitizeForApi(user),
      consents,
      identityDocuments,
      activeLeases,
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        format: "application/json",
        version: "1.0",
      },
    };

    // Générer une signature cryptographique pour garantir l'intégrité de l'export
    const signature = await generateProofHash(JSON.stringify(rawPayload));

    const exportData = {
      ...rawPayload,
      signature,
    };

    // Log Privacy Event
    await logPrivacyEvent({
      userId: targetUserId,
      eventType: "DATA_EXPORTED",
      severity: "INFO",
      resource: "users.data_export",
      details: { requesterId: session.user.id, signature },
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0] || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(exportData, {
      headers: {
        "Content-Disposition": `attachment; filename="donnees_personnelles_${targetUserId}.json"`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[DataExport] Error exporting data:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'export." },
      { status: 500 }
    );
  }
}
