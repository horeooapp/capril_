import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FileText, Download, ShieldCheck, Search, Filter } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DocumentsPage() {
    const session = await auth()
    if (!session?.user) redirect("/dashboard/login")

    // Fetch documents logically linked to this landlord
    // Leases where they own the property
    const leases = await prisma.lease.findMany({
        where: {
            property: {
                ownerUserId: session.user.id
            }
        },
        include: {
            property: true,
            tenant: true
        },
        orderBy: { createdAt: 'desc' }
    });

    const receipts = await prisma.receipt.findMany({
        where: {
            lease: {
                property: { ownerUserId: session.user.id }
            }
        },
        include: { lease: { include: { property: true, tenant: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit for performance
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Centre de Documents</h1>
                    <p className="text-slate-500">Gérez, téléchargez et consultez tous vos documents légaux (Baux, Quittances, Mandats).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-emerald-600 mb-2">
                        <FileText size={24} />
                        <h3 className="font-bold">Baux Actifs</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{leases.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-sky-600 mb-2">
                        <Download size={24} />
                        <h3 className="font-bold">Quittances Émises</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{receipts.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5 text-emerald-600">
                        <ShieldCheck size={100} />
                    </div>
                    <div className="flex items-center gap-3 text-emerald-600 mb-2 relative z-10">
                        <ShieldCheck size={24} />
                        <h3 className="font-bold">Coffre-fort QAPRIL</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-500 relative z-10">Tous vos documents sont signés et archivés cryptographiquement sur la blockchain.</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={18} className="text-slate-500" />
                        Derniers Baux (Contrats)
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs uppercase bg-slate-50/50 text-slate-500 border-b border-slate-100 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Locataire</th>
                                <th className="px-6 py-4">Bien</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4">Date signature</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leases.length > 0 ? leases.map((lease) => (
                                <tr key={lease.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {(lease as any).tenant?.firstName} {(lease as any).tenant?.lastName || (lease as any).tenant?.email || 'N/D'}
                                    </td>
                                    <td className="px-6 py-4 truncate max-w-[200px]">
                                        {(lease as any).property?.name || (lease as any).property?.address || 'Non spécifié'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={"px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full flex w-fit items-center gap-1 " + (lease.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                                            <span className={"w-1.5 h-1.5 rounded-full " + (lease.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400')}></span>
                                            {lease.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(lease.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/dashboard/leases/${lease.id}`} className="text-emerald-600 hover:text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                                            Consulter
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Aucun bail trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <Download size={18} className="text-slate-500" />
                        Dernières Quittances
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs uppercase bg-slate-50/50 text-slate-500 border-b border-slate-100 font-semibold">
                            <tr>
                                <th className="px-6 py-4">N° Quittance</th>
                                <th className="px-6 py-4">Locataire</th>
                                <th className="px-6 py-4">Période</th>
                                <th className="px-6 py-4">Montant</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {receipts.length > 0 ? receipts.map((rec) => (
                                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {rec.receiptRef}
                                    </td>
                                    <td className="px-6 py-4">
                                        {((rec as any).lease?.tenant as any)?.firstName} {((rec as any).lease?.tenant as any)?.lastName || (rec as any).lease?.tenant?.email || 'N/D'}
                                    </td>
                                    <td className="px-6 py-4 capitalize">
                                        {(rec as any).periodMonth}
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        {rec.totalAmount.toLocaleString()} F
                                    </td>
                                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                                        <Link href={`/dashboard/receipts/${rec.id}`} className="text-sky-600 hover:text-sky-800 font-semibold bg-sky-50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1">
                                            <Download size={14} /> PDF
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Aucune quittance trouvée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}
