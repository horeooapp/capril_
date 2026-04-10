"use client"

import React from "react"
import OwnerPortalWrapper from "./owner/OwnerPortalWrapper"
import AgencyPortalWrapper from "./agency/AgencyPortalWrapper"

// Nettoyage complet : Seul le Dashboard Propriétaire (MBESSODEDOU) est rendu par défaut.
// Le "téléphone vert/bleu" (Tenant/Diaspora) et les vieux tableaux de bord ont été supprimés.

export default function DashboardOverviewClient({ 
    user,
    activeRole,
    session,
    agencyData,
    diasporaData,
    intermData
}: { 
    user: any,
    activeRole: string,
    session: any,
    properties?: any[],
    latestReport?: any,
    regularizationAlert?: React.ReactNode,
    diasporaData?: any,
    intermData?: any,
    agencyData?: any,
    tenantData?: any
}) {
    if (['AGENCY', 'NON_CERTIFIED_AGENT', 'AGENCE_AGREE', 'AGENCE_NON_AGREE', 'AGENCY_AGREE', 'AGENCY_NON_AGREE'].includes(activeRole)) {
        let payload = undefined;
        if (agencyData) {
            payload = {
                ...agencyData,
                candidates: agencyData.candidatures || []
            };
        }
        return <AgencyPortalWrapper initialData={payload} />;
    }

    if (activeRole === 'INTERMEDIARY') {
        // En attendant un wrapper spécifique, un intermédiaire voit la vue propriétaire étendue
        return <OwnerPortalWrapper user={user} properties={properties} intermData={intermData} activeRole={activeRole} />;
    }

    // Par défaut pour tout le monde (Propriétaire, Diaspora, etc.) => Dashboard Propriétaire Premium
    return <OwnerPortalWrapper user={user} properties={properties} diasporaData={diasporaData} activeRole={activeRole} />;
}
