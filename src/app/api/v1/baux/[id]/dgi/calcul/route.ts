import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
  try {
    const leaseId = params.id;
    const lease = await prisma.lease.findUnique({ where: { id: leaseId } });

    if (!lease) return NextResponse.json({ error: "Bail introuvable" }, { status: 404 });

    const loyerMensuel = lease.rentAmount;
    const dureeMois = lease.durationMonths;
    const nbPages = 3; // Estimé à 3 pages en moyenne

    // Formule: droits_dgi = (0.025 * loyer_mensuel * duree_mois) + (500 * nb_pages)
    const droitsDgi = (0.025 * loyerMensuel * dureeMois) + (500 * nbPages);

    await prisma.lease.update({
      where: { id: leaseId },
      data: { dgiDroitsCalcules: droitsDgi }
    });

    return NextResponse.json({ success: true, droitsDgi });
  } catch (error) {
    console.error("Erreur Calcul DGI-01:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
