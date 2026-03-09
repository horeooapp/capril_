import { prisma } from "./prisma";
import crypto from "node:crypto";

/**
 * Part 9.1: Generate Standardized Receipt Reference
 * Format: REC-{YYYY}-{MM}-{SEQUENCE}-{T/C}
 * T = Tenant (Residential), C = Commercial
 */
export async function generateReceiptRef(leaseType: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const typeCode = leaseType === 'commercial' ? 'C' : 'T';

    const count = await prisma.receipt.count({
        where: {
            createdAt: {
                gte: new Date(`${year}-${month}-01`),
                lt: new Date(year, now.getMonth() + 1, 1),
            }
        }
    });

    const sequence = (count + 1).toString().padStart(5, '0');
    return `REC-${year}-${month}-${sequence}-${typeCode}`;
}

/**
 * Part 9.2: Generate Unique QR Token
 */
export function generateQRToken(): string {
    return 'QR-' + crypto.randomBytes(12).toString('hex').toUpperCase();
}

/**
 * Part 9.3: SHA-256 Content Hashing for Integrity
 */
export async function calculateReceiptHash(data: {
    leaseId: string;
    periodMonth: string;
    totalAmount: number;
    paidAt: Date;
}): Promise<string> {
    const content = `${data.leaseId}|${data.periodMonth}|${data.totalAmount}|${data.paidAt.toISOString()}`;
    const msgUint8 = new TextEncoder().encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
