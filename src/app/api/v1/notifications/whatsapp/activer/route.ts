import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { numero } = await req.json();

    if (!numero) {
      return NextResponse.json({ error: "Numéro requis" }, { status: 400 });
    }

    // Dans un cas d'usage réel:
    // 1. Générer code OTP 6 chiffres (ex: 123456)
    // 2. Stocker le code OTP en base ou Redis avec une durée de vie (10 minutes)
    // 3. Envoyer le code OTP par SMS ou directement sur WhatsApp pour vérifier le numéro
    
    // Stub
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId: session.user.id }
    });

    if (prefs) {
      await prisma.notificationPreference.update({
        where: { userId: session.user.id },
        data: {
          waNumero: numero,
          waVerifie: false // Doit être validé avec l'OTP
        }
      });
    }

    return NextResponse.json({ success: true, message: "OTP envoyé (simulation)" }, { status: 200 });

  } catch (error: any) {
    console.error("[Notifications API] Error actif WA:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
