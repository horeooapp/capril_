import { Suspense } from "react"
import PrepaymentRequestForm from "@/components/dashboard/payments/PrepaymentRequestForm"
import { getPrepaymentRequests } from "@/actions/prepayment-actions"
import { motion } from "framer-motion"
import { ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react"

export const dynamic = "force-dynamic"

async function PrepaymentHistory() {
    const requests = await getPrepaymentRequests()

    if (requests.length === 0) return null

    return (
        <div className="mt-20 space-y-8">
            <div className="flex items-center gap-4 ml-4">
                <ClipboardList className="text-gray-400" size={20} />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Historique des Demandes</h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {requests.map((req: any) => (
                    <div key={req.id} className="glass-panel p-8 rounded-[2.5rem] border border-white/40 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:translate-x-1 transition-transform">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                req.status === 'APPROVED' ? 'bg-green-50 text-green-500' :
                                req.status === 'REJECTED' ? 'bg-red-50 text-red-500' :
                                'bg-orange-50 text-orange-500'
                            }`}>
                                {req.status === 'APPROVED' ? <CheckCircle2 size={24} /> :
                                 req.status === 'REJECTED' ? <XCircle size={24} /> :
                                 <Clock size={24} />}
                            </div>
                            <div>
                                <div className="font-black text-gray-900 uppercase tracking-tight truncate max-w-[200px]">
                                    {req.lease?.property?.name || "Contrat Immobilière"}
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                    {req.monthsCount} mois • {req.totalAmount.toLocaleString()} FCFA
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date de demande</div>
                                <div className="text-xs font-bold text-gray-900">{new Date(req.createdAt).toLocaleDateString('fr-FR')}</div>
                            </div>
                            <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                req.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' :
                                req.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                                'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                                {req.status === 'APPROVED' ? 'Approuvé' :
                                 req.status === 'REJECTED' ? 'Refusé' :
                                 'En attente'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function TenantPaymentsPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex flex-col gap-2 mb-10">
                <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight tracking-tighter uppercase">
                    Gestion des <br />
                    <span className="text-primary italic drop-shadow-sm">Paiements</span>.
                </h1>
                <p className="text-xl text-gray-400 font-medium">Configurez vos paiements anticipés et suivez vos approbations en temps réel.</p>
            </div>

            <PrepaymentRequestForm />

            <Suspense fallback={<div className="p-12 text-center text-gray-400 animate-pulse font-black uppercase tracking-widest">Chargement de l&apos;historique...</div>}>
                <PrepaymentHistory />
            </Suspense>
        </div>
    )
}
