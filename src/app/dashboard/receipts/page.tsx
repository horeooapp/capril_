import { getProperties } from "@/actions/properties"

export default async function ReceiptsPage() {
    const properties = await getProperties().catch(() => [])

    // Flatten properties -> leases -> receipts
    const receipts = properties.flatMap(prop =>
        prop.leases.flatMap(lease =>
            lease.receipts.map(receipt => ({
                ...receipt,
                propertyName: prop.name || prop.address,
                // @ts-ignore
                tenantName: lease.tenant?.name || lease.tenant?.email
            }))
        )
    ).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Quittances de Loyer</h1>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {receipts.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune quittance</h3>
                        <p className="mt-1 text-sm text-gray-500">Générez des quittances depuis la section "Contrats".</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {receipts.map((receipt) => (
                            <li key={receipt.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-primary truncate">
                                            Quittance {receipt.receiptNumber}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Locataire: {receipt.tenantName} - {receipt.propertyName}
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end space-y-2">
                                        <p className="text-sm font-bold text-gray-900">
                                            {receipt.amountPaid} FCFA
                                        </p>
                                        <div className="flex space-x-2">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${receipt.isSent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {receipt.isSent ? 'Envoyée' : 'Non envoyée'}
                                            </span>
                                            <a href={`/receipts/${receipt.id}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:text-orange-600 font-medium">
                                                Voir & Imprimer
                                            </a>
                                        </div>
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
