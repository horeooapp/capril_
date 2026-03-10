interface RawLease {
  id: string;
  rentAmount: bigint | number;
  depositAmount?: bigint | number | null;
  chargesAmount?: bigint | number | null;
  tenant?: { id?: string; fullName: string | null; phone?: string; reliabilityScores?: any[] } | null;
  [key: string]: any;
}

interface RawReceipt {
  id: string;
  amount?: bigint | number;
  rentAmount?: bigint | number;
  chargesAmount?: bigint | number;
  totalAmount?: bigint | number;
  paidAt?: Date | string | null;
  [key: string]: any;
}

/**
 * Helper to serialize BigInt and relations for Leases
 */
export const serializeLease = (lease: RawLease | null) => {
    if (!lease) return null
    const tenantData = lease.tenant ? {
        id: lease.tenant.id || null,
        fullName: lease.tenant.fullName,
        phone: lease.tenant.phone || null,
        reliabilityScore: lease.tenant.reliabilityScores?.[0]?.score || 750
    } : null;

    return {
        ...lease,
        rentAmount: Number(lease.rentAmount),
        depositAmount: lease.depositAmount ? Number(lease.depositAmount) : 0,
        chargesAmount: lease.chargesAmount ? Number(lease.chargesAmount) : 0,
        tenant: tenantData
    }
}

/**
 * Helper to serialize BigInt for Receipts
 */
export const serializeReceipt = (receipt: RawReceipt | null) => {
    if (!receipt) return null
    return {
        ...receipt,
        totalAmount: receipt.totalAmount?.toString() || "0",
        rentAmount: receipt.rentAmount?.toString() || "0",
        chargesAmount: receipt.chargesAmount?.toString() || "0",
        paidAt: receipt.paidAt instanceof Date ? receipt.paidAt.toISOString() : receipt.paidAt,
    }
}
