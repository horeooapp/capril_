import { getProperties } from "@/actions/properties"
import Link from "next/link"
import { ReliabilityBadge } from "@/components/ReliabilityBadge"

export default async function LeasesPage() {
    // We fetch properties and extract leases to show them
    const properties = await getProperties().catch(() => [])

    // Flatten leases
    const leases = properties.flatMap(prop =>
        prop.leases.map(lease => ({
            ...lease,
            propertyName: prop.name || prop.address
        }))
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Contrats Locatifs</h1>
                <button className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors">
                    + Nouveau Contrat
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {leases.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun contrat</h3>
                        <p className="mt-1 text-sm text-gray-500">Ajoutez un locataire à l'un de vos logements pour créer un bail.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {leases.map((lease) => (
                            <li key={lease.id} className="hover:bg-gray-50 transition-colors">
                                <Link href={`/dashboard/leases/${lease.id}`} className="block px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-primary truncate">
                                            {/* @ts-ignore */}
                                            {lease.tenant?.name || lease.tenant?.email || "Locataire inconnu"}
                                        </p>
                                        <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                                            {/* @ts-ignore */}
                                            {lease.tenant && <ReliabilityBadge score={lease.tenant.reliabilityScore} showLabel={false} />}
                                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lease.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {lease.status === 'ACTIVE' ? 'Actif' : 'Terminé'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {lease.propertyName}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 space-x-4">
                                            <p>Loyer: {lease.rentAmount} FCFA</p>
                                            <p>
                                                Début: {new Date(lease.startDate).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
