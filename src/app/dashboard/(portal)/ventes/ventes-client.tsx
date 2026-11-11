"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Calculator, 
  Plus, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  FileCheck,
  Scale,
  Landmark,
  Coins,
  Compass,
  Zap,
  Info,
  X
} from "lucide-react";
import { 
  NATURES_TITRES, 
  ETAPES_PIPELINE, 
  NatureTitre, 
  CategorieBienVente, 
  StatutPipelineVente,
  calculerDecompteTransaction,
  getNiveauVerificationVente
} from "@/lib/transaction-rules";
import { createBienEtMandatVenteAction, avancerEtapePipelineAction } from "@/actions/transaction-actions";

export default function VentesClient({ 
  initialData, 
  user 
}: { 
  initialData: any; 
  user: any; 
}) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "biens" | "simulateur" | "mandats">("pipeline");
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Données du serveur
  const mandats = initialData?.mandats || [];
  const biensEnVente = initialData?.biensEnVente || [];
  const transactions = initialData?.transactions || [];
  const aggregates = initialData?.aggregates || {
    totalVolumeVenteFcfa: 0,
    mandatsActifsCount: 0,
    mandatsExclusifsCount: 0,
    transactionsEnCoursCount: 0,
    biensVerifiesAcdCount: 0,
    totalBiensEnVente: 0
  };

  // State simulateur fiscal
  const [simPrix, setSimPrix] = useState<number>(45000000);
  const [simCommissionPct, setSimCommissionPct] = useState<number>(5.0);
  const decompte = calculerDecompteTransaction(simPrix, simCommissionPct);

  // State formulaire nouveau mandat
  const [formData, setFormData] = useState({
    titreBien: "",
    categorieBienVente: "TERRAIN_URBAIN_NU" as CategorieBienVente,
    natureTitre: "ACD" as NatureTitre,
    numeroTitre: "",
    dateTitre: "",
    numeroLot: "",
    numeroIlot: "",
    superficieM2: 500,
    commune: "Cocody",
    quartier: "Angré",
    estViabilise: true,
    servitudesDeclarees: "",
    coordonneesGpsBornes: "",
    prixPresentationFcfa: 35000000,
    typeMandat: "EXCLUSIF" as "EXCLUSIF" | "SIMPLE",
    tauxCommissionPct: 5.0,
    dureeMois: 12
  });

  const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

  const handleSubmitMandat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setMessage(null);

    try {
      const res = await createBienEtMandatVenteAction({
        ...formData,
        superficieM2: Number(formData.superficieM2),
        prixPresentationFcfa: Number(formData.prixPresentationFcfa),
        tauxCommissionPct: Number(formData.tauxCommissionPct),
        dureeMois: Number(formData.dureeMois)
      });

      if (res.success) {
        setMessage({ type: "success", text: res.message });
        setModalOpen(false);
        // Reset form
        setFormData({
          titreBien: "",
          categorieBienVente: "TERRAIN_URBAIN_NU",
          natureTitre: "ACD",
          numeroTitre: "",
          dateTitre: "",
          numeroLot: "",
          numeroIlot: "",
          superficieM2: 500,
          commune: "Cocody",
          quartier: "Angré",
          estViabilise: true,
          servitudesDeclarees: "",
          coordonneesGpsBornes: "",
          prixPresentationFcfa: 35000000,
          typeMandat: "EXCLUSIF",
          tauxCommissionPct: 5.0,
          dureeMois: 12
        });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur lors de l'enregistrement du mandat" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAvancerPipeline = async (trxId: string, currentStep: StatutPipelineVente) => {
    const etapes: StatutPipelineVente[] = [
      "MANDAT", "PUBLIE", "VISITES", "OFFRE_ACCEPTEE", 
      "COMPROMIS_SIGNE", "CONDITIONS_EN_COURS", "ACTE_SIGNE", 
      "MUTATION_ENREGISTREE", "CLOTURE"
    ];
    const currentIndex = etapes.indexOf(currentStep);
    if (currentIndex === -1 || currentIndex >= etapes.length - 1) return;

    const nextStep = etapes[currentIndex + 1];
    setLoadingAction(true);
    try {
      const res = await avancerEtapePipelineAction(trxId, nextStep);
      setMessage({ type: "success", text: res.message });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Impossible d'avancer l'étape" });
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* ── 1. BANNIÈRE INSTITUTIONNELLE DE CONFORMITÉ ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Module Transactions & Ventes de Terrains · ADD-25
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Gestion des Ventes Foncières & Immobilières
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Conformité Loi n° 2019-576 (CCH) · Ordonnance n° 2013-481 (ACD) · Droits de mutation CGI 4% · Séquestre Notarial Obligatoire.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab("simulateur")}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-sm transition-colors"
            >
              <Calculator size={15} className="text-slate-500" />
              <span>Simulateur Notarial & DGI</span>
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus size={15} />
              <span>Nouveau Mandat de Vente</span>
            </button>
          </div>
        </div>

        {/* ALERTE RG-VTE-16 STRICTE */}
        <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3 text-xs text-slate-700">
          <Scale size={18} className="text-slate-900 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-900 font-semibold">Règle Absolue RG-VTE-16 (Séquestre Notarial) :</strong> QAPRIL documente, calcule et sécurise. La plateforme ne détient ni n'achemine jamais le prix de vente, ni les arrhes ou l'acompte. Tout paiement s'effectue directement sur le compte séquestre de l'étude notariale désignée au compromis.
          </div>
        </div>
      </div>

      {/* MESSAGE FEEDBACK */}
      {message && (
        <div className={`p-4 rounded-lg border text-xs font-medium flex items-center justify-between ${
          message.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── 2. CARTES KPI TRANSACTIONS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Volume Portefeuille Vente</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{fmt(aggregates.totalVolumeVenteFcfa)} <span className="text-xs font-medium text-slate-500">XOF</span></div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">{aggregates.totalBiensEnVente} biens/terrains sous mandat</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mandats Actifs</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{aggregates.mandatsActifsCount}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">{aggregates.mandatsExclusifsCount} mandats exclusifs sécurisés</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pipeline de Vente</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{aggregates.transactionsEnCoursCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">De l'offre acceptée à la mutation</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Biens Vérifiés ACD</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{aggregates.biensVerifiesAcdCount}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">Niveau 3 & Pleine propriété</div>
        </div>
      </div>

      {/* ── 3. ONGLETS DE NAVIGATION DU MODULE ── */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "pipeline"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <TrendingUp size={15} />
          <span>Pipeline des Ventes ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("biens")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "biens"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Compass size={15} />
          <span>Terrains & Biens Bâtis ({biensEnVente.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("mandats")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "mandats"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileCheck size={15} />
          <span>Mandats Écrits (RG-VTE-06)</span>
        </button>

        <button
          onClick={() => setActiveTab("simulateur")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "simulateur"
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Calculator size={15} />
          <span>Simulateur Fiscal & Notarial</span>
        </button>
      </div>

      {/* ── ONGLET 1 : PIPELINE KANBAN DE TRANSACTION (RG-VTE-17) ── */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Jalons Officiels du Pipeline de Vente
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Chaque étape est horodatée et contrôlée. Les alertes de relance sont générées à J-7 de la date prévisionnelle.
            </p>

            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Aucune transaction en cours. Cliquez sur « Nouveau Mandat de Vente » pour démarrer un dossier.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {transactions.map((trx: any) => {
                  const etapeInfo = ETAPES_PIPELINE[trx.statutPipeline as StatutPipelineVente] || {
                    statut: trx.statutPipeline,
                    titre: trx.statutPipeline, libelle: trx.statutPipeline,
                    description: "",
                    ordre: 1,
                    roleActeur: "AGENCE"
                  };

                  return (
                    <div key={trx.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">{trx.referenceTransaction}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
                              {etapeInfo.titre || (etapeInfo as any).libelle || trx.statutPipeline}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-700 mt-1">
                            {trx.property?.name || "Bien sous mandat"} · {trx.property?.city}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-900">{fmt(trx.prixFinalFcfa)} XOF</div>
                            <div className="text-[10px] text-slate-500 font-medium">Prix convenu</div>
                          </div>

                          <button
                            disabled={loadingAction || ['CLOTURE', 'ECHEC', 'CADUC'].includes(trx.statutPipeline)}
                            onClick={() => handleAvancerPipeline(trx.id, trx.statutPipeline as StatutPipelineVente)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            <span>Étape suivante</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Décomposition financière attachée au dossier */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Droits DGI (4%)</span>
                          <span className="font-semibold text-slate-800">{fmt(trx.droitsMutationEstimesFcfa)} XOF</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Émoluments Notaire</span>
                          <span className="font-semibold text-slate-800">{fmt(trx.fraisNotaireEstimesFcfa)} XOF</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Commission Agence</span>
                          <span className="font-semibold text-slate-800">{fmt(trx.commissionAgenceFcfa)} XOF</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Étude Notariale</span>
                          <span className="font-semibold text-slate-800">{trx.notaire?.nomEtude || "Séquestre à désigner"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ONGLET 2 : BIENS ET TERRAINS À LA VENTE (RG-VTE-01, RG-VTE-02) ── */}
      {activeTab === "biens" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Inventaire des Terrains & Biens Mis en Vente
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Chaque terrain comporte sa nature de titre, sa superficie, son bornage et ses servitudes.
                </p>
              </div>
            </div>

            {biensEnVente.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Aucun bien en vente enregistré. Déposez un nouveau mandat pour publier un bien ou un terrain.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {biensEnVente.map((bien: any) => {
                  const titreTypeVal = bien.titreType || bien.titre_type;
                  const titreInfo = NATURES_TITRES[titreTypeVal as NatureTitre] || {
                    libelle: titreTypeVal || "Titre déclaré",
                    niveauSecurite: "ETAPE_ACD",
                    badgeCouleur: "slate"
                  };
                  const verifInfo = getNiveauVerificationVente(bien.niveauVerifVente || bien.niveau_verif_vente || 1);

                  return (
                    <div key={bien.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 uppercase">
                            {bien.categorieVente || bien.categorie_vente || bien.propertyType || bien.type}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            titreInfo.niveauSecurite === "PLEINE_PROPRIETE"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : "bg-amber-50 border-amber-200 text-amber-800"
                          }`}>
                            {titreInfo.libelle}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {bien.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <MapPin size={13} className="text-slate-400" />
                          <span>{bien.city || bien.commune} {bien.district ? `· ${bien.district}` : ''}</span>
                        </div>

                        {/* Caractéristiques foncières */}
                        <div className="mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Superficie :</span>
                            <span className="font-semibold text-slate-800">{bien.superficieM2 || bien.superficie_m2 || bien.surface || '-'} m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">N° de Titre :</span>
                            <span className="font-mono font-semibold text-slate-800">{bien.titreNumero || bien.titre_numero || 'En cours'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Lot / Îlot :</span>
                            <span className="font-semibold text-slate-800">Lot {bien.numeroLot || bien.numero_lot || '-'} / Îlot {bien.numeroIlot || bien.numero_ilot || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Viabilisation :</span>
                            <span className="font-semibold text-slate-800">{(bien.viabilisationEau || bien.viabilisationElectricite || bien.est_viabilise) ? 'Eau / Élec dispo' : 'Non viabilisé'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Prix de vente</div>
                          <div className="text-sm font-bold text-slate-900">{fmt(bien.prixVenteFcfa || bien.price)} XOF</div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            verifInfo.peutPublier ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {verifInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ONGLET 3 : MANDATS ÉCRITS DE VENTE (RG-VTE-06, 07, 08) ── */}
      {activeTab === "mandats" && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Registre des Mandats de Vente (MV-AAAA-NNN)
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Mandats écrits obligatoires avec empreinte SHA-256. Durée maximale de 12 mois.
            </p>

            {mandats.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Aucun mandat enregistré.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">N° Mandat</th>
                      <th className="py-2.5 px-3">Bien / Titre</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Prix Présentation</th>
                      <th className="py-2.5 px-3">Commission</th>
                      <th className="py-2.5 px-3">Échéance</th>
                      <th className="py-2.5 px-3">Empreinte SHA-256</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mandats.map((m: any) => (
                      <tr key={m.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{m.numeroMandat}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{m.property?.name}</div>
                          <div className="text-[10px] text-slate-400">{m.property?.titreType || m.property?.titre_type} N° {m.property?.titreNumero || m.property?.titre_numero}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.typeMandat === 'EXCLUSIF' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.typeMandat}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{fmt(m.prixPresentationFcfa)} XOF</td>
                        <td className="py-3 px-3 text-slate-600">{m.tauxCommissionPct}% ({m.commissionCharge})</td>
                        <td className="py-3 px-3 text-slate-600">
                          {new Date(m.dateFin).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-400">
                          {m.sha256Contrat ? `${m.sha256Contrat.slice(0, 10)}...` : 'Certifié'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ONGLET 4 : SIMULATEUR FISCAL ET NOTARIAL OFFICIEL (RG-VTE-19) ── */}
      {activeTab === "simulateur" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Landmark size={18} className="text-slate-900" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Simulateur Fiscal & Notarial Officiel de Transaction
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Calcul instantané des droits d'enregistrement DGI (4%), des émoluments réglementés du notaire et des honoraires d'agence selon le CGI de Côte d'Ivoire.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Paramètres de calcul */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Paramètres de la vente
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prix de vente convenu (XOF)</label>
                <input
                  type="number"
                  step="500000"
                  value={simPrix}
                  onChange={(e) => setSimPrix(Math.max(1000000, Number(e.target.value)))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Commission d'agence (%)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="15"
                  value={simCommissionPct}
                  onChange={(e) => setSimCommissionPct(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                Les droits de mutation DGI sont fixés à <strong>4 %</strong> du prix d'acte pour les mutations à titre onéreux (CGI). Les émoluments du notaire suivent le barème officiel dégressif (Loi CCH).
              </div>
            </div>

            {/* Résultats détaillés */}
            <div className="lg:col-span-2 border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Décomposition Financière Certifiée
              </h3>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="text-slate-600">Prix de vente principal :</span>
                  <span className="font-bold text-slate-900">{fmt(decompte.prixVenteFcfa)} XOF</span>
                </div>

                <div className="flex justify-between py-2.5 text-emerald-800 bg-emerald-50/50 px-2 rounded">
                  <span className="font-semibold">Droits d'enregistrement DGI (4 %) :</span>
                  <span className="font-bold">{fmt(decompte.droitsEnregistrementMutationFcfa)} XOF</span>
                </div>

                <div className="flex justify-between py-2.5 text-slate-800">
                  <span>Émoluments du Notaire (HT) :</span>
                  <span className="font-semibold">{fmt(decompte.fraisNotaireEstimesFcfa)} XOF</span>
                </div>

                <div className="flex justify-between py-2.5 text-slate-800">
                  <span>TVA sur émoluments notaire (18 %) :</span>
                  <span className="font-semibold">{fmt(Math.round(decompte.fraisNotaireEstimesFcfa * 0.18))} XOF</span>
                </div>

                <div className="flex justify-between py-2.5 text-slate-800">
                  <span>Conservation foncière & Timbres fiscaux :</span>
                  <span className="font-semibold">{fmt(decompte.fraisConservationFonciereFcfa)} XOF</span>
                </div>

                <div className="flex justify-between py-2.5 text-sky-900 bg-sky-50/50 px-2 rounded">
                  <span className="font-semibold">Commission d'agence ({simCommissionPct} %) :</span>
                  <span className="font-bold">{fmt(decompte.commissionAgenceFcfa)} XOF</span>
                </div>

                <div className="flex justify-between py-3 text-sm bg-slate-900 text-white px-3 rounded-lg mt-2">
                  <span className="font-bold">Total Frais d'Acquisition (Notaire + DGI + Agence) :</span>
                  <span className="font-black text-emerald-400">{fmt(decompte.totalFraisAcquisitionFcfa)} XOF</span>
                </div>

                <div className="flex justify-between py-2.5 text-xs font-semibold text-slate-700">
                  <span>Net à percevoir pour le Vendeur :</span>
                  <span className="font-bold text-slate-900">{fmt(decompte.netVendeurEstimeFcfa)} XOF</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL NOUVEAU MANDAT DE VENTE (RG-VTE-06, 07) ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Création d'un Mandat de Vente & Fiche Bien
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Règles RG-VTE-01 à RG-VTE-08 · Scellement électronique SHA-256
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitMandat} className="mt-5 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie du Bien (RG-VTE-01)</label>
                  <select
                    value={formData.categorieBienVente}
                    onChange={(e) => setFormData({ ...formData, categorieBienVente: e.target.value as CategorieBienVente })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="TERRAIN_URBAIN_NU">Terrain urbain nu</option>
                    <option value="TERRAIN_RURAL">Terrain rural</option>
                    <option value="MAISON">Maison (Villa / Duplex)</option>
                    <option value="APPARTEMENT">Appartement</option>
                    <option value="IMMEUBLE_ENTIER">Immeuble entier</option>
                    <option value="LOCAL_COMMERCIAL">Local commercial</option>
                    <option value="COUR_COMMUNE_ENTIERE">Cour commune entière</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nature du Titre Juridique (RG-VTE-03)</label>
                  <select
                    value={formData.natureTitre}
                    onChange={(e) => setFormData({ ...formData, natureTitre: e.target.value as NatureTitre })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="ACD">Arrêté de Concession Définitive (ACD) · Pleine propriété</option>
                    <option value="TITRE_FONCIER">Titre Foncier (Livre Foncier) · Pleine propriété</option>
                    <option value="LETTRE_ATTRIBUTION">Lettre d'attribution · Étape vers ACD</option>
                    <option value="ATTESTATION_VILLAGEOISE">Attestation villageoise · Droit coutumier</option>
                    <option value="CERTIFICAT_FONCIER_RURAL">Certificat foncier rural (Loi 98-750)</option>
                    <option value="ACTE_NOTARIE_ANTERIEUR">Acte notarié de vente antérieur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Désignation commerciale du bien</label>
                <input
                  type="text"
                  placeholder="Ex : Terrain nu 600 m² ACD - Cocody Angré 8e Tranche"
                  value={formData.titreBien}
                  onChange={(e) => setFormData({ ...formData, titreBien: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N° du Titre (RG-VTE-05)</label>
                  <input
                    type="text"
                    placeholder="Ex : ACD-2023-9821"
                    value={formData.numeroTitre}
                    onChange={(e) => setFormData({ ...formData, numeroTitre: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Superficie (m²)</label>
                  <input
                    type="number"
                    value={formData.superficieM2}
                    onChange={(e) => setFormData({ ...formData, superficieM2: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N° de Lot</label>
                  <input
                    type="text"
                    placeholder="Lot 14"
                    value={formData.numeroLot}
                    onChange={(e) => setFormData({ ...formData, numeroLot: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">N° d'Îlot</label>
                  <input
                    type="text"
                    placeholder="Îlot 02"
                    value={formData.numeroIlot}
                    onChange={(e) => setFormData({ ...formData, numeroIlot: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commune</label>
                  <input
                    type="text"
                    value={formData.commune}
                    onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quartier ou Village</label>
                  <input
                    type="text"
                    value={formData.quartier}
                    onChange={(e) => setFormData({ ...formData, quartier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prix de Présentation (XOF)</label>
                  <input
                    type="number"
                    step="500000"
                    value={formData.prixPresentationFcfa}
                    onChange={(e) => setFormData({ ...formData, prixPresentationFcfa: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type de Mandat (RG-VTE-08)</label>
                  <select
                    value={formData.typeMandat}
                    onChange={(e) => setFormData({ ...formData, typeMandat: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="EXCLUSIF">Mandat Exclusif (Bloque double mandat)</option>
                    <option value="SIMPLE">Mandat Simple</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Commission (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.tauxCommissionPct}
                    onChange={(e) => setFormData({ ...formData, tauxCommissionPct: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="viabilise"
                  checked={formData.estViabilise}
                  onChange={(e) => setFormData({ ...formData, estViabilise: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900"
                />
                <label htmlFor="viabilise" className="font-semibold text-slate-700">
                  Terrain ou bien viabilisé (accès eau, électricité, voirie carrossable)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg font-bold shadow-sm"
                >
                  {loadingAction ? "Vérification et signature..." : "Enregistrer et Sceller le Mandat"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
