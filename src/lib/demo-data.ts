/**
 * Moteur de données fictives pour le mode Démo (Présentations Investisseurs)
 * Toutes les données retournées ici sont marquées ou conçues pour la démonstration.
 */

export const getDemoData = () => {
    return {
        // M17 - Fiscalité
        fiscalStats: {
            _sum: { totalDgi: 25450000 }
        },
        
        // M18 - Cautions CDC
        cdcStats: {
            _sum: { amount: 15800000 }
        },

        // M19 - Contentieux
        activeMediations: 12,

        // M21 - KYC IA
        kycAutoRate: 94,
        
        // Comptes de base
        totalUsers: 482,
        totalTenants: 345,
        totalLandlords: 122,
        totalAgencies: 15,
        totalProperties: 125,
        totalLeases: 114, 
        totalMandates: 42,
        activeColocs: 18,
        landLeases: 7,
        totalCertificates: 284, // CNL + Fiscal
        totalPayments: 142500000, // Total des quittances payées (FCFA)

        // Alertes KYC Fictives (Overview)
        documentsUnderReview: [
            {
                id: "demo-kyc-1",
                docType: "CNI_CI [DEMO]",
                status: "under_review",
                createdAt: new Date(),
                user: { fullName: "Mamadou Traoré (Mode Démo)" }
            },
            {
                id: "demo-kyc-2",
                docType: "PASSEPORT [DEMO]",
                status: "under_review",
                createdAt: new Date(Date.now() - 3600000),
                user: { fullName: "Awa Koné (Mode Démo)" }
            },
            {
                id: "demo-kyc-3",
                docType: "RCCM [DEMO]",
                status: "under_review",
                createdAt: new Date(Date.now() - 7200000),
                user: { fullName: "SOCIETE IVOIRE IMMO (Mode Démo)" }
            }
        ],

        // Journal d'Audit Fictif
        recentAuditLogs: [
            {
                id: "demo-log-1",
                action: "ADD_COLOCATAIRE [DEMO]",
                module: "COLOC",
                createdAt: new Date(),
                user: { fullName: "Agence Ivory Immo", role: "AGENCY", email: "agency@ivory.ci" },
                ipAddress: "41.202.200.15",
                userAgent: "Desktop Chrome"
            },
            {
                id: "demo-log-2",
                action: "CREATE_MANDATE [DEMO]",
                module: "MANDATE",
                createdAt: new Date(Date.now() - 15 * 60000),
                user: { fullName: "Bakary Traoré", role: "AGENCY", email: "bakary@qapril.ci" },
                ipAddress: "197.214.15.12",
                userAgent: "Safari/Mobile"
            },
            {
                id: "demo-log-3",
                action: "PAIEMENT_LOYER_CONFIRME [DEMO]",
                module: "PAYMENT",
                createdAt: new Date(Date.now() - 45 * 60000),
                user: { fullName: "Système IA QAPRIL", role: "SUPER_ADMIN", email: "ai@qapril.com" },
                ipAddress: "127.0.0.1",
                userAgent: "QAPRIL Engine v3.0"
            },
            {
                id: "demo-log-4",
                action: "CREATE_LAND_LEASE_INFO [DEMO]",
                module: "TERRAIN",
                createdAt: new Date(Date.now() - 120 * 60000),
                user: { fullName: "Admin QAPRIL", role: "ADMIN", email: "admin@qapril.ci" },
                ipAddress: "41.202.200.12",
                userAgent: "Windows/Edge"
            }
        ],

        // Validations en attente (Page Validation)
        pendingValidations: [
            {
                id: "demo-agency-1",
                fullName: "Bakary Traoré [DEMO]",
                email: "agence.demo@qapril.ci",
                role: "AGENCY",
                createdAt: new Date(Date.now() - 86400000 * 2),
                legalEntity: { companyName: "IVORY IMMO SERVICES [DEMO]" }
            },
            {
                id: "demo-v-2",
                fullName: "Aminata Diallo [DEMO]",
                email: "aminat@experts.ci",
                role: "NON_CERTIFIED_AGENT",
                createdAt: new Date(Date.now() - 86400000 * 3),
                legalEntity: null
            }
        ],

        // Liste des Utilisateurs (Page Users)
        users: [
            {
                id: "demo-u-landlord",
                fullName: "Yao Kouassi (BAILLEUR DEMO)",
                email: "bailleur.demo@qapril.ci",
                role: "LANDLORD",
                kycLevel: 4,
                kycStatus: "verified",
                status: "active",
                createdAt: new Date(2025, 0, 1),
                phone: "+225 0101010101"
            },
            {
                id: "demo-u-tenant",
                fullName: "Awa Koné (LOCATAIRE DEMO)",
                email: "locataire.demo@qapril.ci",
                role: "TENANT",
                kycLevel: 2,
                kycStatus: "verified",
                status: "active",
                createdAt: new Date(2025, 1, 15),
                phone: "+225 0202020202"
            },
            {
                id: "demo-u-agency",
                fullName: "Bakary Traoré (AGENCE DEMO)",
                email: "agence.demo@qapril.ci",
                role: "AGENCY",
                kycLevel: 4,
                kycStatus: "verified",
                status: "active",
                createdAt: new Date(2025, 2, 10),
                phone: "+225 0303030303"
            }
        ],

        // Propriétés DEMO
        properties: [
            {
                id: "demo-p-1",
                propertyCode: "DEMO-PRO-001",
                name: "Villa Prestige Cocody [DEMO]",
                address: "Riviera Bonoumin",
                city: "Abidjan",
                commune: "Cocody",
                propertyType: "villa",
                status: "active",
                declaredRentFcfa: 750000,
                owner: { fullName: "Yao Kouassi [DEMO]" }
            },
            {
                id: "demo-p-2",
                propertyCode: "DEMO-PRO-002",
                name: "Appartement Standing Plateau [DEMO]",
                address: "Avenue Delafosse",
                city: "Abidjan",
                commune: "Plateau",
                propertyType: "apartment",
                status: "active",
                declaredRentFcfa: 450000,
                owner: { fullName: "Yao Kouassi [DEMO]" }
            }
        ],

        // Baux DEMO
        leases: [
            {
                id: "demo-l-1",
                leaseReference: "BAIL-DEMO-2026-001",
                status: "ACTIVE",
                rentAmount: 750000,
                startDate: new Date('2026-01-01'),
                property: { name: "Villa Prestige Cocody [DEMO]" },
                tenant: { fullName: "Awa Koné [DEMO]" },
                landlord: { fullName: "Yao Kouassi [DEMO]" }
            }
        ]
    }
}
