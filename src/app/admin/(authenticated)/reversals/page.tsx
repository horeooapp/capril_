import { getRecentPayments } from "@/actions/reversal-admin";
import { CheckCircle2, AlertCircle, RefreshCcw, ArrowRightLeft } from "lucide-react";
import ReversalRetryButton from "@/components/admin/reversals/ReversalRetryButton";

export default async function ReversalsAdminPage() {
    let payments = [];
    try {
        payments = await getRecentPayments();
    } catch (e) {
        console.error("Critical error in ReversalsPage fetch:", e);
    }

    return (
        <div className="space-y-8 pb-16 relative">
            <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>

            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <ArrowRightLeft className="w-8 h-8 text-[var(--ci-vert)]" />
                        CONSOLE DE REVERSEMENT
                    </h1>
                    <p className="page-sub">Suivi en temps réel de la ventilation des fonds (M-PAY-AUTO).</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="date-badge flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--ci-vert-light)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--ci-vert)]"></span>
                        </span>
                        Live Hub Connecté
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="panel-header">
                    <h2 className="panel-title">Flux Financiers Récents</h2>
                    <div className="panel-action">Actualiser</div>
                </div>
                <div className="overflow-x-auto">
                    <table className="lease-table">
                        <thead>
                            <tr>
                                <th>Référence / Bail</th>
                                <th>Montant Total</th>
                                <th>Honoraires Agence</th>
                                <th>Statut Reversement</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment: any) => (
                                <tr key={payment.id}>
                                    <td>
                                        <div className="tenant-cell">
                                            <div className="t-avatar t-av1">RF</div>
                                            <div>
                                                <div className="t-name">{payment.refInterne}</div>
                                                <div className="t-loc text-gray-500 font-mono text-[10px]">
                                                    {((payment.lease?.landlord?.firstName || '') + " " + (payment.lease?.landlord?.lastName || '')).trim() || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-[14px] font-black text-white">
                                            {Number(payment.montant || 0).toLocaleString()} <span className="text-[10px] text-gray-500">FCFA</span>
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-[12px] font-bold text-[var(--ci-orange)]">
                                            {payment.honorairesAgence ? `${Number(payment.honorairesAgence).toLocaleString()} FCFA` : "---"}
                                        </span>
                                    </td>
                                    <td>
                                        {payment.reversalStatus === "REVERSED" ? (
                                            <div className="pill pill-active">
                                                <div className="pill-dot text-[var(--ci-vert)]"></div>
                                                Reversé
                                            </div>
                                        ) : payment.reversalStatus === "FAILED" ? (
                                            <div className="pill pill-impaye">
                                                <div className="pill-dot text-red-500"></div>
                                                Échec
                                            </div>
                                        ) : (
                                            <div className="pill pill-pending">
                                                <div className="pill-dot text-[var(--ci-or)]"></div>
                                                En attente
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {payment.reversalStatus !== "REVERSED" && (
                                            <div className="inline-block p-1 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
                                                <ReversalRetryButton paymentId={payment.id} />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {payments.length === 0 && (
                        <div className="py-16 flex flex-col items-center justify-center opacity-50">
                            <ArrowRightLeft className="w-12 h-12 text-gray-500 mb-4" />
                            <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest">Aucun flux financier détecté</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
