"use server"

// Simulation d'une intégration avec un modèle de Vision (ex: GPT-4o ou Gemini Pro Vision)
export async function analyzeMaintenanceImage(imageBase64: string) {
  // En production, nous ferions ici un appel API
  // const response = await openai.chat.completions.create({...})

  // Simulation d'un délai de traitement par l'IA
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Logique de simulation de diagnostic basée sur des patterns (pour la démo)
  const insights = [
    {
      type: "FUITE_EAU",
      confidence: 0.92,
      analysis: "Présence de corrosion sur le raccord en cuivre. Probabilité de joint défectueux.",
      suggestion: "Couper l'arrivée d'eau et prévoir un plombier pour remplacement de joint 15/21.",
      gravity: "CRITIQUE"
    },
    {
      type: "COURT_CIRCUIT",
      confidence: 0.85,
      analysis: "Traces de brûlures visibles sur la prise murale.",
      suggestion: "Ne plus utiliser la prise. Mandater un électricien pour vérification du câblage.",
      gravity: "HAUTE"
    },
    {
      type: "MANDAT_FAURE", // Juste un mock
      confidence: 0.70,
      analysis: "L'image montre un climatiseur avec des ailettes encrassées.",
      suggestion: "Nettoyage des filtres nécessaire. Pas d'intervention lourde requise.",
      gravity: "MINEURE"
    }
  ];

  // On retourne une analyse aléatoire parmi celles-ci pour la démo
  const result = insights[Math.floor(Math.random() * insights.length)];

  return {
    success: true,
    data: result
  };
}
