import React from "react"
import { validateInvitationToken } from "@/actions/agency-team-actions"
import ProtectedLogo from "@/components/ProtectedLogo"
import { ShieldCheck, UserPlus, FileWarning } from "lucide-react"
import { InviteAcceptClient } from "./InviteAcceptClient"

export const metadata = {
    title: "Invitation Équipe | M-AGENCE QAPRIL"
}

export default async function InviteAcceptPage({ params }: { params: { token: string } }) {
    const token = params.token

    try {
        const matchedUser = await validateInvitationToken(token)

        const conf = (matchedUser as any).agencyConfig
        if (conf.status === "ACTIVE") {
            return (
                <div className="min-h-screen bg-qgrey-50 flex items-center justify-center p-6 font-primary">
                    <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl space-y-6 text-center border-t-4 border-qorange">
                        <ProtectedLogo src="/logo.png" alt="QAPRIL" className="h-12 w-auto mx-auto mb-6" />
                        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                            <FileWarning size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-qnavy uppercase tracking-widest">Lien expiré</h1>
                        <p className="text-qgrey-400 font-medium">Cette invitation a déjà été acceptée.</p>
                        <a href="/login" className="inline-block px-8 py-3 bg-qnavy hover:bg-qnavy-dark text-white rounded-xl text-sm font-black uppercase tracking-wider transition-all">
                            Aller à la connexion
                        </a>
                    </div>
                </div>
            )
        }

        return (
            <div className="min-h-screen bg-qgrey-50 flex items-center justify-center p-6 font-primary relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-qorange-pale/40 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-qnavy-pale/40 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
                
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 max-w-xl w-full shadow-[0_32px_80px_rgba(13,43,110,0.08)] space-y-8 text-center border border-white relative z-10">
                    <ProtectedLogo src="/logo.png" alt="QAPRIL" className="h-10 w-auto mx-auto mb-8" />
                    
                    <div className="mx-auto w-20 h-20 bg-qgreen-pale rounded-full flex items-center justify-center text-qgreen shadow-inner">
                        <UserPlus size={40} />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-qnavy uppercase tracking-widest">Rejoignez l'Équipe</h1>
                        <p className="text-qgrey-400 font-medium text-lg">
                            Vous avez été invité(e) en tant que collaborateur d'Agence.
                        </p>
                    </div>

                    <div className="bg-qgrey-50 rounded-2xl p-6 text-left border border-qgrey-2 space-y-4">
                        <p className="text-sm font-bold text-qnavy flex items-center gap-2">
                            <ShieldCheck size={18} className="text-qgreen" /> Vos Permissions
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(conf.permissions || []).map((perm: string) => (
                                <span key={perm} className="px-3 py-1.5 bg-white border border-qgrey-2 rounded-lg text-xs font-black text-qtext-light uppercase tracking-wider">
                                    {perm.replace("MANAGE_", "")}
                                </span>
                            ))}
                        </div>
                    </div>

                    <InviteAcceptClient token={token} email={matchedUser.email!} />
                </div>
            </div>
        )
    } catch (e: any) {
        return (
            <div className="min-h-screen bg-qgrey-50 flex items-center justify-center p-6 font-primary">
                <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl space-y-6 text-center border-t-4 border-red-500">
                    <ProtectedLogo src="/logo.png" alt="QAPRIL" className="h-12 w-auto mx-auto mb-6" />
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                        <FileWarning size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-qnavy uppercase tracking-widest">Lien Invalide</h1>
                    <p className="text-qgrey-400 font-medium">{e.message || "Invitation introuvable."}</p>
                </div>
            </div>
        )
    }
}
