import { getReceiptsForTenant } from "@/actions/receipts"
import Link from "next/link"

export default async function LocataireDashboard() {
    const receipts = await getReceiptsForTenant().catch(() => [])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Mes Quittances de Loyer</h1>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md mt-6 shadow-sm border border-gray-100">
                {receipts.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="mx-auto h-16 w-16 text-gray-300 fill-current mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2ZM13 3.5L18.5 9H14C13.4477 9 13 8.55228 13 8V3.5ZM18 20H6V4H11V8C11 9.65685 12.3431 11 14 11H18V20ZM8 14H16V16H8V14ZM8 18H13V20H8V18Z"></path></svg>
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune quittance disponible</h3>
                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            Il semble que votre propriétaire n'ait pas encore généré de quittance électronique pour vous sur la plateforme QAPRIL.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {receipts.map((receipt) => (
                            <li key={receipt.id} className="p-6 transition-colors hover:bg-orange-50/30">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">

                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h4 className="text-base font-semibold text-gray-900">
                                                Période : {new Date(receipt.periodStart).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                            </h4>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Payé
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500 flex flex-col sm:flex-row sm:space-x-6">
                                            <span className="flex items-center">
                                                <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                {receipt.lease.property.name || receipt.lease.property.address}
                                            </span>
                                            <span className="flex items-center mt-2 sm:mt-0">
                                                <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Bailleur : {receipt.lease.property.owner.name || receipt.lease.property.owner.email}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 sm:mt-0 flex flex-col items-end space-y-3 w-full sm:w-auto">
                                        <span className="text-lg font-bold text-primary">
                                            {receipt.amountPaid.toLocaleString('fr-FR')} FCFA
                                        </span>
                                        <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                                            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Télécharger PDF
                                        </button>
                                        <p className="text-xs text-gray-400">
                                            Réf: {receipt.receiptNumber}
                                        </p>
                                    </div>

                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
