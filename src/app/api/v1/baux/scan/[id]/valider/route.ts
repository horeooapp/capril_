import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const scanId = params.id;
    const data = await req.json(); // Les champs corrigés/validés par l'humain

    const scan = await prisma.scanExtraction.findUnique({ where: { id: scanId } });
    if (!scan) return NextResponse.json({ error: "Scan introuvable" }, { status: 404 });

    // Générer SHA-256 du fichier scanné (Simulé ici)
    const hash = crypto.createHash('sha256').update(scan.fichierUrl).digest('hex');

    // On valide l'extraction
    const updatedScan = await prisma.scanExtraction.update({
      where: { id: scanId },
      data: {
        champsValides: data.champs,
        statutPipeline: "VALIDE"
      }
    });

    // TODO: Créer l'entité Lease correspondante (Bail SCANNÉ)
    // const lease = await prisma.lease.create({ ... })

    return NextResponse.json({ success: true, message: "Champs validés", scanId });
  } catch (error) {
    console.error("Erreur Validation ING-03:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
