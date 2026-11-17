"use client"

import React from "react"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import QaprilVideoShowcase from "@/components/video/QaprilVideoShowcase"
import { Film, ArrowRight, ShieldCheck, Smartphone, FileCheck } from "lucide-react"

export default function VideosPage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-[#D97706] selection:text-white flex flex-col justify-between">
            <Header />

            <main className="flex-1 pt-24 sm:pt-28 pb-16">
                {/* En-tête de la page */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        <Film size={14} className="text-[#FF8200]" />
                        <span>Vidéothèque Officielle QAPRIL</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                        Vidéos de Présentation & Démonstrations
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                        Retrouvez l&apos;ensemble de nos présentations institutionnelles et nos tutoriels pour maîtriser la gestion et l&apos;enregistrement de vos baux en Côte d&apos;Ivoire.
                    </p>
                </div>

                {/* Composant de visionnage principal */}
                <QaprilVideoShowcase />

                {/* Liens rapides & services associés */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link
                            href="/dashboard/login"
                            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-400/50 shadow-xs hover:shadow-md transition-all group block"
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#D97706] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileCheck size={20} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">
                                Enregistrer un bail numérique
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                Rédigez un contrat conforme à la loi 2019-576 et signez par code OTP SMS immédiat.
                            </p>
                            <span className="text-xs font-bold text-[#D97706] inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                <span>Accéder à l&apos;outil</span>
                                <ArrowRight size={13} />
                            </span>
                        </Link>

                        <Link
                            href="/telecharger"
                            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400/50 shadow-xs hover:shadow-md transition-all group block"
                        >
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Smartphone size={20} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">
                                Télécharger les applications
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                Installez l&apos;application mobile QAPRIL Locataire ou Propriétaire sur votre téléphone.
                            </p>
                            <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                <span>Télécharger l&apos;APK</span>
                                <ArrowRight size={13} />
                            </span>
                        </Link>

                        <Link
                            href="/verifier"
                            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-sky-400/50 shadow-xs hover:shadow-md transition-all group block"
                        >
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={20} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">
                                Vérificateur public de quittance
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                Contrôlez l&apos;authenticité d&apos;une quittance ou d&apos;un contrat par QR Code ou référence.
                            </p>
                            <span className="text-xs font-bold text-sky-600 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                <span>Vérifier un document</span>
                                <ArrowRight size={13} />
                            </span>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
