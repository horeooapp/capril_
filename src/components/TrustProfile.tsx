import { auth } from "@/auth"
import { getUserTrustData } from "@/actions/users"
import { notFound } from "next/navigation"

export default async function TrustProfile() {
    try {
        const session = await auth()
        const data = await getUserTrustData()

        if (!data) {
            return (
                <div className="max-w-4xl mx-auto py-20 px-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Profil de confiance non trouvé</h1>
                    <p className="mt-4 text-gray-500">
                        Nous n'avons pas pu charger vos données de confiance. 
                        Si le problème persiste, veuillez contacter le support.
                    </p>
                    <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-400">
                        Debug info: ID {session?.user?.id || "Non connecté"}
                    </div>
                </div>
            )
        }

        const score = data.reliabilityScore
        
        // Logic for score level
        let level = "Satisfaisante"
        let color = "text-blue-600"
        let bgColor = "bg-blue-50"
        let borderColor = "border-blue-200"

        if (score >= 850) {
            level = "Confiance Élevée"
            color = "text-green-600"
            bgColor = "bg-green-50"
            borderColor = "border-green-200"
        } else if (score < 400) {
            level = "Confiance Très Faible"
            color = "text-red-700"
            bgColor = "bg-red-50"
            borderColor = "border-red-200"
        } else if (score < 550) {
            level = "Confiance Fragile"
            color = "text-orange-600"
            bgColor = "bg-orange-50"
            borderColor = "border-orange-200"
        } else if (score < 700) {
            level = "Confiance Modérée"
            color = "text-yellow-600"
            bgColor = "bg-yellow-50"
            borderColor = "border-yellow-200"
        }

        return (
            <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Mon Indice de Confiance Locatif</h1>
                    <p className="text-gray-500">Votre réputation numérique sur le marché locatif ivoirien.</p>
                </div>

                {/* Score Jauge / Badge */}
                <div className={`rounded-3xl p-8 border-2 ${bgColor} ${borderColor} shadow-inner flex flex-col items-center space-y-4`}>
                    <div className="relative h-48 w-48 flex items-center justify-center">
                        {/* Simplified Circular Progress Look */}
                        <div className="absolute inset-0 rounded-full border-[12px] border-gray-100"></div>
                        <div className={`absolute inset-0 rounded-full border-[12px] ${borderColor} border-t-transparent border-r-transparent transform -rotate-45`}></div>
                        <div className="text-center z-10">
                            <span className="text-5xl font-black text-gray-900">{score}</span>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Points ICL</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className={`text-2xl font-black uppercase ${color}`}>{level}</span>
                        <p className="text-sm text-gray-500 mt-1 max-w-sm">
                            Le score ICL évolue en fonction de votre comportement (paiements, entretien, litiges).
                        </p>
                    </div>
                </div>

                {/* Historique des événements */}
                <div className="bg-white shadow rounded-2xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                        <h2 className="font-bold text-gray-800">Historique de Confiance (Audit Log)</h2>
                    </div>
                    {data.trustEvents.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 italic">
                            Aucun événement enregistré. Votre score initial est de 750.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] uppercase text-gray-400 font-bold tracking-widest border-b border-gray-50">
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Événement</th>
                                    <th className="px-6 py-3 text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.trustEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(event.createdAt).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                            {event.reason}
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-bold text-right ${event.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {event.points > 0 ? `+${event.points}` : event.points}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Explications et Conseils */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                        <h3 className="font-bold text-orange-800 mb-2 flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                            Comment améliorer votre score ?
                        </h3>
                        <ul className="text-xs text-orange-700 space-y-2 list-disc list-inside">
                            <li>Payez votre loyer avant la date d'échéance (+5 pts)</li>
                            <li>Soyez ponctuel à chaque mois (+2 pts)</li>
                            <li>Évitez les litiges de caution lors du départ (+20 pts)</li>
                            <li>Restez longtemps dans le même logement</li>
                        </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                        <h3 className="font-bold text-blue-800 mb-2 flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" /></svg>
                            À quoi sert ce score ?
                        </h3>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Un score élevé vous permet de bénéficier de frais d'agence réduits, de cautions allégées et d'un accès prioritaire aux meilleurs logements. Il peut également débloquer des offres d'assurance loyers à tarifs préférentiels.
                        </p>
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error("[TRUST PROFILE ERROR]", error)
        return (
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
                    <h1 className="text-xl font-bold text-red-800">Erreur lors du chargement de l'Indice de Confiance</h1>
                    <p className="mt-2 text-red-700">{error.message}</p>
                    <div className="mt-4 p-4 bg-white rounded border text-xs overflow-auto max-h-60">
                        <pre>{error.stack}</pre>
                    </div>
                </div>
            </div>
        )
    }
}
