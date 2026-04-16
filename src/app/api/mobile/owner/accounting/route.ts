import { NextResponse } from 'next/server';
import { verifyMobileToken } from '@/lib/mobile-auth';
import { BilanService } from '@/lib/bilan-service';
import { BulkReceiptService } from '@/lib/bulk-receipt-service';
import { generateYearlyBilanPDF } from '@/lib/pdf-reports';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { token, action, year, month } = body;

        if (!token) return NextResponse.json({ error: "Token requis" }, { status: 401 });

        const payload = await verifyMobileToken(token);
        if (!payload) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

        const userId = payload.userId;

        if (action === 'GET_YEARLY_BILAN') {
            const data = await BilanService.aggregateYearlyData(userId, year || new Date().getFullYear());
            return NextResponse.json({ success: true, bilan: data });
        }

        if (action === 'GENERATE_YEARLY_PDF') {
            const data = await BilanService.aggregateYearlyData(userId, year || new Date().getFullYear());
            const pdfBuffer = await generateYearlyBilanPDF(data);
            
            // On renvoie le PDF en base64 pour le mobile ou on pourrait le stocker sur S3
            return NextResponse.json({ 
                success: true, 
                pdfBase64: pdfBuffer.toString('base64'),
                fileName: `Bilan_QAPRIL_${data.year}_${data.ownerName.replace(/\s+/g, '_')}.pdf`
            });
        }

        if (action === 'GET_BULK_STATS') {
             const stats = await BulkReceiptService.getBulkStats(userId, month, year);
             return NextResponse.json({ success: true, stats });
        }

        if (action === 'EXECUTE_BULK_QUITTANCES') {
            const results = await BulkReceiptService.generateMissingForOwner(userId, month, year);
            return NextResponse.json({ success: true, results });
        }

        return NextResponse.json({ error: "Action non valide" }, { status: 400 });

    } catch (error: any) {
        console.error("Erreur Accounting API:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
