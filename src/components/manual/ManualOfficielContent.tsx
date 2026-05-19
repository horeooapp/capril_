"use client"

import React, { useState } from "react"
import { 
    BookOpen, 
    ShieldCheck, 
    Smartphone,
    Download,
    CheckCircle,
    Info,
    ChevronRight,
    Home,
    FileText,
    HelpCircle,
    Book,
    Key,
    Briefcase,
    Building,
    FileCheck,
    Wifi,
    Lock,
    Trophy,
    Globe,
    Zap
} from "lucide-react"

export default function ManualOfficielContent() {
    const [activeSection, setActiveSection] = useState("section-1")

    const scrollToSection = (id: string) => {
        setActiveSection(id)
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Cover */}
            <div className="relative p-10 md:p-14 rounded-[2.5rem] overflow-hidden bg-white/60 border border-white/80 shadow-xl backdrop-blur-md mb-12 print:shadow-none print:border-none print:bg-transparent print:p-0 print:mb-8">
                <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                        @page { margin: 2cm; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white !important; }
                        h2 { page-break-before: always; break-before: page; margin-top: 0 !important; }
                        #section-1 h2 { page-break-before: avoid; break-before: auto; }
                    }
                `}} />
                
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none print:hidden">
                    <BookOpen size={240} className="text-ivoire-dark" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left print:text-black">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                        <img src="/logo.png" alt="QAPRIL" className="h-20 w-auto rounded-3xl shadow-xl border-4 border-white" />
                        <div className="hidden md:block h-16 w-px bg-gray-200"></div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-[0.4em] text-ivoire-dark/80">Manuel d&apos;utilisation v1.1</span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                Avril 2026 • Validé
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase leading-[1.1] print:text-5xl print:text-black">
                        Application <span className="text-ivoire-dark print:text-black">QAPRIL</span>
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl max-w-3xl font-medium leading-relaxed mb-8 print:text-black">
                        Quittancement Autonome et Plateforme des Ressources Immobilières Locatives. <br className="hidden md:block print:hidden"/>
                        Ce manuel est rédigé en français simple avec chaque action expliquée étape par étape.
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 print:hidden">
                        <div className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-3">
                            <Smartphone className="text-gray-400" size={20} />
                            <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                                Android · Web · WhatsApp · USSD
                            </span>
                        </div>
                        <div className="flex items-center gap-3 bg-ivoire-dark/5 border border-ivoire-dark/10 rounded-2xl px-5 py-3 text-ivoire-dark">
                             <ShieldCheck size={20} />
                             <span className="text-[11px] font-black uppercase tracking-widest">Manuel Officiel v1.1</span>
                        </div>
                        <button 
                            onClick={() => window.print()}
                            className="flex items-center gap-3 px-6 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-ivoire-dark transition-all shadow-lg hover:scale-105 active:scale-95 uppercase text-[11px] tracking-[0.1em] ml-auto md:ml-0"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Version PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 print:gap-0">
                {/* Table of Contents - Sidebar */}
                <div className="lg:w-1/4 shrink-0 print:hidden">
                    <div className="sticky top-24 bg-white/60 border border-white/80 p-6 rounded-3xl shadow-lg backdrop-blur-md">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Book size={18} className="text-ivoire-dark" /> Sommaire
                        </h3>
                        <nav className="space-y-1">
                            {[
                                { id: "section-1", title: "1. Qu'est-ce que QAPRIL ?", icon: <Info size={16} /> },
                                { id: "section-2", title: "2. S'inscrire sur QAPRIL", icon: <CheckCircle size={16} /> },
                                { id: "section-3", title: "3. Guide Propriétaire & Vault", icon: <Home size={16} /> },
                                { id: "section-4", title: "4. Guide Locataire & Passeport", icon: <Key size={16} /> },
                                { id: "section-5", title: "5. Abonnements & Utilités", icon: <Wifi size={16} /> },
                                { id: "section-6", title: "6. Agences & Agents", icon: <Building size={16} /> },
                                { id: "section-7", title: "7. Le Portail Diaspora", icon: <Globe size={16} /> },
                                { id: "section-8", title: "8. Paiement Autonome", icon: <Zap size={16} /> },
                                { id: "section-9", title: "9. Glossaire", icon: <BookOpen size={16} /> }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                                        activeSection === item.id 
                                        ? "bg-ivoire-dark text-white shadow-md font-bold" 
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className={`${activeSection === item.id ? "text-white/80" : "text-gray-400"}`}>
                                        {item.icon}
                                    </span>
                                    {item.title}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:w-3/4 space-y-16 print:w-full print:space-y-10">
                    
                    {/* SECTION 1 */}
                    <div id="section-1" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">1. Qu&apos;est-ce que QAPRIL ?</h2>
                        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8 print:text-black">
                            <p className="print:text-black">QAPRIL est une application numérique Fintech qui permet aux propriétaires et locataires de gérer leurs locations de façon simple, sécurisée et autonome en Côte d&apos;Ivoire.</p>
                            
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 print:mt-4 print:text-lg text-black">1.1 Ce que QAPRIL fait pour vous</h3>
                                <div className="overflow-x-auto print:overflow-visible">
                                    <table className="min-w-full text-sm text-left text-gray-600 border border-gray-100 rounded-xl overflow-hidden print:border-collapse print:border-gray-300">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-black print:bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 border-b print:border-gray-300">Si vous êtes...</th>
                                                <th className="px-6 py-4 border-b print:border-gray-300">QAPRIL vous permet de...</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white border-b">
                                                <td className="px-6 py-4 font-bold text-gray-900">Propriétaire bailleur</td>
                                                <td className="px-6 py-4">Sécuriser les cautions (Vault) · Générer des quittances automatiques par Mobile Money · Gérer les incidents de la maison</td>
                                            </tr>
                                            <tr className="bg-gray-50 border-b">
                                                <td className="px-6 py-4 font-bold text-gray-900">Locataire</td>
                                                <td className="px-6 py-4">Bâtir un Passeport Locatif (Score ICL) · S'abonner à Orange/MTN/Moov/Canal+ · Signaler des pannes en un clic</td>
                                            </tr>
                                            <tr className="bg-white border-b">
                                                <td className="px-6 py-4 font-bold text-gray-900">Investisseur Diaspora</td>
                                                <td className="px-6 py-4">Déléguer la gestion en formule VIP · Obtenir des inspections vidéo · Suivre les rapports financiers mensuels</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2 */}
                    <div id="section-2" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">2. S&apos;inscrire sur QAPRIL</h2>
                        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8 print:text-black">
                            <p className="print:text-black">L&apos;inscription est gratuite. Vous avez besoin uniquement de votre numéro de téléphone ivoirien.</p>
                            
                            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle size={20} className="text-ivoire-dark" />
                                    2.1 Inscription Mobile ou Web
                                </h3>
                                <ul className="space-y-3 font-medium text-sm">
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-0.5" size={18} /> 1. Entrez votre numéro de téléphone (10 chiffres)</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-0.5" size={18} /> 2. Recevez et entrez le code SMS (OTP)</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-0.5" size={18} /> 3. Remplissez le KYC (Pièce d'identité) pour activer la certification des quittances</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3 */}
                    <div id="section-3" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">3. Guide du Propriétaire & Vault Caution</h2>
                        <div className="space-y-10 text-gray-600 print:text-black">
                            
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">3.1 Le Séquestre (Vault Caution)</h3>
                                <p className="text-sm mb-4 leading-relaxed">Fini les litiges de fin de bail. QAPRIL dispose d'un coffre numérique adossé à la CDC-CI pour sécuriser les cautions.</p>
                                <ul className="space-y-2 text-sm font-medium mb-6">
                                    <li className="flex gap-3"><Lock className="shrink-0 text-emerald-500 mt-1" size={16} /> Allez dans <strong>Vault Caution</strong></li>
                                    <li className="flex gap-3"><Lock className="shrink-0 text-emerald-500 mt-1" size={16} /> Cliquez sur <strong>Consigner</strong> pour bloquer l'argent perçu du locataire.</li>
                                    <li className="flex gap-3"><Lock className="shrink-0 text-emerald-500 mt-1" size={16} /> Le locataire reçoit une preuve de consignation hachée.</li>
                                    <li className="flex gap-3"><Lock className="shrink-0 text-emerald-500 mt-1" size={16} /> À son départ, un clic sur <strong>Restituer</strong> libère l'argent sur son Wave/MoMo.</li>
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">3.2 Répartition des factures (CIE/SODECI)</h3>
                                <p className="text-sm">Pour les cours communes, QAPRIL calcule la quote-part de chaque locataire en fonction des Millièmes, de la superficie ou d'un forfait.</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4 */}
                    <div id="section-4" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">4. Guide du Locataire & Passeport</h2>
                        <div className="space-y-8 text-gray-600 text-sm leading-relaxed print:text-black">
                            
                            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 text-ivoire-dark">4.1 Le Passeport Locatif</h3>
                                <p>C'est votre CV Immobilier (Indice de Confiance Locative). Plus vous payez vos loyers à l'heure, plus votre <strong>Score ICL</strong> monte. Vous pouvez générer un passeport PDF avec un QR Code pour prouver à un futur bailleur que vous êtes fiable.</p>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 text-ivoire-dark">4.2 Signalements d'Incidents</h3>
                                <p>Un robinet fuit ? Ne harcelez plus votre propriétaire sur WhatsApp. Allez dans <strong>Signalements</strong>, prenez 2 photos, indiquez le niveau d'urgence (Normal, Urgent, Très Urgent). Le propriétaire reçoit une carte d'incident et la transmet à son plombier.</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5 */}
                    <div id="section-5" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">5. Abonnements Internet & Utilités</h2>
                        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8 print:text-black">
                            <p className="print:text-black">QAPRIL connecte directement la maison aux opérateurs nationaux. Fini les files d'attente en agence.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-white border border-gray-100 rounded-xl">
                                    <div className="font-bold text-orange-500 mb-2 flex items-center gap-2"><Wifi size={18}/> Orange Fibre / MTN / Moov</div>
                                    <p className="text-sm">Demandez votre box internet au moment de l'emménagement. Le contrat de bail numérique sert de justificatif de domicile.</p>
                                </div>
                                <div className="p-6 bg-white border border-gray-100 rounded-xl">
                                    <div className="font-bold text-blue-600 mb-2 flex items-center gap-2"><Zap size={18}/> CIE / SODECI / Canal+</div>
                                    <p className="text-sm">Transfert d'abonnement ou demande de nouveau compteur sans vous déplacer.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6 */}
                    <div id="section-6" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">6. Agences & Agents</h2>
                        <p className="text-gray-600 mb-6">Les agences immobilières bénéficient du mode <strong>Syndic de Copropriété</strong>, permettant d'agréger plusieurs propriétaires, de voter des budgets et de gérer les millièmes.</p>
                    </div>

                    {/* SECTION 7 */}
                    <div id="section-7" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">7. Le Portail Diaspora</h2>
                        <div className="p-6 bg-ivoire-dark/5 border border-ivoire-dark/20 rounded-2xl">
                            <h3 className="font-bold text-ivoire-dark mb-2">Formule "Sérénité" ou "VIP"</h3>
                            <p className="text-sm text-gray-700">Pour les Ivoiriens de la diaspora, QAPRIL assigne un gestionnaire terrain en Côte d'Ivoire. Vous avez accès à un tableau de bord VIP avec : rapports financiers mensuels automatisés, demande d'inspection vidéo des biens, et messagerie WhatsApp prioritaire.</p>
                        </div>
                    </div>

                    {/* SECTION 8 */}
                    <div id="section-8" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">8. Paiement Autonome (Open Banking)</h2>
                        <p className="text-gray-600 mb-4">Le <strong>cerveau Fintech</strong> de QAPRIL.</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            Le locataire paie son loyer depuis son application <strong>Wave CI</strong> ou <strong>Orange Money</strong>. 
                            Instantanément, QAPRIL capte le paiement (Webhook API), marque la quittance comme PAYÉE, génère un sceau cryptographique SHA-256, déduit la commission, crédite le Wallet du propriétaire, et augmente le score de confiance du locataire. 
                            <strong>Le tout en 1 seconde, sans aucune intervention humaine.</strong>
                        </p>
                    </div>

                    {/* SECTION 9 */}
                    <div id="section-9" className="bg-ivoire-dark text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl scroll-mt-24 print:bg-transparent print:shadow-none print:text-black print:p-0 print:m-0">
                        <h2 className="text-3xl font-black tracking-tighter mb-8 uppercase print:text-2xl print:text-gray-900 print:mb-4">9. Glossaire Exclusif</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:text-black">
                            {[
                                { t: "Webhook", d: "Pont numérique qui connecte QAPRIL à Wave/Orange Money pour l'automatisation." },
                                { t: "Passeport Locatif", d: "CV Immobilier du locataire. Prouve sa fiabilité." },
                                { t: "Vault", d: "Le coffre-fort numérique de séquestration des cautions locatives." },
                                { t: "ICL", d: "Indice de Confiance Locative (Score de 0 à 1000)." },
                                { t: "Diaspora VIP", d: "Service de gestion locative avec inspection vidéo à distance." },
                                { t: "SHA-256", d: "Code de sécurité cryptographique garantissant l'intégrité absolue d'une quittance." },
                            ].map((item, i) => (
                                <div key={i} className="border-b border-white/20 pb-4 print:border-gray-200 print:break-inside-avoid">
                                    <h4 className="font-bold mb-1 text-white print:text-gray-900">{item.t}</h4>
                                    <p className="text-white/80 text-sm leading-relaxed print:text-gray-600">{item.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-20 text-center text-gray-400 text-xs font-medium uppercase tracking-[0.2em]">
                QAPRIL — Manuel d&apos;utilisation v1.1 — Avril 2026<br />
                support.qapril.ci · Abidjan, Côte d&apos;Ivoire
            </div>
        </div>
    )
}
