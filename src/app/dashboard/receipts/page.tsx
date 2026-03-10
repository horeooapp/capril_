/* eslint-disable @typescript-eslint/no-explicit-any */
import { getMyReceipts } from "@/actions/receipts"
import Link from "next/link"

export default async function ReceiptsPage() {
    const receipts = await getMyReceipts()

    return (
        <div className="space-y-10 py-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Registre des Quittances</h1>
                    <p className="text-gray-500 mt-1">Historique certifié de vos paiements et justificatifs.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {receipts.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <span className="text-5xl">🧾</span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3">Aucune quittance générée</h3>
                        <p className="text-gray-500 max-w-md mx-auto text-lg">
                            Les quittances apparaissent ici dès qu&apos;un paiement est validé sur l&apos;un de vos contrats actifs.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Référence / Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contrat / Bien</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Montant / Période</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {receipts.map((receipt: any) => receipt && (
                                    <tr key={receipt.id} className="hover:bg-gray-50/30 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-[#FF8200] mb-1">{receipt.receiptRef}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    Émise le {new Date(receipt.createdAt).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">{receipt.lease?.leaseRef}</span>
                                                <span className="text-xs text-gray-500">{receipt.lease?.property?.addressLine1}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900">{parseInt(receipt.amountFcfa).toLocaleString()} <small className="text-[10px] font-bold">FCFA</small></span>
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded-full w-fit mt-1">
                                                    {new Date(receipt.periodStart).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link href={`/receipts/${receipt.id}`} target="_blank" className="px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-200">
                                                    Imprimer
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
