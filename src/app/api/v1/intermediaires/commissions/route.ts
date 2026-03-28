import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Simuler le calcul des commissions pour le mobile
  const mandates = await prisma.mandatGestion.findMany({
    where: { intermediaireId: session.user.id },
    include: {
      proprietaire: true
    }
  });

  return NextResponse.json(mandates);
}
