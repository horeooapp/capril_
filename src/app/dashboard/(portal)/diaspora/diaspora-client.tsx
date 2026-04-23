"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Globe, Plane, ShieldCheck, Camera, Headphones, FileText, ArrowRight, MessageCircle, MapPin, Check, FileSignature, X } from "lucide-react"

export default function DiasporaClient({ data }: { data: any }) {
    const [isSubscribed, setIsSubscribed] = useState(data.isSubscribed)

    if (!isSubscribed) {
        return (
            <div className="space-y-12 pb-32">
                {/* HERO LANDING */}
                <div className="relative glass-panel rounded-[3rem] p-8 md:p-16 overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl text-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                    
                    <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                        <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-amber-500/30">
                            <Globe size={40} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                            QAPRIL <span className="text-amber-500">Diaspora.</span>
                        </h1>
                        <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed">
                            Investissez en Côte d'Ivoire. Nous gérons absolument tout sur place. 
                            De la recherche du locataire à l'inspection vidéo de votre bien.
                        </p>
                    </div>
                </div>

                {/* BENEFITS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="glass-panel p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-4 hover:shadow-xl transition-shadow group">
                        <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Recouvrement Garanti</h3>
                        <p className="text-slate-500 text-sm font-medium">Loyer sécurisé. Nous gérons la facturation, les rappels et les procédures contentieuses à Abidjan pour vous.</p>
                    </div>
                    <div className="glass-panel p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-4 hover:shadow-xl transition-shadow group">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Camera size={28} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Inspections Vidéo</h3>
                        <p className="text-slate-500 text-sm font-medium">États des lieux et maintenance filmés par nos agents agréés. Voyez l'état de votre bien depuis votre smartphone.</p>
                    </div>
                    <div className="glass-panel p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-4 hover:shadow-xl transition-shadow group">
                        <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileSignature size={28} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800">Fiscalité & DGI</h3>
                        <p className="text-slate-500 text-sm font-medium">Déclarations fiscales, paiement des impôts fonciers, tout est traité légalement en votre nom.</p>
                    </div>
                </div>

                {/* PRICING */}
                <div className="bg-slate-50 rounded-[3rem] p-8 md:p-16 border border-slate-200 text-center">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-12">Nos Forfaits Gestion</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Plan Classique */}
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm flex flex-col items-center">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-2">Sérénité</h3>
                            <div className="text-4xl font-black text-slate-900 mb-6">8% <span className="text-sm text-slate-400">/loyer encaissé</span></div>
                            <ul className="space-y-4 text-left w-full mb-8 text-sm font-bold text-slate-600">
                                <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> Collecte des loyers</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> Rapport financier mensuel</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> Support WhatsApp standard</li>
                                <li className="flex items-center gap-2 text-slate-400"><X size={16} /> Inspections vidéo trimestrielles</li>
                                <li className="flex items-center gap-2 text-slate-400"><X size={16} /> Gestion fiscale DGI</li>
                            </ul>
                            <button className="w-full py-4 mt-auto bg-slate-100 text-slate-800 rounded-xl font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                                Choisir Sérénité
                            </button>
                        </div>
                        
                        {/* Plan VIP */}
                        <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl flex flex-col items-center relative overflow-hidden transform md:-translate-y-4">
                            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2 mt-4">VIP Diaspora</h3>
                            <div className="text-4xl font-black text-amber-500 mb-6">12% <span className="text-sm text-slate-400">/loyer encaissé</span></div>
                            <ul className="space-y-4 text-left w-full mb-8 text-sm font-bold text-slate-300">
                                <li className="flex items-center gap-2"><Check size={16} className="text-amber-500" /> Collecte & Recouvrement VIP</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-amber-500" /> Rapport financier détaillé</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-amber-500" /> Gestionnaire Dédié 24/7</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-amber-500" /> Inspections vidéo trimestrielles</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-amber-500" /> Gestion fiscale DGI incluse</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-amber-500" /> Représentation juridique</li>
                            </ul>
                            <button 
                                onClick={() => setIsSubscribed(true)}
                                className="w-full py-4 mt-auto bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:shadow-orange-500/25 transition-all"
                            >
                                Activer VIP
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-32">
            {/* HERO DASHBOARD VIP */}
            <div className="relative glass-panel rounded-[2.5rem] p-8 md:p-12 overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center">
                    <div className="space-y-4 flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-amber-400">
                            <Globe size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Abonnement VIP Actif</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                            Espace <span className="text-amber-500">Diaspora.</span>
                        </h1>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-800/50 px-3 py-2 rounded-lg">
                                <Plane size={14} className="text-sky-400" /> Résidence : {data.profile.paysResidence}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-800/50 px-3 py-2 rounded-lg">
                                <MapPin size={14} className="text-emerald-400" /> Contact CI : {data.profile.diasporaContactPerson}
                            </div>
                        </div>
                    </div>
                    
                    {/* CONCIERGERIE WIDGET */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl w-full md:w-[320px] shrink-0 border border-slate-100 flex flex-col items-center text-center">
                        <img src={data.manager.photo} alt={data.manager.name} className="w-16 h-16 rounded-full border-4 border-amber-100 mb-3" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{data.manager.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mb-4">{data.manager.role}</p>
                        <a 
                            href={`https://wa.me/${data.manager.phone.replace('+', '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={16} /> Discuter sur WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* DASHBOARD SECTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* RAPPORTS MENSUELS */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                            <FileText size={20} className="text-amber-500" /> Rapports Financiers
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {data.reports.map((report: any) => (
                            <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 text-sm">{report.month}</p>
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{report.status}</p>
                                    </div>
                                </div>
                                <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DEMANDES D'INSPECTION */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center space-y-4 border-dashed">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                        <Camera size={28} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Inspections Vidéo</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-sm">
                        Demandez à votre gestionnaire de filmer une visite détaillée de l'un de vos biens à Abidjan.
                    </p>
                    <button className="px-6 py-3 bg-amber-50 text-amber-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-100 transition-colors mt-4">
                        Demander une visite
                    </button>
                </div>
            </div>
        </div>
    )
}
