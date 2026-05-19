"use client"

import React, { useState, useTransition } from "react"
import { useSession } from "next-auth/react"
import { Search, MapPin, DollarSign, Building2, Ruler, Bed, Home, CheckCircle, ArrowUpRight, X, Sparkles, Filter, Phone, Briefcase, FileText } from "lucide-react"
import { toast } from "sonner"
import { soumettreCandidat } from "@/actions/annonce.actions"
import { getPublicMarketplaceAnnonces } from "@/actions/marketplace-actions"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function MarketplaceTenantClient({ initialAnnonces }: { initialAnnonces: any[] }) {
    const { data: session } = useSession()
    const [annonces, setAnnonces] = useState<any[]>(initialAnnonces)
    const [isPending, startTransition] = useTransition()

    // Filters
    const [communeFilter, setCommuneFilter] = useState<string>("Toutes")
    const [maxPriceFilter, setMaxPriceFilter] = useState<number>(1000000)

    // Modal state
    const [selectedAnnonce, setSelectedAnnonce] = useState<any>(null)
    
    // Candidature form state
    const [nom, setNom] = useState<string>("")
    const [prenom, setPrenom] = useState<string>("")
    const [telephone, setTelephone] = useState<string>("")
    const [revenuMensuel, setRevenuMensuel] = useState<string>("")
    const [employeur, setEmployeur] = useState<string>("")
    const [isApplying, setIsApplying] = useState<boolean>(false)

    const handleOpenApplyModal = (annonce: any) => {
        setSelectedAnnonce(annonce);
        if (session?.user) {
            const full = session.user.name || "";
            const parts = full.split(" ");
            setPrenom(parts[0] || "");
            setNom(parts.slice(1).join(" ") || "Locataire");
            setTelephone((session.user as any).phone || "");
        }
        setIsApplying(true);
    };

    const handleApplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nom || !prenom || !telephone || !revenuMensuel) {
            toast.error("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        startTransition(async () => {
            try {
                await soumettreCandidat({
                    logementId: selectedAnnonce.logementId || selectedAnnonce.logement?.id,
                    candidatId: session?.user?.id,
                    nom,
                    prenom,
                    telephone,
                    revenuMensuel: parseFloat(revenuMensuel),
                    employeur
                });
                toast.success("Félicitations ! Votre candidature a été transmise au propriétaire avec succès.");
                setIsApplying(false);
                setSelectedAnnonce(null);
            } catch (err: any) {
                toast.error("Erreur lors de l'envoi de votre candidature.");
            }
        });
    };

    const handleFilterChange = async (commune: string, maxP: number) => {
        setCommuneFilter(commune);
        setMaxPriceFilter(maxP);
        startTransition(async () => {
            const data = await getPublicMarketplaceAnnonces({
                commune: commune === "Toutes" ? undefined : commune,
                maxPrice: maxP === 1000000 ? undefined : maxP
            });
            setAnnonces(data);
        });
    };

    const communesList = ["Toutes", "Cocody", "Marcory", "Plateau", "Treichville", "Yopougon", "Bingerville", "Koumassi", "Abobo"];

    return (
        <div className="space-y-10 animate-fade-in">
            {/* HERO BANNER */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-12 text-white overflow-hidden shadow-2xl border border-white/10">
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-rose-300 uppercase tracking-widest mb-6 shadow-inner">
                        <Sparkles size={14} /> Logements certifiés & garantis
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none mb-4">
                        Découvrez le catalogue exclusif des propriétaires QAPRIL.
                    </h1>
                    <p className="text-sm md:text-base font-medium text-slate-300 leading-relaxed">
                        Chaque bien listé ici a été rigoureusement vérifié. Profitez d'une procédure de location transparente et déposez votre dossier en un seul clic avec votre profil de confiance.
                    </p>
                </div>
            </div>

            {/* BARRE DE RECHERCHE & FILTRES */}
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-1.5">
                        <MapPin size={14} className="text-rose-500" /> Commune
                    </label>
                    <select
                        value={communeFilter}
                        onChange={(e) => handleFilterChange(e.target.value, maxPriceFilter)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                        {communesList.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block flex items-center gap-1.5">
                        <DollarSign size={14} className="text-emerald-500" /> Budget Maximum
                    </label>
                    <select
                        value={maxPriceFilter}
                        onChange={(e) => handleFilterChange(communeFilter, Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                        <option value={1000000}>Tous les prix</option>
                        <option value={200000}>Moins de 200 000 FCFA</option>
                        <option value={400000}>Moins de 400 000 FCFA</option>
                        <option value={600000}>Moins de 600 000 FCFA</option>
                        <option value={800000}>Moins de 800 000 FCFA</option>
                    </select>
                </div>

                <div className="flex items-end">
                    <div className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-center">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-600 block">Biens Disponibles</span>
                        <span className="text-2xl font-black text-indigo-950">{annonces.length} logements</span>
                    </div>
                </div>
            </div>

            {/* GRILLE DES ANNONCES */}
            {isPending ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : annonces.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-slate-200 shadow-sm">
                    <Building2 size={48} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Aucun logement trouvé</h3>
                    <p className="text-sm font-medium text-slate-500">Essayez de modifier vos filtres de commune ou de budget pour voir plus de résultats.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {annonces.map((annonce) => {
                        const logement = annonce.logement || {};
                        return (
                            <div key={annonce.id} className="bg-white rounded-[28px] shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200/80 overflow-hidden flex flex-col group">
                                <div className="h-56 bg-slate-100 relative overflow-hidden">
                                    <img 
                                        src={annonce.photosUrls?.[0] || logement.images?.[0]?.url || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80"}
                                        alt={annonce.titre}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <Badge color="emerald">Vérifié QAPRIL ✓</Badge>
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-black border border-white/20 shadow-md">
                                        {annonce.loyerDemande.toLocaleString()} FCFA / mois
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1 uppercase tracking-widest">
                                            <MapPin size={14}/> {logement.commune || 'Abidjan'} · {logement.propertyType || 'Appartement'}
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                            {annonce.titre}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500 line-clamp-2 mt-1">
                                            {annonce.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <Bed size={14} className="text-slate-400"/> {logement.rooms || 3} pièces
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Ruler size={14} className="text-slate-400"/> {logement.superficieM2 || 85} m²
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleOpenApplyModal(annonce)}
                                        className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-widest py-3 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 group-hover:shadow-indigo-500/25"
                                    >
                                        Déposer mon dossier <ArrowUpRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL DE DEPOSIT DE CANDIDATURE */}
            {isApplying && selectedAnnonce && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
                        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-8 text-white relative">
                            <button 
                                onClick={() => setIsApplying(false)}
                                className="absolute top-6 right-6 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 block mb-1">Dossier de candidature</span>
                            <h3 className="text-2xl font-black line-clamp-1">{selectedAnnonce.titre}</h3>
                            <p className="text-sm font-semibold text-emerald-400 mt-1">
                                Loyer : {selectedAnnonce.loyerDemande.toLocaleString()} FCFA / mois
                            </p>
                        </div>

                        <form onSubmit={handleApplySubmit} className="p-8 space-y-6">
                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-3">
                                <CheckCircle size={24} className="text-indigo-600 flex-shrink-0" />
                                <p className="text-xs font-semibold text-indigo-950">
                                    En postulant, votre profil certifié QAPRIL (KYC, score de fiabilité) sera instantanément partagé avec le propriétaire pour accélérer la validation.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">Prénom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={prenom}
                                        onChange={(e) => setPrenom(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">Nom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={nom}
                                        onChange={(e) => setNom(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1 flex items-center gap-1"><Phone size={14} className="text-slate-400"/> Téléphone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={telephone}
                                        onChange={(e) => setTelephone(e.target.value)}
                                        placeholder="Ex: +225 0102030405"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1 flex items-center gap-1"><DollarSign size={14} className="text-slate-400"/> Revenu Mensuel (FCFA) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={revenuMensuel}
                                        onChange={(e) => setRevenuMensuel(e.target.value)}
                                        placeholder="Ex: 500000"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1 flex items-center gap-1"><Briefcase size={14} className="text-slate-400"/> Employeur / Profession</label>
                                <input
                                    type="text"
                                    value={employeur}
                                    onChange={(e) => setEmployeur(e.target.value)}
                                    placeholder="Ex: Société Générale / Ingénieur Informatique"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsApplying(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest py-3 rounded-2xl transition-colors text-center"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 text-center disabled:opacity-50"
                                >
                                    Transmettre mon dossier ✓
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
