import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/jwt';
import crypto from 'crypto';

/**
 * POST /api/v1/diaspora/invite
 * Generates a 7-day HMAC SHA-256 secure invitation link.
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    // Role check: Only Diaspora
    if (!user || (user as any).profileType !== 'DIASPORA') {
      return NextResponse.json({ error: 'Réservé aux comptes Diaspora' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { email } = body;

    // We create a stateless HMAC token containing the inviter's ID, the invitee's email, and an expiration timestamp (7 days)
    const expiration = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    const payload = `${user.id}:${email || 'undisclosed'}:${expiration}`;
    
    // In production, use a secure secret from env
    const secret = process.env.NEXTAUTH_SECRET || 'qapril-secure-key-2026';
    
    const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    
    // Encode payload as base64 for URL transmission
    const encodedPayload = Buffer.from(payload).toString('base64');
    const token = `${encodedPayload}.${hmac}`;
    const link = `https://qapril.ci/d/${token.substring(0, 12)}...`;

    // In a real flow, an email would be sent to `email` via Resend/Nodemailer here
    // await sendInvitationEmail(email, link);

    return NextResponse.json({ 
        success: true, 
        message: `Lien d'invitation HMAC sécurisé généré avec succès. Il expirera dans 7 jours.`,
        token,
        link
    });

  } catch (error: any) {
    console.error('[API DIASPORA] Invite Generate Error:', error);
    return NextResponse.json({ error: 'Erreur technique lors de la création du lien.' }, { status: 500 });
  }
}
