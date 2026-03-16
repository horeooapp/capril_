interface RawLease {
  id: string;
  rentAmount: any;
  depositAmount?: any;
  chargesAmount?: any;
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
 * Helper to serialize BigInt/Decimal and relations for Properties
 */
export const serializeProperty = (property: any) => {
    if (!property) return null
    return {
        ...property,
        areaSqm: property.areaSqm ? Number(property.areaSqm) : null,
        declaredRentFcfa: property.declaredRentFcfa ? Number(property.declaredRentFcfa) : 0,
        gpsLatitude: property.gpsLatitude ? Number(property.gpsLatitude) : null,
        gpsLongitude: property.gpsLongitude ? Number(property.gpsLongitude) : null,
        leases: (property.leases || []).map(serializeLease)
    }
}

/**
 * Helper to serialize BigInt/Decimal and relations for Leases
 */
export const serializeLease = (lease: any) => {
    if (!lease) return null
    
    const tenantData = lease.tenant ? {
        id: lease.tenant.id || null,
        fullName: lease.tenant.fullName,
        phone: lease.tenant.phone || null,
        reliabilityScore: lease.tenant.reliabilityScores?.[0]?.score || 750
    } : null;

    return {
        ...lease,
        rentAmount: Number(lease.rentAmount || 0),
        depositAmount: Number(lease.depositAmount || 0),
        chargesAmount: Number(lease.chargesAmount || 0),
        tenant: tenantData,
        cdcDeposits: (lease.cdcDeposits || []).map((dep: any) => ({
            ...dep,
            amount: Number(dep.amount || 0)
        })),
        receipts: (lease.receipts || []).map((rec: any) => ({
            ...rec,
            rentAmount: Number(rec.rentAmount || 0),
            chargesAmount: Number(rec.chargesAmount || 0),
            totalAmount: Number(rec.totalAmount || 0),
            paidAt: rec.paidAt instanceof Date ? rec.paidAt.toISOString() : rec.paidAt
        }))
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

/**
 * Helper to serialize BigInt/Decimal for Users
 */
export const serializeUser = (user: any) => {
    if (!user) return null
    return {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        kycLevel: user.kycLevel ? Number(user.kycLevel) : 0,
        kycStatus: user.kycStatus,
        status: user.status,
        isCertified: user.isCertified,
        notificationPrefs: user.notificationPrefs
    }
}

/**
 * Safe stringify that handles BigInt
 */
export const safeStringify = (obj: any) => {
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    }, 2);
}
