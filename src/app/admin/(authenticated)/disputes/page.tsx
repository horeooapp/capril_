import React from 'react'
import { Scale, AlertCircle, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getDisputes } from '@/actions/dispute-actions'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function DisputesAdminPage() {
    const disputes = await getDisputes()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 italic uppercase">
                        <Scale className="text-primary w-8 h-8" />
                        Litiges & Médiations
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">
                        Arbitrage officiel des conflits locatifs <span className="text-primary font-bold">QAPRIL</span>.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {disputes.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-100 mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Tout est calme.</h3>
                        <p className="text-gray-400 max-w-sm">Aucun litige n'est actuellement ouvert dans le registre national.</p>
                    </div>
                ) : (
                    disputes.map((dispute) => (
                        <Link 
                            key={dispute.id} 
                            href={`/admin/disputes/${dispute.id}`}
                            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    dispute.status === 'OPEN' ? 'bg-amber-100 text-amber-600' :
                                    dispute.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' :
                                    'bg-blue-100 text-blue-600'
                                } group-hover:scale-110 transition-transform`}>
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors uppercase tracking-tight">
                                        {dispute.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 flex items-center gap-2">
                                        <span className="font-black text-gray-900">{dispute.lease.leaseReference}</span> 
                                        • {dispute.lease.property.commune}
                                    </p>
                                    <div className="flex items-center gap-3 pt-1">
                                        <span className="text-[10px] font-bold text-gray-500 italic">
                                            Bailleur: {dispute.lease.landlord.fullName}
                                        </span>
                                        <span className="text-[10px] text-gray-300">|</span>
                                        <span className="text-[10px] font-bold text-gray-500 italic">
                                            Locataire: {dispute.lease.tenant?.fullName || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right flex flex-col items-end">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                                        dispute.status === 'OPEN' ? 'bg-amber-100 text-amber-600' :
                                        dispute.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                        {dispute.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-[10px] text-gray-400 mt-2 font-medium">
                                        Ouvert le {format(new Date(dispute.createdAt), 'dd MMMM yyyy', { locale: fr })}
                                    </span>
                                </div>
                                <ArrowRight className="text-gray-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
