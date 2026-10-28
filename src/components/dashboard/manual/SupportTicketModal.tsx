"use client"

import React, { useState, useTransition } from "react"
import { X, Send, LifeBuoy, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { createQuickSupportTicket } from "@/actions/manual-actions"

interface SupportTicketModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (ticketRef: string) => void
}

export default function SupportTicketModal({ isOpen, onClose, onSuccess }: SupportTicketModalProps) {
    const [isPending, startTransition] = useTransition()
    const [subject, setSubject] = useState("")
    const [category, setCategory] = useState("TECHNIQUE")
    const [priority, setPriority] = useState("NORMALE")
    const [description, setDescription] = useState("")
    const [submittedRef, setSubmittedRef] = useState<string | null>(null)

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!subject.trim()) {
            toast.error("Veuillez renseigner le sujet de votre demande.")
            return
        }
        if (!description.trim() || description.trim().length < 10) {
            toast.error("Veuillez détailler votre demande (au moins 10 caractères).")
            return
        }

        startTransition(async () => {
            const res = await createQuickSupportTicket({
                subject: subject.trim(),
                category,
                priority,
                description: description.trim()
            })

            if (res.success && res.ticketRef) {
                setSubmittedRef(res.ticketRef)
                toast.success(res.message || "Ticket d'assistance créé avec succès.")
                onSuccess?.(res.ticketRef)
            } else {
                toast.error(res.error || "Impossible de soumettre le ticket.")
            }
        })
    }

    const handleResetAndClose = () => {
        setSubject("")
        setDescription("")
        setCategory("TECHNIQUE")
        setPriority("NORMALE")
        setSubmittedRef(null)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={handleResetAndClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
                >
                    <X size={20} />
                </button>

                {submittedRef ? (
                    /* Confirmation State */
                    <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Ticket Enregistré en Base
                        </h3>
                        <p className="text-sm font-medium text-slate-600 max-w-sm mx-auto">
                            Votre demande a été enregistrée avec succès. Notre équipe technique la traite dans les meilleurs délais.
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono font-bold text-sm text-indigo-700 tracking-wider">
                            RÉFÉRENCE : {submittedRef}
                        </div>
                        <p className="text-[11px] font-medium text-slate-400">
                            Une notification de suivi a été ajoutée à votre tableau de bord.
                        </p>
                        <button
                            onClick={handleResetAndClose}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-sm"
                        >
                            Fermer
                        </button>
                    </div>
                ) : (
                    /* Form State */
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-xs">
                                <LifeBuoy size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                    Ouvrir un Ticket d&apos;Assistance
                                </h3>
                                <p className="text-xs font-medium text-slate-500">
                                    Connexion directe avec le support technique QAPRIL.
                                </p>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Sujet de la demande <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="ex: Difficulté à émettre une quittance Mobile Money"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                required
                            />
                        </div>

                        {/* Category & Priority Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                    Catégorie
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                >
                                    <option value="TECHNIQUE">Technique & Bug</option>
                                    <option value="PAIEMENT">Paiement & Mobile Money</option>
                                    <option value="BAIL">Contrat de Bail & Signature</option>
                                    <option value="FISCAL">DGI & Fiscalité</option>
                                    <option value="AUTRE">Autre question</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                    Niveau d&apos;urgence
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                                >
                                    <option value="NORMALE">Normale</option>
                                    <option value="URGENTE">Urgente (Bloquant)</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Description du problème <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                placeholder="Décrivez les étapes effectuées, le message d'erreur éventuel, ou le numéro du bail concerné..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                                required
                            />
                        </div>

                        {/* Information Note */}
                        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-start gap-2 text-[11px] text-indigo-900 font-medium">
                            <ShieldAlert size={14} className="shrink-0 text-indigo-600 mt-0.5" />
                            <span>
                                Chaque ticket génère une trace cryptographique dans le registre d&apos;audit de la plateforme pour garantir la prise en charge immédiate.
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleResetAndClose}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                <Send size={14} />
                                {isPending ? "Transmission..." : "Envoyer le Ticket"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
