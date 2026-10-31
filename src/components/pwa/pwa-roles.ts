export type PwaRoleId = 'tenant' | 'landlord' | 'agency' | 'intermediary';

export interface PwaRoleDefinition {
    id: PwaRoleId;
    shortLabel: string;
    fullTitle: string;
    appName: string;
    description: string;
    directUrl: string;
    themeColor: string;
    gradient: string;
    badgeBg: string;
    badgeText: string;
    borderActive: string;
    iconName: 'tenant' | 'landlord' | 'agency' | 'intermediary';
    roles: string[];
}

export const PWA_ROLES: Record<PwaRoleId, PwaRoleDefinition> = {
    tenant: {
        id: 'tenant',
        shortLabel: 'Locataire',
        fullTitle: 'Espace Locataire',
        appName: 'QAPRIL Locataire',
        description: 'Quittances certifiées CDC, signature de bail et paiement de loyer en 1 clic.',
        directUrl: '/mon-espace-locataire',
        themeColor: '#FF8200',
        gradient: 'from-[#FF8200] to-amber-500',
        badgeBg: 'bg-amber-500/20',
        badgeText: 'text-amber-300',
        borderActive: 'border-[#FF8200]',
        iconName: 'tenant',
        roles: ['TENANT', 'LOCATAIRE'],
    },
    landlord: {
        id: 'landlord',
        shortLabel: 'Propriétaire',
        fullTitle: 'Espace Propriétaire',
        appName: 'QAPRIL Propriétaire',
        description: 'Gestion de biens, encaissements de loyers, suivi des baux et fiscalité.',
        directUrl: '/dashboard/owner',
        themeColor: '#10B981',
        gradient: 'from-emerald-500 to-teal-600',
        badgeBg: 'bg-emerald-500/20',
        badgeText: 'text-emerald-300',
        borderActive: 'border-emerald-500',
        iconName: 'landlord',
        roles: ['LANDLORD', 'LANDLORD_PRO', 'PROPRIETAIRE', 'BAILLEUR'],
    },
    agency: {
        id: 'agency',
        shortLabel: 'Agence',
        fullTitle: 'Espace Agence',
        appName: 'QAPRIL Agence',
        description: 'Portefeuille locatif, mandats de gestion, comptes rendus et quittances CDC.',
        directUrl: '/dashboard/agency',
        themeColor: '#0284C7',
        gradient: 'from-sky-500 to-blue-600',
        badgeBg: 'bg-sky-500/20',
        badgeText: 'text-sky-300',
        borderActive: 'border-sky-500',
        iconName: 'agency',
        roles: ['AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE', 'ADMIN', 'SUPER_ADMIN'],
    },
    intermediary: {
        id: 'intermediary',
        shortLabel: 'Intermédiaire',
        fullTitle: 'Espace Intermédiaire',
        appName: 'QAPRIL Intermédiaire',
        description: 'Mandats de recherche, mise en relation certifiée et suivi des commissions.',
        directUrl: '/dashboard/agent',
        themeColor: '#8B5CF6',
        gradient: 'from-purple-500 to-indigo-600',
        badgeBg: 'bg-purple-500/20',
        badgeText: 'text-purple-300',
        borderActive: 'border-purple-500',
        iconName: 'intermediary',
        roles: ['INTERMEDIARY', 'INTERMEDIAIRE', 'CHAMPION', 'NON_CERTIFIED_AGENT', 'AGENCE_NON_AGREE', 'AGENCY_NON_AGREE'],
    },
};

/**
 * Détermine le rôle PWA approprié en fonction du rôle utilisateur et/ou du chemin URL actuel
 */
export function resolvePwaRole(userRole?: string | null, pathname?: string | null): PwaRoleId {
    const normRole = (userRole || '').toUpperCase().trim();
    const path = pathname || '';

    // 1. Détection prioritaire par rôle de session
    if (['TENANT', 'LOCATAIRE'].includes(normRole)) return 'tenant';
    if (['AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE'].includes(normRole)) return 'agency';
    if (['INTERMEDIARY', 'INTERMEDIAIRE', 'CHAMPION', 'NON_CERTIFIED_AGENT', 'AGENCE_NON_AGREE', 'AGENCY_NON_AGREE'].includes(normRole)) return 'intermediary';
    if (['LANDLORD', 'LANDLORD_PRO', 'PROPRIETAIRE', 'BAILLEUR'].includes(normRole)) return 'landlord';

    // 2. Détection par URL active
    if (path.startsWith('/mon-espace-locataire')) return 'tenant';
    if (path.startsWith('/dashboard/agency')) return 'agency';
    if (path.startsWith('/dashboard/agent') || path.startsWith('/dashboard/mandates')) return 'intermediary';
    if (path.startsWith('/dashboard/owner') || path.startsWith('/dashboard/properties')) return 'landlord';

    // Défaut
    return 'landlord';
}
