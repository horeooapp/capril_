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
      lastPayment: Date | null;
    } | null;
  }>;
  mandats: Array<{
    id: string;
    name: string | null;
    phone: string | null;
    statut: string;
    since: Date | string;
  }>;
}
