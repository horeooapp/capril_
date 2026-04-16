import { getFinancialReportData } from "@/actions/export-actions";
import { notFound } from "next/navigation";

export default async function FinancialReportPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    let data;
    try {
        data = await getFinancialReportData(userId);
    } catch (e) {
        notFound();
    }

    const { user, balance, transactions, stats, year, generatedAt } = data;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-10 print:p-0 print:bg-white flex justify-center">
            {/* Report Container */}
            <div className="bg-white w-full max-w-[900px] min-h-[1100px] shadow-xl p-12 print:shadow-none print:max-w-none">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-8 mb-12">
                    <div>
                        <div className="text-3xl font-black text-slate-900 mb-1">QAPRIL BUSINESS</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Financial Reports & Treasury</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black text-slate-900">BILAN FINANCIER {year}</div>
                        <div className="text-xs text-slate-500 font-bold uppercase">PROPRIÉTAIRE : {user.firstName} {user.lastName}</div>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="grid grid-cols-3 gap-6 mb-16">
                    <div className="bg-slate-900 p-6 rounded-2xl text-white">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Revenus Fonciers</div>
                        <div className="text-2xl font-black">{stats.yearlyIncome.toLocaleString()} <span className="text-xs">F</span></div>
                        <div className="text-[10px] text-emerald-400 font-bold mt-2">Cumul Annuel</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-2 border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Charger & Frais</div>
                        <div className="text-2xl font-black text-slate-900">{stats.yearlyExpenses.toLocaleString()} <span className="text-xs">F</span></div>
                        <div className="text-[10px] text-red-500 font-bold mt-2">Prélevés via Wallet</div>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-100">
                        <div className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest mb-2">Bénéfice Net</div>
                        <div className="text-2xl font-black text-emerald-900">{stats.net.toLocaleString()} <span className="text-xs">F</span></div>
                        <div className="text-[10px] text-emerald-600 font-bold mt-2">Performance {year}</div>
                    </div>
                </div>

                {/* Detailed Transactions */}
                <div className="mb-16">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-6 border-b border-slate-100 pb-4">Historique Détaillé des Flux</h3>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                <th className="py-4">Date</th>
                                <th className="py-4">Type / Désignation</th>
                                <th className="py-4 text-right">Crédit (+)</th>
                                <th className="py-4 text-right">Débit (-)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.map(tx => (
                                <tr key={tx.id} className="text-sm">
                                    <td className="py-4 text-slate-500 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                    <td className="py-4 font-bold text-slate-900">{tx.type}</td>
                                    <td className="py-4 text-right font-black text-emerald-600">{tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : '-'}</td>
                                    <td className="py-4 text-right font-black text-slate-900">{tx.amount < 0 ? tx.amount.toLocaleString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Info */}
                <div className="mt-auto border-t border-slate-100 pt-8 flex justify-between items-center text-[10px] font-bold text-slate-400 italic">
                    <div>Généré par le système QAPRIL • {new Date(generatedAt).toLocaleString()}</div>
                    <div>Page 1 sur 1</div>
                </div>

                {/* Print Hint */}
                <div className="mt-10 text-center print:hidden">
                    <button 
                        onClick={() => window.print()}
                        className="bg-slate-900 text-white px-10 py-4 rounded-full font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-3 mx-auto"
                    >
                        <span>📊</span> EXPORTER LE BILAN ANNUEL
                    </button>
                    <p className="text-[10px] text-slate-400 mt-6 uppercase font-bold tracking-[0.2em]">QAPRIL FINANCIAL ENGINE v4.0</p>
                </div>

            </div>
        </div>
    );
}
