import React from "react"
import { listAgencyCollaborators } from "@/actions/agency-team-actions"
import { Users, Shield, Clock, Search, MoreVertical, Plus } from "lucide-react"
import { CollaboratorInvitationModal } from "@/components/dashboard/agency/CollaboratorInvitationModal"

export const metadata = {
    title: "Mon Équipe | M-AGENCE QAPRIL"
}

export default async function AgencyTeamPage() {
    const res = await listAgencyCollaborators()

    if (!res.success) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Erreur: {res.error || "Impossible de charger l'équipe."}</p>
            </div>
        )
    }

    const { data: team = [] } = res

    return (
        <div className="flex flex-col h-full bg-qgrey-50">
            {/* EN-TÊTE FIXE */}
            <header className="shrink-0 bg-white border-b border-qgrey-2 px-8 py-6 z-20">
                <div className="w-full flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-qnavy flex items-center gap-3">
                            <Users size={28} className="text-qorange" /> Mon Équipe
                        </h1>
                        <p className="text-[14px] text-qgrey-400 font-medium">Gérez vos collaborateurs et leurs accès.</p>
                    </div>

                    <div className="flex gap-4">
                        <CollaboratorInvitationModal />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="bg-white border border-qgrey-2 rounded-2xl shadow-sm overflow-hidden">
                    {/* Header List */}
                    <div className="flex justify-between items-center p-6 border-b border-qgrey-2">
                        <h2 className="text-lg font-bold text-qnavy">Collaborateurs ({team.length})</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-qgrey-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Rechercher..." 
                                className="pl-9 pr-4 py-2 bg-qgrey-50 border border-qgrey-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-qorange/30 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-qgrey-50 border-b border-qgrey-2">
                                <tr>
                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.15em] text-qgrey-400">Collaborateur</th>
                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.15em] text-qgrey-400">Permissions</th>
                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.15em] text-qgrey-400">Statut</th>
                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.15em] text-qgrey-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-qgrey-400 font-medium bg-qgrey-50/50">
                                            Aucun collaborateur trouvé. Invitez votre premier colaborateur !
                                        </td>
                                    </tr>
                                ) : (
                                    team.map((member: any) => (
                                        <tr key={member.id} className="border-b border-qgrey-2/50 hover:bg-qgrey-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-qnavy-pale flex items-center justify-center text-qnavy font-black text-sm uppercase">
                                                        {member.fullName?.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-qtext">{member.fullName}</p>
                                                        <p className="text-sm font-medium text-qgrey-400">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {member.permissions.slice(0, 2).map((perm: string) => (
                                                        <span key={perm} className="px-2 py-1 bg-qgrey-50 border border-qgrey-2 rounded-md text-[10px] font-bold text-qtext-light uppercase tracking-wider">
                                                            {perm.replace("MANAGE_", "")}
                                                        </span>
                                                    ))}
                                                    {member.permissions.length > 2 && (
                                                        <span className="px-2 py-1 bg-qgrey-50 border border-qgrey-2 rounded-md text-[10px] font-bold text-qtext-light uppercase tracking-wider">
                                                            +{member.permissions.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {member.status === "ACTIVE" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                                                        <Shield size={12} /> Actif
                                                    </span>
                                                ) : member.status === "INVITED" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-bold">
                                                        <Clock size={12} /> En attente
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold">
                                                        Désactivé
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="p-2 text-qgrey-400 hover:text-qnavy hover:bg-qnavy-pale rounded-lg transition-colors">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
