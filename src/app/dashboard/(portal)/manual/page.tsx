"use client"

import React from "react"
import { BookOpen, Search, ChevronRight, FileText, Video, HelpCircle } from "lucide-react"
import { toast } from "sonner";

export default function ManualDashboardPage() {
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col items-center text-center mb-10">
                <BookOpen className="text-qnavy mb-4" size={48} />
                <h1 className="text-3xl sm:text-5xl font-black text-qnavy-dark uppercase tracking-tighter mb-4">
                    Manuel Officiel
                </h1>
                <p className="text-sm font-medium text-qtext-mid max-w-lg">
                    Recherchez des guides, des vidéos de formation, ou consultez la charte technique de la plateforme QAPRIL V4.
                </p>
                <div className="relative w-full max-w-2xl mt-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Comment éditer une quittance ? Comment scanner un BDQ ?" className="w-full pl-14 pr-6 py-4 bg-white border border-qgrey-2 rounded-full text-sm font-bold shadow-sm focus:outline-none focus:border-qnavy focus:ring-1 focus:ring-qnavy transition-all" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Getting started */}
                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-8 shadow-sm group hover:border-qnavy transition-colors cursor-pointer text-left">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 border border-blue-100">
                        <Video size={20} />
                    </div>
                    <h3 className="text-xl font-black text-qnavy-dark mb-2">Bien démarrer (Vidéos)</h3>
                    <p className="text-sm font-medium text-qtext-mid mb-6 h-10">Tutoriels vidéo pas-à-pas pour les premières connexions et la création de mandats.</p>
                    <div className="flex justify-between items-center text-qnavy font-black text-[10px] uppercase tracking-widest">
                        <span>Voir Les 5 Leçons</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* Docs */}
                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-8 shadow-sm group hover:border-qnavy transition-colors cursor-pointer text-left">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6 border border-orange-100">
                        <FileText size={20} />
                    </div>
                    <h3 className="text-xl font-black text-qnavy-dark mb-2">Procédures & Lois</h3>
                    <p className="text-sm font-medium text-qtext-mid mb-6 h-10">Documentation des processus métiers (Cima, OHADA) codés dans l'ERP.</p>
                    <div className="flex justify-between items-center text-qnavy font-black text-[10px] uppercase tracking-widest">
                        <span>Lire la Doc</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* FAQ */}
                <div className="bg-white border border-qgrey-2 rounded-[2rem] p-8 shadow-sm group hover:border-qnavy transition-colors cursor-pointer text-left md:col-span-2 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-qgrey-1 text-qnavy rounded-full flex items-center justify-center">
                            <HelpCircle size={28} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-qnavy-dark mb-1">Base de Connaissances Mutuelle</h3>
                            <p className="text-sm font-medium text-qtext-mid">Trouvez la solution aux alertes de configuration (WebPay, SMS erronés).</p>
                        </div>
                    </div>
                    <button onClick={() => toast.info('🚀 Module Premium (V5) : Interface en cours de déploiement sécurisé')} className="bg-qnavy text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-qnavy-dark transition-all shadow-md whitespace-nowrap">
                        Consulter FAQ
                    </button>
                </div>
            </div>
            
            <div className="text-center pt-8">
                <p className="text-xs font-bold text-qtext-light">
                    Besoin d'assistance directe ? <span className="text-qnavy underline cursor-pointer">Ouvrir un ticket technique</span>
                </p>
            </div>
        </div>
    )
}
