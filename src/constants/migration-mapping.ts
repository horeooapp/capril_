"use server"

/**
 * QAPRIL - Module M-MIGRATION
 * Dictionnaire de normalisation des en-têtes Excel/CSV.
 * Permet de reconnaître les colonnes même si l'agence utilise ses propres noms.
 */

export const COLUMN_MAPPING: Record<string, string[]> = {
    // Logement
    logement_nom: ['nom', 'logement', 'bien', 'adresse', 'libelle', 'designation', 'appartement', 'maison', 'studio', 'chambre', 'local'],
    loyer: ['loyer', 'loyer mensuel', 'montant loyer', 'loyer hc', 'loyer brut', 'montant', 'prix'],
    commune: ['commune', 'ville', 'localite', 'zone', 'secteur'],
    quartier: ['quartier', 'secteur', 'zone'],
    type_bien: ['type', 'categorie', 'nature'],

    // Locataire
    locataire_nom: ['nom', 'nom locataire', 'locataire', 'occupant', 'tenant'],
    locataire_prenom: ['prenom', 'first name', 'postnom'],
    telephone: ['tel', 'telephone', 'mobile', 'portable', 'gsm', 'numero'],
    email: ['email', 'e-mail', 'courriel'],

    // Paiement
    mois_paiement: ['mois', 'periode', 'mois concerne', 'date loyer'],
    montant_paye: ['montant', 'paye', 'paiement', 'encaisse', 'recu', 'somme'],
    date_paiement: ['date', 'date paiement', 'date encaissement', 'recu le'],

    // Bail
    date_entree: ['entree', 'entree locataire', 'date entree', 'depuis'],
    date_sortie: ['sortie', 'depart', 'date sortie', 'jusqu a'],
};

/**
 * Normalise un nom de colonne pour le matching.
 */
export function normalizeHeader(headerName: string): string {
    return headerName.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .replace(/[^a-z0-9 ]/g, '') // Supprime les caractères spéciaux
        .trim();
}

/**
 * Détecte la clé QAPRIL correspondant à un en-tête de fichier.
 */
export function detectQaprilKey(headerName: string): string | null {
    const normalized = normalizeHeader(headerName);
    for (const [qaprilKey, variants] of Object.entries(COLUMN_MAPPING)) {
        if (variants.some(v => normalized.includes(v))) return qaprilKey;
    }
    return null;
}
