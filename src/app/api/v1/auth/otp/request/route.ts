import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sendOTPEmail } from '@/lib/email';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/v1/auth/otp/request
 * Authentic REST API endpoint for mobile devices.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse e-mail invalide ou manquante' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otp = generateOTP();
    const ttl = parseInt(process.env.OTP_TTL_SECONDS || '600');

    if (!redis) {
        console.error("[API AUTH] Redis not available");
        return NextResponse.json({ error: 'Service temporairement indisponible (Redis)' }, { status: 503 });
    }
    await redis.set(`otp:${normalizedEmail}`, otp, 'EX', ttl);

    const emailResult = await sendOTPEmail(normalizedEmail, otp);
    if (!emailResult.success) {
        console.error(`[API AUTH] Failed to send email to ${normalizedEmail}:`, emailResult.error);
        return NextResponse.json({ error: 'Échec de l\'envoi de l\'e-mail OTP' }, { status: 500 });
    }

    console.log(`[API AUTH] OTP ${otp} sent to ${normalizedEmail}`);
    return NextResponse.json({ success: true, message: 'OTP envoyé avec succès' });

  } catch (error: any) {
    console.error('[API AUTH] OTP Request Error:', error?.message || error);
    return NextResponse.json({ error: 'Erreur interne du serveur lors de la requête' }, { status: 500 });
  }
}
