import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
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

      // Expression régulière pour extraire le loyer
      const loyerMatch = text.match(/loyer.*?(\d{2,}[\s\d]*)/i);
      const extractedLoyer = loyerMatch ? parseInt(loyerMatch[1].replace(/\s/g, '')) : 0;

      // Détection du bailleur et du locataire dans le document
      const bailleurMatch = text.match(/(?:bailleur|propriétaire)\s*[:\-]?\s*([A-ZÀ-ÿ\s]{3,35})/i);
      const locataireMatch = text.match(/(?:locataire|preneur)\s*[:\-]?\s*([A-ZÀ-ÿ\s]{3,35})/i);
      const dureeMatch = text.match(/(\d{1,2})\s*mois/i);

      const realExtraction = {
        loyer: extractedLoyer || 0,
        bailleurNom: bailleurMatch ? bailleurMatch[1].trim() : "",
        locataireNom: locataireMatch ? locataireMatch[1].trim() : "",
        dureeMois: dureeMatch ? parseInt(dureeMatch[1]) : 12,
        texteBrut: text
      };

      await prisma.scanExtraction.update({
        where: { id: scanId },
        data: {
          champsExtraits: realExtraction,
          statutPipeline: "EXTRAIT"
        }
      });

      return NextResponse.json({ success: true, champs: realExtraction });
    }

    return NextResponse.json({ success: true, champs: scan.champsExtraits });
  } catch (error) {
    console.error("Erreur Extraction ING-02:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
