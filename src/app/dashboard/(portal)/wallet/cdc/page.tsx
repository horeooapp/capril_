import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CircleDollarSign, Landmark, ChevronLeft, ShieldCheck, ArrowRight } from "lucide-react"

export default async function CDCGlobalDashboard() {
    const session = await auth()
    if (!session?.user) redirect("/")

    // Fetch all CDC Deposits for the landlord
    const deposits = await prisma.cDCDeposit.findMany({
        where: {
            lease: {
                landlordId: session.user.id
            }
        },
        include: {
            lease: {
                include: {
                    property: true,
                    tenant: true
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })

    const totalConsigned = deposits
        .filter(d => d.status === 'CONSIGNED' || d.status === 'RETURN_REQUESTED')
        .reduce((acc, curr) => acc + curr.amount, 0)

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/wallet" className="p-2 hover:bg-qgrey-1 rounded-xl transition-colors">
                    <ChevronLeft className="text-qtext-light" />
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-qnavy-pale text-qnavy rounded-2xl border border-qnavy/10">
                        <Landmark size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-qnavy-dark uppercase tracking-tighter">Registre C.D.C</h1>
                        <p className="text-xs font-bold text-qtext-mid uppercase tracking-widest mt-1">Caisse des Dépôts et Consignations</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 glass-panel p-8 rounded-[2rem] bg-gradient-to-br from-qnavy-light to-qnavy text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
                            <ShieldCheck size={14} /> Total Consigné Sécurisé
                        </span>
                        <div className="text-4xl font-black tracking-tighter">
                            {totalConsigned.toLocaleString()} <span className="text-sm opacity-60">FCFA</span>
                        </div>
                        <p className="text-[10px] opacity-70 mt-4 leading-relaxed font-bold">
                            Ces montants sont stockés sur les comptes séquestres étatiques et génèrent des intérêts de sécurité.
                        </p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 opacity-10">
                        <Landmark size={150} />
                    </div>
                </div>

                <div className="md:col-span-2 bg-white rounded-[2rem] border border-qgrey-2 p-6 shadow-[0_12px_40px_rgba(13,43,110,0.06)]">
                    <h2 className="text-lg font-black text-qnavy-dark mb-6 flex items-center gap-3">
                        <CircleDollarSign className="text-qorange" /> Liste des Cautions
                    </h2>
                    
                    {deposits.length === 0 ? (
                        <div className="text-center py-10 bg-qgrey-1/30 rounded-2xl border border-dashed border-qgrey-2">
                            <p className="text-sm font-bold text-qtext-light">Aucune caution consignée pour vos baux actuels.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-qgrey-2 text-[10px] uppercase tracking-widest text-qtext-light">
                                        <th className="font-black pb-3 pl-2">Biens & Locataires</th>
                                        <th className="font-black pb-3">Montant</th>
                                        <th className="font-black pb-3">Statut CDC</th>
                                        <th className="font-black pb-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deposits.map(d => (
                                        <tr key={d.id} className="border-b border-qgrey-1/50 last:border-0 hover:bg-qgrey-1/30 transition-colors">
                                            <td className="py-4 pl-2">
                                                <p className="font-black text-qnavy-dark text-sm">{d.lease.property.name || d.lease.property.address}</p>
                                                <p className="text-[10px] font-bold text-qtext-mid">{d.lease.tenant ? (d.lease.tenant as any).fullName || (d.lease.tenant as any).name : 'En attente'}</p>
                                            </td>
                                            <td className="py-4">
                                                <span className="font-black text-qnavy">{d.amount.toLocaleString()} FCFA</span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${
                                                    d.status === 'CONSIGNED' ? 'bg-qgreen-pale text-qgreen' :
                                                    d.status === 'RETURN_REQUESTED' ? 'bg-qorange-pale text-qorange' :
                                                    d.status === 'RETURNED' ? 'bg-gray-100 text-gray-400' :
                                                    'bg-blue-50 text-blue-500'
                                                }`}>
                                                    {d.status}
                                                </span>
                                                {d.cdcReference && <p className="text-[8px] mt-1 text-qtext-light font-mono">Ref: {d.cdcReference}</p>}
                                            </td>
                                            <td className="py-4 text-right">
                                                <Link 
                                                    href={`/dashboard/leases/${d.leaseId}`}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-white border border-qgrey-2 hover:border-qnavy hover:text-qnavy transition-all shadow-sm"
                                                    title="Gérer dans le bail"
                                                >
                                                    <ArrowRight size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
