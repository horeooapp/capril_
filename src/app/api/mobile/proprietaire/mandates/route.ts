import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateMobileRequest } from '@/lib/mobile-auth';

/**
 * GET /api/mobile/proprietaire/mandates
 * Mandats de gestion du propriétaire (délégation à une agence/agent)
 *
 * Query: status?, page?, limit?
 */
export async function GET(request: Request) {
    try {
        const user = await authenticateMobileRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') ?? undefined;
        const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1'));
        const limit  = Math.min(50, parseInt(searchParams.get('limit') ?? '20'));
        const skip   = (page - 1) * limit;

        const where: any = { ownerId: user.userId };
        if (status) where.status = status;

        const [mandates, total] = await Promise.all([
            prisma.mandate.findMany({
                where,
                include: {
                    agent: {
                        select: { id: true, firstName: true, lastName: true, phone: true, email: true },
                    },
                    property: {
                        select: { id: true, name: true, address: true, commune: true, propertyCode: true },
                    },
                },
                orderBy: { startDate: 'desc' },
                skip,
                take: limit,
            }),
            prisma.mandate.count({ where }),
        ]);

        const formatted = mandates.map(m => ({
            id:              m.id,
            mandateReference: (m as any).mandateReference ?? `MAN-${m.id.slice(0, 6).toUpperCase()}`,
            status:          m.status,
            type:            (m as any).type ?? 'GESTION',
            startDate:       m.startDate?.toISOString() ?? null,
            endDate:         m.endDate?.toISOString() ?? null,
            commissionRate:  (m as any).commissionRate ?? null,
            agent: m.agent ? {
                id:        m.agent.id,
                firstName: m.agent.firstName,
                lastName:  m.agent.lastName,
                phone:     m.agent.phone,
                email:     m.agent.email,
            } : null,
            property: m.property ? {
                id:           m.property.id,
                name:         m.property.name,
                address:      m.property.address,
                commune:      m.property.commune,
                propertyCode: m.property.propertyCode,
            } : null,
        }));

        return NextResponse.json({
            mandates: formatted,
            pagination: { total, page, limit, pages: Math.ceil(total / limit) },
            summary: {
                actifs:    formatted.filter(m => m.status === 'ACTIVE').length,
                expires:   formatted.filter(m => m.status === 'EXPIRED').length,
                resiliés:  formatted.filter(m => m.status === 'TERMINATED').length,
            },
        });
    } catch (error: any) {
        console.error('[MOBILE] proprietaire/mandates GET error:', error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
