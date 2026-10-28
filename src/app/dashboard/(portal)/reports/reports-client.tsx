"use client"

import React, { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
    FileText, 
    Download, 
    ChartPie, 
    CheckCircle2, 
    Clock, 
    Calendar, 
    Search, 
    SendHorizontal, 
    Calculator, 
    Plus, 
    Printer, 
    Trash2, 
    Check,
    Building2,
    User
} from "lucide-react"
import { toast } from "sonner"
import { 
    payFinancialReport, 
    exportExcelHistory, 
    closeMonthWithAI, 
    deleteFinancialReport 
} from "@/actions/report-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { Badge } from "@/components/dashboard/ui/Badge"
import CreateFinancialReportModal from "@/components/dashboard/reports/CreateFinancialReportModal"
import PrintableCrgModal from "@/components/dashboard/reports/PrintableCrgModal"

export default function ReportsDashboardClient({ initialReports = [] }: { initialReports: any[] }) {
    const router = useRouter()
    const [reports, setReports] = useState(initialReports)
    const [isPending, startTransition] = useTransition()
    const [search, setSearch] = useState("")

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedReportForPrint, setSelectedReportForPrint] = useState<any>(null)

    useEffect(() => {
        setReports(initialReports)
    }, [initialReports])

    // Filtre de recherche
    const filteredReports = reports.filter((c: any) => {
        const query = search.toLowerCase().trim()
        if (!query) return true
        const name = (c.ownerName || '').toLowerCase()
        const period = (c.period || '').toLowerCase()
        return name.includes(query) || period.includes(query)
    })

    // KPIs calculés
    const totalGrossGlobal = reports.reduce((acc: number, c: any) => acc + (Number(c.totalGross) || 0), 0)
    const totalComActuelle = reports.reduce((acc: number, c: any) => acc + (Number(c.agencyFee) || 0), 0)
    const totalNetAttente = reports
        .filter((c: any) => c.status === "EN_ATTENTE" || c.status === "pending")
        .reduce((acc: number, c: any) => acc + (Number(c.netPayout) || 0), 0)

    // Action 1: Export Historique Excel / CSV
    const handleExportExcel = () => {
        startTransition(async () => {
            try {
                toast.loading("Génération du relevé comptable...", { id: "crg-excel" })
                const res = await exportExcelHistory()
                
                if (res.error) {
                    toast.error(res.error, { id: "crg-excel" })
                    return
                }

                if (!res.csvContent) {
                    toast.error("Aucune écriture comptable disponible.", { id: "crg-excel" })
                    return
                }

                // Téléchargement navigateur direct
                const blob = new Blob([res.csvContent], { type: "text/csv;charset=utf-8;" })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.setAttribute("download", res.filename || `historique_crg_${new Date().getFullYear()}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                toast.success("Historique comptable téléchargé avec succès !", { id: "crg-excel" })
            } catch (err: any) {
                toast.error("Erreur lors de l'export : " + (err.message || ""), { id: "crg-excel" })
            }
        })
    }

    // Action 2: Clôture du mois et génération des CRG
    const handleCloseMonth = () => {
        const currentPeriod = reports[0]?.period || new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
        
        startTransition(async () => {
            toast.loading("Calcul des baux, commissions et déductions...", { id: "ai-close" })
            try {
                const res = await closeMonthWithAI(currentPeriod)
                if (res.success) {
                    toast.success(res.message || "Comptes rendus de gestion calculés et enregistrés !", { id: "ai-close" })
                    router.refresh()
                } else {
                    toast.error(res.error || "Échec du calcul comptable", { id: "ai-close" })
                }
            } catch (err: any) {
                toast.error("Erreur de traitement : " + (err.message || ""), { id: "ai-close" })
            }
        })
    }

    // Action 3: Payer / Enregistrer le reversement au propriétaire
    const handlePay = (id: string, ownerName: string) => {
        if (!confirm(`Confirmez-vous le versement du reversement au propriétaire ${ownerName} ?`)) {
            return
        }

        startTransition(async () => {
            const res = await payFinancialReport(id)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(res.message || "Reversement validé avec succès en base de données.")
                setReports(prev => prev.map(r => r.id === id ? { ...r, status: "PAYE" } : r))
                router.refresh()
            }
        })
    }

    // Action 4: Supprimer un CRG
    const handleDelete = (id: string, ownerName: string) => {
        if (!confirm(`Supprimer le compte rendu de gestion pour ${ownerName} ?`)) {
            return
        }

        startTransition(async () => {
            const res = await deleteFinancialReport(id)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Compte rendu supprimé du registre.")
                setReports(prev => prev.filter(r => r.id !== id))
                router.refresh()
            }
        })
    }

    return (
        <div className="space-y-6 relative">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-2 shadow-sm">
                        <ChartPie size={12} /> B2B Finance & Gérance
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3 mt-1">
                        <FileText className="text-emerald-600" size={30} /> 
                        Comptes Rendus de Gestion (CRG)
                    </h1>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">
                        Bordereaux de reversement mensuel certifiés pour vos propriétaires mandants.
                    </p>
                </div>
                
                {/* 3 ACTIONS OPÉRATIONNELLES CONNECTÉES */}
                <div className="flex flex-wrap gap-2.5 sm:gap-3 w-full md:w-auto">
                    
                    {/* Bouton 1 : Historique Mensuel */}
                    <button 
                        onClick={handleExportExcel} 
                        disabled={isPending} 
                        className="bg-white border text-slate-700 border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 flex-1 sm:flex-none"
                    >
                        <Calendar size={16} className="text-slate-500" /> 
                        <span>Historique Mensuel</span>
                    </button>
                    
                    {/* Bouton 2 : Clôturer le mois */}
                    <button 
                        onClick={handleCloseMonth} 
                        disabled={isPending} 
                        className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 flex-1 sm:flex-none"
                    >
                        <Calculator size={16} /> 
                        <span>Clôturer {reports[0]?.period || 'le mois'}</span>
                    </button>

                    {/* Bouton 3 : Nouveau CRG */}
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-slate-900 text-white hover:bg-black px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-none"
                    >
                        <Plus size={16} /> 
                        <span>Nouveau CRG</span>
                    </button>

                </div>
            </div>

            {/* Dashboard KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard 
                    label="Période en cours" 
                    value={reports[0]?.period || new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })} 
                    sub="Clôture et régularisation" 
                />
                <StatCard 
                    label="Loyers Bruts Globaux" 
                    value={`${totalGrossGlobal.toLocaleString()} XOF`} 
                    sub="Recouvrement total" 
                />
                <StatCard 
                    label="Commissions Agence" 
                    value={`${totalComActuelle.toLocaleString()} XOF`} 
                    sub="Honoraires de gestion (8%)" 
                />
                <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-5 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden text-white border border-emerald-700">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-1 relative z-10 flex items-center gap-1.5">
                        <SendHorizontal size={14}/> À Virer aux Propriétaires
                    </span>
                    <span className="text-2xl sm:text-3xl font-black relative z-10">
                        {totalNetAttente.toLocaleString()} <span className="text-xs">XOF</span>
                    </span>
                    <p className="text-[11px] text-emerald-300/80 mt-1 relative z-10">Net après déductions</p>
                    <Calculator className="absolute -right-4 -bottom-4 text-emerald-400 opacity-10" size={90} />
                </div>
            </div>

            {/* CRG Table */}
            <SectionCard title="Bordereaux de Reversement aux Mandants" noPadding>
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/60">
                    <div className="text-xs font-semibold text-slate-500">
                        {filteredReports.length} compte(s) rendu(s) répertorié(s)
                    </div>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input 
                            type="text" 
                            placeholder="Rechercher par propriétaire ou mois..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm placeholder:text-slate-400" 
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[850px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <th className="py-3 px-4">Propriétaire & Période</th>
                                <th className="py-3 px-4">Loyer Brut</th>
                                <th className="py-3 px-4">Retenues (Com + TVA)</th>
                                <th className="py-3 px-4">Travaux</th>
                                <th className="py-3 px-4 bg-emerald-50/70 border-x border-emerald-100 text-emerald-800">NET À VIRER</th>
                                <th className="py-3 px-4">Statut</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100 text-xs">
                            {filteredReports.map((c: any) => {
                                const isPaid = c.status === 'PAYE' || c.status === 'paye'
                                const totalRetenues = (Number(c.agencyFee) || 0) + (Number(c.tva) || 0)

                                return (
                                    <tr key={c.id} className={`hover:bg-slate-50/60 transition-colors ${isPaid ? 'opacity-90' : ''}`}>
                                        
                                        {/* Propriétaire */}
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-800 shrink-0">
                                                    {(c.ownerName || 'P').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-xs">{c.ownerName}</p>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                                                        <span className="font-medium text-slate-600">{c.period}</span>
                                                        <span>•</span>
                                                        <span>{c.propertiesCount} bien(s)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Loyer Brut */}
                                        <td className="py-3.5 px-4 font-bold text-slate-800">
                                            {(Number(c.totalGross) || 0).toLocaleString()} XOF
                                        </td>

                                        {/* Retenues */}
                                        <td className="py-3.5 px-4">
                                            <p className="font-bold text-rose-600">
                                                -{totalRetenues.toLocaleString()} XOF
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                Com: {Number(c.agencyFee || 0).toLocaleString()} | TVA: {Number(c.tva || 0).toLocaleString()}
                                            </p>
                                        </td>

                                        {/* Travaux déduits */}
                                        <td className="py-3.5 px-4 font-bold text-amber-600">
                                            {Number(c.repairCosts) > 0 ? `-${Number(c.repairCosts).toLocaleString()} XOF` : '-'}
                                        </td>

                                        {/* Net à virer */}
                                        <td className="py-3.5 px-4 bg-emerald-50/50 font-black text-sm text-emerald-700 border-x border-emerald-50">
                                            {(Number(c.netPayout) || 0).toLocaleString()} XOF
                                        </td>

                                        {/* Statut Badge */}
                                        <td className="py-3.5 px-4">
                                            {isPaid ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wide">
                                                    <CheckCircle2 size={12} /> Réglé
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wide">
                                                    <Clock size={12} /> En Attente
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                
                                                {/* Bouton Payer (si pas encore payé) */}
                                                {!isPaid && (
                                                    <button 
                                                        onClick={() => handlePay(c.id, c.ownerName)} 
                                                        disabled={isPending}
                                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors text-[11px] font-bold flex items-center gap-1 disabled:opacity-50" 
                                                        title="Valider le reversement"
                                                    >
                                                        <Check size={12} />
                                                        <span>Régler</span>
                                                    </button>
                                                )}

                                                {/* Bouton Imprimer / PDF */}
                                                <button 
                                                    onClick={() => setSelectedReportForPrint(c)} 
                                                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors shadow-sm" 
                                                    title="Bordereau PDF / Imprimer"
                                                >
                                                    <Printer size={14} />
                                                </button>

                                                {/* Bouton Supprimer */}
                                                <button 
                                                    onClick={() => handleDelete(c.id, c.ownerName)} 
                                                    disabled={isPending}
                                                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors shadow-sm disabled:opacity-50" 
                                                    title="Supprimer ce compte rendu"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                )
                            })}
                            
                            {filteredReports.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-sm font-medium text-slate-400">
                                        Aucun bordereau de reversement trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* Modal de Création Manuelle de CRG */}
            <CreateFinancialReportModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => router.refresh()}
            />

            {/* Modal d'Impression / PDF officiel */}
            <PrintableCrgModal
                isOpen={!!selectedReportForPrint}
                onClose={() => setSelectedReportForPrint(null)}
                report={selectedReportForPrint}
            />

        </div>
    )
}
