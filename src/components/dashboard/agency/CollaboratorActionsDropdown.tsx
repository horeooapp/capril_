"use client"

import React, { useState, useRef, useEffect, useTransition } from "react"
import { MoreVertical, Copy, ShieldOff, Trash2, CheckCircle2 } from "lucide-react"
import { removeCollaborator } from "@/actions/agency-team-actions"
import { useRouter } from "next/navigation"

interface Props {
    collaboratorId: string
    status: string
    inviteToken: string | null
}

export function CollaboratorActionsDropdown({ collaboratorId, status, inviteToken }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [copied, setCopied] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleCopyInvite = () => {
        if (!inviteToken) return
        const inviteLink = `${window.location.origin}/invite/${inviteToken}`
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSuspend = () => {
        if (!confirm("Voulez-vous vraiment suspendre ce collaborateur ? Il n'aura plus accès à la console de gestion.")) return

        startTransition(async () => {
            await removeCollaborator(collaboratorId)
            router.refresh()
        })
    }

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isPending}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl z-[100] py-2 overflow-visible">
                    
                    <div className="px-4 py-2 mb-1 border-b border-slate-50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Options</p>
                    </div>

                    {status === "INVITED" && inviteToken && (
                        <button 
                            onClick={handleCopyInvite}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                        >
                            {copied ? (
                                <><CheckCircle2 size={16} className="text-emerald-500" /> Lien copié !</>
                            ) : (
                                <><Copy size={16} className="text-slate-400" /> Copier l'invitation</>
                            )}
                        </button>
                    )}

                    {status !== "SUSPENDED" && (
                        <button 
                            onClick={handleSuspend}
                            disabled={isPending}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                            <ShieldOff size={16} /> 
                            {isPending ? "Suspension..." : "Suspendre l'accès"}
                        </button>
                    )}

                    {status === "SUSPENDED" && (
                         <div className="px-4 py-3 text-xs text-slate-400 italic">
                             Aucune action disponible
                         </div>
                    )}
                </div>
            )}
        </div>
    )
}
