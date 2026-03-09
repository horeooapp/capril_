import { prisma } from "./prisma";

/**
 * Part 6.1: Unique Lease Reference Generation
 * Format: {RES/COM}-[YYYY]-[COUNT]
 */
export async function generateLeaseRef(type: 'residential' | 'commercial'): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = type === 'residential' ? 'RES' : 'COM';
    
    // Count existing leases of same type in the current year
    const count = await prisma.lease.count({
        where: {
            leaseType: type,
            createdAt: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            }
        }
    });

    const sequence = (count + 1).toString().padStart(5, '0');
    return `${prefix}-${year}-${sequence}`;
}
