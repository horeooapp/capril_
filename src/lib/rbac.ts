/**
 * Matrice de contrôle d'accès basée sur les rôles (RBAC) pour QAPRIL.
 * 
 * Les 4 profils stricts :
 * 1. TENANT (Locataire)
 * 2. LANDLORD / PROPRIETAIRE (Propriétaire)
 * 3. AGENCY / AGENCE_AGREE (Agence Agréée)
 * 4. NON_CERTIFIED_AGENT / INTERMEDIARY (Démarcheur / Intermédiaire)
 */

export type UserProfileType = 'TENANT' | 'LANDLORD' | 'AGENCY' | 'BROKER' | 'ADMIN';

export function normalizeProfileRole(roleOrCapacity?: string | null): UserProfileType {
    const r = (roleOrCapacity || '').toUpperCase().trim();
    
    if (['SUPER_ADMIN', 'ADMIN'].includes(r)) return 'ADMIN';
    if (['TENANT', 'LOCATAIRE'].includes(r)) return 'TENANT';
    if (['AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE'].includes(r)) return 'AGENCY';
    if (['NON_CERTIFIED_AGENT', 'AGENCE_NON_AGREE', 'AGENCY_NON_AGREE', 'INTERMEDIARY', 'INTERMEDIAIRE', 'CHAMPION'].includes(r)) return 'BROKER';
    
    // Par défaut Propriétaire / Bailleur / Diaspora
    return 'LANDLORD';
}

/**
 * Liste exhaustive des routes autorisées par profil dans le Dashboard
 */
export const ALLOWED_DASHBOARD_ROUTES: Record<UserProfileType, string[]> = {
    // 1. Locataire : Redirigé systématiquement vers /mon-espace-locataire
    TENANT: [],

    // 2. Propriétaire : Gestion patrimoniale directe uniquement
    LANDLORD: [
        '/dashboard',
        '/dashboard/properties',
        '/dashboard/leases',
        '/dashboard/receipts',
        '/dashboard/disputes',
        '/dashboard/inspections',
        '/dashboard/maintenance',
        '/dashboard/fiscal',
        '/dashboard/documents',
        '/dashboard/certificates',
        '/dashboard/wallet',
        '/dashboard/insurance',
        '/dashboard/succession',
        '/dashboard/syndic',
        '/dashboard/agenda',
        '/dashboard/communications',
        '/dashboard/profile',
        '/dashboard/manual',
    ],

    // 3. Agence Agréée : Gestion déléguée, mandats, CRG, équipe et observatoire
    AGENCY: [
        '/dashboard',
        '/dashboard/mandates',
        '/dashboard/properties',
        '/dashboard/leases',
        '/dashboard/receipts',
        '/dashboard/matching',
        '/dashboard/agenda',
        '/dashboard/communications',
        '/dashboard/wallet',
        '/dashboard/certificates',
        '/dashboard/reports',
        '/dashboard/insurance',
        '/dashboard/disputes',
        '/dashboard/procurations',
        '/dashboard/fiscal',
        '/dashboard/charges',
        '/dashboard/providers',
        '/dashboard/inspections',
        '/dashboard/team',
        '/dashboard/profile',
        '/dashboard/observatory',
        '/dashboard/manual',
    ],

    // 4. Démarcheur / Intermédiaire : Mandats de prospection, candidatures, commissions
    BROKER: [
        '/dashboard',
        '/dashboard/mandates',
        '/dashboard/properties',
        '/dashboard/matching',
        '/dashboard/agenda',
        '/dashboard/communications',
        '/dashboard/receipts',
        '/dashboard/wallet',
        '/dashboard/marketplace',
        '/dashboard/profile',
        '/dashboard/manual',
    ],

    // Admin : Toutes les routes
    ADMIN: ['*']
};

/**
 * Vérifie si un chemin donné est autorisé pour le profil connecté
 */
export function isRouteAllowedForProfile(pathname: string, profile: UserProfileType): boolean {
    if (profile === 'ADMIN') return true;
    
    // Normaliser le path pour ignorer les sous-routes
    const cleanPath = pathname.split('?')[0].replace(/\/$/, '');
    const allowedList = ALLOWED_DASHBOARD_ROUTES[profile] || [];
    
    return allowedList.some(allowed => cleanPath === allowed || cleanPath.startsWith(`${allowed}/`));
}
