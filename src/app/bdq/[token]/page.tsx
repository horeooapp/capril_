import { notFound } from "next/navigation"
import { ShieldCheck, Calendar, MapPin, User, FileText, Hash, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { getBDQByToken } from "@/actions/bdq"
import Image from "next/image"

export default async function VerifyBDQPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const bdq = await getBDQByToken(token)

    if (!bdq) {
        notFound()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRME':
            case 'CONFIRME_AGENT':
            case 'CONFIRME_MEDIATION':
                return 'bg-green-500 shadow-green-500/20'
            case 'PENDING_LOCATAIRE':
                return 'bg-amber-500 shadow-amber-500/20'
            case 'CONTESTE':
                return 'bg-red-500 shadow-red-500/20'
            default:
                return 'bg-slate-500 shadow-slate-500/20'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONFIRME':
            case 'CONFIRME_AGENT':
                return <CheckCircle2 className="w-12 h-12 text-white" />
            case 'PENDING_LOCATAIRE':
                return <Clock className="w-12 h-12 text-white" />
            default:
                return <ShieldCheck className="w-12 h-12 text-white" />
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
                {/* Header - Security Vibe */}
                <div className="bg-slate-900 p-8 text-center relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="mb-4 bg-white p-2 rounded-2xl shadow-lg">
                            <Image src="/logo.png" alt="QAPRIL" width={60} height={60} />
                        </div>
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-xl ${getStatusColor(bdq.statut)}`}>
                            {getStatusIcon(bdq.statut)}
                        </div>
                        <h1 className="text-xl font-black text-white uppercase tracking-widest leading-none">Bail Déclaratif QAPRIL</h1>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] mt-2">Module M-BAIL-VERBAL · Réf {token}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-10 space-y-8">
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
                            bdq.statut === 'CONFIRME' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                            Statut: {bdq.statut.replace('_', ' ')}
                        </div>
                    </div>

                    {/* Main Details */}
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Locataire Déclaré</span>
                                <span className="text-lg font-black text-slate-900">{bdq.nomLocataireDeclare}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmation</span>
                                    <span className="text-sm font-black text-slate-900 truncate block">
                                        {bdq.confirmationAt ? new Date(bdq.confirmationAt).toLocaleDateString('fr-FR') : "En attente"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                    <ShieldCheck className="w-5 h-5 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bailleur</span>
                                    <span className="text-sm font-black text-slate-900 truncate block">{bdq.bailleur.fullName || "Confidentiel"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                <MapPin className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description Logement</span>
                                <span className="text-sm font-bold text-slate-600 line-clamp-2">{bdq.descriptionLogement}</span>
                            </div>
                        </div>

                        {/* Hash Security */}
                        <div className="pt-6 border-t border-slate-100">
                            <div className="flex items-center space-x-3 text-slate-300">
                                <Hash className="w-4 h-4" />
                                <span className="text-[10px] font-mono break-all leading-tight italic">
                                    SHA-256 Audit Trail: {bdq.hashBdqFinal || bdq.hashDeclaration}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legal Warning - SPEC ADD-06 */}
                <div className="p-8 bg-amber-50 border-t border-amber-100">
                    <div className="flex space-x-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-wider">
                            Avertissement Légal : Ce document constitue un commencement de preuve par écrit. 
                            Il ne remplace pas un bail signé (Loi n°2018-575). 
                            Transition recommandée vers bail M-SIGN après 3 mois.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 flex items-center justify-center pt-8 pr-8">
                         <ShieldCheck className="text-primary/20 w-16 h-16 -rotate-12" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 border border-primary/30 rounded-lg">
                                <ShieldCheck className="text-primary w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase">Signature Numérique QAPRIL</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Certificat d&apos;authenticité actif</p>
                            </div>
                        </div>
                        
                        <p className="text-[9px] text-slate-400 font-medium italic mb-2">
                             Ce document est certifié par QAPRIL Technologies SA. 
                        </p>
                        <p className="text-[8px] text-slate-300 font-mono tracking-tighter uppercase">
                            Digital Fingerprint: {bdq.hashBdqFinal?.substring(0, 32) || token}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
