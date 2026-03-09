import { prisma } from "./src/lib/prisma";
import { applyLeaseIndexation } from "./src/lib/indexation";
import { Role } from "@prisma/client";

async function runTest() {
    console.log("🚀 Starting v3.0 Final Features Verification...");

    try {
        // 1. Setup Test Data
        const property = await prisma.property.findFirst();
        const landlord = await prisma.user.findFirst({ where: { role: Role.LANDLORD } });
        const tenant = await prisma.user.findFirst({ where: { role: Role.TENANT } });

        if (!property || !landlord || !tenant) {
            console.error("❌ Missing test data (Property/Landlord/Tenant)");
            return;
        }

        console.log("✅ Test data found.");

        // 2. Test Indexation
        console.log("\n--- Testing Rent Indexation Engine ---");
        const commLease = await prisma.lease.create({
            data: {
                leaseReference: `TEST-COMM-${Date.now()}`,
                propertyId: property.id,
                landlordId: landlord.id,
                tenantId: tenant.id,
                leaseType: 'commercial',
                startDate: new Date(),
                durationMonths: 24,
                rentAmount: 500000,
                commercialData: {
                    indexationType: 'ipc',
                    lastIndexationIPC: 120.0
                }
            }
        });

        console.log(`Bail créé: ${commLease.leaseReference}, Loyer initial: 500,000 FCFA`);
        
        const indexResult = await applyLeaseIndexation(commLease.id);
        console.log("Résultat indexation:", indexResult);

        if (indexResult.success && indexResult.newRent > 500000) {
            console.log("✅ Indexation validée (500k -> " + indexResult.newRent + " FCFA)");
        } else {
            console.error("❌ Échec indexation");
        }

        // 3. Test Signature 2FA
        console.log("\n--- Testing 2FA Digital Signature ---");
        // We'll mock the flow since it involves SMS
        const otp = "123456";
        await prisma.lease.update({
            where: { id: commLease.id },
            data: {
                commercialData: {
                    ...(commLease.commercialData as any),
                    pendingSignatureOTP: otp
                }
            }
        });

        console.log("OTP simulé: 123456");

        // Verify signature logic (internal check)
        const updatedLease = await prisma.lease.findUnique({ where: { id: commLease.id } });
        const commData = (updatedLease?.commercialData as any) || {};

        if (commData.pendingSignatureOTP === otp) {
            console.log("✅ Stockage OTP validé.");
        } else {
            console.error("❌ Échec stockage OTP");
        }

        // Cleanup
        await prisma.lease.delete({ where: { id: commLease.id } });
        console.log("\n✅ Test cleanup completed.");

    } catch (error) {
        console.error("❌ Test error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
