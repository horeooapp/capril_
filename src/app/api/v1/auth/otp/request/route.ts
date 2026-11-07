import { NextResponse } from 'next/server';
import { requestOTP } from '@/actions/auth';

/**
 * POST /api/v1/auth/otp/request
 * Authentic REST API endpoint supporting both Email and Ivorian Phone numbers.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = (body?.identifier || body?.email || body?.phone || '').trim();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Veuillez saisir votre adresse e-mail ou votre numéro de téléphone ivoirien.' },
        { status: 400 }
      );
    }

    const result = await requestOTP(identifier);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Code de sécurité envoyé avec succès.',
      channel: result.channel
    });
  } catch (error: any) {
    console.error('[API AUTH] OTP Request Error:', error?.message || error);
    return NextResponse.json({ error: 'Erreur interne du serveur lors de la requête' }, { status: 500 });
  }
}
