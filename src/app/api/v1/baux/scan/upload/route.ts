import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // TODO: Sauvegarder le fichier chiffré dans le Storage (S3 / Local)
    const mockFichierUrl = `/storage/scans/${Date.now()}_${file.name}`;

    // Créer l'entrée dans ScanExtraction
    const scan = await prisma.scanExtraction.create({
      data: {
        fichierUrl: mockFichierUrl,
        statutPipeline: "DEPOSE",
      }
    });

    return NextResponse.json({ success: true, scanId: scan.id, message: "Fichier déposé avec succès" });
  } catch (error) {
    console.error("Erreur Upload ING-01:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
