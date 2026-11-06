import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobile-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, email, name, providerAccountId, role, avatarUrl } = body;

    if (!provider || !["google", "facebook", "apple"].includes(provider.toLowerCase())) {
      return NextResponse.json(
        { error: "Fournisseur d'authentification invalide (google, facebook ou apple requis)" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Une adresse email valide est requise pour l'authentification sociale" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedProvider = provider.toLowerCase().trim();
    const targetAccountId = providerAccountId || `${normalizedProvider}_${Buffer.from(normalizedEmail).toString("base64")}`;

    // Rôle cible
    const isLandlordRole = ["LANDLORD", "PROPRIETAIRE", "BAILLEUR"].includes(String(role).toUpperCase());
    const targetRole = isLandlordRole ? "LANDLORD" : "TENANT";

    // 1. Recherche de l'utilisateur par email
    let user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      include: { accounts: true }
    });

    if (user) {
      // Vérifier si le compte OAuth est déjà lié
      const hasAccount = user.accounts.some(
        (a) => a.provider === normalizedProvider && a.providerAccountId === targetAccountId
      );

      if (!hasAccount) {
        await prisma.account.create({
          data: {
            userId: user.id,
            type: "oauth",
            provider: normalizedProvider,
            providerAccountId: targetAccountId,
          }
        });
      }

      // Si l'utilisateur se connecte sur l'application propriétaire et a encore le rôle TENANT par défaut
      if (isLandlordRole && user.role === "TENANT") {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: "LANDLORD" },
          include: { accounts: true }
        });
      }
    } else {
      // 2. Création d'un nouvel utilisateur
      const nameParts = (name || "").trim().split(" ");
      const firstName = nameParts[0] || normalizedEmail.split("@")[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstName,
          lastName,
          avatarUrl: avatarUrl || null,
          role: targetRole,
          emailVerified: new Date(),
          status: "ACTIVE",
          accounts: {
            create: {
              type: "oauth",
              provider: normalizedProvider,
              providerAccountId: targetAccountId,
            }
          }
        },
        include: { accounts: true }
      });
    }

    // 3. Génération du JWT mobile sécurisé
    const token = await signMobileToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      }
    });
  } catch (error: any) {
    console.error("[MOBILE API] /auth/oauth error:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'authentification sociale mobile" },
      { status: 500 }
    );
  }
}
