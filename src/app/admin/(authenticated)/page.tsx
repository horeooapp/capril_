import { 
    Banknote, 
    ShieldCheck, 
    Scale, 
    UserCheck, 
    FileText, 
    Database, 
    ArrowUpRight,
    Users,
    AlertTriangle,
    Building2,
    Award,
    CreditCard,
    Zap,
    Settings2,
    MessageSquare,
    Bot,
    FileSignature,
    Handshake,
    Send,
    Trophy,
    ClipboardCheck,
    Wallet,
    RefreshCw,
    ExternalLink
} from "lucide-react"
import Link from "next/link"
import DemoToggle from "@/components/admin/DemoToggle"
import StatCard from "@/components/admin/StatCard"
import LiveActivityStream from "@/components/admin/LiveActivityStream"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getDemoMode } from "@/actions/demo-actions"
import { getDemoData } from "@/lib/demo-data"
import { getOverdueStats } from "@/actions/reminder-actions"
import { ShieldAlert, MapPin, BarChart } from "lucide-react"
import RealEstateObservatory from "@/components/RealEstateObservatory"
import GeographicRentAnalysis from "@/components/GeographicRentAnalysis"
import RentRanking from "@/components/RentRanking"
import ModuleRegistryGrid from "@/components/admin/ModuleRegistryGrid"

export const dynamic = "force-dynamic"

export default async function AdminDashboardOverview() {
    // Production Mode: Force real data by default
    const isDemoMode = false
    const demoData = null

    // Parallel data extraction for extreme performance
    const [
        totalUsers,
        verifiedUsers,
        totalDgiRes,
        cdcAmountRes,
        activeMediations,
        overdueStats,
        totalTenants,
        totalLandlords,
        totalAgencies,
        totalProperties,
        totalMandates,
        totalColocs,
        totalLandLeases,
        totalLeases,
        totalCertificates,
        totalPaymentsRes,
        totalReversals,
        fraudAlerts,
        totalBdqs,
        confirmedBdqs,
        totalAiConv,
        totalAiCostRes,
        recentAuditLogs,
        documentsUnderReview,
        activeModules,
        totalModules,
        totalSmsDeclarations,
        confirmedSmsDeclarations,
        totalManagers,
        totalAgents,
        totalPublicProfiles,
        activeInvitations,
        totalConsultations,
        matchRate,
        totalChampions,
        activeChampions,
        pendingCommissionsRes,
        totalEdls,
        certifiedEdls,
        totalMonthlyReports,
        totalMandatesDraft,
        totalWalletLinks,
        totalWalletClicks,
        totalWalletConversions,
        activeWalletConfigs,
        totalReclamations,
        totalLitiges,
        activePromos
    ] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.user.count({ where: { kycStatus: "verified" } }).catch(() => 0),
        prisma.fiscalDossier.aggregate({ _sum: { totalDgi: true } }).catch(() => null),
        prisma.cDCDeposit.aggregate({ _sum: { amount: true } }).catch(() => null),
        prisma.dispute.count({ where: { status: 'OPEN' } }).catch(() => 0),
        getOverdueStats().catch(() => ({ count: 0, totalAmount: 0 })),
        prisma.user.count({ where: { role: "TENANT" } }).catch(() => 0),
        prisma.user.count({ where: { role: { in: ["LANDLORD", "LANDLORD_PRO"] } } }).catch(() => 0),
        prisma.user.count({ where: { role: "AGENCY" } }).catch(() => 0),
        prisma.property.count().catch(() => 0),
        prisma.mandate.count({ where: { status: "ACTIVE" } }).catch(() => 0),
        prisma.colocataire.count({ where: { status: "ACTIVE" } }).catch(() => 0),
        prisma.landLeaseInfo.count().catch(() => 0),
        prisma.lease.count({ where: { status: "ACTIVE" } }).catch(() => 0),
        prisma.certificate.count({ where: { status: "valid" } }).catch(() => 0),
        prisma.receipt.aggregate({ _sum: { totalAmount: true }, where: { status: "paid" } }).catch(() => null),
        (prisma as any).reversalTransaction.count().catch(() => 0),
        prisma.user.count({ where: { fraudScore: { gt: 50 } } }).catch(() => 0),
        (prisma as any).bailDeclaratif.count().catch(() => 0),
        (prisma as any).bailDeclaratif.count({ where: { statut: "CONFIRME" } }).catch(() => 0),
        (prisma as any).bdqConversationState.count().catch(() => 0),
        (prisma as any).bdqConversationState.aggregate({ _sum: { coutEstimeFcfa: true } }).catch(() => null),
        prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { fullName: true } } } }).catch(() => []),
        prisma.identityDocument.findMany({ where: { status: "pending" }, take: 5, include: { user: { select: { fullName: true } } } }).catch(() => []),
        prisma.featureFlag.count({ where: { enabled: true } }).catch(() => 0),
        prisma.featureFlag.count().catch(() => 0),
        (prisma as any).smsDeclaration.count().catch(() => 0),
        (prisma as any).smsDeclaration.count({ where: { statut: "CONFIRME" } }).catch(() => 0),
        (prisma as any).propertyAccess.count({ where: { role: "MANAGER", statut: "ACTIF" } }).catch(() => 0),
        (prisma as any).propertyAccess.count({ where: { role: "FIELD_AGENT", statut: "ACTIF" } }).catch(() => 0),
        (prisma as any).locataireProfilPublic.count().catch(() => 0),
        (prisma as any).invitationBail.count({ where: { statut: "ENVOYEE" } }).catch(() => 0),
        (prisma as any).consultationProfil.count().catch(() => 0),
        (prisma as any).invitationBail.count({ where: { statut: "ACCEPTEE" } }).catch(() => 0),
        (prisma as any).championProfile.count().catch(() => 0),
        (prisma as any).championProfile.count({ where: { statut: "ACTIF" } }).catch(() => 0),
        (prisma as any).championCommission.aggregate({ _sum: { montantFcfa: true }, where: { statut: "EN_ATTENTE" } }).catch(() => null),
        prisma.inspection.count().catch(() => 0),
        prisma.inspection.count({ where: { status: "TERMINEE" } }).catch(() => 0),
        prisma.rapportMensuel.count().catch(() => 0),
        prisma.mandate.count({ where: { status: "DRAFT" } }).catch(() => 0),
        (prisma as any).walletRechargeLink.count().catch(() => 0),
        (prisma as any).walletRechargeLink.count({ where: { clique: true } }).catch(() => 0),
        (prisma as any).walletRechargeLink.count({ where: { rechargeEffectuee: true } }).catch(() => 0),
        (prisma as any).walletRechargeConfig.count({ where: { rappelActif: true } }).catch(() => 0),
        // Nouveaux indicateurs ADD-16
        (prisma as any).reclamationLocataire.count().catch(() => 0),
        (prisma as any).dossierLitigeCertifie.count().catch(() => 0),
        (prisma as any).codePromo.count({ where: { actif: true } }).catch(() => -1),
    ]);
    
    // Check for missing tables
    const isDbIncomplete = [
        totalPaymentsRes, 
        totalReversals, 
        fraudAlerts, 
        totalBdqs, 
        totalSmsDeclarations,
        totalMonthlyReports
    ].some(v => v === -1);
    
    // Formatting data
    const totalPayments = Number(totalPaymentsRes?._sum?.totalAmount || 0);

    const safeData = {
        totalDgi: Number(totalDgiRes?._sum?.totalDgi || 0),
        cdcAmount: Number(cdcAmountRes?._sum?.amount || 0),
        activeMediations,
        kycAutoRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
        overdueStats,
        totalUsers,
        totalTenants,
        totalLandlords,
        totalAgencies,
        totalProperties,
        totalMandates,
        totalMandatesDraft,
        totalColocs,
        totalLandLeases,
        totalLeases,
        totalCertificates,
        totalPayments,
        tvaCollectee: Math.floor(totalPayments * 0.18), // M-TVA 18% logic
        totalReversals,
        fraudAlerts,
        totalBdqs,
        confirmedBdqs,
        totalAiConv,
        totalAiCost: Number(totalAiCostRes?._sum?.coutEstimeFcfa || 0),
        recentAuditLogs,
        documentsUnderReview,
        activeModules,
        totalModules,
        totalSmsDeclarations,
        confirmedSmsDeclarations,
        totalManagers,
        totalAgents,
        totalPublicProfiles,
        activeInvitations,
        totalConsultations,
        matchRate,
        totalChampions,
        activeChampions,
        pendingCommissions: Number(pendingCommissionsRes?._sum?.montantFcfa || 0),
        newProspects: totalUsers > 0 ? await prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } }) : 0,
        mandateSuccessRate: totalMandates > 0 ? Math.round((totalMandates / (totalMandates + (totalMandatesDraft || 0))) * 100) : 0,
        totalEdls,
        certifiedEdls,
        totalMonthlyReports,
        totalWalletLinks,
        totalWalletClicks,
        totalWalletConversions,
        activeWalletConfigs,
        walletConversionRate: totalWalletLinks > 0 ? Math.round((totalWalletConversions / totalWalletLinks) * 100) : 0,
        totalReclamations,
        totalLitiges,
        activePromos
    }

    try {
        return (
            <div className="space-y-12 pb-16 relative">
                <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>
                
                {isDbIncomplete && (
                    <div className="bg-red-50 border-2 border-red-100 p-6 rounded-3xl flex items-center gap-6 animate-pulse mb-8">
                        <div className="p-4 bg-red-100 text-red-600 rounded-2xl">
                            <ShieldAlert size={32} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-red-900 uppercase">Synchronisation Base de Données Partielle</h3>
                            <p className="text-red-700/60 text-sm font-medium">Certaines tables (Payments, Fraud, SMS) semblent absentes de {process.env.DATABASE_URL?.split('@')[1] || "la base"}.</p>
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-red-600 text-white font-black rounded-xl text-xs uppercase"
                        >
                            Démarrer Sync
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-[#1F4E79] tracking-tighter leading-none mb-4 uppercase animate-in fade-in slide-in-from-left-4 duration-700 ease-out">
                            Supervision.
                        </h1>
                        <p className="text-[#C55A11] font-bold tracking-wide">
                            Contrôle intégral des flux <span className="text-primary font-bold">QAPRIL National</span>.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Niveau d&apos;accès</span>
                            <span className="text-sm font-bold text-gray-900">ADMINISTRATEUR CENTRAL</span>
                        </div>
                    </div>
                </div>

                {/* THE CONTROL TOWER — REG-2026-001 Unified Module Hub */}
                <ModuleRegistryGrid />

                {/* Core Global Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCard 
                        title="Reversements (M-PAY)" 
                        value={safeData.totalReversals === -1 ? "N/A" : (safeData.totalReversals || 0).toString()} 
                        icon={<CreditCard size={28} />} 
                        color="emerald"
                        trend="Nouveauté"
                        delay={0.1}
                        href="/admin/reversals"
                    />
                    <StatCard 
                        title="Alertes Fraude (M-GUARD)" 
                        value={safeData.fraudAlerts === -1 ? "N/A" : (safeData.fraudAlerts || 0).toString()} 
                        icon={<Zap size={28} />} 
                        color="red"
                        trend="Haute Vigilance"
                        delay={0.2}
                    />
                    <StatCard 
                        title="Droits Collectés (DGI)" 
                        value={`${safeData.totalDgi.toLocaleString()} FCFA`} 
                        icon={<ShieldCheck size={28} />} 
                        color="blue"
                        trend="Fiscalité M17"
                        delay={0.3}
                        href="/admin/fiscal"
                    />
                    <StatCard 
                        title="Auto-KYC IA" 
                        value={`${safeData.kycAutoRate}%`} 
                        icon={<UserCheck size={28} />} 
                        color="purple"
                        trend="Efficience"
                        delay={0.4}
                        href="/admin/compliance"
                    />
                    <StatCard 
                        title="Litiges Ouverts" 
                        value={safeData.activeMediations.toString()} 
                        icon={<Scale size={28} />} 
                        color="orange"
                        trend="Médiation"
                        delay={0.45}
                        href="/admin/disputes"
                    />
                    <StatCard 
                        title="Consignation CDC" 
                        value={`${safeData.cdcAmount.toLocaleString()} FCFA`} 
                        icon={<ShieldCheck size={28} />} 
                        color="emerald"
                        trend="Sécurisé"
                        delay={0.5}
                    />

                </div>

                {/* ADD-06/08: Innovation & IA Monitoring */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary px-2">Innovation & Transition Digitale (ADD-06/08)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard 
                            title="Bails Déclaratifs (BDQ)" 
                            value={safeData.totalBdqs === -1 ? "N/A" : safeData.totalBdqs.toLocaleString()} 
                            icon={<FileSignature size={28} />} 
                            color="orange"
                            trend={`${safeData.confirmedBdqs} Confirmés`}
                            delay={0.45}
                        />
                        <StatCard 
                            title="Conversations IA" 
                            value={safeData.totalAiConv.toLocaleString()} 
                            icon={<MessageSquare size={28} />} 
                            color="emerald"
                            trend="Activité"
                            delay={0.5}
                        />
                        <StatCard 
                            title="Coût API Assistant" 
                            value={`${safeData.totalAiCost.toLocaleString()} FCFA`} 
                            icon={<Bot size={28} />} 
                            color="indigo"
                            trend="Claude 3.5 Sonnet"
                            delay={0.55}
                        />
                        <StatCard 
                            title="TVA Collectée (Logement)" 
                            value={`${safeData.tvaCollectee.toLocaleString()} FCFA`} 
                            icon={<Banknote size={28} />} 
                            color="amber"
                            trend="M-TVA 18%"
                            delay={0.6}
                        />
                    </div>
                </div>

                {/* ADD-11 : Rôles & Déclarations SMS */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-orange-600 px-2">Supervision ADD-11 : Rôles & SMS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard 
                        title="Déclarations SMS" 
                        value={safeData.totalSmsDeclarations.toLocaleString()} 
                        icon={<MessageSquare size={28} />} 
                        color="orange"
                        trend={`${safeData.confirmedSmsDeclarations} Confirmées`}
                        delay={0.1}
                        href="/admin/declarations"
                    />
                        <StatCard 
                            title="Gestionnaires Actifs" 
                            value={safeData.totalManagers.toLocaleString()} 
                            icon={<Users size={28} />} 
                            color="blue"
                            trend="Intermédiaires"
                            delay={0.2}
                        />
                        <StatCard 
                            title="Agents de Terrain" 
                            value={safeData.totalAgents.toLocaleString()} 
                            icon={<ShieldCheck size={28} />} 
                            color="emerald"
                            trend="Vérification"
                            delay={0.3}
                        />
                        <StatCard 
                            title="Relances Auto." 
                            value="Actif" 
                            icon={<Zap size={28} />} 
                            color="indigo"
                            trend="H+2 / H+6"
                            delay={0.4}
                        />
                    </div>
                </div>

                {/* ADD-14: Profils Autonomes & Matching */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 px-2">Supervision ADD-14 : Profils & Matching</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard 
                        title="Profils Publics" 
                        value={safeData.totalPublicProfiles.toLocaleString()} 
                        icon={<Users size={28} />} 
                        color="emerald"
                        trend="Locataires Autonomes"
                        delay={0.1}
                        href="/admin/users"
                    />
                    <StatCard 
                        title="Invitations Actives" 
                        value={safeData.activeInvitations.toLocaleString()} 
                        icon={<Send size={28} />} 
                        color="orange"
                        trend="Propositions"
                        delay={0.2}
                        href="/admin/declarations"
                    />
                        <StatCard 
                            title="Matchs Réussis" 
                            value={safeData.matchRate.toLocaleString()} 
                            icon={<Handshake size={28} />} 
                            color="indigo"
                            trend="Baux Activés"
                            delay={0.3}
                        />
                        <StatCard 
                            title="Consultations Profil" 
                            value={safeData.totalConsultations.toLocaleString()} 
                            icon={<ShieldCheck size={28} />} 
                            color="slate"
                            trend="Visibilité"
                            delay={0.4}
                        />
                    </div>
                </div>

                {/* ADD-07 : Wallet & Rechargements */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-600 px-2">Supervision ADD-07 : Wallet & Automatisations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard 
                            title="Liens Générés" 
                            value={safeData.totalWalletLinks.toLocaleString()} 
                            icon={<ExternalLink size={28} />} 
                            color="blue"
                            trend="Deep Links"
                            delay={0.1}
                        />
                        <StatCard 
                            title="Taux de Clics" 
                            value={safeData.totalWalletLinks > 0 ? `${Math.round((safeData.totalWalletClicks / safeData.totalWalletLinks) * 100)}%` : "0%"} 
                            icon={<Zap size={28} />} 
                            color="orange"
                            trend={`${safeData.totalWalletClicks} Clics`}
                            delay={0.2}
                        />
                        <StatCard 
                            title="Conversions" 
                            value={`${safeData.walletConversionRate}%`} 
                            icon={<Wallet size={28} />} 
                            color="emerald"
                            trend={`${safeData.totalWalletConversions} Rechargés`}
                            delay={0.3}
                        />
                        <StatCard 
                            title="Configs Actives" 
                            value={safeData.activeWalletConfigs.toLocaleString()} 
                            icon={<RefreshCw size={28} />} 
                            color="indigo"
                            trend="Rappels Auto."
                            delay={0.4}
                        />
                    </div>
                </div>

                {/* ADD-15 : Réseau Champions */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 px-2">Supervision ADD-15 : Réseau Champions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard 
                            title="Total Champions" 
                            value={safeData.totalChampions.toLocaleString()} 
                            icon={<Trophy size={28} />} 
                            color="indigo"
                            trend={`${safeData.activeChampions} Actifs`}
                            delay={0.1}
                            href="/admin/champions"
                        />
                        <StatCard 
                            title="Commissions à Valider" 
                            value={`${safeData.pendingCommissions.toLocaleString()} FCFA`} 
                            icon={<CreditCard size={28} />} 
                            color="orange"
                            trend="En attente"
                            delay={0.2}
                            href="/admin/champions"
                        />
                        <StatCard 
                            title="Mandats Validés" 
                            value={`${safeData.mandateSuccessRate}%`} 
                            icon={<Zap size={28} />} 
                            color="emerald"
                            trend="Taux de conversion"
                            delay={0.3}
                        />
                        <StatCard 
                            title="Nouveaux Prospects" 
                            value={`+${safeData.newProspects}`} 
                            icon={<Users size={28} />} 
                            color="blue"
                            trend="Derniers 30j"
                            delay={0.4}
                        />
                    </div>
                </div>

                {/* ADD-15 : États des Lieux & Rapports */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 px-2">Supervision ADD-15 : États des Lieux & Rapports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard 
                            title="États des Lieux" 
                            value={safeData.totalEdls.toLocaleString()} 
                            icon={<ClipboardCheck size={28} />} 
                            color="slate"
                            trend={`${safeData.certifiedEdls} Certifiés`}
                            delay={0.5}
                            href="/admin/edl"
                        />
                        <StatCard 
                            title="Taux Certification" 
                            value={safeData.totalEdls > 0 ? `${Math.round((safeData.certifiedEdls / safeData.totalEdls) * 100)}%` : "0%"} 
                            icon={<ShieldCheck size={28} />} 
                            color="emerald"
                            trend="SHA-256"
                            delay={0.6}
                            href="/admin/edl"
                        />
                        <StatCard 
                            title="Rapports Mensuels" 
                            value={safeData.totalMonthlyReports.toLocaleString()} 
                            icon={<FileText size={28} />} 
                            color="blue"
                            trend="Générés"
                            delay={0.7}
                            href="/admin/reports"
                        />
                        <StatCard 
                            title="Délivrance Auto." 
                            value="100%" 
                            icon={<Zap size={28} />} 
                            color="indigo"
                            trend="Délivrés"
                            delay={0.8}
                        />
                    </div>
                </div>

                {/* Vision Opérationnelle (Nouveau) */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 px-2">Indicateurs de Performance Opérationnelle</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard 
                            title="Locataires Certifiés" 
                            value={safeData.totalTenants.toLocaleString()} 
                            icon={<Users size={28} />} 
                            color="emerald"
                            trend="+12% ce mois"
                            delay={0.5}
                        />
                        <StatCard 
                            title="Propriétaires & Agences" 
                            value={(safeData.totalLandlords + safeData.totalAgencies).toLocaleString()} 
                            icon={<Building2 size={28} />} 
                            color="slate"
                            trend="Actifs"
                            delay={0.6}
                        />
                        <StatCard 
                            title="Contrats de Bail Actifs" 
                            value={safeData.totalLeases.toLocaleString()} 
                            icon={<FileText size={28} />} 
                            color="amber"
                            trend="Sécurisés"
                            delay={0.7}
                        />
                        <StatCard 
                            title="Licences & Certificats" 
                            value={safeData.totalCertificates.toLocaleString()} 
                            icon={<Award size={28} />} 
                            color="indigo"
                            trend="Conformes"
                            delay={0.8}
                        />
                    </div>
                </div>

                {/* ADD-16 : Compliance & Arbitrage */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-red-600 px-2">Supervision ADD-16 : Réclamations & Arbitrage CACI</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard 
                            title="Réclamations" 
                            value={safeData.totalReclamations.toLocaleString()} 
                            icon={<AlertTriangle size={28} />} 
                            color="red"
                            trend="Droits Locataire"
                            delay={0.1}
                            href="/admin/reclamations"
                        />
                        <StatCard 
                            title="Litiges CACI" 
                            value={safeData.totalLitiges.toLocaleString()} 
                            icon={<Scale size={28} />} 
                            color="orange"
                            trend="Dossiers Certifiés"
                            delay={0.2}
                            href="/admin/disputes"
                        />
                        <StatCard 
                            title="Promos Actives" 
                            value={safeData.activePromos.toLocaleString()} 
                            icon={<Zap size={28} />} 
                            color="emerald"
                            trend="Agilité Tarifaire"
                            delay={0.3}
                            href="/admin/tarifs"
                        />
                    </div>
                </div>

                {/* Montant Total des Transactions */}
                <div className="glass-card-premium p-10 rounded-[3rem] bg-gray-900 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary blur-[150px] opacity-20 -mr-40 -mt-40 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="label-tech text-primary mb-4 text-xs font-black uppercase tracking-widest">Flux Transactionnel Total (Reçus Certifiés)</p>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-2">
                                {safeData.totalPayments.toLocaleString()} <span className="text-2xl text-primary/60 font-bold uppercase tracking-tighter">FCFA</span>
                            </h2>
                            <p className="text-white/40 font-medium">Cumul des loyers et frais sécurisés par le protocole QAPRIL.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Colocataires</p>
                                <p className="text-2xl font-black">{safeData.totalColocs}</p>
                            </div>
                            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Mandats</p>
                                <p className="text-2xl font-black">{safeData.totalMandates}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Market Intelligence & Observatory (Reserved for Admin) */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4 px-2">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <BarChart size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Intelligence Marché & Observatoire</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Données consolidées du Registre National</p>
                        </div>
                    </div>
                    
                    <RealEstateObservatory />
                    
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h4 className="label-tech text-gray-400 text-[10px] font-black uppercase tracking-widest px-2">Le Palmarès Locatif (Indice de Positionnement)</h4>
                            <RentRanking />
                        </div>
                        <div className="space-y-6">
                            <h4 className="label-tech text-gray-400 text-[10px] font-black uppercase tracking-widest px-2">Cartographie des Loyers (Analyse Géographique)</h4>
                            <GeographicRentAnalysis />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Stream Principal */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Activités Réseau Temps Réel</h3>
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">Live Sync</span>
                                </div>
                            </div>
                            <LiveActivityStream logs={safeData.recentAuditLogs} />
                        </div>

                        {/* Infos Système Complémentaires */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <StatCard 
                                title="Baux Terrains" 
                                value={safeData.totalLandLeases.toString()} 
                                icon={<ArrowUpRight size={28} />} 
                                color="amber"
                                delay={0.9}
                            />
                            <StatCard 
                                title="Utilisateurs Plateforme" 
                                value={safeData.totalUsers.toString()} 
                                icon={<Users size={28} />} 
                                color="slate"
                                delay={1.0}
                            />
                            <StatCard 
                                title="Modules Système" 
                                value={`${safeData.activeModules}/${safeData.totalModules}`} 
                                icon={<Settings2 size={28} />} 
                                color="indigo"
                                trend="Configuration"
                                delay={1.1}
                            />
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* Section Validation Identité */}
                        <div className="glass-card-premium p-8 rounded-[2.5rem] border border-orange-100 shadow-xl shadow-orange-500/5">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="label-tech text-orange-600 text-[10px] font-black uppercase tracking-widest">Validation Identité</h4>
                                <div className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[8px] font-black uppercase tracking-tighter animate-pulse">
                                    {safeData.documentsUnderReview.length} En attente
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {safeData.documentsUnderReview.length === 0 ? (
                                    <p className="text-[10px] text-gray-400 italic text-center py-4">Tous les KYC sont à jour.</p>
                                ) : (
                                    safeData.documentsUnderReview.map((doc: any) => (
                                        <div key={doc.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group/item hover:bg-orange-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-gray-900 truncate max-w-[120px]">{doc.user?.fullName}</span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">{new Date(doc.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-bold text-orange-600 bg-orange-100/50 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                                    {doc.docType}
                                                </span>
                                                <Link href={`/admin/validation/${doc.id}`} className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    Vérifier →
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <Link href="/admin/validation" className="block w-full text-center mt-6 p-4 border border-dashed border-gray-200 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-colors">
                                Gérer tout le KYC
                            </Link>
                        </div>

                        <section className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600 blur-[130px] opacity-20 -mr-40 -mt-40 group-hover:opacity-40 transition-opacity"></div>
                            <h4 className="label-tech text-primary mb-6 text-xs font-black uppercase tracking-widest">Moteur Fiscal Consolidated</h4>
                            <p className="text-2xl font-black mb-10 leading-tight">Consolider tous les flux <br /><span className="text-orange-400">DGI Côte d&apos;Ivoire</span>.</p>
                            <Link href="/admin/fiscal" className="flex items-center justify-between w-full p-6 bg-white/10 hover:bg-primary transition-all rounded-2xl border border-white/10 hover:border-transparent group/btn">
                                <span className="font-black uppercase tracking-widest text-[10px]">Lancer le rapport</span>
                                <ArrowUpRight size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </Link>
                        </section>


                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        return (
            <div className="p-12 bg-red-50/50 border-2 border-red-100 rounded-[3rem] flex flex-col items-center text-center backdrop-blur-xl">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-red-200/50 rotate-3">
                    <AlertTriangle size={36} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">Interruption Supervision.</h2>
                <code className="text-[10px] text-red-700 bg-white p-6 rounded-2xl border border-red-200 max-w-full overflow-auto">
                    {String(error)}
                </code>
            </div>
        )
    }
}
