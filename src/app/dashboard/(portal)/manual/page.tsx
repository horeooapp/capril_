"use client"

import { BookOpen, Search, ChevronRight, FileText, Video, HelpCircle } from "lucide-react"
import Link from "next/link";
import { toast } from "sonner";

export default function ManualDashboardPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
             <div className="flex flex-col items-center text-center mb-10 pt-8">
                <BookOpen className="text-slate-800 mb-4" size={48} />
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                    Manuel Officiel
                </h1>
                <p className="text-[13.5px] font-medium text-slate-500 max-w-lg">
                    Recherchez des guides, des vidéos de formation, ou consultez la charte technique de la plateforme QAPRIL V4.
                </p>
                <div className="relative w-full max-w-2xl mt-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="text" placeholder="Comment éditer une quittance ? Comment scanner un BDQ ?" className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-full text-[13.5px] font-medium shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-slate-900 placeholder:text-slate-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                {/* Getting started */}
                <div className="bg-white border border-slate-200 rounded-[16px] p-8 shadow-sm group hover:border-sky-300 transition-colors cursor-pointer text-left focus:ring-2 focus:ring-sky-500 outline-none">
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-[12px] flex items-center justify-center mb-6 border border-sky-100 shadow-sm">
                        <Video size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Bien démarrer (Vidéos)</h3>
                    <p className="text-[13px] font-medium text-slate-500 mb-6 h-10">Tutoriels vidéo pas-à-pas pour les premières connexions et la création de mandats.</p>
                    <div className="flex justify-between items-center text-sky-600 font-bold text-[10px] uppercase tracking-widest pt-2 border-t border-slate-100">
                        <span>Voir Les 5 Leçons</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* Docs */}
                <div className="bg-white border border-slate-200 rounded-[16px] p-8 shadow-sm group hover:border-amber-300 transition-colors cursor-pointer text-left">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-[12px] flex items-center justify-center mb-6 border border-amber-100 shadow-sm">
                        <FileText size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Procédures & Lois</h3>
                    <p className="text-[13px] font-medium text-slate-500 mb-6 h-10">Documentation des processus métiers (Cima, OHADA) codés dans l'ERP.</p>
                    <div className="flex justify-between items-center text-amber-600 font-bold text-[10px] uppercase tracking-widest pt-2 border-t border-slate-100">
                        <span>Lire la Doc</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* FAQ */}
                <div className="bg-white border border-slate-200 rounded-[16px] p-8 shadow-sm group hover:border-emerald-300 transition-colors cursor-pointer text-left md:col-span-2 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                            <HelpCircle size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">Base de Connaissances Mutuelle</h3>
                            <p className="text-[13.5px] font-medium text-slate-500">Trouvez la solution aux alertes de configuration (WebPay, SMS erronés).</p>
                        </div>
                    </div>
                    <button onClick={() => {
                        toast.promise(new Promise(r=>setTimeout(r, 1000)), {loading:'Chargement de la base de connaissances...', success:'Base chargée en mémoire cache.'});
                    }} className="bg-slate-800 text-white px-6 py-3 rounded-[10px] font-bold text-[11px] uppercase tracking-widest hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap">
                        Consulter FAQ
                    </button>
                </div>
            </div>
            
            <div className="text-center pt-4 pb-8">
                <p className="text-[12px] font-bold text-slate-400">
                    Besoin d'assistance directe ? <Link href="/dashboard/maintenance/new" className="text-sky-600 font-black underline cursor-pointer hover:text-sky-700 transition-colors">Ouvrir un ticket technique</Link>
                </p>
            </div>
        </div>
    )
}
