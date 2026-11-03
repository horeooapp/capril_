"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    ShieldCheck,
    ShieldAlert,
    Clock,
    Upload,
    FileText,
    X,
    Loader2,
    CheckCircle2,
    ChevronDown,
    Image as ImageIcon,
    RefreshCw
} from "lucide-react"

type DocStatus = "none" | "pending" | "under_review" | "verified" | "rejected"

interface IdentityVerificationCardProps {
    status: DocStatus
    docType?: string | null
    docNumber?: string | null
    rejectionReason?: string | null
    submittedAt?: string | null
}

const DOC_OPTIONS = [
    { value: "CNI_CI", label: "Carte Nationale d'Identité (CNI)", needsVerso: true, placeholder: "Ex : CI004567891" },
    { value: "PASS_CI", label: "Passeport", needsVerso: false, placeholder: "Ex : 20AB12345" },
    { value: "CARTE_RESIDENT", label: "Carte de Résident", needsVerso: true, placeholder: "Ex : CR202600123" },
] as const

const MAX_SIZE = 8 * 1024 * 1024
const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf"

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function FileUploadField({
    label,
    hint,
    file,
    onChange,
}: {
    label: string
    hint: string
    file: File | null
    onChange: (f: File | null) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const preview = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null

    const handle = (f: File | undefined) => {
        if (!f) return
        if (f.size > MAX_SIZE) return toast.error("Fichier trop volumineux (8 Mo maximum).")
        if (!ACCEPT.split(",").includes(f.type)) return toast.error("Format accepté : JPG, PNG, WEBP ou PDF.")
        onChange(f)
    }

    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1 block">
                {label}
            </label>

            {file ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
                    <div className="w-12 h-12 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center shrink-0">
                        {preview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={preview} alt={label} className="w-full h-full object-cover" />
                        ) : (
                            <FileText size={22} className="text-slate-600" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[10px] font-semibold text-emerald-700">
                            {formatFileSize(file.size)} • Prêt à envoyer
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors shrink-0"
                        title="Retirer le fichier"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault()
                        handle(e.dataTransfer.files?.[0])
                    }}
                    className="w-full p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-400 transition-all flex items-center gap-3 text-left group"
                >
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-800 group-hover:border-slate-300 transition-colors shrink-0 shadow-xs">
                        <Upload size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-slate-700 group-hover:text-slate-900">
                             Cliquez pour importer un fichier
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 truncate">
                            {hint} (JPG, PNG, PDF • max 8 Mo)
                        </p>
                    </div>
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => {
                    handle(e.target.files?.[0])
                    e.target.value = ""
                }}
            />
        </div>
    )
}

export function IdentityVerificationCard({
    status,
    docType,
    docNumber,
    rejectionReason,
    submittedAt,
}: IdentityVerificationCardProps) {
    const router = useRouter()
    const [editing, setEditing] = useState(status === "none" || status === "rejected")
    const [type, setType] = useState<string>(
        docType && DOC_OPTIONS.some((o) => o.value === docType) ? docType : "CNI_CI"
    )
    const [number, setNumber] = useState(docNumber || "")
    const [expiry, setExpiry] = useState("")
    const [recto, setRecto] = useState<File | null>(null)
    const [verso, setVerso] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const conf = DOC_OPTIONS.find((o) => o.value === type) || DOC_OPTIONS[0]
    const currentLabel = DOC_OPTIONS.find((o) => o.value === docType)?.label || docType

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (number.trim().length < 5) return toast.error("Veuillez saisir un numéro de pièce valide.")
        if (!recto)
            return toast.error(
                conf.needsVerso
                    ? "Veuillez joindre le recto de votre pièce."
                    : "Veuillez joindre le scan de la page d'identité."
            )
        if (conf.needsVerso && !verso) return toast.error("Veuillez joindre le verso de votre pièce.")

        const fd = new FormData()
        fd.append("docType", type)
        fd.append("docNumber", number)
        if (expiry) fd.append("expiryDate", expiry)
        fd.append("recto", recto)
        if (conf.needsVerso && verso) fd.append("verso", verso)

        setLoading(true)
        try {
            const res = await fetch("/api/profile/identity", { method: "POST", body: fd })
            const data = await res.json().catch(() => ({}))
            if (!res.ok || !data.success) {
                toast.error(data.error || "Échec du dépôt de la pièce.")
                return
            }
            toast.success(data.message || "Pièce déposée avec succès.")
            setEditing(false)
            setRecto(null)
            setVerso(null)
            router.refresh()
        } catch {
            toast.error("Erreur réseau. Veuillez réessayer.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-5">
            {/* Bandeau de statut */}
            {status === "verified" && (
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-black uppercase tracking-wide text-emerald-900">
                            Identité vérifiée
                        </p>
                        <p className="text-[11.5px] font-medium text-emerald-700 truncate">
                            {currentLabel} • N° {docNumber}
                        </p>
                    </div>
                </div>
            )}

            {(status === "pending" || status === "under_review") && (
                <div className="flex items-center gap-3.5 p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Clock size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-black uppercase tracking-wide text-amber-900">
                            Vérification en cours (24h – 48h)
                        </p>
                        <p className="text-[11.5px] font-medium text-amber-700">
                            {currentLabel} (N° {docNumber}) déposée
                            {submittedAt ? ` le ${new Date(submittedAt).toLocaleDateString("fr-FR")}` : ""}.
                        </p>
                    </div>
                </div>
            )}

            {status === "rejected" && (
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-rose-50/80 border border-rose-200">
                    <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldAlert size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-black uppercase tracking-wide text-rose-900">
                            Pièce refusée
                        </p>
                        <p className="text-[11.5px] font-medium text-rose-700">
                            Motif : {rejectionReason || "Document illisible ou non conforme"}. Veuillez soumettre un nouveau document.
                        </p>
                    </div>
                </div>
            )}

            {status === "none" && (
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0">
                        <ShieldAlert size={18} />
                    </div>
                    <p className="text-[12px] font-medium text-slate-600 leading-snug">
                        Sélectionnez votre pièce officielle (<strong className="text-slate-800">CNI, Passeport ou Carte de Résident</strong>) et joignez son scan pour valider votre compte.
                    </p>
                </div>
            )}

            {!editing && status !== "verified" && (
                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw size={13} /> Remplacer le document envoyé
                </button>
            )}

            {editing && status !== "verified" && (
                <form onSubmit={submit} className="space-y-4">
                    {/* Liste déroulante du type de pièce */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1 block">
                            Type de pièce d&apos;identité *
                        </label>
                        <div className="relative">
                            <select
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value)
                                    setVerso(null)
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 pr-10 text-[13px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1F4E79] focus:border-transparent outline-none appearance-none cursor-pointer transition-all"
                            >
                                {DOC_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={16}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                        </div>
                    </div>

                    {/* Numéro + Date d'expiration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1 block">
                                Numéro de la pièce *
                            </label>
                            <input
                                required
                                value={number}
                                onChange={(e) => setNumber(e.target.value.toUpperCase())}
                                placeholder={conf.placeholder}
                                maxLength={20}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-[13px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1F4E79] focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1 block">
                                Date d&apos;expiration
                            </label>
                            <input
                                type="date"
                                value={expiry}
                                min={new Date().toISOString().slice(0, 10)}
                                onChange={(e) => setExpiry(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-[13px] font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1F4E79] focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Zones d'upload Recto / Verso */}
                    <div className={`grid gap-3.5 ${conf.needsVerso ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                        <FileUploadField
                            label={conf.needsVerso ? "Recto de la pièce *" : "Page d'identité (photo) *"}
                            hint={conf.needsVerso ? "Face avant lisible en couleur" : "Page comportant votre photo"}
                            file={recto}
                            onChange={setRecto}
                        />
                        {conf.needsVerso && (
                            <FileUploadField
                                label="Verso de la pièce *"
                                hint="Face arrière lisible en couleur"
                                file={verso}
                                onChange={setVerso}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                        {status !== "none" && status !== "rejected" && (
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                            >
                                Annuler
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 px-5 bg-[#1F4E79] hover:bg-[#163a5c] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                        >
                            {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                            {loading ? "Envoi en cours..." : "Valider et envoyer la pièce"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
