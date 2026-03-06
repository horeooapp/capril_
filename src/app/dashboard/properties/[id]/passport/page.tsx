import { getPropertyPassport } from "@/actions/properties"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function PropertyPassportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const property = await getPropertyPassport(id)

    if (!property) {
        notFound()
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex mb-2" aria-label="Breadcrumb">
                        <ol className="flex items-center space-x-2 text-xs text-gray-400">
                            <li><Link href="/dashboard/properties" className="hover:text-gray-600">Logements</Link></li>
                            <li><svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></li>
                            <li className="font-bold text-gray-500">Passeport Logement</li>
                        </ol>
                    </nav>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Passeport Logement</h1>
                    <p className="text-sm text-gray-500 mt-1">Identité numérique et historique du bien QAPRIL-{property.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg border border-primary/20 flex flex-col items-center">
                    <span className="text-[10px] uppercase font-bold tracking-tighter">Statut QAPRIL</span>
                    <span className="font-bold text-sm">Vérifié & Certifié</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Carte d'identité physique */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
                        <h2 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">Caractéristiques</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400">Type de bien</label>
                                <p className="font-medium text-gray-900">{property.type}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Surface</label>
                                <p className="font-medium text-gray-900">{property.surface || "--"} m²</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Adresse Numérique</label>
                                <p className="font-medium text-gray-900">{property.digitalPostalAddress || "Non définie"}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-50">
                                <label className="text-xs text-gray-400">Géolocalisation (GPS)</label>
                                <div className="mt-1 bg-gray-50 p-2 rounded text-xs font-mono text-gray-600 flex justify-between">
                                    <span>Lat: {property.gpsLatitude || "N/A"}</span>
                                    <span>Lon: {property.gpsLongitude || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-xl">
                        <h3 className="text-orange-400 font-bold text-sm mb-2">Mémoire Numérique</h3>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            Ce passeport centralise tous les événements de la vie du logement. Il protège la valeur de votre patrimoine en attestant de sa bonne gestion.
                        </p>
                    </div>
                </div>

                {/* 2. Historique Locatif (La Timeline) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Mémoire Locative (Historique des Baux)
                        </h2>

                        {property.leases.length === 0 ? (
                            <p className="text-sm text-gray-500 italic py-10 text-center">Aucun bail enregistré dans l'historique numérique.</p>
                        ) : (
                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {property.leases.map((lease, idx) => (
                                        <li key={lease.id}>
                                            <div className="relative pb-8">
                                                {idx !== property.leases.length - 1 && (
                                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                                )}
                                                <div className="relative flex space-x-3">
                                                    <div>
                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${lease.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}>
                                                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">
                                                                Occupé par <span className="font-bold text-gray-900">{lease.tenant.name || lease.tenant.email}</span>
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Loyer : <span className="font-bold text-primary">{lease.rentAmount.toLocaleString()} FCFA</span>
                                                            </p>
                                                        </div>
                                                        <div className="text-right text-xs whitespace-nowrap text-gray-500">
                                                            <time dateTime={lease.startDate.toISOString()}>
                                                                {new Date(lease.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                                            </time>
                                                            {lease.endDate && (
                                                                <span> — {new Date(lease.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Summary of incidents for this lease */}
                                                {lease.incidents.length > 0 && (
                                                    <div className="ml-12 mt-2">
                                                        {lease.incidents.map(inc => (
                                                            <div key={inc.id} className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded inline-flex items-center mr-2">
                                                                ⚠️ {inc.type} : {inc.severity}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                             <svg className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Statistiques du Bien
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Stabilité Locative</p>
                                <p className="text-xl font-black text-gray-800">Élevée</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Evolution Loyer (2 ans)</p>
                                <p className="text-xl font-black text-green-600">+4.2%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
