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
                className="p-2 text-qgrey-4 hover:text-qnavy hover:bg-qnavy-pale rounded-lg transition-colors"
                disabled={isPending}
            >
                <MoreVertical size={18} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-qgrey-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 py-2 font-sans overflow-visible">
                    
                    {status === "INVITED" && inviteToken && (
                        <button 
                            onClick={handleCopyInvite}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-medium text-qtext hover:bg-qgrey-1 transition-colors text-left"
                        >
                            {copied ? (
                                <><CheckCircle2 size={16} className="text-green-500" /> Lien copié !</>
                            ) : (
                                <><Copy size={16} className="text-qgrey-3" /> Copier le lien d'invitation</>
                            )}
                        </button>
                    )}

                    {status !== "SUSPENDED" && (
                        <button 
                            onClick={handleSuspend}
                            disabled={isPending}
                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                            <ShieldOff size={16} /> 
                            {isPending ? "Suspension..." : "Suspendre l'accès"}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
