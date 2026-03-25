import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { subscribeToDiaspora } from "@/actions/diaspora-actions"
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react"

export default async function SubscribePage() {
  const session = await auth()
  if (!session?.user) redirect("/dashboard/login")

  return (
    <div className="max-w-xl mx-auto py-20 px-6">
      <div className="glass-panel p-10 rounded-[3rem] border border-white/60 shadow-2xl space-y-8 text-center">
        <div className="w-20 h-20 bg-orange-50 text-ivoire-orange rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
          <Zap size={40} className="fill-current" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-ivoire-dark bg-clip-text text-transparent bg-gradient-to-r from-ivoire-dark to-ivoire-orange">
            Activation du Package
          </h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
            Module QAPRIL Diaspora v1.0
          </p>
        </div>

        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Abonnement</span>
                <span className="font-black text-ivoire-dark">DIASPORA PREMIUM</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Prix</span>
                <span className="font-black text-ivoire-orange">7 € / mois</span>
             </div>
             <div className="pt-4 border-t border-gray-200 flex items-center gap-3 text-left">
                <ShieldCheck size={24} className="text-green-500 shrink-0" />
                <p className="text-[10px] font-medium text-gray-500">Paiement sécurisé via Stripe. Activation immédiate de tous les outils de gestion à distance.</p>
             </div>
        </div>

        <form action={async () => {
          "use server"
          const session = await auth()
          if (session?.user?.id) {
            await subscribeToDiaspora(session.user.id)
            redirect("/dashboard/diaspora")
          }
        }}>
          <button 
            type="submit"
            className="w-full py-5 bg-ivoire-dark text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-ivoire-orange hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            Confirmer le Paiement
          </button>
        </form>

        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          Sans engagement · Résiliable à tout moment
        </p>
      </div>
    </div>
  )
}
