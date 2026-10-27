"use client"

import React, { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
    FileText, 
    Search, 
    Download, 
    Calculator, 
    Plus, 
    AlertTriangle, 
    Send, 
    Building2, 
    User, 
    Calendar, 
    Printer, 
    Trash2, 
    Edit, 
    ExternalLink,
    CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import { deleteReceipt, dispatchDigitalDelivery } from "@/actions/receipt.actions"
import ManualReceiptModal from "@/components/dashboard/ManualReceiptModal"
import GenerateNextMonthModal from "@/components/dashboard/GenerateNextMonthModal"
import DgiExportModal from "@/components/dashboard/DgiExportModal"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { StatCard } from "@/components/dashboard/ui/StatCard"
import { Badge } from "@/components/dashboard/ui/Badge"

interface ReceiptsDashboardClientProps {
    initialReceipts: any[]
    activeLeases?: any[]
}

export default function ReceiptsDashboardClient({ 
    initialReceipts = [], 
    activeLeases = [] 
}: ReceiptsDashboardClientProps) {
    const router = useRouter()
    const [receipts, setReceipts] = useState<any[]>(initialReceipts)
    const [isPending, startTransition] = useTransition()
    
    // Modal states
    const [isManualModalOpen, setIsManualModalOpen] = useState(false)
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
    const [isDgiModalOpen, setIsDgiModalOpen] = useState(false)
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
    
    const [search, setSearch] = useState("")

    useEffect(() => {
        setReceipts(initialReceipts)
    }, [initialReceipts])

    const filteredReceipts = receipts.filter(r => {
        const query = search.toLowerCase().trim()
        if (!query) return true

        const ref = (r.receiptRef || r.id || '').toLowerCase()
        const leaseRef = (r.lease?.leaseReference || r.leaseId || '').toLowerCase()
        const tenantName = `${r.lease?.tenant?.firstName || ''} ${r.lease?.tenant?.lastName || ''}`.toLowerCase()
        const propertyName = (r.lease?.property?.name || r.lease?.property?.address || '').toLowerCase()
        const commune = (r.lease?.property?.commune || '').toLowerCase()
        const period = (r.periodMonth || '').toLowerCase()

        return ref.includes(query) || 
               leaseRef.includes(query) || 
               tenantName.includes(query) || 
               propertyName.includes(query) || 
               commune.includes(query) || 
               period.includes(query)
    })

    const openCreateModal = () => {
        setSelectedReceipt(null)
        setIsManualModalOpen(true)
    }

    const openEditModal = (receipt: any) => {
        setSelectedReceipt(receipt)
        setIsManualModalOpen(true)
    }

    const handleDeleteReceipt = (receiptId: string, ref: string) => {
        if (!confirm(`Confirmez-vous la suppression de la quittance / avis ${ref} ?`)) {
            return
        }

        startTransition(async () => {
            const res = await deleteReceipt(receiptId)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Document supprimé avec succès.")
                setReceipts(prev => prev.filter(r => r.id !== receiptId))
                router.refresh()
            }
        })
    }

    const handleDigitalDelivery = (receiptId: string) => {
        startTransition(async () => {
            const promise = dispatchDigitalDelivery(receiptId, 'maposte_number', { addr: 'Default Customer' })
            toast.promise(promise, {
                loading: "Expédition digitale via La Poste CI...",
                success: (data) => `Quittance expédiée ! Tracking : ${data.tracking || ''}`,
                error: "Erreur technique lors de l'expédition."
            })
        })
    }

    // Calculs KPI
    const encaiss = receipts
        .filter(r => r.status === 'PAID' || r.status === 'paid' || r.status === 'PAYE')
        .reduce((acc, r) => acc + (Number(r.totalAmount) || 0), 0)

    const pending = receipts
        .filter(r => r.status === 'PENDING' || r.status === 'pending' || r.status === 'EN_ATTENTE')
        .reduce((acc, r) => acc + (Number(r.totalAmount) || 0), 0)

    const overdue = receipts
        .filter(r => r.status === 'OVERDUE' || r.status === 'overdue' || r.status === 'IMPAYE')
        .reduce((acc, r) => acc + (Number(r.totalAmount) || 0), 0)
    
    const totalDue = encaiss + pending + overdue
    const recoveryRate = totalDue > 0 ? Math.round((encaiss / totalDue) * 100) : 0

    return (
        <div className="space-y-6">
            
            {/* Top Header & 3 Main Action Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <FileText className="text-slate-700" size={30} /> 
                        Quittances & Recouvrement
                    </h1>
                    <p className="text-[13px] font-medium text-slate-500 mt-1">
                        Registre des avis d'échéance, quittances de loyer libératoires et déclarations fiscales.
                    </p>
                </div>
                
                {/* 3 ACTIONS CLÉS EXIGÉES PAR L'UTILISATEUR */}
                <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
                    
                    {/* Action 1 : Générer Mois M+1 */}
                    <button 
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
                    >
                        <Calculator size={16} className="text-sky-600" /> 
                        <span>Générer Mois M+1</span>
                    </button>
                    
                    {/* Action 2 : Fichier DGI */}
                    <button 
                        onClick={() => setIsDgiModalOpen(true)}
                        className="bg-slate-900 text-white hover:bg-black px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 flex-1 sm:flex-none"
                    >
                        <Download size={16} className="text-emerald-400" /> 
                        <span>Fichier DGI</span>
                    </button>
                    
                    {/* Action 3 : Nouveau Reçu */}
                    <button 
                        onClick={openCreateModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 flex-1 sm:flex-none"
                    >
                        <Plus size={16} /> 
                        <span>Nouveau Reçu</span>
                    </button>

                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard 
                    label="Taux de Recouvrement" 
                    value={`${recoveryRate}%`} 
                    sub="Objectif : 90%" 
                    trend={recoveryRate >= 90 ? "up" : "down"} 
                />
                <StatCard 
                    label="Encaissé (Total)" 
                    value={`${encaiss.toLocaleString()} XOF`} 
                    sub="Paiements validés" 
                />
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Attente (Avis)</p>
                    <div>
                        <p className="text-2xl font-black text-amber-600 mt-2">{pending.toLocaleString()} XOF</p>
                        <p className="text-[11px] text-slate-400 mt-1">À percevoir ce mois-ci</p>
                    </div>
                </div>
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 flex flex-col justify-between">
                    <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Impayés & Retards</p>
                    <div>
                        <p className="text-2xl font-black text-rose-600 mt-2">{overdue.toLocaleString()} XOF</p>
                        <p className="text-[11px] text-rose-500 mt-1">Dossiers sous relance</p>
                    </div>
                </div>
            </div>

            {/* Tableau principal des quittances */}
            <SectionCard title="Historique des Écritures & Quittances" noPadding>
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher par locataire, bien, commune, référence ou période..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400" 
                        />
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                        Total : {filteredReceipts.length} quittance(s) répertoriée(s)
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-4">Réf. Quittance</th>
                                <th className="py-3 px-4">Locataire & Logement</th>
                                <th className="py-3 px-4">Période</th>
                                <th className="py-3 px-4">Montant Total</th>
                                <th className="py-3 px-4">Règlement</th>
                                <th className="py-3 px-4">Statut</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReceipts.map(r => {
                                const tenantName = r.lease?.tenant 
                                    ? `${r.lease.tenant.firstName || ''} ${r.lease.tenant.lastName || ''}`.trim() 
                                    : "Locataire"
                                const propertyName = r.lease?.property?.name || r.lease?.property?.address || "Logement"
                                const commune = r.lease?.property?.commune
                                const isPaid = r.status === 'PAID' || r.status === 'paid' || r.status === 'PAYE'
                                const isPendingStatus = r.status === 'PENDING' || r.status === 'pending' || r.status === 'EN_ATTENTE'
                                const isOverdue = r.status === 'OVERDUE' || r.status === 'overdue' || r.status === 'IMPAYE'

                                return (
                                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                        
                                        {/* Réf Quittance */}
                                        <td className="py-3.5 px-4">
                                            <div className="font-mono text-xs font-bold text-slate-900">
                                                {r.receiptRef || r.id.substring(0, 14)}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString('fr-FR') : ''}
                                            </div>
                                        </td>

                                        {/* Locataire & Logement */}
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                                <User size={13} className="text-slate-400" />
                                                <span>{tenantName}</span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <Building2 size={12} className="text-slate-400" />
                                                <span>{propertyName}</span>
                                                {commune && (
                                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                                                        {commune}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Période */}
                                        <td className="py-3.5 px-4 font-semibold text-xs text-slate-700">
                                            {r.periodMonth}
                                        </td>

                                        {/* Montant Total */}
                                        <td className="py-3.5 px-4">
                                            <span className="font-black text-slate-900 text-xs">
                                                {(Number(r.totalAmount) || 0).toLocaleString()} XOF
                                            </span>
                                            {Number(r.chargesAmount) > 0 && (
                                                <div className="text-[10px] text-slate-400">
                                                    dont {Number(r.chargesAmount).toLocaleString()} XOF charges
                                                </div>
                                            )}
                                        </td>

                                        {/* Moyen de Paiement */}
                                        <td className="py-3.5 px-4">
                                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                                {r.paymentMethod || "WAVE"}
                                            </span>
                                        </td>

                                        {/* Statut */}
                                        <td className="py-3.5 px-4">
                                            {isPaid && <Badge color="green">PAYÉE</Badge>}
                                            {isPendingStatus && <Badge color="amber">EN ATTENTE</Badge>}
                                            {isOverdue && (
                                                <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                                                    <AlertTriangle size={12} /> IMPAYÉE
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                
                                                {/* Expédition Poste CI si payée */}
                                                {isPaid && !r.digitalDeliveryId && (
                                                    <button 
                                                        onClick={() => handleDigitalDelivery(r.id)} 
                                                        disabled={isPending} 
                                                        title="Expédier par La Poste CI"
                                                        className="text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200 px-2.5 py-1 rounded-lg bg-amber-50 disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        <Send size={12}/> Poste
                                                    </button>
                                                )}

                                                {/* Voir / Imprimer PDF officiel */}
                                                <button 
                                                    onClick={() => window.open(`/receipts/${r.id}`, '_blank')}
                                                    title="Afficher et imprimer le reçu certifié"
                                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors bg-white"
                                                >
                                                    <Printer size={14} />
                                                </button>

                                                {/* Modifier */}
                                                <button 
                                                    onClick={() => openEditModal(r)}
                                                    title="Modifier cette quittance"
                                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition-colors bg-white"
                                                >
                                                    <Edit size={14} />
                                                </button>

                                                {/* Supprimer */}
                                                <button 
                                                    onClick={() => handleDeleteReceipt(r.id, r.receiptRef || r.id.slice(0, 8))}
                                                    disabled={isPending}
                                                    title="Supprimer cette quittance"
                                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors bg-white disabled:opacity-50"
                                                >
                                                    <Trash2 size={14} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                )
                            })}
                            
                            {filteredReceipts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-sm font-medium text-slate-400">
                                        Aucune quittance ou avis d'échéance trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* Modal 1 : Générer Mois M+1 */}
            <GenerateNextMonthModal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                activeLeases={activeLeases}
                onSuccess={() => router.refresh()}
            />

            {/* Modal 2 : Fichier DGI */}
            <DgiExportModal
                isOpen={isDgiModalOpen}
                onClose={() => setIsDgiModalOpen(false)}
                activeLeases={activeLeases}
            />

            {/* Modal 3 : Nouveau Reçu / Édition */}
            <ManualReceiptModal 
                isOpen={isManualModalOpen} 
                onClose={() => setIsManualModalOpen(false)} 
                initialReceipt={selectedReceipt}
                activeLeases={activeLeases}
                onSuccess={() => router.refresh()}
            />

        </div>
    )
}
