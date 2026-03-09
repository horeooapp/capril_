/**
 * Part 5: Identity Management (KYC)
 * ICAO Doc 9303 MRZ (Machine Readable Zone) Parser
 */

export interface MRZResult {
    isValid: boolean;
    error?: string;
    data?: {
        documentType: string;
        documentNumber: string;
        expiryDate: string; // YYMMDD
        birthDate: string; // YYMMDD
        nationality: string;
        sex?: string;
        issuer: string;
        fullName?: string;
    };
}

/**
 * ICAO 9303 Checksum Calculation
 * Weighting 7-3-1
 */
export function calculateMRZCheckDigit(str: string): number {
    const weights = [7, 3, 1];
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        let val = 0;
        if (char >= '0' && char <= '9') val = char.charCodeAt(0) - 48;
        else if (char >= 'A' && char <= 'Z') val = char.charCodeAt(0) - 55;
        else if (char === '<') val = 0;
        
        sum += val * weights[i % 3];
    }
    return sum % 10;
}

/**
 * Validates Passport (TD3) MRZ (2 lines, 44 chars)
 */
export function parseTD3(line1: string, line2: string): MRZResult {
    if (line1.length !== 44 || line2.length !== 44) {
        return { isValid: false, error: "TD3 lines must be 44 characters" };
    }

    // Line 1: P<CODE<<NAME<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    const documentType = line1.substring(0, 2).replace(/</g, '');
    const issuer = line1.substring(2, 5).replace(/</g, '');
    const names = line1.substring(5, 44).split('<<');
    const fullName = names.map(n => n.replace(/</g, ' ')).join(' ').trim();

    // Line 2: NUMBER<CHECK_DCD_NATION_BIRTH_CHECK_SEX_EXP_CHECK_OPTIONAL_CHECK_COMPOSITE
    const docNumber = line2.substring(0, 9).replace(/</g, '');
    const docCheck = parseInt(line2[9]);
    const nationality = line2.substring(10, 13).replace(/</g, '');
    const birthDate = line2.substring(13, 19).replace(/</g, '');
    const birthCheck = parseInt(line2[19]);
    const sex = line2[20];
    const expiryDate = line2.substring(21, 27).replace(/</g, '');
    const expiryCheck = parseInt(line2[27]);

    // Validation
    if (calculateMRZCheckDigit(line2.substring(0, 9)) !== docCheck) return { isValid: false, error: "Invalid doc number checksum" };
    if (calculateMRZCheckDigit(birthDate) !== birthCheck) return { isValid: false, error: "Invalid birth date checksum" };
    if (calculateMRZCheckDigit(expiryDate) !== expiryCheck) return { isValid: false, error: "Invalid expiry date checksum" };

    return {
        isValid: true,
        data: { documentType, issuer, fullName, documentNumber: docNumber, nationality, birthDate, expiryDate, sex }
    };
}

/**
 * Validates Identity Card (TD1) MRZ (3 lines, 30 chars)
 */
export function parseTD1(line1: string, line2: string, line3: string): MRZResult {
    if (line1.length !== 30 || line2.length !== 30 || line3.length !== 30) {
        return { isValid: false, error: "TD1 lines must be 30 characters" };
    }

    // Line 1: TYPE_CODE_NUMBER<CHECK_OPTIONAL
    const documentType = line1.substring(0, 2).replace(/</g, '');
    const issuer = line1.substring(2, 5).replace(/</g, '');
    const docNumber = line1.substring(5, 14).replace(/</g, '');
    const docCheck = parseInt(line1[14]);

    // Line 2: BIRTH_CHECK_SEX_EXP_CHECK_NATION_OPTIONAL_COMPOSITE
    const birthDate = line2.substring(0, 6);
    const birthCheck = parseInt(line2[6]);
    const sex = line2[7];
    const expiryDate = line2.substring(8, 14);
    const expiryCheck = parseInt(line2[14]);
    const nationality = line2.substring(15, 18);

    // Line 3: NAMES
    const names = line3.split('<<');
    const fullName = names.map(n => n.replace(/</g, ' ')).join(' ').trim();

    // Validation
    if (calculateMRZCheckDigit(line1.substring(5, 14)) !== docCheck) return { isValid: false, error: "Invalid doc number checksum" };
    if (calculateMRZCheckDigit(birthDate) !== birthCheck) return { isValid: false, error: "Invalid birth date checksum" };
    if (calculateMRZCheckDigit(expiryDate) !== expiryCheck) return { isValid: false, error: "Invalid expiry date checksum" };

    return {
        isValid: true,
        data: { documentType, issuer, fullName, documentNumber: docNumber, nationality, birthDate, expiryDate, sex }
    };
}

/**
 * Part 5.4: Identity Deduplication SHA256
 */
export async function generateIdentityHash(docNumber: string, fullName: string, birthDate: string): Promise<string> {
    const normalizedName = fullName.toUpperCase().replace(/\s+/g, '').trim();
    const data = `${docNumber.toUpperCase()}|${normalizedName}|${birthDate}`;
    
    // Using Web Crypto API (available in Next.js Edge/Server)
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
