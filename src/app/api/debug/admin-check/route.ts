import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Simple protection
    if (key !== 'qapril_debug_2026') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@qapril.ci' },
            select: {
                id: true,
                email: true,
                role: true,
                password: true, // We'll just check if it's null
            }
        });

        if (!admin) {
            return NextResponse.json({ 
                status: 'NOT_FOUND',
                message: 'Admin user admin@qapril.ci does not exist in the database.'
            });
        }

        return NextResponse.json({
            status: 'FOUND',
            id: admin.id,
            email: admin.email,
            role: admin.role,
            hasPassword: !!admin.password,
            passwordLength: admin.password?.length || 0,
            dbUrlProtocol: process.env.DATABASE_URL?.split(':')[0]
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
