import { NextResponse } from 'next/server';
import { requestOTP } from '@/actions/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "L'email est requis" }, { status: 400 });
        }

        // Call the existing server action logic
        const result = await requestOTP(email);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[MOBILE API] request-otp error:", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}
