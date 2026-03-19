"use server"

// Simulation d'une intégration avec un service KYC (ex: Jumio, Onfido ou AWS Textract)
export async function verifyCandidateIdentity(documentUrl: string) {
  // Simulation d'un délai d'analyse OCR/KYC
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Simulation de résultats OCR
  const mockResult = {
    success: true,
    score: 0.98,
    data: {
      firstName: "Moussa",
      lastName: "DILLO",
      idNumber: "ID-CI-2023-45678",
      expiryDate: "2033-10-12",
      documentType: "CARTE_IDENTITE",
      matchConfidence: "HIGH",
      warnings: [] as string[]
    }
  };

  return mockResult;
}

export async function checkSolvencyFintech(revenu: number, loyer: number) {
  // Simulation d'un moteur de scoring Fintech (IA)
  const ratio = revenu / loyer;
  
  return {
    success: true,
    score: ratio >= 3 ? "A+" : ratio >= 2.5 ? "B" : "C",
    riskLevel: ratio >= 3 ? "LOW" : ratio >= 2.5 ? "MEDIUM" : "HIGH",
    recommendation: ratio >= 3 ? "Dossier prioritaire" : "Garant recommandé",
    fintechPreApproval: ratio >= 3
  };
}
