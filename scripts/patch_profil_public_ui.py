with open('src/components/locataire/ProfilPublicLocataireClient.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Imports
if 'import Link from "next/link"' not in c:
    c = c.replace('import { useState, useMemo } from "react"', 'import { useState, useMemo } from "react"\nimport Link from "next/link"')

c = c.replace('    AlertCircle\n} from "lucide-react"', '    AlertCircle,\n    Bell,\n    Zap\n} from "lucide-react"')

# 2. Update handleSave toast message
old_toast = 'toast.success("Profil locataire mis à jour avec succès !")'
new_toast = 'toast.success("Critères enregistrés ! Vous recevrez une notification automatique dès qu\'un bien conviendra à vos critères.")'
assert old_toast in c, "old_toast not found"
c = c.replace(old_toast, new_toast)

# 3. Add Alerte Automatique Card right after the first card
target_after_card1 = """                    </button>
                </div>

                {/* 2. BLOC CRITÈRES : BUDGET DE LOYER & LOCALISATION SOUHAITÉE */}"""

replacement_with_notif_card = """                    </button>
                </div>

                {/* 1.5. SYSTÈME D'ALERTE IMMOBILIÈRE INTELLIGENTE & NOTIFICATION AUTOMATIQUE */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden border border-slate-800">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2.5 max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                                <Bell size={12} />
                                Veille Automatique Active 24/7
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                                Notification automatique dès parution d'un bien compatible
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                                Dès qu'un logement correspondant à vos critères (<strong className="text-amber-400">{formatXof(formData.budgetMaxFcfa)} max</strong> à <strong className="text-white">{selectedLocationGroup}</strong>) est déclaré ou publié par un bailleur ou une agence, vous recevez instantanément une <strong className="text-amber-300">alerte automatique</strong> pour vous positionner en premier.
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-slate-300">
                                <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                                    <CheckCircle2 size={13} className="text-emerald-400" /> Cloche Espace Locataire
                                </span>
                                <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                                    <CheckCircle2 size={13} className="text-emerald-400" /> WhatsApp & SMS Immédiat
                                </span>
                                <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                                    <CheckCircle2 size={13} className="text-emerald-400" /> Alerte Email Prioritaire
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                            <Link
                                href="/mon-espace-locataire/marketplace"
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5"
                            >
                                <Search size={14} />
                                <span>Voir les Biens Disponibles</span>
                            </Link>
                            <span className="text-[10px] text-center font-bold text-slate-400">
                                Matching automatique garanti
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. BLOC CRITÈRES : BUDGET DE LOYER & LOCALISATION SOUHAITÉE */}"""

assert target_after_card1 in c, "target_after_card1 not found"
c = c.replace(target_after_card1, replacement_with_notif_card)

with open('src/components/locataire/ProfilPublicLocataireClient.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated ProfilPublicLocataireClient.tsx successfully")

