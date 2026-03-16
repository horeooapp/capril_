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
        totalProperties: 125,
        totalLeases: 89,

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
                action: "PAIEMENT_LOYER_CONFIRME [DEMO]",
                module: "PAYMENT",
                createdAt: new Date(),
                user: { fullName: "Système IA QAPRIL", role: "SUPER_ADMIN", email: "ai@qapril.com" },
                ipAddress: "192.168.1.1",
                userAgent: "QAPRIL Engine v3.0"
            },
            {
                id: "demo-log-2",
                action: "SIGNATURE_BAIL_ELECTRONIQUE [DEMO]",
                module: "LEASE",
                createdAt: new Date(Date.now() - 15 * 60000),
                user: { fullName: "Jean Koffi", role: "TENANT", email: "jean@exemple.ci" },
                ipAddress: "41.202.200.12",
                userAgent: "Safari/Mobile"
            },
            {
                id: "demo-log-3",
                action: "VERIFICATION_KYC_AUTOMATE [DEMO]",
                module: "KYC",
                createdAt: new Date(Date.now() - 45 * 60000),
                user: { fullName: "Moteur AI QAPRIL", role: "SYSTEM", email: "kyc@qapril.ci" },
                ipAddress: "127.0.0.1",
                userAgent: "OCR-Engine"
            },
            {
                id: "demo-log-4",
                action: "MISE_EN_CONSIGNATION_CDC [DEMO]",
                module: "CDC",
                createdAt: new Date(Date.now() - 120 * 60000),
                user: { fullName: "Admin Central", role: "ADMIN", email: "admin@qapril.com" },
                ipAddress: "197.214.22.4",
                userAgent: "Chrome/Windows"
            },
            {
                id: "demo-log-5",
                action: "QUITTANCE_GENERE_MA_POSTE [DEMO]",
                module: "LOGISTICS",
                createdAt: new Date(Date.now() - 180 * 60000),
                user: { fullName: "Système", role: "SYSTEM", email: "post@qapril.ci" },
                ipAddress: "10.0.0.5",
                userAgent: "MaPoste-Webhook"
            }
        ],

        // Validations en attente (Page Validation)
        pendingValidations: [
            {
                id: "demo-v-1",
                fullName: "Koffi Kouassi",
                email: "koffi@agencepro.ci",
                role: "AGENCY",
                createdAt: new Date(Date.now() - 86400000 * 2),
                legalEntity: { companyName: "AGENCE PRO IMMO [DEMO]" }
            },
            {
                id: "demo-v-2",
                fullName: "Aminata Diallo",
                email: "aminat@experts.ci",
                role: "AGENT",
                createdAt: new Date(Date.now() - 86400000 * 3),
                legalEntity: null
            },
            {
                id: "demo-v-3",
                fullName: "Bakary Coulibaly",
                email: "bakary@ivoryrent.ci",
                role: "ADMIN",
                createdAt: new Date(Date.now() - 86400000 * 1),
                legalEntity: { companyName: "IVORY RENT SAS [DEMO]" }
            }
        ],

        // Liste des Utilisateurs (Page Users)
        users: [
            {
                id: "demo-u-1",
                fullName: "Yacouba Touré [DEMO]",
                email: "yacou@qapril.ci",
                role: "SUPER_ADMIN",
                kycLevel: 4,
                kycStatus: "verified",
                status: "active",
                createdAt: new Date(2025, 0, 1),
                phone: "+225 0707070707"
            },
            {
                id: "demo-u-2",
                fullName: "Mariam Diallo [DEMO]",
                email: "mariam@exemple.com",
                role: "LANDLORD",
                kycLevel: 2,
                kycStatus: "verified",
                status: "active",
                createdAt: new Date(2025, 1, 15),
                phone: "+225 0505050505"
            },
            {
                id: "demo-u-3",
                fullName: "Christian Koffi [DEMO]",
                email: "chris@tenant.ci",
                role: "TENANT",
                kycLevel: 1,
                kycStatus: "pending",
                status: "active",
                createdAt: new Date(2025, 2, 10),
                phone: "+225 0101010101"
            }
        ]
    }
}
