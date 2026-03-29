import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/jwt';

/**
 * GET /api/v1/locataires/me/tickets
 * Returns maintenance tickets/reclamations for the tenant
 */
export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = await prisma.reclamationLocataire.findMany({
      where: { tenantId: user.id },
      include: {
        lease: {
          select: { leaseReference: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mapping = tickets.map(t => ({
      id: t.id,
      type: t.typeReclamation,
      description: t.description,
      statut: t.statut === 'OUVERT' ? 'Envoyé' : (t.statut === 'RESOLU' ? 'Résolu' : 'En cours'),
      date: t.createdAt.toISOString(),
      echeance: t.dateEcheance.toISOString(),
      reference: t.lease.leaseReference
    }));

    return NextResponse.json(mapping);
  } catch (error: any) {
    console.error('[API LOCATAIRE] Get Tickets Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/v1/locataires/me/tickets
 * Creates a new ticket (Reclamation)
 */
export async function POST(req: Request) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, description, leaseId } = body;

    // Default SLA of 7 days
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEcheance.getDate() + 7);

    const ticket = await prisma.reclamationLocataire.create({
      data: {
        tenantId: user.id,
        leaseId,
        typeReclamation: type || 'RCL-01',
        description,
        dateEcheance,
        statut: 'OUVERT'
      }
    });

    return NextResponse.json({ success: true, id: ticket.id });
  } catch (error: any) {
    console.error('[API LOCATAIRE] Create Ticket Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
