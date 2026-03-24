import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TariffService } from "@/lib/pricing/tariff-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const promos = await prisma.codePromo.findMany({
      orderBy: { createdAt: "desc" },
      include: { 
        offreCible: { select: { nomAffichage: true, code: true } },
        createdPar: { select: { fullName: true } }
      },
    });

    return NextResponse.json(promos);
  } catch (error) {
    console.error("Promos GET error:", error);
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
    const { id, code, typeRemise, valeurRemise, offreCibleId, cibleProfil, dateDebut, dateFin, maxUtilisations, actif, note } = body;

    if (!code || !typeRemise || valeurRemise === undefined) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const userId = session.user.id;
    const cleanCode = code.toUpperCase().trim();

    const existing = id ? await prisma.codePromo.findUnique({ where: { id } }) : null;

    const promo = await prisma.codePromo.upsert({
      where: { code: cleanCode },
      update: {
        typeRemise,
        valeurRemise,
        offreCibleId,
        cibleProfil,
        dateDebut: dateDebut ? new Date(dateDebut) : undefined,
        dateFin: dateFin ? new Date(dateFin) : null,
        maxUtilisations,
        actif,
        note,
      },
      create: {
        code: cleanCode,
        typeRemise,
        valeurRemise,
        offreCibleId,
        cibleProfil,
        dateDebut: dateDebut ? new Date(dateDebut) : new Date(),
        dateFin: dateFin ? new Date(dateFin) : null,
        maxUtilisations,
        actif: actif ?? true,
        createdParId: userId,
        note,
      },
    });

    await TariffService.logAudit(
      "codes_promo",
      promo.id,
      existing ? "UPDATE" : "INSERT",
      existing,
      promo,
      userId
    );

    return NextResponse.json(promo);
  } catch (error) {
    console.error("Promos POST error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
