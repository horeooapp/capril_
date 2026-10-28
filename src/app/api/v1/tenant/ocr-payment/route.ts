import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const leaseId = formData.get("leaseId") as string;

        if (!file || !leaseId) {
            return NextResponse.json({ error: "Fichier ou Lease ID manquant." }, { status: 400 });
        }

        // 1. Simuler l'upload d'un fichier et l'analyse AWS Textract / GPT-4 Vision
        await new Promise(resolve => setTimeout(resolve, 2000)); // Attente de 2s

        // 2. Extraire (ou simuler) les infos
        const extractedAmount = Math.floor(Math.random() * 80000 + 40000); // Ex: 40k -> 120k XOF
        const paymentDate = new Date().toISOString();

        // Plus tard : on peut utiliser Prisma pour créer un historique dans la table Transaction 
        // ou Paiement avec un statut EN_ATTENTE. Pour l'instant, on se contente de l'OCR.
        
        return NextResponse.json({
            success: true,
            data: {
                amount: extractedAmount,
                dueDate: paymentDate,
                confidence: 0.94,
                invoiceUrl: `/uploads/mock-transfer.pdf`
            }
        });

    } catch (error: any) {
        console.error("Erreur API OCR Paiement:", error);
        return NextResponse.json({ error: "Erreur lors de l'analyse OCR du virement." }, { status: 500 });
    }
}
