import { prisma } from "./prisma"

/**
 * Generates a unique receipt reference according to v2.0 spec: REC-YYYY-MM-XXXX
 * YYYY: Year
 * MM: Month
 * XXXX: Sequential number (0001-9999)
 */
export async function generateReceiptRef(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const prefix = `REC-${year}-${month}-`

    // Count existing receipts for this month to get next sequence
    const count = await prisma.receipt.count({
        where: {
            receiptRef: {
                startsWith: prefix
            }
        }
    })

    const sequence = (count + 1).toString().padStart(4, '0')
    return `${prefix}${sequence}`
}
