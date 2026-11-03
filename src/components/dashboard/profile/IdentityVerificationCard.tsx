"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ShieldCheck, ShieldAlert, Clock, Upload, FileText, CreditCard, BookOpen, IdCard, X, Loader2, CheckCircle2 } from "lucide-react"

type DocStatus = "none" | "pending" | "under_review" | "verified" | "rejected"

interface IdentityVerificationCardProps {
    status: DocStatus
    docType?: string | null
    docNumber?: string | null
    rejectionReason?: string | null
    submittedAt?: string | null
}

const DOC_OPTIONS = [
    { value: "CNI_CI", label: "CNI", full: "Carte Nationale d'Identité", icon: CreditCard, needsVerso: true },
    { value: "PASS_CI", label: "Passeport", full: "Passeport", icon: BookOpen, needsVerso: false },
    { value: "CARTE_RESIDENT", label: "Carte de résident", full: "Carte de Résident", icon: IdCard, needsVerso: true },
] as const

const MAX_SIZE = 8 * 1024 * 1024
const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf"

function FileDrop({ label, file, onChange }: { label: string; file: File | null; onChange: (f: File | null) => void }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const preview = file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null

    const handle = (f: File | undefined) => {
        if (!f) return
        if (f.size > MAX_SIZE) return toast.error("Fichier trop volumineux (8 Mo maximum).")
        if (!ACCEPT.split(",").includes(f.type)) return toast.error("Format accepté : JPG, PNG, WEBP ou PDF.")
        onChange(f)
    }

    return (
        <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
            {file ? (
                <div className="relative h-32 rounded-[8px] border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                    {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt={label} className="w-full h-full object-contain" />
                    ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                            <FileText size={28} />
                            <span className="text-[11px] font-semibold truncate max-w-[160px]">{file.name}</span>
                        </div>
                    )}
                    <button type="button" onClick={() => onChange(null)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600" aria-label="Retirer">
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files?.[0]) }}
                    className="w-full h-32 rounded-[8px] border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-colors flex flex-col items-center justify-center gap-1.5 text-slate-500"
                >
                    <Upload size={22} />
                    <span className="text-[12px] font-semibold">Cliquer ou glisser le fichier</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP, PDF • 8 Mo max</span>
                </button>
            )}
            <input ref={inputRef} type="file" accept={ACCEPT} capture="environment" className="hidden" onChange={(e) => { handle(e.target.files?.[0]); e.target.value = "" }} />
        </div>
    )
}

export function IdentityVerificationCard({ status, docType, docNumber, rejectionReason, submittedAt }: IdentityVerificationCardProps) {
    const router = useRouter()
    const [editing, setEditing] = useState(status === "none" || status === "rejected")
    const [type, setType] = useState<string>(docType && DOC_OPTIONS.some(o => o.value === docType) ? docType : "CNI_CI")
    const [number, setNumber] = useState(docNumber || "")
    const [expiry, setExpiry] = useState("")
    const [recto, setRecto] = useState<File | null>(null)
    const [verso, setVerso] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const conf = DOC_OPTIONS.find(o => o.value === type)!
    const currentLabel = DOC_OPTIONS.find(o => o.value === docType)?.full || docType

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (number.trim().length < 5) return toast.error("Veuillez saisir le numéro de votre pièce.")
        if (!recto) return toast.error(conf.needsVerso ? "Le recto de la pièce est requis." : "Le scan de la page d'identité est requis.")
        if (conf.needsVerso && !verso) return toast.error("Le verso de la pièce est requis.")

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

    // Bandeau de statut
    const banner = (() => {
        if (status === "verified") return (
            <div className="flex items-start gap-3 p-4 rounded-[8px] bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="text-emerald-600 shrink-0" size={22} />
                <div>
                    <p className="text-[13px] font-bold text-emerald-800">Compte vérifié</p>
                    <p className="text-[12px] text-emerald-700">{currentLabel} n° {docNumber} validée par l'équipe QAPRIL.</p>
                </div>
            </div>
        )
        if (status === "pending" || status === "under_review") return (
            <div className="flex items-start gap-3 p-4 rounded-[8px] bg-amber-50 border border-amber-200">
                <Clock className="text-amber-600 shrink-0" size={22} />
                <div>
                    <p className="text-[13px] font-bold text-amber-800">Vérification en cours</p>
                    <p className="text-[12px] text-amber-700">
                        {currentLabel} n° {docNumber} déposée{submittedAt ? ` le ${new Date(submittedAt).toLocaleDateString("fr-FR")}` : ""}. Délai de traitement : 24 à 48h.
                    </p>
                </div>
            </div>
        )
        if (status === "rejected") return (
            <div className="flex items-start gap-3 p-4 rounded-[8px] bg-rose-50 border border-rose-200">
                <ShieldAlert className="text-rose-600 shrink-0" size={22} />
                <div>
                    <p className="text-[13px] font-bold text-rose-800">Pièce refusée</p>
                    <p className="text-[12px] text-rose-700">Motif : {rejectionReason || "Document non conforme"}. Veuillez déposer une nouvelle pièce.</p>
                </div>
            </div>
        )
        return (
            <div className="flex items-start gap-3 p-4 rounded-[8px] bg-sky-50 border border-sky-200">
                <ShieldAlert className="text-sky-600 shrink-0" size={22} />
                <div>
                    <p className="text-[13px] font-bold text-sky-800">Compte non vérifié</p>
                    <p className="text-[12px] text-sky-700">Déposez votre CNI, votre passeport ou votre carte de résident pour valider votre compte.</p>
                </div>
            </div>
        )
    })()

    return (
        <div className="space-y-4">
            {banner}

            {!editing && status !== "verified" && (
                <button type="button" onClick={() => setEditing(true)} className="w-full py-2.5 bg-white border border-slate-200 rounded-[8px] text-[11px] font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all">
                    Remplacer la pièce déposée
                </button>
            )}

            {editing && status !== "verified" && (
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type de pièce</p>
                        <div className="grid grid-cols-3 gap-2">
                            {DOC_OPTIONS.map(opt => {
                                const Icon = opt.icon
                                const active = type === opt.value
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => { setType(opt.value); setVerso(null) }}
                                        className={`p-3 rounded-[8px] border-2 flex flex-col items-center gap-1.5 transition-all ${active ? "border-slate-800 bg-slate-50 text-slate-900" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                                    >
                                        <Icon size={20} />
                                        <span className="text-[11px] font-bold text-center leading-tight">{opt.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Numéro de la pièce *</label>
                            <input
                                value={number}
                                onChange={(e) => setNumber(e.target.value.toUpperCase())}
                                placeholder={type === "PASS_CI" ? "Ex : 20AB12345" : "Ex : CI004567891"}
                                maxLength={20}
                                className="w-full px-3 py-2.5 rounded-[8px] border border-slate-200 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Date d'expiration</label>
                            <input
                                type="date"
                                value={expiry}
                                min={new Date().toISOString().slice(0, 10)}
                                onChange={(e) => setExpiry(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-[8px] border border-slate-200 text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300"
                            />
                        </div>
                    </div>

                    <div className={`grid gap-3 ${conf.needsVerso ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                        <FileDrop label={conf.needsVerso ? "Recto *" : "Page d'identité (photo) *"} file={recto} onChange={setRecto} />
                        {conf.needsVerso && <FileDrop label="Verso *" file={verso} onChange={setVerso} />}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        La pièce doit être en cours de validité, lisible, en couleur et non recadrée. Vos documents sont stockés de manière privée et ne sont consultables que par l'équipe de vérification QAPRIL.
                    </p>

                    <div className="flex gap-2">
                        {status !== "none" && status !== "rejected" && (
                            <button type="button" onClick={() => setEditing(false)} className="px-5 py-3 bg-white border border-slate-200 rounded-[8px] text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                Annuler
                            </button>
                        )}
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-slate-900 text-white rounded-[8px] text-[11px] font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                            {loading ? "Envoi en cours..." : "Soumettre pour validation"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}

