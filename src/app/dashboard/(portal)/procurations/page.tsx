import { FileSignature } from "lucide-react"

export default function ProcurationsPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-black text-qnavy-dark uppercase tracking-tighter">Procurations Numériques</h1>
            <div className="bg-white rounded-[2rem] p-8 border border-qnavy/10 shadow-[0_12px_40px_rgba(13,43,110,0.06)] flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 bg-qnavy-pale rounded-[2rem] border border-white shadow-inner flex items-center justify-center text-qnavy mb-6">
                    <FileSignature size={40} />
                </div>
                <h2 className="text-xl font-black text-qnavy-dark mb-2">Module en cours de déploiement</h2>
                <p className="text-qgrey-dark max-w-md">Le registre de délégation légale (Parents, Amis, Avocats) est en cours d'intégration à la blockchain QAPRIL.</p>
            </div>
        </div>
    )
}
