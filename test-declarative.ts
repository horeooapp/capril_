import { prisma } from './src/lib/prisma';
import { createAndNotifyReceipt } from './src/lib/receipt';

async function run() {
    try {
        const lease = await prisma.lease.findFirst({
            where: { tenantId: null }
        });

        if (!lease) {
            console.log("No lease WITHOUT tenant found");
            return;
        }

        console.log("Testing with lease WITHOUT tenant:", lease.id);

        const receipt = await createAndNotifyReceipt({
            leaseId: lease.id,
            periodMonth: "2026-03",
            rentAmount: lease.rentAmount,
            chargesAmount: 0,
            paymentChannel: "MOBILE_MONEY",
            receiptType: "DECLARATIVE",
            bypassPaywall: true,
            creatorName: "Test Declarative Creator"
        });

        console.log("SUCCESS");
    } catch(e) {
        console.error("FAIL:", e);
    } finally {
        await prisma.$disconnect()
    }
}

run();
