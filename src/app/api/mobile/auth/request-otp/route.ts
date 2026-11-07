import { NextResponse } from 'next/server';
import { requestOTP } from '@/actions/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const identifier = (body.identifier || body.email || body.phone || '').trim();

        if (!identifier) {
            return NextResponse.json(
                { error: "Veuillez renseigner votre adresse e-mail ou votre numéro de téléphone ivoirien." },
                { status: 400 }
            );
        }

        // Appel de l'action centralisée supportant e-mail et numéro ivoirien
        const result = await requestOTP(identifier);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            channel: result.channel || "PHONE",
            message: "Code de sécurité envoyé avec succès."
        });
    } catch (error: any) {
        console.error("[MOBILE API] request-otp error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur lors de la demande OTP." }, { status: 500 });
    }
}
