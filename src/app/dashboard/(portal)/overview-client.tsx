"use client"

import React from "react"
import OwnerPortalWrapper from "./owner/OwnerPortalWrapper"
import AgencyPortalWrapper from "./agency/AgencyPortalWrapper"

// Nettoyage complet : Seul le Dashboard Propriétaire (MBESSODEDOU) est rendu par défaut.
// Le "téléphone vert/bleu" (Tenant/Diaspora) et les vieux tableaux de bord ont été supprimés.

export default function DashboardOverviewClient({ 
    user
}: { 
    user: any,
    properties?: any[],
    latestReport?: any,
    regularizationAlert?: React.ReactNode,
    diasporaData?: any,
    intermData?: any,
    agencyData?: any,
    tenantData?: any
}) {
    const activeRole = user?.chosenRole || user?.role;

    if (activeRole === 'AGENCY') {
        return <AgencyPortalWrapper />;
    }

    // Par défaut pour tout le monde (Propriétaire, ou peu importe) => Dashboard Propriétaire Premium
    return <OwnerPortalWrapper />;
}
