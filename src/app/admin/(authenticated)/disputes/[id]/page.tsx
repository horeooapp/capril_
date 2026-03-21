import React from 'react'
import { 
    ChevronLeft, 
    Scale, 
    Home, 
    User, 
    Clock, 
    AlertCircle, 
    Info, 
    ArrowRight, 
    FileText 
} from 'lucide-react'
import Link from 'next/link'
import { getDisputeTimeline, getDisputeDetails } from '@/actions/dispute-actions'
import { MediationTimeline } from '@/components/admin/MediationTimeline'
import { MediationControls } from '@/components/admin/MediationControls'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { notFound } from 'next/navigation'

export default async function DisputeDetailPage({ params }: { params: { id: string } }) {
    const { id } = params
    const dispute = await getDisputeDetails(id)
    const timeline = await getDisputeTimeline(id)

    if (!dispute) notFound()

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Link 
                        href="/admin/disputes" 
                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary mb-4 flex items-center gap-2 transition-colors"
                    >
                        <ChevronLeft className="w-3 h-3" />
                        Retour aux litiges
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-3">
                        <Scale className="text-primary w-10 h-10" />
                        Médiation #{dispute.id.slice(0, 8)}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        dispute.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600 animate-pulse'
                    }`}>
                        Statut : {dispute.status.replace('_', ' ')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Lateral info panel */}
                <div className="space-y-8">
                    {/* General info */}
                    <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                        <h4 className="label-tech text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Résumé du Litige</h4>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight uppercase">{dispute.title}</h3>
                                <p className="text-sm text-gray-500 italic leading-relaxed">{dispute.description}</p>
                            </div>

                            {dispute.amountInDispute && (
                                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Enjeu Financier</p>
                                    <p className="text-2xl font-black text-red-600">{dispute.amountInDispute.toLocaleString()} FCFA</p>
                                </div>
                            )}

                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Référence Bail</p>
                                        <p className="font-bold text-gray-900">{dispute.lease.leaseReference}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Ouverture</p>
                                        <p className="font-bold text-gray-900">{format(new Date(dispute.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Resolution context if resolved */}
                    {dispute.resolution && (
                        <section className="bg-emerald-900 text-white rounded-[2rem] p-8 shadow-xl shadow-emerald-500/10">
                            <h4 className="text-primary text-[10px] font-black uppercase tracking-widest mb-4">Décision Officielle</h4>
                            <p className="text-sm italic leading-relaxed opacity-80">{dispute.resolution}</p>
                        </section>
                    )}

                    {/* Actions panel */}
                    <div className="sticky top-8">
                        <MediationControls disputeId={dispute.id} status={dispute.status} />
                    </div>
                </div>

                {/* Main timeline */}
                <div className="lg:col-span-2">
                    <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -mr-32 -mt-32 rounded-full"></div>
                        
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Chronogramme d'Arbitrage</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registre immuable des événements</p>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{timeline?.length || 0} Événements</span>
                            </div>
                        </div>

                        <MediationTimeline events={timeline || []} />
                    </div>
                </div>
            </div>
        </div>
    )
}
