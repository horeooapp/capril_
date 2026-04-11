import { SmartphoneNfc } from "lucide-react"

export default function BDQPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-black text-qnavy-dark uppercase tracking-tighter">Bail Déclaratif (BDQ)</h1>
            <div className="bg-white rounded-[2rem] p-8 border border-qnavy/10 shadow-[0_12px_40px_rgba(13,43,110,0.06)] flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 bg-qnavy-pale rounded-[2rem] border border-white shadow-inner flex items-center justify-center text-qnavy mb-6">
                    <SmartphoneNfc size={40} />
                </div>
                <h2 className="text-xl font-black text-qnavy-dark mb-2">Module en cours de déploiement</h2>
                <p className="text-qgrey-dark max-w-md">L'interface de gestion asynchrone des Baux Déclaratifs au Quotidien (pour le locatif informel) est en phase de test.</p>
            </div>
        </div>
    )
}
