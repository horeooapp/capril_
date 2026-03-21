import { getTenantLeases } from "@/actions/leases"
import Link from "next/link"

export default async function TenantLeasesPage() {
    const leases = await getTenantLeases()

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Mes Contrats de Bail</h1>
                    <p className="text-gray-500 font-medium">Consultez et gérez vos engagements locatifs en toute transparence.</p>
                </div>
                <div className="bg-white/80 backdrop-blur shadow-sm border border-gray-100 px-6 py-3 rounded-2xl flex items-center space-x-3">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-gray-700">{leases.length} Contrat(s) Actif(s)</span>
                </div>
            </div>

            {leases.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-xl border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center space-y-4">
                    <div className="text-6xl text-gray-200">🏠</div>
                    <h2 className="text-2xl font-bold text-gray-400 uppercase">Aucun bail trouvé</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                        Vous n&apos;avez pas encore de contrats de bail enregistrés sur QAPRIL. 
                        Contactez votre propriétaire pour la régularisation de votre situation.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {leases.map((lease: any) => {  
                        if (!lease) return null;
                        return (
                            <div key={lease.id} className="group relative bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                                {/* Accent Bar */}
                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-ivoire-orange via-ivoire-white to-ivoire-green"></div>
                                
                                <div className="p-8 space-y-6">
                                    {/* Header: Property Type & Status */}
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-gray-900 uppercase">{lease.property?.propertyType || "LOGEMENT"}</h3>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <svg className="h-4 w-4 mr-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {lease.property?.commune}, {lease.property?.address}
                                            </p>
                                        </div>
                                        <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                                            {lease.status}
                                        </span>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Loyer Mensuel</p>
                                            <p className="text-2xl font-black text-gray-900">{Number(lease.rentAmount).toLocaleString()} <span className="text-xs">FCFA</span></p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Caution Gérée</p>
                                            <p className="text-2xl font-black text-primary">{(Number(lease.depositAmount) || 0).toLocaleString()} <span className="text-xs">FCFA</span></p>
                                        </div>
                                    </div>

                                    {/* Lease Details */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Date de début</span>
                                            <span className="font-bold text-gray-900">{new Date(lease.startDate).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Jour de paiement</span>
                                            <span className="font-bold text-gray-900">Le {lease.paymentDay || 5} du mois</span>
                                        </div>
                                        {lease.leaseReference && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">N° de bail officiel</span>
                                                <span className="font-mono font-bold text-gray-900">{lease.leaseReference}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recent Receipts */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">Dernières Quittances</h4>
                                        {!lease.receipts || lease.receipts.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic">Aucune quittance générée pour le moment.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {lease.receipts.map((receipt: { id: string, periodMonth: string, paidAt: string | Date }) => (
                                                    <div key={receipt.id} className="flex items-center justify-between p-3 bg-white border border-gray-50 rounded-xl hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg text-xs font-bold">📜</div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-800">Loyer {receipt.periodMonth}</p>
                                                                <p className="text-[10px] text-gray-400">Payé le {new Date(receipt.paidAt).toLocaleDateString('fr-FR')}</p>
                                                            </div>
                                                        </div>
                                                        <Link href={`/locataire/receipts/${receipt.id}`} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                                                            Voir
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 flex gap-3">
                                        <button className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-gray-200 uppercase tracking-wider">
                                            Télécharger le bail
                                        </button>
                                        <Link href={`/locataire/trust`} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm text-center hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 uppercase tracking-wider">
                                            Voir mon score
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Educational Banner */}
            <div className="bg-gradient-to-br from-ivoire-orange/10 to-ivoire-green/10 border border-white/50 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="h-40 w-40 flex-shrink-0 bg-white rounded-full shadow-2xl flex items-center justify-center text-6xl">
                    📜
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-gray-900 uppercase">La Transparence QAPRIL</h2>
                    <p className="text-gray-600 leading-relaxed max-w-2xl">
                        Tous vos contrats sur QAPRIL sont enregistrés de manière sécurisée. La gestion de votre caution via notre système de **Séquestre Numérique** vous garantit une restitution juste en fin de contrat, indexée sur votre comportement locatif.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <span className="bg-white px-4 py-2 rounded-full text-[10px] font-bold text-gray-500 border border-gray-100 uppercase tracking-widest cursor-default">Séquestre Sécurisé</span>
                        <span className="bg-white px-4 py-2 rounded-full text-[10px] font-bold text-gray-500 border border-gray-100 uppercase tracking-widest cursor-default">Audit Permanent</span>
                        <span className="bg-white px-4 py-2 rounded-full text-[10px] font-bold text-gray-500 border border-gray-100 uppercase tracking-widest cursor-default">Valeur Juridique</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
