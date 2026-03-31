import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ShieldCheck, MessageSquareWarning, FileSignature, Receipt, Gavel, FileLock2, Info } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TenantRightsPage() {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "TENANT") {
        redirect("/locataire/login")
    }

    const rightsActions = [
        {
            title: "Demande d'Intervention (Travaux)",
            description: "Plomberie, électricité, étanchéité. Signalez un sinistre à votre propriétaire via la règle d'assistance sécurisée (RCL-05).",
            icon: <MessageSquareWarning size={20} className="text-qorange" />,
            badge: "Délai 144h Max",
            bgColor: "bg-qorange-pale",
            borderColor: "border-qorange/30"
        },
        {
            title: "Contester une modification",
            description: "Opposition à une hausse de loyer ou modification de bail non justifiée. La règle MRL-01 requiert votre consentement formel.",
            icon: <FileSignature size={20} className="text-qred" />,
            badge: "Suspension",
            bgColor: "bg-qred-pale",
            borderColor: "border-qred/30"
        },
        {
            title: "Réclamation Quittance",
            description: "Paiement envoyé mais quittance certifiée manquante. Forcer l'édition avec preuve de paiement Mobile Money.",
            icon: <Receipt size={20} className="text-qnavy" />,
            badge: "Pénalité J+3",
            bgColor: "bg-qnavy-pale",
            borderColor: "border-qnavy/30"
        },
        {
            title: "Initier un préavis de sortie",
            description: "Annoncer de façon formelle et numérique votre intention de quitter les lieux (Délai légal de 1 mois en Côte d'Ivoire).",
            icon: <FileLock2 size={20} className="text-qgreen" />,
            badge: "Avis Électronique",
            bgColor: "bg-qgreen-pale",
            borderColor: "border-qgreen/30"
        }
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* V4 Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
                <div className="relative z-10 w-full">
                    <h1 className="text-3xl sm:text-4xl font-black text-[#97782A] uppercase tracking-tighter flex items-center gap-3">
                        <Gavel className="mb-1" size={32} /> Mes Droits 
                        <span className="bg-[#97782A]/10 text-[#97782A] text-[10px] px-3 py-1 rounded-full tracking-widest font-black uppercase border border-[#97782A]/30">Assistance Juridique</span>
                    </h1>
                    <p className="text-[11px] font-black uppercase tracking-widest text-qtext-light mt-2">
                        Création et suivi de vos requêtes locataires
                    </p>
                </div>
            </div>

            {/* Educational Banner */}
            <div className="bg-[linear-gradient(135deg,#FDF6E3_0%,#F5E6BE_100%)] p-8 rounded-[2rem] border border-[#C9A84C]/20 shadow-sm relative overflow-hidden group">
                <div className="flex items-start gap-4 z-10 relative">
                    <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/50 shrink-0 mt-1">
                        <ShieldCheck className="text-[#C9A84C]" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[#97782A] uppercase tracking-widest leading-tight mb-2">
                            Assistance & Médiation QAPRIL
                        </h3>
                        <p className="text-sm font-bold text-[#97782A]/80 leading-relaxed max-w-2xl">
                            La plateforme agit comme un tiers de confiance. Lorsqu'un ticket est ouvert, votre bailleur dispose d'un temps imparti pour répondre. Sans réponse, <span className="font-black text-qred-dark bg-qred/10 px-1 rounded">le ticket sera fermé en votre faveur</span> et affectera automatiquement son Indice de Confiance (ICL).
                        </p>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <ShieldCheck size={200} />
                </div>
            </div>

            {/* Actions Grid */}
            <div>
                 <h2 className="text-lg font-black text-qnavy-dark mb-6 flex items-center gap-2 uppercase tracking-widest">
                     <Info size={18} className="text-qtext-light" /> Ouvrir un nouveau dossier
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {rightsActions.map((action, idx) => (
                         <button 
                            key={idx} 
                            className={`flex flex-col text-left p-6 sm:p-8 rounded-[2rem] border ${action.borderColor} bg-white shadow-sm hover:shadow-lg transition-all group`}
                         >
                             <div className="flex justify-between items-start mb-4">
                                 <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                     {action.icon}
                                 </div>
                                 <span className="bg-qgrey-1 text-qtext-mid text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-qgrey-2">
                                     {action.badge}
                                 </span>
                             </div>
                             <h3 className="text-sm font-black text-qnavy-dark uppercase tracking-widest mb-2 leading-tight">
                                 {action.title}
                             </h3>
                             <p className="text-xs font-medium text-qtext-light leading-relaxed">
                                 {action.description}
                             </p>
                         </button>
                     ))}
                 </div>
            </div>

            {/* Active Tickets Simulation */}
            <div className="mt-12">
                 <h2 className="text-md font-black text-qtext-light mb-6 uppercase tracking-widest">Historique de vos dossiers</h2>
                 <div className="bg-white rounded-[2rem] border border-qgrey-2 border-dashed p-10 text-center">
                     <p className="text-sm font-bold text-qtext-mid">Aucun dossier d'assistance en cours.</p>
                     <p className="text-xs text-qtext-light mt-1">Vos réclamations et préavis s'afficheront ici.</p>
                 </div>
            </div>
            
        </div>
    )
}
