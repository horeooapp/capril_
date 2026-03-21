/**
 * Part 21: Assisted KYC Validation Engine (Simulated)
 * Extracts data from documents and flags anomalies for human-in-the-loop review.
 */

export interface KYCDocumentAnalysis {
    isValid: boolean
    confidence: number // 0-1
    extractedData: {
        fullName?: string
        docNumber?: string
        expiryDate?: string
        nationality?: string
    }
    flags: string[] // Issues found
}

export async function analyzeIdentityDocument(s3Key: string): Promise<KYCDocumentAnalysis> {
    // In a real scenario, this would call an OCR/IA API (Google Cloud Vision, AWS Textract)
    // Here we simulate the AI analysis with predictable outcomes for demonstration
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 2000))

    const isFraud = s3Key.toLowerCase().includes("fraud") || s3Key.toLowerCase().includes("fake")
    const isFail = s3Key.toLowerCase().includes("blur") || s3Key.toLowerCase().includes("fail")

    if (isFraud || isFail) {
        return {
            isValid: false,
            confidence: isFraud ? 0.32 : 0.55,
            extractedData: {
                fullName: isFraud ? "DOSSIER SUSPECT" : "NOM ILLISIBLE",
                docNumber: "XXXXXXXXXXX"
            },
            flags: isFraud 
                ? ["TENTATIVE_FRAUDE", "MRZ_NON_CONFORME", "PIXEL_ANOMALY"]
                : ["IMAGE_FLOU", "BASSE_RESOLUTION", "CHAMPS_MANQUANTS"]
        }
    }

    // Default Success Simulation
    return {
        isValid: true,
        confidence: 0.99,
        extractedData: {
            fullName: "Amah Koné",
            docNumber: "CI" + Math.floor(Math.random() * 1000000000),
            expiryDate: "2032-06-15",
            nationality: "CIV"
        },
        flags: []
    }
}

/**
 * Updates KYC level based on verification
 */
export function calculateNextKYCLevel(currentLevel: number, docType: string): number {
    if (docType === "CNI_CI" || docType === "PASSPORT") return Math.max(currentLevel, 2)
    if (docType === "RCCM") return 4
    return currentLevel
}
