import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TariffService } from "@/lib/pricing/tariff-service";

export const dynamic = "force-dynamic";

/**
 * ADMIN TARIFF API - ADD-12
 * GET: List all config tariffs
 * POST: Update or Create a tariff config
 */

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const tariffs = await prisma.configTarif.findMany({
      orderBy: { cle: "asc" },
      include: { modifiePar: { select: { fullName: true } } },
    });

    return NextResponse.json(tariffs);
  } catch (error) {
    console.error("Tariffs GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, cle, valeur, description, note } = body;

    if (!cle || valeur === undefined) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const userId = session.user.id;

    // Fetch existing for audit
    const existing = id ? await prisma.configTarif.findUnique({ where: { id } }) : null;

    const tariff = await prisma.configTarif.upsert({
      where: { cle },
      update: {
        valeur,
        description,
        noteModification: note,
        modifieParId: userId,
        modifieAt: new Date(),
        valeurPrecedente: existing ? existing.valeur : null,
      },
      create: {
        cle,
        valeur,
        description,
        modifiable: true,
        modifieParId: userId,
        modifieAt: new Date(),
      },
    });

    // Log to Audit table
    await TariffService.logAudit(
      "config_tarifs",
      tariff.id,
      existing ? "UPDATE" : "INSERT",
      existing,
      tariff,
      userId
    );

    return NextResponse.json(tariff);
  } catch (error) {
    console.error("Tariffs POST error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
