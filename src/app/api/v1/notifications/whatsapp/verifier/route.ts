import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code requis" }, { status: 400 });
    }

    // Dans un cas d'usage réel:
    // 1. Vérifier si `code` correspond au OTP généré et non expiré
    // 2. Si OK -> passer `waVerifie` à `true`
    
    // Stub simulation: on accepte tout code à 6 chiffres
    if (code.length === 6) {
      await prisma.notificationPreference.update({
        where: { userId: session.user.id },
        data: {
          waVerifie: true,
          waActif: true
        }
      });
      return NextResponse.json({ success: true, message: "WhatsApp vérifié avec succès" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Code invalide" }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[Notifications API] Error resend WA:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
