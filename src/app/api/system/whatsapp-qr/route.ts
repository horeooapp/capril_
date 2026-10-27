import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/system/whatsapp-qr?token=SECRET
 * Endpoint public (sans auth) pour récupérer le QR code OpenWA.
 * Protégé par un token secret défini dans WHATSAPP_SETUP_TOKEN.
 * Usage : configuration initiale quand l'admin ne peut pas encore se connecter.
 */
export async function GET(req: NextRequest) {
  const setupToken = process.env.WHATSAPP_SETUP_TOKEN;

  // Si aucun token n'est configuré, désactiver cet endpoint
  if (!setupToken) {
    return NextResponse.json(
      { error: "Endpoint de configuration désactivé (WHATSAPP_SETUP_TOKEN non défini)." },
      { status: 403 }
    );
  }

  // Vérification du token dans les query params
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token !== setupToken) {
    return NextResponse.json(
      { error: "Token de configuration invalide ou manquant." },
      { status: 401 }
    );
  }

  // Proxy vers le conteneur OpenWA
  const openwaUrl = (process.env.OPENWA_API_URL || "http://openwa:8085").replace(/\/$/, "");

  try {
    const res = await fetch(`${openwaUrl}/qr`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          connected: false,
          status: "CONTAINER_ERROR",
          error: `Conteneur OpenWA inaccessible (${res.status})`,
          qr: null,
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: false,
        status: "UNREACHABLE",
        error: `Impossible de contacter OpenWA: ${err?.message || "Délai dépassé"}`,
        qr: null,
      },
      { status: 200 }
    );
  }
}
