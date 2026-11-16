import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ADD-28 : DCL-11
 * Liste des baux sans bien confirmé (pour la carte "Bien à confirmer" du tableau de bord bailleur)
 * Règle RG-DCL-30 & RG-DCL-31
 */

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id;

    const bauxEnAttente = await prisma.lease.findMany({
      where: {
        landlordId: userId,
        adossementStatut: {
          in: ["NON_ADOSSE", "PROPOSE"]
        }
      },
      include: {
        tenant: {
          select: { id: true, name: true, phone: true }
        },
        property: true,
        ficheBail: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalEnAttente: bauxEnAttente.length,
        baux: bauxEnAttente.map((b) => ({
          leaseId: b.id,
          reference: b.leaseReference,
          locataireNom: b.tenant?.name || "Locataire",
          locataireTel: b.tenant?.phone || "",
          loyer: b.rentAmount,
          designation: b.designationDeclaree,
          bienProvisoire: b.property,
          adossementStatut: b.adossementStatut,
          origine: b.origine,
          messageAlerte: "Ce bail n'est pas encore adossé à un bien confirmé. Confirmez en un geste pour activer la pleine valeur probante (RG-DCL-35)."
        }))
      }
    });
  } catch (error: any) {
    console.error("[ADD-28 DCL-11 GET baux en attente]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
