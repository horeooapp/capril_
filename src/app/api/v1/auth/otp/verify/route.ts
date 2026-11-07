import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { signJWT } from '@/lib/jwt';
import { normalizePhone } from '@/lib/phone';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = (body?.identifier || body?.email || body?.phone || '').trim();
    const otp = (body?.otp || '').trim();
    const requestedRole = body?.role || 'TENANT';

    if (!identifier || !otp) {
      return NextResponse.json({ error: 'Identifiant et code OTP requis' }, { status: 400 });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const cleanPhone = identifier.replace(/[\s-]/g, '');
    const isPhone = !isEmail && /^\+?[0-9]{8,15}$/.test(cleanPhone);

    const normalizedEmail = isEmail ? identifier.toLowerCase() : null;
    const normalizedPhone = isPhone ? normalizePhone(cleanPhone) : null;

    // 1. Verify OTP in Redis
    let isValid = false;
    if (redis) {
      if (isEmail && normalizedEmail) {
        const stored = await redis.get(`otp:${normalizedEmail}`);
        if (stored === otp) {
          isValid = true;
          await redis.del(`otp:${normalizedEmail}`);
        }
      } else if (normalizedPhone) {
        const stored1 = await redis.get(`otp:${normalizedPhone}`);
        const stored2 = await redis.get(`otp:${cleanPhone}`);
        if (stored1 === otp || stored2 === otp) {
          isValid = true;
          await redis.del(`otp:${normalizedPhone}`);
          await redis.del(`otp:${cleanPhone}`);
        }
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Code de sécurité incorrect ou expiré' }, { status: 401 });
    }

    // 2. Find or Create User
    let user = await prisma.user.findFirst({
      where: isEmail
        ? { email: normalizedEmail! }
        : {
            OR: [
              { phone: normalizedPhone! },
              { phone: normalizedPhone!.replace('+', '') },
              { phone: cleanPhone }
            ]
          }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          phone: normalizedPhone || `PENDING_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          role: requestedRole as any,
          status: 'PENDING_PROFILE',
          onboardingComplete: requestedRole === 'TENANT',
          capaciteActive: requestedRole
        }
      });
    }

    // 3. Generate JWT
    const token = await signJWT({ userId: user.id, role: user.role });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error('[API AUTH] OTP Verify Error:', error?.message || error);
    return NextResponse.json({ error: 'Erreur interne lors de la vérification' }, { status: 500 });
  }
}
