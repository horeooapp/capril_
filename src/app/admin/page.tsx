import { prisma } from "@/lib/prisma"
import { AlertCircle, ArrowUpRight, Banknote, ShieldCheck, Scale, History, UserCheck, FileText } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardOverview() {
    // 1. Stats de Base
    const totalUsers = await prisma.user.count()
    const totalProperties = await prisma.property.count()
    const totalLeases = await prisma.lease.count()
    
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
        include: { user: { select: { fullName: true } } },
        take: 3,
        orderBy: { createdAt: 'desc' }
    })

    // 7. Audit Logs Récents
    const recentAuditLogs = await prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, role: true } } }
    })

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">QAPRIL Command Center <span className="text-orange-500 font-mono text-xl">v3.0</span></h1>
                    <p className="text-gray-500 mt-1">Supervision nationale des flux immobiliers et fiscaux sécurisés.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-green-500/10 text-green-700 px-4 py-2 rounded-full text-xs font-bold border border-green-500/20 flex items-center gap-2">
                        <ShieldCheck size={14} /> Réseau Sécurisé
                    </div>
                </div>
            </header>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Volume Fiscal (M17)" 
                    value={`${Number(fiscalStats?._sum?.totalDgi || 0).toLocaleString()} FCFA`} 
                    icon={Banknote} 
                    color="orange"
                    trend="+12%"
                />
                <StatCard 
                    title="Consignation CDC (M18)" 
                    value={`${Number(cdcStats?._sum?.amount || 0).toLocaleString()} FCFA`} 
                    icon={ShieldCheck} 
                    color="blue"
                />
                <StatCard 
                    title="Médiations Actives (M19)" 
                    value={activeMediations.toString()} 
                    icon={Scale} 
                    color="red"
                />
                <StatCard 
                    title="Auto-KYC IA (M21)" 
                    value={`${kycAutoRate}%`} 
                    icon={UserCheck} 
                    color="purple"
                    trend="Efficience"
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
                            {documentsUnderReview.length > 0 ? documentsUnderReview.map((doc: any) => (
                                <div key={doc.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                            {doc.user.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{doc.user.fullName}</p>
                                            <p className="text-xs text-gray-500">Document: {doc.docType} • Flag AI</p>
                                        </div>
                                    </div>
                                    <Link href={`/admin/validation`} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                                        <ArrowUpRight size={18} className="text-gray-400" />
                                    </Link>
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
                                    {recentAuditLogs.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-[10px] text-gray-400">
                                                {new Date(log.createdAt).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-gray-900">{log.action.replace(/_/g, ' ')}</span>
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
                            <p className="text-2xl font-black text-gray-900">{totalUsers}</p>
                         </div>
                         <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-1">Properties</p>
                            <p className="text-2xl font-black text-gray-900">{totalProperties}</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
    const colors: any = {
        orange: "bg-orange-500/10 text-orange-600",
        blue: "bg-blue-500/10 text-blue-600",
        red: "bg-red-500/10 text-red-600",
        purple: "bg-purple-500/10 text-purple-600"
    }

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center mb-4`}>
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
