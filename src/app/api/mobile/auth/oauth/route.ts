import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signMobileToken } from "@/lib/mobile-auth";

/**
 * Valide un id_token Google auprès de l'API de vérification Google
 */
async function verifyGoogleIdToken(idToken: string): Promise<{ email: string; email_verified: boolean; name?: string } | null> {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.email && (data.email_verified === "true" || data.email_verified === true)) {
      return {
        email: data.email,
        email_verified: true,
        name: data.name || data.given_name,
      };
    }
  } catch (e) {
    console.error("[OAuth Security] Erreur validation jeton Google:", e);
  }
  return null;
}

/**
 * Valide un access_token Facebook auprès de l'API Graph Facebook
 */
async function verifyFacebookAccessToken(accessToken: string): Promise<{ email?: string; name?: string } | null> {
  try {
    const res = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.email) {
      return { email: data.email, name: data.name };
    }
  } catch (e) {
    console.error("[OAuth Security] Erreur validation jeton Facebook:", e);
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, idToken, accessToken, providerAccountId, role, avatarUrl } = body;

    if (!provider || !["google", "facebook"].includes(provider.toLowerCase())) {
      return NextResponse.json(
        { error: "Fournisseur d'authentification invalide (google ou facebook requis)" },
        { status: 400 }
      );
    }

    const normalizedProvider = provider.toLowerCase().trim();
    let verifiedEmail: string | null = null;
    let verifiedName: string | null = body.name || null;

    // 1. Validation cryptographique obligatoire du jeton d'authentification tiers
    if (normalizedProvider === "google") {
      if (!idToken) {
        return NextResponse.json(
          { error: "Jeton Google OAuth (idToken) obligatoire pour une connexion sécurisée." },
          { status: 401 }
        );
      }
      const googleData = await verifyGoogleIdToken(idToken);
      if (!googleData || !googleData.email) {
        return NextResponse.json(
          { error: "Jeton Google invalide ou expiré." },
          { status: 401 }
        );
      }
      verifiedEmail = googleData.email.toLowerCase().trim();
      verifiedName = googleData.name || verifiedName;
    } else if (normalizedProvider === "facebook") {
      if (!accessToken) {
        return NextResponse.json(
          { error: "Jeton Facebook OAuth (accessToken) obligatoire pour une connexion sécurisée." },
          { status: 401 }
        );
      }
      const fbData = await verifyFacebookAccessToken(accessToken);
      if (!fbData || !fbData.email) {
        return NextResponse.json(
          { error: "Jeton Facebook invalide ou adresse email non autorisée." },
          { status: 401 }
        );
      }
      verifiedEmail = fbData.email.toLowerCase().trim();
      verifiedName = fbData.name || verifiedName;
    }

    if (!verifiedEmail) {
      return NextResponse.json(
        { error: "Impossible de valider l'identité avec le fournisseur social." },
        { status: 401 }
      );
    }

    const targetAccountId = providerAccountId || `${normalizedProvider}_${Buffer.from(verifiedEmail).toString("base64")}`;

    // Rôle cible (restriction stricte : pas d'ADMIN ou SUPER_ADMIN par OAuth)
    const isLandlordRole = ["LANDLORD", "PROPRIETAIRE", "BAILLEUR"].includes(String(role).toUpperCase());
    const targetRole = isLandlordRole ? "LANDLORD" : "TENANT";

    // 2. Recherche de l'utilisateur par l'email vérifié
    let user = await prisma.user.findFirst({
      where: { email: verifiedEmail },
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

      if (avatarUrl && !user.avatarUrl) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl }
        }).catch(() => null);
      }
    } else {
      // 3. Création automatique de l'utilisateur avec email cryptographiquement vérifié
      const rawName = verifiedName || verifiedEmail.split("@")[0] || "Utilisateur QAPRIL";
      const parts = rawName.trim().split(/\s+/);
      const firstName = parts[0] || "Utilisateur";
      const lastName = parts.slice(1).join(" ") || "";

      user = await prisma.user.create({
        data: {
          email: verifiedEmail,
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

    // 4. Génération du JWT mobile
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
