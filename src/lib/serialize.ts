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
  receiptRef?: string;
  receiptHash?: string | null;
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
export const serializeProperty = (property: any): any => {
    if (!property) return null;

    const activeLeases = (property.leases || []).filter((l: any) => 
        !['TERMINATED', 'ARCHIVED'].includes(l.status)
    );

    const serialized = {
        ...property,
        superficieM2: property.superficieM2 ? Number(property.superficieM2) : null,
        declaredRentFcfa: property.declaredRentFcfa ? Number(property.declaredRentFcfa) : 0,
        gpsLatitude: property.gpsLatitude ? Number(property.gpsLatitude) : null,
        gpsLongitude: property.gpsLongitude ? Number(property.gpsLongitude) : null,
        leases: (property.leases || []).map(serializeLease),
        // Recursive serialization for Hierarchy
        units: (property.units || []).map((u: any) => serializeProperty(u)),
        parentProperty: property.parentProperty ? serializeProperty(property.parentProperty) : null,
        // Computed fields for Occupancy Management
        isOccupied: activeLeases.length > 0,
        occupancyStatus: activeLeases.length > 0 ? 'LOUÉ' : 'DISPONIBLE'
    };

    // Final deep serialization to catch remaining Dates/BigInts
    return serializeObject(serialized);
}

/**
 * Helper to serialize BigInt/Decimal and relations for Leases
 */
export const serializeLease = (lease: any) => {
    if (!lease) return null
    
    // MM-04b: Identity Masking logic
    const isAgreee = lease.typeGestion && lease.typeGestion.toLowerCase() === 'agreee';
    const shouldMask = lease.bailleurMasque || isAgreee || 
                       (lease.typeGestion && lease.typeGestion.toLowerCase() === 'mandat');

    let maskedName = lease.landlord?.walletConfig?.landlordCode || "BAI-CODE-PENDING";
    if (isAgreee && lease.agent) {
        const agenceName = lease.agent.legalEntity?.companyName || 
                           ((lease.agent.firstName ? lease.agent.firstName + " " : "") + (lease.agent.lastName || "")).trim() || 
                           "Agence Agréée";
        maskedName = `${maskedName} - ${agenceName}`;
    }

    const landlordData = lease.landlord ? {
        fullName: shouldMask 
            ? maskedName 
            : ((lease.landlord.firstName || lease.landlord.lastName) 
                ? ((lease.landlord.firstName ? lease.landlord.firstName + " " : "") + (lease.landlord.lastName || "")).trim()
                : (lease.landlord.phone || "Propriétaire [Nom non renseigné]")),
        phone: shouldMask ? null : (lease.landlord.phone || null),
        email: shouldMask ? null : (lease.landlord.email || null),
        landlordCode: lease.landlord.walletConfig?.landlordCode || null
    } : null;

    const tenantData = lease.tenant ? {
        id: lease.tenant.id || null,
        fullName: (lease.tenant.firstName || lease.tenant.lastName)
            ? ((lease.tenant.firstName ? lease.tenant.firstName + " " : "") + (lease.tenant.lastName || "")).trim()
            : (lease.tenant.phone ? `Locataire (${lease.tenant.phone})` : "Locataire [Nom non renseigné]"),
        phone: lease.tenant.phone || null,
        // ICL-CONSENT-01: Score transparency requires explicit consent in the lease
        reliabilityScore: lease.scoreConsent ? (lease.tenant.reliabilityScores?.[0]?.score || 750) : null
    } : null;

    const serialized = {
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
        })),
        // Expiration management
        daysSinceCreation: Math.floor((new Date().getTime() - new Date(lease.createdAt).getTime()) / (1000 * 3600 * 24)),
        isExpiringSoon: !['ACTIVE', 'TERMINATED', 'ARCHIVED'].includes(lease.status) && 
                        Math.floor((new Date().getTime() - new Date(lease.createdAt).getTime()) / (1000 * 3600 * 24)) >= 3
    };

    return serializeObject(serialized);
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
        fullName: (user.firstName ? user.firstName + " " : "") + (user.lastName || ""),
        email: user.email,
        role: user.role,
        kycLevel: user.kycLevel ? Number(user.kycLevel) : 0,
        kycStatus: user.kycStatus,
        status: user.status,
        isCertified: user.isCertified,
        onboardingComplete: user.onboardingComplete,
        walletBalance: ((user.walletConfig?.walletConfig?.walletBalance || 0) || 0),
        fraudScore: (user.fraudProfile?.fraudScore || 0),
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
