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
    ExternalLink,
    Lock,
    Key,
    Globe,
    Wifi
} from "lucide-react"
import Link from "next/link"
import LandingToggle from "@/components/admin/LandingToggle"
import StatCard from "@/components/admin/StatCard"
import LiveActivityStream from "@/components/admin/LiveActivityStream"
import { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getOverdueStats } from "@/actions/reminder-actions"
import { ShieldAlert, MapPin, BarChart } from "lucide-react"
import RealEstateObservatory from "@/components/RealEstateObservatory"
import GeographicRentAnalysis from "@/components/GeographicRentAnalysis"
import RentRanking from "@/components/RentRanking"
import ModuleRegistryGrid from "@/components/admin/ModuleRegistryGrid"
import SyncButton from "@/components/admin/SyncButton"
import AdminMarketWidget from "@/components/admin/AdminMarketWidget"
import { getNationalMarketComparison } from "@/actions/observatory-national"

export const dynamic = "force-dynamic"

export default async function AdminDashboardOverview() {
    // Parallel data extraction for extreme performance with global safety
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    try {
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
            activePromos,
            landingFlag,
            marketIntelligence,
            leasesCurrentMonth,
            leasesLastMonth,
            monthlyTrendRes,
            passeportRes,
            vaultRes,
            championsRes,
            diasporaRes,
            abonnementsRes,
            signalementsRes
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
            ((prisma as any).reversalTransaction?.count?.() || Promise.resolve(0)).catch(() => 0),
            prisma.user.count({ where: { fraudProfile: { fraudScore: { gt: 50 } } } }).catch(() => 0),
            ((prisma as any).bailDeclaratif?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).bailDeclaratif?.count?.({ where: { statut: "CONFIRME" } }) || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).bdqConversationState?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).bdqConversationState?.aggregate?.({ _sum: { coutEstimeFcfa: true } }) || Promise.resolve(null)).catch(() => null),
            prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true } } } }).catch(() => []),
            prisma.identityDocument.findMany({ where: { status: "pending" }, take: 5, include: { user: { select: { firstName: true, lastName: true } } } }).catch(() => []),
            prisma.featureFlag.count({ where: { enabled: true } }).catch(() => 0),
            prisma.featureFlag.count().catch(() => 0),
            ((prisma as any).smsDeclaration?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).smsDeclaration?.count?.({ where: { statut: "CONFIRME" } }) || Promise.resolve(0)).catch(() => 0),
            prisma.user.count({ where: { role: "AGENCY" } }).catch(() => 0), // Managers
            prisma.user.count({ where: { role: "NON_CERTIFIED_AGENT" } }).catch(() => 0), // Agents
            ((prisma as any).locataireProfilPublic?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).invitationBail?.count?.({ where: { statut: "ENVOYEE" } }) || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).consultationProfil?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).invitationBail?.count?.({ where: { statut: "ACCEPTEE" } }) || Promise.resolve(0)).catch(() => 0),
            prisma.inspection.count().catch(() => 0),
            prisma.inspection.count({ where: { status: "TERMINEE" } }).catch(() => 0),
            prisma.rapportMensuel.count().catch(() => 0),
            prisma.mandate.count({ where: { status: "DRAFT" } }).catch(() => 0),
            ((prisma as any).walletRechargeLink?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).walletRechargeLink?.count?.({ where: { clique: true } }) || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).walletRechargeLink?.count?.({ where: { rechargeEffectuee: true } }) || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).walletRechargeConfig?.count?.({ where: { rappelActif: true } }) || Promise.resolve(0)).catch(() => 0),
            // Nouveaux indicateurs ADD-16
            ((prisma as any).reclamationLocataire?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).dossierLitigeCertifie?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).codePromo?.count?.({ where: { actif: true } }) || Promise.resolve(-1)).catch(() => -1),
            prisma.featureFlag.findUnique({ where: { id: "LANDING_PAGE" } }).catch(() => null),
            getNationalMarketComparison().catch(() => ({ success: false, data: null })),
            // Metrics pour Deltas
            prisma.lease.count({ where: { createdAt: { gte: firstDayCurrentMonth } } }).catch(() => 0),
            prisma.lease.count({ where: { createdAt: { gte: firstDayLastMonth, lt: firstDayCurrentMonth } } }).catch(() => 0),
            // Trend financier (6 derniers mois)
            prisma.receipt.groupBy({
                by: ['periodMonth'],
                _sum: { totalAmount: true },
                where: { status: "paid" },
                orderBy: { periodMonth: 'desc' },
                take: 6
            }).catch(() => []),
            ((prisma as any).passeportLocatif?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).vaultCaution?.aggregate?.({ _sum: { montant: true }, where: { status: "CONSIGNEE" } }) || Promise.resolve(null)).catch(() => null),
            ((prisma as any).championProfile?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).userDiasporaProfile?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).abonnementOperateur?.count?.() || Promise.resolve(0)).catch(() => 0),
            ((prisma as any).signalementLocataire?.count?.({ where: { statut: { in: ['ENVOYE', 'EN_COURS'] } } }) || Promise.resolve(0)).catch(() => 0)
        ]);
        
        // Process trends with safety guards
        const monthLabels = ["JAN", "FEV", "MAR", "AVR", "MAI", "JUN", "JUL", "AOU", "SEP", "OCT", "NOV", "DEC"];
        const trendSource = Array.isArray(monthlyTrendRes) ? monthlyTrendRes : [];
        const currentTrend = [...trendSource].reverse().map(m => {
            const periodStr = m.periodMonth || "";
            const parts = periodStr.split('-');
            const monthNum = parts.length > 1 ? parseInt(parts[1]) : 0;
            return {
                label: (monthNum > 0 && monthNum <= 12) ? monthLabels[monthNum - 1] : "N/A",
                amount: Number(m._sum?.totalAmount || 0)
            };
        });
        const maxTrendAmount = Math.max(...currentTrend.map(t => t.amount), 1);

        // Fetch recent items with detail check
        const recentLeases = await prisma.lease.findMany({
            where: { status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] } },
            take: 4,
            orderBy: { createdAt: 'desc' },
            include: { 
                tenant: true, 
                landlord: true,
                property: { select: { propertyCode: true, commune: true } },
                receipts: { where: { status: "pending" }, take: 1 } // Check for debt
            }
        }).catch(() => []);

        const recentReceipts = await prisma.receipt.findMany({
            where: { status: { in: ['paid', 'PAID', 'Paid'] } },
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { lease: { include: { tenant: true, landlord: true } } }
        }).catch(() => []);
        
        // Formatting data
        const totalPayments = Number(totalPaymentsRes?._sum?.totalAmount || 0);
        const leaseDelta = (leasesCurrentMonth || 0) - (leasesLastMonth || 0);

        const safeData = {
            totalDgi: Number(totalDgiRes?._sum?.totalDgi || 0),
            cdcAmount: Number(cdcAmountRes?._sum?.amount || 0),
            activeMediations: activeMediations || 0,
            kycAutoRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
            overdueStats: overdueStats || { count: 0, totalAmount: 0 },
            totalUsers: totalUsers || 0,
            totalTenants: totalTenants || 0,
            totalLandlords: totalLandlords || 0,
            totalAgencies: totalAgencies || 0,
            totalProperties: totalProperties || 0,
            totalMandates: totalMandates || 0,
            totalMandatesDraft: totalMandatesDraft || 0,
            totalColocs: totalColocs || 0,
            totalLandLeases: totalLandLeases || 0,
            totalLeases: totalLeases || 0,
            totalCertificates: totalCertificates || 0,
            totalPayments,
            tvaCollectee: Math.floor(totalPayments * 0.18),
            totalReversals: totalReversals || 0,
            fraudAlerts: fraudAlerts || 0,
            totalBdqs: totalBdqs || 0,
            confirmedBdqs: confirmedBdqs || 0,
            totalAiConv: totalAiConv || 0,
            totalAiCost: Number(totalAiCostRes?._sum?.coutEstimeFcfa || 0),
            recentAuditLogs,
            documentsUnderReview,
            activeModules: activeModules || 0,
            totalModules: totalModules || 0,
            totalSmsDeclarations: totalSmsDeclarations || 0,
            confirmedSmsDeclarations: confirmedSmsDeclarations || 0,
            totalManagers: totalManagers || 0,
            totalAgents: totalAgents || 0,
            totalPublicProfiles: totalPublicProfiles || 0,
            activeInvitations: activeInvitations || 0,
            totalConsultations: totalConsultations || 0,
            matchRate: matchRate || 0,
            totalEdls: totalEdls || 0,
            certifiedEdls: certifiedEdls || 0,
            totalMonthlyReports: totalMonthlyReports || 0,
            totalWalletLinks: totalWalletLinks || 0,
            totalWalletClicks: totalWalletClicks || 0,
            totalWalletConversions: totalWalletConversions || 0,
            activeWalletConfigs: activeWalletConfigs || 0,
            totalReclamations: totalReclamations || 0,
            totalLitiges: totalLitiges || 0,
            activePromos: activePromos || 0,
            totalPasseports: passeportRes || 0,
            totalVaultAmount: Number(vaultRes?._sum?.montant || 0),
            totalChampions: championsRes || 0,
            totalDiaspora: diasporaRes || 0,
            totalAbonnements: abonnementsRes || 0,
            activeSignalements: signalementsRes || 0
        }

        return (
            <>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Survision Centrale</h1>
                        <p className="page-sub">Contrôle intégral des flux - Hub Abidjan</p>
                    </div>
                    <div className="date-badge">
                        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>

                <div className="kpi-grid">
                    <div className="kpi-card orange">
                        <div className="kpi-glow"></div>
                        <div className="kpi-label">Volume Encaissements</div>
                        <div className="kpi-val">{safeData.totalPayments.toLocaleString()} F</div>
                        <div className="kpi-delta up"><ArrowUpRight className="w-3 h-3" /> {safeData.totalPayments > 0 ? "Actif" : "Initial"}</div>
                    </div>
                    
                    <div className="kpi-card vert">
                        <div className="kpi-glow"></div>
                        <div className="kpi-label">Baux Actifs</div>
                        <div className="kpi-val">{safeData.totalLeases}</div>
                        <div className={`kpi-delta ${leaseDelta >= 0 ? 'up' : 'down'}`}>
                            {leaseDelta >= 0 ? "+" : ""}{leaseDelta} ce mois
                        </div>
                    </div>
                    
                    <div className="kpi-card or">
                        <div className="kpi-glow"></div>
                        <div className="kpi-label">Médiation & Litiges</div>
                        <div className="kpi-val">{safeData.activeMediations}</div>
                        <div className="kpi-delta text-yellow-500">
                            {safeData.activeMediations > 5 ? "Haute Vigilance" : "Sous Contrôle"}
                        </div>
                    </div>
                    
                    <div className="kpi-card gris">
                        <div className="kpi-glow"></div>
                        <div className="kpi-label">Taux Certification KYC</div>
                        <div className="kpi-val">{safeData.kycAutoRate}%</div>
                        <div className="kpi-delta up">QAPRIL IA Opti</div>
                    </div>
                </div>

                {marketIntelligence?.success && marketIntelligence.data && (
                    <AdminMarketWidget data={marketIntelligence.data} />
                )}

                <div className="dash-grid">
                    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="panel-header">
                            <h2 className="panel-title">Tendance Loyers (6 Mois)</h2>
                            <div className="panel-action">Détail financier</div>
                        </div>
                        <div className="chart-bars" style={{ flex: 1, marginBottom: '24px' }}>
                            {currentTrend.map((t, idx) => (
                                <div key={idx} className="bar-col">
                                    <div 
                                        className={`bar ${idx % 2 === 0 ? 'orange' : 'vert'}`} 
                                        style={{ height: `${(t.amount / maxTrendAmount) * 90 + 5}%` }}
                                        title={`${t.amount.toLocaleString()} F`}
                                    ></div>
                                    <div className="bar-label" style={idx === currentTrend.length - 1 ? { color: 'var(--text-main)', fontWeight: 700 } : {}}>{t.label}</div>
                                </div>
                            ))}
                            {currentTrend.length === 0 && (
                                <div className="text-center w-full text-gray-500 py-10">Initialisation des données financières...</div>
                            )}
                        </div>

                        <div className="panel-header" style={{ marginTop: 'auto' }}>
                            <h2 className="panel-title">Surveillance Baux Actifs</h2>
                            <div className="panel-action">Tous les baux</div>
                        </div>
                        <table className="lease-table">
                            <thead>
                                <tr>
                                    <th>Locataire</th>
                                    <th>Propriétaire</th>
                                    <th>Localisation</th>
                                    <th>Loyer Brut</th>
                                    <th>Statut de Paiement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeases.map(lease => {
                                    const tInitials = ((lease.tenant as any)?.firstName?.charAt(0) || lease.tenant?.email?.charAt(0) || "?").toUpperCase() + ((lease.tenant as any)?.lastName?.charAt(0) || "").toUpperCase();
                                    const tName = (lease.tenant as any)?.firstName ? `${(lease.tenant as any).firstName} ${(lease.tenant as any).lastName || ''}` : lease.tenant?.phone || lease.tenant?.email || 'Inconnu';
                                    
                                    const lInitials = ((lease.landlord as any)?.firstName?.charAt(0) || lease.landlord?.email?.charAt(0) || "?").toUpperCase() + ((lease.landlord as any)?.lastName?.charAt(0) || "").toUpperCase();
                                    const lName = (lease.landlord as any)?.firstName ? `${(lease.landlord as any).firstName} ${(lease.landlord as any).lastName || ''}` : lease.landlord?.phone || lease.landlord?.email || 'Inconnu';
                                    
                                    const isLate = lease.receipts.length > 0;
                                    return (
                                    <tr key={lease.id}>
                                        <td>
                                            <div className="tenant-cell">
                                                <div className="t-avatar" style={{backgroundColor: 'var(--ci-nuit2)'}}>{tInitials}</div>
                                                <div className="t-name text-[11px] truncate max-w-[120px]">{tName}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="tenant-cell">
                                                <div className="t-avatar" style={{backgroundColor: 'var(--ci-or-pale)', color: 'var(--ci-or)'}}>{lInitials}</div>
                                                <div className="t-name text-[11px] truncate max-w-[120px]">{lName}</div>
                                            </div>
                                        </td>
                                        <td><div className="t-loc truncate">{lease.property?.commune || 'Inconnue'}</div></td>
                                        <td><div className="t-name">{(lease.rentAmount + lease.chargesAmount).toLocaleString()} F</div></td>
                                        <td>
                                            <div className={`pill ${isLate ? 'pill-late' : 'pill-active'}`}>
                                                <div className="pill-dot"></div>
                                                {isLate ? 'Retard' : 'À jour'}
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                                {recentLeases.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-gray-500 py-4">Aucun bail actif détecté.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="right-col">
                        <div className="panel" style={{ paddingBottom: '12px' }}>
                            <div className="panel-header">
                                <h2 className="panel-title">Passerelles & Quittances</h2>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#8B949E" strokeWidth="1.5"/><path d="M8 5v3l2 2" stroke="#8B949E" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </div>
                            <div className="mm-grid">
                                {recentReceipts.map((rec: any, idx) => {
                                    const tName = rec.lease?.tenant?.lastName ? `${rec.lease.tenant.firstName} ${rec.lease.tenant.lastName}` : 'Locataire Inconnu';
                                    const lName = rec.lease?.landlord?.lastName ? `${rec.lease.landlord.firstName} ${rec.lease.landlord.lastName}` : 'Propriétaire Inconnu';
                                    return (
                                    <div key={rec.id} className="mm-card mtn-card" style={{ borderColor: 'var(--ci-orange)' }}>
                                        <div className="mm-op truncate text-[10px]" title={`De: ${tName}\nÀ: ${lName}`}>
                                            <span style={{color: 'var(--text-main)'}}>{tName.split(' ')[0]}</span> <span style={{opacity: 0.5}}>→</span> <span style={{color: 'var(--ci-or)'}}>{lName.split(' ')[0]}</span>
                                        </div>
                                        <div className="mm-amount">{(rec as any).totalAmount.toLocaleString()} F</div>
                                        <div className="mm-sub capitalize">{(rec as any).periodMonth}</div>
                                    </div>
                                )})}
                                {recentReceipts.length === 0 && (
                                    <div className="text-center text-[10px] text-gray-500 w-full py-4 col-span-2">En attente de transactions</div>
                                )}
                                <div className="mm-card mtn-card mt-2 col-span-2" style={{ background: 'var(--ci-nuit)', color: '#fff' }}>
                                    <div className="mm-op">TRESOR/CDC</div>
                                    <div className="mm-amount">{safeData.cdcAmount.toLocaleString() || '0'} F</div>
                                    <div className="mm-sub">Fonds Consignés Global</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="ci-map" title="Carte simplifiée CI" style={{ background: 'var(--ci-nuit3)', border: '1px solid var(--border)' }}>
                            <div className="ci-map-inner">
                                <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', opacity: 0.15 }}>
                                    <path d="M100,20 C140,20 180,60 180,100 C180,140 140,180 100,180 C60,180 20,140 20,100 C20,60 60,20 100,20 Z" fill="var(--text-main)" stroke="none" />
                                    <path d="M80,60 L120,40 L160,80 L140,140 L70,160 L40,100 Z" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeDasharray="4 4" />
                                </svg>
                                {/* Abidjan Ping */}
                                <div className="map-dot" style={{ bottom: '30%', right: '40%', background: 'var(--ci-vert)' }}></div>
                                {/* San Pedro Ping */}
                                <div className="map-dot" style={{ bottom: '25%', left: '35%', background: 'var(--ci-orange)' }}></div>
                                {/* Bouake Ping */}
                                <div className="map-dot" style={{ top: '45%', left: '50%', background: 'var(--ci-or)' }}></div>
                                <div style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                                    RÉSEAU ACTIF
                                </div>
                            </div>
                        </div>

                        <div className="panel" style={{ flex: 1 }}>
                            <div className="panel-header">
                                <h2 className="panel-title">Audit IA & Logs</h2>
                            </div>
                            <div className="activity-list">
                                {safeData.recentAuditLogs?.slice(0, 4).map((log: any) => (
                                    <div className="activity-item" key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div className="act-icon vert" style={{ background: 'var(--ci-vert-pale)' }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                                        <div>
                                            <div className="act-text" style={{ fontWeight: 500 }}>{log.action || 'Événement système'}</div>
                                            <div className="act-time">{new Date(log.createdAt).toLocaleTimeString()} - {(log.user?.firstName || 'Système')}</div>
                                        </div>
                                    </div>
                                ))}
                                {(!safeData.recentAuditLogs || safeData.recentAuditLogs.length === 0) && (
                                    <div className="activity-item">
                                        <div className="act-icon orange"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 12l4-8 4 8" stroke="currentColor" strokeWidth="1.5"/></svg></div>
                                        <div>
                                            <div className="act-text">En attente d'événements</div>
                                            <div className="act-time">À l'instant - SysAdmin</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="panel" style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <div className="panel-header">
                        <h2 className="panel-title">Nouveaux Modules (Adoption V1.1)</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg mb-2"><Lock size={20}/></div>
                            <div className="text-xl font-black text-gray-900">{safeData.totalVaultAmount.toLocaleString()} F</div>
                            <div className="text-[10px] uppercase text-gray-500 font-bold">Vault Consigné</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mb-2"><Key size={20}/></div>
                            <div className="text-xl font-black text-gray-900">{safeData.totalPasseports}</div>
                            <div className="text-[10px] uppercase text-gray-500 font-bold">Passeports Générés</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg mb-2"><Trophy size={20}/></div>
                            <div className="text-xl font-black text-gray-900">{safeData.totalChampions}</div>
                            <div className="text-[10px] uppercase text-gray-500 font-bold">Champions Actifs</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg mb-2"><Globe size={20}/></div>
                            <div className="text-xl font-black text-gray-900">{safeData.totalDiaspora}</div>
                            <div className="text-[10px] uppercase text-gray-500 font-bold">Diaspora VIP</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mb-2"><Wifi size={20}/></div>
                            <div className="text-xl font-black text-gray-900">{safeData.totalAbonnements}</div>
                            <div className="text-[10px] uppercase text-gray-500 font-bold">Abonnements Actifs</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                            <div className="p-2 bg-red-100 text-red-600 rounded-lg mb-2"><AlertTriangle size={20}/></div>
                            <div className="text-xl font-black text-gray-900">{safeData.activeSignalements}</div>
                            <div className="text-[10px] uppercase text-gray-500 font-bold">Signalements Actifs</div>
                        </div>
                    </div>
                </div>

                <div className="ci-stripe"></div>

                <div className="bottom-row">
                    <div className="panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Reversements DGI</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--ci-orange-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ci-orange)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800 }}>{safeData.totalDgi.toLocaleString()} F</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Droits M17 collectés</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="panel">
                        <div className="panel-header">
                            <h2 className="panel-title">M-GUARD & Fraudes</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--ci-or-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ci-or)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800 }}>{safeData.fraudAlerts} Alertes</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Profils risqués détectés</div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <h2 className="panel-title">SMS Déclarations</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--ci-vert-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ci-vert)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-head)', fontSize: '20px', fontWeight: 800 }}>{safeData.totalSmsDeclarations} Total</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Confirmées: {safeData.confirmedSmsDeclarations}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </>
        )
    } catch (error: any) {
        return (
            <div style={{ padding: '40px', background: 'var(--ci-nuit2)', borderRadius: '16px', border: '1px solid var(--ci-orange)' }}>
                <h2 style={{ color: 'var(--ci-orange)', fontFamily: 'var(--font-head)', fontSize: '24px' }}>Erreur Critique</h2>
                <p style={{ color: 'var(--text-muted)' }}>{String(error)}</p>
            </div>
        )
    }
}
