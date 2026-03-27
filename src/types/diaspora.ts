export interface DiasporaDashboardData {
  stats: {
    totalRentFcfa: number;
    totalRentDevise: number;
    currency: string;
    totalAssets: number;
    occupancyRate: number;
  };
  properties: Array<{
    id: string;
    name: string;
    commune: string;
    propertyCode: string;
    status: string;
    managementMode: string;
    isImpaye: boolean;
    isHorsSLA: boolean;
    activeLease: {
      rentFcfa: number;
      rentDevise: number;
      tenant: string | null;
      lastPayment: Date | string | null;
    } | null;
  }>;
  mandats: Array<{
    id: string;
    agence?: string;
    nom?: string;
    phone?: string;
    statut?: string;
    status?: string;
    since?: Date | string;
    scope?: string;
    role?: string;
    slaConfig?: number;
    slaReel?: number;
  }>;
  mobileMoney: Array<{
    id: string;
    provider: string;
    phone: string;
    solde: number;
    operateur?: string;
    numero?: string;
    nom?: string;
    actif?: boolean;
    defaut?: boolean;
  }>;
  virements: Array<{
    id: string;
    bien: string;
    mois: string;
    montantFCFA: number;
    statut: string;
    dateReception: string;
    reference: string;
    ref?: string;
    date?: string;
    type?: string;
  }>;
  webhooks: Array<{
    date: string;
    op: string;
    emetteur: string;
    montant: number;
    bien: string;
    statut: string;
    ref: string;
  }>;
  settings: {
    iban: string;
    banque: string;
    pays: string;
    fuseau: string;
    devise: string;
    notifications: string[];
  };
}
