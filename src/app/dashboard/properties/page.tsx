import { getProperties } from "@/actions/properties"

export default async function PropertiesPage() {
    const properties = await getProperties().catch(() => [])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Mes Logements</h1>
                <button className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors">
                    + Ajouter un logement
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {properties.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun logement</h3>
                        <p className="mt-1 text-sm text-gray-500">Commencez par ajouter votre première propriété pour générer des quittances.</p>
                        <div className="mt-6">
                            <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-secondary hover:bg-green-700">
                                + Nouveau Logement
                            </button>
                        </div>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {properties.map((property) => (
                            <li key={property.id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-primary truncate">
                                            {property.name || property.address}
                                        </p>
                                        <div className="ml-2 flex-shrink-0 flex">
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {property.leases.length} contrat(s) actif(s)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            <p className="flex items-center text-sm text-gray-500">
                                                {property.address}, {property.postalCode} {property.city}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                            <p>
                                                Créé le {new Date(property.createdAt).toLocaleDateString('fr-FR')}
                                            </p>
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
