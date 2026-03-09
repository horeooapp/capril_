/**
 * Part 6: Registry & Assets - Utilities
 * Handles smart code generation for Residential (HAB-) and Commercial (COM-) properties.
 */

export const COMMUNE_MAP: Record<string, { city: string; code: string }> = {
    "Yopougon": { city: "ABJ", code: "YOP" },
    "Cocody": { city: "ABJ", code: "COC" },
    "Abobo": { city: "ABJ", code: "ABO" },
    "Plateau": { city: "ABJ", code: "PLA" },
    "Adjame": { city: "ABJ", code: "ADJ" },
    "Treichville": { city: "ABJ", code: "TRE" },
    "Koumassi": { city: "ABJ", code: "KOU" },
    "Marcory": { city: "ABJ", code: "MAR" },
    "Port-Bouet": { city: "ABJ", code: "PBO" },
    "Anyama": { city: "ABJ", code: "ANY" },
    "Songon": { city: "ABJ", code: "SON" },
    "Bingerville": { city: "ABJ", code: "BIN" },
    "Bouake": { city: "BKE", code: "BKE" },
    "Yamoussoukro": { city: "YAK", code: "YAK" },
    "San-Pedro": { city: "SPW", code: "SPW" },
    "Korhogo": { city: "KGO", code: "KGO" },
    "Daloa": { city: "DAL", code: "DAL" },
};

/**
 * Generates a standardized property code.
 * Format: {PREFIX}-{CITY}-{COMMUNE}-{SEQUENCE}
 * Example: HAB-ABJ-YOP-00001
 */
export function generatePropertyCode(
    type: 'residential' | 'commercial',
    commune: string,
    sequence: number
): string {
    const prefix = type === 'residential' ? 'HAB' : 'COM';
    const mapping = COMMUNE_MAP[commune] || { city: "XXX", code: "XXX" };
    
    const seqStr = sequence.toString().padStart(5, '0');
    
    return `${prefix}-${mapping.city}-${mapping.code}-${seqStr}`;
}

export type PropertyValidationChecklist = {
    titleDeedVerified: boolean;
    safeWaterAccess: boolean;
    electricalCompliance: boolean;
    structuralIntegrity: boolean;
    sanitationVerified: boolean;
};

export const DEFAULT_CHECKLIST: PropertyValidationChecklist = {
    titleDeedVerified: false,
    safeWaterAccess: false,
    electricalCompliance: false,
    structuralIntegrity: false,
    sanitationVerified: false,
};
