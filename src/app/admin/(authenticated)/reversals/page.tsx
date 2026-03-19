import { getRecentPayments } from "@/actions/reversal-admin";
import { retryReversal } from "@/actions/reversal";
import { CheckCircle2, AlertCircle, RefreshCcw, ArrowRightLeft } from "lucide-react";

export default async function ReversalsAdminPage() {
    let payments = [];
    try {
        payments = await getRecentPayments();
    } catch (e) {
        console.error("Critical error in ReversalsPage fetch:", e);
    }

    return (
        <div className="p-8 space-y-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Console de Reversement</h1>
                    <p className="text-gray-500 font-medium">Suivi en temps réel de la ventilation des fonds (M-PAY-AUTO)</p>
                </div>
                <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-700 uppercase">Live Hub</span>
                </div>
            </header>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Référence / Bail</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Montant Total</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Honoraires Agence</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Statut Reversement</th>
                            <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {payments.map((payment: any) => (
                            <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="p-5">
                                    <div className="font-bold text-gray-900">{payment.refInterne}</div>
                                    <div className="text-[10px] text-gray-500 font-mono">{payment.lease?.landlord?.fullName}</div>
                                </td>
                                <td className="p-5">
                                    <span className="text-lg font-black text-slate-900">
                                        {Number(payment.montant || 0).toLocaleString()} FCFA
                                    </span>
                                </td>
                                <td className="p-5 text-indigo-600 font-bold">
                                    {payment.honorairesAgence ? `${Number(payment.honorairesAgence).toLocaleString()} FCFA` : "---"}
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        {payment.reversalStatus === "REVERSED" ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                <CheckCircle2 size={12} /> Reversé
                                            </span>
                                        ) : payment.reversalStatus === "FAILED" ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                <AlertCircle size={12} /> Échec
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                En attente
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-5">
                                    {payment.reversalStatus !== "REVERSED" && (
                                        <button 
                                            className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-indigo-200 text-gray-400 hover:text-indigo-600 transition-all"
                                            title="Réessayer le reversement"
                                            // Normalement via un onClick côté client, ici on simplifie
                                        >
                                            <RefreshCcw size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payments.length === 0 && (
                    <div className="p-20 text-center">
                        <ArrowRightLeft className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-medium">Aucun flux financier détecté pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
