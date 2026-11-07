import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobile-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, email, name, providerAccountId, role, avatarUrl } = body;

    if (!provider || !["google", "facebook"].includes(provider.toLowerCase())) {
      return NextResponse.json(
        { error: "Fournisseur d'authentification invalide (google ou facebook requis)" },
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
        }).catch(err => console.warn("[OAuth link warning]:", err?.message));
      }

      // Si le rôle de l'utilisateur n'est pas encore défini ou profil incomplet
      if (avatarUrl && !user.avatarUrl) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl }
        }).catch(() => null);
      }
    } else {
      // 2. Création automatique de l'utilisateur
      const rawName = name || normalizedEmail.split("@")[0] || "Utilisateur QAPRIL";
      const parts = rawName.trim().split(/\s+/);
      const firstName = parts[0] || "Utilisateur";
      const lastName = parts.slice(1).join(" ") || "";

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstName,
          lastName,
          avatarUrl: avatarUrl || null,
          role: targetRole,
          status: "ACTIVE",
          emailVerified: true,
          capaciteActive: targetRole === "LANDLORD" ? "PROPRIETAIRE" : "LOCATAIRE",
          onboardingComplete: targetRole === "TENANT",
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

    // 3. Génération du JWT mobile
    const token = await signMobileToken({
      userId: user.id,
      email: user.email!,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        capaciteActive: user.capaciteActive,
        onboardingComplete: user.onboardingComplete,
      }
    });

  } catch (error: any) {
    console.error("[Mobile OAuth error]:", error);
    return NextResponse.json(
      { error: "Échec du traitement de la connexion sociale mobile", details: error?.message },
      { status: 500 }
    );
  }
}
