"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
    ShieldCheck,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    Eye,
    ExternalLink,
    AlertTriangle,
} from "lucide-react"
import {
    IdentityDocumentViewerModal,
    AdminIdentityDocItem,
    DOC_TYPE_LABELS,
} from "./IdentityDocumentViewerModal"

export function AdminIdentityValidationList({
    docs,
}: {
    docs: AdminIdentityDocItem[]
}) {
    const [selectedDoc, setSelectedDoc] = useState<AdminIdentityDocItem | null>(null)
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("ALL")

    const filteredDocs = docs.filter((d) => {
        if (filter === "PENDING") return d.status === "pending" || d.status === "under_review"
        if (filter === "VERIFIED") return d.status === "verified"
        if (filter === "REJECTED") return d.status === "rejected"
        return true
    })

    const pendingCount = docs.filter(
        (d) => d.status === "pending" || d.status === "under_review"
    ).length

    return (
        <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
                    <div className="flex items-center gap-2.5">
                        <ShieldCheck className="text-amber-600" size={20} />
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                Pièces d&apos;identité soumises ({docs.length})
                            </h2>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Cliquez sur « Voir le fichier &amp; Valider » pour inspecter le scan (Recto/Verso) avant validation.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {(
                            [
                                { id: "ALL", label: `Tous (${docs.length})` },
                                { id: "PENDING", label: `À vérifier (${pendingCount})` },
                                {
                                    id: "VERIFIED",
                                    label: `Vérifiés (${docs.filter((d) => d.status === "verified").length})`,
                                },
                                {
                                    id: "REJECTED",
                                    label: `Refusés (${docs.filter((d) => d.status === "rejected").length})`,
                                },
                            ] as const
                        ).map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setFilter(tab.id)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                    filter === tab.id
                                        ? "bg-slate-900 text-white"
                                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredDocs.length === 0 ? (
                    <div className="p-10 text-center text-sm text-gray-500">
                        Aucune pièce d&apos;identité dans cette catégorie.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredDocs.map((doc) => {
                            const fullName =
                                ((doc.user?.firstName ? doc.user.firstName + " " : "") + (doc.user?.lastName || "")).trim() ||
                                "Utilisateur QAPRIL"
                            const docLabel = DOC_TYPE_LABELS[doc.docType] || doc.docType
                            const isVerified = doc.status === "verified"
                            const isRejected = doc.status === "rejected"
                            const hasFile = Boolean(doc.scanS3Key)
                            const isPdf = doc.scanS3Key?.toLowerCase().endsWith(".pdf")

                            return (
                                <div
                                    key={doc.id}
                                    className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                                >
                                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                                        {/* Vignette d'aperçu directe du fichier */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedDoc(doc)}
                                            className="w-20 h-14 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 relative group cursor-pointer shadow-xs"
                                            title="Cliquer pour agrandir le fichier"
                                        >
                                            {!hasFile ? (
                                                <div className="flex flex-col items-center text-amber-500">
                                                    <AlertTriangle size={18} />
                                                    <span className="text-[8px] font-bold uppercase mt-0.5">
                                                        Sans scan
                                                    </span>
                                                </div>
                                            ) : isPdf ? (
                                                <div className="flex flex-col items-center text-slate-600">
                                                    <FileText size={20} />
                                                    <span className="text-[8px] font-black uppercase">PDF</span>
                                                </div>
                                            ) : (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={doc.scanS3Key!}
                                                    alt={docLabel}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <Eye size={16} />
                                            </div>
                                        </button>

                                        <div className="space-y-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-gray-900">{fullName}</span>
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-700">
                                                    {doc.user?.role || "USER"}
                                                </span>
                                                {isVerified ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <CheckCircle2 size={12} /> Vérifié
                                                    </span>
                                                ) : isRejected ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                                        <XCircle size={12} /> Refusé
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock size={12} /> À vérifier
                                                    </span>
                                                )}
                                                {!hasFile && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-600">
                                                        Aucun fichier joint
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                                                <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                                    <FileText size={13} className="text-slate-400" /> {docLabel} — N°{" "}
                                                    {doc.docNumber || "N/A"}
                                                </span>
                                                {doc.user?.email && <span>{doc.user.email}</span>}
                                                {doc.user?.phone && <span>{doc.user.phone}</span>}
                                                {doc.updatedAt && (
                                                    <span>
                                                        Mis à jour le{" "}
                                                        {new Date(doc.updatedAt).toLocaleDateString("fr-FR")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedDoc(doc)}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F4E79] hover:bg-[#163a5c] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                                        >
                                            <Eye size={15} />
                                            Voir le fichier &amp; Valider
                                        </button>
                                        <Link
                                            href={`/admin/validation/${doc.id}`}
                                            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                                            title="Ouvrir la fiche détaillée"
                                        >
                                            <ExternalLink size={15} />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {selectedDoc && (
                <IdentityDocumentViewerModal
                    doc={selectedDoc}
                    onClose={() => setSelectedDoc(null)}
                />
            )}
        </>
    )
}

