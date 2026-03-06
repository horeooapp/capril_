import { getUserTrustData } from "@/actions/users"
import { notFound } from "next/navigation"

export default async function TrustProfilePage() {
    const data = await getUserTrustData()

    if (!data) {
        notFound()
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
                                <li key={event.id} className="contents">
                                    <tr className="hover:bg-gray-50/50 transition-colors">
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
                                </li>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Explications et Conseils */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                    <h3 className="font-bold text-orange-800 mb-2 flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45 0c-.345.337-.614.732-.823 1.13a4.014 4.014 0 00-.39 1.113 9.11 9.11 0 01-1.228 3.32 8.57 8.57 0 01-1.414 1.53c-.377.317-.808.516-1.263.614a2.29 2.29 0 00-.783.203 2.291 2.291 0 00-.73 1.074 2.29 2.29 0 00-.038.862 2.29 2.29 0 00.131.549c.124.33.298.647.508.927.23.308.515.58.835.808a8.21 8.21 0 011.02.83 8.16 8.16 0 01.383.42 1 1 0 001.455.131l.462-.347a1 1 0 00.153-1.332 6.16 6.16 0 00-.63-1.12 6.19 6.19 0 00-.47-.504 5.918 5.918 0 00-.181-.194 4.29 4.29 0 01-.114-.12 2.29 2.29 0 01-.19-.245 2.29 2.29 0 01-.123-.324 2.29 2.29 0 01-.021-.253c0-.033.001-.064.004-.094a.5.5 0 01.056-.224 2.1 2.1 0 01.492-.61 4.15 4.15 0 011.01-.658 9.13 9.13 0 012.36-.752c.901-.145 1.741-.573 2.474-1.23a10.57 10.57 0 001.769-2.052 4.014 4.014 0 01.402-1.122c.209-.396.477-.79.822-1.127a1 1 0 011.457 0c.345.337.614.732.823 1.13a4.014 4.014 0 00.39 1.113 9.11 9.11 0 011.228 3.32 8.57 8.57 0 011.414 1.53c.377.317.808.516 1.263.614a2.29 2.29 0 00.783.203 2.291 2.291 0 00.73 1.074 2.29 2.29 0 00.038.862 2.29 2.29 0 00-.131.549c-.124.33-.298.647-.508.927-.23.308-.515.58-.835.808a8.21 8.21 0 01-1.02.83 8.16 8.16 0 01-.383.42 1 1 0 00-1.455.131l-.462.347a1 1 0 00-.153 1.332 6.16 6.16 0 00.63 1.12 6.19 6.19 0 00.47.504 5.918 5.918 0 00.181.194 4.29 4.29 0 01.114.12 2.29 2.29 0 01.19.245 2.29 2.29 0 01.123.324 2.29 2.29 0 01.021.253c0 .033-.001.064-.004.094a.5.5 0 01-.056.224 2.1 2.1 0 01-.492.61 4.15 4.15 0 01-1.01.658 9.13 9.13 0 01-2.36.752c-.901.145-1.741.573-2.474 1.23a10.57 10.57 0 00-1.769 2.052 4.014 4.014 0 01-.402 1.122c-.209.396-.477.79-.822 1.127a1 1 0 00-1.457 0z" /></svg>
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
}
