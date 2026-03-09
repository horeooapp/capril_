import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export const MANDATE_TYPES = {
    RENTAL: "rental",
    MANAGEMENT_SIMPLE: "management_simple",
    MANAGEMENT_EXTENDED: "management_extended",
};

/**
 * Part 12.1: Generate Mandate Reference
 * Format: MAN-{YYYY}-{SEQUENCE}-{ENTITY}
 */
export async function generateMandateRef(agentId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();

    const count = await prisma.mandate.count({
        where: {
            startDate: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`)
            }
        }
    });

    const sequence = (count + 1).toString().padStart(5, '0');
    return `MAN-${year}-${sequence}`;
}

/**
 * Part 12.2: Commission Cap Enforcement
 * Enforce max 15% as per Ivorian practices.
 */
export function validateCommission(pct: number): boolean {
    return pct >= 0 && pct <= 15;
}

/**
 * Part 12.3: Mandate-Property Restriction Check
 * Properties for professional accounts must have a valid mandate.
 */
export async function isPropertyAuthorized(propertyId: string) {
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { owner: true }
    });

    if (!property) return false;

    // Professional roles require a mandate
    if (property.owner.role === 'LANDLORD_PRO' || property.owner.role === 'AGENCY') {
        const activeMandate = await prisma.mandate.findFirst({
            where: {
                propertyId,
                status: 'active',
                endDate: { gt: new Date() }
            }
        });
        return !!activeMandate;
    }

    return true; // Private landlords don't strictly require one for this module
}
