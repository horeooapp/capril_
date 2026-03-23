import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateDeepLink, Operator } from "@/lib/wallet/deeplinks";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const operator = (searchParams.get("operator") || "WAVE") as Operator;
  const amount = parseInt(searchParams.get("amount") || "0");

  if (amount <= 0) {
    return NextResponse.json({ error: "Montant invalide" }, { status: 400 });
  }

  const ref = `RECH-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  try {
    // 0. Récupérer les données utilisateur pour les métriques
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        walletBalance: true,
        _count: {
          select: { leasesAsLandlord: { where: { status: "ACTIVE" } } }
        }
      }
    });

    if (!user) throw new Error("Utilisateur non trouvé");

    // 1. Générer l'URL brute de l'opérateur
    const rawUrl = await generateDeepLink(operator, amount, ref);

    // 2. Créer l'entrée dans les logs pour le tracking
    const rechargeLink = await prisma.walletRechargeLink.create({
      data: {
        userId: session.user.id,
        declencheur: "MANUEL", // Par défaut pour cet endpoint
        operateur: operator,
        montantSuggere: amount,
        soldeAuMoment: user.walletBalance,
        nbBailsActifs: user._count.leasesAsLandlord,
        urlGeneree: rawUrl,
        canalEnvoi: "APP",
        expireAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
      }
    });

    // 3. L'URL finale est celle du tracker
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const trackerUrl = `${baseUrl}/api/v1/wallet/deeplink/${rechargeLink.id}/tracker`;

    return NextResponse.json({
      url: trackerUrl,
      rawUrl,
      ref,
      message: `👉 Recharger ${amount} FCFA sur ${operator} → ${trackerUrl}`
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
