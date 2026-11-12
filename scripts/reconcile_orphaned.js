
const { PrismaClient } = require('@prisma/client');
const { createAndNotifyReceipt } = require('./src/lib/receipt');

const prisma = new PrismaClient();

async function main() {
    console.log('[RECONCILE] Checking for CONFIRMEE payments without quittance_id...');
    const orphaned = await prisma.paymentPgw.findMany({
        where: {
            statut: 'CONFIRMEE',
            quittanceId: null,
        },
        include: {
            lease: true,
        },
        orderBy: { createdAt: 'asc' }
    });

    console.log(`[RECONCILE] Found ${orphaned.length} orphaned confirmed payment(s).`);

    for (const payment of orphaned) {
        console.log(`Processing payment ${payment.id} (Ref: ${payment.refInterne}, Amount: ${payment.montant}, Canal: ${payment.canal})...`);
        const monthKey = payment.moisConcerne ? payment.moisConcerne.toISOString().substring(0, 7) : new Date().toISOString().substring(0, 7);
        try {
            const receipt = await createAndNotifyReceipt({
                leaseId: payment.leaseId,
                periodMonth: monthKey,
                rentAmount: Math.round(Number(payment.montant) || 0),
                chargesAmount: 0,
                paymentChannel: payment.canal,
                paymentReference: payment.refOperateur || payment.refInterne,
                receiptType: 'RENT',
            });

            await prisma.paymentPgw.update({
                where: { id: payment.id },
                data: { quittanceId: receipt.id }
            });

            console.log(`  -> Receipt issued: ${receipt.receiptRef} (${receipt.periodMonth}) -> linked to payment ${payment.id}`);
        } catch (err) {
            console.error(`  -> ERROR processing payment ${payment.id}:`, err);
        }
    }

    console.log('[RECONCILE] Done.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
