import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPublicProfile } from "@/actions/locataire-profil-public"
import { ProfilPublicLocataireClient } from "@/components/locataire/ProfilPublicLocataireClient"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProfilPublicPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/mon-espace-locataire/login")

    const profil = await getPublicProfile(session.user.id)

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
            {/* Header & Fil d'Ariane */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.03)]">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Link 
                            href="/mon-espace-locataire" 
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-800 text-[11px] font-bold uppercase tracking-wider transition-colors"
                        >
                            <ArrowLeft size={13} /> Espace Locataire
                        </Link>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#FF8200] flex items-center gap-1">
                            <Sparkles size={12} /> Matching Immobilier
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Mon Profil Public & Préférences de Logement
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 font-medium max-w-2xl">
                        Renseignez votre budget, le quartier souhaité, votre période d'emménagement et votre situation professionnelle pour être contacté directement par des propriétaires et agences certifiées.
                    </p>
                </div>
            </div>

            <ProfilPublicLocataireClient 
                userId={session.user.id} 
                initialData={profil} 
            />
        </div>
    )
}
