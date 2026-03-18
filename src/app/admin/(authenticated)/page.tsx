import { AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDashboardOverview() {
    try {
        return (
            <div className="p-12 bg-white rounded-[3rem] shadow-2xl border border-gray-100 text-center animate-in fade-in duration-1000">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mb-10 border border-green-100 shadow-sm mx-auto rotate-3">
                     <span className="text-3xl">🛡️</span>
                </div>
                
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-4 italic">
                    Diagnostic Système <span className="text-primary italic">QAPRIL</span>.
                </h1>
                
                <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.2em] mb-12">
                    Niveau de Service: <span className="text-green-600">OPTIMAL</span>
                </p>
                
                <div className="flex flex-col items-center gap-4">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-50 text-green-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-green-100">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Moteur de Rendu Opérationnel
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium max-w-xs leading-relaxed">
                        Si vous voyez ce panneau, le Layout et le Header fonctionnent correctement. 
                        L&apos;erreur provient donc des données dynamiques du dashboard original.
                    </p>
                </div>
            </div>
        )
    } catch (err: any) {
        return (
            <div className="p-12 bg-red-50 border-2 border-red-100 rounded-[3rem] text-center">
                <AlertTriangle className="mx-auto text-red-500 mb-6" size={48} />
                <h2 className="text-2xl font-black text-gray-900 uppercase mb-4">Erreur de Diagnostic</h2>
                <code className="text-xs bg-white p-4 rounded-xl border border-red-100 block text-left overflow-auto">
                    {String(err)}
                </code>
            </div>
        )
    }
}
