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

        // 2. Simuler l'appel à une API Vision (ex: OpenAI GPT-4o Vision)
        // Dans le monde réel :
        // const response = await openai.chat.completions.create({
        //     model: "gpt-4-vision-preview",
        //     messages: [{ role: "user", content: [
        //         { type: "text", text: "Extrais le montantTTC et la Date limite de paiement de cette facture" },
        //         { type: "image_url", image_url: { url: imageBufferUrl } }
        //     ]}]
        // })
        await new Promise(resolve => setTimeout(resolve, 2500)); // Simule l'attente du LLM

        // Fake AI data
        const extractedAmount = typeUtility === "CIE" ? Math.floor(Math.random() * 45000 + 15000) : Math.floor(Math.random() * 15000 + 5000);
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15); // La facture CIE vient avec +- 15 jours de délai

        let facture = null;

        // 3. Optionnel : Si leaseId est fourni, pré-créer la facture
        if (leaseId) {
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
                    source: "OCR_VISION",
                    modeUtilities: "PARTAGE_PROPRIO" as any,
                    invoiceUrl: mockInvoiceUrl
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                amount: extractedAmount,
                dueDate: dueDate.toISOString(),
                confidence: 0.98,
                invoiceUrl: mockInvoiceUrl,
                factureId: facture?.id
            }
        });

    } catch (error: any) {
        console.error("Erreur API OCR:", error);
        return NextResponse.json({ error: "Erreur lors de l'analyse OCR." }, { status: 500 });
    }
}
