"use client"

import React, { useState, useTransition } from "react"
import { 
    FileSignature, 
    ShieldCheck, 
    Download, 
    Plus, 
    Key, 
    X, 
    Loader2,
    UserCheck,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Info,
    Sparkles,
    Check
} from "lucide-react"
import { toast } from "sonner";
import { createProcuration, generateProcurationPDF } from "@/actions/procuration-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

const PERIMETRES = [
    { id: "Signature des baux et contrats", label: "✍️ Signature des contrats de bail", desc: "Autorise à signer les baux d'habitation et avenants officiels" },
    { id: "Visites et états des lieux", label: "🔑 Visites & États des lieux", desc: "Autorise à remettre les clés et certifier l'état d'entrée/sortie" },
    { id: "Encaissement des loyers", label: "💶 Encaissement & Reçus", desc: "Autorise à percevoir les loyers et délivrer les quittances" },
    { id: "Gestion globale des biens", label: "🏢 Gestion courante complète", desc: "Donne délégation générale pour l'ensemble des actes courants" }
]

export default function ProcurationDashboardClient({ initialProcurations }: { initialProcurations: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const [perimetre, setPerimetre] = useState(PERIMETRES[0].id)
    const [nomMandataire, setNomMandataire] = useState("")
    const [contact, setContact] = useState("")
    const [lien, setLien] = useState("Famille")
    const [dateFin, setDateFin] = useState(() => {
        const d = new Date()
        d.setFullYear(d.getFullYear() + 1)
        return d.toISOString().split("T")[0]
    })

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("email", contact);
        formData.append("perimetre", `${perimetre} (${nomMandataire} - ${lien})`);
        formData.append("dateFin", dateFin);
        
        startTransition(async () => {
            const res = await createProcuration(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Procuration établie avec succès !");
                setIsModalOpen(false);
            }
        });
    }

    const handleDownload = async (procId: string) => {
        toast.loading("Préparation du document PDF...", { id: procId });
        const res = await generateProcurationPDF(procId);
        
        if (res.error || !res.pdfBase64) {
            toast.error(res.error || "Erreur lors de la génération", { id: procId });
            return;
        }

        toast.success("Document prêt ! Téléchargement en cours...", { id: procId });
        
        const linkSource = `data:application/pdf;base64,${res.pdfBase64}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = `Procuration_${procId.substring(0,6)}.pdf`;
        downloadLink.click();
    }

    return (
        <div className="space-y-8 relative animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="mb-2 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        <UserCheck size={13} /> Mandat Légal de Représentation
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        Procurations & Délégations de Pouvoir
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                        Autorisez un proche ou un gestionnaire de confiance à agir en votre nom pour signer des baux, percevoir des loyers ou gérer les visites.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-purple-800 transition-all shadow-lg shadow-purple-700/20 flex items-center gap-2"
                    >
                        <Plus size={16} /> Donner Procuration
                    </button>
                </div>
            </div>

            {/* Informative Hero Banner */}
            <div className="bg-gradient-to-br from-purple-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-purple-800">
                <div className="relative z-10 max-w-xl space-y-3">
                    <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-2 text-purple-200">
                        <ShieldCheck size={13} /> Protection Juridique Validée
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        Déléguez en toute tranquillité, sans perdre le contrôle.
                    </h2>
                    <p className="text-purple-200 text-xs sm:text-sm font-normal leading-relaxed">
                        Chaque procuration génère un mandat officiel numéroté, précisant exactement les pouvoirs confiés et leur date de fin. Vous pouvez révoquer une délégation à tout moment en un clic.
                    </p>
                </div>
                <Key size={180} className="absolute right-0 opacity-10 rotate-12 pointer-events-none" />
            </div>

            {/* Table */}
            <SectionCard title="Liste des Procurations Actives" icon={<FileSignature className="text-purple-600" />}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/60">
                                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">N° d'Acte</th>
                                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Personne Mandatée</th>
                                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Pouvoirs Accordés</th>
                                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Statut</th>
                                <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Document</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialProcurations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium text-xs">
                                        Aucune procuration enregistrée pour le moment.
                                    </td>
                                </tr>
                            ) : (
                                initialProcurations.map(proc => (
                                    <tr key={proc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4 font-bold text-xs text-slate-800 font-mono">
                                            PROC-{proc.id.substring(0,6).toUpperCase()}
                                        </td>
                                        <td className="py-4 px-4 font-bold text-xs text-purple-900">
                                            {proc.mandataire?.firstName || "Représentant"} {proc.mandataire?.lastName || ""}
                                        </td>
                                        <td className="py-4 px-4 text-xs font-medium text-slate-600">
                                            {proc.droits?.action || "Gestion Générale"}
                                        </td>
                                        <td className="py-4 px-4">
                                            {proc.actif ? (
                                                <Badge color="green">Valide & En vigueur</Badge>
                                            ) : (
                                                <Badge color="red">Expirée</Badge>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button 
                                                onClick={() => handleDownload(proc.id)} 
                                                className="text-[11px] font-bold uppercase tracking-wider text-purple-700 hover:text-purple-900 hover:bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl transition-all shadow-sm inline-flex items-center gap-1.5"
                                            >
                                                <Download size={13}/> Télécharger PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-slate-200 max-h-[92vh]">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-purple-50/60 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                                    <FileSignature size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900">
                                        Établir une Procuration
                                    </h2>
                                    <p className="text-xs text-slate-500">Délégation officielle de pouvoirs</p>
                                </div>
                            </div>
                            <button 
                                onClick={()=>setIsModalOpen(false)} 
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex justify-center items-center text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <X size={16}/>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreate} className="p-6 space-y-5 overflow-y-auto flex-1">
                            <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 text-xs text-purple-950 space-y-1">
                                <p className="font-bold text-purple-900 flex items-center gap-1.5">
                                    <Info size={14} className="text-purple-600" /> Information pratique
                                </p>
                                <p className="leading-relaxed">
                                    Ce document légal atteste que votre mandataire a le droit d'effectuer les actes sélectionnés en votre nom auprès des locataires et des prestataires.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Mandataire name */}
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                        Nom complet de la personne mandatée <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={nomMandataire}
                                        onChange={e => setNomMandataire(e.target.value)}
                                        placeholder="Ex: Bamba Ousmane" 
                                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                                    />
                                </div>

                                {/* Phone or Email */}
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                        Téléphone mobile ou Email du mandataire <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={contact}
                                        onChange={e => setContact(e.target.value)}
                                        placeholder="Ex: +225 07 00 00 00 00" 
                                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                                    />
                                </div>

                                {/* Relationship */}
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                        Lien ou qualité du mandataire
                                    </label>
                                    <select 
                                        value={lien} 
                                        onChange={e => setLien(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                                    >
                                        <option value="Conjoint(e)">Conjoint(e) / Époux(se)</option>
                                        <option value="Famille proche">Membre de la famille (Enfant, Frère, Sœur)</option>
                                        <option value="Collaborateur">Collaborateur / Gestionnaire de confiance</option>
                                        <option value="Ami de confiance">Autre personne de confiance</option>
                                    </select>
                                </div>

                                {/* Powers to delegate */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 block">
                                        Pouvoirs et périmètre autorisés <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        {PERIMETRES.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setPerimetre(p.id)}
                                                className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 ${
                                                    perimetre === p.id
                                                        ? 'bg-purple-50 border-purple-400 shadow-sm'
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex-1">
                                                    <span className="text-xs font-bold text-slate-900 block">{p.label}</span>
                                                    <span className="text-[11px] text-slate-500 mt-0.5 block">{p.desc}</span>
                                                </div>
                                                {perimetre === p.id && <Check size={16} className="text-purple-600 shrink-0 mt-0.5" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Expiration Date */}
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                        Date de fin de validité de la procuration <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={dateFin}
                                        onChange={e => setDateFin(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Au-delà de cette date, la procuration cessera automatiquement d'avoir effet.
                                    </p>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    disabled={isPending || !nomMandataire.trim() || !contact.trim()} 
                                    className="w-full bg-purple-700 hover:bg-purple-800 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-700/20 flex items-center justify-center gap-2 disabled:opacity-40"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16}/> Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            Créer et Valider la Procuration <CheckCircle2 size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
