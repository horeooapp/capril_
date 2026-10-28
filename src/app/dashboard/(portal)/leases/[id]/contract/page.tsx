import { getLeaseById } from "@/actions/lease.actions"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import PrintableLeaseContract from "@/components/dashboard/PrintableLeaseContract"
import PrintButton from "@/components/PrintButton"
import Link from "next/link"
import { ArrowLeft, Download, FileText, Printer, ShieldCheck } from "lucide-react"

export default async function LeaseContractViewPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/api/auth/signin")

    const { id } = await params
    const lease = await getLeaseById(id) as any

    if (!lease) notFound()

    return (
        <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6">
            {/* Action Bar (masquée à l'impression) */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 print:hidden">
                <Link
                    href={`/dashboard/leases/${lease.id}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-wider"
                >
                    <ArrowLeft size={16} /> Retour au bail
                </Link>

                <div className="flex items-center gap-2">
                    {/* Lien direct de téléchargement PDF natif généré */}
                    <a
                        href={`/api/leases/${lease.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                    >
                        <Download size={15} /> Télécharger PDF
                    </a>

                    {/* Bouton Impression immédiate du document officiel */}
                    <PrintButton />
                </div>
            </div>

            {/* Avertissement de certification et authenticité (masqué à l'impression) */}
            <div className="max-w-4xl mx-auto mb-6 bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs print:hidden shadow-xs">
                <div className="flex items-center gap-2.5">
                    <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
                    <span>
                        Document certifié conforme au Code de la Construction et de l'Habitat de Côte d'Ivoire. Vous pouvez l'imprimer directement ou l'enregistrer en PDF.
                    </span>
                </div>
                <span className="font-mono font-bold text-[11px] bg-emerald-100 px-2.5 py-1 rounded-md text-emerald-800 shrink-0">
                    {lease.leaseReference}
                </span>
            </div>

            {/* Document Imprimable Officiel */}
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:m-0 print:rounded-none">
                <PrintableLeaseContract lease={lease} />
            </div>

            {/* Pied de page action (masqué à l'impression) */}
            <div className="max-w-4xl mx-auto mt-6 text-center print:hidden">
                <p className="text-xs text-slate-500 mb-3">
                    Besoin de faire signer ou d'archiver ce document ?
                </p>
                <div className="inline-flex gap-3">
                    <Link
                        href={`/dashboard/leases/${lease.id}`}
                        className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Retour aux détails du bail
                    </Link>
                    <a
                        href={`/api/leases/${lease.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                    >
                        <Download size={13} /> Ouvrir le PDF brut
                    </a>
                </div>
            </div>
        </div>
    )
}
