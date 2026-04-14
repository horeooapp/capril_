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
import LandingToggle from "@/components/admin/LandingToggle"
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
import SyncButton from "@/components/admin/SyncButton"

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
        landingFlag
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
        prisma.user.count({ where: { fraudProfile: { fraudScore: { gt: 50 } } } }).catch(() => 0),
        (prisma as any).bailDeclaratif.count().catch(() => 0),
        (prisma as any).bailDeclaratif.count({ where: { statut: "CONFIRME" } }).catch(() => 0),
        (prisma as any).bdqConversationState.count().catch(() => 0),
        (prisma as any).bdqConversationState.aggregate({ _sum: { coutEstimeFcfa: true } }).catch(() => null),
        prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true } } } }).catch(() => []),
        prisma.identityDocument.findMany({ where: { status: "pending" }, take: 5, include: { user: { select: { firstName: true, lastName: true } } } }).catch(() => []),
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
        prisma.featureFlag.findUnique({ where: { id: "LANDING_PAGE" } }).catch(() => null),
    ]);
    
    // Fetch recent items for UI displays
    const recentLeases = await prisma.lease.findMany({
        where: { status: { in: ["ACTIVE", "ACTIVE_DECLARATIF"] } },
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: { tenant: true, property: { select: { propertyCode: true, commune: true } } }
    }).catch(() => []);

    const recentReceipts = await prisma.receipt.findMany({
        where: { status: { in: ['paid', 'PAID', 'Paid'] } },
        take: 3,
        orderBy: { createdAt: 'desc' }
    }).catch(() => []);
    
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
    const isLandingEnabled = landingFlag ? (landingFlag as any).enabled : true;

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
                        <div className="kpi-delta up"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8.5V1.5M5 1.5L1.5 5M5 1.5L8.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Stable</div>
                    </div>
                    
                    <div className="kpi-card vert">
                        <div className="kpi-glow"></div>
                        <div className="kpi-label">Baux Actifs</div>
                        <div className="kpi-val">{safeData.totalLeases}</div>
                        <div className="kpi-delta up"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8.5V1.5M5 1.5L1.5 5M5 1.5L8.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> +12 ce mois</div>
                    </div>
                    
                    <div className="kpi-card or">
                        <div className="kpi-glow"></div>
                        <div className="kpi-label">Médiation & Litiges</div>
                        <div className="kpi-val">{safeData.activeMediations}</div>
                        <div className="kpi-delta down"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1.5V8.5M5 8.5L8.5 5M5 8.5L1.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Haute Vigilance</div>
                    </div>
                    
                    <div className="kpi-card gris">
                        <div className="kpi-glow"></div>
                        <div className="kpi-label">Taux Certification KYC</div>
                        <div className="kpi-val">{safeData.kycAutoRate}%</div>
                        <div className="kpi-delta up"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8.5V1.5M5 1.5L1.5 5M5 1.5L8.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> QAPRIL IA</div>
                    </div>
                </div>

                <div className="dash-grid">
                    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="panel-header">
                            <h2 className="panel-title">Tendance Loyers (6 Mois)</h2>
                            <div className="panel-action">Voir le rapport</div>
                        </div>
                        <div className="chart-bars" style={{ flex: 1, marginBottom: '24px' }}>
                            <div className="bar-col"><div className="bar orange" style={{height: '35%'}}></div><div className="bar-label">NOV</div></div>
                            <div className="bar-col"><div className="bar vert" style={{height: '45%'}}></div><div className="bar-label">DEC</div></div>
                            <div className="bar-col"><div className="bar or" style={{height: '75%'}}></div><div className="bar-label">JAN</div></div>
                            <div className="bar-col"><div className="bar vert" style={{height: '60%'}}></div><div className="bar-label">FEV</div></div>
                            <div className="bar-col"><div className="bar orange" style={{height: '50%'}}></div><div className="bar-label">MAR</div></div>
                            <div className="bar-col"><div className="bar vert" style={{height: '90%'}}></div><div className="bar-label" style={{color: 'var(--text-main)', fontWeight: 700}}>AVR</div></div>
                        </div>

                        <div className="panel-header" style={{ marginTop: 'auto' }}>
                            <h2 className="panel-title">Surveillance Baux Actifs</h2>
                            <div className="panel-action">Filtrer</div>
                        </div>
                        <table className="lease-table">
                            <thead>
                                <tr>
                                    <th>Locataire</th>
                                    <th>Localisation</th>
                                    <th>Montant</th>
                                    <th>Statut Actuel</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeases.map(lease => {
                                    const tInitials = ((lease.tenant as any)?.firstName?.charAt(0) || lease.tenant?.email?.charAt(0) || "?").toUpperCase() + ((lease.tenant as any)?.lastName?.charAt(0) || "").toUpperCase();
                                    const tName = (lease.tenant as any)?.firstName ? `${(lease.tenant as any).firstName} ${(lease.tenant as any).lastName || ''}` : lease.tenant?.phone || lease.tenant?.email || 'Inconnu';
                                    return (
                                    <tr key={lease.id}>
                                        <td>
                                            <div className="tenant-cell">
                                                <div className="t-avatar" style={{backgroundColor: 'var(--ci-nuit2)'}}>{tInitials}</div>
                                                <div className="t-name text-[11px] truncate">{tName}</div>
                                            </div>
                                        </td>
                                        <td><div className="t-loc truncate">{lease.property?.commune || 'Inconnue'}</div></td>
                                        <td><div className="t-name">{(lease.rentAmount + lease.chargesAmount).toLocaleString()} F</div></td>
                                        <td><div className="pill pill-active"><div className="pill-dot"></div>À jour</div></td>
                                    </tr>
                                )})}
                                {recentLeases.length === 0 && (
                                    <tr><td colSpan={4} className="text-center text-gray-500 py-4">Aucun bail récent.</td></tr>
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
                                {recentReceipts.map((rec, idx) => (
                                    <div key={rec.id} className="mm-card mtn-card" style={{ borderColor: 'var(--ci-orange)' }}>
                                        <div className="mm-op">Reçu #{idx+1}</div>
                                        <div className="mm-amount">{(rec as any).totalAmount.toLocaleString()} F</div>
                                        <div className="mm-sub capitalize">{(rec as any).periodMonth}</div>
                                    </div>
                                ))}
                                {recentReceipts.length === 0 && (
                                    <div className="text-center text-[10px] text-gray-500 w-full py-4 col-span-2">En attente de transactions</div>
                                )}
                                <div className="mm-card mtn-card mt-2 col-span-2">
                                    <div className="mm-op">TRESOR/CDC</div>
                                    <div className="mm-amount text-white">{safeData.cdcAmount.toLocaleString() || '0'} F</div>
                                    <div className="mm-sub">Fonds Consignés Global</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="ci-map" title="Carte simplifiée CI">
                            <div className="ci-map-inner">
                                <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', opacity: 0.1 }}>
                                    <path d="M100,20 C140,20 180,60 180,100 C180,140 140,180 100,180 C60,180 20,140 20,100 C20,60 60,20 100,20 Z" fill="currentColor" stroke="none" />
                                    <path d="M80,60 L120,40 L160,80 L140,140 L70,160 L40,100 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
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
                                    <div className="activity-item" key={log.id}>
                                        <div className="act-icon vert"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M13 4L6 11L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                                        <div>
                                            <div className="act-text">{log.action || 'Événement système'}</div>
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

                <div className="ci-stripe"></div>

                <div className="bottom-row">
                    <div className="panel">
                        <div className="panel-header">
                            <h2 className="panel-title">Reversements DGI</h2>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,102,0,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ci-orange)' }}>
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
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(244,196,48,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ci-or)' }}>
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
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,154,61,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ci-vert)' }}>
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
