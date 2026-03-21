import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch preferences
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId }
    });

    if (!prefs) {
      // Default creation if it doesn't exist
      prefs = await prisma.notificationPreference.create({
        data: {
          userId,
          waActif: true,
          emailActif: false,
          smsActif: true,
          pushActif: true,
          heureDebut: 7,
          heureFin: 21,
          evenementsActifs: {
            "QUITTANCE_GENEREE": ["wa", "sms", "email"],
            "PAIEMENT_RECU": ["wa", "sms"],
            "IMPAYE_DETECTE": ["wa", "sms"],
            "BAIL_CONFIRME": ["wa", "sms", "email"],
            "RAPPORT_MENSUEL": ["wa", "email"],
            "WALLET_BAS": ["wa", "sms"],
            "BAIL_EXPIRANT": ["wa", "sms"]
          }
        }
      });
    }

    return NextResponse.json({ preferences: prefs }, { status: 200 });

  } catch (error: any) {
    console.error("[Notifications API] Error GET preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    // Partial update of the user's notification preferences
    const updatedPrefs = await prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        waActif: body.waActif,
        waNumero: body.waNumero,
        emailActif: body.emailActif,
        emailAdresse: body.emailAdresse,
        smsActif: body.smsActif,
        pushActif: body.pushActif,
        heureDebut: body.heureDebut,
        heureFin: body.heureFin,
        // Optional override of events
        ...(body.evenementsActifs ? { evenementsActifs: body.evenementsActifs } : {})
      },
      create: {
        userId,
        waActif: body.waActif ?? true,
        waNumero: body.waNumero,
        emailActif: body.emailActif ?? false,
        emailAdresse: body.emailAdresse,
        smsActif: body.smsActif ?? true,
        pushActif: body.pushActif ?? true,
        heureDebut: body.heureDebut ?? 7,
        heureFin: body.heureFin ?? 21,
        evenementsActifs: body.evenementsActifs ?? {
          "QUITTANCE_GENEREE": ["wa", "sms", "email"],
          "PAIEMENT_RECU": ["wa", "sms"],
          "IMPAYE_DETECTE": ["wa", "sms"],
          "BAIL_CONFIRME": ["wa", "sms", "email"],
          "RAPPORT_MENSUEL": ["wa", "email"],
          "WALLET_BAS": ["wa", "sms"],
          "BAIL_EXPIRANT": ["wa", "sms"]
        }
      }
    });

    return NextResponse.json({ preferences: updatedPrefs }, { status: 200 });

  } catch (error: any) {
    console.error("[Notifications API] Error PUT preferences:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
