"use client"

import React from "react"
import OwnerPortalWrapper from "./owner/OwnerPortalWrapper"
import AgencyPortalWrapper from "./agency/AgencyPortalWrapper"
import { BrokerPortalDashboard } from "@/components/dashboard/broker/BrokerPortalDashboard"

export default function DashboardOverviewClient({ 
    user,
    activeRole,
    session,
    agencyData,
    diasporaData,
    intermData,
    properties,
    aggregates
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
    tenantData?: any,
    aggregates?: any
}) {
    // Profil 4 : Démarcheur / Intermédiaire Certifié -> Dashboard Démarcheur Spécifique
    if (['INTERMEDIARY', 'INTERMEDIAIRE', 'CHAMPION', 'NON_CERTIFIED_AGENT', 'AGENCE_NON_AGREE', 'AGENCY_NON_AGREE'].includes(activeRole)) {
        return (
            <BrokerPortalDashboard 
                user={user}
                mandates={intermData?.mandates || []}
                properties={intermData?.properties || []}
                candidatures={intermData?.candidatures || []}
                stats={intermData?.stats || {}}
            />
        );
    }

    // Profil 3 : Agence Immobilière Agréée -> Dashboard Agence Agréée Spécifique
    if (['AGENCY', 'AGENCE_AGREE', 'AGENCY_AGREE'].includes(activeRole)) {
        const payload = agencyData ? {
            ...agencyData,
            candidates: agencyData.candidatures || []
        } : undefined;
        return <AgencyPortalWrapper initialData={payload} aggregates={aggregates} />;
    }

    // Profil 2 : Propriétaire / Diaspora -> Dashboard Propriétaire Gestion Directe
    return <OwnerPortalWrapper user={user} properties={properties} diasporaData={diasporaData} activeRole={activeRole} aggregates={aggregates} />;
}
