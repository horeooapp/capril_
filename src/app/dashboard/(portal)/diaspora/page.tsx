import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getDiasporaDashboard } from "@/actions/diaspora-actions"
import DiasporaDashboard from "@/components/DiasporaDashboard"
import { Globe, ShieldCheck, Zap, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function DiasporaPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/dashboard/login")
  }

  // Vérifier si l'utilisateur a le package Diaspora
  if (!(session.user as any).diasporaAbonnement) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-ivoire-orange/10 text-ivoire-orange rounded-full text-xs font-black uppercase tracking-widest border border-ivoire-orange/20 mb-4">
            <Zap size={14} className="fill-current" />
            Module Premium
          </div>
          <h1 className="text-5xl font-black text-ivoire-dark tracking-tighter">
            Activez votre <span className="text-ivoire-orange text-shadow-glow">Package Diaspora</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Gérez votre patrimoine ivoirien depuis n'importe où dans le monde avec des outils conçus pour la distance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-[3rem] border border-white/60 space-y-4 text-left">
                <div className="w-12 h-12 bg-orange-50 text-ivoire-orange rounded-2xl flex items-center justify-center">
                    <Globe size={24} />
                </div>
                <h4 className="font-black text-ivoire-dark uppercase tracking-widest text-sm">Multi-Devises</h4>
                <p className="text-gray-400 text-xs font-medium">Conversion temps réel en EUR, USD, CAD ou GBP sur tous vos revenus.</p>
            </div>
            <div className="glass-panel p-8 rounded-[3rem] border border-white/60 space-y-4 text-left">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={24} />
                </div>
                <h4 className="font-black text-ivoire-dark uppercase tracking-widest text-sm">Mandataire Local</h4>
                <p className="text-gray-400 text-xs font-medium">Désignez et suivez un proche avec des SLAs garantis par QAPRIL.</p>
            </div>
            <div className="glass-panel p-8 rounded-[3rem] border border-white/60 space-y-4 text-left">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Zap size={24} />
                </div>
                <h4 className="font-black text-ivoire-dark uppercase tracking-widest text-sm">Rapports Certifiés</h4>
                <p className="text-gray-400 text-xs font-medium">Rapports mensuels scellés (SHA-256) envoyés par email et WhatsApp.</p>
            </div>
        </div>

        <div className="bg-ivoire-dark rounded-[3rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-left space-y-2">
                <p className="text-white/40 text-xs font-black uppercase tracking-widest">Abonnement Mensuel</p>
                <h3 className="text-4xl font-black">7 € <span className="text-xl font-normal text-white/60">/ mois</span></h3>
                <p className="text-ivoire-orange font-bold text-sm">≈ 4 600 FCFA · Sans engagement</p>
            </div>
            <Link 
                href="/dashboard/diaspora/subscribe"
                className="w-full md:w-auto px-10 py-5 bg-ivoire-orange text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 transition-all text-center"
            >
                Activer Maintenant
            </Link>
        </div>
      </div>
    )
  }

  const result = await getDiasporaDashboard()

  if (result.error || !result.data) {
    return (
      <div className="p-20 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-ivoire-dark">Erreur de chargement</h2>
        <p className="text-gray-400 mt-2">{result.error || "Impossible de récupérer vos données."}</p>
      </div>
    )
  }

  return <DiasporaDashboard data={result.data} user={session.user} />
}
