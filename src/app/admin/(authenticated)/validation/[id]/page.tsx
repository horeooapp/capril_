import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { User, ShieldCheck, MapPin, Calendar, FileText, ArrowLeft, ExternalLink, Download } from "lucide-react"
import Link from "next/link"
import ValidationActions from "../ValidationActions"
import { DOC_TYPE_LABELS } from "@/components/admin/IdentityDocumentViewerModal"

export const dynamic = "force-dynamic"

export default async function DocumentValidationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    
    const doc = await (prisma as any).identityDocument.findUnique({
        where: { id },
        include: { user: true }
    })

    if (!doc) notFound()

    const docLabel = DOC_TYPE_LABELS[doc.docType] || doc.docType

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Back */}
            <div className="flex items-center justify-between">
                <Link 
                    href="/admin/validation" 
                    className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Retour aux validations KYC
                </Link>
                <div className="px-4 py-2 bg-slate-800/5 rounded-full border border-slate-800/10">
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Dossier KYC #{doc.id.slice(0, 8)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Document Info & Scans */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card-premium p-8 sm:p-10 rounded-[2.5rem] border border-white/60 shadow-sm">
                        <div className="flex items-start justify-between mb-8">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-1">
                                    Inspection de la Pièce
                                </h1>
                                <p className="text-gray-500 font-medium text-sm">
                                    Visualisez le fichier envoyé par l&apos;utilisateur avant de valider son identité.
                                </p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-2xl">
                                <ShieldCheck className="text-orange-600" size={32} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-100">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type de Document</label>
                                    <div className="flex items-center gap-2.5 text-base font-bold text-gray-900">
                                        <FileText className="text-primary" size={18} />
                                        {docLabel}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Numéro de la pièce</label>
                                    <div className="text-base font-bold text-gray-900">{doc.docNumber || "Non renseigné"}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nationalité / Pays</label>
                                    <div className="flex items-center gap-2.5 text-base font-bold text-gray-900">
                                        <MapPin className="text-primary" size={18} />
                                        {doc.nationality || doc.issuingCountry || "Côte d'Ivoire (CI)"}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date d&apos;Expiration</label>
                                    <div className="flex items-center gap-2.5 text-base font-bold text-gray-900">
                                        <Calendar className="text-primary" size={18} />
                                        {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString("fr-FR") : "Non spécifiée"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nom Complet (Titulaire)</label>
                                    <div className="text-base font-bold text-gray-900 uppercase tracking-tight">
                                        {(doc.user?.firstName ? doc.user.firstName + " " : "") + (doc.user?.lastName || "") || doc.fullName || "Utilisateur QAPRIL"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scans de la pièce (recto / verso) */}
                        {(() => {
                            const scans = [
                                { label: "Recto / Page d'identité", url: doc.scanS3Key as string | null },
                                { label: "Verso", url: ((doc.metadata as any)?.versoUrl as string | null) || null },
                            ].filter(s => !!s.url)

                            if (!scans.length) {
                                return (
                                    <div className="mt-8 p-10 bg-amber-50/60 rounded-3xl border-2 border-dashed border-amber-300 flex flex-col items-center justify-center gap-3 text-center">
                                        <FileText className="text-amber-500" size={36} />
                                        <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Aucun fichier téléversé</p>
                                        <p className="text-xs text-amber-700 max-w-md">
                                            L&apos;utilisateur n&apos;a pas encore envoyé le scan de sa pièce d&apos;identité. Ne validez pas ce dossier sans pièce justificative.
                                        </p>
                                    </div>
                                )
                            }

                            return (
                                <div className={`mt-8 grid gap-6 ${scans.length > 1 ? "md:grid-cols-2" : "grid-cols-1"}`}>
                                    {scans.map(s => {
                                        const isPdf = s.url!.toLowerCase().endsWith(".pdf")
                                        return (
                                            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col">
                                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">{s.label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={s.url!}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors"
                                                        >
                                                            <ExternalLink size={12} /> Plein écran
                                                        </a>
                                                        <a
                                                            href={s.url!}
                                                            download
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors"
                                                        >
                                                            <Download size={12} /> Télécharger
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-slate-900/95 flex items-center justify-center min-h-[280px]">
                                                    {isPdf ? (
                                                        <iframe
                                                            src={s.url!}
                                                            title={s.label}
                                                            className="w-full h-[360px] rounded-lg bg-white border-0"
                                                        />
                                                    ) : (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={s.url!}
                                                            alt={s.label}
                                                            className="w-full max-h-[380px] object-contain rounded-lg"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })()}

                        {doc.rejectionReason && (
                            <p className="mt-6 text-sm font-semibold text-rose-600 bg-rose-50 p-3.5 rounded-xl border border-rose-200">
                                Motif du dernier rejet : {doc.rejectionReason}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: User Context & Actions */}
                <div className="space-y-8">
                    <div className="glass-card-premium p-8 rounded-[2.5rem] border border-white/60 shadow-sm">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">Profil Utilisateur</h3>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <User size={32} />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 uppercase tracking-tighter">{(doc.user?.firstName ? doc.user.firstName + " " : "") + (doc.user?.lastName || "")}</h4>
                                <p className="text-xs font-bold text-gray-400">{doc.user?.phone || doc.user?.email}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Niveau KYC Actuel</span>
                                <span className="text-sm font-black text-gray-900">{doc.user?.kycLevel || 1} / 4</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card-premium p-8 rounded-[2.5rem] border border-white/60 shadow-xl shadow-gray-200/50">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Décision Administrative</h3>
                        <ValidationActions docId={doc.id} currentStatus={doc.status} hasFile={Boolean(doc.scanS3Key)} />
                    </div>
                </div>
            </div>
        </div>
    )
}
