import { NextResponse } from "next/server";
import { calculerDroitsEnregistrement, validateLeaseInput } from "@/lib/lease-validation";

/**
 * GET / POST /api/v1/baux/calculer-dgi
 * Ticket S-06 : Récapitulatif des droits d'enregistrement calculé avant signature
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const rentAmount = Number(searchParams.get("loyer") || searchParams.get("rentAmount")) || 0;
        const durationMonths = searchParams.get("duree") || searchParams.get("durationMonths") || 12;

        const result = calculerDroitsEnregistrement(rentAmount, Number(durationMonths));
        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Erreur de calcul DGI" }, { status: 400 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const rentAmount = Number(body.loyer ?? body.rentAmount) || 0;
        const durationMonths = body.duree ?? body.durationMonths;
        const depositAmount = body.depositAmount ?? body.caution;
        const avanceLoyer = body.avanceLoyer ?? body.avance;

        // Validation des plafonnements légaux et de la durée obligatoire si demandée
        if (durationMonths !== undefined || depositAmount !== undefined || avanceLoyer !== undefined) {
            const validation = validateLeaseInput({
                rentAmount,
                depositAmount,
                avanceLoyer,
                durationMonths,
            });

            if (!validation.isValid) {
                return NextResponse.json({
                    error: validation.error,
                    code: validation.code,
                    errors: validation.errors,
                    maxLegalDeposit: validation.maxLegalDeposit,
                    maxLegalAdvance: validation.maxLegalAdvance,
                }, { status: 422 });
            }

            return NextResponse.json({
                success: true,
                recapitulatifDroitsEnregistrement: validation.recapitulatifDroitsEnregistrement,
                maxLegalDeposit: validation.maxLegalDeposit,
                maxLegalAdvance: validation.maxLegalAdvance,
            });
        }

        const result = calculerDroitsEnregistrement(rentAmount, Number(durationMonths) || 12);
        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Erreur de calcul DGI" }, { status: 400 });
    }
}
