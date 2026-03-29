import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) return NextResponse.json({ error: "Missing email param" });

    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma.user.findFirst({
            where: { email: normalizedEmail }
        });

        if (!user) {
            return NextResponse.json({ 
                found: false, 
                normalizedEmail,
                query: "user.findFirst({ where: { email: " + normalizedEmail + " } })"
            });
        }

        const roleMatch = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
        
        return NextResponse.json({ 
            found: true,
            emailInDb: user.email,
            roleInDb: user.role,
            roleType: typeof user.role,
            roleMatchResult: roleMatch,
            normalizedEmailFromParam: normalizedEmail,
            exactComparisonAdmin: user.role === 'ADMIN',
            exactComparisonSuperAdmin: user.role === 'SUPER_ADMIN'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
