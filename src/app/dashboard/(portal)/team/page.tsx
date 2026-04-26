import React from "react"
import { listAgencyCollaborators } from "@/actions/agency-team-actions"
import { Users, Shield, Clock, Search } from "lucide-react"
import { CollaboratorInvitationModal } from "@/components/dashboard/agency/CollaboratorInvitationModal"
import { CollaboratorActionsDropdown } from "@/components/dashboard/agency/CollaboratorActionsDropdown"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

export const metadata = {
    title: "Mon Équipe | M-AGENCE QAPRIL"
}

export default async function AgencyTeamPage() {
    const res = await listAgencyCollaborators()

    if (!res.success) {
        return (
            <div className="p-8 text-center text-rose-500 font-medium">
                <p>Erreur: {res.error || "Impossible de charger l'équipe."}</p>
            </div>
        )
    }

    const { data: team = [] } = res

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <Users className="text-sky-600" size={32} /> Mon Équipe
                    </h1>
                    <p className="text-[13.5px] font-medium text-slate-500 mt-1">
                        Gérez vos collaborateurs et leurs accès.
                    </p>
                </div>

                <div className="flex gap-4">
                    <CollaboratorInvitationModal />
                </div>
            </div>

            <SectionCard title={`Collaborateurs (${team.length})`} noPadding>
                <div className="p-4 border-b border-slate-100 flex items-center justify-end bg-slate-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            className="w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-[8px] text-[13px] font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto pb-24">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Collaborateur</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Poste Assigné</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500">Statut</th>
                                <th className="p-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {team.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-500 text-[13px] font-medium">
                                        Aucun collaborateur trouvé. Invitez votre premier collaborateur !
                                    </td>
                                </tr>
                            ) : (
                                team.map((member: any) => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 font-black text-sm uppercase border border-slate-200 shadow-sm">
                                                    {(member.firstName ? member.firstName.charAt(0) : "") + (member.lastName ? member.lastName.charAt(0) : "")}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[13.5px] text-slate-900">{(member.firstName ? member.firstName + " " : "") + (member.lastName || "")}</p>
                                                    <p className="text-[12px] font-medium text-slate-500">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge color="gray">
                                                {(member.poste || "COLLABORATEUR").replace(/_/g, " ")}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            {member.status === "ACTIVE" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold uppercase tracking-widest">
                                                    <Shield size={12} /> Actif
                                                </span>
                                            ) : member.status === "INVITED" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold uppercase tracking-widest">
                                                    <Clock size={12} /> En attente
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-bold uppercase tracking-widest">
                                                    Désactivé
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end">
                                               <CollaboratorActionsDropdown 
                                                    collaboratorId={member.id} 
                                                    status={member.status} 
                                                    inviteToken={member.inviteToken} 
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    )
}
