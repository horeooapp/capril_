"use client"

import React, { useState, useTransition } from "react"
import { Users, Phone, Mail, Search, Loader2, ArrowRight, Activity, Filter, MessageCircle, X, FileText, Home } from "lucide-react"
import { toast } from "sonner";
import { launchCampaign, getContactHistory } from "@/actions/crm-actions"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export default function CRMDashboardClient({ initialContacts }: { initialContacts: any[] }) {
    const [contacts] = useState<any[]>(initialContacts)
    const [isPending, startTransition] = useTransition()

    const [selectedContact, setSelectedContact] = useState<any | null>(null)
    const [contactHistory, setContactHistory] = useState<any | null>(null)
    const [loadingHistory, setLoadingHistory] = useState(false)

    const handleOpenContact = async (c: any) => {
        setSelectedContact(c)
        setLoadingHistory(true)
        try {
           const history = await getContactHistory(c.id)
           setContactHistory(history)
        } catch(e) {
           toast.error("Erreur de chargement du dossier.")
        } finally {
           setLoadingHistory(false)
        }
    }

    const handleCampagne = () => {
        startTransition(async () => {
            const promise = launchCampaign()
            toast.promise(promise, {
                loading: "Génération de l'emailing via SendGrid...",
                success: `Campagne diffusée avec succès à vos contacts !`,
                error: "Erreur lors de l'envoi."
            })
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Users className="text-indigo-600" size={32} /> CRM & Leads
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Gérez vos prospects, locataires et propriétaires depuis un annuaire central.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={(e) => { e.preventDefault(); toast.promise(new Promise(r=>setTimeout(r, 800)), {loading: "Traitement...", success: "Filtrage des segments CRM disponible prochainement."}); }} className="bg-white border text-slate-700 border-slate-200 px-6 py-2.5 rounded-[10px] font-semibold text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                        <Filter size={16} /> Segmenter
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[12px] p-8 md:p-10 text-white relative overflow-hidden shadow-md flex items-center justify-between">
                 <div className="relative z-10 max-w-2xl">
                     <h2 className="text-2xl font-black tracking-tight mb-2">Engagez votre audience avec Q-Mail.</h2>
                     <p className="text-indigo-200 text-[13px] leading-relaxed mb-6 font-medium">Concevez des campagnes d'emailings et SMS groupées vers vos Leads (Nouveaux programmes, Rappel de régularisations, Voeux). Taux d'ouverture garanti par SendGrid.</p>
                     <button 
                        onClick={handleCampagne}
                        disabled={isPending}
                        className="bg-white text-indigo-900 font-bold uppercase text-[11px] tracking-widest px-6 py-3 rounded-full hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70">
                        <MessageCircle size={16}/> {isPending ? 'Envoi en cours...' : 'Créer une Campagne'}
                     </button>
                 </div>
                 <Activity size={180} className="absolute right-0 opacity-10 rotate-12 -translate-y-10" />
            </div>

            <SectionCard title="Annuaire des Contacts" noPadding>
                <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Rechercher un prospect ou client..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Contact</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Type</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Coordonnées</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Niveau KYC</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((c) => (
                                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-[13px]">
                                                {c.firstName?.[0] || ""}{c.lastName?.[0] || ""}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[13.5px] text-slate-900 capitalize">{c.firstName} {c.lastName}</p>
                                                <p className="text-[11px] text-slate-500 font-medium">ID: {c.id.substring(0,8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge color="violet">{c.role || "Client"}</Badge>
                                    </td>
                                    <td className="p-4 space-y-1">
                                        {c.phone && <p className="text-[12px] font-medium text-slate-600 flex items-center gap-2"><Phone size={12} className="text-slate-400"/> {c.phone}</p>}
                                        {c.email && <p className="text-[12px] font-medium text-slate-600 flex items-center gap-2"><Mail size={12} className="text-slate-400"/> {c.email}</p>}
                                    </td>
                                    <td className="p-4">
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-[80px]">
                                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: `${Math.min((c.kycLevel / 3) * 100, 100)}%`}}></div>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Level {c.kycLevel || 1}</p>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={(e) => { e.preventDefault(); handleOpenContact(c); }} className="w-8 h-8 rounded-[8px] bg-white border border-slate-200 inline-flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors ml-auto shadow-sm">
                                            <ArrowRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center">
                                        <Users className="text-slate-300 mx-auto mb-3" size={32} />
                                        <p className="text-[13px] font-medium text-slate-500">Aucun prospect ou propriétaire rattaché à votre compte. Votre CRM est vierge.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {selectedContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[16px] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200 border border-slate-200">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full border border-orange-200 bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg shadow-sm">
                                  {selectedContact.firstName?.[0] || ""}{selectedContact.lastName?.[0] || ""}
                              </div>
                              <div>
                                  <h3 className="text-lg font-black text-slate-900 capitalize">{selectedContact.firstName} {selectedContact.lastName}</h3>
                                  <p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest">{selectedContact.role || 'Contact Client'}</p>
                              </div>
                           </div>
                           <button onClick={() => setSelectedContact(null)} className="w-8 h-8 rounded-[8px] bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm">
                              <X size={16} />
                           </button>
                        </div>
                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6 select-text bg-white">
                           
                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-slate-50 rounded-[10px] border border-slate-100">
                                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Mobile</p>
                                 <p className="font-semibold text-[13px] text-slate-800">{selectedContact.phone || 'Non renseigné'}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-[10px] border border-slate-100">
                                 <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Email</p>
                                 <p className="font-semibold text-[13px] text-slate-800">{selectedContact.email || 'Non renseigné'}</p>
                              </div>
                           </div>

                           {loadingHistory ? (
                              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={28} /></div>
                           ) : contactHistory ? (
                              <div className="space-y-6">
                                 {/* Baux */}
                                 <div>
                                    <h4 className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3"><FileText size={14} className="text-slate-400"/> Dossier de Baux ({contactHistory.leases?.length || 0})</h4>
                                    {!contactHistory.leases || contactHistory.leases.length === 0 ? <p className="text-[12.5px] text-slate-500 bg-slate-50 p-4 rounded-[10px] border border-slate-100 text-center font-medium">Aucun bail associé.</p> : (
                                       <div className="space-y-2">
                                         {contactHistory.leases.map((l:any, i:number) => (
                                            <div key={i} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-[10px] flex justify-between items-center transition-colors hover:bg-indigo-50">
                                               <div>
                                                  <p className="text-[13px] font-bold text-indigo-900">{l.property?.propertyCode || 'Propriété Générique'} - {l.property?.commune || l.leaseReference}</p>
                                                  <p className="text-[10.5px] font-bold text-indigo-600 uppercase tracking-widest mt-1">LOYER : {l.rentAmount?.toLocaleString()} FCFA/Mois</p>
                                               </div>
                                               <Badge color="blue">{l.status}</Badge>
                                            </div>
                                         ))}
                                       </div>
                                    )}
                                 </div>

                                 {/* Candidatures */}
                                 <div>
                                    <h4 className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3"><Home size={14} className="text-slate-400"/> Candidatures ({contactHistory.candidatures?.length || 0})</h4>
                                    {!contactHistory.candidatures || contactHistory.candidatures.length === 0 ? <p className="text-[12.5px] text-slate-500 bg-slate-50 p-4 rounded-[10px] border border-slate-100 text-center font-medium">Aucune candidature soumise.</p> : (
                                       <div className="space-y-2">
                                         {contactHistory.candidatures.map((c:any, i:number) => (
                                            <div key={i} className="p-4 bg-purple-50/50 border border-purple-100 rounded-[10px] flex justify-between items-center transition-colors hover:bg-purple-50">
                                               <div>
                                                  <p className="text-[13px] font-bold text-purple-900">{c.logement?.propertyCode || 'Bien non défini'}</p>
                                                  <p className="text-[10.5px] font-bold text-purple-600 uppercase tracking-widest mt-1">SOUMISE LE : {new Date(c.createdAt).toLocaleDateString()}</p>
                                               </div>
                                               <Badge color="purple">{c.statut}</Badge>
                                            </div>
                                         ))}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
