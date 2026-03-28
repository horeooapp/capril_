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
    
    // MM-04b: Identity Masking logic
    const shouldMask = lease.bailleurMasque || 
                       (lease.typeGestion && lease.typeGestion.toLowerCase() === 'agreee') ||
                       (lease.typeGestion && lease.typeGestion.toLowerCase() === 'mandat');

    const landlordData = lease.landlord ? {
        fullName: shouldMask ? (lease.landlord.landlordCode || "BAI-CODE-PENDING") : (lease.landlord.fullName || lease.landlord.name || "N/A"),
        phone: shouldMask ? null : (lease.landlord.phone || null),
        email: shouldMask ? null : (lease.landlord.email || null),
        landlordCode: lease.landlord.landlordCode || null
    } : null;

    const tenantData = lease.tenant ? {
        id: lease.tenant.id || null,
        fullName: lease.tenant.fullName || lease.tenant.name || null,
        phone: lease.tenant.phone || null,
        // ICL-CONSENT-01: Score transparency requires explicit consent in the lease
        reliabilityScore: lease.scoreConsent ? (lease.tenant.reliabilityScores?.[0]?.score || 750) : null
    } : null;

    return {
        ...lease,
        rentAmount: Number(lease.rentAmount || 0),
        depositAmount: Number(lease.depositAmount || 0),
        chargesAmount: Number(lease.chargesAmount || 0),
        totalFiscalBail: Number(lease.totalFiscalBail || 0),
        droitsEnregistrement: Number(lease.droitsEnregistrement || 0),
        fraisTimbre: Number(lease.fraisTimbre || 0),
        loyerTotalFcfa: Number(lease.loyerTotalFcfa || 0),
        landlord: landlordData,
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
        onboardingComplete: user.onboardingComplete,
        walletBalance: user.walletBalance,
        fraudScore: user.fraudScore,
        diasporaAbonnement: user.diasporaAbonnement,
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
/**
 * Deep serialization for Prisma results (Dates, BigInt, etc.)
 */
export const serializeObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    // Handle Dates
    if (obj instanceof Date) return obj.toISOString();
    
    // Handle BigInt
    if (typeof obj === 'bigint') return obj.toString();
    
    // Handle Arrays
    if (Array.isArray(obj)) {
        return obj.map(item => serializeObject(item));
    }
    
    // Handle Objects
    if (typeof obj === 'object') {
        const serialized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            // Check for Prisma Decimal (has toFixed or is recognized differently)
            if (value && typeof value === 'object' && (value as any).constructor?.name === 'Decimal') {
                serialized[key] = Number(value);
            } else {
                serialized[key] = serializeObject(value);
            }
        }
        return serialized;
    }
    
    return obj;
}
