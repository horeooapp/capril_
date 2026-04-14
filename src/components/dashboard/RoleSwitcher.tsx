"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, User, Home, Building2, Globe, Handshake, ShieldCheck, Briefcase, Loader2 } from "lucide-react"
import { setChosenRole } from "@/actions/role"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface RoleSwitcherProps {
    currentRole: string
    eligibleRoles: string[]
}

const ROLE_INFO: Record<string, { title: string, icon: any, color: string }> = {
    'TENANT': { title: "Locataire", icon: User, color: "emerald" },
    'LANDLORD': { title: "Propriétaire", icon: Home, color: "emerald" },
    'AGENCY': { title: "Agence", icon: Building2, color: "sky" },
    'AGENCE_AGREE': { title: "Agence Agréée", icon: ShieldCheck, color: "sky" },
    'AGENCE_NON_AGREE': { title: "Gestionnaire", icon: Briefcase, color: "sky" },
    'NON_CERTIFIED_AGENT': { title: "Gestionnaire Privé", icon: Briefcase, color: "sky" },
    'INTERMEDIARY': { title: "Intermédiaire", icon: Handshake, color: "violet" },
    'DIASPORA': { title: "Diaspora", icon: Globe, color: "emerald" },
    'ADMIN': { title: "Admin", icon: ShieldCheck, color: "rose" },
}

export default function RoleSwitcher({ currentRole, eligibleRoles }: RoleSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [switchingTo, setSwitchingTo] = useState<string | null>(null)
    const router = useRouter()
    const { update } = useSession()

    const currentMeta = ROLE_INFO[currentRole] || { title: currentRole, icon: User, color: "slate" }

    async function handleSwitch(role: string) {
        if (role === currentRole || switchingTo) return;
        
        setSwitchingTo(role)
        try {
            const res = await setChosenRole(role)
            if (res.success) {
                toast.success(`Profil ${role} activé`)
                // Update local session
                await update({ chosenRole: role })
                // Redirect and refresh
                router.push(res.redirectUrl || "/dashboard")
                router.refresh()
            } else if (res.error) {
                toast.error(res.error)
            }
        } catch (error) {
            console.error("Failed to switch role:", error)
            toast.error("Erreur technique lors du basculement")
        } finally {
            setIsOpen(false)
            setSwitchingTo(null)
        }
    }

    if (!eligibleRoles || eligibleRoles.length <= 1) return null

    return (
        <div className="relative mb-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all text-left"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1 rounded bg-white/10 text-white shrink-0">
                        <currentMeta.icon size={14} />
                    </div>
                    <div className="truncate">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">PROFIL ACTIF</p>
                        <p className="text-[11px] font-bold text-white leading-none">{currentMeta.title}</p>
                    </div>
                </div>
                <ChevronDown size={14} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[70]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[80] overflow-hidden p-1.5"
                        >
                            <div className="px-2 py-1.5 mb-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Basculer vers</p>
                            </div>
                            <div className="space-y-0.5 max-h-[200px] overflow-y-auto no-scrollbar">
                                {eligibleRoles.filter(r => r !== currentRole).map(role => {
                                    const meta = ROLE_INFO[role] || { title: role, icon: User }
                                    const isLoader = switchingTo === role

                                    return (
                                        <button
                                            key={role}
                                            disabled={!!switchingTo}
                                            onClick={() => handleSwitch(role)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all text-left group"
                                        >
                                            <div className="p-1.5 rounded-lg bg-slate-900 group-hover:bg-slate-700 transition-colors">
                                                {isLoader ? <Loader2 size={14} className="animate-spin" /> : <meta.icon size={14} />}
                                            </div>
                                            <span className="text-[12px] font-semibold">{meta.title}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
