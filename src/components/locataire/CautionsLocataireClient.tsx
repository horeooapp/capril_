"use client"

import { useState } from "react"
import { 
    ShieldCheck, 
    Lock, 
    CheckCircle2, 
    AlertCircle, 
    FileText,
    Hash,
    Calendar,
    ArrowRight
} from "lucide-react"
import { certifyCautionSaisie, confirmCautionLocataire } from "@/actions/cautions"
import { toast } from "sonner"

export default function CautionsLocataireClient({ caution: initialCaution, bail, userId }: any) {
    const [caution, setCaution] = useState(initialCaution)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        montantFcfa: bail?.depositAmount || 0,
        dateVersement: new Date(),
        modeVersement: "ESPECES",
        destination: "PROPRIETAIRE",
        conditionsRestit: ""
    })

    const handleCertify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bail) return
        setLoading(true)
        try {
            const res = await certifyCautionSaisie(bail.id, formData)
            setCaution(res)
            toast.success("Caution certifiée avec succès")
        } catch (err) {
            toast.error("Erreur de certification")
        } finally {
            setLoading(false)
        }
    }

    const handleConfirm = async () => {
        setLoading(true)
        try {
            const res = await confirmCautionLocataire(caution.id)
            setCaution(res)
            toast.success("Réception confirmée")
        } catch (err) {
            toast.error("Erreur de confirmation")
        } finally {
            setLoading(false)
        }
    }

    if (!bail) {
        return (
            <div className="glass-panel p-20 rounded-[3rem] text-center border border-white/40">
                <AlertCircle size={48} className="mx-auto text-gray-200 mb-6" />
                <h3 className="text-xl font-black text-gray-400 uppercase tracking-tighter">Aucun bail actif trouvé</h3>
                <p className="text-gray-400 font-medium">Vous devez avoir un bail actif pour gérer votre caution.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#1F4E79] tracking-tighter uppercase mb-2">Ma Caution.</h1>
                    <p className="text-gray-500 font-medium tracking-wide">Certification numérique et traçabilité SHA-256 de vos dépôts.</p>
                </div>
                {caution && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-[#375623]/10 rounded-2xl border border-[#375623]/20">
                        <ShieldCheck size={18} className="text-[#375623]" />
                        <span className="text-[14px] font-black uppercase tracking-widest text-[#375623]">Document Certifié</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Section */}
                {!caution ? (
                    <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/40 shadow-xl bg-white space-y-8">
                        <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                           <AlertCircle size={24} className="text-[#C55A11]" />
                           <p className="text-[13px] font-bold text-[#C55A11]">Votre caution n'est pas encore certifiée dans le système QAPRIL Secure.</p>
                        </div>

                        <form onSubmit={handleCertify} className="space-y-6">
                             <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Montant (FCFA)</label>
                                    <input 
                                        type="number"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 outline-none font-black text-[#1F4E79]"
                                        value={formData.montantFcfa}
                                        onChange={(e) => setFormData({...formData, montantFcfa: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Mode</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 outline-none font-bold text-[#1F4E79]"
                                        value={formData.modeVersement}
                                        onChange={(e) => setFormData({...formData, modeVersement: e.target.value})}
                                    >
                                        <option value="ESPECES">Espèces</option>
                                        <option value="VIREMENT">Virement</option>
                                        <option value="MOBILE_MONEY">Mobile Money</option>
                                    </select>
                                </div>
                             </div>

                             <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Destination du dépôt</label>
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 outline-none font-bold text-[#1F4E79]"
                                    value={formData.destination}
                                    onChange={(e) => setFormData({...formData, destination: e.target.value})}
                                >
                                    <option value="PROPRIETAIRE">Entre les mains du Propriétaire</option>
                                    <option value="CDC_CI">Consigné à la CDC-CI (Conseillé)</option>
                                </select>
                             </div>

                             <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Notes ou Observations</label>
                                <textarea 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50/50 outline-none font-medium text-gray-700"
                                    placeholder="Précisez les conditions de restitution si nécessaire..."
                                    rows={3}
                                    value={formData.conditionsRestit}
                                    onChange={(e) => setFormData({...formData, conditionsRestit: e.target.value})}
                                />
                             </div>

                             <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#1F4E79] text-white rounded-2xl font-black uppercase tracking-widest text-[14px] hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                             >
                                <Lock size={18} />
                                {loading ? "Certification..." : "Certifier mon dépôt"}
                             </button>
                        </form>
                    </div>
                ) : (
                    <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-white/40 shadow-xl bg-white space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                             <CheckCircle2 size={40} className="text-[#375623] opacity-20" />
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-black text-[#1F4E79] uppercase tracking-tighter mb-1">Dépôt Garanti.</h2>
                            <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">Référence Certificat: {caution.certificatRef}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Montant Consigné</p>
                                <p className="text-3xl font-black text-[#1F4E79]">{Number(caution.montantFcfa).toLocaleString()} <span className="text-lg">FCFA</span></p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Date de Versement</p>
                                <p className="text-lg font-black text-gray-700">{new Date(caution.dateVersement).toLocaleDateString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Destination</p>
                                <p className="text-lg font-black text-[#C55A11]">{caution.destination}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Méthode</p>
                                <p className="text-lg font-black text-gray-700">{caution.modeVersement}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-start gap-4">
                            <div className="p-2 bg-[#1F4E79] text-white rounded-xl">
                                <Hash size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Empreinte Numérique (SHA-256)</p>
                                <p className="text-[11px] font-mono text-gray-500 break-all leading-tight">{caution.hashSha256}</p>
                            </div>
                        </div>

                        {!caution.confirmeLocataire && (
                            <button 
                                onClick={handleConfirm}
                                disabled={loading}
                                className="w-full py-4 bg-[#375623] text-white rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-black transition-all shadow-xl active:scale-95"
                            >
                                {loading ? "Confirmation..." : "Confirmer la réception par le bailleur"}
                            </button>
                        )}
                    </div>
                )}

                {/* Info Card */}
                <div className="space-y-6">
                    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-gradient-to-br from-[#1F4E79] to-[#122e47] text-white">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                            <ShieldCheck size={24} />
                            Pourquoi certifier ?
                        </h3>
                        <ul className="space-y-4">
                            {[
                                "Garantie de preuve irréfutable en cas de litige",
                                "Traçabilité du dépôt au niveau de la plateforme",
                                "Valorisation de votre score locatif (+50 pts)",
                                "Simplification de la procédure de restitution"
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-3 text-[14px] font-medium opacity-90">
                                    <CheckCircle2 size={16} className="mt-0.5 text-emerald-400 flex-shrink-0" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Preavis Card */}
                    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/40 shadow-lg bg-white relative overflow-hidden group">
                        <h3 className="text-xl font-black text-[#1F4E79] uppercase tracking-tight mb-2">Libérer le Logement ?</h3>
                        <p className="text-gray-500 text-[14px] font-medium mb-6">
                            L'émission d'un préavis numérique est obligatoire pour officialiser votre départ et planifier l'état des lieux.
                        </p>
                        <Link href="/locataire/preavis" className="flex items-center gap-2 text-[#1F4E79] font-black uppercase tracking-widest text-[12px] group-hover:gap-4 transition-all">
                            Déclarer mon préavis <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
