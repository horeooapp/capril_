import { prisma } from "@/lib/prisma"
import { AlertCircle, ArrowUpRight, Banknote, ShieldCheck, Scale, History, UserCheck, FileText, Sparkles, Database } from "lucide-react"
import Link from "next/link"
import { getDemoMode } from "@/actions/demo-actions"
import { getDemoData } from "@/lib/demo-data"
import DemoToggle from "@/components/admin/DemoToggle"

export default async function AdminDashboardOverview() {
    const isDemoMode = await getDemoMode()
    
    try {
        let data: any;

        if (isDemoMode) {
            data = getDemoData()
        } else {
            // 1. Stats de Base
            const [totalUsers, totalProperties, totalLeases, totalMandates, activeColocs, landLeases] = await Promise.all([
                prisma.user.count(),
                prisma.property.count(),
                prisma.lease.count(),
                prisma.mandate.count({ where: { status: "ACTIVE" } }),
                prisma.colocataire.count({ where: { status: "ACTIF" } }),
                prisma.landLeaseInfo.count()
            ])
            
            // 2. Stats v3.0 - Fiscalité (M17)
            const fiscalStats = await prisma.fiscalDossier.aggregate({
                where: { statut: { in: ["PAYE_CONFIRME", "PAIEMENT_PARTIEL"] } },
                _sum: { totalDgi: true }
            })

            // 3. Stats v3.0 - Cautions (M18)
            const cdcStats = await prisma.cDCDeposit.aggregate({
                where: { status: "CONSIGNED" },
                _sum: { amount: true }
            })

            // 4. Stats v3.0 - Contentieux (M19)
            const activeMediations = await prisma.mediation.count({
                where: { status: "OPEN" }
            })

            // 5. Stats v3.0 - KYC (M21)
            const kycAutoValidated = await prisma.identityDocument.count({
                where: { status: "verified", verifiedByUserId: "SYSTEM_AI" }
            })
            const totalKycDocs = await prisma.identityDocument.count({
                where: { status: "verified" }
            })
            const kycAutoRate = totalKycDocs > 0 ? Math.round((kycAutoValidated / totalKycDocs) * 100) : 0

            // 6. Alertes & Anomalies (M21 flags)
            const documentsUnderReview = await prisma.identityDocument.findMany({
                where: { status: "under_review" },
                select: {
                    id: true,
                    docType: true,
                    status: true,
                    createdAt: true,
                    user: {
                        select: {
                            fullName: true
                        }
                    }
                },
                take: 3,
                orderBy: { createdAt: 'desc' }
            })

            // 7. Audit Logs Récents
            const recentAuditLogs = await prisma.auditLog.findMany({
                select: {
                    id: true,
                    action: true,
                    module: true,
                    createdAt: true,
                    user: {
                        select: {
                            fullName: true,
                            role: true
                        }
                    }
                },
                take: 5,
                orderBy: { createdAt: 'desc' }
            })

            data = {
                totalUsers, totalProperties, totalLeases,
                totalMandates, activeColocs, landLeases,
                fiscalStats, cdcStats, activeMediations,
                kycAutoRate, documentsUnderReview, recentAuditLogs
            }
        }

        return (
            <div className="space-y-8 pb-12">
                {/* ... (Keep banners and header as is) */}
                
                {/* Core Global Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Volume Fiscal (M17)" 
                        value={`${Number(data.fiscalStats?._sum?.totalDgi || 0).toLocaleString()} FCFA`} 
                        icon={Banknote} 
                        color="orange"
                        trend={isDemoMode ? "SIM_DGI" : "+12%"}
                    />
                    <StatCard 
                        title="Consignation CDC (M18)" 
                        value={`${Number(data.cdcStats?._sum?.amount || 0).toLocaleString()} FCFA`} 
                        icon={ShieldCheck} 
                        color="blue"
                    />
                    <StatCard 
                        title="Médiations Actives (M19)" 
                        value={(data.activeMediations || 0).toString()} 
                        icon={Scale} 
                        color="red"
                    />
                    <StatCard 
                        title="Auto-KYC IA (M21)" 
                        value={`${data.kycAutoRate}%`} 
                        icon={UserCheck} 
                        color="purple"
                        trend="Efficience"
                    />
                </div>

                {/* New Modules Activity Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Mandats Actifs" 
                        value={(data.totalMandates || 0).toString()} 
                        icon={FileText} 
                        color="slate"
                    />
                    <StatCard 
                        title="Colocs Actives" 
                        value={(data.activeColocs || 0).toString()} 
                        icon={Database} 
                        color="emerald"
                    />
                    <StatCard 
                        title="Baux Terrains" 
                        value={(data.landLeases || 0).toString()} 
                        icon={ArrowUpRight} 
                        color="amber"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Alerts & Systems */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Critical Alerts KYC */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <AlertCircle className="text-red-500" size={18} />
                                    Anomalies & Vérifications requises
                                </h3>
                                <Link href="/admin/validation" className="text-xs text-orange-600 font-bold hover:underline">Voir tout</Link>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {(data.documentsUnderReview || []).length > 0 ? data.documentsUnderReview.map((doc: any) => (
                                    <div key={doc.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                                {doc.user?.fullName?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{doc.user?.fullName || "Inconnu"}</p>
                                                <p className="text-xs text-gray-500">Document: {doc.docType} • Flag AI</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isDemoMode && <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Demo</span>}
                                            <Link href={`/admin/validation`} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                                                <ArrowUpRight size={18} className="text-gray-400" />
                                            </Link>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center text-gray-400 text-sm italic">
                                        Aucune anomalie détectée par le moteur IA.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Audit Trail */}
                        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <History className="text-blue-500" size={18} />
                                    Journal d&apos;Audit Sécurisé
                                </h3>
                                <Link href="/admin/audit" className="text-xs text-blue-600 font-bold hover:underline">Accéder au Log</Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                                        <tr>
                                            <th className="px-6 py-3">Timestamp</th>
                                            <th className="px-6 py-3">Action</th>
                                            <th className="px-6 py-3">Utilisateur</th>
                                            <th className="px-6 py-3 text-right">Module</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(data.recentAuditLogs || []).map((log: any) => (
                                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-[10px] text-gray-400">
                                                    {log.createdAt ? new Date(log.createdAt).toLocaleString('fr-FR') : "-"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900">{(log.action || "ACTION_INCONNUE").replace(/_/g, ' ')}</span>
                                                        {isDemoMode && <span className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded font-black italic">DEMO</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {log.user?.fullName || "Système"}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                                        {log.module}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Key Links & Snapshots */}
                    <div className="space-y-8">
                        <section className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <FileText size={160} />
                            </div>
                            <h4 className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-4">Moteur Fiscal (M17)</h4>
                            <p className="text-xl font-bold mb-6">Générer le rapport consolidé DGI</p>
                            <Link href="/admin/fiscal" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all">
                                <span>Ouvrir l&apos;interface</span>
                                <ArrowUpRight size={18} />
                            </Link>
                        </section>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-1">Users</p>
                                <p className="text-2xl font-black text-gray-900">{data.totalUsers || 0}</p>
                            </div>
                            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-1">Properties</p>
                                <p className="text-2xl font-black text-gray-900">{data.totalProperties || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error("[ADMIN DASHBOARD] Critical render error:", error)
        return (
            <div className="p-8 bg-red-50 border-2 border-red-100 rounded-[2.5rem] flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Erreur de Supervision</h2>
                <div className="bg-white/80 p-6 rounded-[2rem] border border-red-200 mb-8 max-w-2xl w-full shadow-inner text-[10px]">
                    <p className="text-red-900 font-mono text-left whitespace-pre-wrap leading-relaxed">
                        <span className="font-black text-red-600 uppercase block mb-1">Diagnostic Technique :</span>
                        {error?.message || String(error)}
                    </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                    <p className="text-gray-500 text-[10px] italic">Accrocs détectés côté base de données.</p>
                     <div className="flex gap-4">
                        <DemoToggle initialEnabled={isDemoMode} />
                        <Link href="/admin" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary transition-all shadow-xl">
                            Rafraîchir
                        </Link>
                     </div>
                </div>
            </div>
        )
    }
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
    const colors: any = {
        orange: "bg-orange-500/10 text-orange-600",
        blue: "bg-blue-500/10 text-blue-600",
        red: "bg-red-500/10 text-red-600",
        purple: "bg-purple-500/10 text-purple-600",
        slate: "bg-slate-500/10 text-slate-600",
        emerald: "bg-emerald-500/10 text-emerald-600",
        amber: "bg-amber-500/10 text-amber-600"
    }

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`w-12 h-12 rounded-2xl ${colors[color] || colors.orange} flex items-center justify-center mb-4`}>
                <Icon size={24} />
            </div>
            <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 tracking-tight uppercase">{title}</p>
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
            </div>
            {trend && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-1 text-[10px] font-black text-green-600 uppercase">
                    <ArrowUpRight size={12} /> {trend}
                </div>
            )}
        </div>
    )
}
