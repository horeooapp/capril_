"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Bell, AlertTriangle, ChevronRight, TrendingUp, CheckCircle, X, Building2, 
  FileSignature, Receipt, Wallet, BookOpen, Globe, Handshake,
  Landmark, Info, Lock
} from "lucide-react"
import Link from "next/link"
import { retirerProperty } from "@/actions/property.actions"
import WalletDashboard from "./WalletDashboard"

const fmt = (n: number) => (n || 0).toLocaleString("fr-FR");

const Sheet = ({ open, onClose, title, tc, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--ci-nuit2)] border border-[var(--ci-nuit3)] w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] p-6 z-10 shadow-2xl text-white">
        <div className="flex justify-between items-center mb-6 border-b border-[var(--ci-nuit3)] pb-4">
          <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: tc || 'white' }}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-[var(--ci-nuit3)] flex items-center justify-center hover:bg-[var(--ci-nuit)] transition-colors"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export function OwnerPortalDashboard({ 
  user, 
  properties: initialProperties,
  diasporaData,
  intermData,
  activeRole
}: { 
  user: any, 
  properties: any[],
  diasporaData?: any,
  intermData?: any,
  activeRole?: string
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "wallet">("overview");
  const [sheets, setSheets] = useState<Record<string, boolean>>({});
  const [selectedEntite, setSelectedEntite] = useState<any>(null);
  const [selectedUnite, setSelectedUnite] = useState<any>(null);

  const op = (k: string) => setSheets(s => ({ ...s, [k]: true }));
  const cl = (k: string) => setSheets(s => ({ ...s, [k]: false }));

  const handleRemove = async () => {
    try {
      if (sheets.removeUnite && selectedUnite) {
        await retirerProperty(selectedUnite.id);
      } else if (sheets.removeEntite && selectedEntite) {
        for (const u of selectedEntite.unites) {
          await retirerProperty(u.id);
        }
      }
      alert("Action effectuée : Bien retiré et notifications envoyées.");
      window.location.reload(); 
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      cl("removeEntite"); cl("removeUnite");
      setSelectedEntite(null); setSelectedUnite(null);
    }
  };

  const entities = useMemo(() => {
    const grouped = initialProperties.reduce((acc: any, p: any) => {
      const key = `${p.address}-${p.propertyType}`;
      if (!acc[key]) {
        acc[key] = {
          id: `E-${p.id}`, 
          code: p.propertyCode || `ENT-${p.id}`,
          nom: p.name || p.address, 
          adresse: p.address, 
          commune: p.commune,
          type: p.propertyType === "building" ? "immeuble" : p.propertyType === "court" ? "cour" : p.propertyType === "COURS_COMMUNE" ? "cour commune" : "standalone",
          unites: []
        };
      }
      acc[key].unites.push({
        ...p, 
        label: p.name || `Unité ${p.unitNumber || ''}`,
        statut: p.status === "active" ? "occupé" : "vacant",
        paiement: p.leases?.[0]?.statutFiscal === "A_JOUR" ? "À jour" : p.leases?.[0]?.statutFiscal === "EN_RETARD" ? "Impayé" : "—",
        loyer: p.leases?.[0]?.rentAmount || p.declaredRentFcfa || 0,
        tenantName: (((p.leases?.[0]?.tenant?.firstName || '') + " " + (p.leases?.[0]?.tenant?.lastName || '')).trim() || "Anonyme")
      });
      return acc;
    }, {});
    
    return Object.values(grouped).map((e: any) => {
      if (e.unites.length > 1 && e.type === "standalone") e.type = "immeuble";
      return e;
    });
  }, [initialProperties]);

  const stats = useMemo(() => {
    const all = entities.flatMap((e: any) => e.unites);
    const totalLoyers = all.filter((u: any) => u.statut === "occupé").reduce((s: number, u: any) => s + u.loyer, 0);
    const encaisse = all.filter((u: any) => u.paiement === "À jour").reduce((s: number, u: any) => s + u.loyer, 0);
    const impayesN = all.filter((u: any) => u.paiement === "Impayé").length;
    const vacants = all.filter((u: any) => u.statut === "vacant").length;
    return { totalLoyers, encaisse, impayesN, vacants, total: all.length };
  }, [entities]);

  const entiteStats = (e: any) => {
    const us = e.unites || [];
    return {
      total: us.length,
      occupes: us.filter((u: any) => u.statut === "occupé").length,
      vacants: us.filter((u: any) => u.statut === "vacant").length,
      impayes: us.filter((u: any) => u.paiement === "Impayé").length,
      loyers: us.reduce((s: number, u: any) => s + u.loyer, 0)
    };
  };

  const entiteIcon = (type: string) => type === "immeuble" ? "🏢" : type === "cour" ? "🏡" : "🏠";
  const tauxEncaissement = stats.totalLoyers > 0 ? Math.round((stats.encaisse / stats.totalLoyers) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* PAGE HEADER */}
      <div className="page-header">
         <div className="ph-title-group">
            <div className="ph-label flex items-center gap-2">
                {activeRole === 'NON_CERTIFIED_AGENT' ? 'Gestionnaire Privé' 
                 : activeRole === 'INTERMEDIARY' ? 'Intermédiaire de Gestion' 
                 : activeRole === 'DIASPORA' ? 'Investisseur Diaspora' 
                 : 'Espace Propriétaire'}
                
                {diasporaData && <span className="text-[var(--ci-vert)]"> • Connecté à l'International</span>}
            </div>
            <h1 className="ph-title flex items-center gap-4 flex-wrap">
               Bonjour, {((user?.firstName || '') + ' ' + (user?.lastName || '')).trim() || "Utilisateur"}.
               {intermData && (
                 <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--ci-vert)]/10 text-[var(--ci-vert)] border border-[var(--ci-vert)]/20 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none">
                    <Handshake size={12} /> Mandat Actif
                 </span>
               )}
            </h1>
         </div>
         <div className="ph-actions">
            <div className="flex bg-[var(--ci-nuit2)] border border-[var(--ci-nuit3)] rounded-lg p-1 mr-4">
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === "overview" ? "bg-[var(--ci-nuit3)] text-white" : "text-gray-400 hover:text-white"}`}
                >
                  Patrimoine
                </button>
                <button 
                  onClick={() => setActiveTab("wallet")}
                  className={`px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === "wallet" ? "bg-[var(--ci-or)]/20 text-[var(--ci-or)]" : "text-gray-400 hover:text-[var(--ci-or)]"}`}
                >
                  Mon Wallet
                </button>
            </div>
            <button onClick={() => op("notifs")} className="btn btn-nuit3 relative">
                <Bell size={18} />
                {(stats.impayesN > 0) && <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--ci-orange)] rounded-full border border-[var(--ci-nuit2)]" />}
            </button>
         </div>
      </div>

      {activeTab === "wallet" ? (
        <WalletDashboard />
      ) : (
        <>
          {/* ALERTE IMPAYÉS */}
          {stats.impayesN > 0 && (
            <div className="panel" style={{ borderLeft: "4px solid var(--ci-orange)" }}>
              <div className="flex items-start gap-4">
                <AlertTriangle size={24} className="text-[var(--ci-orange)] flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-black text-[var(--ci-orange)] text-sm mb-1">{stats.impayesN} LOYER(S) EN RETARD</h4>
                  <p className="text-sm text-gray-400">Des locataires n'ont pas encore réglé leur loyer. Consultez le patrimoine ci-dessous pour lancer une action formelle.</p>
                </div>
              </div>
            </div>
          )}

          {/* OUTILS RAPIDES */}
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
            {[
              { href: "/dashboard/properties", icon: <Building2 className="text-gray-400" size={24} />, label: "Biens" },
              { href: "/dashboard/leases",     icon: <FileSignature className="text-gray-400" size={24} />, label: "Baux" },
              { href: "/dashboard/receipts",   icon: <Receipt className="text-gray-400" size={24} />, label: "Quittances" },
              { href: "/dashboard/wallet",     icon: <Wallet className="text-gray-400" size={24} />, label: "Finances" },
              { href: "/dashboard/manual",     icon: <BookOpen className="text-gray-400" size={24} />, label: "Manuel" },
            ].map((m, i) => (
              <Link key={i} href={m.href} className="panel text-center flex flex-col items-center justify-center gap-3 hover:border-[var(--ci-or)]/50 transition-colors cursor-pointer group">
                 <div className="group-hover:scale-110 transition-transform">
                     {m.icon}
                 </div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.label}</div>
              </Link>
            ))}
          </div>

          {/* MAIN KPI BLOCK */}
          <div className="panel bg-gradient-to-r from-[var(--ci-nuit2)] to-[var(--ci-nuit3)] border-0 ring-1 ring-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--ci-vert)] opacity-[0.03] blur-[100px] pointer-events-none rounded-full"></div>
             
             <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative z-10 p-4">
                 <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Indice de Collection Mensuel</p>
                    <p className="text-6xl font-normal tracking-tight text-white font-mono">{tauxEncaissement}<span className="text-2xl text-gray-500 ml-2">%</span></p>
                 </div>
                 <div className="text-right">
                    <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded mb-4 ${tauxEncaissement === 100 ? 'bg-[var(--ci-vert)]/10 text-[var(--ci-vert)] border border-[var(--ci-vert)]/20' : tauxEncaissement >= 80 ? 'bg-[var(--ci-vert)]/10 text-[var(--ci-vert)] border border-[var(--ci-vert)]/20' : 'bg-[var(--ci-orange)]/10 text-[var(--ci-orange)] border border-[var(--ci-orange)]/20'}`}>
                        {tauxEncaissement === 100 ? "PARFAIT ✓" : tauxEncaissement >= 80 ? "CONFORME" : "VIGILANCE"}
                    </span>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        <span className="text-white">{fmt(stats.encaisse)} FCFA</span> encaissés<br/> Objectif global <span className="text-white">{fmt(stats.totalLoyers)} FCFA</span>
                    </p>
                 </div>
             </div>
             
             <div className="mt-8 h-2 bg-[var(--ci-nuit)] rounded-full overflow-hidden border border-[var(--ci-nuit3)]">
                <div className="h-full rounded-full transition-all duration-1000 ease-out"
                     style={{ width: `${tauxEncaissement}%`, background: tauxEncaissement === 100 ? 'var(--ci-vert)' : tauxEncaissement >= 80 ? 'var(--ci-vert)' : 'var(--ci-orange)' }} />
             </div>
          </div>

          {/* FINANCIAL STATS GRID */}
          <div className="kpi-grid">
              <div className="kpi-card gris">
                  <div className="kpi-icon"><Wallet /></div>
                  <div className="kpi-val">{fmt(stats.totalLoyers)} F</div>
                  <div className="kpi-label">Loyers Exigibles</div>
              </div>
              <div className="kpi-card vert">
                  <div className="kpi-icon"><CheckCircle /></div>
                  <div className="kpi-val">{fmt(stats.encaisse)} F</div>
                  <div className="kpi-label">Encaissé</div>
              </div>
              <div className="kpi-card or">
                  <div className="kpi-icon"><Building2 /></div>
                  <div className="kpi-val">{stats.vacants}</div>
                  <div className="kpi-label">Biens Vacants</div>
              </div>
              <div className="kpi-card orange">
                  <div className="kpi-icon"><AlertTriangle /></div>
                  <div className="kpi-val">{stats.impayesN}</div>
                  <div className="kpi-label">Impayés N</div>
              </div>
          </div>

          {/* PATRIMOINE (LEVEL 1) */}
          <div className="mt-8">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 pl-2">Mon patrimoine Immobilier</h2>
            <div className="space-y-4">
              {entities.map((e: any) => {
                const s = entiteStats(e);
                return (
                  <div key={e.id} className="panel cursor-pointer group hover:bg-[var(--ci-nuit2)]"
                       style={{ borderLeft: `4px solid ${s.impayes > 0 ? "var(--ci-orange)" : "var(--ci-vert)"}` }}
                       onClick={() => setSelectedEntite(selectedEntite?.id === e.id ? null : e)}>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="w-14 h-14 rounded-xl bg-[var(--ci-nuit)] border border-[var(--ci-nuit3)] flex items-center justify-center text-3xl flex-shrink-0 group-hover:border-[var(--ci-or)]/30 transition-colors">
                          {entiteIcon(e.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-black text-white tracking-wide uppercase">{e.nom}</p>
                        <p className="text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-widest">{e.adresse} · {e.commune}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--ci-nuit)] text-gray-300 font-bold uppercase">{s.total} unités</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--ci-vert)]/10 text-[var(--ci-vert)] font-bold uppercase">{s.occupes} occupés</span>
                          {s.vacants > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--ci-or)]/10 text-[var(--ci-or)] font-bold uppercase">{s.vacants} vacant(s)</span>}
                          {s.impayes > 0 && <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--ci-orange)]/10 text-[var(--ci-orange)] font-bold uppercase">{s.impayes} impayé(s)</span>}
                        </div>
                      </div>
                      <div className="text-left md:text-right flex-shrink-0 flex md:block items-end justify-between w-full md:w-auto">
                        <div>
                            <p className="text-xl font-normal font-mono text-white tracking-tight">{fmt(s.loyers)}</p>
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">FCFA / mois</p>
                        </div>
                        <ChevronRight size={20} className={`text-gray-500 transition-transform ${selectedEntite?.id === e.id ? "rotate-90" : "md:hidden block"}`} />
                      </div>
                      <ChevronRight size={20} className={`text-gray-500 transition-transform hidden md:block ${selectedEntite?.id === e.id ? "rotate-90" : ""}`} />
                    </div>

                    {/* Unités expandables - Rendues en table */}
                    {selectedEntite?.id === e.id && (
                      <div className="mt-6 pt-6 border-t border-[var(--ci-nuit3)]">
                          <table className="lease-table w-full text-left border-collapse">
                            <thead>
                              <tr>
                                <th>Référence Unité</th>
                                <th>Locataire</th>
                                <th className="text-right">Loyer</th>
                                <th>Statut Pmt</th>
                                <th className="text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {e.unites.map((u: any) => (
                                <tr key={u.id} className="hover:bg-[var(--ci-nuit)]">
                                  <td className="font-bold text-white">{u.name || u.label}</td>
                                  <td className="text-gray-400 text-xs">{u.locataire || "— Vacant —"}</td>
                                  <td className="text-right font-mono text-white">{fmt(u.loyer)} F</td>
                                  <td>
                                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${u.paiement === "Impayé" ? "bg-[var(--ci-orange)]/10 text-[var(--ci-orange)]" : u.statut === "vacant" ? "bg-gray-800 text-gray-400" : "bg-[var(--ci-vert)]/10 text-[var(--ci-vert)]"}`}>
                                           {u.paiement === "Impayé" ? "Impayé" : u.statut === "vacant" ? "Vacant" : "À jour"}
                                       </span>
                                  </td>
                                  <td className="text-right">
                                    {u.paiement === "Impayé" && (
                                      <button onClick={ev => { ev.stopPropagation(); op("relance"); }} className="border border-[var(--ci-orange)]/30 text-[var(--ci-orange)] hover:bg-[var(--ci-orange)]/10 px-3 py-1 rounded text-[10px] font-bold uppercase mr-2 transition-colors">
                                        Relancer
                                      </button>
                                    )}
                                    <button onClick={ev => { ev.stopPropagation(); setSelectedUnite(u); }} className="text-gray-400 hover:text-white transition-colors">
                                        Détails
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                      </div>
                    )}
                  </div>
                );
              })}

              {entities.length === 0 && (
                <div className="panel flex flex-col items-center justify-center p-16 border-dashed">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--ci-nuit)] border border-[var(--ci-nuit3)] flex items-center justify-center mb-4 text-gray-500">
                    <Building2 size={24} />
                  </div>
                  <h3 className="text-white font-bold mb-2">Aucun bien enregistré</h3>
                  <p className="text-gray-400 text-[11px] mb-6 max-w-sm text-center">Déclarez votre premier bien pour l'administrer numériquement via la Console Propriétaire.</p>
                  <Link href="/dashboard/properties/new" className="btn btn-or">
                    Déclarer un bien
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── SHEETS ── */}
      
      <Sheet open={!!selectedEntite && !selectedUnite} onClose={() => setSelectedEntite(null)} title={`Fiche ${selectedEntite?.type}`} tc="var(--ci-vert)">
        <div className="space-y-6">
          <div className="bg-[var(--ci-nuit)] p-6 rounded-xl border border-[var(--ci-nuit3)]">
            <p className="text-lg font-black text-white mb-1 uppercase tracking-wide">{selectedEntite?.nom}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedEntite?.adresse} · {selectedEntite?.commune}</p>
          </div>
          
          <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Unités du patrimoine</p>
              <div className="space-y-2">
                {selectedEntite?.unites.map((u: any) => (
                  <div key={u.id} className="bg-[var(--ci-nuit)] border border-[var(--ci-nuit3)] p-4 rounded-xl flex justify-between items-center cursor-pointer hover:border-[var(--ci-or)]/50 transition-colors"
                    onClick={() => { setSelectedEntite(null); setSelectedUnite(u); }}>
                    <div>
                      <p className="text-[13px] font-bold text-white">{u.name || u.label}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">{u.locataire || "— Vacant —"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] font-bold text-gray-300 font-mono bg-white/5 px-2 py-1 rounded">{fmt(u.loyer)} F</span>
                      <ChevronRight size={14} className="text-gray-500" />
                    </div>
                  </div>
                ))}
              </div>
          </div>

          <div className="pt-6 border-t border-[var(--ci-nuit3)]">
            <button 
              onClick={() => op("removeEntite")}
              className="w-full bg-[var(--ci-orange)]/10 text-[var(--ci-orange)] py-3 rounded border border-[var(--ci-orange)]/20 text-[10px] font-black uppercase tracking-widest hover:bg-[var(--ci-orange)]/20 transition-colors">
              Retirer cette entité du portefeuille
            </button>
          </div>
        </div>
      </Sheet>

      <Sheet open={!!selectedUnite} onClose={() => setSelectedUnite(null)} title="Détail de l'unité" tc="var(--ci-or)">
        <div className="space-y-8">
          <div className="flex items-center gap-4 bg-[var(--ci-nuit)] p-6 rounded-xl border border-[var(--ci-nuit3)]">
            <div className="text-[var(--ci-or)] bg-[var(--ci-or)]/10 p-3 rounded-lg"><Lock size={20} /></div>
            <div>
              <p className="text-lg font-black text-white">{selectedUnite?.name || selectedUnite?.label}</p>
              <p className="text-[10px] text-[var(--ci-or)] font-bold uppercase tracking-widest mt-1">Réf: {selectedUnite?.propertyCode}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--ci-nuit)] border border-[var(--ci-nuit3)] p-4 rounded-xl">
              <p className="text-[9px] font-black text-gray-500 uppercase mb-2">Statut Occupation</p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedUnite?.statut === "occupé" ? 'bg-[var(--ci-vert)]/10 text-[var(--ci-vert)]' : 'bg-[var(--ci-orange)]/10 text-[var(--ci-orange)]'}`}>
                  {selectedUnite?.statut?.toUpperCase()}
              </span>
            </div>
            <div className="bg-[var(--ci-nuit)] border border-[var(--ci-nuit3)] p-4 rounded-xl">
              <p className="text-[9px] font-black text-gray-500 uppercase mb-2">Statut Paiement</p>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${selectedUnite?.paiement === "À jour" ? 'bg-[var(--ci-vert)]/10 text-[var(--ci-vert)]' : 'bg-[var(--ci-orange)]/10 text-[var(--ci-orange)]'}`}>
                  {selectedUnite?.paiement?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions disponibles</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/dashboard/receipts?propertyId=${selectedUnite?.id}`} className="flex items-center justify-center bg-[var(--ci-nuit)] border border-[var(--ci-nuit3)] py-3 rounded text-[10px] font-bold text-white hover:border-gray-500 transition-colors uppercase tracking-widest text-center">Émettre Quitt.</Link>
              <Link href={`/dashboard/leases?propertyId=${selectedUnite?.id}`} className="flex items-center justify-center bg-[var(--ci-nuit)] border border-[var(--ci-nuit3)] py-3 rounded text-[10px] font-bold text-white hover:border-gray-500 transition-colors uppercase tracking-widest text-center">Renouv. Bail</Link>
              <Link href={`/dashboard/properties?propertyId=${selectedUnite?.id}`} className="flex items-center justify-center bg-[var(--ci-nuit)] border border-[var(--ci-nuit3)] py-3 rounded text-[10px] font-bold text-white hover:border-gray-500 transition-colors uppercase tracking-widest text-center">Modifier Infos</Link>
              <button 
                onClick={() => op("removeUnite")}
                className="bg-[var(--ci-orange)]/10 border border-[var(--ci-orange)]/20 text-[var(--ci-orange)] py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--ci-orange)]/20 transition-colors">Retirer</button>
            </div>
          </div>
        </div>
      </Sheet>

      <Sheet open={sheets.removeEntite || sheets.removeUnite} onClose={() => { cl("removeEntite"); cl("removeUnite"); }} title="CONFIRMATION DE RETRAIT" tc="var(--ci-orange)">
        <div className="space-y-6">
          <div className="flex items-start gap-4 bg-[var(--ci-orange)]/10 p-5 rounded-xl border border-[var(--ci-orange)]/20">
            <AlertTriangle stroke="var(--ci-orange)" size={24} className="mt-1" />
            <p className="text-[12px] text-[var(--ci-orange)] leading-relaxed">
              Ce retrait signifie que vous n'êtes plus propriétaire de ce bien sur la plateforme. L'historique sera archivé conformément aux obligations réglementaires.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Alerte générée</p>
            <div className="bg-[var(--ci-nuit)] p-4 rounded-xl border border-[var(--ci-nuit3)]">
              <p className="text-[11px] text-gray-400 italic">
                "[QAPRIL] Information : Ce bien a été retiré numériquement du portefeuille du Propriétaire principal."
              </p>
            </div>
          </div>

          <button 
            onClick={handleRemove}
            className="w-full bg-[var(--ci-orange)] text-white py-3 rounded border border-transparent text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-colors shadow">
            Confirmer Le Retrait Définitif
          </button>
        </div>
      </Sheet>

      <Sheet open={sheets.notifs} onClose={() => cl("notifs")} title="PREF. NOTIFICATIONS" tc="var(--ci-or)">
        <div className="space-y-3">
          {[["SMS", "Alertes loyer & impayés"], ["WhatsApp", "Notifications urgentes"], ["Email", "Rapports hebdomadaires"]].map(([l, s], i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[var(--ci-nuit)] border border-[var(--ci-nuit3)] rounded-xl">
              <div>
                <p className="text-[12px] font-bold text-white">{l}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{s}</p>
              </div>
              <div className="w-10 h-6 bg-[var(--ci-or)] rounded-full relative shadow-[0_0_10px_rgba(255,139,0,0.3)] cursor-pointer">
                <div className="w-4 h-4 bg-[var(--ci-nuit2)] rounded-full absolute right-1 top-1" />
              </div>
            </div>
          ))}
        </div>
      </Sheet>

    </div>
  );
}
