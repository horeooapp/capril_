import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { signJWT } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { email, otp, role } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const requestedRole = role || 'TENANT';

    // 1. Verify OTP in Redis
    let storedOtp: string | null = null;
    if (redis) {
      storedOtp = await redis.get(`otp:${normalizedEmail}`);
    }

    if (!storedOtp || storedOtp !== otp) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // 2. Clear OTP
    if (redis) await redis.del(`otp:${normalizedEmail}`);

    // 3. Find or Create User
    let user;
    try {
      user = await prisma.user.findFirst({
        where: { email: normalizedEmail }
      });

      if (!user) {
        console.log(`[API AUTH] Creating new user for ${normalizedEmail}`);
        // Ensure the dummy phone is short enough and unique
        const timestamp = Date.now().toString().slice(-8);
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            role: requestedRole as any,
            status: 'PENDING_PROFILE',
            phone: `TEMP_${timestamp}`
          }
        });
      }
    } catch (dbError: any) {
      console.error('[API AUTH] Database Error (User Lookup/Create):', dbError.message);
      return NextResponse.json({ error: 'Database synchronization error' }, { status: 500 });
    }

    // 4. Generate JWT
    try {
      const token = await signJWT({ userId: user.id, role: user.role });

      return NextResponse.json({
        success: true,
        token,
        profile: user.role.toLowerCase(),
        userId: user.id,
        onboardingComplete: !!(user as any).onboardingComplete
      });
    } catch (jwtError: any) {
      console.error('[API AUTH] JWT Signing Error:', jwtError.message);
      return NextResponse.json({ 
        error: 'Security token generation failed', 
        details: process.env.NODE_ENV === 'development' ? jwtError.message : undefined 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[API AUTH] Unexpected OTP Verify Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
