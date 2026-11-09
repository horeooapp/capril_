"use client"

import React, { useState, useTransition } from "react"
import {
  Wrench,
  Search,
  MapPin,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Phone,
  User,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import Link from "next/link";
import { toast } from "sonner";
import { resolveMaintenanceTicket, updateTicketStatus } from "@/actions/maintenance-actions";
import { SectionCard } from "@/components/dashboard/ui/SectionCard";
import { Badge } from "@/components/dashboard/ui/Badge";
import TenantLandlordChatView from "@/components/messaging/TenantLandlordChatView";

const DEMO_FALLBACK_INCIDENTS = [
  {
    id: "inc-1",
    ticketRef: "SIG-2026-0881",
    designation: "Fuite d'eau sous lavabo cuisine",
    description: "Fuite persistante au niveau du raccord flexible sous l'évier. Risque d'infiltration dans le meuble sous-évier. Photo horodatée certifiée SHA-256.",
    statut: "EN_ATTENTE",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    locataire: { id: "loc-1", firstName: "Adjoua", lastName: "Kouamé", phone: "+225 05 44 22 11 00" },
    logement: { id: "log-1", address: "Résidence Émeraude · Cocody, Appt A1" },
    leaseId: "lease-emeraude-a1",
  },
  {
    id: "inc-2",
    ticketRef: "SIG-2026-0842",
    designation: "Climatiseur split salon ne refroidit plus",
    description: "Le compresseur extérieur tourne mais l'unité intérieure ne souffle que de l'air ambiant. Diagnostic probable : recharge de gaz R410A nécessaire.",
    statut: "PRIS_EN_CHARGE",
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    locataire: { id: "loc-2", firstName: "Jean-Marc", lastName: "Konan", phone: "+225 07 11 33 55 77" },
    logement: { id: "log-2", address: "Résidence Émeraude · Cocody, Appt A3" },
    leaseId: "lease-emeraude-a3",
  },
  {
    id: "inc-3",
    ticketRef: "SIG-2026-0799",
    designation: "Disjoncteur différentiel qui saute",
    description: "Coupure de courant dès l'activation du chauffe-eau. Artisan électricien déjà mandaté et intervention clôturée avec succès.",
    statut: "RESOLU",
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    locataire: { id: "loc-3", firstName: "Yao", lastName: "Kouassi", phone: "+225 01 02 03 04 05" },
    logement: { id: "log-3", address: "Cour commune · Yopougon Niangon Sud" },
    leaseId: "lease-yopougon-c1",
  }
];

export default function MaintenanceDashboardClient({ initialIncidents }: { initialIncidents: any[] }) {
    const [incidents, setIncidents] = useState<any[]>(
      initialIncidents && initialIncidents.length > 0 ? initialIncidents : DEMO_FALLBACK_INCIDENTS
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [isPending, startTransition] = useTransition();
    const [activeChatIncident, setActiveChatIncident] = useState<any | null>(null);

    const handleTakeCharge = (id: string) => {
        startTransition(async () => {
            const promise = updateTicketStatus(id, "TRAVAUX_EN_COURS");
            toast.promise(promise, {
                loading: "Prise en charge du signalement...",
                success: "Signalement pris en charge. Le locataire a été notifié.",
                error: "Erreur lors de la prise en charge."
            });
            setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, statut: 'PRIS_EN_CHARGE' } : inc));
        });
    };

    const handleResolve = (id: string) => {
        startTransition(async () => {
             const promise = resolveMaintenanceTicket(id)
             toast.promise(promise, {
                 loading: "Clôture du signalement en cours...",
                 success: "Le signalement a été marqué comme résolu.",
                 error: "Erreur lors de la résolution."
             });
             setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, statut: 'RESOLU' } : inc));
        });
    };

    const filteredIncidents = incidents.filter(inc => {
        const matchesStatus = statusFilter === "ALL" || 
            (statusFilter === "EN_ATTENTE" && (inc.statut === "EN_ATTENTE" || inc.statut === "SIGNALE")) ||
            (statusFilter === "EN_COURS" && (inc.statut === "PRIS_EN_CHARGE" || inc.statut === "TRAVAUX_EN_COURS")) ||
            (statusFilter === "RESOLU" && (inc.statut === "RESOLU" || inc.statut === "RÉSOLU"));

        const locName = `${inc.locataire?.firstName || ''} ${inc.locataire?.lastName || ''}`.toLowerCase();
        const address = (inc.logement?.address || '').toLowerCase();
        const title = (inc.designation || inc.description || '').toLowerCase();
        const matchesSearch = locName.includes(searchTerm.toLowerCase()) || 
                              address.includes(searchTerm.toLowerCase()) || 
                              title.includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
             {/* EN-TÊTE CONFORME : RÉCEPTION BAILLEUR */}
             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        RÉCEPTION BAILLEUR · SIGNALEMENTS DES LOCATAIRES
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Wrench className="text-amber-500" size={30} /> Signalements reçus
                    </h1>
                    <p className="text-[13px] font-medium text-slate-500 mt-1 max-w-2xl leading-relaxed">
                        Les signalements d’incidents sont émis par vos locataires. Vous recevez ici leurs déclarations horodatées avec photos pour mandater des artisans, échanger directement par messagerie et piloter la résolution.
                    </p>
                </div>

                {/* LIEN VERS LE CENTRE DE MESSAGERIE */}
                <Link
                  href="/dashboard/messages"
                  className="bg-slate-900 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-colors shrink-0"
                >
                  <MessageSquare size={15} />
                  <span>Messagerie avec les locataires</span>
                  <ArrowRight size={14} />
                </Link>
            </div>

            <SectionCard title="Registre des signalements reçus" noPadding>
                {/* FILTRES ET RECHERCHE */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher par locataire, bien ou panne..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-sm" 
                        />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
                        {[
                            { id: "ALL", label: "Tous" },
                            { id: "EN_ATTENTE", label: "À traiter" },
                            { id: "EN_COURS", label: "En cours" },
                            { id: "RESOLU", label: "Résolus" }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setStatusFilter(f.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    statusFilter === f.id
                                        ? "bg-slate-900 text-white"
                                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LISTE DES TICKETS REÇUS */}
                <div className="p-6 space-y-4 bg-white">
                    {filteredIncidents.map(inc => {
                        const isResolved = inc.statut === 'RÉSOLU' || inc.statut === 'RESOLU';
                        const isPendingAction = inc.statut === 'EN_ATTENTE' || inc.statut === 'SIGNALE';
                        const locataireName = inc.locataire ? `${inc.locataire.firstName} ${inc.locataire.lastName}` : 'Locataire';

                        return (
                            <div 
                                key={inc.id} 
                                className={`bg-white border ${
                                    isResolved ? 'border-emerald-200' : isPendingAction ? 'border-amber-200' : 'border-blue-200'
                                } rounded-[14px] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6`}
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`w-12 h-12 shrink-0 ${
                                        isResolved ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                        isPendingAction ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                        'bg-blue-50 text-blue-600 border border-blue-100'
                                    } rounded-[10px] flex items-center justify-center font-black text-xl shadow-sm`}>
                                       {isResolved ? <CheckCircle size={22}/> : <AlertTriangle size={22}/>}
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                {inc.ticketRef || 'SIGNALEMENT'}
                                            </span>
                                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                                                <User size={11} /> Émis par : {locataireName}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                                              <Clock size={11} /> {new Date(inc.createdAt).toLocaleDateString('fr-FR')}
                                            </span>
                                        </div>

                                        <h3 className="text-[15px] font-bold text-slate-900">
                                            {inc.designation || inc.description?.substring(0, 50) || 'Incident signalé'}
                                        </h3>

                                        <p className="text-[12px] font-semibold text-slate-500 flex items-center gap-1.5">
                                            <MapPin size={12} className="text-slate-400"/> 
                                            {inc.logement?.address || 'Adresse du logement'}
                                        </p>

                                        {inc.description && (
                                            <p className="text-[12px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 max-w-xl">
                                                {inc.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                                    <div className="text-left md:text-right md:mr-2">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Statut</p>
                                        <Badge color={isResolved ? 'emerald' : isPendingAction ? 'amber' : 'blue'}>
                                            {inc.statut}
                                        </Badge>
                                    </div>

                                    {/* BOUTON MESSAGERIE AVEC LE LOCATAIRE */}
                                    <button
                                      onClick={() => setActiveChatIncident(inc)}
                                      className="text-[11px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 hover:bg-slate-200 py-2.5 px-3.5 rounded-[8px] border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                      title="Ouvrir la messagerie avec ce locataire"
                                    >
                                      <MessageSquare size={13} className="text-amber-600" />
                                      <span>Échanger</span>
                                    </button>

                                    {isPendingAction && (
                                        <button 
                                            onClick={() => handleTakeCharge(inc.id)} 
                                            disabled={isPending}
                                            className="text-[11px] font-bold uppercase tracking-wider text-white bg-blue-700 hover:bg-blue-800 py-2.5 px-4 rounded-[8px] shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors cursor-pointer"
                                        >
                                            <Wrench size={13} />
                                            Prendre en charge
                                        </button>
                                    )}

                                    {!isResolved && (
                                        <button 
                                            onClick={() => handleResolve(inc.id)} 
                                            disabled={isPending}
                                            className="text-[11px] font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-emerald-600 py-2.5 px-4 rounded-[8px] shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors cursor-pointer"
                                        >
                                            <CheckCircle2 size={13} />
                                            Résolu
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {filteredIncidents.length === 0 && (
                        <div className="text-center py-12">
                             <Wrench className="text-slate-200 mx-auto mb-3" size={32} />
                             <p className="text-[13px] font-medium text-slate-500">Aucun signalement correspondant.</p>
                             <p className="text-[11px] text-slate-400 mt-1">Les signalements déclarés par vos locataires apparaîtront ici automatiquement.</p>
                        </div>
                    )}
                </div>
            </SectionCard>

            {/* MODALE DE MESSAGERIE DIRECTE AVEC LE LOCATAIRE */}
            {activeChatIncident && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
                <div className="w-full max-w-2xl h-[640px] max-h-[90vh]">
                  <TenantLandlordChatView
                    leaseId={activeChatIncident.leaseId || "lease-emeraude-a1"}
                    otherPartyName={
                      activeChatIncident.locataire
                        ? `${activeChatIncident.locataire.firstName} ${activeChatIncident.locataire.lastName}`
                        : "Locataire"
                    }
                    otherPartyRole="LOCATAIRE"
                    otherPartyPhone={activeChatIncident.locataire?.phone}
                    propertyTitle={activeChatIncident.designation}
                    propertyAddress={activeChatIncident.logement?.address}
                    isModal={true}
                    onClose={() => setActiveChatIncident(null)}
                  />
                </div>
              </div>
            )}
        </div>
    )
}
