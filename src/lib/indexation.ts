 
import { prisma } from "./prisma";
import { writeAuditLog } from "./audit";

export type IndexationResult = {
    success: boolean;
    oldRent: number;
    newRent: number;
    percentageChange: number;
    error?: string;
};

/**
 * Mock function for Ivorian Consumer Price Index (IPC CI)
 * In production, this would fetch from an official API or a monthly updated table.
 */
export async function getLatestIPCCI(): Promise<number> {
    // March 2026 Reference: 124.5 (hypothetical)
    return 124.5;
}

/**
 * Part 13.2: Apply Rent Indexation Engine
 * Formula: NewRent = OldRent * (NewIPC / OldIPC)
 */
export async function applyLeaseIndexation(leaseId: string): Promise<IndexationResult> {
    const lease = await prisma.lease.findUnique({
        where: { id: leaseId },
        select: {
            id: true,
            rentAmount: true,
            commercialData: true,
            leaseType: true,
            status: true,
            landlordId: true
        }
    });

    if (!lease) return { success: false, oldRent: 0, newRent: 0, percentageChange: 0, error: "Bail introuvable." };
    if (lease.leaseType !== 'commercial') {
        return { success: false, oldRent: 0, newRent: 0, percentageChange: 0, error: "L'indexation s'applique uniquement aux baux commerciaux." };
    }

    const commData = (lease.commercialData as any) || {};
    if (commData.indexationType !== 'ipc') {
        return { success: false, oldRent: 0, newRent: 0, percentageChange: 0, error: "Ce bail n'utilise pas l'indexation IPC." };
    }

    const oldIPC = commData.lastIndexationIPC || 100; // Default to 100 if none recorded
    const newIPC = await getLatestIPCCI();

    if (newIPC === oldIPC) {
        return { success: true, oldRent: lease.rentAmount, newRent: lease.rentAmount, percentageChange: 0 };
    }

    const multiplier = newIPC / oldIPC;
    const newRent = Math.round(lease.rentAmount * multiplier);
    const percentageChange = ((multiplier - 1) * 100);

    // Update Lease
    await prisma.lease.update({
        where: { id: leaseId },
        data: {
            rentAmount: newRent,
            commercialData: {
                ...commData,
                lastIndexationIPC: newIPC,
                lastIndexationDate: new Date()
            }
        }
    });

    // Audit Log
    await writeAuditLog({
        userId: lease.landlordId,
        action: "INDEXATION_APPLIED",
        module: "LEASE",
        entityId: leaseId,
        oldValues: { rentAmount: lease.rentAmount, ipc: oldIPC },
        newValues: { rentAmount: newRent, ipc: newIPC }
    });

    return {
        success: true,
        oldRent: lease.rentAmount,
        newRent: newRent,
        percentageChange: parseFloat(percentageChange.toFixed(2))
    };
}
