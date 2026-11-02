import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrangeSMSStatus, testSMSGateway } from "@/actions/gateway.actions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const status = await getOrangeSMSStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { phone, message, provider } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: "Le numéro de téléphone et le message sont requis." },
        { status: 400 }
      );
    }

    const result = await testSMSGateway(phone, message, provider || "ORANGE");
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erreur lors de l'envoi du test" },
      { status: 500 }
    );
  }
}

