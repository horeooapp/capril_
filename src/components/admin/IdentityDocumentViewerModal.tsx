"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    X,
    CheckCircle2,
    XCircle,
    FileText,
    ZoomIn,
    ZoomOut,
    ExternalLink,
    Download,
    ShieldCheck,
    Calendar,
    User,
    Loader2,
    Eye,
    AlertTriangle,
    Columns,
} from "lucide-react"
import { approveDocument, rejectDocument } from "@/actions/admin-actions"

export interface AdminIdentityDocItem {
    id: string
    docType: string
    docNumber?: string | null
    scanS3Key?: string | null
    versoUrl?: string | null
    status: string
    expiryDate?: string | null
    rejectionReason?: string | null
    updatedAt?: string | null
    user?: {
        id: string
        firstName?: string | null
        lastName?: string | null
        email?: string | null
        phone?: string | null
        role?: string | null
        kycLevel?: number | null
    } | null
}

export const DOC_TYPE_LABELS: Record<string, string> = {
    CNI_CI: "Carte Nationale d'Identité (CNI)",
    PASS_CI: "Passeport",
    CARTE_RESIDENT: "Carte de Résident",
    ATTESTATION: "Attestation d'Identité",
    PERMIS: "Permis de Conduire",
    CARTE_CONSULAIRE: "Carte Consulaire",
}

export function IdentityDocumentViewerModal({
    doc,
    onClose,
}: {
    doc: AdminIdentityDocItem
    onClose: () => void
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [activeTab, setActiveTab] = useState<"recto" | "verso" | "both">(
        doc.scanS3Key && doc.versoUrl ? "both" : "recto"
    )
    const [zoom, setZoom] = useState(1)
    const [rejectMode, setRejectMode] = useState(false)
    const [reason, setReason] = useState(doc.rejectionReason || "")
    const [hasViewed, setHasViewed] = useState(true)

    const fullName =
        ((doc.user?.firstName ? doc.user.firstName + " " : "") + (doc.user?.lastName || "")).trim() ||
        "Utilisateur QAPRIL"
    const docLabel = DOC_TYPE_LABELS[doc.docType] || doc.docType
    const hasFile = Boolean(doc.scanS3Key)

    const handleApprove = () => {
        if (!hasFile) {
            toast.error("Impossible de valider : aucun fichier n'a été envoyé par l'utilisateur.")
            return
        }
        startTransition(async () => {
            const res = await approveDocument(doc.id)
            if (res?.success) {
                toast.success("Pièce d'identité validée et compte vérifié !")
                router.refresh()
                onClose()
            } else {
                toast.error(res?.error || "Erreur lors de la validation.")
            }
        })
    }

    const handleReject = () => {
        if (!reason.trim()) {
            toast.error("Veuillez indiquer le motif du rejet.")
            return
        }
        startTransition(async () => {
            const res = await rejectDocument(doc.id, reason.trim())
            if (res?.success) {
                toast.success("Pièce refusée. L'utilisateur a été notifié.")
                router.refresh()
                onClose()
            } else {
                toast.error(res?.error || "Erreur lors du rejet.")
            }
        })
    }

    const renderFilePane = (url: string, title: string) => {
        const isPdf = url.toLowerCase().endsWith(".pdf")
        return (
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-900/5 overflow-hidden">
                <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                        {title}
                    </span>
                    <div className="flex items-center gap-2">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setHasViewed(true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                            title="Ouvrir dans un nouvel onglet"
                        >
                            <ExternalLink size={12} /> Plein écran
                        </a>
                        <a
                            href={url}
                            download
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors"
                            title="Télécharger le fichier"
                        >
                            <Download size={12} /> Télécharger
                        </a>
                    </div>
                </div>

                <div className="relative flex-1 min-h-[320px] max-h-[58vh] overflow-auto flex items-center justify-center p-4 bg-slate-950/90">
                    {isPdf ? (
                        <iframe
                            src={url}
                            title={title}
                            className="w-full h-[52vh] rounded-lg bg-white border-0"
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={url}
                            alt={title}
                            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                            className="max-h-[52vh] w-auto object-contain rounded-lg shadow-lg transition-transform duration-200"
                        />
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#1F4E79]/10 text-[#1F4E79] flex items-center justify-center shrink-0">
                            <ShieldCheck size={22} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight truncate">
                                    Contrôle de Pièce d&apos;Identité — {fullName}
                                </h2>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                        doc.status === "verified"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : doc.status === "rejected"
                                            ? "bg-rose-50 text-rose-700 border-rose-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                >
                                    {doc.status === "verified"
                                        ? "Vérifié"
                                        : doc.status === "rejected"
                                        ? "Refusé"
                                        : "En attente de validation"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium truncate">
                                {docLabel} • N° <strong className="text-slate-800">{doc.docNumber || "Non renseigné"}</strong>
                                {doc.expiryDate
                                    ? ` • Expire le ${new Date(doc.expiryDate).toLocaleDateString("fr-FR")}`
                                    : ""}
                                {doc.user?.email ? ` • ${doc.user.email}` : ""}
                                {doc.user?.phone ? ` • ${doc.user.phone}` : ""}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Toolbar (Tabs & Zoom) */}
                {hasFile && (
                    <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                            {doc.scanS3Key && doc.versoUrl && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("both")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                        activeTab === "both"
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    <Columns size={14} /> Recto & Verso côte à côte
                                </button>
                            )}
                            {doc.scanS3Key && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("recto")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                        activeTab === "recto"
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    Recto / Page principale
                                </button>
                            )}
                            {doc.versoUrl && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("verso")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                        activeTab === "verso"
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    Verso
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                                title="Dézoomer"
                            >
                                <ZoomOut size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoom(1)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                            >
                                {Math.round(zoom * 100)}%
                            </button>
                            <button
                                type="button"
                                onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                                title="Zoomer"
                            >
                                <ZoomIn size={15} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Body: Document Preview */}
                <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
                    {!hasFile ? (
                        <div className="p-12 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 text-center space-y-2">
                            <AlertTriangle size={36} className="mx-auto text-amber-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider text-amber-900">
                                Aucun fichier téléversé par l&apos;utilisateur
                            </h3>
                            <p className="text-xs text-amber-700 max-w-md mx-auto">
                                L&apos;utilisateur a uniquement renseigné le numéro ({doc.docNumber || "N/A"}) sans joindre la copie de sa pièce. Il doit déposer son fichier depuis son profil avant toute validation.
                            </p>
                        </div>
                    ) : activeTab === "both" && doc.scanS3Key && doc.versoUrl ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {renderFilePane(doc.scanS3Key, "Recto de la pièce")}
                            {renderFilePane(doc.versoUrl, "Verso de la pièce")}
                        </div>
                    ) : activeTab === "verso" && doc.versoUrl ? (
                        renderFilePane(doc.versoUrl, "Verso de la pièce")
                    ) : (
                        renderFilePane(doc.scanS3Key!, "Recto / Page d'identité")
                    )}

                    {doc.rejectionReason && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                            <strong>Motif du dernier rejet :</strong> {doc.rejectionReason}
                        </div>
                    )}
                </div>

                {/* Footer: Validation Actions */}
                <div className="px-6 py-4 bg-white border-t border-slate-200 shrink-0">
                    {!rejectMode ? (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-slate-500 font-medium">
                                Vérifiez la lisibilité, la correspondance du nom (<strong>{fullName}</strong>) et la validité de la pièce avant d&apos;approuver.
                            </p>
                            <div className="flex items-center gap-3 ml-auto">
                                <button
                                    type="button"
                                    onClick={() => setRejectMode(true)}
                                    disabled={isPending}
                                    className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <XCircle size={16} />
                                    Refuser la pièce
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={isPending || !hasFile || !hasViewed}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                                >
                                    {isPending ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <CheckCircle2 size={16} />
                                    )}
                                    Valider la pièce & Activer le compte
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <label className="block text-[11px] font-black uppercase tracking-wider text-rose-700">
                                Motif du refus (sera transmis à l&apos;utilisateur) *
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Ex : Document flou, pièce expirée, verso manquant..."
                                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-rose-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
                                />
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setRejectMode(false)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReject}
                                        disabled={isPending || !reason.trim()}
                                        className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50"
                                    >
                                        {isPending ? "Envoi..." : "Confirmer le refus"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
