import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { getSMSService } from '@/lib/sms';
import crypto from 'crypto';

/**
 * Part 3.3.1: OTP Code Generation
 * Generates a 6-digit code.
 */
function generateOTP(): string {
  if (process.env.NODE_ENV === 'development') return '123456';
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Part 3: Authentication Request (OTP generation and SMS delivery)
 * POST /api/v1/auth/register
 */
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // 1. Generate OTP
    const otp = generateOTP();
    const ttl = parseInt(process.env.OTP_TTL_SECONDS || '600');

    // 2. Store in Redis with TTL (Part 3.3.3)
    // Key format: otp:phone_number
    if (!redis) {
      return NextResponse.json({ error: 'Redis not available' }, { status: 500 });
    }
    await redis.set(`otp:${phone}`, otp, 'EX', ttl);

    // 3. Send SMS via Gateway (Part 3.3.4)
    const sms = getSMSService();
    const sendResult = await sms.sendOTP(phone, otp);

    if (!sendResult.success) {
       console.error(`[AUTH] Failed to send SMS to ${phone}: ${sendResult.error}`);
       // In prod we might return a standard error, in dev we return more
       return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      expiresInSeconds: ttl 
    });

  } catch (error) {
    console.error('[AUTH REGISTER ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
