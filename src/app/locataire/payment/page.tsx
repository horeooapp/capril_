import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getTenantDashboard } from "@/actions/tenant-actions"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import PaymentClient from "./PaymentClient"

export const dynamic = "force-dynamic"

export default async function TenantPaymentPage() {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "TENANT") {
        redirect("/locataire/login")
    }

    const data = await getTenantDashboard()
    
    if (!data.success || !data.hasLease) {
        redirect("/locataire")
    }

    const lease = data.lease as any
    const phone = data.user?.phone || ""
    const arrears = lease.totalArrears

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header V4 */}
            <div className="flex items-center gap-4">
                <Link href="/locataire" className="w-10 h-10 bg-white rounded-xl border border-qgrey-2 flex items-center justify-center hover:bg-qgrey-1 transition-all">
                    <ArrowLeft size={20} className="text-qnavy" />
                </Link>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-qnavy-dark uppercase tracking-tighter">
                        Règlement Sécurisé
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-qtext-light">
                        QAPRIL Pay — Sous la protection réglementée de CinetPay
                    </p>
                </div>
            </div>

            {arrears === 0 ? (
                <div className="bg-qgreen-pale p-12 rounded-[2rem] border border-qgreen/20 text-center shadow-sm">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 size={40} className="text-qgreen" />
                    </div>
                    <h2 className="text-xl font-black text-qgreen-dark uppercase tracking-widest mb-2">Vous êtes à jour</h2>
                    <p className="text-sm font-medium text-qtext-mid max-w-sm mx-auto mb-8">
                        Vous n'avez aucun arriéré détecté sur votre bail. Votre prochain loyer sera facturé à l'échéance convenue.
                    </p>
                    <Link href="/locataire" className="bg-qgreen hover:bg-qgreen-dark text-white font-black px-8 py-4 rounded-xl uppercase text-xs tracking-widest transition-all shadow-md shadow-qgreen/30">
                        Retour à l'accueil
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-qgrey-2 shadow-[0_12px_40px_rgba(13,43,110,0.04)]">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-qgrey-2">
                            <div>
                                <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest mb-1">Montant à régler</p>
                                <p className="text-sm font-bold text-qnavy-dark">
                                    Solde d'arriérés (Loyer + Pénalités)
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-qred tracking-tighter">{arrears.toLocaleString()}</p>
                                <p className="text-[10px] font-black text-qtext-light uppercase tracking-widest">FCFA</p>
                            </div>
                        </div>

                        <PaymentClient 
                            leaseId={lease.id} 
                            amount={arrears} 
                            defaultPhone={phone}
                        />
                    </div>

                    <div className="bg-[linear-gradient(135deg,#0D2B6E_0%,#1F4E79_100%)] p-6 rounded-[1.5rem] flex items-center gap-4 text-white shadow-lg">
                         <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
                             <AlertCircle size={20} />
                         </div>
                         <p className="text-xs font-medium text-white/80 leading-relaxed">
                             Ce paiement génèrera automatiquement une quittance <strong className="text-qorange">SHA-256</strong> dans votre espace et enverra une notification SMS/WhatsApp à votre bailleur.
                         </p>
                    </div>
                </div>
            )}
        </div>
    )
}
