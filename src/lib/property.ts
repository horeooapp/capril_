import { prisma } from "./prisma";

/**
 * Part 5.1: Unique Property Code Generation
 * Format: [PREFIX]-[YYYY]-[COUNT]
 * PREFIX: HAB (Residential), COM (Commercial)
 */
export async function generatePropertyCode(leaseType: 'residential' | 'commercial'): Promise<string> {
    const prefix = leaseType === 'residential' ? 'HAB' : 'COM';
    const year = new Date().getFullYear();
    
    const count = await prisma.property.count({
        where: {
            leaseType: leaseType,
            createdAt: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            }
        }
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${prefix}-${year}-${sequence}`;
}
