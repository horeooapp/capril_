import { getProperties } from "@/actions/properties"

export default async function PropertiesPage() {
    const properties = await getProperties().catch(() => [])

    return (
        <div className="space-y-8 py-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Mes Biens Immobiliers</h1>
                    <p className="text-gray-500 mt-1">Gérez votre parc immobilier et suivez vos quittances.</p>
                </div>
                <a href="/dashboard/properties/new" className="bg-[#FF8200] hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all transform hover:-translate-y-1 text-center inline-block">
                    + Enregistrer un bien
                </a>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {properties.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🏢</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun bien enregistré</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-8">
                            Ajoutez votre premier bien résidentiel ou commercial pour commencer à générer des quittances automatiques.
                        </p>
                        <a href="/dashboard/properties/new" className="inline-flex items-center px-6 py-3 bg-[#FF8200] text-white font-bold rounded-xl shadow-md hover:bg-orange-600 transition-all">
                            Enregistrer mon premier bien
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property: any) => (
                            <div key={property.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${property.propertyCategory === 'RESIDENTIAL' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {property.propertyCategory === 'RESIDENTIAL' ? 'Résidentiel' : 'Commercial'}
                                        </div>
                                        <span className="text-xs font-mono font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                            {property.propertyCode}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#FF8200] transition-colors">
                                        {property.propertyType === 'VILLA' ? '🏡 Villa' : property.propertyType === 'APARTMENT' ? '🏢 Appartement' : '🏠 Bien'} {property.commune}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-1 mb-4">
                                        📍 {property.addressLine1}
                                    </p>

                                    <div className="flex items-end justify-between pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loyer mensuel</p>
                                            <p className="text-xl font-black text-gray-900">
                                                {parseInt(property.declaredRentFcfa).toLocaleString('fr-FR')} <span className="text-xs font-medium">FCFA</span>
                                            </p>
                                        </div>
                                        <a 
                                            href={`/dashboard/properties/${property.id}`}
                                            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-[#FF8200] hover:text-white transition-all"
                                        >
                                            →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
