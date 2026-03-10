import { getLandlordMandates } from "@/actions/mandates"
import MandateActions from "@/components/dashboard/MandateActions"

export default async function LandlordMandatesPage() {
    const mandates = await getLandlordMandates()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Gestion des Mandats</h1>
                <p className="text-gray-500">Validez ou rejetez les demandes de gestion envoyées par les agences immobilières.</p>
            </div>

            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">Mandats Reçus</h2>
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded font-bold uppercase tracking-widest border border-orange-200">Preuve Numérique</span>
                </div>

                {mandates.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <span className="text-2xl text-gray-300">📋</span>
                        </div>
                        <p className="text-gray-400 italic">Aucun mandat reçu pour le moment.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase text-gray-400 font-bold tracking-widest border-b border-gray-50">
                                    <th className="px-6 py-4">Bien Immobilier</th>
                                    <th className="px-6 py-4">Agence / Agent</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Période</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {mandates.map((mandate) => (
                                    <tr key={mandate.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">{mandate.property.name || mandate.property.address}</p>
                                            <p className="text-[10px] text-gray-500">{mandate.property.city}, {mandate.property.commune}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-800">{mandate.agent.fullName}</p>
                                            <p className="text-[10px] text-gray-500">{mandate.agent.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] px-2 py-1 rounded font-bold border ${
                                                mandate.mandateType === 'management_extended' 
                                                    ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                {mandate.mandateType === 'management_extended' ? 'Exclusif' : 'Simple'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-600">Du {new Date(mandate.startDate).toLocaleDateString('fr-FR')}</p>
                                            {mandate.endDate && <p className="text-xs text-gray-400 font-medium">Au {new Date(mandate.endDate).toLocaleDateString('fr-FR')}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <MandateActions mandateId={mandate.id} currentStatus={mandate.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl shadow-sm">
                <div className="flex space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 text-white text-2xl">
                        💡
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900">Règle de gestion QAPRIL</h3>
                        <p className="text-sm text-blue-800 leading-relaxed mt-1">
                            La validation d'un mandat délègue officiellement la gestion de votre bien à l'agent sélectionné. 
                            QAPRIL s'assure que l'agent est certifié et dispose des garanties nécessaires avant de lui permettre de vous soumettre un mandat.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
