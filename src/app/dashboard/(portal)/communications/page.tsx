import { Megaphone } from "lucide-react"

export default function CommunicationsPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-black text-qnavy-dark uppercase tracking-tighter">Alertes & NewsTicker</h1>
            <div className="bg-white rounded-[2rem] p-8 border border-qnavy/10 shadow-[0_12px_40px_rgba(13,43,110,0.06)] flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 bg-qnavy-pale rounded-[2rem] border border-white shadow-inner flex items-center justify-center text-qnavy mb-6">
                    <Megaphone size={40} />
                </div>
                <h2 className="text-xl font-black text-qnavy-dark mb-2">Module en cours de déploiement</h2>
                <p className="text-qgrey-dark max-w-md">Console de diffusion globale pour propager des annonces urgentes (News Ticker) sur tous les écrans locataires.</p>
            </div>
        </div>
    )
}
