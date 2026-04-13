import React from 'react'
import { Scale, AlertCircle, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getDisputes } from '@/actions/dispute-actions'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function DisputesAdminPage() {
    const disputes = await getDisputes()

    return (
        <div className="space-y-8 pb-16 relative">
            <div className="fixed inset-0 bg-mesh -z-10 opacity-60"></div>

            <div className="page-header">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Scale className="w-8 h-8 text-[var(--ci-or)]" />
                        LITIGES & MÉDIATIONS
                    </h1>
                    <p className="page-sub">
                        Arbitrage officiel des conflits locatifs dans l'infrastructure QAPRIL.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="date-badge text-[var(--ci-or)] border-[var(--ci-or)]/30 bg-[var(--ci-or)]/10">
                        {disputes.length} En Cours
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="panel-header">
                    <h2 className="panel-title">Registre National des Procédures</h2>
                    <div className="panel-action">Filtrer par Gravité</div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    {disputes.length === 0 ? (
                        <div className="py-16 text-center opacity-50 border border-dashed border-white/10 rounded-[2rem]">
                            <CheckCircle2 className="w-16 h-16 text-[var(--ci-vert-light)] mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-white mb-2">Tout est calme.</h3>
                            <p className="text-gray-400 text-sm">Aucun litige n'est actuellement ouvert dans le registre national.</p>
                        </div>
                    ) : (
                        disputes.map((dispute) => (
                            <Link 
                                key={dispute.id} 
                                href={`/admin/disputes/${dispute.id}`}
                                className="bg-[var(--ci-nuit3)] border border-white/5 rounded-2xl p-6 hover:shadow-xl hover:border-[var(--ci-or)]/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        dispute.status === 'OPEN' ? 'bg-[var(--ci-or)]/10 text-[var(--ci-or)]' :
                                        dispute.status === 'RESOLVED' ? 'bg-[var(--ci-vert)]/10 text-[var(--ci-vert)]' :
                                        'bg-[var(--ci-orange)]/10 text-[var(--ci-orange)]'
                                    } group-hover:scale-110 transition-transform border border-white/5`}>
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-white group-hover:text-[var(--ci-or)] transition-colors uppercase tracking-tight">
                                            {dispute.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 font-medium">
                                            <span className="font-mono text-gray-300">{dispute.lease.leaseReference}</span> 
                                            &nbsp;•&nbsp; {dispute.lease.property.commune}
                                        </p>
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-[10px] font-bold text-gray-400 italic">
                                                Bailleur: {(dispute.lease.landlord.firstName ? dispute.lease.landlord.firstName + " " : "") + (dispute.lease.landlord.lastName || "")}
                                            </span>
                                            <span className="text-[10px] text-gray-600">|</span>
                                            <span className="text-[10px] font-bold text-gray-400 italic">
                                                Locataire: {(dispute.lease.tenant?.firstName ? dispute.lease.tenant.firstName + " " : "") + (dispute.lease.tenant?.lastName || "") || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right flex flex-col items-end">
                                        <span className={`pill ${
                                            dispute.status === 'OPEN' ? 'pill-pending' :
                                            dispute.status === 'RESOLVED' ? 'pill-active' :
                                            'bg-[var(--ci-orange)]/10 text-[var(--ci-orange)]'
                                        }`}>
                                            <div className="pill-dot"></div>
                                            {dispute.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] text-gray-500 mt-2 font-mono uppercase">
                                            Ouvert le {format(new Date(dispute.createdAt), 'dd MMM yyyy', { locale: fr })}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--ci-or)]/20 transition-all">
                                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[var(--ci-or)] group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
