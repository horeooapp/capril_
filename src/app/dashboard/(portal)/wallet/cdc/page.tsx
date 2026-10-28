import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CircleDollarSign, Landmark, ChevronLeft, ShieldCheck, ArrowRight } from "lucide-react"
import { SectionCard } from "@/components/dashboard/ui/SectionCard"
import { Badge } from "@/components/dashboard/ui/Badge"

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
        <div className="space-y-6 relative">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/wallet" className="p-2 hover:bg-slate-100 rounded-[10px] transition-colors">
                    <ChevronLeft className="text-slate-500" />
                </Link>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-slate-700 rounded-[12px] border border-slate-200">
                        <Landmark size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Registre C.D.C</h1>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Caisse des Dépôts et Consignations</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 p-8 rounded-[16px] bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-emerald-400" /> Total Consigné Sécurisé
                        </span>
                        <div className="text-4xl font-black tracking-tighter">
                            {totalConsigned.toLocaleString()} <span className="text-[14px] opacity-70 font-bold">XOF</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed font-medium">
                            Ces montants sont stockés sur les comptes séquestres étatiques et génèrent des intérêts de sécurité.
                        </p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 opacity-5">
                        <Landmark size={150} />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <SectionCard title="Liste des Cautions" icon={<CircleDollarSign className="text-amber-500" />}>
                        {deposits.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-[12px] border border-dashed border-slate-200">
                                <p className="text-[13px] font-bold text-slate-500">Aucune caution consignée pour vos baux actuels.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-400">
                                            <th className="font-bold pb-4 pl-2">Biens & Locataires</th>
                                            <th className="font-bold pb-4">Montant</th>
                                            <th className="font-bold pb-4">Statut CDC</th>
                                            <th className="font-bold pb-4 text-right pr-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deposits.map(d => (
                                            <tr key={d.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                                <td className="py-4 pl-2">
                                                    <p className="font-bold text-slate-900 text-[13px]">{d.lease.property.name || d.lease.property.address}</p>
                                                    <p className="text-[11px] font-medium text-slate-500">{d.lease.tenant ? (d.lease.tenant as any).fullName || (d.lease.tenant as any).name : 'En attente'}</p>
                                                </td>
                                                <td className="py-4">
                                                    <span className="font-black text-slate-800 text-[14px]">{d.amount.toLocaleString()} XOF</span>
                                                </td>
                                                <td className="py-4">
                                                    {d.status === 'CONSIGNED' && <Badge color="green">Consigné</Badge>}
                                                    {d.status === 'RETURN_REQUESTED' && <Badge color="amber">Retour demandé</Badge>}
                                                    {d.status === 'RETURNED' && <Badge color="gray">Restitué</Badge>}
                                                    {d.status !== 'CONSIGNED' && d.status !== 'RETURN_REQUESTED' && d.status !== 'RETURNED' && (
                                                        <Badge color="blue">{d.status}</Badge>
                                                    )}
                                                    {d.cdcReference && <p className="text-[9px] mt-1.5 text-slate-400 font-mono">Ref: {d.cdcReference}</p>}
                                                </td>
                                                <td className="py-4 text-right pr-2">
                                                    <Link 
                                                        href={`/dashboard/leases/${d.leaseId}`}
                                                        className="inline-flex items-center justify-center p-2.5 rounded-[8px] bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 text-slate-500 transition-all shadow-sm"
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
                    </SectionCard>
                </div>
            </div>
        </div>
    )
}
