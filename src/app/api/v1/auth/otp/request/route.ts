import { NextResponse } from 'next/server';
import { requestOTP } from '@/actions/auth';

/**
 * POST /api/v1/auth/otp/request
 * Reuses the server action logic for mobile REST API
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await requestOTP(email);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('[API AUTH] OTP Request Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
