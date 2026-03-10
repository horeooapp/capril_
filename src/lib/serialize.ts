/**
 * Helper to serialize BigInt and relations for Leases
 */
export const serializeLease = (lease: any) => {
    if (!lease) return null
    return {
        ...lease,
        rentAmount: lease.rentAmount?.toString(),
        depositAmount: lease.depositAmount?.toString(),
        chargesAmount: lease.chargesAmount?.toString(),
        tenant: lease.tenant ? {
            ...lease.tenant,
            reliabilityScore: lease.tenant.reliabilityScores?.[0]?.score || 750
        } : null
    }
}

/**
 * Helper to serialize BigInt for Receipts
 */
export const serializeReceipt = (receipt: any) => {
    if (!receipt) return null
    return {
        ...receipt,
        totalAmount: receipt.totalAmount?.toString(),
        rentAmount: receipt.rentAmount?.toString(),
        chargesAmount: receipt.chargesAmount?.toString(),
        paidAt: receipt.paidAt instanceof Date ? receipt.paidAt.toISOString() : receipt.paidAt,
    }
}
