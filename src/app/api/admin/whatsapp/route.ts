import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

function getOpenWaUrl() {
  const url = process.env.OPENWA_API_URL || "http://openwa:8085";
  return url.replace(/\/$/, "");
}

function getOpenWaKey() {
  return process.env.OPENWA_API_KEY || "qapril_wa_secret_2026";
}

/**
 * GET: Récupère l'état de connexion et le QR code actuel de WhatsApp
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const role = (session.user as any).chosenRole || session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès refusé. Réservé aux administrateurs." }, { status: 403 });
  }

  const baseUrl = getOpenWaUrl();

  try {
    const res = await fetch(`${baseUrl}/qr`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          connected: false,
          status: "CONTAINER_ERROR",
          error: `Erreur du conteneur OpenWA (${res.status})`,
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
        error: `Impossible de contacter la passerelle OpenWA (${err?.message || "Délai dépassé"})`,
        qr: null,
      },
      { status: 200 }
    );
  }
}

/**
 * POST: Permet d'envoyer un message de test ou de réinitialiser la session
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const role = (session.user as any).chosenRole || session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const baseUrl = getOpenWaUrl();
  const apiKey = getOpenWaKey();

  if (body.action === "reset") {
    try {
      const res = await fetch(`${baseUrl}/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data);
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
    }
  }

  if (body.action === "test") {
    const phone = body.phone || "+2250707334770";
    let cleanPhone = phone.replace(/[^\d]/g, "");
    if (cleanPhone.length === 10 && cleanPhone.startsWith("0")) {
      cleanPhone = "225" + cleanPhone;
    }
    const chatId = `${cleanPhone}@c.us`;
    const message = body.message || `🔔 *Test QAPRIL WhatsApp*\n\nConnexion à la passerelle OpenWA réussie !\nDate: ${new Date().toLocaleString("fr-FR")}`;

    try {
      const res = await fetch(`${baseUrl}/sendText`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ chatId, content: message }),
        signal: AbortSignal.timeout(10000),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return NextResponse.json({ success: true, messageId: data.response || "sent" });
      }
      return NextResponse.json({ success: false, error: data.error || "Échec d'envoi" }, { status: 400 });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
