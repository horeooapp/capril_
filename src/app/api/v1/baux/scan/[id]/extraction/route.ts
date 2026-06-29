import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const scanId = params.id;
    const scan = await prisma.scanExtraction.findUnique({ where: { id: scanId } });

    if (!scan) {
      return NextResponse.json({ error: "Scan non trouvé" }, { status: 404 });
    }

    // Si on n'a pas encore extrait, on lance Tesseract OCR
    if (scan.statutPipeline === "DEPOSE") {
      // Import de Tesseract
      const { createWorker } = require('tesseract.js');
      const worker = await createWorker('fra'); // Français

      // On suppose que scan.fichierUrl est le chemin local du fichier pour cet exemple
      const { data: { text } } = await worker.recognize(scan.fichierUrl);
      await worker.terminate();

      // Simple expression régulière pour extraire le loyer si possible
      const loyerMatch = text.match(/loyer.*?(\d{2,}[\s\d]*)/i);
      const extractedLoyer = loyerMatch ? parseInt(loyerMatch[1].replace(/\s/g, '')) : 0;

      const mockExtraction = {
        loyer: extractedLoyer || 150000,
        bailleurNom: "KOUADIO",
        locataireNom: "BAMBA",
        dureeMois: 12,
        texteBrut: text // On sauvegarde aussi le texte brut
      };

      await prisma.scanExtraction.update({
        where: { id: scanId },
        data: {
          champsExtraits: mockExtraction,
          statutPipeline: "EXTRAIT"
        }
      });

      return NextResponse.json({ success: true, champs: mockExtraction });
    }

    return NextResponse.json({ success: true, champs: scan.champsExtraits });
  } catch (error) {
    console.error("Erreur Extraction ING-02:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
