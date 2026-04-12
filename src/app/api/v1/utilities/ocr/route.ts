import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const typeUtility = formData.get("typeUtility") as string; // CIE | SODECI
        const leaseId = formData.get("leaseId") as string;

        if (!file || !typeUtility) {
            return NextResponse.json({ error: "Fichier ou type manquant." }, { status: 400 });
        }

        // 1. Simuler l'upload d'un fichier sur AWS S3 / Serveur local
        const mockInvoiceUrl = `/uploads/${typeUtility.toLowerCase()}-${Date.now()}.pdf`;

        const Tesseract = await import('tesseract.js');
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const { data: { text } } = await Tesseract.default.recognize(buffer, 'fra', { logger: () => {} });

        let extractedAmount = 0;
        let confidence = 0.5;

        // RegExp to match Total or Net à payer.
        const regexMontant = /(?:net|total)[^0-9]*?(?:a|à)?\s*(?:payer)?\s*[:=\s]*([0-9\s]+(?:[.,][0-9]{1,2})?)/i;
        const match = text.match(regexMontant);

        if (match && match[1]) {
            const montantStr = match[1].replace(/\s+/g, '').replace(',', '.');
            extractedAmount = parseFloat(montantStr);
            confidence = 0.92;
        } else {
            const allNumbers = text.match(/\b\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,2})?\b/g);
            if (allNumbers) {
                const numericVals = allNumbers.map((n: string) => parseFloat(n.replace(/\s+/g, '').replace(',', '.'))).filter((n: number) => !isNaN(n));
                if (numericVals.length > 0) extractedAmount = Math.max(...numericVals);
                confidence = 0.75;
            }
        }

        if (extractedAmount <= 0) {
             return NextResponse.json({ error: "L'IA n'a pas pu identifier le montant avec certitude. Veuillez procéder par saisie manuelle." }, { status: 400 });
        }
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15); // Délai standard CIE/SODECI

        let facture = null;

        // 3. Optionnel : Si leaseId est fourni, pré-créer la facture
        if (leaseId && leaseId !== "LOCATAIRE_SESSION_MOCK") {
            facture = await prisma.factureUtility.create({
                data: {
                    leaseId,
                    acteurId: session.user.id,
                    roleActeur: session.user.role === 'TENANT' ? 'LOCATAIRE' : 'PROPRIO',
                    typeUtility: typeUtility as any,
                    identifiantCompteur: `COMPT-OCR-${Math.floor(Math.random() * 99999)}`,
                    moisFacture: new Date().toISOString().slice(0, 7),
                    montantTotal: extractedAmount,
                    dateLimitePaiement: dueDate,
                    statut: "EN_COURS",
                    source: "OCR_TESSERACT",
                    modeUtilities: "INDIVIDUEL_LOCATAIRE" as any,
                    invoiceUrl: mockInvoiceUrl
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                amount: extractedAmount,
                dueDate: dueDate.toISOString(),
                confidence: confidence,
                invoiceUrl: mockInvoiceUrl,
                factureId: facture?.id
            }
        });

    } catch (error: any) {
        console.error("Erreur API OCR:", error);
        return NextResponse.json({ error: "Erreur lors de l'analyse OCR." }, { status: 500 });
    }
}
