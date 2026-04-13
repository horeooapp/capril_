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

        // 1. Convert file to buffer and base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');
        const mediaType = file.type || 'image/jpeg';

        let extractedAmount = 0;
        let dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15); // Default fallback
        let confidence = 0.5;
        let method = "TESSERACT";

        const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

        if (ANTHROPIC_API_KEY) {
            try {
                const response = await fetch("https://api.anthropic.com/v1/messages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01"
                    },
                    body: JSON.stringify({
                        model: "claude-3-5-sonnet-20240620",
                        max_tokens: 1024,
                        messages: [
                            {
                                role: "user",
                                content: [
                                    {
                                        type: "image",
                                        source: {
                                            type: "base64",
                                            media_type: mediaType.includes('pdf') ? 'image/jpeg' : mediaType, // Claude doesn't support PDF directly in Vision yet, but we'll try or fallback
                                            data: base64Image
                                        }
                                    },
                                    {
                                        type: "text",
                                        text: `Extrais les informations de cette facture ${typeUtility} (Côte d'Ivoire). 
                                        Donne moi uniquement un JSON avec : 
                                        - "amount": le montant TOTAL NET À PAYER (nombre entier)
                                        - "dueDate": la date limite de paiement au format YYYY-MM-DD
                                        - "confidence": ton niveau de certitude (0 à 1)
                                        Si tu ne trouves pas, mets 0 pour amount.`
                                    }
                                ]
                            }
                        ]
                    })
                });

                if (response.ok) {
                    const aiData = await response.json();
                    const aiText = aiData.content.find((c: any) => c.type === "text")?.text || "";
                    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        extractedAmount = parsed.amount || 0;
                        if (parsed.dueDate) dueDate = new Date(parsed.dueDate);
                        confidence = parsed.confidence || 0.8;
                        method = "CLAUDE_35_VISION";
                    }
                }
            } catch (aiErr) {
                console.error("AI OCR Error, falling back to Tesseract:", aiErr);
            }
        }

        // 2. Fallback to Tesseract if AI failed or no key
        if (extractedAmount <= 0) {
            const Tesseract = await import('tesseract.js');
            const { data: { text } } = await Tesseract.default.recognize(buffer, 'fra', { logger: () => {} });
            
            console.log("[OCR_RAW_TEXT]", text);

            // RegExp to match Total or Net à payer.
            const regexMontant = /(?:net|total|régl|payer)[^0-9]*?(?:a|à)?\s*(?:payer)?\s*[:=\s]*([0-9\s]+(?:[.,][0-9]{1,2})?)/i;
            const match = text.match(regexMontant);

            if (match && match[1]) {
                const montantStr = match[1].replace(/\s+/g, '').replace(',', '.');
                extractedAmount = parseFloat(montantStr);
                confidence = 0.85;
            } else {
                const allNumbers = text.match(/\b\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{1,2})?\b/g);
                if (allNumbers) {
                    const numericVals = allNumbers.map((n: string) => parseFloat(n.replace(/\s+/g, '').replace(',', '.'))).filter((n: number) => !isNaN(n));
                    if (numericVals.length > 0) extractedAmount = Math.max(...numericVals);
                    confidence = 0.6;
                }
            }
            method = "TESSERACT_FALLBACK";
        }

        if (extractedAmount <= 0) {
             return NextResponse.json({ error: "L'IA n'a pas pu identifier le montant. Votre facture est peut-être floue. Veuillez utiliser la saisie manuelle." }, { status: 400 });
        }
        
        const mockInvoiceUrl = `/uploads/${typeUtility.toLowerCase()}-${Date.now()}.pdf`;

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
                    source: `OCR_${method}` as any,
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
