"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
    BookOpen, 
    ShieldCheck, 
    Smartphone,
    Download,
    CheckCircle,
    Info,
    ChevronRight,
    Users,
    Home,
    FileText,
    HelpCircle,
    Book,
    Key,
    Briefcase,
    Building,
    FileCheck
} from "lucide-react"

export default function AdminManualPage() {
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
                        /* Force page breaks before major sections */
                        h2 { page-break-before: always; break-before: page; margin-top: 0 !important; }
                        /* Except the first one */
                        #section-1 h2 { page-break-before: avoid; break-before: auto; }
                    }
                `}} />
                
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none print:hidden">
                    <BookOpen size={240} className="text-ivoire-dark" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left print:text-black">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                        {/* We use standard img to avoid ProtectedLogo complex dependencies in case it's not adapted, but ProtectedLogo was used before so let's stick to standard img for simplicity here if ProtectedLogo is missing props or just standard img */}
                        <img src="/logo.png" alt="QAPRIL" className="h-20 w-auto rounded-3xl shadow-xl border-4 border-white" />
                        <div className="hidden md:block h-16 w-px bg-gray-200"></div>
                        <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-[0.4em] text-ivoire-dark/80">Manuel d'utilisation v1.0</span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                Mars 2026 • Validé
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
                             <span className="text-[11px] font-black uppercase tracking-widest">Manuel Officiel</span>
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
                                { id: "section-3", title: "3. Guide du Propriétaire", icon: <Home size={16} /> },
                                { id: "section-4", title: "4. Guide du Locataire", icon: <Key size={16} /> },
                                { id: "section-5", title: "5. Guide de l'Agent", icon: <Briefcase size={16} /> },
                                { id: "section-6", title: "6. Guide de l'Agence", icon: <Building size={16} /> },
                                { id: "section-7", title: "7. Les Quittances", icon: <FileText size={16} /> },
                                { id: "section-8", title: "8. Module M17 DGI", icon: <FileCheck size={16} /> },
                                { id: "section-9", title: "9. Questions Fréquentes", icon: <HelpCircle size={16} /> },
                                { id: "section-10", title: "10. Glossaire", icon: <BookOpen size={16} /> }
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
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">1. Qu'est-ce que QAPRIL ?</h2>
                        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8 print:text-black">
                            <p className="print:text-black">QAPRIL est une application numérique qui permet aux propriétaires et locataires de gestion leurs locations de façon simple, sécurisée et officielle en Côte d'Ivoire.</p>
                            
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
                                                <td className="px-6 py-4">Enregistrer vos locataires · Générer des quittances officielles automatiques · Suivre vos paiements · Gérer vos cours communes et appartements</td>
                                            </tr>
                                            <tr className="bg-gray-50 border-b">
                                                <td className="px-6 py-4 font-bold text-gray-900">Locataire</td>
                                                <td className="px-6 py-4">Recevoir votre quittance par SMS après chaque paiement · Consulter votre historique · Construire un dossier de crédit · Prouver votre domicile</td>
                                            </tr>
                                            <tr className="bg-white border-b">
                                                <td className="px-6 py-4 font-bold text-gray-900">Agent immobilier</td>
                                                <td className="px-6 py-4">Gérer les biens de vos clients · Enregistrer des baux · Suivre les paiements · Déclencher les relances automatiquement</td>
                                            </tr>
                                            <tr className="bg-gray-50">
                                                <td className="px-6 py-4 font-bold text-gray-900">Responsable d'agence</td>
                                                <td className="px-6 py-4">Piloter tout votre portefeuille · Tableau de bord complet · Rapports automatiques · Gestion des équipes terrain</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="print:break-inside-avoid">
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4 print:mt-6 print:text-lg">1.2 Les canaux d'accès</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
                                    <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
                                        <div className="font-bold text-gray-900 mb-1">📱 Application Android</div>
                                        <p className="text-sm">Télécharger QAPRIL sur Google Play Store · Chercher 'QAPRIL CI'</p>
                                        <div className="mt-2 text-xs font-bold text-ivoire-dark uppercase">Propriétaires · Agents · Agences</div>
                                    </div>
                                    <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
                                        <div className="font-bold text-gray-900 mb-1">💻 Site Web</div>
                                        <p className="text-sm">Ouvrir qapril.ci dans votre navigateur</p>
                                        <div className="mt-2 text-xs font-bold text-ivoire-dark uppercase">Tous les profils</div>
                                    </div>
                                    <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
                                        <div className="font-bold text-gray-900 mb-1">💬 WhatsApp</div>
                                        <p className="text-sm">Enregistrer le numéro QAPRIL et envoyer un message</p>
                                        <div className="mt-2 text-xs font-bold text-ivoire-dark uppercase">Propriétaires (création rapide)</div>
                                    </div>
                                    <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
                                        <div className="font-bold text-gray-900 mb-1">📞 USSD *144#</div>
                                        <p className="text-sm">Composer *144*PSDP# depuis n'importe quel téléphone</p>
                                        <div className="mt-2 text-xs font-bold text-ivoire-dark uppercase">Locataires</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2 */}
                    <div id="section-2" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">2. S'inscrire sur QAPRIL</h2>
                        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-8 print:text-black">
                            <p className="print:text-black">L'inscription est gratuite. Vous avez besoin uniquement de votre numéro de téléphone ivoirien.</p>
                            
                            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle size={20} className="text-ivoire-dark" />
                                    2.1 Inscription depuis l'application Android
                                </h3>
                                <ul className="space-y-3 font-medium text-sm">
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-0.5" size={18} /> 1. Ouvrez l'application QAPRIL sur votre téléphone Android</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-0.5" size={18} /> 2. Appuyez sur 'Créer un compte'</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-0.5" size={18} /> 3. Entrez votre numéro de téléphone Orange, MTN, Wave ou Moov (10 chiffres)</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-0.5" size={18} /> 4. Vous recevez un code SMS à 6 chiffres — entrez-le dans l'application</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-0.5" size={18} /> 5. Choisissez votre profil : Propriétaire · Locataire · Agent · Agence</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-0.5" size={18} /> 6. Entrez votre nom et prénom complets</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-0.5" size={18} /> 7. Appuyez sur 'Valider' — votre compte est créé</li>
                                </ul>
                                <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm font-medium flex gap-3 items-start print:border print:border-blue-200">
                                    <Info className="shrink-0 mt-0.5" size={18} />
                                    <p>Astuce : Vous n'avez pas besoin de mot de passe — QAPRIL utilise votre numéro de téléphone et un code SMS pour vous identifier. C'est plus simple et plus sécurisé.</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2.2 Compléter votre profil KYC</h3>
                                <p className="mb-4 text-sm">Pour bénéficier de toutes les fonctionnalités — notamment émettre des quittances officielles — vous devez compléter votre identité.</p>
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-2xl bg-white shrink-0">
                                        <div className="font-bold text-gray-900 w-1/3">Photo CNI / ID</div>
                                        <div className="text-sm w-1/2">CNI · Passeport · Carte de résident · Attestation</div>
                                        <div className="text-xs font-bold text-ivoire-dark uppercase w-1/3 sm:text-right">Émettre quittances</div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-2xl bg-white shrink-0">
                                        <div className="font-bold text-gray-900 w-1/3">Selfie avec ID</div>
                                        <div className="text-sm w-1/2">Selfie avec pièce visible</div>
                                        <div className="text-xs font-bold text-ivoire-dark uppercase w-1/3 sm:text-right">Vérification identité</div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-100 rounded-2xl bg-white shrink-0">
                                        <div className="font-bold text-gray-900 w-1/3">Téléphone actif CI</div>
                                        <div className="text-sm w-1/2">Format : 07 XX XX XX XX</div>
                                        <div className="text-xs font-bold text-ivoire-dark uppercase w-1/3 sm:text-right">Obligatoire tous services</div>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm italic">Le KYC (vérification d'identité) est progressif. Vous pouvez commencer à utiliser QAPRIL avec le minimum, et compléter votre profil plus tard...</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3 */}
                    <div id="section-3" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">3. Guide du Propriétaire Bailleur</h2>
                        <div className="space-y-10 text-gray-600 print:text-black">
                            
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">3.1 Ajouter un logement</h3>
                                <ul className="space-y-2 text-sm font-medium">
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 1. Dans le menu principal, appuyez sur 'Mes biens' puis 'Ajouter un logement'</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 2. Choisissez le type : Chambre · Appartement · Studio · Villa · Local commercial</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 3. Entrez l'adresse ou décrivez le logement (ex : 'Chambre 3 · Cour Bamba · Niangon')</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 4. Entrez le loyer mensuel en FCFA</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 5. Appuyez sur 'Enregistrer'</li>
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">3.2 Enregistrer un locataire — Bail formel</h3>
                                <p className="text-sm mb-4 leading-relaxed">Un bail formel est un contrat écrit entre vous et votre locataire. C'est la forme la plus protectrice — elle permet d'enregistrer le bail à la DGI et de démarrer les quittances officielles.</p>
                                <ul className="space-y-2 text-sm font-medium mb-6">
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 1. Allez dans 'Mes biens' · Sélectionnez le logement concerné</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 2. Appuyez sur 'Ajouter un locataire'</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 3. Entrez le nom complet et le numéro de téléphone du locataire</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 4. Entrez le montant du loyer mensuel</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 5. Choisissez la date d'entrée et la durée du bail</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 6. QAPRIL génère le bail automatiquement — appuyez sur 'Faire signer'</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 7. Le locataire reçoit un SMS pour signer électroniquement</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 8. Une fois signé des deux côtés : votre bail QAPRIL est actif</li>
                                </ul>

                                <div className="overflow-x-auto rounded-xl border border-gray-100">
                                    <table className="min-w-full text-xs text-left text-gray-600">
                                        <thead className="bg-gray-50 font-bold uppercase text-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 border-b">Tranche de loyer</th>
                                                <th className="px-4 py-3 border-b">Frais d'enregistrement bail</th>
                                                <th className="px-4 py-3 border-b">Frais de renouvellement</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-green-50/50 border-b"><td className="px-4 py-3 font-bold">Bail Déclaratif (cours communes)</td><td className="px-4 py-3 font-black text-green-600">GRATUIT</td><td className="px-4 py-3 font-black text-green-600">GRATUIT</td></tr>
                                            <tr className="border-b"><td className="px-4 py-3">Moins de 50 000 FCFA/mois</td><td className="px-4 py-3">3 000 FCFA TTC</td><td className="px-4 py-3">1 500 FCFA TTC</td></tr>
                                            <tr className="border-b"><td className="px-4 py-3">50 001 – 150 000 FCFA/mois</td><td className="px-4 py-3">5 000 FCFA TTC</td><td className="px-4 py-3">2 500 FCFA TTC</td></tr>
                                            <tr className="border-b"><td className="px-4 py-3">150 001 – 400 000 FCFA/mois</td><td className="px-4 py-3">8 000 FCFA TTC</td><td className="px-4 py-3">4 000 FCFA TTC</td></tr>
                                            <tr className="border-b"><td className="px-4 py-3">400 001 – 1 000 000 FCFA/mois</td><td className="px-4 py-3">15 000 FCFA TTC</td><td className="px-4 py-3">7 500 FCFA TTC</td></tr>
                                            <tr><td className="px-4 py-3">Plus de 1 000 000 FCFA/mois</td><td className="px-4 py-3">25 000 FCFA TTC</td><td className="px-4 py-3">12 500 FCFA TTC</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">3.3 Enregistrer un locataire — Bail Déclaratif BDQ</h3>
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm font-medium mb-4 flex gap-3">
                                    <Info className="shrink-0 mt-0.5" size={18} />
                                    <p>⚠️ Le Bail Déclaratif est GRATUIT toujours. Il protège vos deux intérêts mais ne remplace pas un bail signé complet. QAPRIL vous proposera de le formaliser après 3 mois si vous le souhaitez.</p>
                                </div>
                                <h4 className="font-bold text-gray-900 mt-6 mb-2">Option A — Via l'application</h4>
                                <ul className="space-y-2 text-sm font-medium">
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 1. Allez dans 'Mes biens' · Sélectionnez le logement · Appuyez sur 'Bail Déclaratif'</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 2. Entrez le nom du locataire et son téléphone</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 3. Entrez le montant du loyer et la date d'entrée approximative</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 4. QAPRIL envoie un SMS au locataire pour qu'il confirme</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 5. Dès sa réponse OUI : votre BDQ est créé — quittances activées automatiquement</li>
                                </ul>
                                <h4 className="font-bold text-gray-900 mt-6 mb-2">Option B — Via WhatsApp (plus simple pour les cours communes)</h4>
                                <p className="text-sm">Envoyez un message au numéro WhatsApp QAPRIL. L'assistant répond en français et vous guide en 5 questions.</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">3.5 Le Wallet QAPRIL</h3>
                                <p className="text-sm mb-4">Votre portefeuille interne pour payer les frais de service (quittances, enregistrement) sans transfert Mobile Money à chaque fois.</p>
                                <ul className="space-y-2 text-sm font-medium mb-6">
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 1. Dans le menu, appuyez sur 'Mon Wallet' et 'Recharger'</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 2. Choisissez le montant (min 1 000 FCFA) et votre réseau (Wave, Orange, etc.)</li>
                                    <li className="flex gap-3"><ChevronRight className="shrink-0 text-ivoire-dark mt-1" size={16} /> 3. Confirmez le paiement sur votre téléphone</li>
                                </ul>
                                <div className="p-4 bg-green-50 text-green-800 rounded-xl text-sm font-medium flex gap-3">
                                    <CheckCircle className="shrink-0 mt-0.5" size={18} />
                                    <p>✅ Conseil : rechargez 5 000 FCFA une fois par trimestre pour couvrir vos quittances sans y penser. QAPRIL vous alerte par SMS quand votre Wallet est bas.</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* SECTION 4 LOCATAIRE */}
                    <div id="section-4" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:shadow-none print:border-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase print:text-2xl print:mb-4">4. Guide du Locataire</h2>
                        <div className="space-y-8 text-gray-600 text-sm leading-relaxed print:text-black">
                            <p className="text-lg font-medium text-gray-900">En tant que locataire, QAPRIL est entièrement GRATUIT. Vous ne payez rien pour recevoir vos quittances ou consulter votre historique.</p>

                            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 text-ivoire-dark">4.1 Recevoir votre quittance</h3>
                                <p>Vous n'avez rien à faire. Quand votre propriétaire enregistre votre paiement, vous recevez automatiquement votre quittance par SMS avec un lien vers le PDF certifié.</p>
                                <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-xl font-medium flex gap-3">
                                    <Info className="shrink-0 mt-0.5" size={18} />
                                    <p>Astuce : Gardez vos SMS QAPRIL. Ils constituent une preuve légale de vos paiements. En cas de litige, le SMS fait foi.</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 text-ivoire-dark">4.2 Consulter son historique sans internet (USSD)</h3>
                                <ul className="space-y-2 font-medium">
                                    <li>Depuis tout téléphone, composez : <strong>*144*PSDP#</strong> puis Appel</li>
                                    <li>1 pour voir si vous devez un loyer</li>
                                    <li>2 pour voir vos 5 dernières quittances</li>
                                    <li>3 pour signaler un problème</li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 text-ivoire-dark">4.3 Votre score locatif QAPRIL</h3>
                                <p className="mb-4">Après 6 mois de paiements réguliers dans QAPRIL, vous construisez un score de fiabilité locative qui vous ouvre des portes (crédits, etc.).</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white border border-gray-100 rounded-xl"><div className="font-bold text-green-600">A — Excellent (800–1000)</div>Crédit bancaire sans garantie jusqu'à 500K.</div>
                                    <div className="p-4 bg-white border border-gray-100 rounded-xl"><div className="font-bold text-blue-600">B — Bon (600–799)</div>Crédit avec garantie partielle.</div>
                                    <div className="p-4 bg-white border border-gray-100 rounded-xl"><div className="font-bold text-orange-500">C — Moyen (400–599)</div>Certificat de domicile QAPRIL.</div>
                                    <div className="p-4 bg-white border border-gray-100 rounded-xl"><div className="font-bold text-gray-500">D — En construction (&lt;400)</div>Continuez à payer régulièrement.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5, 6, 7, 8 MINI */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:space-y-8">
                        <div id="section-5" className="bg-white/70 border border-white/80 p-8 rounded-[2rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:border-none print:shadow-none print:p-0 print:m-0">
                            <h2 className="text-xl font-black text-gray-900 mb-4 uppercase flex items-center gap-2 print:text-2xl print:mb-4">
                                <Briefcase className="text-ivoire-dark print:hidden"/> 5. Guide Agent
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4 print:text-black">L'application Android Agent fonctionne offline. Saisissez baux et confirmations terrain, tout se synchronise dès que le réseau revient.</p>
                            <p className="text-sm text-gray-600 font-bold mb-2">Commissions Agent :</p>
                            <ul className="text-sm text-gray-600 space-y-1 ml-4 border-l-2 border-ivoire-dark/30 pl-3">
                                <li>Enregistrement bail : 1 000 FCFA</li>
                                <li>Confirmation BDQ : 250 FCFA</li>
                                <li>Formalisation BDQ : 500 FCFA</li>
                            </ul>
                        </div>

                        <div id="section-6" className="bg-white/70 border border-white/80 p-8 rounded-[2rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:border-none print:shadow-none print:p-0 print:m-0 print:break-inside-avoid">
                            <h2 className="text-xl font-black text-gray-900 mb-4 uppercase flex items-center gap-2 print:text-2xl print:mb-4">
                                <Building className="text-ivoire-dark print:hidden"/> 6. Guide Agence
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4 print:text-black">Des abonnements adaptés à votre taille, de gratuit à PRO (15 000 FCFA/mois) avec quittances illimitées.</p>
                            <p className="text-sm text-gray-600 leading-relaxed">Possibilité de migrer vos données existantes via un tableau Excel QAPRIL (gratuit pour membres CDAIM).</p>
                        </div>
                    </div>

                    <div id="section-7" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:border-none print:shadow-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-6 uppercase flex items-center gap-3 print:text-2xl print:mb-4">
                            <FileText className="text-ivoire-dark print:hidden" size={32} /> 7. Réception des Quittances & Notifications
                        </h2>
                        <div className="space-y-6 print:text-black">
                            <p className="text-gray-600 leading-relaxed print:text-black">Une quittance QAPRIL est un document numérique certifié, impossible à falsifier grâce à un code de vérification SHA-256. N'importe qui peut vérifier son authenticité en scannant le QR code avec son téléphone.</p>
                            
                            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Canaux de Communication (Architecture Multi-Canal)</h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                                <table className="min-w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-black">
                                        <tr>
                                            <th className="px-6 py-4 border-b">Vous recevez vos quittances et alertes sur...</th>
                                            <th className="px-6 py-4 border-b">Comment activer</th>
                                            <th className="px-6 py-4 border-b">Gratuité</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-white border-b">
                                            <td className="px-6 py-4 font-bold text-gray-900">📱 SMS</td>
                                            <td className="px-6 py-4">Automatique dès l'inscription — aucune action requise</td>
                                            <td className="px-6 py-4 font-bold text-green-600">✓ Toujours</td>
                                        </tr>
                                        <tr className="bg-gray-50 border-b">
                                            <td className="px-6 py-4 font-bold text-gray-900">💬 WhatsApp</td>
                                            <td className="px-6 py-4">Paramètres → Notifications → WhatsApp → Entrer votre numéro WA → Confirmer avec le code reçu</td>
                                            <td className="px-6 py-4 font-bold text-green-600">✓ Toujours</td>
                                        </tr>
                                        <tr className="bg-white border-b">
                                            <td className="px-6 py-4 font-bold text-gray-900">✉️ Email</td>
                                            <td className="px-6 py-4">Paramètres → Notifications → Email → Entrer votre email → Cliquer sur le lien de vérification</td>
                                            <td className="px-6 py-4 text-xs">✓ Si abonnement Pro+ <br /> · Optionnel sinon</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <td className="px-6 py-4 font-bold text-gray-900">🔔 Notifications app (Push)</td>
                                            <td className="px-6 py-4">Autoriser les notifications quand l'application le demande lors de l'installation</td>
                                            <td className="px-6 py-4 font-bold text-green-600">✓ Toujours</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="p-4 bg-green-50 text-green-800 rounded-xl text-sm font-medium flex gap-3 mt-6">
                                <CheckCircle className="shrink-0 mt-0.5" size={18} />
                                <p>✅ <strong>Conseil terrain pour les agents QAPRIL Champions :</strong> demander systématiquement au propriétaire lors de l'enregistrement du bail s'il a WhatsApp et s'il veut activer les notifications WA. La grande majorité des propriétaires de cours communes utilisent WhatsApp quotidiennement — c'est le canal le plus efficace.</p>
                            </div>
                        </div>
                    </div>

                    <div id="section-8" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:border-none print:shadow-none print:p-0 print:m-0 print:break-inside-avoid">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-6 uppercase flex items-center gap-3 print:text-2xl print:mb-4">
                            <FileCheck className="text-ivoire-dark print:hidden" size={32} /> 8. Module M17 DGI
                        </h2>
                        <p className="text-gray-600 leading-relaxed print:text-black">Enregistrement de votre bail à la Direction Générale des Impôts. Facultatif mais recommandé. Le paiement des frais DGI et des frais de service QAPRIL (ex: 3000 FCFA pour loyer &lt; 50k) est intégré, le récépissé est obtenu en 48-72h.</p>
                    </div>

                    {/* SECTION 9 */}
                    <div id="section-9" className="bg-white/70 border border-white/80 p-8 md:p-12 rounded-[2.5rem] shadow-xl backdrop-blur-md scroll-mt-24 print:bg-transparent print:border-none print:shadow-none print:p-0 print:m-0">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-8 uppercase flex items-center gap-3 print:text-2xl print:mb-4">
                            <HelpCircle className="text-ivoire-dark print:hidden" size={32} /> 9. Questions Fréquentes
                        </h2>
                        <div className="space-y-6 print:space-y-4">
                            {[
                                { q: "Est-ce que QAPRIL est légal ?", a: "Oui. Conforme à la loi n°2018-575 du 13 juin 2018. Les quittances sont valables devant les tribunaux." },
                                { q: "Le locataire doit-il payer ?", a: "Non, réception, historique et score sont entièrement gratuits pour le locataire." },
                                { q: "Si le locataire n'a pas de smartphone ?", a: "Il est alerté par SMS basique et peut utiliser l'USSD *144*PSDP#." },
                                { q: "Que se passe-t-il si mon Wallet QAPRIL est vide ?", a: "QAPRIL émet vos quittances en mode crédit jusqu'à -1500 FCFA, puis suspend les émissions." },
                                { q: "Le BDQ a-t-il la même valeur qu'un bail signé ?", a: "Non. Le Bail Déclaratif QAPRIL a valeur de commencement de preuve, opposable en médiation mais moins fort qu'un bail complet." },
                            ].map((faq, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 text-lg mb-2">{faq.q}</h4>
                                    <p className="text-gray-600 text-sm">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 10 */}
                    <div id="section-10" className="bg-ivoire-dark text-white p-8 md:p-12 rounded-[2.5rem] shadow-xl scroll-mt-24 print:bg-transparent print:shadow-none print:text-black print:p-0 print:m-0">
                        <h2 className="text-3xl font-black tracking-tighter mb-8 uppercase print:text-2xl print:text-gray-900 print:mb-4">10. Glossaire Exclusif</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:text-black">
                            {[
                                { t: "BDQ", d: "Bail Déclaratif QAPRIL. Créé en 5 min sans contrat écrit. Gratuit." },
                                { t: "Wallet QAPRIL", d: "Porte-monnaie interne (rechargeable via mobile money)." },
                                { t: "KYC", d: "Know Your Customer - vérification d'identité via photo." },
                                { t: "Score Locatif", d: "Note (0-1000) mesurant la fiabilité de paiement d'un locataire." },
                                { t: "CLN", d: "Certificat Locatif Numérique - attestation de domicile QAPRIL." },
                                { t: "SHA-256", d: "Code de sécurité cryptographique garantissant l'intégrité d'une quittance." },
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
                QAPRIL — Manuel d'utilisation v1.0 — Mars 2026<br />
                support.qapril.ci · Abidjan, Côte d'Ivoire
            </div>
        </div>
    )
}
